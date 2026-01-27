/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: 'var(--sidebar-bg)',
          color: 'var(--sidebar-color)',
          header: 'var(--sidebar-header-color)',
          border: 'var(--sidebar-border-color)',
          hover: 'var(--sidebar-hover-bg)',
          active: 'var(--sidebar-active-color)',
          'active-bg': 'var(--sidebar-active-bg)',
        },
        divider: 'var(--divider-color)',
      },
      spacing: {
        'sidebar-gap': 'var(--sidebar-gap)',
      },
      borderRadius: {
        'sidebar-radius': 'var(--sidebar-radius)',
      },
      boxShadow: {
        'sidebar': 'var(--sidebar-box-shadow)',
        'sidebar-active': 'var(--sidebar-active-glow)',
      },
      keyframes: {
        slideDown: {
          'from': { height: '0', opacity: '0' },
          'to': { height: 'var(--radix-collapsible-content-height)', opacity: '1' },
        },
        slideUp: {
          'from': { height: 'var(--radix-collapsible-content-height)', opacity: '1' },
          'to': { height: '0', opacity: '0' },
        }
      },
      animation: {
        slideDown: 'slideDown 0.3s ease-out',
        slideUp: 'slideUp 0.3s ease-out',
      }
    },
  },
  plugins: [],
}
