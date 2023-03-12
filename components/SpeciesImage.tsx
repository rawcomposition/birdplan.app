import images from "lib/images.json";

type Props = {
  sciName: string;
};

export default function SpeciesImage({ sciName }: Props) {
  //@ts-ignore
  const img = images[sciName];
  const url = img || "/placeholder.png";

  return (
    <div className="flex-shrink-0">
      <img
        loading="lazy"
        src={url}
        width="150"
        height="150"
        className={`object-cover rounded p-4 w-[140px] h-[140px] xs:w-[150px] xs:h-[150px] ${!img ? "opacity-50" : ""}`}
      />
    </div>
  );
}
