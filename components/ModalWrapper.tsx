import React from "react";
import { Transition } from "@headlessui/react";
import CloseButton from "components/CloseButton";
import clsx from "clsx";
import ErrorBoundary from "components/ErrorBoundary";
import { ModalPosition } from "providers/modals";

type Props = {
  open: boolean;
  small?: boolean;
  position?: ModalPosition;
  maxHeight?: number | string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function ModalWrapper({
  open,
  onClose,
  small,
  position = "right",
  maxHeight = "auto",
  children,
}: Props) {
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <>
      <Transition
        as="div"
        show={open}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="fixed inset-0 z-10 w-full bg-black/50 sm:hidden"
        onClick={handleBackdropClick}
      />

      {position === "center" && (
        <Transition
          as="div"
          show={open}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="fixed inset-0 z-20 w-full bg-white bg-opacity-70 hidden sm:block"
          onClick={handleBackdropClick}
        />
      )}

      <Transition
        as="div"
        show={open}
        enter="ease-out duration-300"
        enterFrom={
          position === "center" ? "opacity-0 scale-95" : "opacity-0 translate-y-4 sm:translate-y-0 sm:translate-x-4"
        }
        enterTo={position === "center" ? "opacity-100 scale-100" : "opacity-100 translate-y-0 sm:translate-x-0"}
        leave="ease-in duration-200"
        leaveFrom={position === "center" ? "opacity-100 scale-100" : "opacity-100 translate-y-0 sm:translate-x-0"}
        leaveTo={
          position === "center" ? "opacity-0 scale-95" : "opacity-0 translate-y-4 sm:translate-y-0 sm:translate-x-4"
        }
        className={clsx(
          "fixed z-30 w-full",
          position === "center"
            ? "inset-0 flex items-center justify-center p-4"
            : "bottom-0 left-0 right-0 sm:left-auto sm:top-[60px] sm:max-w-md bg-black/10 sm:bg-transparent",
          position === "right" && (small ? "top-1/2" : "top-44")
        )}
        onClick={position === "center" ? handleBackdropClick : undefined}
      >
        <div
          className={clsx(
            "items-center justify-center text-center",
            position === "center" ? "max-w-md w-full mx-auto relative" : "h-full"
          )}
          onClick={position === "center" ? (e) => e.stopPropagation() : undefined}
        >
          <CloseButton
            className="absolute z-40 top-2 right-2 sm:right-4 p-2 bg-gray-50 rounded-full"
            onClick={onClose}
          />
          <div
            className={clsx(
              "relative transform bg-white text-left flex flex-col overflow-hidden",
              position === "center"
                ? "rounded-lg sm:shadow-xl"
                : "rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none sm:shadow-left h-full"
            )}
            style={{
              maxHeight: position === "center" ? maxHeight : undefined,
              overflow: position === "center" ? "auto" : undefined,
            }}
          >
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </div>
      </Transition>
    </>
  );
}
