import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'


export default function RecipesComponent({ page, currentUser, recipes, elementloading, updateRecipePublic }) {
    const navigate = useNavigate()
    return (
        <>{recipes.map((recipe, i) => {
            return <div className='recipe-card' key={i} >
                <div className='header' style={recipe.images[0] ? { backgroundImage: `url(${recipe.images[0]})` } : { backgroundImage: `url(https://boodabike.com/wp-content/uploads/2023/03/no-image.jpg)` }}>
                    {page === 'my' ? <><button onClick={() => { navigate(`/editrecipe/${recipe.id}`) }} className='edit'><i className='fa fa fa-pencil'></i></button>

                        {recipe.public ? <button className='edit2' onClick={(event) => { updateRecipePublic(recipe.id, false, i) }}>{elementloading === i ? <i className="fa fa-spinner fa-spin"></i> : <i className='fa fa-check'></i>}</button>
                            : <button onClick={(event) => { updateRecipePublic(recipe.id, true, i) }} className='edit2'>
                                {elementloading === i ? <i className="fa fa-spinner fa-spin"></i> : <i className='fa fa-share'></i>}</button>}</> : <></>}

                </div>
                <Link style={{textDecoration:"none"}} to={`recipe/${recipe.id}`}>
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
                </Link>

            </div>
        })}</>
    )
}
