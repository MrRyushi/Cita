// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyArm1v0Dz-wzlo7y7FmoYDsJiyrQmcVYnw",
  authDomain: "cita-dating-app.firebaseapp.com",
  projectId: "cita-dating-app",
  storageBucket: "cita-dating-app.firebasestorage.app",
  messagingSenderId: "301139807979",
  appId: "1:301139807979:web:92e64f49441d05cf0478ae",
  measurementId: "G-2PSV6KB6K2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);