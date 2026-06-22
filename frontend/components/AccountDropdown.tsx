import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import { User, Feather, LogOut } from "lucide-react";
import Avatar from "components/Avatar";
import { avatarFromProfile } from "lib/avatar";
import { useUser } from "providers/user";
import { Link, useLocation } from "react-router-dom";
import useFirebaseLogout from "hooks/useFirebaseLogout";
import { useProfile } from "providers/profile";
import { withReturnTo } from "lib/helpers";

type Props = {
  className?: string;
  dropUp?: boolean;
};

const itemClass = "gap-2 px-3 py-2.5 text-sm font-medium text-gray-700";

const AccountDropdown = ({ className, dropUp }: Props) => {
  const { user } = useUser();
  const profile = useProfile();
  const { lifelist } = profile;
  const lifelistCount = lifelist?.length || 0;
  const { logout } = useFirebaseLogout();
  const location = useLocation();
  const asPath = `${location.pathname}${location.search}`;

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={
          className || "rounded-full transition-all duration-200 hover:ring-2 hover:ring-gray-200 hover:ring-offset-2"
        }
      >
        <Avatar user={avatarFromProfile(profile)} size={28} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side={dropUp ? "top" : "bottom"} className="w-auto min-w-[240px] p-0">
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
          <Avatar user={avatarFromProfile(profile)} size={32} />
          <div className="text-sm">
            <p className="font-semibold">{profile.name}</p>
            {profile.email && <p className="text-gray-600">{profile.email}</p>}
          </div>
        </div>
        <div className="p-1">
          <DropdownMenuItem className={itemClass} render={<Link to="/account" />}>
            <User />
            <span>Account</span>
          </DropdownMenuItem>
          <DropdownMenuItem className={itemClass} render={<Link to={withReturnTo("/import-lifelist", asPath)} />}>
            <Feather />
            {lifelistCount > 0 ? (
              <span>
                <span>Update Life List</span>&nbsp;&nbsp;
                <span className="font-normal text-gray-500">({lifelistCount})</span>
              </span>
            ) : (
              <span>Import Life List</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem className={itemClass} onClick={logout}>
            <LogOut />
            <span>Logout</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountDropdown;
