import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDVblSovlzF8C9csEFj7bgb9aQcOPW9Ke4",
  authDomain: "surecaptaafl.firebaseapp.com",
  projectId: "surecaptaafl",
  storageBucket: "surecaptaafl.appspot.com",
  messagingSenderId: "751344351924",
  appId: "1:751344351924:web:0f0296711b3ca708ed35e1",
  measurementId: "G-R2ZG918WCT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
