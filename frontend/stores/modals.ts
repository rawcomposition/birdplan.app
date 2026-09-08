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
  | "labelForm"
  | "hotspotListForm"
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
  labelForm: "center",
  hotspotListForm: "center",
  generateMagicLink: "center",
  share: "center",
};

export type ModalEntry = { key: number; modalId: ModalId; modalProps: KeyValue; closing: boolean };

type ModalState = {
  entries: ModalEntry[];
  open: (id: ModalId, props?: KeyValue) => void;
  stack: (id: ModalId, props?: KeyValue) => void;
  close: () => void;
  closeAll: () => void;
};

const CLOSE_DELAY = 500;
let nextKey = 0;

const createEntry = (modalId: ModalId, props?: KeyValue): ModalEntry => ({
  key: nextKey++,
  modalId,
  modalProps: props || {},
  closing: false,
});

const topEntry = (entries: ModalEntry[]) => entries.filter((it) => !it.closing).at(-1);

export const useModalStore = create<ModalState>((set, get) => ({
  entries: [],
  open: (id, props) => set({ entries: [createEntry(id, props)] }),
  stack: (id, props) => set((s) => ({ entries: [...s.entries.filter((it) => !it.closing), createEntry(id, props)] })),
  close: () => {
    const top = topEntry(get().entries);
    if (!top) return;
    set((s) => ({ entries: s.entries.map((it) => (it.key === top.key ? { ...it, closing: true } : it)) }));
    setTimeout(() => set((s) => ({ entries: s.entries.filter((it) => it.key !== top.key) })), CLOSE_DELAY);
  },
  closeAll: () => {
    const keys = get().entries.map((it) => it.key);
    if (keys.length === 0) return;
    set((s) => ({ entries: s.entries.map((it) => ({ ...it, closing: true })) }));
    setTimeout(() => set((s) => ({ entries: s.entries.filter((it) => !keys.includes(it.key)) })), CLOSE_DELAY);
  },
}));

export const useModal = () => {
  const entries = useModalStore((s) => s.entries);
  const open = useModalStore((s) => s.open);
  const stack = useModalStore((s) => s.stack);
  const close = useModalStore((s) => s.close);
  const closeAll = useModalStore((s) => s.closeAll);
  const modalId = topEntry(entries)?.modalId ?? null;
  const position = modalId ? MODAL_POSITIONS[modalId] : null;
  return { open, stack, close, closeAll, modalId, position };
};
