import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAjYt5N7yt9FfeGgLCNqVVWv3cNTP72pZc",
  authDomain: "health-tech-warriors.firebaseapp.com",
  projectId: "health-tech-warriors",
  storageBucket: "health-tech-warriors.firebasestorage.app",
  messagingSenderId: "98697358497",
  appId: "1:98697358497:web:303c28aaec069e984714e0",
  measurementId: "G-L1SECFY2ZC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);