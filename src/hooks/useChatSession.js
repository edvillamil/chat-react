import { useCallback, useState } from 'react'

// Hook de sesión de chat: conexión, usuario y borrador del mensaje.
// Toda la lógica vive aquí; los componentes solo presentan.
// Los puntos marcados con "Pendiente:" se conectarán con el backend (Spring Boot).
export function useChatSession() {
  const [connected, setConnected] = useState(false)
  const [username, setUsername] = useState('')
  const [draft, setDraft] = useState('')

  const connect = useCallback((name) => {
    // Pendiente: abrir la sesión / conexión con el backend (Spring Boot).
    const trimmed = name.trim()
    if (!trimmed) return
    setUsername(trimmed)
    setConnected(true)
  }, [])

  const disconnect = useCallback(() => {
    // Pendiente: cerrar la sesión con el backend.
    setConnected(false)
    setUsername('')
    setDraft('')
  }, [])

  const sendDraft = useCallback(() => {
    // Pendiente: enviar el mensaje al backend (Spring Boot).
    // setState funcional: lee el último valor sin depender de `draft`.
    setDraft((curr) => (curr.trim() ? '' : curr))
  }, [])

  return { connected, username, draft, setDraft, connect, disconnect, sendDraft }
}
