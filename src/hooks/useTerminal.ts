import { useEffect } from 'react'
import { listen } from '@tauri-apps/api/event'

export const useTerminalEvents = (
  onData: (sessionId: string, data: string) => void,
  onExit: (sessionId: string, projectId: string) => void
) => {
  useEffect(() => {
    const unlistenData = listen<{ session_id: string, data: string }>(
      'pty-output',
      (event) => {
        onData(event.payload.session_id, event.payload.data)
      }
    )

    const unlistenExit = listen<{ session_id: string, project_id: string }>(
      'session-exit',
      (event) => {
        onExit(event.payload.session_id, event.payload.project_id)
      }
    )

    return () => {
      unlistenData.then(f => f())
      unlistenExit.then(f => f())
    }
  }, [onData, onExit])
}
