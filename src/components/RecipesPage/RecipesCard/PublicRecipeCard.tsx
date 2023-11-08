import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Link } from "react-router-dom"
import { faDownload, faEraser } from '@fortawesome/free-solid-svg-icons';
import { RecipeCardType, RecipeType } from "../../../types/types";



export default function PublicRecipeCard({ recipe, elementloading, index, currentUser, deleteFromSaved, addToSaved }: RecipeCardType & { addToSaved: (recipe: RecipeType) => void }) {

    return <div className='recipe-card' key={index}>
        <div className='header' style={recipe.images[0] ? { backgroundImage: `url(${recipe.images[0]})` } : { backgroundImage: `url(https://boodabike.com/wp-content/uploads/2023/03/no-image.jpg)` }}  >
            {elementloading === recipe.id ? <button className='edit2'><i className="fa fa-spinner fa-spin"></i></button>
                :
                recipe.userId !== currentUser && currentUser
                    ? recipe.usersShared && recipe.usersShared.includes(currentUser)
                        ? <button className='edit2' onClick={() => { deleteFromSaved(recipe) }}><FontAwesomeIcon icon={faEraser} /></button>
                        : <button className='edit2' onClick={() => { addToSaved(recipe) }}><FontAwesomeIcon icon={faDownload} /></button>
                    : <></>
            }


            {recipe.average ? <button className='edit'>{recipe.average}</button> : ""}
        </div>
        <Link style={{ textDecoration: "none" }} to={`recipe/${recipe.id}`}>
            <div className='body'>
                <p className='title'>{recipe.name}</p>
                <div className='mini-container'>
                    <h3>Składniki:</h3>
                    <h3>{recipe.time}</h3>
                </div>

                <ul className='ingredients'>
                    {recipe.constituents.length ? recipe.constituents.slice(0, 3).map(({ ingredient }: { ingredient: string }, i: number) => {
                        return <li key={i}><i className='fa fa fa-shopping-cart '></i>{ingredient}</li>
                    }) : <p>Brak dodanych składników</p>}

                </ul>
            </div>
        </Link>
    </div>
}