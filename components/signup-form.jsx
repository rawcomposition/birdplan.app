import useFirebaseSignup from "../hooks/use-firebase-signup";
import Submit from "./submit";
import AuthError from "./auth-error";
import Input from "./input";

export default function SignupForm(props) {
	const { createUser, loading, error } = useFirebaseSignup();
	const handleSubmit = (e) => {
		e.preventDefault();
		const name = e.target.elements.name.value;
		if (!name) {
			alert("Name is required");
		}
		createUser(
			name,
			e.target.elements.email.value,
			e.target.elements.password.value
		);
	}

	return (
		<form onSubmit={handleSubmit} className="mb-1" {...props}>
			<h3 className="text-slate-700">Sign up</h3>
			<span className="text-sm text-slate-500">Sync between devices</span>
			<Input type="text" id="name" placeholder="Name"/>
			<Input type="email" id="email" placeholder="Email"/>
			<Input type="password" id="password" placeholder="Password"/>
			<Submit loading={loading} className="mt-2 w-full">Sign up</Submit>
			{error && <AuthError>Error creating account</AuthError>}
		</form>
	)
}