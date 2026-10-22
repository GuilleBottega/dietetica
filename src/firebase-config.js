// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";



const firebaseConfig = {
  apiKey: "AIzaSyBSSpNzsbpSNmpYENEoEI4Z7ZoFR67zTl8",
  authDomain: "punto-fit-14699.firebaseapp.com",
  projectId: "punto-fit-14699",
  storageBucket: "punto-fit-14699.firebasestorage.app",
  messagingSenderId: "143783039740",
  appId: "1:143783039740:web:84e65b2cb6f3fcad48bd79",
  measurementId: "G-84HNZHKWB2"
};


const app = initializeApp(firebaseConfig);
getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);