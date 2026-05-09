import { getCurrentWindow } from '@tauri-apps/api/window'
import { useState, useEffect } from 'react'

export function Titlebar() {
  const [isMaximized, setIsMaximized] = useState(false)
  const appWindow = getCurrentWindow()

  useEffect(() => {
    // Listen for resize events to update the maximize icon
    const unlisten = appWindow.onResized(async () => {
      const maximized = await appWindow.isMaximized()
      setIsMaximized(maximized)
    })
    
    // Initial check
    appWindow.isMaximized().then(setIsMaximized)

    return () => {
      unlisten.then(f => f())
    }
  }, [appWindow])

  return (
    <div 
      data-tauri-drag-region 
      className="h-8 bg-neutral-950 flex items-center justify-between select-none flex-shrink-0"
      onDoubleClick={() => appWindow.toggleMaximize()}
    >
      <div 
        data-tauri-drag-region 
        className="pl-3 flex-1 flex items-center gap-2 pointer-events-none h-full"
      >
        <span className="text-xs font-bold text-neutral-400 tracking-wide uppercase">Termitur</span>
      </div>
      
      <div className="flex h-full">
        <button 
          className="w-12 h-full flex items-center justify-center hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          onClick={() => appWindow.minimize()}
          title="Minimize"
        >
          <span className="text-xs mb-1">_</span>
        </button>
        <button 
          className="w-12 h-full flex items-center justify-center hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          onClick={() => appWindow.toggleMaximize()}
          title={isMaximized ? "Restore Down" : "Maximize"}
        >
          <span className="text-[10px] border border-current w-2.5 h-2.5"></span>
        </button>
        <button 
          className="w-12 h-full flex items-center justify-center hover:bg-red-500 text-neutral-400 hover:text-white transition-colors"
          onClick={() => appWindow.close()}
          title="Close"
        >
          <span className="text-sm">✕</span>
        </button>
      </div>
    </div>
  )
}
