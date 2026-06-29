# Chat React + Spring Boot

Chat en tiempo real con **frontend React + Tailwind** (este repo) y **backend Spring Boot**
(en `../2-chat-backend`), integrados por **WebSocket/STOMP** para mensajes y presencia, más
una llamada REST para el historial.

## ✨ Características

- 🎨 **Tema claro / oscuro** con switch animado (basado en clase, respeta la preferencia del sistema).
- 🔌 **Conexión por nombre**: nombres **únicos** (el backend rechaza duplicados).
- 💬 **Mensajes en tiempo real** vía STOMP, con avatar, nombre, hora y burbujas.
- 👥 **Usuarios conectados** en vivo ("N en línea" en la cabecera).
- 🗂️ **Historial** precargado al conectar (`GET /api/messages`).
- ⌨️ **Envío por Enter** (semántica nativa de formulario) y botón de enviar.
- 📱 **Responsive** y accesible (roles ARIA, foco visible, `prefers-reduced-motion`).

## 🛠️ Stack

**Frontend:** [React 18](https://react.dev/) · [Vite 6](https://vite.dev/) ·
[Tailwind CSS v4](https://tailwindcss.com/) (sin `tailwind.config.js`) ·
[@stomp/stompjs](https://stomp-js.github.io/).

**Backend:** Spring Boot 4 · Java 21 · Maven · WebSocket/STOMP · Spring Data JPA ·
PostgreSQL (Supabase). Ver `../2-chat-backend`.

## 🚀 Puesta en marcha

Necesitas **dos terminales**: una para el backend y otra para el frontend.

### 1. Backend (Spring Boot) — `../2-chat-backend`

Arranca en `http://localhost:8080`. Requiere un JDK 21 (libera el 8080 si está ocupado).

```powershell
# Windows (PowerShell)
cd ..\2-chat-backend
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
.\mvnw.cmd -DskipTests spring-boot:run
```

```bash
# macOS / Linux
cd ../2-chat-backend
./mvnw -DskipTests spring-boot:run
```

El backend persiste en **PostgreSQL (Supabase)**; la conexión se configura en el repo del
backend (variables de entorno / `application-local.properties`, no versionado). Detalles en
`../2-chat-backend`.

### 2. Frontend (React + Vite) — este repo

Arranca en `http://localhost:5173`.

```bash
npm install          # solo la primera vez
npm run dev          # servidor de desarrollo (http://localhost:5173)
npm run build        # build de producción (genera dist/)
npm run preview      # previsualiza el build
```

### Configuración de las URLs del backend

Por defecto el frontend apunta a `http://localhost:8080` / `ws://localhost:8080/ws`
(ver `src/config.js`). Para usar otro host/puerto, crea un `.env.local`:

```ini
VITE_API_BASE=http://localhost:8081
VITE_WS_URL=ws://localhost:8081/ws
```

## 🔌 Contrato de integración (STOMP + REST)

| Acción | Destino |
|--------|---------|
| Handshake WebSocket | `/ws` |
| Registrar usuario (nombre único) | `SEND /app/join {username}` |
| Resultado del registro (privado) | `SUB /user/queue/join-result` |
| Enviar mensaje | `SEND /app/chat {username, text}` |
| Recibir mensajes en tiempo real | `SUB /topic/sala` |
| Lista de conectados en tiempo real | `SUB /topic/usuarios` |
| Historial inicial | `GET /api/messages` |
| Snapshot de conectados | `GET /api/users` |

## 📁 Estructura (frontend)

```
src/
├── App.jsx                 # Composición principal (consume hooks)
├── config.js               # URLs del backend (API_BASE, WS_URL)
├── components/
│   ├── Header.jsx          # Cabecera: estado, "N en línea", switch de tema
│   ├── ThemeToggle.jsx     # Switch claro/oscuro
│   ├── ConnectScreen.jsx   # Formulario de conexión (errores + "Conectando…")
│   ├── MessageList.jsx     # Lista de mensajes (memoizada)
│   └── MessageInput.jsx    # Input + botón de enviar
└── hooks/
    ├── useTheme.js         # Estado del tema y sincronización con el DOM
    └── useChatSession.js   # Cliente STOMP: conexión, mensajes, usuarios
```
