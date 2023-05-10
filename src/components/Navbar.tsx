import { useState } from 'react'
import '../styles/navbar.scss'
import { Link } from 'react-router-dom'
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function Navbar({ currentUser }) {

  const [visible, setVisible] = useState(false)

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="navbar">
      <div className='navbar-content'>
        <h1>pyszneprzepisy.pl</h1>
        <div onClick={() => { setVisible(!visible) }} className={`menu-toggle ${visible ? "is-active " : ""} `} id="mobile-menu">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>


        <ul className={`nav ${visible ? "mobile-nav " : ""} `}>
          <Link to={'/'}><li className="nav-item">Moje przepisy</li></Link>
          <Link to={'/public'}><li className="nav-item">Publiczne przepisy</li></Link>
          <Link to={'/new'}><li className="nav-item">Dodaj przepis</li></Link>
          {currentUser ? <li className='nav-item'><i onClick={logout} className="fa fa-sign-out fa-lg" style={{ color: 'white' }} aria-hidden="true"></i></li> : <Link to={'/login'}><li className="nav-item"><i className="fa fa-solid fa-user fa-lg" style={{ color: 'white' }}></i></li></Link>}

        </ul>
      </div>

    </nav>
  )
}
