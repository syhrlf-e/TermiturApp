import { useState, useEffect } from 'react'
import { TerminalTab } from './TerminalTab'
import { TerminalPane } from './TerminalPane'
import { useTerminalStore } from '../../store/terminalStore'
import { useProjectStore } from '../../store/projectStore'
import { useTauri } from '../../hooks/useTauri'
import { listen } from '@tauri-apps/api/event'

export function TerminalArea() {
  const { activeProjectId, projects } = useProjectStore()
  const { tabs, activeTabId, addTab, removeTab, setActiveTab, renameTab, reorderTabs } = useTerminalStore()
  const { spawnShell, getConfig, killSession } = useTauri()
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  
  const activeProject = projects.find(p => p.id === activeProjectId)
  const projectTabs = activeProjectId ? tabs[activeProjectId] || [] : []
  const activeTab = activeProjectId ? activeTabId[activeProjectId] : null

  // Global listener for session exits
  useEffect(() => {
    const unlisten = listen<{ session_id: string, project_id: string }>(
      'session-exit',
      (event) => {
        // Automatically remove the tab if the process dies
        removeTab(event.payload.project_id, event.payload.session_id)
      }
    )
    return () => {
      unlisten.then(f => f())
    }
  }, [removeTab])

  const handleNewTerminal = async () => {
    if (!activeProjectId || !activeProject) return

    try {
      const config = await getConfig()
      const shell = config.general.default_shell
      const sessionId = await spawnShell(activeProjectId, shell, activeProject.path)
      
      const newTab = {
        id: sessionId,
        name: shell.toLowerCase()
      }
      
      addTab(activeProjectId, newTab)
    } catch (e) {
      console.error('Failed to spawn shell:', e)
    }
  }

  const handleCloseTab = async (tabId: string) => {
    if (!activeProjectId) return
    try {
      await killSession(tabId)
    } catch (e) {
      console.error('Failed to kill session:', e)
    }
    removeTab(activeProjectId, tabId)
  }

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index || !activeProjectId) return
    reorderTabs(activeProjectId, draggedIndex, index)
    setDraggedIndex(index)
  }

  if (!activeProjectId) {
    return (
      <div className="flex-1 flex flex-col bg-black">
        <div className="h-10 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 flex-shrink-0">
           <span className="text-xs text-neutral-500">No project selected</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center opacity-30 pointer-events-none select-none">
            <h1 className="text-4xl font-bold mb-2">Termitur</h1>
            <p className="text-sm">Select or add a project to start</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-black overflow-hidden">
      {/* Tab bar */}
      <div className="h-9 bg-neutral-900 border-b border-neutral-800 flex items-end px-2 flex-shrink-0 flex-nowrap overflow-x-auto no-scrollbar">
        {projectTabs.map((tab, idx) => (
          <TerminalTab
            key={tab.id}
            tab={tab}
            index={idx}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(activeProjectId, tab.id)}
            onClose={() => handleCloseTab(tab.id)}
            onRename={(newName) => renameTab(activeProjectId, tab.id, newName)}
            onDragStart={setDraggedIndex}
            onDragEnter={handleDragEnter}
            onDragEnd={() => setDraggedIndex(null)}
          />
        ))}
        
        <button 
          onClick={handleNewTerminal}
          className="w-8 h-7 ml-1 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
          title="New Terminal (Ctrl+N)"
        >
          <span className="text-lg leading-none mb-1">+</span>
        </button>
      </div>
      
      {/* Terminal Panes */}
      <div className="flex-1 relative bg-black">
        {projectTabs.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <button 
              onClick={handleNewTerminal}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-sm transition-colors"
            >
              Start Terminal
            </button>
          </div>
        ) : (
          projectTabs.map(tab => (
            <TerminalPane 
              key={tab.id} 
              sessionId={tab.id} 
              projectId={activeProjectId}
              isActive={activeTab === tab.id}
            />
          ))
        )}
      </div>
    </div>
  )
}
