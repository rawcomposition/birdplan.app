import { State, DispatchAction } from "lib/types";

export const initialState: State = {
  species: [],
  expanded: [],
  seen: [],
  pending: [],
  showSeen: false,
  radius: 50,
  isCacheRestored: false,
  showSidebar: false,
  address: undefined,
};

export function reducer(state: State, action: DispatchAction): State {
  const { type, payload } = action;
  const { expanded, seen, pending, showSeen, showSidebar } = state;
  switch (type) {
    case "set_species": {
      return { ...state, species: payload };
    }
    case "set_seen": {
      return { ...state, seen: payload };
    }
    case "show_seen": {
      return { ...state, showSeen: payload };
    }
    case "toggle_sidebar": {
      return { ...state, showSidebar: !showSidebar };
    }
    case "set_cacheRestored": {
      return { ...state, isCacheRestored: true };
    }
    case "set_address": {
      return { ...state, address: payload };
    }
    case "set_radius": {
      return { ...state, radius: payload };
    }
    case "add_seen": {
      const code = payload;
      return {
        ...state,
        pending: pending.filter((item) => item !== code),
        seen: [...seen, code],
      };
    }
    case "add_pending": {
      const code = payload;
      return { ...state, pending: [...pending, code] };
    }
    case "remove_seen": {
      const code = payload;
      return { ...state, seen: seen.filter((value) => value !== code) };
    }
    case "expand_toggle": {
      const code = payload;
      if (state.expanded.includes(code)) {
        return { ...state, expanded: expanded.filter((value) => value !== code) };
      } else {
        return { ...state, expanded: [...expanded, code] };
      }
    }
    case "filter_change": {
      const { field, value } = payload;
      if (field === "showSeen") {
        return { ...state, showSeen: !showSeen };
      } else {
        return { ...state, [field]: value };
      }
    }
    case "reset": {
      return { ...initialState, isCacheRestored: true };
    }
    default: {
      throw new Error("Invalid reducer action");
    }
  }
}
