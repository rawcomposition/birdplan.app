import React from "react";
import { Dialog, DialogContent } from "components/ui/dialog";
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
  dismissable?: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function ModalWrapper({ position = "right", ...props }: Props) {
  return position === "center" ? <CenterDialog {...props} /> : <RightSheet {...props} />;
}

type RoleProps = Omit<Props, "position">;

function CenterDialog({ open, onClose, maxHeight = "auto", dismissable = true, children }: RoleProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && dismissable) onClose();
      }}
    >
      <DialogContent
        showCloseButton={dismissable}
        style={{ maxHeight }}
        className="flex flex-col gap-0 overflow-hidden rounded-2xl p-0 w-[calc(100%-2rem)] max-w-[460px] sm:max-w-[460px]"
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}

function RightSheet({ open, onClose, small, dismissable = true, children }: RoleProps) {
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissable) {
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
    if (dismissable) onClose();
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

      <Transition
        as="div"
        show={open}
        enter="ease-out duration-300"
        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:translate-x-4"
        enterTo="opacity-100 translate-y-0 sm:translate-x-0"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 translate-y-0 sm:translate-x-0"
        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:translate-x-4"
        className={clsx(
          "fixed z-30 w-full bottom-0 left-0 right-0 sm:left-auto sm:top-[60px] sm:max-w-md bg-black/10 sm:bg-transparent",
          small ? "top-1/2" : "top-44"
        )}
      >
        <div className="h-full items-center justify-center text-center">
          {dismissable && (
            <CloseButton
              className="absolute z-40 top-2 right-2 sm:right-4 p-2 bg-gray-50 rounded-full"
              onClick={onClose}
            />
          )}
          <div className="relative transform bg-white text-left flex flex-col overflow-hidden rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none sm:shadow-left h-full">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </div>
      </Transition>
    </>
  );
}
