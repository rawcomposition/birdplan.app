# BirdPlan design language

The rules the app's modern surfaces already follow. New UI must follow them; legacy surfaces adopt them when touched. ESLint enforces the token rule in `pages/` (see `eslint.config.js` — remove a page from the grandfather list when you modernize it).

## Tokens, never raw palette

Use semantic tokens for every color. No `gray-*`, `slate-*`, or `bg-white` in new code.

| Use | Token class |
| --- | --- |
| Page canvas | `bg-background` |
| Surfaces (cards, popups, inputs) | `bg-card` |
| Primary text / values | `text-foreground` |
| Body / secondary text | `text-secondary-foreground` |
| Labels, captions, icons | `text-muted-foreground` |
| Subtle fills (segmented tracks, hovers) | `bg-muted`, `hover:bg-muted/50` |
| Borders | `border` (defaults to `border-border`); softer: `border-border/60`, `divide-border/60` |
| The one accent | `primary` family (`bg-primary`, `text-primary`, `border-primary/30`, `bg-primary/10`) |
| Links | `text-link` |
| Destructive / success | `destructive`, `success` families |

Exceptions: status tints on chips/alerts (amber = starred/warning, emerald = mutual/success) and white text over photos/gradients (`text-white`, `bg-gradient-to-t from-black/70`).

## Surfaces

- **Card**: `rounded-xl border bg-card shadow-xs` — this is `ui/card`'s default; don't hand-roll it. Hero/feature cards may use `rounded-2xl`.
- **Popups/menus**: `rounded-xl border bg-card shadow-lg` (or use `ui/dropdown-menu` / `ui/select`, which handle it).
- Shadows stop at `shadow-xs` for resting surfaces, `shadow-lg` for floating ones. No `shadow-sm` cards, no ring hacks.
- Card padding: `p-5` via `CardHeader`/`CardContent`; standalone stat-style cards `p-4`.

## Type scale

- Page title: `text-3xl font-bold tracking-tight text-foreground` (`components/Heading`, with optional `hat` eyebrow).
- Section/card title: `CardTitle`; widget eyebrow: `components/WidgetHeader` (`text-xs font-bold tracking-widest uppercase`).
- Eyebrow/label style: `text-[11px] font-bold uppercase tracking-wide text-muted-foreground`.
- Body `text-sm`; captions `text-xs text-muted-foreground`; numbers get `tabular-nums`.

## Controls

Reach for the building block before writing markup:

- `ui/*` primitives: button, input (tall `default` for auth/marketing, `sm` for app forms), textarea, select, dropdown-menu, dialog, sheet, tooltip, badge, alert, skeleton, spinner, checkbox, switch, tabs, card.
- `SearchInput` — pill search with icon (toolbars).
- `FilterChip` — pill toggle, `tone` = primary | amber | emerald, `active` prop.
- `SegmentedControl` — inline option switcher on a `bg-muted` track.
- `SelectDropdown` — labeled value-picker pill ("Sort: Best").
- `Stat` — icon + big number + label card, links somewhere.
- `EmptyState` for all empty/none states; `Spinner` for all loading (never hand-rolled `animate-spin`).
- Toolbars: h-9 pills with `gap-2`–`gap-3`, search left, filters right, `TargetsOptionsDropdown`-style kebab last.

## Icons & misc

- One icon system: **lucide-react** (`size-4` inline, `size-[18px]` map buttons). `components/Icon` only for glyphs lucide lacks; shrink it over time.
- `cn()` from `lib/utils` — never import `clsx` directly.
- Rounding: `rounded-full` for pills/chips, `rounded-md`/`rounded-lg` inside cards, `rounded-xl`+ for surfaces.
- Print: chrome gets `print:hidden`; content pages should stay printable (see itinerary).
- Modals via `ModalProvider`; confirm destructive actions (`confirm()` is the current norm).
