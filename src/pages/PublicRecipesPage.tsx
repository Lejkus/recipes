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

import { ConstituentType, RecipeType } from '../types/types';
import SearchBar from '../components/RecipesPage/SearchBar';

import { averageOpinions } from '../functions/AverageOpinions';
import { faUtensils } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function PublicRecipes({ currentUser }: { currentUser: string | undefined }) {
  const recipesCollectionRef = collection(db, "recipes");
  const constituentsCollectionRef = collection(db, 'constituents')

  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [elementloading, setelementLoading] = useState<string | null>(null);

  const [seachText, setSeachText] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState<RecipeType[]>([]);

  const [currentPage, setCurrentPage] = useState('rating')

  const getRecipesList = async () => {
    try {
      const querySnapshot = await getDocs(query(recipesCollectionRef, where("public", "==", true)));
      const recipes: RecipeType[] = [];

      await Promise.all(querySnapshot.docs.map(async (doc) => {
        const recipe = doc.data() as RecipeType;

        //skladniki
        const constituentsQuerySnapshot = await getDocs(query(constituentsCollectionRef, where("recipe", "==", doc.ref)));
        const constituents: ConstituentType[] = [];

        constituentsQuerySnapshot.forEach((doc) => {
          constituents.push(doc.data() as ConstituentType);
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
          const { average } = result;
          recipe.average = average
        } else {
          //console.log("Nie ma tablicy opinions");
        }

        recipe.id = doc.id;
        recipes.push(recipe);
      }));

      setRecipes(recipes);
      setLoading(false)

    } catch (err) {
      console.error(err);
    }
  };

  const addRecipeToSaved = async (recipe: RecipeType) => {
    // Sprawdzamy, czy przepis nie należy do aktualnie zalogowanego użytkownika
    if (recipe.userId !== currentUser && currentUser) {
      setelementLoading(recipe.id);

      // Tworzy kopię przepisu
      let updatedRecipe = { ...recipe };

      // sprawdzamy, czy bieżący użytkownik nie znajduje się na tej liście
      if (updatedRecipe.usersShared && !updatedRecipe.usersShared.includes(currentUser)) {
        //Jeśli nie jest obecny, dodajemy go do listy
        updatedRecipe.usersShared = [...updatedRecipe.usersShared, currentUser];
      } else {
        //tworzymy nową listę, w której jedynym użytkownikiem jest bieżący użytkownik
        updatedRecipe.usersShared = [currentUser];
      }

      const docRef = doc(db, "recipes", updatedRecipe.id);
      const updateData = { usersShared: updatedRecipe.usersShared };

      try {
        await updateDoc(docRef, updateData);
        console.log('dodano przepis do ulubionych w bazie danych');
      } catch (error) {
        console.error('Błąd dodawania przepisu do ulubionych w bazie danych:', error);
      }

      // Aktualizuj przepis w tablicy
      const updatedRecipes = recipes.map((r) =>
        r.id === updatedRecipe.id ? updatedRecipe : r
      );

      // Aktualizuje stan lokalnej tablicy przepisów
      setRecipes(updatedRecipes);
      setelementLoading(null);
    }
  };

  const deleteRecipeFromSaved = async (recipe: RecipeType) => {
    if (currentUser && recipe.usersShared && recipe.usersShared.includes(currentUser)) {
      setelementLoading(recipe.id)

      // Tworzy kopię tablicy przepisów i usuwa bieżącego użytkownika z listy usersShared
      const updatedRecipes = recipes.map((r) => {
        if (r.id === recipe.id) {
          return {
            ...r,
            usersShared: r.usersShared.filter((user: string) => user !== currentUser),
          };
        }
        return r;
      });

      const docRef = doc(db, "recipes", recipe.id);
      const updateData = { 
        // pobiera zaktualizowanąliste usersShared
        usersShared: updatedRecipes.find((r) => r.id === recipe.id)?.usersShared || [],
      };
      
      try {
        await updateDoc(docRef, updateData);
        console.log('usunięto przepis z ulubionych w bazie danych');
      } catch (error) {
        console.error('Błąd usuwania przepisu z ulubionych w bazie danych:', error);
      }

      // Aktualizuje stan lokalnej tablicy przepisów
      setRecipes(updatedRecipes);
      setelementLoading(null)
    }
  };

  const filterRecipes = useCallback(() => {
    const filteredData = recipes.filter((recipe) => {
      if (seachText === '') {
        return recipe;
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

  const onSwitchChange = useCallback((newValue: string) => {
    setCurrentPage(newValue);
  }, []);

  return (
    <div className='recipes-page-container'>
      <div className='recipes-page'>

        <div className="search__container">
          <SearchBar onChange={onSwitchChange} page={"public"} setText={setSeachText} />
        </div>

        <div className="recipes-container">

          {!loading ?
            filteredRecipes.length
              ? <>
                {currentPage === 'rating' ? (
                  filteredRecipes
                    .filter(recipe => !isNaN(recipe.average)) //usuwanie bez oceny
                    .slice() // Tworzy kopię tablicy, aby nie modyfikować oryginalnej
                    .sort((a, b) => {
                      const averageA = isNaN(a.average) ? -Infinity : a.average;
                      const averageB = isNaN(b.average) ? -Infinity : b.average;
                      return averageB - averageA; // Sortowanie po wartości "average" malejąco
                    })
                    .map((recipe, index) => (
                      <PublicRecipeCard
                        recipe={recipe}
                        index={index}
                        currentUser={currentUser}
                        deleteFromSaved={deleteRecipeFromSaved}
                        addToSaved={addRecipeToSaved}
                        elementloading={elementloading}
                      />
                    ))
                ) : currentPage === 'image' ? (
                  filteredRecipes
                    .filter(recipe => recipe.images[0])
                    .map((recipe, index) => (
                      <PublicRecipeCard
                        recipe={recipe}
                        index={index}
                        currentUser={currentUser}
                        deleteFromSaved={deleteRecipeFromSaved}
                        addToSaved={addRecipeToSaved}
                        elementloading={elementloading}
                      />
                    ))
                ) : filteredRecipes
                  .map((recipe, index) => (
                    <PublicRecipeCard
                      recipe={recipe}
                      index={index}
                      currentUser={currentUser}
                      deleteFromSaved={deleteRecipeFromSaved}
                      addToSaved={addRecipeToSaved}
                      elementloading={elementloading}
                    />
                  ))}
              </>
              : <h1>Nie znaleziono takiego przepisu</h1>
            : <FontAwesomeIcon icon={faUtensils} shake style={{ fontSize: '350px', color: '#27ae60', marginTop: '50%' }} />}

        </div>

      </div>
    </div>

  )
}
