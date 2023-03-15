import React from "react";
import XMark from "icons/XMark";
import clsx from "clsx";

type Props = {
  className?: string;
  onClick: () => void;
};

export default function CloseButton({ className, onClick }: Props) {
  return (
    <button
      type="button"
      className={clsx("text-gray-400 hover:text-gray-500 focus:outline-none", className)}
      onClick={onClick}
    >
      <span className="sr-only">Close</span>
      <XMark className="text-2xl" aria-hidden="true" />
    </button>
  );
}
