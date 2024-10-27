// vite.config.js
import { defineConfig } from "file:///Users/salgadom/Work/4prop/react-4prop-crm/node_modules/vite/dist/node/index.js";
import react from "file:///Users/salgadom/Work/4prop/react-4prop-crm/node_modules/@vitejs/plugin-react/dist/index.mjs";
import jsconfigPaths from "file:///Users/salgadom/Work/4prop/react-4prop-crm/node_modules/vite-jsconfig-paths/dist/index.mjs";
import { TanStackRouterVite } from "file:///Users/salgadom/Work/4prop/react-4prop-crm/node_modules/@tanstack/router-vite-plugin/dist/esm/index.js";
import basicSsl from "file:///Users/salgadom/Work/4prop/react-4prop-crm/node_modules/@vitejs/plugin-basic-ssl/dist/index.mjs";
var vite_config_default = defineConfig(({ command, mode }) => {
  const shared = {
    plugins: [
      basicSsl(),
      react(),
      jsconfigPaths()
      // TanStackRouterVite()
    ]
  };
  if (command === "serve") {
    return {
      base: "/crm",
      plugins: [...shared.plugins]
    };
  }
  return {
    base: "/new/agentab_crm",
    build: {
      outDir: "../4prop-backend/web/volumes/html/seo/agentab_crm",
      emptyOutDir: true,
      manifest: true,
      rollupOptions: {
        input: "src/main.jsx"
      }
    },
    plugins: [...shared.plugins]
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvc2FsZ2Fkb20vV29yay80cHJvcC9yZWFjdC00cHJvcC1jcm1cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9zYWxnYWRvbS9Xb3JrLzRwcm9wL3JlYWN0LTRwcm9wLWNybS92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvc2FsZ2Fkb20vV29yay80cHJvcC9yZWFjdC00cHJvcC1jcm0vdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IGpzY29uZmlnUGF0aHMgZnJvbSAndml0ZS1qc2NvbmZpZy1wYXRocydcbmltcG9ydCB7IFRhblN0YWNrUm91dGVyVml0ZSB9IGZyb20gJ0B0YW5zdGFjay9yb3V0ZXItdml0ZS1wbHVnaW4nXG5pbXBvcnQgYmFzaWNTc2wgZnJvbSAnQHZpdGVqcy9wbHVnaW4tYmFzaWMtc3NsJ1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQsIG1vZGUgfSkgPT4ge1xuXG4gIGNvbnN0IHNoYXJlZCA9IHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICBiYXNpY1NzbCgpLFxuICAgICAgcmVhY3QoKSxcbiAgICAgIGpzY29uZmlnUGF0aHMoKSxcbiAgICAgIC8vIFRhblN0YWNrUm91dGVyVml0ZSgpXG4gICAgXVxuICB9XG5cbiAgaWYgKGNvbW1hbmQgPT09ICdzZXJ2ZScpIHtcbiAgXG4gICAgcmV0dXJuIHtcbiAgICAgIGJhc2U6IFwiL2NybVwiLFxuICAgICAgcGx1Z2luczogWy4uLnNoYXJlZC5wbHVnaW5zXVxuICAgIH1cbiAgICBcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYmFzZTogJy9uZXcvYWdlbnRhYl9jcm0nLFxuICAgIGJ1aWxkOiB7XG4gICAgICBvdXREaXI6ICcuLi80cHJvcC1iYWNrZW5kL3dlYi92b2x1bWVzL2h0bWwvc2VvL2FnZW50YWJfY3JtJyxcbiAgICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxuICAgICAgbWFuaWZlc3Q6IHRydWUsXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIGlucHV0OiAnc3JjL21haW4uanN4J1xuICAgICAgfVxuICAgIH0sXG4gICAgcGx1Z2luczogWy4uLnNoYXJlZC5wbHVnaW5zXSxcbiAgfVxuXG59KSJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1QsU0FBUyxvQkFBb0I7QUFDN1UsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sbUJBQW1CO0FBQzFCLFNBQVMsMEJBQTBCO0FBQ25DLE9BQU8sY0FBYztBQUdyQixJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLFNBQVMsS0FBSyxNQUFNO0FBRWpELFFBQU0sU0FBUztBQUFBLElBQ2IsU0FBUztBQUFBLE1BQ1AsU0FBUztBQUFBLE1BQ1QsTUFBTTtBQUFBLE1BQ04sY0FBYztBQUFBO0FBQUEsSUFFaEI7QUFBQSxFQUNGO0FBRUEsTUFBSSxZQUFZLFNBQVM7QUFFdkIsV0FBTztBQUFBLE1BQ0wsTUFBTTtBQUFBLE1BQ04sU0FBUyxDQUFDLEdBQUcsT0FBTyxPQUFPO0FBQUEsSUFDN0I7QUFBQSxFQUVGO0FBRUEsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsYUFBYTtBQUFBLE1BQ2IsVUFBVTtBQUFBLE1BQ1YsZUFBZTtBQUFBLFFBQ2IsT0FBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTLENBQUMsR0FBRyxPQUFPLE9BQU87QUFBQSxFQUM3QjtBQUVGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
