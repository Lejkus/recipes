import { useCallback, useEffect, useState } from 'react'

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
import PublicRecipeCard from '../components/RecipesPage/RecipesCard/PublicRecipeCard';

import { ConstituentType, OpinionType, RecipeType } from '../types/types';
import SearchBar from '../components/RecipesPage/SearchBar';

import { averageOpinions } from '../functions/AverageOpinions';

export default function PublicRecipes({ currentUser }: { currentUser: string | undefined }) {
  const recipesCollectionRef = collection(db, "recipes");
  const constituentsCollectionRef = collection(db, 'constituents')

  const [recipes, setRecipes] = useState<any[]>([]);

  const [seachText, setSeachText] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState<RecipeType[]>([]);


  const getRecipesList = async () => {
    try {
      const querySnapshot = await getDocs(query(recipesCollectionRef, where("public", "==", true)));
      const recipes: RecipeType[] = [];

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

        //opinie //możliwe że potem do poprawy bo każde będzie miało pustą tablice opinions
        const result = await averageOpinions(recipe.id);
        if (result) {
          const { average, opinions } = result;

          recipe.average = average
        } else {
          console.log("Nie ma tablicy opinions");
        }

        recipe.id = doc.id;
        recipes.push(recipe);
      }));

      setRecipes(recipes);

    } catch (err) {
      console.error(err);
    }
  };

  const addRecipeToSaved = async (recipe: RecipeType) => {
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

  const deleteRecipeFromSaved = async (recipe: RecipeType) => {
    if (currentUser && recipe.usersShared && recipe.usersShared.includes(currentUser)) {
      const docRef = doc(db, "recipes", recipe.id);
      const updateData = {
        usersShared: recipe.usersShared.filter((user: string) => user !== currentUser),
      }
      await updateDoc(docRef, updateData);
      console.log('usunięto');
    }
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
    getRecipesList()
  }, [])

  return (
    <div className='recipes-page-container'>
      <div className='recipes-page'>

        <div className="search__container">
          <SearchBar setText={setSeachText} />
        </div>

        <div className="recipes-container">
          {filteredRecipes.length
            ? <>
              {filteredRecipes.map((recipe, index) => {
                return <PublicRecipeCard recipe={recipe} index={index} currentUser={currentUser} deleteFromSaved={deleteRecipeFromSaved} addToSaved={addRecipeToSaved} />
              })}
            </>
            : <i className="fa fas fa-spinner fa-pulse" style={{ fontSize: '400px', color: '#27ae60' }}></i>}

        </div>

      </div>
    </div>

  )
}
