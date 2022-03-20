import * as React from "react";
import LoginForm from "./login-form";
import SignupForm from "./signup-form";
import { useUser } from "../providers/user";
import Avatar from "../components/avatar";

export default function Account() {
	const [showSignup, setShowSignup] = React.useState(false);
	const { user } = useUser();

	return user ? (
		<div className="rounded-md bg-white py-4 px-3 mt-4 flex gap-3">
			<Avatar/>
			<div>
				<span className="font-bold">{user.displayName}</span>
				<br/>
				<span className="text-xs">{user.email}</span>
			</div>
		</div>
	) : (
		<div className="rounded-md bg-white p-4">
			{showSignup
				? <>
					<SignupForm/>
					<span className="text-sm text-gray-500">
						Have an account?
						&nbsp;
						<button type="button" className="text-rose-600/75" onClick={() => setShowSignup(false)}>Login</button>
					</span>
				</>
				: <>
					<LoginForm/>
					<span className="text-sm text-gray-500">
						Need an account?
						&nbsp;
						<button type="button" className="text-rose-600/75" onClick={() => setShowSignup(true)}>Sign up</button>
					</span>
				</>
			}
		</div>
	)
}