import * as React from "react";
import LoginForm from "./login-form";
import SignupForm from "./signup-form";
import { useUser } from "../providers/user";

export default function Sidebar() {
	const [showSignup, setShowSignup] = React.useState(false);
	const { user } = useUser();
	
	return (
		<div className="h-screen w-72 bg-slate-900 p-6">
			<div className="rounded-md bg-white p-4">
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

			</div>
			<p className="text-white">{user?.email} ({user?.displayName})</p>
		</div>
	)
}