# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server (http://localhost:5173) with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build locally

There is no test runner, linter, or formatter configured. `npm run build` is the only verification gate — run it after changes to confirm the app still compiles.

**This frontend needs the backend running to function.** The chat is non-operational without the Spring Boot server in `../2-chat-backend` listening on `:8080` (WebSocket handshake at `/ws`). Run it in a separate terminal (Spring Boot 4 · Java 21 · Maven · STOMP · Spring Data JPA · PostgreSQL on Supabase):

```powershell
# Windows (PowerShell)
cd ..\2-chat-backend
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
.\mvnw.cmd -DskipTests spring-boot:run
```

```bash
# macOS / Linux
cd ../2-chat-backend && ./mvnw -DskipTests spring-boot:run
```

The backend reads its DB connection from env vars / a gitignored `application-local.properties` (Supabase **session pooler**, since the direct connection is IPv6-only). See `../2-chat-backend/CLAUDE.md` for the backend contract and DB setup.

## Architecture

This is the chat **frontend** (Vite + React 18 + Tailwind CSS v4), **integrated with the Spring Boot backend** in the sibling workspace `../2-chat-backend` over **WebSocket/STOMP** (real-time messages + presence) plus a REST call for history. Backend URLs live in `src/config.js` (`API_BASE`, `WS_URL`), overridable with Vite env vars `VITE_API_BASE` / `VITE_WS_URL` (defaults: `http://localhost:8080`, `ws://localhost:8080/ws`).

### State lives in `useChatSession`

`src/hooks/useChatSession.js` is the single source of truth for the chat session. It owns the STOMP `Client` (in a ref), the connection flow and all state (`connected`, `connecting`, `username`, `draft`, `messages`, `users`, `error`), exposing `connect` / `disconnect` / `sendDraft`. `App.jsx` consumes the hook and passes values down; components are presentational. `useTheme` handles dark mode. There is no router, context, or state library.

STOMP/REST contract with the broker (see backend `CLAUDE.md` for the full spec):

| Action | Destination |
|--------|-------------|
| WebSocket handshake | `WS_URL` → `ws://localhost:8080/ws` |
| Register user (unique name) | `SEND /app/join {username}` |
| Registration result (private) | `SUB /user/queue/join-result {accepted, reason}` |
| Send a message | `SEND /app/chat {username, text}` |
| Live messages | `SUB /topic/sala {id, username, text, time, type}` |
| Typing signal | `SEND /app/typing {username, typing}` |
| Live typing signals | `SUB /topic/escribiendo {username, typing}` |
| Live connected-users list | `SUB /topic/usuarios` |
| Initial history | `GET /api/messages` |
| Connected-users snapshot | `GET /api/users` |

Connection flow in the hook:
- `connect(name)` → activates the `Client` against `WS_URL`. On `onConnect`, subscribes to `/user/queue/join-result`, `/topic/sala`, `/topic/usuarios`, then `SEND /app/join`. On `accepted` → connected + `GET /api/messages` for history (merged ahead of any already-received live messages); on rejection (duplicate name) → `error` surfaced in `ConnectScreen` and the client is torn down.
- **Presence notices**: the backend broadcasts a system message to `/topic/sala` (`type: "system"`) on both **join** (`PresenceController`, e.g. `"María se ha conectado al chat"`) and **disconnect** (`PresenceEventListener`, e.g. `"María ha salido del chat"`), alongside each `/topic/usuarios` roster update. These notices are **ephemeral** — not persisted, so they never appear in `GET /api/messages` history — and carry a unique negative `id` (assigned by `MessageMapper`) so they survive the frontend's id-based dedup. `MessageList` renders `type === "system"` as a centered pill instead of a chat bubble; regular messages have `type: "chat"`.
- **Typing indicator**: `TypingController` is a **pure relay** (no service/persistence) — it forwards `/app/typing {username, typing}` straight to `/topic/escribiendo`. The hook throttles `typing:true` (≤ once per 2s while typing) and sends `typing:false` on send/stop; on the receive side it keeps `typingUsers` with a per-user 4s auto-expiry (so a lost `typing:false` self-heals) and ignores its own signal. `TypingIndicator` renders "X está escribiendo…" above `MessageInput` with reserved height to avoid layout shift.
- `sendDraft()` → `SEND /app/chat {username, text}` (the message echoes back via `/topic/sala`; the UI does not append optimistically).
- `disconnect()` → `client.deactivate()` and resets all state (backend removes the user on the WS close event).
- `reconnectDelay: 0` — **auto-reconnect is intentionally disabled** for a predictable, course-friendly startup; a dropped connection requires a manual reconnect.
- Messages are deduped by `id`; `users` drives the "N en línea" count in `Header`. `onStompError` / `onWebSocketError` set `error` and stop the "Conectando…" state.

### Two screens, gated by `connected`

- Not connected → `ConnectScreen` (username; shows `error` and a "Conectando…" state).
- Connected → `MessageList` + `MessageInput`.

`Header` is always visible and shows the username, the connected-user count, and Desconectar when connected.

### Message ownership / bubble alignment

`MessageList` decides a message is "own" (right-aligned indigo bubble, labeled "Tú") when `m.username === currentUser`. Messages now come from the backend (`{ id, username, text, time }`); usernames are unique per session (enforced by the backend), so own-message detection by name is reliable.

### Theming (Tailwind v4, class-based dark mode)

Tailwind v4 is configured via the `@tailwindcss/vite` plugin — there is **no `tailwind.config.js`**. All Tailwind config and the dark-mode setup live in `src/index.css`:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

Dark mode is **class-based, not media-query-based**: `App.jsx` toggles the `.dark` class on `<html>` via an effect on the `dark` state (initialized from the OS preference). Use `dark:` variants in markup; they only apply when that class is present.

## Project skills

### Available skills

Skills installed in this project (`.claude/skills/`; the Vercel ones are also tracked in `skills-lock.json`):

- **`vercel-react-best-practices`** — React/Next.js performance guidelines from Vercel Engineering.
- **`web-design-guidelines`** — reviews UI code against Web Interface Guidelines (accessibility, UX).
- **`spring-boot-best-practices`** — scaffolds and extends Spring Boot apps with a layered architecture (controllers / services / repositories / models), Maven, Java 25 and Spring Boot 4.x; enforces DTO records, explicit mappers and Thymeleaf + Tailwind views.

### Skill trigger rules

- Invoke **`vercel-react-best-practices`** when writing, reviewing, or refactoring any component under `src/` — especially before adding state, effects, lists/keys, or new render-heavy UI — to keep the React patterns sound.
- Invoke **`web-design-guidelines`** when changing markup/styles or when asked to review UI, check accessibility, or audit UX (e.g. the theme toggle, the message bubbles, the connect form, responsiveness, focus states).
- Invoke **`spring-boot-best-practices`** when the user asks to create a basic Spring Boot REST API or a Spring Web monolith, to bootstrap/initialize a Spring Boot project, or to create / add / modify a Spring entity, repository, service, or controller — even if the layers aren't named explicitly.

Since the frontend is a Tailwind + React UI, most non-trivial UI changes touch both React concerns — prefer running the relevant skill rather than relying on memory.

### Conventions

- UI strings and code comments are in **Spanish**.
- Indigo (`indigo-500`) is the accent color; `slate` is the neutral palette.
- `.jsx` function components, no TypeScript.
