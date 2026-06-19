import { Trip } from "@birdplan/shared";
import SelectDropdown from "components/SelectDropdown";
import useTargetView from "hooks/useTargetView";

type Props = {
  trip?: Trip | null;
  compact?: boolean;
  align?: "left" | "right";
  className?: string;
};

export default function TargetViewToggle({ trip, compact, align, className }: Props) {
  const { canChoose, view, setView } = useTargetView(trip);

  if (!canChoose) return null;

  return (
    <SelectDropdown
      className={className}
      compact={compact}
      align={align}
      value={view}
      onChange={setView}
      options={[
        { value: "group", label: "Group targets" },
        { value: "personal", label: "Personal targets" },
      ]}
    />
  );
}
