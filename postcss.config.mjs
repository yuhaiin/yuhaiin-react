import purgeCSSPlugin from '@fullhuman/postcss-purgecss';
import flexbugsFixes from 'postcss-flexbugs-fixes';
import presetEnv from 'postcss-preset-env';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default (ctx) => ({
    plugins: [
        tailwindcss(),
        flexbugsFixes(),
        presetEnv({
            autoprefixer: { flexbox: 'no-2009' },
            stage: 3,
            features: { 'custom-properties': false }
        }),
        // Explicit autoprefixer after tailwind if needed, but presetEnv usually handles it.
        // However, Tailwind docs recommend adding autoprefixer explicitly.
        // Since presetEnv has it, we might get double prefixing or conflicts, but usually it's fine.
        // To be safe and standard with Tailwind:
        autoprefixer(),
        ctx.env === 'production' &&
        purgeCSSPlugin({
            content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
            defaultExtractor: content =>
                content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [],
            safelist: {
                standard: ['html', 'body'],
                deep: [
                    /^show$/,
                    /^active$/,
                    /^collapse$/,
                    /^modal$/,
                    /module/,
                    /__/,
                    /^uplot/,
                    /^u-/
                ]
            },
        })
    ].filter(Boolean)
});
