import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar/Sidebar'
import { TerminalArea } from './components/Terminal/TerminalArea'
import { Titlebar } from './components/Titlebar/Titlebar'
import { OnboardingModal } from './components/Onboarding/OnboardingModal'
import { useTauri } from './hooks/useTauri'
import { useKeybinding } from './hooks/useKeybinding'

function App() {
  const [isFirstRunState, setIsFirstRunState] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const { isFirstRun } = useTauri()

  useKeybinding()

  useEffect(() => {
    const checkFirstRun = async () => {
      try {
        const first = await isFirstRun()
        setIsFirstRunState(first)
      } catch (e) {
        console.error('Failed to check first run', e)
      } finally {
        setLoading(false)
      }
    }
    checkFirstRun()
  }, [isFirstRun])

  if (loading) {
    return <div className="h-screen w-screen bg-neutral-950"></div>
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-neutral-900 text-neutral-100 font-mono overflow-hidden">
      <Titlebar />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Component */}
        <Sidebar />

        {/* Terminal Area */}
        <TerminalArea />
      </div>

      {/* Onboarding Overlay */}
      {isFirstRunState && (
        <OnboardingModal 
          onComplete={() => {
            setIsFirstRunState(false)
            window.location.reload() // Reload app state easily after first run setup
          }}
        />
      )}
    </div>
  )
}

export default App
