import { useState, useCallback } from 'react'

let _id = 0

/**
 * Lightweight toast queue.
 * Returns { toasts, toast } where toast(message, type) adds a new entry.
 * Each toast auto-dismisses after `duration` ms.
 */
export function useToast(duration = 3200) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message, type = 'success') => {
    const id = ++_id
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => dismiss(id), duration)
  }, [dismiss, duration])

  return { toasts, toast, dismiss }
}
