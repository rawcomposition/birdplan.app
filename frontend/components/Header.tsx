import React from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from "components/Icon";
import { Button } from "components/ui/button";
import { Share2 } from "lucide-react";
import useRealtimeStatus from "hooks/useRealtimeStatus";
import clsx from "clsx";
import { useTrip } from "hooks/useTrip";
import { useModal } from "stores/modals";
import { useUser } from "hooks/useUser";
import AccountDropdown from "components/AccountDropdown";
import BreadcrumbArrow from "components/BreadcrumbArrow";
import Logo from "components/Logo";

type Props = {
  title?: string;
  border?: boolean;
  parent?: {
    title: string;
    href: string;
  };
};

export default function Header({ title, parent, border }: Props) {
  const { isOnline } = useRealtimeStatus();
  const { canEdit } = useTrip();
  const { close, open } = useModal();
  const { user } = useUser();

  const isSubPage = useLocation().pathname !== "/trips";

  const handleShare = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    open("share");
  };

  return (
    <header
      className={clsx("bg-white h-[60px] shrink-0 flex items-center print:hidden", border && "border-b border-gray-100")}
      onClick={close}
    >
      {!isOnline && (
        <div className="bg-red-500 text-white px-2 py-0.5 text-xs absolute text-center w-full left-0 top-14 z-20">
          No Internet Connection
        </div>
      )}
      <Link
        to={user?._id ? "/trips" : "/"}
        className={clsx("sm:w-60 flex items-center shrink-0", isSubPage && "hidden md:flex")}
      >
        <Logo className="w-[50px] mr-4 ml-6 mb-[-2px]" />
        <h1 className="text-center text-gray-700 font-logo text-2xl">BirdPlan.app</h1>
      </Link>
      {isSubPage && (
        <Link to={user?._id ? "/trips" : "/"} className="md:hidden pl-3 pr-5 py-3">
          <Icon name="angleLeft" className="text-gray-500 text-2xl flex items-center" />
        </Link>
      )}
      <div className="mr-auto gap-8 items-center flex min-w-0">
        {title && (
          <nav className="flex items-center min-w-0">
            {parent && (
              <>
                <Link to={parent.href} className="text-gray-600 px-5 py-1.5 hidden md:flex items-center font-medium">
                  {parent.title}
                </Link>
                <BreadcrumbArrow className="hidden md:block" />
              </>
            )}
            <h1 className="text-gray-600 pr-5 md:pl-5 py-1.5 truncate font-medium">{title}</h1>
          </nav>
        )}
      </div>
      {canEdit && (
        <Button type="button" variant="outline-white" size="sm" className="ml-auto mr-3 sm:mr-4" onClick={handleShare}>
          <Share2 className="size-4" />
          <span className="hidden xs:inline">Share</span>
        </Button>
      )}
      <AccountDropdown className="ml-auto md:ml-0 sm:mr-8 mr-6 flex items-center" />
    </header>
  );
}
