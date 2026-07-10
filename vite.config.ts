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
                    if (id.includes('node_modules')) {
                        const rules: Array<{ match: string | string[]; chunk: string }> = [
                            { match: 'radix', chunk: 'radix-ui' },
                            { match: 'uplot', chunk: 'uplot' },
                            { match: 'bootstrap', chunk: 'bootstrap' },
                            { match: 'lucide', chunk: 'lucide' },
                            { match: 'tanstack', chunk: 'tanstack' },
                            { match: 'motion', chunk: 'motion' },
                            { match: ['react', 'react-dom', 'scheduler'], chunk: 'react' },
                        ];

                        for (const { match, chunk } of rules) {
                            if (Array.isArray(match)) {
                                if (match.some(k => id.includes(k))) return chunk;
                            } else {
                                if (id.includes(match)) return chunk;
                            }
                        }

                        return 'vendor';
                    }
                }
            }
        }
    }
})
