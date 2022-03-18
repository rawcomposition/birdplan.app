import * as React from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
	
export default function useFirebaseLogin()  {
	const [error, setError] = React.useState();
	const [loading, setLoading] = React.useState(false);
	
	const login = async (email, password) => {
		setLoading(true);
		setError(null);
		try {
			await signInWithEmailAndPassword(auth, email, password);
		} catch (error) {
			setError(error);
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return { login, loading, error };
}