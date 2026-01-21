import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    root: 'src',
    server: {
        port: 3000,
        strictPort: true,
    },
    build: {
        outDir: '../build',
        emptyOutDir: true,
    },
});
