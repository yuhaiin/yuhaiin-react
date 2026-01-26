import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        tanstackRouter(),
        react(),
        tsconfigPaths(),
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
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        const rules: Array<{ match: string | string[]; chunk: string }> = [
                            { match: 'radix', chunk: 'radix-ui' },
                            { match: 'uplot', chunk: 'uplot' },
                            { match: 'protobuf', chunk: 'protobuf' },
                            { match: 'bootstrap', chunk: 'bootstrap' },
                            { match: 'lucide', chunk: 'lucide' },
                            { match: 'tanstack', chunk: 'tanstack' },
                            { match: 'framer-motion', chunk: 'framer-motion' },
                            { match: ['react', 'react-dom'], chunk: 'react' },
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
