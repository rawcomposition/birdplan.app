import React from "react";
import { Transition } from "@headlessui/react";
import CloseButton from "components/CloseButton";
import clsx from "clsx";

type Props = {
  open: boolean;
  hideBg?: boolean;
  small?: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function ModalWrapper({ open, onClose, small, children }: Props) {
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <Transition
      show={open}
      enter="ease-out duration-300"
      enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:translate-x-4"
      enterTo="opacity-100 translate-y-0 sm:translate-x-0"
      leave="ease-in duration-200"
      leaveFrom="opacity-100 translate-y-0 sm:translate-x-0"
      leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:translate-x-4"
      className={clsx(
        "fixed bottom-0 left-0 right-0 sm:left-auto sm:top-[60px] z-10 w-full sm:max-w-md",
        small ? "top-1/2" : "top-32"
      )}
    >
      <div className="items-center justify-center text-center h-full">
        <CloseButton className="fixed z-10 top-2 right-2 sm:right-6 p-2 bg-gray-50 rounded-full" onClick={onClose} />
        <div className="relative transform rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none bg-white text-left h-full sm:shadow-left overflow-auto">
          {children}
        </div>
      </div>
    </Transition>
  );
}
