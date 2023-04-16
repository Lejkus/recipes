import { lazy } from 'react';
import { Routes, Route } from "react-router-dom";
import 'font-awesome/css/font-awesome.min.css';
import Navbar from './components/Navbar';

const Auth = lazy(() => import('./components/Auth'));
const Recipes = lazy(() => import('./components/Recipes'));
const NewRecipe = lazy(() => import('./components/newRecipe'));

function App() {


  return (
    <div className="App">
      <Navbar/>
      <Routes>
        <Route path='/' element={<Recipes />}></Route>
        <Route path='/login' element={<Auth />}></Route>
        <Route path='/new' element={<NewRecipe />}></Route>
      </Routes>
    </div>
  )
}

export default App
