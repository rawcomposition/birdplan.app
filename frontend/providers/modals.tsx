import React from "react";

// lib
import { KeyValue } from "lib/types";

// components
import ModalWrapper from "components/ModalWrapper";
import clsx from "clsx";

// modals
import Hotspot from "modals/Hotspot";
import PersonalLocation from "modals/PersonalLocation";
import Marker from "modals/Marker";
import AddItineraryLocation from "modals/AddItineraryLocation";
import AddHotspot from "modals/AddHotspot";
import AddPlace from "modals/AddPlace";
import DeleteAccount from "modals/DeleteAccount";
import OpenBirding from "modals/OpenBirding";
import AddParticipant from "modals/AddParticipant";
import InviteAsEditor from "modals/InviteAsEditor";
import ManageLifelist from "modals/ManageLifelist";

export type ModalPosition = "right" | "center";

type ModalConfig = {
  id: string;
  Component: React.ComponentType<any>;
  position: ModalPosition;
  small?: boolean;
  maxHeight?: number | string;
};

const modals: ModalConfig[] = [
  {
    id: "hotspot",
    Component: Hotspot,
    position: "right",
  },
  {
    id: "personalLocation",
    Component: PersonalLocation,
    position: "right",
  },
  {
    id: "addMarker",
    Component: Marker,
    small: true,
    position: "right",
  },
  {
    id: "addPlace",
    Component: AddPlace,
    position: "right",
  },
  {
    id: "addHotspot",
    Component: AddHotspot,
    position: "right",
  },
  {
    id: "viewMarker",
    Component: Marker,
    small: true,
    position: "right",
  },
  {
    id: "addItineraryLocation",
    Component: AddItineraryLocation,
    small: true,
    position: "right",
  },
  {
    id: "deleteAccount",
    Component: DeleteAccount,
    position: "center",
    maxHeight: "90vh",
  },
  {
    id: "openBirding",
    Component: OpenBirding,
    position: "center",
  },
  {
    id: "addParticipant",
    Component: AddParticipant,
    position: "center",
  },
  {
    id: "inviteAsEditor",
    Component: InviteAsEditor,
    position: "center",
  },
  {
    id: "manageLifelist",
    Component: ManageLifelist,
    position: "center",
  },
];

type ModalId =
  | "hotspot"
  | "personalLocation"
  | "addMarker"
  | "addHotspot"
  | "viewMarker"
  | "addItineraryLocation"
  | "addPlace"
  | "deleteAccount"
  | "openBirding"
  | "addParticipant"
  | "inviteAsEditor"
  | "manageLifelist";

type Context = {
  open: (id: ModalId, props?: KeyValue) => void;
  close: () => void;
  modalId: ModalId | null;
  position: ModalPosition | null;
};

export const FieldContext = React.createContext<Context>({
  open: (id, props) => {},
  close: () => {},
  modalId: null,
  position: null,
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
    <FieldContext.Provider value={{ open, close, modalId, position: modal?.position ?? null }}>
      {children}
      <ModalWrapper
        position={modal?.position}
        small={modal?.small}
        maxHeight={modal?.maxHeight}
        open={!!modal && !closing}
        onClose={handleDismiss}
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

const Footer = ({ children }: { children: React.ReactNode }) => {
  const { position } = React.useContext(FieldContext);
  return (
    <footer
      className={clsx(
        "flex items-center",
        position === "center" ? "px-6 sm:px-7 pt-3 pb-6 bg-white" : "p-4 border-t bg-gray-50"
      )}
    >
      {children}
    </footer>
  );
};

const Header = ({ children }: { children: React.ReactNode }) => {
  const { position } = React.useContext(FieldContext);
  return position === "center" ? (
    <h3 className="pl-6 sm:pl-7 pr-14 pt-7 text-xl font-bold tracking-tight text-gray-900">{children}</h3>
  ) : (
    <h3 className="pl-4 sm:pl-6 pr-12 py-4 border-b bg-gray-50 text-lg font-medium">{children}</h3>
  );
};

const Body = ({
  children,
  className,
  noPadding,
}: {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) => {
  const { position } = React.useContext(FieldContext);
  const padding = position === "center" ? "px-6 sm:px-7 pt-4" : "px-4 sm:px-6 pt-4";
  return <div className={clsx(!noPadding && padding, className, "overflow-auto flex-grow")}>{children}</div>;
};

export { ModalProvider, useModal, Footer, Header, Body };
