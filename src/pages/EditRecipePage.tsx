import { useEffect, useState } from 'react'

import { db, storage } from "../config/firebase";
import { collection, addDoc, doc, getDoc, getDocs, query, where, updateDoc, deleteDoc } from "firebase/firestore";

import { getDownloadURL, listAll, ref, uploadBytes, } from "firebase/storage";
import '../styles/newrecipe.scss'
import { useNavigate, useParams } from 'react-router-dom';

interface RecipeType { id: string, name: string, preparation: string, time: string, userId: string, categories: Array<String> }
interface ConstituentType { ingredient: string, recipe: string, amount: string, id: string }

export default function EditRecipe({ currentUser }: { currentUser: string | undefined }) {
    const { id } = useParams();
    const navigate = useNavigate();


    const [loading, setLoading] = useState(true);

    const recipesCollectionRef = collection(db, "recipes");
    const constituentsCollectionRef = collection(db, 'constituents')

    const [newRecipe, setNewRecipe] = useState<RecipeType>({ id: '', name: '', preparation: '', time: '', userId: '', categories: [] })
    const [oldConstituents, setOldConstituents] = useState<Array<ConstituentType>>([])
    const [newConstituents, setNewConstituents] = useState<Array<ConstituentType>>([])
    const [newConstituent, setNewConstituent] = useState<ConstituentType>({ ingredient: '', amount: '', recipe: '' })

    const [newCategory, setNewCategory] = useState<String>('')

    const [filesArray, setFilesArray] = useState([]);


    const getRecipe = async () => {
        try {
            const docRef = doc(db, "recipes", id);

            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                let recipe = docSnapshot.data();
                recipe.id = docRef.id;


                setNewRecipe(recipe)

                const constituentsQuerySnapshot = await getDocs(query(constituentsCollectionRef, where("recipe", "==", docRef)));

                const constituents = constituentsQuerySnapshot.docs.map((doc) => {
                    const constituent = doc.data()
                    constituent.id = doc.id
                    return constituent;
                });

                setOldConstituents(constituents);

                const imagesListRef = ref(storage, `images/${docRef.id}/`);
                const images = []

                const imagesrefs = await listAll(imagesListRef);
                await Promise.all(imagesrefs.items.reverse().map(async (item) => {
                    const url = await getDownloadURL(item);
                    images.push(url)
                }))

                setFilesArray(images)
                setLoading(false)

            } else {
                console.log("Nie znaleziono dokumentu o podanym ID");
            }

        } catch (err) {
            console.error(err);
        }
    };

    const ButtonEffect = e => {
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
        //e.preventDefault()
        if (newConstituent.ingredient && newConstituent.amount) {
            setNewConstituents(existingValues => [...existingValues, newConstituent]);
            setNewConstituent({ ingredient: '', amount: '', recipe: '' })
        }
    }

    const addCategory = e => {
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

    const deleteCategory = (category: String) => {
        const filteredCategories = newRecipe.categories.filter(name => name != category);
        setNewRecipe(existingValues => ({
            ...existingValues,
            categories: filteredCategories,
        }))
    }

    const deleteConstituent = async (constituent: ConstituentType | String, type: String) => {
        if (type === 'old') {

            const docRef = doc(db, 'constituents', constituent.id);
            await deleteDoc(docRef);
            console.log("Dokument został usunięty");

            const filteredConstituent = oldConstituents.filter(name => name.ingredient != constituent.ingredient);
            setOldConstituents(filteredConstituent)
        } else {
            const filteredConstituentNew = newConstituents.filter(name => name.ingredient != constituent);
            setNewConstituents(filteredConstituentNew)
        }




    }

    const updateRecipeDoc = async () => {
        const docRef = doc(db, "recipes", id);
        //update tutułu i kategorii 
        await updateDoc(docRef, newRecipe)

        //dodanie nowych składników
        const updatedConstituents = newConstituents.map((constituent) => ({
            ...constituent,
            recipe: docRef,
        }));
        const addDocPromises = updatedConstituents.map((constituent) => {
            return addDoc(constituentsCollectionRef, constituent);
        });

        await Promise.all(addDocPromises);

        console.log("Constituents edited successfully!");

        if (filesArray.length) {
            try {
                filesArray.forEach(async (file) => {
                    await uploadBytes(ref(storage, `images/${docRef.id}/${file.name}`), file);
                })

            } catch (err) {
                console.error(err);
            }
        }
        navigate("/");

    }

    useEffect(() => {
        getRecipe()
    }, [id])


    return (
        <div className='add-component-container'>
            <div className='add-component'>

                {currentUser ? <>
                    {loading ? <center><i className="fa fas fa-spinner fa-pulse" style={{ fontSize: '350px', color: '#27ae60', marginTop: '100px' }}></i></center> : <>

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
                            {newConstituents.length > 0 ? <>nowe składniki:{newConstituents.map(({ amount, ingredient }) => {
                                return <div className='constituent' onClick={() => deleteConstituent(ingredient, 'new')}>
                                    <h3 className='title'>Ilosć: </h3><h3>{amount}</h3>
                                    <h3 className='title'>Składnik: </h3><h3 >{ingredient}</h3>
                                </div>
                            })}</> : <></>}

                            {oldConstituents.length > 0 ? <>stare składniki :{oldConstituents.map((constituent) => {
                                return <div className='constituent' onClick={() => deleteConstituent(constituent, 'old')}>
                                    <h3 className='title'>Ilosć: </h3><h3>{constituent.amount}</h3>
                                    <h3 className='title'>Składnik: </h3><h3 >{constituent.ingredient}</h3>
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

                                return <div onClick={() => { deleteCategory(category) }} className='category'>{category}</div>
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
                            {filesArray.length > 0 ? <>{filesArray.map((file, i) => {
                                return <div className='image' key={i}>{file.name ? file.name : `zdjęcie ${i + 1}`}</div>
                            })}</> : <></>}

                        </div>

                        <div className="button-container" style={{ marginTop: '50px' }}>
                            <button className='submit' onClick={updateRecipeDoc} id="button"></button>
                        </div></>}


                </> : <center><h1>Zaloguj sie aby dodac przepis!</h1></center>}
            </div>
        </div>
    )
}