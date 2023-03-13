import { useUser } from "providers/user";
import useFirebaseLogout from "hooks/useFirebaseLogout";

type Props = {
  open: boolean;
  children?: React.ReactNode;
};

export default function Sidebar({ open, children }: Props) {
  const { user } = useUser();

  const { logout, loading } = useFirebaseLogout();

  return (
    <aside
      className={`w-80 ${
        !open ? "-ml-96" : ""
      } md:ml-0 bg-[#1e263a] absolute md:relative shadow-2xl md:shadow-none transition-all z-10`}
    >
      <div className="p-6">
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
      </div>
    </aside>
  );
}
