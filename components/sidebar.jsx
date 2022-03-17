import * as React from "react";
import LoginForm from "./login-form";
import SignupForm from "./signup-form";
import { useUser } from "../providers/user";
import { logout } from "../firebase";
import Select from "react-select";

export default function Sidebar({seenCount, filters, onFilterChange}) {
	const [showSignup, setShowSignup] = React.useState(false);
	const { user } = useUser();

	const radiusOptions = [
		{ label: "5 mi", value: 5 },
		{ label: "10 mi", value: 10 },
		{ label: "20 mi", value: 20 },
		{ label: "50 mi", value: 50 },
		{ label: "100 mi", value: 100 },
		{ label: "250 mi", value: 250 },
	];

	const selectedRadius = filters.radius ? radiusOptions.find(({value}) => value == filters.radius) : null;
	
	return (
		<div className="h-screen w-80 bg-slate-900 p-6 relative bg-[url('/flock.svg')] bg-bottom bg-no-repeat bg-[length:200%] bg-blend-luminosity">
			<img src="/icon.png" className="mx-auto" width="85"/>
			<h1 className="text-center mb-6 text-[#757c8c] font-logo text-2xl">birdy alert</h1>
			{!user && <div className="rounded-md bg-white p-4">
				{showSignup
					? <>
						<SignupForm className="mb-1"/>
						<span className="text-sm text-gray-500">Have an account? <button type="button" className="text-rose-600/75" onClick={() => setShowSignup(false)}>Login</button></span>
						<span className="text-sm text-gray-500">Have an account? <button type="button" className="text-rose-600/75" onClick={() => setShowSignup(false)}>Login</button></span>
					</>
					: <>
						<LoginForm className="mb-1"/>
						<span className="text-sm text-gray-500">Need an account? <button type="button" className="text-rose-600/75" onClick={() => setShowSignup(true)}>Sign up</button></span>
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
			<div className="mt-4">
				<label htmlFor="radius" className="text-white text-sm">Radius</label>
				<Select options={radiusOptions} value={selectedRadius} onChange={({value}) => onFilterChange("radius", value)} defaultValue={radiusOptions[3]} placeholder="Select radius..."/>
			</div>
			<div className="mt-4">
				<label className="text-white text-sm">
					<input type="checkbox" className="mr-2" checked={!filters?.showSeen} onChange={() => onFilterChange("showSeen")}/> Hide species I&apos;ve seen ({seenCount})
				</label>
			</div>
			{user && <div className="absolute left-0 bottom-0 w-full p-6 text-center">
				<button type="button" onClick={logout} className="text-sm font-bold text-gray-400 border-2 border-gray-400 rounded-md p-1 w-full">Sign Out</button>
			</div>}
		</div>
	)
}