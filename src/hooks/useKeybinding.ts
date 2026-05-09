import { useEffect, useState } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { v4 as uuidv4 } from 'uuid'
import { useProjectStore } from '../store/projectStore'
import { useTerminalStore } from '../store/terminalStore'
import { useTauri } from './useTauri'
import type { KeybindingMap, ProjectState } from '../types'

export function useKeybinding() {
  const { projects, activeProjectId, setProjects, setActiveProject } = useProjectStore()
  const { tabs, activeTabId, addTab, removeTab, setActiveTab } = useTerminalStore()
  const { getConfig, spawnShell, killSession, openFolderDialog, saveConfig } = useTauri()
  const [keymap, setKeymap] = useState<KeybindingMap | null>(null)

  // Load keybindings on mount
  useEffect(() => {
    getConfig().then(cfg => setKeymap(cfg.keybindings)).catch(console.error)
  }, [getConfig])

  useEffect(() => {
    if (!keymap) return

    const handleKeyDown = async (e: KeyboardEvent) => {
      // Prevent intercepting if user is typing in an input field (like rename)
      if (document.activeElement?.tagName === 'INPUT') return

      const ctrl = e.ctrlKey
      const shift = e.shiftKey
      const key = e.key.toUpperCase()

      // Some keys are named differently (e.g. Tab, Enter)
      let keyName = key
      if (e.key === 'Tab') keyName = 'TAB'
      if (e.key === 'Enter') keyName = 'ENTER'
      if (e.key === 'Escape') keyName = 'ESCAPE'

      // Skip modifiers alone
      if (keyName === 'CONTROL' || keyName === 'SHIFT' || keyName === 'ALT' || keyName === 'META') return

      // Normalize combo string, e.g. "Ctrl+Shift+N" or "Ctrl+N"
      let combo = ''
      if (ctrl) combo += 'Ctrl+'
      if (shift) combo += 'Shift+'
      combo += keyName

      // Find action by matched keybinding
      let action = ''
      for (const [act, bind] of Object.entries(keymap)) {
        if (bind.toUpperCase() === combo) {
          action = act
          break
        }
      }

      if (!action) return

      const activeProject = projects.find(p => p.id === activeProjectId)
      const projectTabs = activeProjectId ? tabs[activeProjectId] || [] : []
      const activeTab = activeProjectId ? activeTabId[activeProjectId] : null

      switch (action) {
        case 'new_terminal':
          e.preventDefault()
          if (activeProjectId && activeProject) {
            try {
              const cfg = await getConfig()
              const shell = cfg.general.default_shell
              const sessionId = await spawnShell(activeProjectId, shell, activeProject.path)
              addTab(activeProjectId, { id: sessionId, name: shell.toLowerCase() })
            } catch (err) {
              console.error(err)
            }
          }
          break
        
        case 'new_project':
          e.preventDefault()
          try {
            const folderPath = await openFolderDialog()
            if (folderPath) {
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
              const cfg = await getConfig()
              await saveConfig({ ...cfg, projects: newProjects })
            }
          } catch (err) {
            console.error(err)
          }
          break

        case 'close_terminal':
          e.preventDefault()
          if (activeProjectId && activeTab) {
            try {
              await killSession(activeTab)
            } catch (err) {
              console.error(err)
            }
            removeTab(activeProjectId, activeTab)
          }
          break

        case 'next_terminal':
        case 'prev_terminal':
          e.preventDefault()
          if (activeProjectId && projectTabs.length > 1 && activeTab) {
            const currentIndex = projectTabs.findIndex(t => t.id === activeTab)
            if (currentIndex !== -1) {
              let newIndex = currentIndex
              if (action === 'next_terminal') {
                newIndex = (currentIndex + 1) % projectTabs.length
              } else {
                newIndex = (currentIndex - 1 + projectTabs.length) % projectTabs.length
              }
              setActiveTab(activeProjectId, projectTabs[newIndex].id)
            }
          }
          break

        case 'exit':
          e.preventDefault()
          getCurrentWindow().close()
          break

        case 'rename':
          e.preventDefault()
          // Dispatch custom event caught by TerminalTab
          if (activeTab) {
            window.dispatchEvent(new CustomEvent('termitur-rename-tab', { detail: { tabId: activeTab } }))
          }
          break

        case 'add_group':
          e.preventDefault()
          console.log('Add group triggered (Phase 11 future feature)')
          break

        case 'copy':
          // Rely on browser default copy behavior for xterm, or trigger it manually
          if (document.activeElement?.classList.contains('xterm-helper-textarea')) {
            document.execCommand('copy')
          }
          break
      }
    }

    // Use capture phase to intercept before xterm.js handles it if needed
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [keymap, activeProjectId, projects, tabs, activeTabId, getConfig, spawnShell, killSession, openFolderDialog, saveConfig, addTab, removeTab, setActiveTab, setProjects, setActiveProject])
}
