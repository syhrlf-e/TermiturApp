import { create } from 'zustand'
import type { ProjectState, GitStatus } from '../types'

interface ProjectStore {
  projects: ProjectState[]
  activeProjectId: string | null
  
  setProjects: (projects: ProjectState[]) => void
  addProject: (project: ProjectState) => void
  removeProject: (id: string) => void
  setActiveProject: (id: string) => void
  setGitStatus: (id: string, status: GitStatus) => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  activeProjectId: null,

  setProjects: (projects) => set({ projects }),
  
  addProject: (project) => set((state) => ({ 
    projects: [...state.projects, project],
    activeProjectId: project.id
  })),
  
  removeProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id),
    activeProjectId: state.activeProjectId === id ? null : state.activeProjectId
  })),
  
  setActiveProject: (id) => set({ activeProjectId: id }),

  // Untuk keperluan UI, status git disimpan di komponen atau store terpisah yang meng-extend state
  // Di sini disederhanakan: perubahan status Git tidak persisten di backend, hanya temporary state
  // Jika ingin strict sesuai PRD, ini bisa jadi local component state. 
  // Kita simpan di sini agar bisa diakses global.
  setGitStatus: (_id, _status) => {
    // Implementasi detail nanti saat integrasi UI di Phase 7
  }
}))
