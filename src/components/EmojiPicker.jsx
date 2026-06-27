import { memo, useEffect, useRef, useState } from 'react'

// Emojis frecuentes como [emoji, nombre accesible]. A nivel de módulo: la lista
// se crea una sola vez, no en cada render.
const EMOJIS = [
  ['😀', 'sonrisa'], ['😂', 'risa'], ['😅', 'risa nerviosa'], ['😊', 'sonrojo'],
  ['😍', 'enamorado'], ['😎', 'genial'], ['😉', 'guiño'], ['🤔', 'pensativo'],
  ['😴', 'dormido'], ['😢', 'triste'], ['😭', 'llanto'], ['😡', 'enfadado'],
  ['😱', 'asustado'], ['🥳', 'celebración'], ['😇', 'angelito'], ['🙄', 'ojos en blanco'],
  ['👍', 'pulgar arriba'], ['👎', 'pulgar abajo'], ['👌', 'ok'], ['👏', 'aplausos'],
  ['🙌', 'manos arriba'], ['🙏', 'gracias'], ['💪', 'fuerza'], ['🤝', 'apretón de manos'],
  ['❤️', 'corazón'], ['🔥', 'fuego'], ['⭐', 'estrella'], ['✨', 'destellos'],
  ['🎉', 'fiesta'], ['🎂', 'tarta'], ['☕', 'café'], ['🍕', 'pizza'],
  ['👋', 'saludo'], ['💯', 'cien'], ['✅', 'check'], ['🚀', 'cohete'],
]

// Selector de emojis: botón que abre un panel flotante. Inserta el emoji elegido
// vía onSelect. Se cierra al elegir, con Escape o al hacer clic fuera.
function EmojiPicker({ onSelect }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const toggleRef = useRef(null)

  // Cierre por clic fuera / Escape. El listener solo existe cuando está abierto.
  useEffect(() => {
    if (!open) return
    function onPointerDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus() // devuelve el foco al disparador
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function pick(emoji) {
    onSelect(emoji)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Insertar emoji"
        aria-haspopup="true"
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200
          text-xl transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2
          focus:ring-indigo-500/30 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        <span aria-hidden="true">😊</span>
      </button>

      {open ? (
        <div
          role="group"
          aria-label="Emojis"
          className="absolute bottom-full left-0 z-10 mb-2 grid w-64 grid-cols-8 gap-1
            rounded-xl border border-slate-200 bg-white p-2 shadow-lg
            dark:border-slate-700 dark:bg-slate-800"
        >
          {EMOJIS.map(([emoji, name], i) => (
            <button
              key={emoji}
              type="button"
              autoFocus={i === 0}
              onClick={() => pick(emoji)}
              aria-label={name}
              title={name}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-lg
                transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2
                focus:ring-indigo-500/30 dark:hover:bg-slate-700"
            >
              <span aria-hidden="true">{emoji}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default memo(EmojiPicker)
