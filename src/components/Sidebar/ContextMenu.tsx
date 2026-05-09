import { useState, useRef, useEffect } from 'react'
import type { MouseEvent } from 'react'

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onRename: () => void
  onAddGroup: () => void
  onDelete: () => void
}

export function ContextMenu({ x, y, onClose, onRename, onAddGroup, onDelete }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Adjust position if it goes off screen
  const [position, setPosition] = useState({ x, y })

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      let newX = x
      let newY = y

      if (x + rect.width > window.innerWidth) {
        newX = window.innerWidth - rect.width - 5
      }
      if (y + rect.height > window.innerHeight) {
        newY = window.innerHeight - rect.height - 5
      }
      
      setPosition({ x: newX, y: newY })
    }
  }, [x, y])

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    
    // Close on escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const handleItemClick = (action: () => void) => (e: MouseEvent) => {
    e.stopPropagation()
    action()
    onClose()
  }

  return (
    <div 
      ref={menuRef}
      className="fixed z-50 w-48 bg-neutral-800 border border-neutral-700 rounded-md shadow-xl py-1 text-sm text-neutral-200"
      style={{ top: position.y, left: position.x }}
    >
      <button 
        className="w-full text-left px-3 py-1.5 hover:bg-neutral-700 flex justify-between items-center"
        onClick={handleItemClick(onRename)}
      >
        <span>Rename</span>
        <span className="text-neutral-500 text-xs">Ctrl+R</span>
      </button>
      <button 
        className="w-full text-left px-3 py-1.5 hover:bg-neutral-700 flex justify-between items-center"
        onClick={handleItemClick(onAddGroup)}
      >
        <span>Add Group</span>
        <span className="text-neutral-500 text-xs">Ctrl+G</span>
      </button>
      <div className="h-px bg-neutral-700 my-1"></div>
      <button 
        className="w-full text-left px-3 py-1.5 hover:bg-neutral-700 text-red-400 flex justify-between items-center"
        onClick={handleItemClick(onDelete)}
      >
        <span>Delete</span>
        <span className="text-red-500/50 text-xs">Ctrl+W</span>
      </button>
    </div>
  )
}
