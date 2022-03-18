import * as React from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useUser } from "../providers/user";
	
export default function useFirebaseSignup()  {
	const [error, setError] = React.useState();
	const [loading, setLoading] = React.useState(false);
	const { refreshUser } = useUser();
	
	const createUser = async (name, email, password) => {
		setLoading(true);
		setError(null);
		try {
			await createUserWithEmailAndPassword(auth, email, password);
			await updateProfile(auth.currentUser, { displayName: name });
			refreshUser();
		} catch (error) {
			setError(error);
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return { createUser, loading, error };
}