import { create } from 'zustand'
import type { TerminalState } from '../types'

interface TerminalStore {
  // key: projectId, value: array of terminal tabs
  tabs: Record<string, TerminalState[]>
  
  // key: projectId, value: active tabId
  activeTabId: Record<string, string>

  addTab: (projectId: string, tab: TerminalState) => void
  removeTab: (projectId: string, tabId: string) => void
  setActiveTab: (projectId: string, tabId: string) => void
  renameTab: (projectId: string, tabId: string, newName: string) => void
  reorderTabs: (projectId: string, from: number, to: number) => void
}

export const useTerminalStore = create<TerminalStore>((set) => ({
  tabs: {},
  activeTabId: {},

  addTab: (projectId, tab) => set((state) => {
    const projectTabs = state.tabs[projectId] || []
    return {
      tabs: {
        ...state.tabs,
        [projectId]: [...projectTabs, tab]
      },
      activeTabId: {
        ...state.activeTabId,
        [projectId]: tab.id
      }
    }
  }),

  removeTab: (projectId, tabId) => set((state) => {
    const projectTabs = state.tabs[projectId] || []
    const newTabs = projectTabs.filter(t => t.id !== tabId)
    
    // Pilih tab terakhir jika tab aktif ditutup
    let newActiveTabId = state.activeTabId[projectId]
    if (newActiveTabId === tabId) {
      newActiveTabId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : ''
    }

    return {
      tabs: {
        ...state.tabs,
        [projectId]: newTabs
      },
      activeTabId: {
        ...state.activeTabId,
        [projectId]: newActiveTabId
      }
    }
  }),

  setActiveTab: (projectId, tabId) => set((state) => ({
    activeTabId: {
      ...state.activeTabId,
      [projectId]: tabId
    }
  })),

  renameTab: (projectId, tabId, newName) => set((state) => {
    const projectTabs = state.tabs[projectId] || []
    return {
      tabs: {
        ...state.tabs,
        [projectId]: projectTabs.map(t => t.id === tabId ? { ...t, name: newName } : t)
      }
    }
  }),

  reorderTabs: (projectId, from, to) => set((state) => {
    const projectTabs = [...(state.tabs[projectId] || [])]
    if (from < 0 || from >= projectTabs.length || to < 0 || to >= projectTabs.length) return state
    
    const [movedTab] = projectTabs.splice(from, 1)
    projectTabs.splice(to, 0, movedTab)
    
    return {
      tabs: {
        ...state.tabs,
        [projectId]: projectTabs
      }
    }
  })
}))
