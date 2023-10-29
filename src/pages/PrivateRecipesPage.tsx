import { useCallback, useEffect, useState } from 'react'
import { db, storage } from "../config/firebase";
import { getDocs, collection, doc, query, where, updateDoc, orderBy, QuerySnapshot } from "firebase/firestore";
import { ref, listAll, getDownloadURL } from "firebase/storage";

import '../styles/recipes.scss'
import Categories from '../components/RecipesPage/Categories';

// @ts-ignore
import PrivateRecipeCard from '../components/RecipesPage/RecipesCard/PrivateRecipeCard';
import SearchBar from '../components/RecipesPage/SearchBar'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUtensils } from '@fortawesome/free-solid-svg-icons';

import { RecipeType, ConstituentType } from '../types/types';

export default function Recipes({ currentUser }:{currentUser:string | undefined}) {

  const recipesCollectionRef = collection(db, "recipes");
  const constituentsCollectionRef = collection(db, 'constituents')

  const [recipes, setRecipes] = useState<RecipeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [elementloading, setelementLoading] = useState(null);

  const [seachText, setSeachText] = useState("");

  const [filteredRecipes, setFilteredRecipes] = useState<RecipeType[]>([]);

  const [categories, setCategories] = useState<string[]>([])
  const [allCategories, setAllCategories] = useState<string[]>([])

  const [currentPage, setCurrentPage] = useState('my')


  const getRecipesList = async () => {
    try {
      let querySnapshot: QuerySnapshot<any> = []
      if (currentPage === 'my') {
        querySnapshot = await getDocs(query(recipesCollectionRef, where("userId", "==", currentUser)));
        if (categories.length > 0) {
          querySnapshot = await getDocs(query(recipesCollectionRef, where("userId", "==", currentUser), where('categories', 'array-contains-any', categories)));
        }

      } else {
        querySnapshot = await getDocs(query(recipesCollectionRef, where("public", "==", true), where("usersShared", "array-contains", currentUser)));
        // if (categories.length > 0) {
        //   //do naprawy
        //   querySnapshot = await getDocs(query(recipesCollectionRef, where("usersShared", "array-contains", currentUser), where('categories', 'array-contains-any', categories)));
        // }
      }

      const recipes: RecipeType[] = [];
      const allCategories2: string[] = []

      await Promise.all(querySnapshot.docs.map(async (doc) => {
        const recipe = doc.data();

        //skladniki
        const constituentsQuerySnapshot = await getDocs(query(constituentsCollectionRef, where("recipe", "==", doc.ref)));
        const constituents: ConstituentType[] = [];


        constituentsQuerySnapshot.forEach((doc) => {
          constituents.push(doc.data());
        });

        recipe.constituents = constituents;

        //zdjecia
        const imagesListRef = ref(storage, `images/${doc.id}/`);
        const images: string[] = []

        const imagesrefs = await listAll(imagesListRef);
        await Promise.all(imagesrefs.items.reverse().map(async (item) => {
          const url = await getDownloadURL(item);
          images.push(url)
        }))

        recipe.images = images
        recipe.id = doc.id;

        if (!(allCategories.length > 0)) {
          recipe.categories.forEach((category: string) => {
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

  const filterRecipes = useCallback(() => {
    const filteredData = recipes.filter((recipe) => {
      if (seachText === '') {
        return true;
      } else {
        return recipe.name.toLowerCase().includes(seachText.toLowerCase())
      }
    })

    setFilteredRecipes(filteredData);
  }, [seachText, recipes]);

  useEffect(() => {
    filterRecipes();
  }, [filterRecipes]);

  useEffect(() => {
    if (currentUser) {
      getRecipesList()
    } else {
      setRecipes([])
      // setLoading(false)
    }
  }, [currentUser, categories])

  useEffect(() => {
    if (currentUser) {
      setLoading(true)
      setRecipes([])
      getRecipesList()
    } else {
      setRecipes([])
      // setLoading(false)
    }
  }, [currentPage])


  const onSwitchChange = useCallback((newValue: string) => {
    setCurrentPage(newValue);
  }, []);

  return (
    <div className='recipes-page-container'>
      <div className='recipes-page'>

        <div className="search__container">
          <SearchBar onChange={onSwitchChange} setText={setSeachText} />
        </div>

        <div className='categories-container' >
          {recipes.length ? <Categories allCategories={allCategories} categories={categories} setCategories={setCategories} /> : <></>}
        </div>

        <div className="recipes-container">
          {currentUser
            ? !loading
              ? recipes.length
                ? filteredRecipes.length ?
                  // <RecipesComponent page={currentPage} currentUser={currentUser} recipes={filteredRecipes} elementloading={elementloading} updateRecipePublic={updateRecipePublic} />
                  <>
                    {filteredRecipes.map((recipe, index) => {
                      return <PrivateRecipeCard page={currentPage} index={index} currentUser={currentUser} recipe={recipe} elementloading={elementloading} updateRecipePublic={updateRecipePublic} />
                    })}
                  </>
                  : <h1>Nie znaleziono takiego przepisu</h1>
                : <h1>Brak dodanych przepisów</h1>
              : <FontAwesomeIcon icon={faUtensils} shake style={{ fontSize: '350px', color: '#27ae60', marginTop: '20%' }} />
            : <h1>Zaloguj sie aby zobaczyć swoje przepisy!</h1>}
        </div>

      </div>
    </div>
  )
}
