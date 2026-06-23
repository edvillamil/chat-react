import { memo, useState } from 'react'

// Pantalla previa: el usuario escribe su nombre antes de conectarse.
// El "conectar" real (validación, sesión) se hará luego con Spring Boot.
function ConnectScreen({ onConnect }) {
  const [name, setName] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onConnect(trimmed)
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6
          shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 text-white">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
            Únete al chat
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Escribe tu nombre de usuario para conectarte.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <label htmlFor="username" className="sr-only">
            Nombre de usuario
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            spellCheck={false}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            maxLength={24}
            placeholder="Ej. María…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5
              text-sm text-slate-700 placeholder-slate-400 transition-colors
              focus:border-indigo-400 focus:bg-white focus:outline-none
              focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700
              dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium
              text-white shadow-sm transition-colors hover:bg-indigo-600
              disabled:cursor-not-allowed disabled:opacity-50"
          >
            Conectar
          </button>
        </form>
      </div>
    </div>
  )
}

export default memo(ConnectScreen)
