import useFirebaseSignup from "hooks/useFirebaseSignup";
import Submit from "components/Submit";
import AuthError from "components/AuthError";
import Input from "components/Input";

type Props = {
  [key: string]: any;
};

export default function SignupForm(props: Props) {
  const { createUser, loading, error } = useFirebaseSignup();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //@ts-ignore
    const name = e.target.elements.name.value;
    if (!name) {
      alert("Name is required");
    }
    //@ts-ignore
    createUser(name, e.target.elements.email.value, e.target.elements.password.value);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-1" {...props}>
      <h3 className="text-slate-700">Sign up</h3>
      <span className="text-sm text-slate-500">Sync between devices</span>
      <Input type="text" id="name" placeholder="Name" />
      <Input type="email" id="email" placeholder="Email" />
      <Input type="password" id="password" placeholder="Password" />
      <Submit loading={loading} className="mt-2 w-full">
        Sign up
      </Submit>
      {error && <AuthError>Error creating account</AuthError>}
    </form>
  );
}
