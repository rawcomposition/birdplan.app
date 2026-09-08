import Icon from "components/Icon";
import { Button } from "components/ui/button";

type Props = {
  onRemove?: () => void;
  removeLabel?: string;
};

export default function DeletedHotspotNotice({ onRemove, removeLabel = "Remove" }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 mb-5 text-sm text-gray-600">
      <Icon name="xMarkCircle" className="text-gray-400 text-lg shrink-0" />
      <span className="grow">This hotspot no longer exists on eBird.</span>
      {onRemove && (
        <Button variant="outline-white" size="sm" type="button" onClick={onRemove}>
          {removeLabel}
        </Button>
      )}
    </div>
  );
}
