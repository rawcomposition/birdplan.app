import Link from "next/link";
import { useUser } from "providers/user";
import { Menu } from "@headlessui/react";
import useFirebaseLogout from "hooks/useFirebaseLogout";
import clsx from "clsx";

type Props = {
  inSidebar?: boolean;
  className?: string;
};

export default function Header({ inSidebar, className }: Props) {
  const { user } = useUser();
  const { logout } = useFirebaseLogout();
  if (!user) return null;

  return (
    <div className={clsx("relative", className)}>
      <Menu>
        <Menu.Button className="text-gray-400 gap-3 flex items-center">
          {user.photoURL && (
            <img src={user.photoURL} className="w-[32px] h-[32px] object-cover rounded-full opacity-85" />
          )}
          <span className="font-bold">{user.displayName}</span>
        </Menu.Button>
        <Menu.Items className="hidden absolute -right-4 top-10 rounded bg-white shadow-lg w-[150px] py-1 ring-1 ring-black ring-opacity-5 lg:flex flex-col gap-1 z-10">
          <Menu.Item>
            <button className="text-gray-600 text-sm w-full text-left hover:bg-gray-100 px-4 py-2" onClick={logout}>
              Logout
            </button>
          </Menu.Item>
        </Menu.Items>
      </Menu>
      {inSidebar && (
        <button
          type="button"
          className="lg:hidden text-sm font-bold text-gray-400 border-2 border-gray-400 rounded-md p-1 w-full mt-4"
          onClick={logout}
        >
          Logout
        </button>
      )}
    </div>
  );
}
