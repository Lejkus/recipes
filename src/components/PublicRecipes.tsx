import { useEffect, useState } from 'react'
import { db, storage } from "../config/firebase";
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  listAll,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import '../styles/recipes.scss'


export default function PublicRecipes() {
  const recipesCollectionRef = collection(db, "recipes");
  const constituentsCollectionRef = collection(db, 'constituents')

  const [recipes, setRecipes] = useState<any[]>([]);


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

  useEffect(() => {
    getRecipesList()
  }, [])

  return (
    <center>
      <div className="recipes-container">
        {recipes.length ? <>{recipes.map((recipe, i) => {
          return <div className='recipe-card' key={i} >
            <div className='header' style={recipe.images[0] ? { backgroundImage: `url(${recipe.images[0]})` } : { backgroundImage: `url(https://boodabike.com/wp-content/uploads/2023/03/no-image.jpg)` }}  >
              {/* <button className='edit'><i className='fa fa fa-pencil'></i></button> */}
            </div>
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


          </div>
        })}</> : <i className="fa fas fa-spinner fa-pulse" style={{ fontSize:'400px',color:'#27ae60' }}></i>}

      </div>

    </center>

  )
}


// {/* <img style={{ width: '200px' }} src={recipe.images[0]} alt={recipe.images[0]} />
//           <p className='p'>{recipe.preparation}</p> */}