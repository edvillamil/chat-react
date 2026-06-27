import { memo, useLayoutEffect, useRef } from 'react'
import EmojiPicker from './EmojiPicker.jsx'

// Barra para escribir y enviar. `onTyping` se dispara al teclear (texto no vacío)
// para avisar al resto de que este usuario está escribiendo.
function MessageInput({ value, onChange, onSend, onTyping }) {
  const inputRef = useRef(null)
  // Posición donde dejar el cursor tras insertar un emoji (null = no tocar).
  const caretRef = useRef(null)

  // Enter envía de forma nativa al estar dentro de un <form>.
  function handleSubmit(e) {
    e.preventDefault()
    onSend()
  }

  function handleChange(e) {
    const next = e.target.value
    onChange(next)
    if (next.trim()) onTyping()
  }

  // Inserta el emoji en la posición del cursor (o al final) y recuerda dónde
  // dejar el caret para reponerlo tras el re-render.
  function insertEmoji(emoji) {
    const el = inputRef.current
    const start = el ? el.selectionStart : value.length
    const end = el ? el.selectionEnd : value.length
    const next = value.slice(0, start) + emoji + value.slice(end)
    caretRef.current = start + emoji.length
    onChange(next)
    if (next.trim()) onTyping()
  }

  // Tras insertar un emoji, devuelve el foco al input y coloca el cursor justo
  // después del emoji. No-op en los cambios normales de tecleo (caretRef null).
  useLayoutEffect(() => {
    if (caretRef.current == null) return
    const el = inputRef.current
    if (el) {
      el.focus()
      el.setSelectionRange(caretRef.current, caretRef.current)
    }
    caretRef.current = null
  }, [value])

  return (
    <div className="border-t border-slate-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-6
      dark:border-slate-800 dark:bg-slate-900/80">
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl items-end gap-2">
        <EmojiPicker onSelect={insertEmoji} />
        <input
          ref={inputRef}
          type="text"
          name="message"
          autoComplete="off"
          enterKeyHint="send"
          aria-label="Mensaje"
          value={value}
          onChange={handleChange}
          placeholder="Escribe un mensaje…"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5
            text-sm text-slate-700 placeholder-slate-400 transition-colors
            focus:border-indigo-400 focus:bg-white focus:outline-none
            focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700
            dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500
            dark:focus:bg-slate-800"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          aria-label="Enviar mensaje"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl
            bg-indigo-500 text-white shadow-sm transition-colors hover:bg-indigo-600
            disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
    </div>
  )
}

export default memo(MessageInput)
