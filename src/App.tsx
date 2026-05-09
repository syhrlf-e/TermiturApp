import { Sidebar } from './components/Sidebar/Sidebar'
import { TerminalArea } from './components/Terminal/TerminalArea'

function App() {
  return (
    <div className="flex h-screen w-screen bg-neutral-900 text-neutral-100 font-mono overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Terminal Area */}
      <TerminalArea />
    </div>
  )
}

export default App
