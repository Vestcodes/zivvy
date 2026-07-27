import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Detect whether the viewport is below the mobile breakpoint.
 *
 * Returns `undefined` during SSR / first client paint (before the effect
 * runs), then the resolved boolean. Consumers that conditionally render
 * based on this value should treat `undefined` as "desktop" (the more
 * common SSR assumption) to avoid a hydration mismatch.
 *
 * A 150 ms debounce prevents rapid state thrashing when the user drags
 * the browser edge across the breakpoint.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const update = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    const onChange = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(update, 150)
    }

    mql.addEventListener("change", onChange)
    // Immediate initial read — no debounce on mount.
    update()

    return () => {
      mql.removeEventListener("change", onChange)
      if (debounceTimer) clearTimeout(debounceTimer)
    }
  }, [])

  return !!isMobile
}
