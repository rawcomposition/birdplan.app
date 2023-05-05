import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import clsx from "clsx";
import CloseButton from "components/CloseButton";

type Props = {
  open: boolean;
  maxWidth?: string;
  hideBg?: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function ModalWrapper({ hideBg, open, onClose, maxWidth, children }: Props) {
  return (
    <Transition.Root show={open} as={React.Fragment}>
      <Dialog as="div" className="relative z-20" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={clsx("fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity", hideBg && "sm:hidden")} />
        </Transition.Child>

        <div className="fixed bottom-0 left-0 right-0 sm:inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center text-center">
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
                className="relative transform overflow-hidden rounded-t-lg sm:rounded-b-lg bg-white text-left shadow-xl transition-all sm:my-8 w-full"
                style={{ maxWidth: maxWidth || "700px" }}
              >
                <CloseButton className="absolute top-4 right-5" onClick={onClose} />
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
