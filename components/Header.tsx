import Link from "next/link";
import { useUser } from "providers/user";
import BreadcrumbArrow from "icons/breadcrumb-arrow";
import { Menu } from "@headlessui/react";
import useFirebaseLogout from "hooks/useFirebaseLogout";

type Props = {
  title?: string;
  parent?: {
    title: string;
    href: string;
  };
};

export default function Header({ title, parent }: Props) {
  const { user } = useUser();
  const { logout } = useFirebaseLogout();

  return (
    <header className="bg-slate-900 h-[60px] shrink-0 flex items-center">
      <div className="w-80 flex items-center">
        <img src="/icon.png" className="w-[50px] mx-4" width="50" height="50" />
        <h1 className="text-center text-[#757c8c] font-logo text-2xl">bird planner</h1>
      </div>
      <div className="mr-auto">
        {title && (
          <nav className="text-lg flex items-center">
            {parent && (
              <>
                <Link href={parent.href} className="text-gray-400 px-5 py-1.5 flex items-center">
                  {parent.title}
                </Link>
                <BreadcrumbArrow />
              </>
            )}
            <h1 className="text-gray-400 px-5 py-1.5 flex items-center">{title}</h1>
          </nav>
        )}
      </div>
      {user && (
        <div className="relative inline-block mr-8">
          <Menu>
            <Menu.Button className="text-gray-400 gap-3 flex items-center">
              {user.photoURL && (
                <img src={user.photoURL} className="w-[32px] h-[32px] object-cover rounded-full opacity-85" />
              )}
              <span className="font-bold">{user.displayName}</span>
            </Menu.Button>
            <Menu.Items className="absolute -right-4 top-10 rounded bg-white shadow-lg w-[150px] py-1 ring-1 ring-black ring-opacity-5 flex flex-col gap-1 z-10">
              <Menu.Item>
                <button className="text-gray-600 text-sm w-full text-left hover:bg-gray-100 px-4 py-2" onClick={logout}>
                  Logout
                </button>
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      )}
    </header>
  );
}
