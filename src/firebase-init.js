import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBbq5qxKRgXmWYkmV40jMmFRDlrI9yxByk",
    authDomain: "whatsapp-clone-aa4f3.firebaseapp.com",
    projectId: "whatsapp-clone-aa4f3",
    storageBucket: "whatsapp-clone-aa4f3.appspot.com",
    messagingSenderId: "687820525894",
    appId: "1:687820525894:web:b73fbd5cfa851c51dc9547",
    measurementId: "G-5Q3Z3DJHM5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db }