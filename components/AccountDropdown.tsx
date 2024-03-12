import React from "react";
import { Menu, Transition } from "@headlessui/react";
import Icon from "components/Icon";
import { useUser } from "providers/user";
import Link from "next/link";
import clsx from "clsx";
import useFirebaseLogout from "hooks/useFirebaseLogout";

type Props = {
  className?: string;
  dropUp?: boolean;
};

const AccountDropdown = ({ className, dropUp }: Props) => {
  const { user } = useUser();
  const { logout } = useFirebaseLogout();

  if (!user) return null;

  return (
    <Menu as="div" className="relative z-20 flex-shrink-0">
      <Menu.Button
        className={
          className || "rounded-full transition-all duration-200 hover:ring-2 hover:ring-gray-200 hover:ring-offset-2"
        }
      >
        {user.photoURL && <img src={user.photoURL} className="h-7 w-7 object-cover rounded-full opacity-85" />}
      </Menu.Button>

      <Transition>
        <Transition.Child
          enter="transition duration-200 ease-out"
          enterFrom="scale-95 opacity-0"
          enterTo="scale-100 opacity-100"
          leave="transition duration-150 ease-in"
          leaveFrom="scale-100 opacity-100"
          leaveTo="scale-95 opacity-0"
          className={clsx(
            dropUp ? "bottom-24 right-4" : "right-2 top-9 ",
            "absolute  z-50 min-w-[240px] origin-top-right overflow-hidden rounded-lg border border-gray-200 bg-white text-gray-700 shadow-lg"
          )}
        >
          <Menu.Items>
            <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
              {user.photoURL && <img src={user.photoURL} className="h-[32px] w-[32px] object-cover rounded-full" />}
              <div className="text-sm">
                <p className="font-semibold">{user?.displayName}</p>
                {user.email && <p className="text-gray-600">{user.email}</p>}
              </div>
            </div>
            <Menu.Item>
              <Link
                className="flex items-center gap-2 border-b border-gray-200 p-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                href="/account"
              >
                <Icon name="user" />
                <span>Account</span>
              </Link>
            </Menu.Item>
            <Menu.Item>
              <button
                type="button"
                className="w-full flex items-center gap-2 border-b border-gray-200 p-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={logout}
              >
                <Icon name="logout" />
                <span>Logout</span>
              </button>
            </Menu.Item>
          </Menu.Items>
        </Transition.Child>
      </Transition>
    </Menu>
  );
};

export default AccountDropdown;
