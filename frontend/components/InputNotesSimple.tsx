import React from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "components/ui/button";

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
          className="block w-full rounded-md border border-border bg-card px-3 py-2 text-base shadow-xs outline-primary outline-offset-0 focus:border-ring sm:text-sm"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={(e) => handleBlur(e.target.value)}
          minRows={1}
          maxRows={15}
          ref={notsRef}
        />
      ) : (
        <div className="text-secondary-foreground text-sm relative group whitespace-pre-wrap">{notes || ""}</div>
      )}
      <div className="-mt-1 -ml-3">
        {!inEditMode && canEdit && (
          <Button
            type="button"
            variant="link"
            onClick={() => {
              setShowInput(true);
              setTimeout(() => {
                notsRef.current?.focus();
              }, 0);
            }}
            className="text-[12px] px-3 py-1 font-bold"
          >
            {notes ? "Edit" : "Add notes"}
          </Button>
        )}
        {showDone && inEditMode && (
          <Button type="button" variant="link" onClick={() => setShowInput(false)} className="text-[12px] px-3 py-1 font-bold">
            Done
          </Button>
        )}
      </div>
    </div>
  );
}
