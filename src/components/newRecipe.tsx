import { useState } from 'react'

import { db,storage } from "../config/firebase";
import {collection,addDoc,} from "firebase/firestore";
import {ref,uploadBytes,} from "firebase/storage";

export default function NewRecipe() {

    const recipesCollectionRef = collection(db, "recipes");
    const constituentsCollectionRef = collection(db, 'constituents')

    const [newRecipe, setNewRecipe] = useState<RecipeType>({ name: '', preparation: '', time: '', userId: '', categories: [] })
    const [newConstituents, setNewConstituents] = useState<Array<ConstituentType>>([])
    const [newConstituent, setNewConstituent] = useState<ConstituentType>({ ingredient: '', amount: '', recipe: '' })

    const [fileUpload, setFileUpload] = useState(null);
    const [filesArray, setFilesArray] = useState([]);


    interface RecipeType { name: string, preparation: string, time: string, userId: string, categories: Array<String> }
    interface ConstituentType { ingredient: string, recipe: string, amount: string }

    const updateRecipe = e => {
        const fieldName = e.target.name
        setNewRecipe(existingValues => ({
            ...existingValues,
            [fieldName]: e.target.value,
        }))

    }

    const updateConstituent = e => {
        const fieldName = e.target.name
        setNewConstituent(existingValues => ({
            ...existingValues,
            [fieldName]: e.target.value,
        }))
    }

    const addConstituent = e => {
        e.preventDefault()
        // setNewConstituent({ ingredient: newConstituent.ingredient, amount: newConstituent.amount, recipe: '' })
        setNewConstituents(existingValues => [...existingValues, newConstituent]);
        setNewConstituent({ ingredient: '', amount: '', recipe: '' })
    }

    const onSubmit = async e => {
        e.preventDefault()

        try {
            await addDoc(recipesCollectionRef, {
                name: newRecipe.name,
                preparation: newRecipe.preparation,
                time: newRecipe.time,
                categories: newRecipe.categories,
                userId: 'auth?.currentUser?.uid',
            }).then(function (docRef) {
                console.log("Document written with ID: ", docRef.id);

                // skladniki
                if (newConstituents.length) {
                    const updatedConstituents = newConstituents.map((constituent) => ({
                        ...constituent,
                        recipe: `/recipes/${docRef.id}`,
                    }));

                    setNewConstituents(updatedConstituents);

                    // Dodaj dokumenty do kolekcji `constituents`
                    updatedConstituents.forEach(async (constituent) => {
                        await addDoc(constituentsCollectionRef, {
                            ingredient: constituent.ingredient,
                            amount: constituent.amount,
                            recipe: constituent.recipe,
                        });
                    });
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
        <>
            <form onSubmit={addConstituent}>
                <input value={newConstituent.amount} onChange={updateConstituent} name='amount' type='text' placeholder='ilosc skladnika'></input>
                <input value={newConstituent.ingredient} onChange={updateConstituent} name='ingredient' type='text' placeholder='nazwa skladnika'></input>
                <button type='submit'>Add Constituent</button>
            </form>
            <hr></hr>
            <div>
                <input
                    type="file"
                    onChange={(e) => setFileUpload(e.target.files[0])}
                />
                <button
                    onClick={(e) => setFilesArray([...filesArray, fileUpload])}
                >
                    {" "}
                    Upload File{" "}
                </button>
            </div>
            <hr></hr>
            <form onSubmit={onSubmit}>
                <input type='text' value={newRecipe.name} onChange={updateRecipe} name='name' placeholder='nazwa potrawy' ></input>
                <input type='text' value={newRecipe.time} onChange={updateRecipe} name='time' placeholder='czas przygotowania'></input>
                <textarea value={newRecipe.preparation} onChange={updateRecipe} name='preparation' placeholder='opisz sposób przygotowania'></textarea>

                <button type='submit'>Add przepis</button>
            </form>
            {newConstituents.length > 0 ? <>{newConstituents.map(({ amount, ingredient }) => {
                return <div>{amount}{ingredient}</div>
            })}</> : <></>}
        </>
    )
}
