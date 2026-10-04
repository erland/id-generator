import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import './styles/global.css'
import { applyTheme, readThemePreference, resolveTheme } from './utils/theme'
import { registerServiceWorker } from './pwa/registerServiceWorker'

const initialPreference = readThemePreference()
const initialPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
applyTheme(resolveTheme(initialPreference, initialPrefersDark))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

registerServiceWorker()
