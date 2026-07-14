import clsx from "clsx";

type Props = {
  img?: { url: string; by?: string };
  name: string;
  className?: string;
};

export default function SpeciesThumb({ img, name, className }: Props) {
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
