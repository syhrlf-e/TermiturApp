import { Sidebar } from './components/Sidebar/Sidebar'

function App() {
  return (
    <div className="flex h-screen w-screen bg-neutral-900 text-neutral-100 font-mono overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Terminal Area */}
      <div className="flex-1 flex flex-col bg-black">
        {/* Header / Tab bar placeholder */}
        <div className="h-10 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 flex-shrink-0">
           <span className="text-xs text-neutral-500">No project selected</span>
        </div>
        
        {/* Main Terminal Pane placeholder */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center opacity-30 pointer-events-none select-none">
            <h1 className="text-4xl font-bold mb-2">Termitur</h1>
            <p className="text-sm">Select or add a project to start</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
