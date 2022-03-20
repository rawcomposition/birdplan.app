import images from "../images.json";

export default function SpeciesImage({sciName}) {
	const url = images[sciName] || "/placeholder.png";

	return (
		<div className="flex-shrink-0">
			<img loading="lazy" src={url} width="150" height="150" className={`object-cover rounded p-4 w-[140px] h-[140px] xs:w-[150px] xs:h-[150px] ${!images[sciName] ? "opacity-50" : ""}`}/>
		</div>
	)
}