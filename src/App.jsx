import Header from './components/Header.jsx'
import MessageList from './components/MessageList.jsx'
import MessageInput from './components/MessageInput.jsx'
import TypingIndicator from './components/TypingIndicator.jsx'
import ConnectScreen from './components/ConnectScreen.jsx'
import { useTheme } from './hooks/useTheme.js'
import { useChatSession } from './hooks/useChatSession.js'

export default function App() {
  const { dark, toggleTheme } = useTheme()
  const {
    connected,
    connecting,
    username,
    draft,
    setDraft,
    messages,
    users,
    typingUsers,
    error,
    connect,
    disconnect,
    sendDraft,
    sendTyping,
  } = useChatSession()

  return (
    <div className="flex h-full flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header
        dark={dark}
        onToggleTheme={toggleTheme}
        connected={connected}
        username={username}
        userCount={users.length}
        onDisconnect={disconnect}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        {connected ? (
          <>
            <MessageList messages={messages} currentUser={username} />
            <TypingIndicator users={typingUsers} />
            <MessageInput value={draft} onChange={setDraft} onSend={sendDraft} onTyping={sendTyping} />
          </>
        ) : (
          <ConnectScreen onConnect={connect} connecting={connecting} error={error} />
        )}
      </main>
    </div>
  )
}
