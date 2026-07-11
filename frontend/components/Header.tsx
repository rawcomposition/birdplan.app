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
  border?: boolean;
};

export default function Header({ border }: Props) {
  const { isOnline } = useRealtimeStatus();
  const { canEdit, trip } = useTrip();
  const { close, open } = useModal();
  const { user } = useUser();

  const isSubPage = useLocation().pathname !== "/trips";
  const tripsHref = user?._id ? "/trips" : "/";

  const handleShare = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    open("share");
  };

  return (
    <>
      {!isOnline && (
        <div className="bg-gray-800 text-gray-100 text-xs py-1 flex items-center justify-center gap-1.5 shrink-0 print:hidden">
          <span className="size-1.5 rounded-full bg-warning" />
          You're offline
        </div>
      )}
      <header
        className={clsx("bg-white h-[60px] shrink-0 flex items-center print:hidden", border && "border-b border-gray-100")}
        onClick={close}
      >
        <Link
          to={user?._id ? "/trips" : "/"}
          className={clsx("sm:w-60 flex items-center shrink-0", isSubPage && "hidden md:flex")}
        >
          <Logo className="w-[50px] mr-4 ml-6 mb-[-2px]" />
          <h1 className="text-center text-gray-700 font-logo text-2xl">BirdPlan.app</h1>
        </Link>
        {isSubPage && (
          <Link to={tripsHref} className="md:hidden pl-3 pr-5 py-3">
            <Icon name="angleLeft" className="text-gray-500 text-2xl flex items-center" />
          </Link>
        )}
        <div className="mr-auto gap-8 items-center flex min-w-0">
          {trip && (
            <nav className="flex items-center min-w-0">
              <Link to={tripsHref} className="text-gray-600 px-5 py-1.5 hidden md:flex items-center font-medium">
                Trips
              </Link>
              <BreadcrumbArrow className="hidden md:block" />
              <h1 className="text-gray-600 pr-5 md:pl-5 py-1.5 truncate font-medium">{trip.name}</h1>
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
    </>
  );
}
