import clsx from "clsx";
import Account from "components/Account";
import { useUI } from "providers/ui";

type Props = {
  className?: string;
  children?: React.ReactNode;
  noPadding?: boolean;
};

export default function Sidebar({ children, className, noPadding }: Props) {
  const { sidebarOpen } = useUI();

  return (
    <aside
      className={clsx(
        "flex flex-col h-[calc(100%_-_60px)] md:h-full w-80 md:ml-0 bg-[#1e263a] absolute md:relative shadow-2xl md:shadow-none transition-all z-10 overflow-y-auto dark-scrollbar",
        noPadding ? "" : "p-6",
        !sidebarOpen && "-ml-96",
        className
      )}
    >
      {children}
      <Account className={clsx(children && "mt-auto pt-4", "lg:hidden", noPadding ? "m-6" : "")} inSidebar />
    </aside>
  );
}
