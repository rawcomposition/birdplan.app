import { create } from "zustand";
import { KeyValue } from "lib/types";

export type ModalPosition = "right" | "center";

export type ModalId =
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
  | "manageLifelist"
  | "generateMagicLink";

export const MODAL_POSITIONS: Record<ModalId, ModalPosition> = {
  hotspot: "right",
  personalLocation: "right",
  addMarker: "right",
  addPlace: "right",
  addHotspot: "right",
  viewMarker: "right",
  addItineraryLocation: "right",
  deleteAccount: "center",
  openBirding: "center",
  addParticipant: "center",
  inviteAsEditor: "center",
  manageLifelist: "center",
  generateMagicLink: "center",
};

type ModalState = {
  modalId: ModalId | null;
  modalProps: KeyValue;
  closing: boolean;
  open: (id: ModalId, props?: KeyValue) => void;
  close: () => void;
};

export const useModalStore = create<ModalState>((set) => ({
  modalId: null,
  modalProps: {},
  closing: false,
  open: (id, props) => set({ modalId: id, modalProps: props || {}, closing: false }),
  close: () => {
    set({ closing: true });
    setTimeout(() => set({ modalId: null, closing: false }), 500);
  },
}));

export const useModal = () => {
  const modalId = useModalStore((s) => s.modalId);
  const open = useModalStore((s) => s.open);
  const close = useModalStore((s) => s.close);
  const position = modalId ? MODAL_POSITIONS[modalId] : null;
  return { open, close, modalId, position };
};
