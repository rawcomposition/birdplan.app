export default function Input({children, type = "text", ...props}) {
	return <input type={type} className="py-2 px-3 mt-2 border border-gray-300 focus:ring-slate-500 focus:border-slate-500 block w-full shadow-sm sm:text-sm rounded-md" {...props}/>
}