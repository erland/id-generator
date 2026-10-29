import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  define: {
    'import.meta.env.VITE_SINGLE_FILE': JSON.stringify('true'),
  },
  build: {
    outDir: 'dist-single',
    assetsInlineLimit: 100000000,
  },
})
