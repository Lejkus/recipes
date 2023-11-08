import { auth, googleProvider } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth";
import { useState } from "react";
import '../styles/auth.scss'
import { useNavigate } from "react-router-dom";
import { FormEvent } from 'react';


export default function Auth() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeSite, setActiveSite] = useState("");

  const signUp = async (e: FormEvent) => {
    e.preventDefault();
    if (email && password) {
      await createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
          alert('pomyślnie zarejestrowano, teraz możesz sie zalogować')
        })
        .catch((error) => {
          alert(error.message);
        });

    } else {
      alert('Uzupełnij dane!')
    }

  };
  const signIn = async (e: FormEvent) => {
    e.preventDefault();
    if (email && password) {
      await signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          alert("Pomyślnie się zalogowano")
          //console.log(userCredential);
          navigate('/')
        })
        .catch((error) => {
          alert(error.message);
        });
    } else {
      alert('Uzupełnij dane!')
    }

  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider).then(() => {
        navigate('/')
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeSite = () => {
    if (!activeSite) {
      setActiveSite("right-panel-active")
    } else {
      setActiveSite('')
    }
    setEmail('')
    setPassword('')
  }

  return (
    <div className="auth-site">
      <div className={`container ${activeSite}`} id="container">

        <div className="form-container sign-up-container">
          <form onSubmit={signUp}>
            <h1>Stwórz konto</h1>
            <div className="social-container">
              <a className="social"><i className="fa fab fa-facebook-f"></i></a>
              <a onClick={signInWithGoogle} className="social"><i className="fa fa-brands fa-google"></i></a>
              <a className="social"><i className="fa fa-spinner fa-spin"></i></a>
            </div>
            <span>lub użyj maila do rejestracji</span>
            <input type="text" placeholder="Imię" />
            <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" />
            <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Hasło" />
            <button>Zarejestruj</button>
          </form>
        </div>

        <div className="form-container sign-in-container">
          <form onSubmit={signIn}>
            <h1>Zaloguj się</h1>
            <div className="social-container">
              <a className="social"><i className="fa fab fa-facebook-f"></i></a>
              <a onClick={signInWithGoogle} className="social"><i className="fa fa-brands fa-google"></i></a>
              <a className="social"><i className="fa fa-spinner fa-spin"></i></a>
            </div>
            <span>lub użyj swojego konta</span>
            <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" />
            <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Hasło" />
            <a>Zapomniałeś hasła?</a>
            <button>Zaloguj</button>
          </form>
        </div>

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Witaj na naszej stronie!</h1>
              <p>Zarejestruj się i zacznij z nami gotować!</p>
              <button onClick={handleChangeSite} className="ghost" id="signIn">Zaloguj się</button>
            </div>

            <div className="overlay-panel overlay-right">
              <h1>Witaj ponownie!</h1>
              <p>Zaloguj się aby zacząć gotować ze swoich przepisów, lub gdy nie masz konta: </p>
              <button onClick={handleChangeSite} className="ghost" id="signUp">Zarejestruj się</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
