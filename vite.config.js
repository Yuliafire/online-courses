import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
    root: 'src',
    build: {
        outDir: '../dist',
        assetsDir: 'assets', 
        emptyOutDir: true,
        rollupOptions: {
            input: path.resolve(__dirname, 'src/index.html')
        }
    },
});