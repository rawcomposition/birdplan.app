import React from "react";

type HeroImage = {
  src: string;
  location?: string;
  photographer?: string;
};

const heroImages: HeroImage[] = [
  { src: "/example.jpg", location: "Armash Fish Ponds, Armenia", photographer: "Levon Aghasyan" },
];

export default function CreateTripHero() {
  const [image] = React.useState(() => heroImages[Math.floor(Math.random() * heroImages.length)]);
  const hasCredit = !!(image.location || image.photographer);

  return (
    <aside
      className="absolute inset-y-0 right-0 hidden overflow-hidden lg:block"
      style={{ left: "calc(max((100vw - 80rem) / 2, 0px) + 36rem + 3rem)" }}
    >
      <img src={image.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div
        className="absolute inset-x-0 bottom-0 h-[42%]"
        style={{ background: "linear-gradient(180deg,transparent,rgba(20,14,12,.55) 55%,rgba(13,9,8,.92))" }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 92% at 50% 38%,transparent 54%,rgba(0,0,0,.42))" }}
      />
      {hasCredit && (
        <div className="absolute bottom-5 left-5 flex items-center gap-2.5 rounded-[13px] bg-black/40 px-3.5 py-2.5 backdrop-blur-sm">
          <span className="text-sm">📷</span>
          <div className="leading-tight">
            {image.location && <div className="text-[13px] font-bold text-white">{image.location}</div>}
            {image.photographer && (
              <div className="text-[11px] font-medium text-white/80">Photo by {image.photographer}</div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
