import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "#",
  authDomain: "projectpulse-000702.firebaseapp.com",
  projectId: "projectpulse-000702",
  storageBucket: "projectpulse-000702.appspot.com",
  messagingSenderId: "1038725896874",
  appId: "1:1038725896874:web:f568a1ba6768a52d5aced3",
  measurementId: "G-DYD6YY5WJZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
const analytics = getAnalytics(app);
