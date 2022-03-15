export default function Submit({loading, className, children}) {
	return <button type="submit" className={`w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 ${className}`}>{loading ? "..." : children }</button>
}