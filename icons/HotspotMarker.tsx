type Props = {
  color: string;
  className?: string;
  showStroke?: boolean;
  lightIcon?: boolean;
};

export default function HotspotMarker({ className, showStroke, color, lightIcon }: Props) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 -10 388 560"
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
      <g transform="matrix(0.464051,0,0,0.464051,215,230)">
        <g transform="matrix(1,0,0,1,-306,-306)">
          <clipPath id="_clip1">
            <rect x="0" y="0" width="611.999" height="611.999" />
          </clipPath>
          <g clip-path="url(#_clip1)">
            <g>
              <path
                fill={lightIcon ? "#eee" : "#555"}
                className="scale-90"
                d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
