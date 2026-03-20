import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDaeKmSOvFQQGl6jLDYcPfA0OiRrTiyl8Q",
  authDomain: "vet-banco.firebaseapp.com",
  projectId: "vet-banco",
  storageBucket: "vet-banco.firebasestorage.app",
  messagingSenderId: "1033520885552",
  appId: "1:1033520885552:web:59bf13e3b268587f97a2f5",
  measurementId: "G-LMXQ96VMV7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);