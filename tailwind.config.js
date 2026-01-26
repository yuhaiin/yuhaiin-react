/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--bs-primary)',
        secondary: 'var(--bs-secondary)',
        success: 'var(--bs-success)',
        info: 'var(--bs-info)',
        warning: 'var(--bs-warning)',
        danger: 'var(--bs-danger)',
        light: 'var(--bs-light)',
        dark: 'var(--bs-dark)',
        tertiary: 'var(--bs-tertiary-bg)',
        body: 'var(--bs-body-bg)',
        'body-text': 'var(--bs-body-color)',

        sidebar: {
            DEFAULT: 'var(--sidebar-bg)',
            fg: 'var(--sidebar-color)',
            active: 'var(--sidebar-active-bg)',
            'active-fg': 'var(--sidebar-active-color)',
            border: 'var(--sidebar-border-color)',
            hover: 'var(--sidebar-hover-bg)',
        },
      },
      borderRadius: {
        'sidebar': 'var(--sidebar-radius)',
      },
      spacing: {
        'sidebar-gap': 'var(--sidebar-gap)',
      },
      keyframes: {
        slideDown: {
          from: { height: '0', opacity: '0' },
          to: { height: 'var(--radix-collapsible-content-height)', opacity: '1' },
        },
        slideUp: {
          from: { height: 'var(--radix-collapsible-content-height)', opacity: '1' },
          to: { height: '0', opacity: '0' },
        },
      },
      animation: {
        slideDown: 'slideDown 0.3s ease-out',
        slideUp: 'slideUp 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
