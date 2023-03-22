import clsx from "clsx";
import Account from "components/Account";
import { useUI } from "providers/ui";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export default function Sidebar({ children, className }: Props) {
  const { sidebarOpen } = useUI();

  return (
    <aside
      className={clsx(
        "h-[calc(100vh_-_60px)] w-80 md:ml-0 bg-[#1e263a] absolute md:relative shadow-2xl md:shadow-none transition-all z-10 overflow-auto dark-scrollbar",
        !sidebarOpen && "-ml-96",
        className
      )}
    >
      <div className="flex flex-col p-6 h-full">
        {children}
        <Account className={clsx(children && "mt-auto", "lg:hidden")} />
      </div>
    </aside>
  );
}
