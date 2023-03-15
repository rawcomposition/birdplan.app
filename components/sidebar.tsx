import clsx from "clsx";

type Props = {
  open: boolean;
  children?: React.ReactNode;
};

export default function Sidebar({ open, children }: Props) {
  return (
    <aside
      className={clsx(
        "h-[calc(100vh_-_60px)] w-80 md:ml-0 bg-[#1e263a] absolute md:relative shadow-2xl md:shadow-none transition-all z-10 overflow-auto dark-scrollbar",
        !open && "-ml-96"
      )}
    >
      <div className="p-6">{children}</div>
    </aside>
  );
}
