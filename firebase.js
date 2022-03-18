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
export const auth = getAuth(app);
export const db = getFirestore(app);


export const saveSeenSpecies = async (seenSpecies) => {
	const user = auth.currentUser;
	if (!user) {
		return false;
	}
	await setDoc(doc(db, "seenSpecies", user.uid), {
		species_ids: seenSpecies,
	});
}

export const uploadSeenSpeciesFromLocalhost = async () => {
	try {
		const seen = window.localStorage.getItem("seen");
		if (seen) {
			const seenArray = JSON.parse(seen);
			if (Array.isArray(seenArray) && seenArray.length > 0) {
				saveSeenSpecies(seenArray);
			}
		}
	} catch (error) {}
}

export const fetchSeenSpecies = async () => {
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