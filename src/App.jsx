import Header from './components/Header.jsx'
import MessageList from './components/MessageList.jsx'
import MessageInput from './components/MessageInput.jsx'
import ConnectScreen from './components/ConnectScreen.jsx'
import { useTheme } from './hooks/useTheme.js'
import { useChatSession } from './hooks/useChatSession.js'
import { sampleMessages } from './data/messages.js'

export default function App() {
  const { dark, toggleTheme } = useTheme()
  const { connected, username, draft, setDraft, connect, disconnect, sendDraft } =
    useChatSession()

  return (
    <div className="flex h-full flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header
        dark={dark}
        onToggleTheme={toggleTheme}
        connected={connected}
        username={username}
        onDisconnect={disconnect}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        {connected ? (
          <>
            <MessageList messages={sampleMessages} currentUser={username} />
            <MessageInput value={draft} onChange={setDraft} onSend={sendDraft} />
          </>
        ) : (
          <ConnectScreen onConnect={connect} />
        )}
      </main>
    </div>
  )
}
