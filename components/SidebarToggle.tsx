import CogIcon from "icons/cog";

type Props = {
  [key: string]: any;
};

export default function SidebarToggle(props: Props) {
  return (
    <button type="button" className="text-2xl text-slate-700 px-5 md:hidden" {...props}>
      <CogIcon />
    </button>
  );
}
