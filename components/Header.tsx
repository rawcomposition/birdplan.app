import Link from "next/link";
import BreadcrumbArrow from "icons/BreadcrumbArrow";
import useRealtimeStatus from "hooks/useRealtimeStatus";
import Account from "components/Account";
import Bars from "icons/Bars";
import { useUI } from "providers/ui";
import clsx from "clsx";
import { useRouter } from "next/router";
import { useTrip } from "providers/trip";
import AngleLeft from "icons/AngleLeft";
import { useModal } from "providers/modals";
import { useUser } from "providers/user";

type Props = {
  title?: string;
  showAccountOnSmScreens?: boolean;
  parent?: {
    title: string;
    href: string;
  };
};

export default function Header({ title, parent, showAccountOnSmScreens }: Props) {
  const { isOnline } = useRealtimeStatus();
  const { toggleSidebar, closeSidebar } = useUI();
  const { isOwner } = useTrip();
  const { open, close } = useModal();
  const { user } = useUser();

  const router = useRouter();
  const isSubPage = router.pathname !== "/trips";

  return (
    <header className="bg-slate-900 h-[60px] shrink-0 flex items-center" onClick={close}>
      {!isOnline && (
        <div className="bg-red-500 text-white px-2 py-0.5 text-xs absolute text-center w-full left-0 top-14 z-20">
          No Internet Connection
        </div>
      )}
      <Link
        href={user?.uid ? "/trips" : "/"}
        className={clsx("w-80 flex items-center", isSubPage && "hidden md:flex")}
        onClick={closeSidebar}
      >
        <img src="/icon.png" className="w-[50px] mx-4" width="50" height="50" />
        <h1 className="text-center text-[#757c8c] font-logo text-2xl">bird planner</h1>
      </Link>
      {isSubPage && (
        <Link href={user?.uid ? "/trips" : "/"} className="md:hidden pl-3 pr-5 py-3" onClick={closeSidebar}>
          <AngleLeft className="text-gray-500 text-2xl flex items-center" />
        </Link>
      )}
      <div className="mr-auto gap-8 items-center flex">
        {title && (
          <nav className="text-lg flex items-center">
            {parent && (
              <>
                <Link href={parent.href} className="text-gray-400 px-5 py-1.5 hidden md:flex items-center">
                  {parent.title}
                </Link>
                <BreadcrumbArrow className="hidden md:block" />
              </>
            )}
            <h1 className="text-gray-400 pr-5 md:pl-5 py-1.5 flex items-center">{title}</h1>
          </nav>
        )}
      </div>
      {isOwner && (
        <button
          type="button"
          className="rounded-full border text-accent/90 border-accent/90 py-1 px-4 hidden lg:inline-block ml-auto mr-8 hover:border-accent hover:text-accent"
          onClick={() => open("share")}
        >
          Share
        </button>
      )}
      <Account
        className={clsx("ml-auto md:ml-0 hidden mr-8", showAccountOnSmScreens ? "sm:inline-block" : "lg:inline-block")}
      />
      <button
        className={clsx(
          showAccountOnSmScreens ? "sm:hidden" : "md:hidden",
          "text-gray-500 text-2xl ml-auto mr-5 flex items-center"
        )}
        onClick={toggleSidebar}
      >
        <Bars />
      </button>
    </header>
  );
}
