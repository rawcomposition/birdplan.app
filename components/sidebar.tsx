type Props = {
  open: boolean;
  children?: React.ReactNode;
};

export default function Sidebar({ open, children }: Props) {
  return (
    <aside
      className={`w-80 ${
        !open ? "-ml-96" : ""
      } md:ml-0 bg-[#1e263a] absolute md:relative shadow-2xl md:shadow-none transition-all z-10`}
    >
      <div className="p-6">{children}</div>
    </aside>
  );
}
