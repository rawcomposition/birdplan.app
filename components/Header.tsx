import Link from "next/link";
import BreadcrumbArrow from "icons/breadcrumb-arrow";
import useRealtimeStatus from "hooks/useRealtimeStatus";
import Account from "components/Account";
import Bars from "icons/Bars";
import { useUI } from "providers/ui";

type Props = {
  title?: string;
  parent?: {
    title: string;
    href: string;
  };
};

export default function Header({ title, parent }: Props) {
  const { isOnline } = useRealtimeStatus();
  const { toggleSidebar, closeSidebar } = useUI();

  return (
    <header className="bg-slate-900 h-[60px] shrink-0 flex items-center">
      <Link href="/" className="w-80 flex items-center" onClick={closeSidebar}>
        <img src="/icon.png" className="w-[50px] mx-4" width="50" height="50" />
        <h1 className="text-center text-[#757c8c] font-logo text-2xl">bird planner</h1>
      </Link>
      <div className="mr-auto gap-8 items-center hidden md:flex">
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
        {!isOnline && <div className="bg-red-500 text-white px-2 py-1 rounded text-xs">No Internet Connection</div>}
      </div>
      <Account className="lg:inline-block hidden" />
      <button className="lg:hidden text-gray-500 text-2xl ml-auto mr-5 flex items-center" onClick={toggleSidebar}>
        <Bars />
      </button>
    </header>
  );
}
