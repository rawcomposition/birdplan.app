import React from "react";

type Props = {
  count?: number;
};

export default function Skeleton({ count = 1 }: Props) {
  const item = (
    <article className="border border-gray-200 bg-white shadow-sm rounded-md w-full">
      <div className="animate-pulse flex">
        <div className="flex-shrink-0">
          <img
            src="/placeholder.png"
            width="150"
            height="150"
            className="object-cover rounded m-4 w-16 h-16 opacity-50"
          />
        </div>
        <div className="flex-1 pt-8 pr-4 flex-shrink">
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-16">
              <div className="h-3 bg-slate-200 rounded col-span-2"></div>
              <div className="h-3 bg-slate-200 rounded col-span-1"></div>
            </div>
            <div className="h-3 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    </article>
  );

  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }, (e, i) => (
        <React.Fragment key={i}>{item}</React.Fragment>
      ))}
    </div>
  );
}
