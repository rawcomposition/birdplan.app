import AnimatedArrow from "../components/animated-arrow";

export default function WelcomeMessage() {
	return (
		<div className="text-center flex flex-col gap-2 my-6">
			<h3 className="text-3xl font-bold text-slate-500 text-shadow">Looking for rare birds?</h3>
			<p className="text-gray-500 font-bold">Enter a location to get started</p>
			<AnimatedArrow/>
		</div>
	);
}