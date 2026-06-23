// Switch para alternar entre modo claro y oscuro.
function SunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export default function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Cambiar tema claro u oscuro"
      onClick={onToggle}
      className="relative inline-flex h-7 w-14 items-center rounded-full
        bg-slate-200 transition-colors dark:bg-slate-700
        focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
        focus-visible:ring-offset-2 focus-visible:ring-offset-white
        dark:focus-visible:ring-offset-slate-900"
    >
      <span
        className="absolute left-1.5 text-amber-500 transition-opacity
          dark:opacity-0"
      >
        <SunIcon />
      </span>
      <span
        className="absolute right-1.5 text-indigo-300 opacity-0 transition-opacity
          dark:opacity-100"
      >
        <MoonIcon />
      </span>
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm
          transition-transform ${dark ? 'translate-x-8' : 'translate-x-1'}`}
      />
    </button>
  )
}
