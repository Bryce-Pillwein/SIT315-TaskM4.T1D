// Firebase Config ts
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGmMx4LJNPGzj5E9-hWyZ2rD2DF-36dtg",
  authDomain: "sit315-project-iot.firebaseapp.com",
  projectId: "sit315-project-iot",
  storageBucket: "sit315-project-iot.appspot.com",
  messagingSenderId: "1095749398100",
  appId: "1:1095749398100:web:583999b5d5a08d4f2547c1"
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

