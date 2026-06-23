import { useCallback, useEffect, useState } from 'react'

// Lee la preferencia inicial del sistema (solo una vez, init perezoso).
function getInitialDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

// Hook de tema: encapsula el estado claro/oscuro y la sincronización con el DOM.
export function useTheme() {
  const [dark, setDark] = useState(getInitialDark)

  // Sincroniza la clase .dark en <html> con el estado (sistema externo al render).
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  // setState funcional → callback estable, sin depender de `dark`.
  const toggleTheme = useCallback(() => setDark((d) => !d), [])

  return { dark, toggleTheme }
}
