export default function MainContent({shouldRender = true, children, ...props}) {
	if (!shouldRender) {
		return "";
	}

	return (
		<div className="h-screen overflow-auto grow pt-6 px-4" {...props}>
			<div className="container mx-auto max-w-xl">
				{children}
			</div>
		</div>
	)
}