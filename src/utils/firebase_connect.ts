import { initializeApp } from "firebase/app";
import { initializeAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import config from "../../environnements.config.ts"


const firebaseConfig = {
    apiKey: config.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
}

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = initializeAuth(firebaseApp, {
    persistence: browserLocalPersistence
});
export const firestore = getFirestore(firebaseApp);