import purgeCSS from '@fullhuman/postcss-purgecss';
import flexbugsFixes from 'postcss-flexbugs-fixes';
import presetEnv from 'postcss-preset-env';

export default (ctx) => ({
    plugins: [
        flexbugsFixes,
        presetEnv({
            autoprefixer: { flexbox: 'no-2009' },
            stage: 3,
            features: { 'custom-properties': false }
        }),
        ctx.env === 'production' &&
        purgeCSS({
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