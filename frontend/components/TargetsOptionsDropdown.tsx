import { Trip } from "@birdplan/shared";
import useDownloadGroupLifelist from "hooks/useDownloadGroupLifelist";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import Icon from "components/Icon";

type Props = {
  trip?: Trip | null;
};

export default function TargetsOptionsDropdown({ trip }: Props) {
  const { isGroup, download } = useDownloadGroupLifelist(trip);

  const items = [
    {
      name: "Download group life list",
      icon: "download",
      onClick: download,
      hidden: !isGroup,
    },
  ].filter((it) => !it.hidden);

  if (!items.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-xs hover:bg-gray-50"
        title="Options"
      >
        <Icon name="verticalDots" className="text-lg" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-[220px]">
        {items.map(({ name, icon, onClick }) => (
          <DropdownMenuItem key={name} onClick={onClick}>
            <Icon name={icon as any} />
            <span>{name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
