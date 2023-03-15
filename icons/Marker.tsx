type Props = {
  color: string;
  className?: string;
  showStroke?: boolean;
};

export default function Marker({ className, showStroke, color }: Props) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="-15 -15 418 547"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      className={className || ""}
    >
      <g transform="matrix(1,0,0,1,2,2.5)">
        <path
          stroke="#555"
          strokeWidth={showStroke ? 20 : 0}
          stroke-alignment="inner"
          d="M384,192C384,279.4 267,435 215.7,499.2C203.4,514.5 180.6,514.5 168.3,499.2C116.1,435 0,279.4 0,192C0,85.96 85.96,0 192,0C298,0 384,85.96 384,192Z"
          fill={color}
        />
      </g>
    </svg>
  );
}
