import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, setDoc, getDoc, doc } from "firebase/firestore";

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


const saveSeenSpecies = async (seenSpecies) => {
	const user = auth.currentUser;
	if (!user) {
		return false;
	}
	await setDoc(doc(db, "seenSpecies", user.uid), {
		species_ids: seenSpecies,
	});
}

const fetchSeenSpecies = async () => {
	const user = auth.currentUser;
	if (!user) {
		return [];
	}
	const snapshot = await getDoc(doc(db, "seenSpecies", user.uid));
	if (snapshot.exists()) {
		return snapshot.data()?.species_ids;
	}
	return [];
}

export { auth, db, saveSeenSpecies, fetchSeenSpecies };