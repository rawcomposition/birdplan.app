import Button from "./button";

export default function Submit({loading, children, ...props}) {
	return <Button type="submit" {...props}>{loading ? "..." : children }</Button>
}