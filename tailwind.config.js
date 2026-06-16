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
        ui: {
          bg: 'var(--color-bg)',
          fg: 'var(--color-fg)',
          muted: 'var(--color-muted)',
          heading: 'var(--color-heading)',
          surface: 'var(--color-surface)',
          'surface-muted': 'var(--color-surface-muted)',
          list: 'var(--color-list-row)',
          'list-hover': 'var(--color-list-row-hover)',
          'list-border-hover': 'var(--color-list-row-border-hover)',
          border: 'var(--color-border)',
          hover: 'var(--color-hover)',
          primary: 'var(--color-primary)',
          'primary-soft': 'var(--color-primary-soft)',
          danger: 'var(--color-danger)',
          'danger-soft': 'var(--color-danger-soft)',
          success: 'var(--color-success)',
          'success-soft': 'var(--color-success-soft)',
          warning: 'var(--color-warning)',
          'warning-soft': 'var(--color-warning-soft)',
          info: 'var(--color-info)',
          'info-soft': 'var(--color-info-soft)',
          chip: 'var(--color-chip)',
          'chip-fg': 'var(--color-chip-fg)',
          focus: 'var(--color-focus)',
        },
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
        field: 'var(--height-field)',
        'field-sm': 'var(--height-field-sm)',
        'list-row': 'var(--height-list-row)',
        'icon-lg': 'var(--size-icon-lg)',
      },
      borderRadius: {
        'sidebar-radius': 'var(--sidebar-radius)',
        'ui-xs': 'var(--radius-ui-xs)',
        'ui-sm': 'var(--radius-ui-sm)',
        'ui-md': 'var(--radius-ui-md)',
        'ui-lg': 'var(--radius-ui-lg)',
        'ui-xl': 'var(--radius-ui-xl)',
      },
      boxShadow: {
        'sidebar': 'var(--sidebar-box-shadow)',
        'sidebar-active': 'var(--sidebar-active-glow)',
        'ui-card': 'var(--shadow-card)',
        'ui-elevated': 'var(--shadow-elevated)',
        'ui-focus': 'var(--shadow-focus)',
        'inner-subtle': 'var(--shadow-inner-subtle)',
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
