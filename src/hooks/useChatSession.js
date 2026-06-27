import { useCallback, useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import { API_BASE, WS_URL } from '../config.js'

// Hook de sesión de chat: gestiona la conexión STOMP (WebSocket) con el backend
// Spring Boot, el usuario, los mensajes y la lista de conectados.
//
// Destinos STOMP:
//   SEND /app/join             -> registrar usuario (nombre único)
//   SEND /app/chat             -> enviar mensaje
//   SUB  /user/queue/join-result -> resultado del join (privado)
//   SUB  /topic/sala           -> mensajes en tiempo real
//   SUB  /topic/usuarios       -> lista de conectados en tiempo real
export function useChatSession() {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [username, setUsername] = useState('')
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [error, setError] = useState(null)

  // Valores que necesitan los callbacks sin recrearlos en cada render.
  const clientRef = useRef(null)
  const draftRef = useRef('')
  const usernameRef = useRef('')
  // "Está escribiendo": throttle de envío y temporizadores de expiración por
  // usuario (por si se pierde el typing:false, se limpia solo).
  const lastTypingRef = useRef(0)
  const stopTypingRef = useRef(null)
  const typingTimersRef = useRef(new Map())

  // setter del input que mantiene el ref sincronizado (callback estable).
  const updateDraft = useCallback((value) => {
    draftRef.current = value
    setDraft(value)
  }, [])

  // Añade un mensaje evitando duplicados por id (Set para lookup O(1)).
  const addMessage = useCallback((msg) => {
    setMessages((curr) => (curr.some((m) => m.id === msg.id) ? curr : [...curr, msg]))
  }, [])

  // Limpia todos los temporizadores de "escribiendo".
  const clearTypingTimers = useCallback(() => {
    clearTimeout(stopTypingRef.current)
    typingTimersRef.current.forEach((t) => clearTimeout(t))
    typingTimersRef.current.clear()
    lastTypingRef.current = 0
  }, [])

  // Señal recibida en /topic/escribiendo: actualiza la lista de quién escribe.
  // Ignora la propia señal y auto-expira al usuario si no llega el typing:false.
  const handleTyping = useCallback((evt) => {
    const who = evt.username
    if (!who || who === usernameRef.current) return
    const timers = typingTimersRef.current
    const pending = timers.get(who)
    if (pending) clearTimeout(pending)
    if (evt.typing) {
      setTypingUsers((curr) => (curr.includes(who) ? curr : [...curr, who]))
      timers.set(
        who,
        setTimeout(() => {
          timers.delete(who)
          setTypingUsers((curr) => curr.filter((u) => u !== who))
        }, 4000),
      )
    } else {
      timers.delete(who)
      setTypingUsers((curr) => curr.filter((u) => u !== who))
    }
  }, [])

  // Publica una señal de "escribiendo" (solo si el cliente está conectado).
  const publishTyping = useCallback((typing) => {
    const client = clientRef.current
    if (!client || !client.connected) return
    client.publish({
      destination: '/app/typing',
      body: JSON.stringify({ username: usernameRef.current, typing }),
    })
  }, [])

  // Se llama en cada pulsación: emite typing:true como mucho cada 2 s y reprograma
  // el typing:false para 2,5 s después de la última tecla.
  const sendTyping = useCallback(() => {
    const now = Date.now()
    if (now - lastTypingRef.current > 2000) {
      lastTypingRef.current = now
      publishTyping(true)
    }
    clearTimeout(stopTypingRef.current)
    stopTypingRef.current = setTimeout(() => {
      lastTypingRef.current = 0
      publishTyping(false)
    }, 2500)
  }, [publishTyping])

  const teardown = useCallback(() => {
    clearTypingTimers()
    if (clientRef.current) {
      clientRef.current.deactivate()
      clientRef.current = null
    }
  }, [clearTypingTimers])

  const connect = useCallback(
    (name) => {
      const trimmed = name.trim()
      if (!trimmed || connecting || connected) return
      setError(null)
      setConnecting(true)

      const client = new Client({
        brokerURL: WS_URL,
        reconnectDelay: 0, // sin reconexión automática: arranque predecible para el curso
        onConnect: () => {
          // Resultado del join (solo para este cliente).
          client.subscribe('/user/queue/join-result', (frame) => {
            const result = JSON.parse(frame.body)
            if (result.accepted) {
              usernameRef.current = trimmed
              setUsername(trimmed)
              setConnected(true)
              setConnecting(false)
              // Precarga del historial; conserva mensajes en vivo ya recibidos.
              fetch(`${API_BASE}/api/messages`)
                .then((r) => r.json())
                .then((history) => {
                  const ids = new Set(history.map((m) => m.id))
                  setMessages((curr) => [...history, ...curr.filter((m) => !ids.has(m.id))])
                })
                .catch(() => {})
            } else {
              setError(result.reason || 'No se pudo conectar')
              setConnecting(false)
              teardown()
            }
          })

          // Lista de conectados en tiempo real.
          client.subscribe('/topic/usuarios', (frame) => setUsers(JSON.parse(frame.body)))

          // Mensajes en tiempo real.
          client.subscribe('/topic/sala', (frame) => addMessage(JSON.parse(frame.body)))

          // Señales de "está escribiendo".
          client.subscribe('/topic/escribiendo', (frame) => handleTyping(JSON.parse(frame.body)))

          // Anuncia la presencia con el nombre elegido.
          client.publish({ destination: '/app/join', body: JSON.stringify({ username: trimmed }) })
        },
        onStompError: () => {
          setError('Error de conexión con el servidor')
          setConnecting(false)
        },
        onWebSocketError: () => {
          setError('No se pudo conectar al servidor')
          setConnecting(false)
          teardown()
        },
      })

      clientRef.current = client
      client.activate()
    },
    [connecting, connected, addMessage, handleTyping, teardown],
  )

  const disconnect = useCallback(() => {
    teardown()
    usernameRef.current = ''
    draftRef.current = ''
    setConnected(false)
    setConnecting(false)
    setUsername('')
    setDraft('')
    setMessages([])
    setUsers([])
    setTypingUsers([])
    setError(null)
  }, [teardown])

  const sendDraft = useCallback(() => {
    const text = draftRef.current.trim()
    const client = clientRef.current
    if (!text || !client || !connected) return
    client.publish({
      destination: '/app/chat',
      body: JSON.stringify({ username: usernameRef.current, text }),
    })
    // Al enviar ya no se está escribiendo: corta el indicador inmediatamente.
    clearTimeout(stopTypingRef.current)
    lastTypingRef.current = 0
    publishTyping(false)
    updateDraft('')
  }, [connected, publishTyping, updateDraft])

  // Cierra la conexión si el componente se desmonta.
  useEffect(() => teardown, [teardown])

  return {
    connected,
    connecting,
    username,
    draft,
    setDraft: updateDraft,
    messages,
    users,
    typingUsers,
    error,
    connect,
    disconnect,
    sendDraft,
    sendTyping,
  }
}
