export interface GeneralConfig {
  default_shell: 'Bash' | 'Zsh' | 'PowerShell' | 'Fish'
  font_size: number
  scrollback_lines: number
}

export interface TerminalState {
  id: string
  name: string
}

export interface ProjectState {
  id: string
  name: string
  path: string
  group?: string
  terminals: TerminalState[]
  active_terminal: number
}

export type KeybindingMap = Record<string, string>

export interface Config {
  general: GeneralConfig
  keybindings: KeybindingMap
  projects: ProjectState[]
}

export type GitStatus = 'Initialized' | 'NotInitialized'
export type PathStatus = 'Ok' | 'NotFound' | 'PermissionDenied'
