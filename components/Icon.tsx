import { icons, IconNameT } from "lib/icons";

type Props = {
  name: IconNameT;
  className?: string;
};

export default function Icon({ name, className }: Props) {
  const icon = icons[name];
  if (!icon) return null;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={icon.viewbox} className={`icon ${className || ""}`}>
      <path d={icon.path} />
    </svg>
  );
}
