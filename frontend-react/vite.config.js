import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^react-datepicker$/,
        replacement: fileURLToPath(new URL('./node_modules/react-datepicker/dist/es/index.js', import.meta.url)),
      },
    ],
  },
})
