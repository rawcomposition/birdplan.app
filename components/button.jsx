export default function Button({className, type="button", size="md", color="default", children, ...props}) {
	const colors = {
		default: "bg-slate-600 hover:bg-slate-700 focus:ring-slate-500",
		red: "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500",
	}
	const sizes = {
		sm: "py-1 px-4",
		md: "py-2 px-4",
	}
	return <button type={type} className={`flex justify-center border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${sizes[size]} ${colors[color]} ${className}`} {...props}>{children}</button>
}