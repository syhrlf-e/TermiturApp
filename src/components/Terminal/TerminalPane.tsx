import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

import { useTauri } from '../../hooks/useTauri'
import { useTerminalEvents } from '../../hooks/useTerminal'
import type { Config } from '../../types'

interface TerminalPaneProps {
  sessionId: string
  projectId: string
  isActive: boolean
}

export function TerminalPane({ sessionId, isActive }: TerminalPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const isInitialized = useRef(false)
  const { writeToShell, resizePty, getConfig } = useTauri()

  // Initialize xterm.js
  useEffect(() => {
    if (!containerRef.current || isInitialized.current) return
    isInitialized.current = true

    const initTerminal = async () => {
      let config: Config | null = null
      try {
        config = await getConfig()
      } catch (e) {
        console.error('Failed to load config for xterm:', e)
      }

      const term = new Terminal({
        fontFamily: 'JetBrains Mono, monospace, Consolas',
        fontSize: config?.general.font_size || 14,
        scrollback: config?.general.scrollback_lines || 1000,
        theme: {
          background: '#000000',
          foreground: '#e5e5e5',
        },
        cursorBlink: true,
      })

      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      
      term.open(containerRef.current!)
      fitAddon.fit()

      // Handle user input
      term.onData((data) => {
        writeToShell(sessionId, data).catch(e => console.error('Write error:', e))
      })

      // Handle resize
      const onResize = () => {
        fitAddon.fit()
        resizePty(sessionId, term.cols, term.rows).catch(e => console.error('Resize error:', e))
      }

      // xterm's internal resize event
      term.onResize(({ cols, rows }) => {
        resizePty(sessionId, cols, rows).catch(e => console.error('Resize error:', e))
      })

      window.addEventListener('resize', onResize)

      xtermRef.current = term
      fitAddonRef.current = fitAddon

      // Initial fit to trigger backend resize
      setTimeout(() => {
        if (fitAddonRef.current && xtermRef.current) {
          fitAddonRef.current.fit()
          resizePty(sessionId, xtermRef.current.cols, xtermRef.current.rows).catch(e => console.error('Initial resize error:', e))
        }
      }, 100)
    }

    initTerminal()

    return () => {
      window.removeEventListener('resize', () => fitAddonRef.current?.fit())
      xtermRef.current?.dispose()
      isInitialized.current = false
    }
  }, [sessionId, getConfig, writeToShell, resizePty])

  // Refit when tab becomes active
  useEffect(() => {
    if (isActive && fitAddonRef.current) {
      setTimeout(() => fitAddonRef.current?.fit(), 50)
    }
  }, [isActive])

  // Listen to PTY events
  useTerminalEvents(
    (sid, data) => {
      if (sid === sessionId && xtermRef.current) {
        xtermRef.current.write(data)
      }
    },
    (_sid, _pid) => {
      // Handled by TerminalArea or a global listener to close the tab
    }
  )

  return (
    <div 
      className={`w-full h-full p-2 bg-black ${isActive ? 'block' : 'hidden'}`}
      ref={containerRef}
    />
  )
}
