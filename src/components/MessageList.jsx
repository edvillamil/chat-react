import { memo } from 'react'

// Lista de mensajes (scrollable). Burbuja por mensaje con avatar, usuario y hora.
const avatarColors = [
  'bg-rose-500', 'bg-amber-500', 'bg-emerald-500',
  'bg-sky-500', 'bg-violet-500', 'bg-fuchsia-500',
]

// Caché a nivel de módulo: el color de cada usuario se calcula una sola vez.
const colorCache = new Map()

function colorFor(name) {
  const cached = colorCache.get(name)
  if (cached) return cached
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  const color = avatarColors[sum % avatarColors.length]
  colorCache.set(name, color)
  return color
}

function Avatar({ name }) {
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full
        text-xs font-semibold text-white ${colorFor(name)}`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

// Aviso del sistema (presencia): píldora centrada, sin burbuja ni avatar.
// p. ej. "María se ha conectado al chat".
const SystemNotice = memo(function SystemNotice({ text }) {
  return (
    <li className="flex justify-center">
      <span
        className="rounded-full bg-slate-200/70 px-3 py-1 text-xs font-medium
          text-slate-500 dark:bg-slate-800/70 dark:text-slate-400"
      >
        {text}
      </span>
    </li>
  )
})

// Cada mensaje aislado y memoizado: solo se re-renderiza si cambian sus props.
const MessageItem = memo(function MessageItem({ message, own }) {
  return (
    <li className={`flex items-end gap-2.5 ${own ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar name={message.username} />
      <div className={`min-w-0 max-w-[75%] ${own ? 'items-end text-right' : 'items-start'}`}>
        <div className="mb-1 flex items-center gap-2 px-1 text-xs">
          <span className="truncate font-semibold text-slate-600 dark:text-slate-300">
            {own ? 'Tú' : message.username}
          </span>
          <span className="shrink-0 text-slate-400 dark:text-slate-500">{message.time}</span>
        </div>
        <div
          className={`break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
            own
              ? 'rounded-br-md bg-indigo-500 text-white'
              : 'rounded-bl-md bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200'
          }`}
        >
          {message.text}
        </div>
      </div>
    </li>
  )
})

function MessageList({ messages, currentUser }) {
  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-5 sm:px-6"
      role="log"
      aria-live="polite"
      aria-label="Mensajes del chat"
    >
      <ul className="mx-auto flex max-w-2xl flex-col gap-4">
        {messages.map((m) =>
          m.type === 'system' ? (
            <SystemNotice key={m.id} text={m.text} />
          ) : (
            <MessageItem key={m.id} message={m} own={currentUser === m.username} />
          ),
        )}
      </ul>
    </div>
  )
}

export default memo(MessageList)
