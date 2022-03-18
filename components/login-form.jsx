import useFirebaseLogin from "../hooks/use-firebase-login";
import Submit from "./submit";
import AuthError from "./auth-error";
import Input from "./input";

export default function LoginForm(props) {
	const { login, loading, error } = useFirebaseLogin();

	const handleSubmit = (e) => {
		e.preventDefault();
		login(
			e.target.elements.email.value,
			e.target.elements.password.value
		);
	}

	return (
		<form onSubmit={handleSubmit} {...props}>
			<h3>Login</h3>
			<Input type="text" id="email" placeholder="Email"/>
			<Input type="password" id="password" placeholder="Password"/>
			<Submit loading={loading} className="mt-2 w-full">Login</Submit>
			{error && <AuthError>Error logging in</AuthError>}
		</form>
	)
}