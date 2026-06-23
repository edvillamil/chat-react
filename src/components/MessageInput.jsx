import { memo } from 'react'

// Barra para escribir y enviar. Sin lógica de backend todavía (solo visual).
// El envío real (Enter / botón) se conectará luego con Spring Boot.
function MessageInput({ value, onChange, onSend }) {
  // Enter envía de forma nativa al estar dentro de un <form>.
  function handleSubmit(e) {
    e.preventDefault()
    onSend()
  }

  return (
    <div className="border-t border-slate-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-6
      dark:border-slate-800 dark:bg-slate-900/80">
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl items-end gap-2">
        <input
          type="text"
          name="message"
          autoComplete="off"
          enterKeyHint="send"
          aria-label="Mensaje"
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
