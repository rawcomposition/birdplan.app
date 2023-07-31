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
      {isEditing ? (
        <div className="mt-6 -mx-2">
          <TextareaAutosize
            placeholder="Notes..."
            className="mt-1 input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
            minRows={1}
            maxRows={15}
          />
        </div>
      ) : (
        <div className="mt-6 text-gray-700 text-sm relative group whitespace-pre-wrap">{notes || "No notes"}</div>
      )}
      <div className="-mt-1 -ml-3">
        {showToggleBtn && (
          <button
            type="button"
            onClick={() => setIsEditing((isEditing) => !isEditing)}
            className="text-sky-600 text-[12px] font-bold px-3 py-1"
          >
            {isEditing ? "Done" : "Edit"}
          </button>
        )}
      </div>
    </>
  );
}
