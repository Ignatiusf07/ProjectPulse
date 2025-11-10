import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "###",
  authDomain: "projectpulse-ad152.firebaseapp.com",
  projectId: "projectpulse-ad152",
  storageBucket: "projectpulse-ad152.firebasestorage.app",
  messagingSenderId: "282847671815",
  appId: "1:282847671815:web:589eb8c4e74d14c797dca2",
  measurementId: "G-B0Q98B49NG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
//const analytics = getAnalytics(app);
