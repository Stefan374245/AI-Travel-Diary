import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDCnnox8i_rLpFxrE3ueCH7Yeg6S1NMQdQ",
  authDomain: "travel-2-speak.firebaseapp.com",
  projectId: "travel-2-speak",
  storageBucket: "travel-2-speak.firebasestorage.app",
  messagingSenderId: "604074594394",
  appId: "1:604074594394:web:55e88af7632ee033fe0863"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
