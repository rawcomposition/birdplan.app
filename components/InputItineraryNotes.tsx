import React from "react";
import TextareaAutosize from "react-textarea-autosize";

type Props = {
  value?: string;
  onBlur: (value: string) => void;
  className?: string;
  canEdit?: boolean;
};

export default function InputItineraryNotes({ value, onBlur, className, canEdit }: Props) {
  const [notes, setNotes] = React.useState(value);
  const [showInput, setShowInput] = React.useState<boolean>();
  const notsRef = React.useRef<HTMLTextAreaElement>(null);

  const inEditMode = (canEdit && !!notes) || (canEdit && showInput);

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
            Add notes
          </button>
        )}
      </div>
    </div>
  );
}
