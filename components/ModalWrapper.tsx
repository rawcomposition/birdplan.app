import React from "react";
import { Transition } from "@headlessui/react";
import CloseButton from "components/CloseButton";
import clsx from "clsx";
import ErrorBoundary from "components/ErrorBoundary";

type Props = {
  open: boolean;
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
    <>
      <Transition
        show={open}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="fixed inset-0 z-10 w-full bg-black/50 sm:hidden"
        onClick={onClose}
      />
      <Transition
        show={open}
        enter="ease-out duration-300"
        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:translate-x-4"
        enterTo="opacity-100 translate-y-0 sm:translate-x-0"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 translate-y-0 sm:translate-x-0"
        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:translate-x-4"
        className={clsx(
          "fixed bottom-0 left-0 right-0 sm:left-auto sm:top-[60px] z-20 w-full sm:max-w-md bg-black/10 sm:bg-transparent",
          small ? "top-1/2" : "top-44"
        )}
      >
        <div className="items-center justify-center text-center h-full">
          <CloseButton
            className="absolute z-20 top-2 right-2 sm:right-4 p-2 bg-gray-50 rounded-full"
            onClick={onClose}
          />
          <div className="relative transform rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none bg-white text-left h-full sm:shadow-left flex flex-col overflow-hidden">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </div>
      </Transition>
    </>
  );
}
