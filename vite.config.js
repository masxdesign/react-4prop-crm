import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import jsconfigPaths from 'vite-jsconfig-paths'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {

  const shared = {
    plugins: [
      basicSsl(),
      react(),
      jsconfigPaths(),
      TanStackRouterVite()
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
    plugins: [...shared.plugins]
  }

})