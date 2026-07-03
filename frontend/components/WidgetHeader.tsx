import { Link } from "react-router-dom";

type Props = {
  title: string;
  action?: { label: string; to: string };
};

export default function WidgetHeader({ title, action }: Props) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-3">
      <h2 className="text-xs font-bold tracking-widest text-foreground uppercase">{title}</h2>
      {action && (
        <Link to={action.to} className="text-xs font-bold text-link">
          {action.label}
        </Link>
      )}
    </div>
  );
}
