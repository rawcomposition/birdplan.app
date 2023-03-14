import Link from "next/link";
import { useUser } from "providers/user";
import Avatar from "components/Avatar";
import BreadcrumbArrow from "icons/breadcrumb-arrow";

type Props = {
  title: string;
  parent?: {
    title: string;
    href: string;
  };
};

export default function Header({ title, parent }: Props) {
  const { user } = useUser();

  return (
    <header className="bg-slate-900 h-[60px] shrink-0 flex items-center">
      <div className="w-80 flex items-center">
        <img src="/icon.png" className="w-[50px] mx-4" width="50" height="50" />
        <h1 className="text-center text-[#757c8c] font-logo text-2xl">bird planner</h1>
      </div>
      <div className="mr-auto">
        {
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
        }
      </div>
      {user && (
        <div className="text-gray-400 gap-3 mr-6 flex items-center">
          <Avatar />
          <div className="flex flex-col">
            <span className="font-bold">{user.displayName}</span>
            <span className="text-xs">My Account</span>
          </div>
        </div>
      )}
    </header>
  );
}
