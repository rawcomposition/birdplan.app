import React from "react";

// lib
import { KeyValue } from "lib/types";

// components
import ModalWrapper from "components/ModalWrapper";
import clsx from "clsx";

// modals
import Hotspot from "modals/Hotspot";
import PersonalLocation from "modals/PersonalLocation";
import AddMarker from "modals/AddMarker";
import ViewMarker from "modals/ViewMarker";
import Share from "modals/Share";
import AddItineraryLocation from "modals/AddItineraryLocation";
import AddHotspot from "modals/AddHotspot";
import AddPlace from "modals/AddPlace";

const modals = [
  {
    id: "hotspot",
    Component: Hotspot,
  },
  {
    id: "personalLocation",
    Component: PersonalLocation,
  },
  {
    id: "addMarker",
    Component: AddMarker,
    small: true,
  },
  {
    id: "addPlace",
    Component: AddPlace,
  },
  {
    id: "addHotspot",
    Component: AddHotspot,
  },
  {
    id: "viewMarker",
    Component: ViewMarker,
    small: true,
  },
  {
    id: "share",
    Component: Share,
  },
  {
    id: "addItineraryLocation",
    Component: AddItineraryLocation,
    small: true,
  },
];

type ModalId =
  | "hotspot"
  | "personalLocation"
  | "addMarker"
  | "addHotspot"
  | "viewMarker"
  | "share"
  | "addItineraryLocation"
  | "addPlace";

type Context = {
  open: (id: ModalId, props?: KeyValue) => void;
  close: () => void;
  modalId: ModalId | null;
};

export const FieldContext = React.createContext<Context>({
  open: (id, props) => {},
  close: () => {},
  modalId: null,
});

type Props = {
  children: React.ReactNode;
};

const ModalProvider = ({ children }: Props) => {
  const [modalId, setModalId] = React.useState<ModalId | null>(null);
  const [closing, setClosing] = React.useState(false);
  const [modalProps, setModalProps] = React.useState<KeyValue>({});
  const modal = modals.find((it) => it.id === modalId) || null;
  const Component = modal?.Component as React.ElementType;

  const open = React.useCallback((id: ModalId, props?: KeyValue) => {
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
    <FieldContext.Provider value={{ open, close, modalId }}>
      {children}
      <ModalWrapper small={modal?.small} open={!!modal && !closing} onClose={handleDismiss}>
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
  <h3 className="pl-4 sm:pl-6 pr-12 py-4 border-b bg-gray-50 text-lg font-medium">{children}</h3>
);

const Body = ({
  children,
  className,
  noPadding,
}: {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) => <div className={clsx(!noPadding && "px-4 sm:px-6 pt-4", className)}>{children}</div>;

export { ModalProvider, useModal, Footer, Header, Body };
