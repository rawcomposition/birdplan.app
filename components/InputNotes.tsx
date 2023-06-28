import React from "react";
import { useTrip } from "providers/trip";
import TextareaAutosize from "react-textarea-autosize";

type Props = {
  value?: string;
  onBlur: (value: string) => void;
};

export default function InputNotes({ value, onBlur }: Props) {
  const [canRender, setCanRender] = React.useState(false);
  const { canEdit } = useTrip();
  const [notes, setNotes] = React.useState(value);
  const [isEditing, setIsEditing] = React.useState(!notes && canEdit);

  const showToggleBtn = canEdit && ((isEditing && !!notes) || !isEditing);

  React.useEffect(() => {
    // Hack to prevent modal not fading in
    setTimeout(() => {
      setCanRender(true);
    }, 0);
  }, []);

  if (!canRender) return null;

  return (
    <>
      <div className="flex items-center gap-3 mt-6">
        <h3 className="text-gray-700 font-bold">Notes</h3>
        {showToggleBtn && (
          <button
            type="button"
            onClick={() => setIsEditing((isEditing) => !isEditing)}
            className="text-sky-600 text-[13px] font-bold px-2 border border-sky-600 rounded hover:text-sky-700 hover:border-sky-700 transition-colors"
          >
            {isEditing ? "Done" : "Edit"}
          </button>
        )}
      </div>
      {isEditing ? (
        <div className="-mx-2">
          <TextareaAutosize
            className="mt-1 input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
            minRows={2}
            maxRows={15}
          />
        </div>
      ) : (
        <div className="mt-1 text-gray-700 text-sm relative group whitespace-pre">{notes || "No notes"}</div>
      )}
    </>
  );
}
