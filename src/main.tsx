import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './style.css'
import { registerSW } from 'virtual:pwa-register'

// アプリ起動時にService Workerの更新を確認
registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (registration) {
      registration.update()
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
