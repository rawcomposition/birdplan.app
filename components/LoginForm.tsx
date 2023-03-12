import useFirebaseLogin from "hooks/useFirebaseLogin";
import Submit from "components/Submit";
import AuthError from "components/AuthError";
import Input from "components/Input";

type Props = {
  [key: string]: any;
};

export default function LoginForm(props: Props) {
  const { login, loading, error } = useFirebaseLogin();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //@ts-ignore
    login(e.target.elements.email.value, e.target.elements.password.value);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-1" {...props}>
      <h3 className="text-slate-700">Login</h3>
      <span className="text-sm text-slate-500">Sync between devices</span>
      <Input type="text" id="email" placeholder="Email" />
      <Input type="password" id="password" placeholder="Password" />
      <Submit loading={loading} className="mt-2 w-full">
        Login
      </Submit>
      {error && <AuthError>Error logging in</AuthError>}
    </form>
  );
}
