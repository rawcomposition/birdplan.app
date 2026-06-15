import Icon from "components/Icon";

export const EBIRD_LIFELIST_URL = "https://ebird.org/lifelist?r=world&time=life&fmt=csv";

export default function EbirdDownloadLink({ className }: { className?: string }) {
  return (
    <a
      href={EBIRD_LIFELIST_URL}
      target="_blank"
      rel="noreferrer"
      className={`whitespace-nowrap text-sm font-medium text-sky-600 ${className || ""}`}
    >
      Download from eBird <Icon name="external" className="text-xs" />
    </a>
  );
}
