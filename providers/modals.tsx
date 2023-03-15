import React from "react";

// lib
import { KeyValue } from "lib/types";

// components
import ModalWrapper from "components/ModalWrapper";
import { Dialog } from "@headlessui/react";

// modals
import Hotspot from "modals/Hotspot";
import PersonalLocation from "modals/PersonalLocation";

const modals = [
  {
    id: "hotspot",
    maxWidth: "400px",
    hideBg: true,
    title: "",
    Component: Hotspot,
  },
  {
    id: "personalLocation",
    maxWidth: "400px",
    hideBg: true,
    title: "",
    Component: PersonalLocation,
  },
];

type Context = {
  open: (id: string, props?: KeyValue) => void;
  close: () => void;
};

export const FieldContext = React.createContext<Context>({
  open: (id, props) => {},
  close: () => {},
});

type Props = {
  children: React.ReactNode;
};

const ModalProvider = ({ children }: Props) => {
  const [modalId, setModalId] = React.useState<string | null>(null);
  const [closing, setClosing] = React.useState(false);
  const [modalProps, setModalProps] = React.useState<KeyValue>({});
  const modal = modals.find((it) => it.id === modalId) || null;
  const Component = modal?.Component as React.ElementType;

  const open = React.useCallback((id: string, props?: KeyValue) => {
    setModalId(id);
    setModalProps(props || {});
  }, []);

  const close = React.useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setModalId(null);
      setClosing(false);
    }, 500);
  }, []);

  const handleDismiss = () => {
    close();
    modalProps?.onDismiss?.();
  };

  return (
    <FieldContext.Provider value={{ open, close }}>
      {children}
      <ModalWrapper
        maxWidth={modal?.maxWidth}
        title={modal?.title || ""}
        open={!!modal && !closing}
        onClose={handleDismiss}
        hideBg={modal?.hideBg}
      >
        {modal && <Component {...modalProps} />}
      </ModalWrapper>
    </FieldContext.Provider>
  );
};

const useModal = () => {
  const state = React.useContext(FieldContext);
  return { ...state };
};

const Footer = ({ children }: { children: React.ReactNode }) => (
  <footer className="p-4 border-t flex items-center bg-gray-50">{children}</footer>
);

const Header = ({ children }: { children: React.ReactNode }) => (
  <Dialog.Title as="h3" className="pl-4 sm:pl-6 pr-12 py-4 border-b bg-gray-50 text-lg font-medium">
    {children}
  </Dialog.Title>
);

const Body = ({ children }: { children: React.ReactNode }) => <div className="px-4 sm:px-6 py-4">{children}</div>;

export { ModalProvider, useModal, Footer, Header, Body };
