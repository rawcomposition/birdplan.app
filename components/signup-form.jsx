import { auth } from "../firebase";
import useFirebaseSignup from "../hooks/use-firebase-signup";
import Submit from "./submit";
import Error from "./error";
import Input from "./input";

export default function SignupForm(props) {
	const { createUser, loading, error } = useFirebaseSignup(auth);
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
		<form onSubmit={handleSubmit} {...props}>
			<h3>Sign up</h3>
			<Input type="text" id="name" placeholder="Name"/>
			<Input type="email" id="email" placeholder="Email"/>
			<Input type="password" id="password" placeholder="Password"/>
			<Submit loading={loading} className="mt-2 w-full">Sign up</Submit>
			{error && <Error>Error creating account</Error>}
		</form>
	)
}