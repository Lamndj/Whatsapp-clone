import firebase from "firebase";

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "whatsappclone-feeea.firebaseapp.com",
  projectId: "whatsappclone-feeea",
  storageBucket: "whatsappclone-feeea.appspot.com",
  messagingSenderId: "867241922950",
  appId: "1:867241922950:web:7ed0c6514c7e6ea9b01c07",
};

console.log("your api => " + process.env.API_KEY);

const app = firebase.apps.length
  ? firebase.app()
  : firebase.initializeApp(firebaseConfig);

const db = app.firestore();
const auth = app.auth();
const provider = new firebase.auth.GoogleAuthProvider();

export { db, auth, provider };
