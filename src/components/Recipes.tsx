import { useEffect, useState } from 'react'
import { db, storage } from "../config/firebase";
import { getDocs, collection, doc, query, where, updateDoc } from "firebase/firestore";
import { ref, listAll, getDownloadURL } from "firebase/storage";

import '../styles/recipes.scss'
import { useNavigate } from 'react-router-dom';
import Categories from './Categories';


export default function Recipes({ currentUser }) {

  const navigate = useNavigate()

  const recipesCollectionRef = collection(db, "recipes");
  const constituentsCollectionRef = collection(db, 'constituents')

  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [elementloading, setelementLoading] = useState(null);

  const [seachText, setSeachText] = useState("");

  const [filteredRecipes, setFilteredRecipes] = useState([]);

  const [categories, setCategories] = useState<string[]>([])
  const [allCategories, setAllCategories] = useState([])



  const getRecipesList = async () => {
    try {
      let querySnapshot = await getDocs(query(recipesCollectionRef, where("userId", "==", currentUser)))
      if (categories.length > 0) {
        querySnapshot = await getDocs(query(recipesCollectionRef, where("userId", "==", currentUser), where('categories', 'array-contains-any', categories)));
      }
      const recipes = [];
      const allCategories2 = []

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

        if (!(allCategories.length > 0)) {
          recipe.categories.forEach((category) => {
            if (!allCategories2.includes(category)) {
              allCategories2.push(category);
            }
          });
        }



        recipes.push(recipe);
      }));

      if (!(allCategories.length > 0)) {
        setAllCategories(allCategories2)
      }

      setRecipes(recipes);
      setLoading(false)

    } catch (err) {
      console.error(err);
    }
  };

  const updateRecipePublic = async (id: string, data: boolean, i) => {
    const recipeDoc = doc(db, "recipes", id);
    setelementLoading(i)

    await updateDoc(recipeDoc, { public: data })
    await getRecipesList().then(() => {
      setelementLoading(null)
    })

  };



  useEffect(() => {
    const filteredData = recipes.filter((recipe) => {
      //if no input the return the original

      if (seachText === '') {
        return recipe;
      }
      //return the item which contains the user input
      else {
        return recipe.name.toLowerCase().includes(seachText.toLowerCase())
      }
    })

    setFilteredRecipes(filteredData);

  }, [seachText, recipes])

  useEffect(() => {
    if (currentUser) {
      getRecipesList()
    } else {
      setRecipes([])
      // setLoading(false)
    }
  }, [currentUser, categories])


  return (
    <div className='recipes-page'>
      <div className="search__container">
        <center>
          <input onChange={(e) => { setSeachText(e.currentTarget.value) }} className="search__input" type="text" placeholder="Search"></input>
        </center>
      </div>
      <Categories allCategories={allCategories} categories={categories} setCategories={setCategories} />

      <div className="recipes-container">

        {currentUser
          ? !loading
            ? recipes.length
              ? filteredRecipes.length
                ? <>{filteredRecipes.map((recipe, i) => {
                  return <div className='recipe-card' key={i} >
                    <div className='header' style={recipe.images[0] ? { backgroundImage: `url(${recipe.images[0]})` } : { backgroundImage: `url(https://boodabike.com/wp-content/uploads/2023/03/no-image.jpg)` }}  >
                      <button onClick={() => { navigate(`/editrecipe/${recipe.id}`) }} className='edit'><i className='fa fa fa-pencil'></i></button>
                      {recipe.public ? <button className='edit2' onClick={(event) => { updateRecipePublic(recipe.id, false, i) }}>{elementloading === i ? <i className="fa fa-spinner fa-spin"></i> : <i className='fa fa-check'></i>}</button>
                        : <button onClick={(event) => { updateRecipePublic(recipe.id, true, i) }} className='edit2'>
                          {elementloading === i ? <i className="fa fa-spinner fa-spin"></i> : <i className='fa fa-share'></i>}</button>}
                    </div>
                    <div className='body'>
                      <p className='title'>{recipe.name}</p>
                      <div className='mini-container'>
                        <h3>Składniki:</h3>
                        <h3>{recipe.time}</h3>
                      </div>

                      <ul className='ingredients'>
                        {recipe.constituents.length ? recipe.constituents.slice(0, 3).map(({ ingredient }, i) => {
                          return <li key={i}><i className='fa fa fa-shopping-cart '></i>{ingredient}</li>
                        }) : <p>Brak dodanych składników</p>}

                      </ul>
                    </div>


                  </div>
                })}</>
                : <h1>Nie znaleziono takiego przepisu</h1>
              : <h1>Brak dodanych przepisów</h1>
            : <i className="fa fas fa-spinner fa-pulse" style={{ fontSize: '350px', color: '#27ae60', marginTop: '100px' }}></i>
          : <h1>Zaloguj sie aby zobaczyć swoje przepisy!</h1>}

      </div>
    </div>

  )
}


// {/* <img style={{ width: '200px' }} src={recipe.images[0]} alt={recipe.images[0]} />
//           <p className='p'>{recipe.preparation}</p> */}