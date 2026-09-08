import { create } from "zustand";
import { KeyValue } from "lib/types";

export type ModalPosition = "right" | "center";

export type ModalId =
  | "hotspot"
  | "exploreHotspot"
  | "personalLocation"
  | "addMarker"
  | "addHotspot"
  | "viewMarker"
  | "addPlace"
  | "deleteAccount"
  | "openBirding"
  | "addParticipant"
  | "inviteAsEditor"
  | "manageLifelist"
  | "manageHotspotLists"
  | "manageLabels"
  | "generateMagicLink"
  | "share";

export const MODAL_POSITIONS: Record<ModalId, ModalPosition> = {
  hotspot: "right",
  exploreHotspot: "right",
  personalLocation: "right",
  addMarker: "right",
  addPlace: "right",
  addHotspot: "right",
  viewMarker: "right",
  deleteAccount: "center",
  openBirding: "center",
  addParticipant: "center",
  inviteAsEditor: "center",
  manageLifelist: "center",
  manageHotspotLists: "center",
  manageLabels: "center",
  generateMagicLink: "center",
  share: "center",
};

type ModalEntry = { modalId: ModalId; modalProps: KeyValue };

type ModalState = {
  modalId: ModalId | null;
  modalProps: KeyValue;
  closing: boolean;
  previous: ModalEntry | null;
  open: (id: ModalId, props?: KeyValue) => void;
  openOver: (id: ModalId, props?: KeyValue) => void;
  close: () => void;
};

let closeTimer: ReturnType<typeof setTimeout> | undefined;

export const useModalStore = create<ModalState>((set, get) => ({
  modalId: null,
  modalProps: {},
  closing: false,
  previous: null,
  open: (id, props) => {
    clearTimeout(closeTimer);
    set({ modalId: id, modalProps: props || {}, closing: false, previous: null });
  },
  openOver: (id, props) => {
    const { modalId, modalProps, closing } = get();
    clearTimeout(closeTimer);
    set({
      modalId: id,
      modalProps: props || {},
      closing: false,
      previous: modalId && !closing ? { modalId, modalProps } : null,
    });
  },
  close: () => {
    set({ closing: true });
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      const { previous } = get();
      set(previous ? { ...previous, closing: false, previous: null } : { modalId: null, closing: false });
    }, 500);
  },
}));

export const useModal = () => {
  const modalId = useModalStore((s) => s.modalId);
  const open = useModalStore((s) => s.open);
  const openOver = useModalStore((s) => s.openOver);
  const close = useModalStore((s) => s.close);
  const position = modalId ? MODAL_POSITIONS[modalId] : null;
  return { open, openOver, close, modalId, position };
};
