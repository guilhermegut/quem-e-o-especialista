import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// PREVIEW=1 gera um único index.html autocontido (prévia como artifact).
// Sem a variável, gera o site estático normal, com carregamento sob demanda (GitHub Pages).
const preview = process.env.PREVIEW === '1';
if (preview) process.env.VITE_PREVIEW = '1';

export default defineConfig({
  base: './',
  plugins: [react(), ...(preview ? [viteSingleFile()] : [])],
  build: { outDir: preview ? 'dist-preview' : 'dist', chunkSizeWarningLimit: 4000 },
  test: { environment: 'node' },
});
