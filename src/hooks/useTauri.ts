import { invoke } from '@tauri-apps/api/core'
import type { Config, GitStatus, PathStatus } from '../types'

// Wrapper hooks untuk Tauri Commands
// Menyediakan interface yang type-safe untuk frontend

export const useTauri = () => {
  const getConfig = () => invoke<Config>('get_config')
  
  const saveConfig = (config: Config) => invoke<void>('save_config', { config })
  
  const isFirstRun = () => invoke<boolean>('is_first_run')
  
  const spawnShell = (projectId: string, shell: string, path: string) => 
    invoke<string>('spawn_shell', { projectId, shell, path })
    
  const writeToShell = (sessionId: string, input: string) => 
    invoke<void>('write_to_shell', { sessionId, input })
    
  const resizePty = (sessionId: string, cols: number, rows: number) => 
    invoke<void>('resize_pty', { sessionId, cols, rows })
    
  const killSession = (sessionId: string) => 
    invoke<void>('kill_session', { sessionId })
    
  const detectGit = (path: string) => 
    invoke<GitStatus>('detect_git', { path })
    
  const validatePath = (path: string) => 
    invoke<PathStatus>('validate_path', { path })
    
  const openFolderDialog = () => 
    invoke<string | null>('open_folder_dialog')
    
  const checkUpdate = () => 
    invoke<string | null>('check_update')

  return {
    getConfig,
    saveConfig,
    isFirstRun,
    spawnShell,
    writeToShell,
    resizePty,
    killSession,
    detectGit,
    validatePath,
    openFolderDialog,
    checkUpdate
  }
}
