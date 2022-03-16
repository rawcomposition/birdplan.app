import * as React from "react";
import LoginForm from "./login-form";
import SignupForm from "./signup-form";
import { useUser } from "../providers/user";
import { logout } from "../firebase";

export default function Sidebar() {
	const [showSignup, setShowSignup] = React.useState(false);
	const { user } = useUser();
	
	return (
		<div className="h-screen w-72 bg-slate-900 p-6 relative bg-[url('/flock.svg')] bg-bottom bg-no-repeat bg-[length:200%] bg-blend-luminosity">
			<img src="/icon.png" className="mx-auto" width="85"/>
			<h1 className="text-center mb-6 text-[#757c8c] font-logo text-2xl">birdy alert</h1>
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
			{user && 
				<>
					<div className="rounded-md bg-white py-4 px-3 mt-4 flex gap-3">
						<img src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=150" className="w-[50px] h-[50px] object-cover rounded-full"/>
						<div>
							<span className="font-bold">{user.displayName}</span>
							<br/>
							<span className="text-xs">{user.email}</span>
						</div>
					</div>
				</>
			}
			{user && <div className="absolute left-0 bottom-0 w-full p-6 text-center">
				<button type="button" onClick={logout} className="text-sm font-bold text-gray-400 border-2 border-gray-400 rounded-md p-1 w-full">Sign Out</button>
			</div>}
		</div>
	)
}