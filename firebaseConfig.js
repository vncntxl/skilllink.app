// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAqA70egZWbvZZb0zkmAWDpGAECvoJELhg",
  authDomain: "skilllink-883c1.firebaseapp.com",
  projectId: "skilllink-883c1",
  storageBucket: "skilllink-883c1.firebasestorage.app",
  messagingSenderId: "838083907360",
  appId: "1:838083907360:web:99963305de4ec05cbb5145",
  measurementId: "G-RM0K1N8JD4",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
