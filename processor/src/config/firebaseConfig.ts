// Firebase Config ts
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwQzFnawBqUUqTzjKTUu7j2y07lpW2_jA",
  authDomain: "sit315-project.firebaseapp.com",
  projectId: "sit315-project",
  storageBucket: "sit315-project.appspot.com",
  messagingSenderId: "978009462114",
  appId: "1:978009462114:web:01973976efb9d1b7c8883b"
};

/**
 * Initialize Firebase
 * Intialises firebase, auth and db by checking first if the app is already intialised
 * @returns Firebase App, Firestore Database
 */
const initializeFirebase = (): { firebaseApp: FirebaseApp, db: Firestore, } => {
  let app;
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  const firestore = getFirestore(app);

  return { firebaseApp: app, db: firestore };
};

const { firebaseApp, db } = initializeFirebase();
export { firebaseApp, db };

