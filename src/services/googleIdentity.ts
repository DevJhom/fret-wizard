const scriptUrl = 'https://accounts.google.com/gsi/client'

let scriptLoading: Promise<void> | null = null
let initializedClientId: string | null = null
let credentialHandler: (credential: string) => void = () => {}

// Loaded on demand, the first time the sign-in modal opens.
const loadScript = (): Promise<void> => {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (!scriptLoading) {
    scriptLoading = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = scriptUrl
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => {
        scriptLoading = null
        reject(new Error('Could not load Google sign-in'))
      }
      document.head.appendChild(script)
    })
  }
  return scriptLoading
}

export const renderGoogleButton = async (element: HTMLElement, clientId: string, onCredential: (credential: string) => void): Promise<void> => {
  await loadScript()
  const id = window.google!.accounts.id
  credentialHandler = onCredential
  if (initializedClientId !== clientId) {
    id.initialize({ client_id: clientId, callback: response => credentialHandler(response.credential) })
    initializedClientId = clientId
  }
  id.renderButton(element, { type: 'standard', theme: 'outline', size: 'large', text: 'continue_with', width: 280 })
}
