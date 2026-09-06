import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDnk8-1D6T53x7nRAcFjElQBCucOhME6RI",
  authDomain: "carelink-db478.firebaseapp.com",
  projectId: "carelink-db478",
  storageBucket: "carelink-db478.firebasestorage.app",
  messagingSenderId: "358127575633",
  appId: "1:358127575633:web:13fdeb40afff0ad8f0ce70",
  measurementId: "G-NV5K00NKNJ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
