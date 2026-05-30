/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'error-container': '#ffdad6',
        'surface': '#f8f9ff',
        'on-surface-variant': '#434655',
        'secondary-fixed-dim': '#c3c0ff',
        'surface-container-high': '#dce9ff',
        'secondary-container': '#645efb',
        'outline': '#737686',
        'tertiary-container': '#bc4800',
        'on-error-container': '#93000a',
        'surface-dim': '#cbdbf5',
        'on-secondary-fixed': '#0f0069',
        'on-primary-fixed': '#00174b',
        'primary': '#004ac6',
        'inverse-surface': '#213145',
        'surface-container-low': '#eff4ff',
        'surface-container-highest': '#d3e4fe',
        'on-tertiary': '#ffffff',
        'tertiary': '#943700',
        'surface-bright': '#f8f9ff',
        'inverse-on-surface': '#eaf1ff',
        'on-secondary': '#ffffff',
        'secondary': '#4b41e1',
        'surface-variant': '#d3e4fe',
        'on-primary-fixed-variant': '#003ea8',
        'secondary-fixed': '#e2dfff',
        'surface-container': '#e5eeff',
        'inverse-primary': '#b4c5ff',
        'surface-container-lowest': '#ffffff',
        'on-tertiary-container': '#ffede6',
        'tertiary-fixed-dim': '#ffb596',
        'surface-tint': '#0053db',
        'primary-container': '#2563eb',
        'primary-fixed': '#dbe1ff',
        'tertiary-fixed': '#ffdbcd',
        'on-error': '#ffffff',
        'on-background': '#0b1c30',
        'outline-variant': '#c3c6d7',
        'on-primary': '#ffffff',
        'primary-fixed-dim': '#b4c5ff',
        'on-primary-container': '#eeefff',
        'on-surface': '#0b1c30',
        'error': '#ba1a1a',
        'on-secondary-fixed-variant': '#3323cc',
        'background': '#f8f9ff',
        'on-tertiary-fixed': '#360f00',
        'on-tertiary-fixed-variant': '#7d2d00',
        'on-secondary-container': '#fffbff'
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      },
      spacing: {
        'gutter': '16px',
        'base': '4px',
        'xs': '4px',
        'container-padding': '24px',
        'md': '16px',
        'xl': '32px',
        'sm': '8px',
        'lg': '24px'
      },
      fontFamily: {
        'label-sm': ['Inter'],
        'display': ['Inter'],
        'body-md': ['Inter'],
        'body-lg': ['Inter'],
        'body-sm': ['Inter'],
        'label-md': ['Inter'],
        'headline-lg-mobile': ['Inter'],
        'headline-md': ['Inter'],
        'headline-lg': ['Inter']
      },
      fontSize: {
        'label-sm': ['11px', { lineHeight: '14px', fontWeight: '500' }],
        'display': ['36px', { lineHeight: '44px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
        'headline-lg-mobile': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'headline-lg': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }]
      }
    }
  },
  plugins: []
}
