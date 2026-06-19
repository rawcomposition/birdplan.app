import Icon from "components/Icon";

export const EBIRD_WORLD_LIFELIST_URL = "https://ebird.org/lifelist?r=world&time=life&fmt=csv";
export const EBIRD_LIFELIST_URL = "https://ebird.org/lifelist";

export default function EbirdDownloadLink({ className, world }: { className?: string; world?: boolean }) {
  return (
    <a
      href={world ? EBIRD_WORLD_LIFELIST_URL : EBIRD_LIFELIST_URL}
      target="_blank"
      rel="noreferrer"
      className={`whitespace-nowrap text-sm font-medium text-sky-600 ${className || ""}`}
    >
      Download from eBird <Icon name="external" className="text-xs" />
    </a>
  );
}
