# Chat React

Interfaz de chat minimalista construida con **React + Tailwind CSS**. Es **solo frontend**: la conexión, el envío de mensajes y las sesiones están preparados como _stubs_ para integrarse más adelante con un backend en **Spring Boot**.

## ✨ Características

- 🎨 **Tema claro / oscuro** con switch animado (basado en clase, respeta la preferencia del sistema).
- 🔌 **Pantalla de conexión**: el usuario escribe su nombre antes de entrar.
- 💬 **Lista de mensajes** con avatar, nombre, hora y burbujas (datos de ejemplo).
- ⌨️ **Input con envío por Enter** (semántica nativa de formulario) y botón de enviar.
- 📱 **Responsive** y accesible (roles ARIA, foco visible, `prefers-reduced-motion`, `color-scheme`).

## 🛠️ Stack

- [React 18](https://react.dev/)
- [Vite 6](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/) (vía `@tailwindcss/vite`, sin `tailwind.config.js`)

## 🚀 Puesta en marcha

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:5173)
npm run dev

# Build de producción (genera dist/)
npm run build

# Previsualizar el build
npm run preview
```

## 📁 Estructura

```
src/
├── App.jsx                 # Composición principal (consume hooks)
├── components/
│   ├── Header.jsx          # Cabecera: logo, estado de conexión, switch de tema
│   ├── ThemeToggle.jsx     # Switch claro/oscuro
│   ├── ConnectScreen.jsx   # Formulario para escribir el usuario
│   ├── MessageList.jsx     # Lista de mensajes (memoizada)
│   └── MessageInput.jsx    # Input + botón de enviar
├── hooks/
│   ├── useTheme.js         # Estado del tema y sincronización con el DOM
│   └── useChatSession.js   # Conexión, usuario y borrador del mensaje
└── data/
    └── messages.js         # Mensajes de ejemplo (mock)
```

## 🔭 Estado del proyecto

Toda la lógica de red está pendiente y marcada en el código con comentarios `// Pendiente:`. Los puntos de integración con **Spring Boot** son:

- `useChatSession.connect` / `disconnect` → apertura y cierre de sesión.
- `useChatSession.sendDraft` → envío de mensajes.
- `data/messages.js` → se reemplazará por mensajes reales del backend.
