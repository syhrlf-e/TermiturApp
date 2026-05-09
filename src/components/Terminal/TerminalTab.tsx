import { useState, useRef, useEffect } from 'react'
import type { KeyboardEvent, DragEvent } from 'react'
import type { TerminalState } from '../../types'

interface TerminalTabProps {
  tab: TerminalState
  isActive: boolean
  onClick: () => void
  onClose: () => void
  onRename: (newName: string) => void
  
  // For Drag and Drop reordering
  index: number
  onDragStart: (index: number) => void
  onDragEnter: (index: number) => void
  onDragEnd: () => void
}

export function TerminalTab({
  tab,
  isActive,
  onClick,
  onClose,
  onRename,
  index,
  onDragStart,
  onDragEnter,
  onDragEnd
}: TerminalTabProps) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [editName, setEditName] = useState(tab.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])

  const handleDoubleClick = () => setIsRenaming(true)

  const handleSubmitRename = () => {
    if (editName.trim() && editName !== tab.name) {
      onRename(editName.trim())
    } else {
      setEditName(tab.name)
    }
    setIsRenaming(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmitRename()
    } else if (e.key === 'Escape') {
      setEditName(tab.name)
      setIsRenaming(false)
    }
  }
  
  const handleDragStartEvent = (e: DragEvent<HTMLDivElement>) => {
    if (isRenaming) {
      e.preventDefault()
      return
    }
    e.dataTransfer.effectAllowed = 'move'
    onDragStart(index)
  }

  return (
    <div
      className={`group relative flex items-center justify-between px-3 py-1.5 min-w-[120px] max-w-[200px] border-r border-neutral-800 cursor-pointer select-none transition-colors ${
        isActive 
          ? 'bg-neutral-800 text-white border-t-2 border-t-blue-500' 
          : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800/80 border-t-2 border-t-transparent'
      }`}
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
      draggable={!isRenaming}
      onDragStart={handleDragStartEvent}
      onDragEnter={() => onDragEnter(index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="flex-1 overflow-hidden mr-2">
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSubmitRename}
            onKeyDown={handleKeyDown}
            className="w-full bg-neutral-950 border border-blue-500 rounded px-1 text-xs text-white outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="text-xs truncate">{tab.name}</div>
        )}
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className={`w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-700 transition-colors ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
      >
        <span className="text-[10px]">✕</span>
      </button>
    </div>
  )
}
