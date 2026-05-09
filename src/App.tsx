import { useProjectStore } from './store/projectStore'

function App() {
  const { projects } = useProjectStore()

  return (
    <div className="flex h-screen w-screen bg-neutral-900 text-neutral-100 font-mono overflow-hidden">
      {/* Sidebar Area */}
      <div className="w-[240px] bg-neutral-900 border-r border-neutral-800 flex flex-col">
        <div className="p-4 border-b border-neutral-800 flex-shrink-0">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Projects</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {projects.length === 0 ? (
            <div className="text-xs text-neutral-600 text-center mt-4">
              No projects yet.
            </div>
          ) : (
            <div className="space-y-1">
              {projects.map((p) => (
                <div key={p.id} className="text-sm px-2 py-1 bg-neutral-800 rounded">
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-2 border-t border-neutral-800 flex-shrink-0">
          <button className="w-full py-1.5 px-2 text-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors text-left flex items-center gap-2">
            <span>+</span> New Project
          </button>
        </div>
      </div>

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
