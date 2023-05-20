import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD_KgfSr3v8Ywv66YjP5BI7TC07vd6XGww",
  authDomain: "przepisy-2bbb7.firebaseapp.com",
  projectId: "przepisy-2bbb7",
  storageBucket: "przepisy-2bbb7.appspot.com",
  messagingSenderId: "351307385922",
  appId: "1:351307385922:web:c717fb1ee7552eaa8171db",
  measurementId: "G-RYYPEGWRX4",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);
export const storage = getStorage(app);
