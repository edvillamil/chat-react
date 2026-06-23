# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server (http://localhost:5173) with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build locally

There is no test runner, linter, or formatter configured. `npm run build` is the only verification gate — run it after changes to confirm the app still compiles.

## Architecture

This is a **frontend-only** chat UI (Vite + React 18 + Tailwind CSS v4). It has **no backend logic on purpose** — connecting, sending messages, sessions, and message persistence are stubbed and will be implemented later with a **Spring Boot** backend. Throughout the code, the exact integration points are marked with `// Pendiente:` comments — preserve these and wire real calls there rather than restructuring.

### State lives in `App.jsx`

`src/App.jsx` is the single source of truth. All state (`dark`, `connected`, `username`, `draft`) and handlers (`handleConnect`, `handleDisconnect`, `handleSend`) live here and flow down as props. Components are presentational and stateless except for local input drafts. There is no router, context, or state library.

### Two screens, gated by `connected`

- Not connected → `ConnectScreen` (user types a username; Enter or button calls `onConnect`).
- Connected → `MessageList` + `MessageInput`.

`Header` is always visible and only shows the username/Desconectar controls when connected.

### Message ownership / bubble alignment

`MessageList` decides a message is "own" (right-aligned indigo bubble, labeled "Tú") when `m.username === currentUser`. Because sample data uses real names (Ana, Carlos, María), connecting with a matching name surfaces those as own messages — this is intentional demo behavior. Sample data is hardcoded in `src/data/messages.js` and will be replaced by backend data.

### Theming (Tailwind v4, class-based dark mode)

Tailwind v4 is configured via the `@tailwindcss/vite` plugin — there is **no `tailwind.config.js`**. All Tailwind config and the dark-mode setup live in `src/index.css`:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

Dark mode is **class-based, not media-query-based**: `App.jsx` toggles the `.dark` class on `<html>` via an effect on the `dark` state (initialized from the OS preference). Use `dark:` variants in markup; they only apply when that class is present.

## Project skills

Two skills are installed in this project (see `skills-lock.json`, sourced from `vercel-labs/agent-skills`):

- **`vercel-react-best-practices`** — React/Next.js performance guidelines from Vercel Engineering.
- **`web-design-guidelines`** — reviews UI code against Web Interface Guidelines (accessibility, UX).

### When to trigger them

- Invoke **`vercel-react-best-practices`** when writing, reviewing, or refactoring any component under `src/` — especially before adding state, effects, lists/keys, or new render-heavy UI — to keep the React patterns sound.
- Invoke **`web-design-guidelines`** when changing markup/styles or when asked to review UI, check accessibility, or audit UX (e.g. the theme toggle, the message bubbles, the connect form, responsiveness, focus states).

Since this is a Tailwind + React UI repo, most non-trivial changes touch both concerns — prefer running the relevant skill rather than relying on memory.

### Conventions

- UI strings and code comments are in **Spanish**.
- Indigo (`indigo-500`) is the accent color; `slate` is the neutral palette.
- `.jsx` function components, no TypeScript.
