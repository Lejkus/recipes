import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';

import { RecipeType, ConstituentType, OpinionType } from '../types/types';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import { getDownloadURL, listAll, ref } from 'firebase/storage';

import '../styles/recipe.scss'
import { faStar, faStarHalfStroke, faUsers, faUtensils } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faComment, faStar as faStarEmpty } from '@fortawesome/fontawesome-free-regular'

import AddReview from '../components/AddReview';
import { renderStars } from '../components/AddReview';
import { averageOpinions } from '../functions/AverageOpinions';



export default function Recipe({ currentUser }: { currentUser: string | undefined }) {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<RecipeType | null>(null);
  const [loading, setLoading] = useState(true);


  const getRecipe = async (recipeId: string) => {
    try {
      const recipeDocRef = doc(collection(db, "recipes"), recipeId);
      const recipeDocSnapshot = await getDoc(recipeDocRef);
      if (!recipeDocSnapshot.exists()) {
        console.error("Nie znaleziono przepisu o podanym id:", recipeId);
        setLoading(false)
        return null;
      }

      const recipeData = recipeDocSnapshot.data();

      //składniki
      const constituentsQuerySnapshot = await getDocs(query(collection(db, 'constituents'), where("recipe", "==", recipeDocRef)));
      const constituents: ConstituentType[] = [];

      constituentsQuerySnapshot.forEach((doc) => {
        constituents.push(doc.data());
      });

      recipeData.constituents = constituents;

      //zdjęcia
      const imagesListRef = ref(storage, `images/${recipeId}/`);
      const images: string[] = [];

      const imagesRefs = await listAll(imagesListRef);
      await Promise.all(imagesRefs.items.reverse().map(async (item) => {
        const url = await getDownloadURL(item);
        images.push(url);
      }));

      recipeData.images = images;
      recipeData.id = recipeId;

      //opinie

      const result = await averageOpinions(recipeId);
        if (result) {
          const { average, opinions } = result;
          
          recipeData.average = average
          recipeData.opinions = opinions
        } else {
          console.log("Nie ma tablicy opinions");
        }

      setRecipe(recipeData);
      setLoading(false)
    } catch (err) {
      console.error("Błąd podczas pobierania przepisu:", err);
      return null;
    }
  };

  useEffect(() => {
    if (id) {
      getRecipe(id)
    }
  }, [])


  return (
    <div className='recipe-page-container'>
      <div className='recipe-page'>
        {!loading ?
          recipe ?
            <>
              < div className='header'>
                <div className='recipe-info'>
                  <h2>{recipe.name}</h2>
                  <div className='recipe-icons'>
                    <div className='icon'>
                      <div>{renderStars(recipe.average ? recipe.average : 0)}</div>
                      <p>{recipe.average ? recipe.average : <>brak</>}</p>
                    </div>
                    <div className='icon'>
                      <FontAwesomeIcon icon={faClock} />
                      <p>{recipe.time}</p>
                    </div>
                    <div className='icon'>
                      <FontAwesomeIcon icon={faComment} />
                      <p>{recipe.opinions?.length ? recipe.opinions.length : 0}</p>
                    </div>
                    <div className='icon'>
                      <FontAwesomeIcon icon={faUsers} />
                      <p>{recipe.usersShared?.length ? recipe.usersShared.length : 0}</p>
                    </div>
                  </div>
                </div>
                <div className='image-container-page'>
                  <div className='image-container'>
                    <img src={recipe.images[0] ? recipe.images[0] : 'https://boodabike.com/wp-content/uploads/2023/03/no-image.jpg'}></img>
                  </div>
                </div>
              </div>

              <div className='recipe-contnet'>
                <div className='constituents-container'>
                  {recipe.constituents.map((constituent) => {
                    return <div className='constituent'>
                      <input type='checkbox'></input>
                      <p>{constituent.ingredient}&nbsp;</p>
                      <p className='dots'>...........................................................................................................................................................................................................................................................................................................................</p>
                      <p>&nbsp;{constituent.amount}</p>
                    </div>
                  })}
                </div>

                <div className='preparation'>
                  <textarea readOnly>{recipe.preparation}</textarea>
                </div>
              </div>

              <div className='reviews'>
                <AddReview user={currentUser} recipe={recipe} />
                <div className='reviews-container'>
                  <h2>Komentarze: {recipe.opinions.length ? recipe.opinions.length : 0}</h2>
                  {recipe.opinions ? recipe.opinions.map(({ review, opinion }, i) => {
                    return <div className='opinion'><div className='stars'>{renderStars(review)}</div><p className='text'>{opinion}</p></div>
                  }) : <></>}
                </div>
              </div>
            </>
            : <h1>nie znaleziono przepisu</h1>

          : <FontAwesomeIcon icon={faUtensils} shake style={{ fontSize: '350px', color: '#27ae60', marginTop: '20%' }} />}

      </div >
    </div >

  )
}
