import { memo } from 'react'

// Texto según cuántos escriben: "Juan…", "Juan y María…", "Varias personas…".
function typingText(users) {
  if (users.length === 1) return `${users[0]} está escribiendo…`
  if (users.length === 2) return `${users[0]} y ${users[1]} están escribiendo…`
  return 'Varias personas están escribiendo…'
}

// Indicador de "está escribiendo". Altura reservada (h-5) para que no salte el
// layout cuando aparece o desaparece el texto.
function TypingIndicator({ users }) {
  return (
    <div className="mx-auto h-5 max-w-2xl px-4 sm:px-6" aria-live="polite">
      {users.length > 0 ? (
        <p className="flex items-center gap-1.5 text-xs italic text-slate-400 dark:text-slate-500">
          <span className="flex gap-0.5" aria-hidden="true">
            <span className="h-1 w-1 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s] dark:bg-slate-500" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s] dark:bg-slate-500" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-slate-400 dark:bg-slate-500" />
          </span>
          {typingText(users)}
        </p>
      ) : null}
    </div>
  )
}

export default memo(TypingIndicator)
