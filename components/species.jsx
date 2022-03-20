import ObservationList from "../components/observation-list";

export default function Species({isExpanded, reports, userLat, userLng, props}) {
	
	return (
		<article className="mb-4 border border-gray-200 bg-white shadow-sm rounded-md w-full" {...props}>
			<div className="flex">
				{children}
			</div>
			{isExpanded && <ul className="pl-4 pr-4 pb-4 flex flex-col gap-4">
				<ObservationList items={reports} userLat={userLat} userLng={userLng}/>
			</ul>}
		</article>
	)
}