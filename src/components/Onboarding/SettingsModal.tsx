import { useState, useEffect } from 'react'
import { useTauri } from '../../hooks/useTauri'
import type { Config } from '../../types'

interface SettingsModalProps {
  onClose: () => void
  onSaved: () => void
}

export function SettingsModal({ onClose, onSaved }: SettingsModalProps) {
  const { getConfig, saveConfig } = useTauri()
  const [config, setConfig] = useState<Config | null>(null)
  
  useEffect(() => {
    getConfig().then(setConfig).catch(console.error)
  }, [getConfig])

  const handleSave = async () => {
    if (!config) return
    try {
      await saveConfig(config)
      onSaved()
      onClose()
    } catch (e) {
      console.error('Failed to save settings:', e)
    }
  }

  if (!config) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl w-[400px] overflow-hidden">
        {/* Header */}
        <div className="bg-neutral-950 px-4 py-3 flex justify-between items-center border-b border-neutral-800">
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">Settings</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">✕</button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-neutral-400">Default Shell</label>
            <select 
              value={config.general.default_shell}
              onChange={(e) => setConfig({
                ...config, 
                general: { ...config.general, default_shell: e.target.value as any }
              })}
              className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors"
            >
              <option value="Bash">Bash</option>
              <option value="Zsh">Zsh</option>
              <option value="PowerShell">PowerShell</option>
              <option value="Fish">Fish</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-neutral-400">Font Size (px)</label>
            <input 
              type="number"
              min={10}
              max={24}
              value={config.general.font_size}
              onChange={(e) => setConfig({
                ...config,
                general: { ...config.general, font_size: parseInt(e.target.value) || 14 }
              })}
              className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-neutral-400">Scrollback Lines</label>
            <input 
              type="number"
              min={100}
              value={config.general.scrollback_lines}
              onChange={(e) => setConfig({
                ...config,
                general: { ...config.general, scrollback_lines: parseInt(e.target.value) || 1000 }
              })}
              className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-neutral-950 px-4 py-3 flex justify-end gap-3 border-t border-neutral-800">
          <button 
            onClick={onClose}
            className="px-4 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
