import CogIcon from "../icons/cog";

export default function SidebarToggle(props) {
	return (
		<button type="button" className="text-2xl text-slate-700 px-5 md:hidden" {...props}>
			<CogIcon/>
		</button>
	);
}