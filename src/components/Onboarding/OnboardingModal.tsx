import { useEffect, useState } from 'react'
import { useTauri } from '../../hooks/useTauri'
import type { Config } from '../../types'

interface OnboardingModalProps {
  onComplete: (config: Config) => void
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const { saveConfig, getConfig } = useTauri()
  const [selectedShell, setSelectedShell] = useState<'Bash' | 'Zsh' | 'PowerShell' | 'Fish'>('Bash')

  // Set initial default based on OS
  useEffect(() => {
    const isWindows = navigator.userAgent.toLowerCase().includes('win')
    if (isWindows) {
      setSelectedShell('PowerShell')
    }
  }, [])

  const handleGetStarted = async () => {
    try {
      // Dapatkan default layout/config kosongan dari Rust
      const config = await getConfig()
      config.general.default_shell = selectedShell
      
      // Simpan perubahan awal (menciptakan file `config.toml` di disk)
      await saveConfig(config)
      
      // Panggil callback parent
      onComplete(config)
    } catch (e) {
      console.error('Failed to initialize config:', e)
    }
  }

  const shells: Array<'Bash' | 'Zsh' | 'PowerShell' | 'Fish'> = [
    'Bash', 'Zsh', 'PowerShell', 'Fish'
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome to Termitur</h1>
        <p className="text-neutral-400 mb-8">Your terminal, now structured.</p>

        <div className="text-left bg-neutral-950 p-5 rounded-lg border border-neutral-800 mb-8">
          <p className="text-sm text-neutral-300 font-semibold mb-4">Choose your default shell:</p>
          
          <div className="grid grid-cols-2 gap-3">
            {shells.map((s) => (
              <label 
                key={s} 
                className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-colors border ${
                  selectedShell === s 
                    ? 'border-blue-500 bg-blue-500/10 text-white' 
                    : 'border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-400'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedShell === s ? 'border-blue-500' : 'border-neutral-600'
                }`}>
                  {selectedShell === s && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                </div>
                <span className="text-sm font-medium">{s}</span>
                <input 
                  type="radio" 
                  name="shell" 
                  value={s} 
                  checked={selectedShell === s}
                  onChange={() => setSelectedShell(s)}
                  className="hidden"
                />
              </label>
            ))}
          </div>
        </div>

        <button 
          onClick={handleGetStarted}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  )
}
