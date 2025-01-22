import React from "react";
import Icon from "components/Icon";
import clsx from "clsx";

type Props = {
  className?: string;
  onClick: () => void;
  size?: "sm" | "md";
};

export default function CloseButton({ className, onClick, size = "md" }: Props) {
  return (
    <button
      type="button"
      className={clsx("text-gray-400 hover:text-gray-500 focus:outline-none", className)}
      onClick={onClick}
      aria-label="Close"
    >
      <Icon name="xMark" className={clsx("text-2xl", size === "sm" && "text-xl")} />
    </button>
  );
}
