import 'vite/modulepreload-polyfill'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { inIframe, setupIframeListener } from './utils/iframeHelpers'
import App from './App'
import './index.css'

if (inIframe()) {
  setupIframeListener()
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <App />
  </React.StrictMode>,
)