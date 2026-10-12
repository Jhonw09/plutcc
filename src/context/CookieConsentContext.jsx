import { createContext, useContext, useState, useCallback } from 'react'
import { STORAGE_KEYS } from '../constants/storageKeys'

const CURRENT_VERSION = '1'

function readConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.cookieConsent)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveConsent(value) {
  try {
    localStorage.setItem(STORAGE_KEYS.cookieConsent, JSON.stringify({
      version: CURRENT_VERSION,
      decidedAt: new Date().toISOString(),
      ...value,
    }))
  } catch {}
}

const CookieConsentContext = createContext(null)

export function CookieConsentProvider({ children }) {
  const [consent, setConsent] = useState(() => readConsent())
  const [open, setOpen] = useState(false)

  // Banner visível se ainda não decidiu
  const bannerVisible = consent === null

  const acceptAll = useCallback(() => {
    const c = { essential: true }
    saveConsent(c)
    setConsent(c)
  }, [])

  const rejectOptional = useCallback(() => {
    const c = { essential: true }
    saveConsent(c)
    setConsent(c)
  }, [])

  const openPreferences = useCallback(() => setOpen(true), [])
  const closePreferences = useCallback(() => setOpen(false), [])

  return (
    <CookieConsentContext.Provider value={{
      consent, bannerVisible, open,
      acceptAll, rejectOptional, openPreferences, closePreferences,
    }}>
      {children}
    </CookieConsentContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCookieConsent() {
  return useContext(CookieConsentContext)
}
