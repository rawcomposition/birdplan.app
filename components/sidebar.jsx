import * as React from "react";
import LoginForm from "./login-form";
import SignupForm from "./signup-form";
import { useUser } from "../providers/user";
import { logout } from "../firebase";

export default function Sidebar() {
	const [showSignup, setShowSignup] = React.useState(false);
	const { user } = useUser();
	
	return (
		<div className="h-screen w-72 bg-slate-900 p-6 relative">
			{!user && <div className="rounded-md bg-white p-4">
				{showSignup
					? <>
						<SignupForm className="mb-1"/>
						<span className="text-sm text-gray-500">Have an account? <button type="button" className="text-red-800" onClick={() => setShowSignup(false)}>Login</button></span>
					</>
					: <>
						<LoginForm className="mb-1"/>
						<span className="text-sm text-gray-500">Need an account? <button type="button" className="text-red-800" onClick={() => setShowSignup(true)}>Sign up</button></span>
					</>
				}
			</div>}
			{user && <p className="text-white text-center font-bold mx-2">Hello, {user?.displayName}!</p>}
			{user && <div className="absolute left-0 bottom-0 w-full p-6 text-center">
				<button type="button" onClick={logout} className="text-sm font-bold text-gray-400 border-2 border-gray-400 rounded-md p-1 w-full">Sign Out</button>
			</div>}
		</div>
	)
}