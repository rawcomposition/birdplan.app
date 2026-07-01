import { Trip } from "@birdplan/shared";
import useDownloadGroupLifelist from "hooks/useDownloadGroupLifelist";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import Icon from "components/Icon";
import { Button } from "components/ui/button";
import { Download } from "lucide-react";

type Props = {
  trip?: Trip | null;
};

export default function TargetsOptionsDropdown({ trip }: Props) {
  const { isGroup, download } = useDownloadGroupLifelist(trip);

  const items = [
    {
      name: "Download group life list",
      icon: <Download />,
      onClick: download,
      hidden: !isGroup,
    },
  ].filter((it) => !it.hidden);

  if (!items.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline-white" size="icon-lg" />}
        title="Options"
      >
        <Icon name="verticalDots" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-[220px]">
        {items.map(({ name, icon, onClick }) => (
          <DropdownMenuItem key={name} onClick={onClick}>
            {icon}
            <span>{name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
