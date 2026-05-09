import { useState, useRef, useEffect } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import type { ProjectState } from '../../types'
import { ContextMenu } from './ContextMenu'

interface ProjectItemProps {
  project: ProjectState
  isActive: boolean
  isGitInitialized: boolean
  isError?: boolean
  onClick: () => void
  onRename: (id: string, newName: string) => void
  onDelete: (id: string) => void
  subLabel?: string
}

export function ProjectItem({ 
  project, 
  isActive, 
  isGitInitialized,
  isError,
  onClick, 
  onRename,
  onDelete,
  subLabel 
}: ProjectItemProps) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [editName, setEditName] = useState(project.name)
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])

  const handleDoubleClick = (e: ReactMouseEvent) => {
    e.stopPropagation()
    setIsRenaming(true)
  }

  const handleContextMenu = (e: ReactMouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const handleSubmitRename = () => {
    if (editName.trim() && editName !== project.name) {
      onRename(project.id, editName.trim())
    } else {
      setEditName(project.name)
    }
    setIsRenaming(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitRename()
    } else if (e.key === 'Escape') {
      setEditName(project.name)
      setIsRenaming(false)
    }
  }

  return (
    <>
      <div 
        className={`group relative flex items-center justify-between px-3 py-2 cursor-pointer select-none rounded-md transition-colors ${
          isActive 
            ? 'bg-neutral-800 text-white' 
            : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
        }`}
        onClick={onClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        title={subLabel}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSubmitRename}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-neutral-900 border border-blue-500 rounded px-1 py-0.5 text-sm text-white outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm">{project.name}</span>
              {subLabel && (
                <span className="text-[10px] text-neutral-500 truncate hidden group-hover:block">
                  {subLabel}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center flex-shrink-0 ml-2">
          {isError ? (
            <span className="w-2 h-2 rounded-full bg-red-500" title="Path not found or permission denied"></span>
          ) : isGitInitialized ? (
            <span className="w-2 h-2 rounded-full bg-green-500" title="Git repository"></span>
          ) : null}
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onRename={() => {
            setIsRenaming(true)
          }}
          onAddGroup={() => {
            console.log('Add group for', project.id) // Phase 11
          }}
          onDelete={() => {
            onDelete(project.id)
          }}
        />
      )}
    </>
  )
}
