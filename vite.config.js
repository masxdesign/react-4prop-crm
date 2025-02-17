import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import jsconfigPaths from 'vite-jsconfig-paths'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import svgr from "vite-plugin-svgr"
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {

  const shared = {
    plugins: [
      basicSsl(),
      react(),
      jsconfigPaths(),
      svgr()
      // TanStackRouterVite()
    ]
  }

  if (command === 'serve') {
  
    return {
      base: "/crm",
      plugins: [...shared.plugins]
    }
    
  }

  return {
    base: '/new/agentab_crm',
    build: {
      outDir: '../4prop-backend/web/volumes/html/seo/agentab_crm',
      emptyOutDir: true,
      manifest: true,
      rollupOptions: {
        input: 'src/main.jsx'
      }
    },
    plugins: [...shared.plugins],
    experimental: {
      renderBuiltUrl(filename, { hostId, hostType, type }) {
        if (type === 'public') {
          return 'https://localhost:5173/' + filename
        }
        else if (path.extname(hostId) === '.js') {
          return { runtime: `window.__assetsPath(${JSON.stringify(filename)})` }
        }
        else {
          return 'https://localhost:5173/' + filename
        }
      }
    }
  }

})