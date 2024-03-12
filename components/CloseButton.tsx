import React from "react";
import Icon from "components/Icon";
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
      aria-label="Close"
    >
      <Icon name="xMark" className="text-2xl" />
    </button>
  );
}
