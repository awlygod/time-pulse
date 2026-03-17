/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        timecapsule: {
          primary: '#ffffff',
          'primary-content': '#111111',
          secondary: '#1a1a1a',
          accent: '#4ade80',
          neutral: '#161616',
          'base-100': '#0a0a0a',
          'base-200': '#111111',
          'base-300': '#161616',
          'base-content': '#f0f0f0',
        },
      },
    ],
  },
}
