"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.firebaseApp = void 0;
// Firebase Config ts
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
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
const initializeFirebase = () => {
    let app;
    if (!(0, app_1.getApps)().length) {
        app = (0, app_1.initializeApp)(firebaseConfig);
    }
    else {
        app = (0, app_1.getApp)();
    }
    const firestore = (0, firestore_1.getFirestore)(app);
    return { firebaseApp: app, db: firestore };
};
const { firebaseApp, db } = initializeFirebase();
exports.firebaseApp = firebaseApp;
exports.db = db;
