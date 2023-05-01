import { lazy, useEffect, useState } from 'react';
import { Routes, Route } from "react-router-dom";
import 'font-awesome/css/font-awesome.min.css';
import Navbar from './components/Navbar';

const Auth = lazy(() => import('./components/Auth'));
const Recipes = lazy(() => import('./components/Recipes'));
const NewRecipe = lazy(() => import('./components/newRecipe'));
const PublicRecipes = lazy(() => import('./components/PublicRecipes'));
const EditRecipe = lazy(() => import('./components/EditRecipe'));

import { Suspense } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';

function App() {

  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user.uid);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);


  return (
    <div className="App">
      <Navbar currentUser={currentUser}/>
      <Routes>
        <Route path='/' element={<Suspense fallback={<h1>Loading</h1>}><Recipes currentUser={currentUser} /></Suspense>}></Route>
        <Route path='/public' element={<Suspense fallback={<h1>Loading</h1>}><PublicRecipes currentUser={currentUser} /></Suspense>}></Route>
        <Route path='/login' element={<Suspense fallback={<h1>Loading</h1>}><Auth /></Suspense>}></Route>
        <Route path='/new' element={<Suspense fallback={<h1>Loading</h1>}><NewRecipe currentUser={currentUser} /></Suspense>}></Route>
        <Route path='/editrecipe/:id' element={<Suspense fallback={<h1>Loading</h1>}><EditRecipe currentUser={currentUser} /></Suspense>}></Route>
      </Routes>
    </div>
  )
}

export default App
