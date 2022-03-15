export default function reducer(state, action) {
	const { type, payload } = action;
	const { species, expanded, seen, states } = state;
	switch (type) {
		case "set_species": {
			return { ...state, species: payload };
		}
		case "set_states": {
			return { ...state, states: payload };
		}
		case "set_seen": {
			return { ...state, seen: payload };
		}
		case "add_seen": {
			return { ...state, seen: [...seen, payload] };
		}
		case "expand_toggle": {
			const code = payload;
			if (state.expanded.includes(code)) {
				return { ...state, expanded: expanded.filter(value => value !== code) }
				
			} else {
				return { ...state, expanded: [...expanded, code] };
			}
		}
	}
}
