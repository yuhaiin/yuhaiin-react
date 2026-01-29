/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

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
        },
        'accordion-down': {
          from: { height: '0', opacity: '0' },
          to: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
          to: { height: '0', opacity: '0' },
        },
        slideUpAndFade: {
          from: { opacity: '0', transform: 'translateY(4px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        slideDownAndFade: {
          from: { opacity: '0', transform: 'translateY(-4px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        slideLeftAndFade: {
          from: { opacity: '0', transform: 'translateX(2px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideRightAndFade: {
          from: { opacity: '0', transform: 'translateX(-2px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideDownAndFadeIn: {
          from: { opacity: '0', transform: 'translateY(-8px) scale(0.96)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        slideUpAndFadeIn: {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.96)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fadeOut: {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.98)' },
        },
        dataUpdate: {
          '0%': { opacity: '0.6', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      },
      animation: {
        slideDown: 'slideDown 0.3s ease-out',
        slideUp: 'slideUp 0.3s ease-out',
        'accordion-down': 'accordion-down 0.3s ease-out',
        'accordion-up': 'accordion-up 0.3s ease-out',
        slideUpAndFade: 'slideUpAndFade 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        slideDownAndFade: 'slideDownAndFade 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        slideLeftAndFade: 'slideLeftAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideRightAndFade: 'slideRightAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideDownAndFadeIn: 'slideDownAndFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        slideUpAndFadeIn: 'slideUpAndFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        fadeOut: 'fadeOut 0.15s ease-in forwards',
        dataUpdate: 'dataUpdate 0.2s ease-out',
      }
    },
  },
  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        '*': {
          'scrollbar-width': 'thin',
          'scrollbar-color': 'var(--scrollbar-thumb) var(--scrollbar-track)',
        },
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '::-webkit-scrollbar-track': {
          background: 'var(--scrollbar-track)',
        },
        '::-webkit-scrollbar-thumb': {
          'background-color': 'var(--scrollbar-thumb)',
          'border-radius': '4px',
        },
        '::-webkit-scrollbar-thumb:hover': {
          'background-color': 'var(--scrollbar-thumb-hover)',
        },
        '::-webkit-scrollbar-thumb:active': {
          'background-color': 'var(--scrollbar-thumb-active)',
        },
        '::-webkit-scrollbar-corner': {
          background: 'transparent',
        },
      });
    }),
  ],
}
