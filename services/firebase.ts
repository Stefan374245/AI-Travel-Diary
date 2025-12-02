import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDCnnox8i_rLpFxrE3ueCH7Yeg6S1NMQdQ",
  authDomain: "travel-2-speak.firebaseapp.com",
  projectId: "travel-2-speak",
  storageBucket: "travel-2-speak.firebasestorage.app",
  messagingSenderId: "604074594394",
  appId: "1:604074594394:web:55e88af7632ee033fe0863"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
