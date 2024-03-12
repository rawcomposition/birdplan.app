import React from "react";
import Link from "next/link";
import Icon from "components/Icon";
import useRealtimeStatus from "hooks/useRealtimeStatus";
import clsx from "clsx";
import { useRouter } from "next/router";
import { useTrip } from "providers/trip";
import { useModal } from "providers/modals";
import { useUser } from "providers/user";
import AccountDropdown from "components/AccountDropdown";
import BreadcrumbArrow from "components/BreadcrumbArrow";

type Props = {
  title?: string;
  parent?: {
    title: string;
    href: string;
  };
};

export default function Header({ title, parent }: Props) {
  const { isOnline } = useRealtimeStatus();
  const { isOwner } = useTrip();
  const { open, close } = useModal();
  const { user } = useUser();
  const shareRef = React.useRef<HTMLButtonElement>(null);

  const router = useRouter();
  const isSubPage = router.pathname !== "/trips";

  const handleShare = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    open("share");
  };

  return (
    <header className="bg-slate-900 h-[60px] shrink-0 flex items-center" onClick={close}>
      {!isOnline && (
        <div className="bg-red-500 text-white px-2 py-0.5 text-xs absolute text-center w-full left-0 top-14 z-20">
          No Internet Connection
        </div>
      )}
      <Link
        href={user?.uid ? "/trips" : "/"}
        className={clsx("sm:w-60 flex items-center flex-shrink-0", isSubPage && "hidden md:flex")}
      >
        <img src="/icon.png" className="w-[50px] mx-4" width="50" height="50" />
        <h1 className="text-center text-[#757c8c] font-logo text-2xl">BirdPlan.app</h1>
      </Link>
      {isSubPage && (
        <Link href={user?.uid ? "/trips" : "/"} className="md:hidden pl-3 pr-5 py-3">
          <Icon name="angleLeft" className="text-gray-500 text-2xl flex items-center" />
        </Link>
      )}
      <div className="mr-auto gap-8 items-center flex min-w-0">
        {title && (
          <nav className="text-lg flex items-center min-w-0">
            {parent && (
              <>
                <Link href={parent.href} className="text-gray-400 px-5 py-1.5 hidden md:flex items-center">
                  {parent.title}
                </Link>
                <BreadcrumbArrow className="hidden md:block" />
              </>
            )}
            <h1 className="text-gray-400 pr-5 md:pl-5 py-1.5 truncate">{title}</h1>
          </nav>
        )}
      </div>
      {isOwner && (
        <button
          type="button"
          className="rounded-full border text-accent/90 border-accent/90 py-1 px-4 hidden lg:inline-block ml-auto mr-8 hover:border-accent hover:text-accent"
          onClick={handleShare}
          ref={shareRef}
        >
          Share
        </button>
      )}
      <AccountDropdown className="ml-auto md:ml-0 sm:mr-8 mr-6 block" />
    </header>
  );
}
