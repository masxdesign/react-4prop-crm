import { useEffect, useState } from 'react'

/**
 * Hook to detect if running in development mode
 * @returns {boolean} True if running in development mode
 */
export const useDevMode = () => {
  const [isDevMode, setIsDevMode] = useState(false)

  useEffect(() => {
    const isDev = 
      import.meta.env.DEV && // Vite's development mode flag
      (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        import.meta.env.VITE_ENV === 'development'
      )

    setIsDevMode(isDev)
  }, [])

  return isDevMode
}