const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client'
let scriptPromise

function loadGoogleIdentity() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id)
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      let script = document.querySelector(`script[src="${GOOGLE_SCRIPT_URL}"]`)
      if (!script) {
        script = document.createElement('script')
        script.src = GOOGLE_SCRIPT_URL
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      }

      const timeout = window.setTimeout(() => reject(new Error('O serviço do Google demorou para responder. Tente novamente.')), 10000)
      script.addEventListener('load', () => {
        window.clearTimeout(timeout)
        if (window.google?.accounts?.id) resolve(window.google.accounts.id)
        else reject(new Error('Não foi possível carregar a confirmação do Google.'))
      }, { once: true })
      script.addEventListener('error', () => {
        window.clearTimeout(timeout)
        reject(new Error('Não foi possível carregar a confirmação do Google.'))
      }, { once: true })
    }).catch((error) => {
      scriptPromise = null
      throw error
    })
  }
  return scriptPromise
}

export async function requestFreshGoogleIdToken() {
  if (!CLIENT_ID) throw new Error('A confirmação do Google não está configurada neste ambiente.')
  const identity = await loadGoogleIdentity()

  return new Promise((resolve, reject) => {
    let settled = false
    const finish = (callback, value) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeout)
      callback(value)
    }
    const timeout = window.setTimeout(
      () => finish(reject, new Error('A confirmação do Google expirou. Tente novamente.')),
      120000,
    )

    try {
      identity.initialize({
        client_id: CLIENT_ID,
        callback: (response) => {
          if (response?.credential) finish(resolve, response.credential)
          else finish(reject, new Error('O Google não retornou uma confirmação válida.'))
        },
        auto_select: false,
        context: 'signin',
        ux_mode: 'popup',
      })
      identity.prompt((notification) => {
        if (settled) return
        if (notification?.isNotDisplayed?.()
          || notification?.isSkippedMoment?.()
          || notification?.isDismissedMoment?.()) {
          finish(reject, new Error('Não foi possível confirmar sua identidade com o Google. Tente novamente.'))
        }
      })
    } catch {
      finish(reject, new Error('Não foi possível iniciar a confirmação do Google. Tente novamente.'))
    }
  })
}
