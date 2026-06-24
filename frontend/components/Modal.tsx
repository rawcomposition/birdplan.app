import React from "react";

// components
import ModalWrapper from "components/ModalWrapper";
import { DialogTitle } from "components/ui/dialog";
import clsx from "clsx";

// stores
import { ModalId, MODAL_POSITIONS, useModal, useModalStore } from "stores/modals";

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
import GenerateMagicLink from "modals/GenerateMagicLink";

type ModalConfig = {
  Component: React.ComponentType<any>;
  maxHeight?: number | string;
};

const modals: Record<ModalId, ModalConfig> = {
  hotspot: { Component: Hotspot },
  personalLocation: { Component: PersonalLocation },
  addMarker: { Component: Marker },
  addPlace: { Component: AddPlace },
  addHotspot: { Component: AddHotspot },
  viewMarker: { Component: Marker },
  addItineraryLocation: { Component: AddItineraryLocation },
  deleteAccount: { Component: DeleteAccount, maxHeight: "90vh" },
  openBirding: { Component: OpenBirding },
  addParticipant: { Component: AddParticipant },
  inviteAsEditor: { Component: InviteAsEditor },
  manageLifelist: { Component: ManageLifelist },
  generateMagicLink: { Component: GenerateMagicLink },
};

const ModalRoot = () => {
  const modalId = useModalStore((s) => s.modalId);
  const modalProps = useModalStore((s) => s.modalProps);
  const closing = useModalStore((s) => s.closing);
  const close = useModalStore((s) => s.close);

  const modal = modalId ? modals[modalId] : null;
  const Component = modal?.Component as React.ElementType;

  const handleDismiss = () => {
    close();
    modalProps?.onDismiss?.();
  };

  return (
    <ModalWrapper
      position={modalId ? MODAL_POSITIONS[modalId] : undefined}
      maxHeight={modal?.maxHeight}
      open={!!modal && !closing}
      onClose={handleDismiss}
    >
      {modal && <Component {...modalProps} />}
    </ModalWrapper>
  );
};

const Footer = ({ children }: { children: React.ReactNode }) => {
  const { position } = useModal();
  return (
    <footer
      className={clsx(
        "flex items-center",
        position === "center" ? "px-6 sm:px-7 pt-3 pb-6 bg-white" : "p-4 border-t bg-white"
      )}
    >
      {children}
    </footer>
  );
};

const Header = ({ children }: { children: React.ReactNode }) => {
  const { position } = useModal();
  return position === "center" ? (
    <DialogTitle className="pl-6 sm:pl-7 pr-14 pt-7 text-xl font-bold tracking-tight text-gray-900">{children}</DialogTitle>
  ) : (
    <DialogTitle className="pl-4 sm:pl-6 pr-12 py-4 border-b text-lg font-semibold tracking-tight text-gray-900">
      {children}
    </DialogTitle>
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
  const { position } = useModal();
  const padding = position === "center" ? "px-6 sm:px-7 pt-4" : "px-4 sm:px-6 pt-4";
  return <div className={clsx(!noPadding && padding, className, "overflow-auto grow")}>{children}</div>;
};

export { ModalRoot, Footer, Header, Body };
