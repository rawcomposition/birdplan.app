import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type Props = {
  datetime: string;
  [prop: string]: any;
};

export default function Timeago({ datetime, ...props }: Props) {
  const [timestamp, setTimestamp] = React.useState();
  React.useEffect(() => {
    //@ts-ignore
    const timer = setInterval(() => setTimestamp(dayjs()), 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  return (
    <time dateTime={datetime} {...props}>
      {dayjs(datetime).fromNow()}
    </time>
  );
}
