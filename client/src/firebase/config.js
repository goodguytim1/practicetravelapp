// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getStorage} from 'firebase/storage'
// Your web app's Firebase configuration
console.log(process.env)
const firebaseConfig = {
    apiKey: "AIzaSyDh1J3XdZibZeDCai6qudbXMKKVUNlLdTo",
    authDomain: "travel-b4ba4.firebaseapp.com",
    projectId: "travel-b4ba4",
    storageBucket: "travel-b4ba4.appspot.com",
    messagingSenderId: "412913113097",
    appId: "1:412913113097:web:6338dffcaddacf529dc0d8"
};
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage()
