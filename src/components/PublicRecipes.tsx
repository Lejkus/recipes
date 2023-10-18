import { useEffect, useState } from 'react'
import { db, storage } from "../config/firebase";
import {
  getDocs,
  collection,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  listAll,
  getDownloadURL,
} from "firebase/storage";

import '../styles/recipes.scss'
import NewRecipe from './newRecipe';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEraser } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';


export default function PublicRecipes({ currentUser }: { currentUser: string }) {
  const recipesCollectionRef = collection(db, "recipes");
  const constituentsCollectionRef = collection(db, 'constituents')

  const [recipes, setRecipes] = useState<any[]>([]);
  
  // if (window.location.pathname === '/public/recipe/7oERKesd5vUxMsJQv4Pe') {
  //   return <Redirect to="/recipe/7oERKesd5vUxMsJQv4Pe" />;
  // }

  const getRecipesList = async () => {
    try {
      const querySnapshot = await getDocs(query(recipesCollectionRef, where("public", "==", true)));
      const recipes = [];

      await Promise.all(querySnapshot.docs.map(async (doc) => {
        const recipe = doc.data();

        //skladniki
        const constituentsQuerySnapshot = await getDocs(query(constituentsCollectionRef, where("recipe", "==", doc.ref)));
        const constituents = [];

        constituentsQuerySnapshot.forEach((doc) => {
          constituents.push(doc.data());
        });
        recipe.constituents = constituents;

        //zdjecia
        const imagesListRef = ref(storage, `images/${doc.id}/`);
        const images = []

        const imagesrefs = await listAll(imagesListRef);
        await Promise.all(imagesrefs.items.reverse().map(async (item) => {
          const url = await getDownloadURL(item);
          images.push(url)
        }))

        recipe.images = images


        recipe.id = doc.id;
        recipes.push(recipe);
      }));

      setRecipes(recipes);

    } catch (err) {
      console.error(err);
    }
  };

  const addRecipeToSaved = async (recipe) => {
    if (recipe.userId !== currentUser) {
      if (recipe.usersShared && !recipe.usersShared.includes(currentUser)) {
        const docRef = doc(db, "recipes", recipe.id);
        const updateData = { usersShared: [...recipe.usersShared, currentUser] };
        await updateDoc(docRef, updateData);
        console.log('dodano');
      } else {
        const docRef = doc(db, "recipes", recipe.id);
        const updateData = { usersShared: [currentUser] };
        await updateDoc(docRef, updateData);
        console.log('dodano');
      }
    }

  };

  const deleteRecipeFromSaved = async (recipe) => {
    if (recipe.usersShared && recipe.usersShared.includes(currentUser)) {
      const docRef = doc(db, "recipes", recipe.id);
      const updateData = {
        usersShared: recipe.usersShared.filter((user: string) => user !== currentUser),
      }
      await updateDoc(docRef, updateData);
      console.log('usunięto');
    }
  };

  useEffect(() => {
    getRecipesList()
  }, [])

  return (
    <div className='recipes-page-container'>
      <div className='recipes-page'>
        <div className="recipes-container">
          {recipes.length ? <>{recipes.map((recipe, i) => {
            return <div className='recipe-card' key={i} >
              <div className='header' style={recipe.images[0] ? { backgroundImage: `url(${recipe.images[0]})` } : { backgroundImage: `url(https://boodabike.com/wp-content/uploads/2023/03/no-image.jpg)` }}  >
                {recipe.userId !== currentUser ? recipe.usersShared && recipe.usersShared.includes(currentUser) ? <button className='edit' onClick={() => { deleteRecipeFromSaved(recipe) }}><FontAwesomeIcon icon={faEraser} /></button> : <button className='edit' onClick={() => { addRecipeToSaved(recipe) }}><FontAwesomeIcon icon={faDownload} /></button> : <></>}
              </div>
              {/* <Link style={{ textDecoration: "none" }} to={`recipe/${recipe.id}`}> */}
                <div className='body'>
                  <p className='title'>{recipe.name}</p>
                  <div className='mini-container'>
                    <h3>Składniki:</h3>
                    <h3>{recipe.time}</h3>
                  </div>

                  <ul className='ingredients'>
                    {recipe.constituents.length ? recipe.constituents.slice(0, 3).map(({ ingredient }) => {
                      return <li><i className='fa fa fa-shopping-cart '></i>{ingredient}</li>
                    }) : <p>Brak dodanych składników</p>}

                  </ul>
                </div>
              {/* </Link> */}

            </div>
          })}</> : <i className="fa fas fa-spinner fa-pulse" style={{ fontSize: '400px', color: '#27ae60' }}></i>}

        </div>
      </div>
    </div>

  )
}
