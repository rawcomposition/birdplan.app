import * as React from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export const UserContext = React.createContext();

const UserProvider = ({ children }) => {
	const [user, setUser] = React.useState();

	React.useEffect(() => {
		onAuthStateChanged(auth, (user) => {
			setUser(user)
		});
	}, []);

	const refreshUser = React.useCallback(async () => {
		await auth.currentUser.reload();
		setUser({...auth.currentUser});
	}, []);

	return <UserContext.Provider value={{user, refreshUser}}>{children}</UserContext.Provider>;
};

const useUser = () => {
	const state = React.useContext(UserContext);
	return { ...state };
};

export { UserProvider, useUser };
