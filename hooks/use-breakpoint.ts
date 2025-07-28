'use client';

import * as React from 'react';

// Tailwind CSS default breakpoints
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
};

type Breakpoint = 'sm' | 'md' | 'lg' | undefined;

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>(undefined);

  React.useEffect(() => {
    // Check if window is defined (runs only on client-side)
    if (typeof window === 'undefined') {
        return;
    }

    const handleResize = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.md) {
        setBreakpoint('sm'); // Mobile
      } else if (width < BREAKPOINTS.lg) {
        setBreakpoint('md'); // Tablet
      } else {
        setBreakpoint('lg'); // Desktop
      }
    };

    // Set initial state
    handleResize();

    // Listen for changes
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return breakpoint;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    if (typeof window === 'undefined') {
        return;
    }
    const mediaQuery = window.matchMedia(`(max-width: ${BREAKPOINTS.md - 1}px)`)

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
