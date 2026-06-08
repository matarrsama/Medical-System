// vite.config.js
import { defineConfig } from "file:///C:/Users/matar/Documents/GitHub/Medical-System/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/matar/Documents/GitHub/Medical-System/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import electron from "file:///C:/Users/matar/Documents/GitHub/Medical-System/node_modules/vite-plugin-electron/dist/simple.mjs";
import { fileURLToPath, URL } from "node:url";
var __vite_injected_original_import_meta_url = "file:///C:/Users/matar/Documents/GitHub/Medical-System/vite.config.js";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    electron({
      main: {
        entry: "electron/main.js",
        vite: {
          build: {
            rollupOptions: {
              external: ["electron-updater"]
            }
          }
        }
      },
      preload: {
        input: "electron/preload.js",
        vite: {
          build: {
            rollupOptions: {
              output: {
                entryFileNames: "preload.cjs"
              }
            }
          }
        }
      }
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtYXRhclxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXE1lZGljYWwtU3lzdGVtXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtYXRhclxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXE1lZGljYWwtU3lzdGVtXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9tYXRhci9Eb2N1bWVudHMvR2l0SHViL01lZGljYWwtU3lzdGVtL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IGVsZWN0cm9uIGZyb20gJ3ZpdGUtcGx1Z2luLWVsZWN0cm9uL3NpbXBsZSdcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGgsIFVSTCB9IGZyb20gJ25vZGU6dXJsJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgdnVlKCksXG4gICAgZWxlY3Ryb24oe1xuICAgICAgbWFpbjoge1xuICAgICAgICBlbnRyeTogJ2VsZWN0cm9uL21haW4uanMnLFxuICAgICAgICB2aXRlOiB7XG4gICAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgZXh0ZXJuYWw6IFsnZWxlY3Ryb24tdXBkYXRlciddLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHByZWxvYWQ6IHtcbiAgICAgICAgaW5wdXQ6ICdlbGVjdHJvbi9wcmVsb2FkLmpzJyxcbiAgICAgICAgdml0ZToge1xuICAgICAgICAgIGJ1aWxkOiB7XG4gICAgICAgICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgICAgICAgIG91dHB1dDoge1xuICAgICAgICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiAncHJlbG9hZC5janMnLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKVxuICAgIH1cbiAgfVxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1UsU0FBUyxvQkFBb0I7QUFDclcsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sY0FBYztBQUNyQixTQUFTLGVBQWUsV0FBVztBQUg0SyxJQUFNLDJDQUEyQztBQUtoUSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsSUFDSixTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUEsUUFDSixPQUFPO0FBQUEsUUFDUCxNQUFNO0FBQUEsVUFDSixPQUFPO0FBQUEsWUFDTCxlQUFlO0FBQUEsY0FDYixVQUFVLENBQUMsa0JBQWtCO0FBQUEsWUFDL0I7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFNBQVM7QUFBQSxRQUNQLE9BQU87QUFBQSxRQUNQLE1BQU07QUFBQSxVQUNKLE9BQU87QUFBQSxZQUNMLGVBQWU7QUFBQSxjQUNiLFFBQVE7QUFBQSxnQkFDTixnQkFBZ0I7QUFBQSxjQUNsQjtBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
