import 'vite/modulepreload-polyfill'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { onMessage, postMessage } from './utils/iframeHelpers.js'

postMessage({ type: "READY" })
window.addEventListener('message', onMessage)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <App />
  </React.StrictMode>,
)

