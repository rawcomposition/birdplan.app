import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import XMark from "icons/XMark";
import CloseButton from "components/CloseButton";

type Props = {
  title: string;
  open: boolean;
  maxWidth?: string;
  hideBg?: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function ColModal({ hideBg, open, onClose, maxWidth, children }: Props) {
  const cancelButtonRef = React.useRef(null);

  return (
    <Transition.Root show={open} as={React.Fragment}>
      <Dialog as="div" className="relative z-20" initialFocus={cancelButtonRef} onClose={onClose}>
        {!hideBg && (
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>
        )}

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full"
                style={{ maxWidth: maxWidth || "700px" }}
              >
                <CloseButton className="absolute top-5 right-5" onClick={onClose} />
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
