import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        // visualizer({
        //     filename: './dist/stats.html',
        //     gzipSize: true,
        //     brotliSize: true,
        // }),
    ],
    css: {
        modules: {
            generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
    },
    server: {
        allowedHosts: true
    },
    resolve: {
        tsconfigPaths: true,
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    const packageName = id.replaceAll('\\', '/').split('/node_modules/').at(-1);
                    if (!packageName || packageName === id) return;
                    const name = packageName.startsWith('@') ? packageName.split('/').slice(0, 2).join('/') : packageName.split('/')[0];
                    if (['react', 'react-dom', 'scheduler'].includes(name)) return 'react';
                    if (name === 'uplot') return 'uplot';
                    if (['chart.js', '@kurkle/color'].includes(name)) return 'chartjs';

                }
            }
        }
    }
})
