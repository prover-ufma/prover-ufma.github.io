import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Caminhos relativos: funciona em https://<usuario>.github.io/<repositorio>/
  // sem precisar fixar o nome do repositório.
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
})
