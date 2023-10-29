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
import PublicRecipeCard from '../components/RecipesPage/RecipesCard/PublicRecipeCard';

import { RecipeType } from '../types/types';

export default function PublicRecipes({ currentUser }: { currentUser: string | undefined }) {
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

  useEffect(() => {
    getRecipesList()
  }, [])

  return (
    <div className='recipes-page-container'>
      <div className='recipes-page'>

        <div className="recipes-container">
          {recipes.length
            ? <>
              {recipes.map((recipe, index) => {
                return <PublicRecipeCard recipe={recipe} index={index} currentUser={currentUser} deleteFromSaved={deleteRecipeFromSaved} addToSaved={addRecipeToSaved} />
              })}
            </>
            : <i className="fa fas fa-spinner fa-pulse" style={{ fontSize: '400px', color: '#27ae60' }}></i>}

        </div>

      </div>
    </div>

  )
}
