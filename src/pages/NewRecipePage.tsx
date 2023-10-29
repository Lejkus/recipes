import { ChangeEvent,MouseEvent, useState } from 'react'

import { db, storage } from "../config/firebase";
import { collection, addDoc, doc, } from "firebase/firestore";
import { ref, uploadBytes, } from "firebase/storage";
import '../styles/newrecipe.scss'

import { RecipeType,ConstituentType } from '../types/types';

export default function NewRecipe({ currentUser }:{currentUser:string | undefined}) {

    const recipesCollectionRef = collection(db, "recipes");
    const constituentsCollectionRef = collection(db, 'constituents')

    const [newRecipe, setNewRecipe] = useState<RecipeType>({ name: '', preparation: '', time: '', userId: '', categories: [],usersShared:[] })
    const [newConstituents, setNewConstituents] = useState<Array<ConstituentType>>([])
    const [newConstituent, setNewConstituent] = useState<ConstituentType>({ ingredient: '', amount: '', recipe: '' })

    //const [newCategories, setNewCategories] = useState<Array<String>>([])
    const [newCategory, setNewCategory] = useState<String>('')

    //const [fileUpload, setFileUpload] = useState(null);
    const [filesArray, setFilesArray] = useState([]);

    
    const updateRecipe = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => {
        const fieldName = e.target.name;
        setNewRecipe(existingValues => ({
          ...existingValues,
          [fieldName]: e.target.value,
        }));
      };

    const updateConstituent = (e: ChangeEvent<HTMLInputElement>) => {
        const fieldName = e.target.name
        setNewConstituent(existingValues => ({
            ...existingValues,
            [fieldName]: e.target.value,
        }))
    }

    const addConstituent = (e: MouseEvent<HTMLInputElement>) => {
        //e.preventDefault()
        if (newConstituent.ingredient && newConstituent.amount) {
            setNewConstituents(existingValues => [...existingValues, newConstituent]);
            setNewConstituent({ ingredient: '', amount: '', recipe: '' })
        }
    }

    const addCategory = (e: MouseEvent<HTMLInputElement>) => {
        //e.preventDefault()
        if (newCategory) {
            //setNewCategories(existingValues => [...existingValues, newCategory]);
            setNewRecipe(existingValues => ({
                ...existingValues,
                categories: [...existingValues.categories, newCategory],
            }))
            setNewCategory('')
        }
    }

    const ButtonEffect = (e: MouseEvent<HTMLInputElement>) => {
        if (e.target.classList.contains("add-category")) {
            if (newCategory) {
                e.target.classList.add('validate')
                setTimeout(() => {
                    e.target.classList.remove('validate')
                }, 1000);
            } else {
                e.target.classList.add('notvalidate')
                setTimeout(() => {
                    e.target.classList.remove('notvalidate')
                }, 1000);
            }
        } else if (e.target.classList.contains("add-constituent")) {
            if (newConstituent.amount && newConstituent.ingredient) {
                e.target.classList.add('validate')
                setTimeout(() => {
                    e.target.classList.remove('validate')
                }, 1000);
            } else {
                e.target.classList.add('notvalidate')
                setTimeout(() => {
                    e.target.classList.remove('notvalidate')
                }, 1000);
            }
        }


    }

    const onSubmit = async (e: MouseEvent<HTMLInputElement>) => {
        e.preventDefault()

        try {
            await addDoc(recipesCollectionRef, {
                name: newRecipe.name,
                preparation: newRecipe.preparation,
                time: newRecipe.time,
                categories: newRecipe.categories,
                userId: currentUser,
                public:false,
                usersShared:[]
            }).then(async function (docRef) {
                console.log("Document written with ID: ", docRef.id);

                // skladniki
                if (newConstituents.length) {
                    const recipeRef = doc(db, "recipes", docRef.id);

                    const updatedConstituents = newConstituents.map((constituent) => ({
                        ...constituent,
                        recipe: recipeRef,
                    }));

                    const addDocPromises = updatedConstituents.map((constituent) => {
                        return addDoc(constituentsCollectionRef, constituent);
                    });

                    await Promise.all(addDocPromises);

                    console.log("Constituents added successfully!");

                    // setNewConstituents(updatedConstituents);

                    // // Dodaj dokumenty do kolekcji `constituents`
                    // updatedConstituents.forEach(async (constituent) => {
                    //     await addDoc(constituentsCollectionRef, {
                    //         ingredient: constituent.ingredient,
                    //         amount: constituent.amount,
                    //         recipe: constituent.recipe,
                    //     });
                    // });
                }

                // zdjecia
                if (filesArray.length) {
                    try {
                        filesArray.forEach(async (file) => {
                            await uploadBytes(ref(storage, `images/${docRef.id}/${file.name}`), file);
                        })
                    } catch (err) {
                        console.error(err);
                    }
                }
            })

        } catch (err) {
            console.error(err);
        }
    };


    return (
        <div className='add-component-container'>
            <div className='add-component'>
                {currentUser ? <>
                    <div className='new-recipe'>
                        <div className="recipe-forms">
                            <h2><i>Dodaj tytul przepisu</i></h2>
                            <div className="row">
                                <div className="col-3 input-effect">
                                    <input className={newRecipe.name ? 'has-content effect-19' : 'effect-19'} type='text' value={newRecipe.name} onChange={updateRecipe} name='name' ></input>
                                    <label>Nazwa potrawy</label>
                                    <span className="focus-border">
                                        <i></i>
                                    </span>
                                </div>
                                <div className="col-3 input-effect">
                                    <input className={newRecipe.time ? 'has-content effect-20' : 'effect-20'} type='text' value={newRecipe.time} onChange={updateRecipe} name='time' ></input>
                                    <label>Czas przygotowania</label>
                                    <span className="focus-border">
                                        <i></i>
                                    </span>
                                </div>
                                <div className="col-3 input-effect">
                                    <textarea className={newRecipe.preparation ? 'has-content effect-21' : 'effect-21'} value={newRecipe.preparation} onChange={updateRecipe} name='preparation' ></textarea>
                                    <label>Sposób przygotowania</label>
                                    <span className="focus-border">
                                        <i></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='new-constituent'>
                        <div className="recipe-forms">
                            <h2><i>Dodaj skladnik</i></h2>
                            <div className="row">
                                <div className="col-3 input-effect">
                                    <input className={newConstituent.amount ? 'has-content effect-19' : 'effect-19'} value={newConstituent.amount} onChange={updateConstituent} name='amount' type='text'></input>
                                    <label>ilosc skladnika</label>
                                    <span className="focus-border">
                                        <i></i>
                                    </span>
                                </div>
                                <div className="col-3 input-effect">
                                    <input className={newConstituent.ingredient ? 'has-content effect-20' : 'effect-20'} value={newConstituent.ingredient} onChange={updateConstituent} name='ingredient' type='text'></input>
                                    <label>nazwa skladnika</label>
                                    <span className="focus-border">
                                        <i></i>
                                    </span>
                                </div>
                                <div className="col-3 input-effect">
                                    {/* <button onClick={addConstituent}>Dodaj składnik</button> */}
                                    <div className="button-container">
                                        <button className='add-constituent' onClick={(e) => { ButtonEffect(e); addConstituent(e); }} id="button"></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='constituents'>

                        {newConstituents.length > 0 ? <>{newConstituents.map(({ amount, ingredient }) => {
                            return <div className='constituent'>
                                <h3 className='title'>Ilosć: </h3><h3 >{amount}</h3>
                                <h3 className='title'>Składnik: </h3><h3 >{ingredient}</h3>

                            </div>
                        })}</> : <></>}

                    </div>

                    <div className='new-category'>
                        <div className="recipe-forms">
                            <h2><i>Dodaj Kategorie</i></h2>
                            <div className="row">
                                <div className="col-3 input-effect">
                                    <input className={newCategory ? 'has-content effect-19' : 'effect-19'} value={newCategory} onChange={(e) => { setNewCategory(e.target.value) }} name='amount' type='text'></input>
                                    <label>Nazwa kategorii</label>
                                    <span className="focus-border">
                                        <i></i>
                                    </span>
                                </div>
                                <div className="col-3 input-effect">
                                    {/* <button onClick={addConstituent}>Dodaj składnik</button> */}
                                    <div className="button-container">
                                        <button className='add-category' onClick={(e) => { ButtonEffect(e); addCategory(e); }} id="button"></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='categories'>
                        {newRecipe.categories.length > 0 ? <>{newRecipe.categories.map((category) => {

                            return <div className='category'>{category}</div>
                        })}</> : <></>}
                    </div>

                    <div className='new-images'>
                        <div className="recipe-forms">
                            <h2><i>Dodaj zdjecie</i></h2>
                            <div className="row">
                                <div className="col-3 input-effect">
                                    <label className="drop-container">
                                        <span className="drop-title">Przeciągnij tutaj</span>
                                        lub kliknij
                                        <input className='input-file' onChange={(e) => setFilesArray([...filesArray, e.target.files[0]])} type="file" id="images" accept="image/*" required></input>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='images'>
                        {filesArray.length > 0 ? <>{filesArray.map((file) => {
                            return <div className='image'>{file.name}</div>
                        })}</> : <></>}

                    </div>


                    <div className="button-container" style={{ marginTop: '50px' }}>
                        <button className='submit' onClick={onSubmit} id="button"></button>
                    </div>

                </> : <h1>Zaloguj sie aby dodac przepis!</h1>}
            </div>
        </div>
    )
}