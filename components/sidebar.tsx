import { useUser } from "providers/user";
import useFirebaseLogout from "hooks/useFirebaseLogout";
import Account from "components/Account";

type Props = {
  open: boolean;
  children?: React.ReactNode;
};

export default function Sidebar({ open, children }: Props) {
  const { user } = useUser();

  const { logout, loading } = useFirebaseLogout();

  return (
    <aside
      className={`h-screen w-80 ${
        !open ? "-ml-96" : ""
      } md:ml-0 bg-slate-900 p-6 absolute md:relative aside-bg bg-bottom shadow-2xl md:shadow-none transition-all z-10`}
    >
      <img src="/icon.png" className="mx-auto" width="120" />
      <h1 className="text-center mb-6 text-[#757c8c] font-logo text-2xl">birdy alert</h1>
      <Account />
      <div className="mt-4">{children}</div>
      {user?.uid && (
        <div className="absolute left-0 bottom-0 w-full p-6 text-center">
          <button
            type="button"
            onClick={logout}
            className="text-sm font-bold text-gray-400 border-2 border-gray-400 rounded-md p-1 w-full"
          >
            {loading ? "..." : "Sign Out"}
          </button>
        </div>
      )}
    </aside>
  );
}
