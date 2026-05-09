import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { ProjectItem } from './ProjectItem'
import { useProjectStore } from '../../store/projectStore'
import { useTauri } from '../../hooks/useTauri'
import type { ProjectState } from '../../types'
import { SettingsModal } from '../Onboarding/SettingsModal'

export function Sidebar() {
  const { projects, activeProjectId, setProjects, setActiveProject, removeProject } = useProjectStore()
  const { getConfig, saveConfig, openFolderDialog, detectGit, validatePath } = useTauri()
  
  const [gitStatuses, setGitStatuses] = useState<Record<string, boolean>>({})
  const [errorStatuses, setErrorStatuses] = useState<Record<string, boolean>>({})

  // Load config on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const config = await getConfig()
        setProjects(config.projects)
      } catch (e) {
        console.error('Failed to load config:', e)
      }
    }
    loadProjects()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Check Git & Validity whenever projects change
  useEffect(() => {
    const checkPaths = async () => {
      const newGitStatus: Record<string, boolean> = {}
      const newErrStatus: Record<string, boolean> = {}
      
      for (const p of projects) {
        try {
          const pathRes = await validatePath(p.path)
          if (pathRes === 'Ok') {
            newErrStatus[p.id] = false
            const gitRes = await detectGit(p.path)
            newGitStatus[p.id] = gitRes === 'Initialized'
          } else {
            newErrStatus[p.id] = true
            newGitStatus[p.id] = false
          }
        } catch (e) {
          newErrStatus[p.id] = true
        }
      }
      
      setGitStatuses(newGitStatus)
      setErrorStatuses(newErrStatus)
    }

    checkPaths()
  }, [projects]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddProject = async () => {
    try {
      const folderPath = await openFolderDialog()
      if (folderPath) {
        // Extract folder name from path (cross-platform split)
        const name = folderPath.split(/[/\\]/).pop() || 'Unnamed'
        
        const newProject: ProjectState = {
          id: uuidv4(),
          name,
          path: folderPath,
          terminals: [],
          active_terminal: 0
        }

        const newProjects = [...projects, newProject]
        setProjects(newProjects)
        setActiveProject(newProject.id)

        // Save to backend
        const config = await getConfig()
        await saveConfig({ ...config, projects: newProjects })
      }
    } catch (e) {
      console.error('Failed to add project:', e)
    }
  }

  const handleRename = async (id: string, newName: string) => {
    const newProjects = projects.map(p => p.id === id ? { ...p, name: newName } : p)
    setProjects(newProjects)

    try {
      const config = await getConfig()
      await saveConfig({ ...config, projects: newProjects })
    } catch (e) {
      console.error('Failed to save rename:', e)
    }
  }

  const handleDelete = async (id: string) => {
    removeProject(id)
    try {
      const config = await getConfig()
      const newProjects = config.projects.filter(p => p.id !== id)
      await saveConfig({ ...config, projects: newProjects })
    } catch (e) {
      console.error('Failed to delete project:', e)
    }
  }

  // Logic Naming Conflict (resolve subLabel)
  const getSubLabel = (project: ProjectState) => {
    const isDuplicate = projects.some(p => p.name === project.name && p.id !== project.id)
    return isDuplicate ? project.path : undefined
  }

  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="w-[240px] bg-neutral-900 border-r border-neutral-800 flex flex-col h-full">
      <div className="p-4 border-b border-neutral-800 flex-shrink-0 flex justify-between items-center">
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Projects</h2>
        <button 
          onClick={() => setShowSettings(true)}
          className="text-neutral-500 hover:text-white transition-colors"
          title="Settings"
        >
          ⚙
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {projects.length === 0 ? (
          <div className="text-xs text-neutral-600 text-center mt-4">
            No projects yet.
          </div>
        ) : (
          projects.map((p) => (
            <ProjectItem
              key={p.id}
              project={p}
              isActive={activeProjectId === p.id}
              isGitInitialized={gitStatuses[p.id] || false}
              isError={errorStatuses[p.id] || false}
              subLabel={getSubLabel(p)}
              onClick={() => setActiveProject(p.id)}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <div className="p-2 border-t border-neutral-800 flex-shrink-0">
        <button 
          onClick={handleAddProject}
          className="w-full py-1.5 px-2 text-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors text-left flex items-center gap-2 cursor-pointer"
        >
          <span className="text-lg leading-none mb-0.5">+</span> New Project
        </button>
      </div>

      {showSettings && (
        <SettingsModal 
          onClose={() => setShowSettings(false)}
          onSaved={() => {
            // Kita bisa memicu reload PTY font-size dsb, tapi untuk saat ini
            // xterm pane akan memanggil getConfig() tiap kali terminal baru dibuat.
          }} 
        />
      )}
    </div>
  )
}
