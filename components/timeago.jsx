import * as React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export default function Timeago({datetime, ...props}) {
	const [timestamp, setTimestamp] = React.useState();
	React.useEffect(() => {
		const timer = setInterval(() => setTimestamp(dayjs()), 1000 * 60);
		return () => clearInterval(timer);
	}, []);

	return <time dateTime={datetime} {...props}>{dayjs(datetime).fromNow()}</time>
}