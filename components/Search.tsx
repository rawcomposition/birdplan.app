import React from "react";
import Icon from "components/Icon";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function Search({ value, onChange }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const onClear = () => {
    onChange("");
    inputRef.current?.focus();
  };
  return (
    <div className="relative">
      <input
        type="search"
        className="w-full px-2 py-[3px] text-gray-400/80 sm:text-[12px] bg-gray-800 rounded-md mb-2 focus:outline-none focus:border-gray-600/90 border border-transparent"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search"
        ref={inputRef}
      />
      {value && (
        <button
          type="button"
          className="absolute top-1.5 right-1.5 bg-gray-400/90 rounded-full text-[10px] w-[15px] h-[15px] flex items-center justify-center text-gray-800 hover:bg-gray-300 focus:outline-none focus:bg-gray-300"
          onClick={onClear}
        >
          <span className="sr-only">Clear search</span>
          <Icon name="xMark" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
