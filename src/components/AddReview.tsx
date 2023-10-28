import { useEffect, useState } from 'react'

import { RecipeType, ConstituentType, OpinionType } from '../types/types';
import { addDoc, collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

import { faStar, faStarHalfStroke } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faComment, faStar as faStarEmpty } from '@fortawesome/fontawesome-free-regular'

import { DocumentReference, QueryDocumentSnapshot } from 'firebase/firestore'; // Zaimportuj odpowiednie typy z Firebase Firestore

interface StarProps {
    filled: boolean;
    onClick?: () => void;
}
export const Star: React.FC<StarProps> = ({ filled, onClick }) => {
    return (
        <span style={onClick ? { cursor: 'pointer' } : undefined} onClick={onClick}>
            {filled ? <FontAwesomeIcon icon={faStar} /> : <FontAwesomeIcon icon={faStarEmpty} />}
        </span>
    );
};

export const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars === 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    const stars = [];
    for (let i = 0; i < fullStars; i++) {
        stars.push(<Star key={i} filled={true} />);
    }
    if (halfStar) {
        stars.push(<FontAwesomeIcon icon={faStarHalfStroke} />);
    }
    for (let i = 0; i < emptyStars; i++) {
        stars.push(<Star filled={false} key={fullStars + i + (halfStar ? 1 : 0)} />);
    }

    return stars;
};

const checkIfOpinionExists = (recipeRef:DocumentReference, userId:number, opinions:QueryDocumentSnapshot) => {
    
    const exists = opinions.some((opinion) => {
        return opinion.recipe === recipeRef || opinion.userID === userId;
    });

    return exists;
};

export default function AddReview({ user, recipe }: { user: string, recipe: RecipeType }) {

    const [rating, setRating] = useState(5);
    const [opinion, setOpinion] = useState('');
    const [isActiveButton, setIsActiveButton] = useState(true)

    useEffect(() => {
        if (checkIfOpinionExists(doc(db, "recipes", recipe.id), user, recipe.opinions.length > 0 ? recipe.opinions : [])) {
            setOpinion("Dodano już opinie, dziękujemy! :)")
            setIsActiveButton(false);
        }
    }, [])


    const addReview = async () => {
        if (user && recipe) {
            if (opinion.length > 0) {

                const recipeRef = doc(db, "recipes", recipe.id);

                if (checkIfOpinionExists(recipeRef, user, recipe.opinions.length > 0 ? recipe.opinions : [])) {
                    alert('już dodano opinie');
                } else {
                    const opinionObject = { review: rating, opinion: opinion, recipe: recipeRef, userID: user }

                    addDoc(collection(db, 'opinions'), opinionObject);

                    setOpinion("Dodano już opinie, dziękujemy! :)")
                    setIsActiveButton(false);
                }


            }
        }

    }

    return (
        <div className='add-review'>
            <div className='star-container'>
                {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                        key={value}
                        filled={value <= rating}
                        onClick={() => setRating(value)}
                    />
                ))}
            </div>
            <input disabled={!isActiveButton} value={opinion} maxLength={100} onChange={(e) => { setOpinion(e.currentTarget.value) }}></input>
            <button disabled={!isActiveButton} className='add-review-button' onClick={addReview}>Dodaj Opinie</button>
        </div>
    )
}
