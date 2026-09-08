import React from "react";

// components
import ModalWrapper from "components/ModalWrapper";
import { DialogTitle } from "components/ui/dialog";
import clsx from "clsx";

// stores
import { ModalId, ModalEntry, ModalPosition, MODAL_POSITIONS, useModal, useModalStore } from "stores/modals";

// modals
import Hotspot from "modals/Hotspot";
import ExploreHotspot from "modals/ExploreHotspot";
import PersonalLocation from "modals/PersonalLocation";
import Marker from "modals/Marker";
import AddHotspot from "modals/AddHotspot";
import AddPlace from "modals/AddPlace";
import DeleteAccount from "modals/DeleteAccount";
import OpenBirding from "modals/OpenBirding";
import AddParticipant from "modals/AddParticipant";
import InviteAsEditor from "modals/InviteAsEditor";
import ManageLifelist from "modals/ManageLifelist";
import ManageHotspotLists from "modals/ManageHotspotLists";
import ManageLabels from "modals/ManageLabels";
import LabelForm from "modals/LabelForm";
import HotspotListForm from "modals/HotspotListForm";
import GenerateMagicLink from "modals/GenerateMagicLink";
import Share from "modals/Share";

type ModalConfig = {
  Component: React.ComponentType<any>;
  maxHeight?: number | string;
  maxWidth?: number | string;
};

const modals: Record<ModalId, ModalConfig> = {
  hotspot: { Component: Hotspot },
  exploreHotspot: { Component: ExploreHotspot },
  personalLocation: { Component: PersonalLocation },
  addMarker: { Component: Marker },
  addPlace: { Component: AddPlace },
  addHotspot: { Component: AddHotspot },
  viewMarker: { Component: Marker },
  deleteAccount: { Component: DeleteAccount, maxHeight: "90vh" },
  openBirding: { Component: OpenBirding },
  addParticipant: { Component: AddParticipant },
  inviteAsEditor: { Component: InviteAsEditor },
  manageLifelist: { Component: ManageLifelist },
  manageHotspotLists: { Component: ManageHotspotLists },
  manageLabels: { Component: ManageLabels },
  labelForm: { Component: LabelForm, maxWidth: 400 },
  hotspotListForm: { Component: HotspotListForm, maxWidth: 400 },
  generateMagicLink: { Component: GenerateMagicLink },
  share: { Component: Share },
};

const PositionContext = React.createContext<ModalPosition | null>(null);

const useModalPosition = (): ModalPosition | null => {
  const contextPosition = React.useContext(PositionContext);
  const { position } = useModal();
  return contextPosition ?? position;
};

const ModalRoot = () => {
  const entries = useModalStore((s) => s.entries);
  return <ModalLayer entries={entries} index={0} />;
};

const ModalLayer = ({ entries, index }: { entries: ModalEntry[]; index: number }) => {
  const entry = entries[index];
  return entry ? <ModalLayerContent key={entry.key} entries={entries} index={index} entry={entry} /> : null;
};

const ModalLayerContent = ({
  entries,
  index,
  entry,
}: {
  entries: ModalEntry[];
  index: number;
  entry: ModalEntry;
}) => {
  const close = useModalStore((s) => s.close);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const { Component, maxHeight, maxWidth } = modals[entry.modalId];
  const position = MODAL_POSITIONS[entry.modalId];

  const handleDismiss = () => {
    close();
    entry.modalProps?.onDismiss?.();
  };

  return (
    <PositionContext.Provider value={position}>
      <ModalWrapper
        position={position}
        maxHeight={maxHeight}
        maxWidth={maxWidth}
        open={mounted && !entry.closing}
        onClose={handleDismiss}
      >
        <Component {...entry.modalProps} />
        <ModalLayer entries={entries} index={index + 1} />
      </ModalWrapper>
    </PositionContext.Provider>
  );
};

const Footer = ({ children, align = "end" }: { children: React.ReactNode; align?: "end" | "between" }) => {
  const position: ModalPosition | null = useModalPosition();
  return (
    <footer
      className={clsx(
        "flex items-center gap-2",
        align === "between" ? "justify-between" : "justify-end",
        position === "center" ? "px-6 sm:px-7 pt-3 pb-6 bg-white" : "p-4 border-t bg-white"
      )}
    >
      {children}
    </footer>
  );
};

const Header = ({ children }: { children: React.ReactNode }) => {
  const position: ModalPosition | null = useModalPosition();
  return position === "center" ? (
    <DialogTitle className="pl-6 sm:pl-7 pr-14 pt-7 text-xl font-bold tracking-tight text-gray-900">{children}</DialogTitle>
  ) : (
    <DialogTitle className="pl-4 sm:pl-6 pr-14 pt-4 text-lg font-semibold tracking-tight text-gray-900">
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
  const position: ModalPosition | null = useModalPosition();
  const padding = position === "center" ? "px-6 sm:px-7 pt-4" : "px-4 sm:px-6 pt-4";
  const scroll = position === "center" && "overflow-auto grow";
  return <div className={clsx(!noPadding && padding, className, scroll)}>{children}</div>;
};

export { ModalRoot, Footer, Header, Body };
