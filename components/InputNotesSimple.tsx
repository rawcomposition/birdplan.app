import React from "react";
import TextareaAutosize from "react-textarea-autosize";

type Props = {
  value?: string;
  onBlur: (value: string) => void;
  className?: string;
  canEdit?: boolean;
  showDone?: boolean;
};

export default function InputNotesSimple({ value, onBlur, className, canEdit, showDone }: Props) {
  const [notes, setNotes] = React.useState(value);
  const [showInput, setShowInput] = React.useState<boolean>();
  const notsRef = React.useRef<HTMLTextAreaElement>(null);

  const inEditMode = showDone ? canEdit && showInput : (canEdit && !!notes) || (canEdit && showInput);

  const handleBlur = (value: string) => {
    onBlur(value);
    if (!value) setShowInput(false);
  };

  return (
    <div className={className}>
      {inEditMode ? (
        <TextareaAutosize
          placeholder="Notes..."
          className="input"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={(e) => handleBlur(e.target.value)}
          minRows={1}
          maxRows={15}
          ref={notsRef}
        />
      ) : (
        <div className="text-gray-700 text-sm relative group whitespace-pre-wrap">{notes || ""}</div>
      )}
      <div className="-mt-1 -ml-3">
        {!inEditMode && canEdit && (
          <button
            type="button"
            onClick={() => {
              setShowInput(true);
              setTimeout(() => {
                notsRef.current?.focus();
              }, 0);
            }}
            className="text-sky-600 text-[12px] font-bold px-3 py-1"
          >
            {notes ? "Edit" : "Add notes"}
          </button>
        )}
        {showDone && inEditMode && (
          <button
            type="button"
            onClick={() => setShowInput(false)}
            className="text-sky-600 text-[12px] font-bold px-3 py-1"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}
