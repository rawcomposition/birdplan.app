import { cn } from "lib/utils";
import Icon from "components/Icon";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "components/ui/dropdown-menu";

export type SelectOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  label?: string;
  compact?: boolean;
  align?: "left" | "right";
  className?: string;
};

export default function SelectDropdown<T extends string>({
  value,
  onChange,
  options,
  label,
  compact,
  align = "right",
  className,
}: Props<T>) {
  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center rounded-full border bg-card text-secondary-foreground hover:bg-muted/50 whitespace-nowrap",
          compact ? "h-6 gap-1 px-2.5 text-xs" : "h-9 gap-1.5 px-3 text-sm",
          className
        )}
      >
        {label && <span className="text-muted-foreground">{label}</span>}
        <span className={label ? "font-semibold text-foreground" : "font-medium text-secondary-foreground"}>
          {current?.label}
        </span>
        <Icon name="angleDown" className={cn("text-muted-foreground", compact ? "text-[9px]" : "text-[10px]")} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align === "right" ? "end" : "start"} className="min-w-[200px]">
        <DropdownMenuRadioGroup value={value} onValueChange={(next) => onChange(next as T)}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
