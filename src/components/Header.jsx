import { memo } from 'react'
import ThemeToggle from './ThemeToggle.jsx'

// Cabecera: logo, estado de conexión y switch de tema.
function Header({ dark, onToggleTheme, connected, username, userCount = 0, onDisconnect }) {
  return (
    <header
      className="flex items-center justify-between gap-3 border-b border-slate-200
        bg-white/80 px-4 py-3 backdrop-blur sm:px-6
        dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>
        <div className="leading-tight">
          <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Chat</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {connected ? `Sala general · ${userCount} en línea` : 'Sala general'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {connected ? (
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="hidden min-w-0 items-center gap-1.5 text-sm text-slate-600 sm:flex dark:text-slate-300">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
              <span className="truncate font-medium">{username}</span>
            </span>
            <button
              type="button"
              onClick={onDisconnect}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm
                font-medium text-slate-600 transition-colors hover:bg-slate-100
                dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Desconectar
            </button>
          </div>
        ) : null}
        <ThemeToggle dark={dark} onToggle={onToggleTheme} />
      </div>
    </header>
  )
}

export default memo(Header)
