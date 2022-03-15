import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyCGaBX_cx-ho80gdc93nR2zGX2VxyJN538",
	authDomain: "rare-birds.firebaseapp.com",
	projectId: "rare-birds",
	storageBucket: "rare-birds.appspot.com",
	messagingSenderId: "396386586806",
	appId: "1:396386586806:web:69bfa742dbdfb81fb39617"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const logout = () => {
	signOut(auth);
};

export { auth, db, logout };