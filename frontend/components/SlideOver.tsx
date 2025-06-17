import React from "react";
import { Transition } from "@headlessui/react";
import Icon from "components/Icon";

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function ColModal({ open, onClose, children }: Props) {
  return (
    <Transition.Root show={open} as={React.Fragment}>
      <div className="absolute inset-0 z-10 overflow-hidden">
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <div className="relative transform bg-white text-left transition-all w-full h-full flex flex-col">
            <button
              type="button"
              className="flex gap-2 items-center py-1 font-bold text-sm px-2 bg-gray-100 border-b w-full"
              onClick={onClose}
            >
              <Icon name="angleLeft" /> Back
            </button>
            <div className="px-6 py-4 flex-grow overflow-y-auto">{children}</div>
          </div>
        </Transition.Child>
      </div>
    </Transition.Root>
  );
}
