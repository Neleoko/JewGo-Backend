import {initializeApp} from "firebase/app";
import {browserLocalPersistence, initializeAuth} from 'firebase/auth';
import {getFirestore} from "firebase/firestore";
import config from "../../environnements.config.ts"


const firebaseConfig = {
    apiKey: config.API_KEY,
    authDomain: config.AUTH_DOMAIN,
    databaseURL: config.DATABASE_URL,
    projectId: config.PROJECT_ID,
    storageBucket: config.STORAGE_BUCKET,
    messagingSenderId: config.MESSAGING_SENDER_ID,
    appId: config.APP_ID,
    measurementId: config.MEASUREMENT_ID
}

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = initializeAuth(firebaseApp, {
    persistence: browserLocalPersistence
});
export const firestore = getFirestore(firebaseApp);