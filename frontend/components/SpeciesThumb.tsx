import clsx from "clsx";
import { useSpeciesImages } from "hooks/useSpeciesImages";

type Props = {
  code: string;
  name: string;
  className?: string;
};

export default function SpeciesThumb({ code, name, className }: Props) {
  const { getSpeciesImg } = useSpeciesImages();
  const img = getSpeciesImg(code);

  if (!img) return <div className={clsx("aspect-4/3 rounded bg-gray-200", className)} />;

  return (
    <img
      src={img.url}
      alt={name}
      className={clsx("aspect-4/3 rounded object-cover", className)}
      loading="lazy"
      title={img.by ? `Photo by ${img.by}` : ""}
    />
  );
}
