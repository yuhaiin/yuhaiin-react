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
        body: 'var(--bs-body-bg)',
        'body-color': 'var(--bs-body-color)',
        'tertiary-bg': 'var(--bs-tertiary-bg)',
        'secondary-bg': 'var(--bs-secondary-bg)',
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
        },
        dataUpdate: {
          '0%': { opacity: '0.6', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUpAndFade: {
          'from': { opacity: '0', transform: 'translateY(2px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRightAndFade: {
          'from': { opacity: '0', transform: 'translateX(-2px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        slideDownAndFade: {
          'from': { opacity: '0', transform: 'translateY(-2px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeftAndFade: {
          'from': { opacity: '0', transform: 'translateX(2px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        dropdownSlideUpAndFade: {
          'from': { opacity: '0', transform: 'translateY(4px) scale(0.98)' },
          'to': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        dropdownSlideDownAndFade: {
          'from': { opacity: '0', transform: 'translateY(-4px) scale(0.98)' },
          'to': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        dropdownFadeOut: {
          'from': { opacity: '1', transform: 'scale(1)' },
          'to': { opacity: '0', transform: 'scale(0.98)' },
        },
      },
      animation: {
        slideDown: 'slideDown 0.3s ease-out',
        slideUp: 'slideUp 0.3s ease-out',
        dataUpdate: 'dataUpdate 0.2s ease-out',
        slideUpAndFade: 'slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideRightAndFade: 'slideRightAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideDownAndFade: 'slideDownAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideLeftAndFade: 'slideLeftAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        dropdownSlideUpAndFade: 'dropdownSlideUpAndFade 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        dropdownSlideDownAndFade: 'dropdownSlideDownAndFade 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        dropdownFadeOut: 'dropdownFadeOut 150ms ease-in forwards',
      }
    },
  },
  plugins: [],
}
