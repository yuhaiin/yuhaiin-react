import tailwindcss from '@tailwindcss/postcss';
import flexbugsFixes from 'postcss-flexbugs-fixes';
import presetEnv from 'postcss-preset-env';

export default {
  plugins: [
    tailwindcss(),
    flexbugsFixes(),
    presetEnv({
      autoprefixer: { flexbox: 'no-2009' },
      stage: 3,
      features: { 'custom-properties': false }
    })
  ]
};
