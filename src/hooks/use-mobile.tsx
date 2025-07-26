
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    const handleResize = () => {
      setIsMobile(mediaQuery.matches)
    }

    // Set initial state
    handleResize()
    
    // Listen for changes
    mediaQuery.addEventListener("change", handleResize)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleResize)
    }
  }, [])

  return isMobile
}
