import * as React from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
	
export default function useFirebaseLogout(onLogout)  {
	const [loading, setLoading] = React.useState(false);
	
	const logout = async () => {
		setLoading(true);
		try {
			await signOut(auth);
			onLogout();
			localStorage.clear();
		} catch (error) {
			alert("Error logging out");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return { logout, loading };
}