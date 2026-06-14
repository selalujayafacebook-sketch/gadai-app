/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy:    { 50:'#eff6ff',100:'#dbeafe',500:'#1e3a5f',600:'#162d4a',700:'#0f2033',800:'#0a1628',900:'#060e1a' },
        royal:   { 50:'#eff6ff',100:'#dbeafe',400:'#60a5fa',500:'#2563eb',600:'#1d4ed8',700:'#1e40af' },
        gold:    { 50:'#fffbeb',100:'#fef3c7',300:'#fcd34d',400:'#fbbf24',500:'#f59e0b',600:'#d97706',700:'#b45309' },
        emerald: { 50:'#ecfdf5',400:'#34d399',500:'#10b981',600:'#059669' },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
      animation: {
        'fade-in':   'fadeIn .25s ease',
        'slide-up':  'slideUp .3s ease',
        'slide-in':  'slideIn .25s ease',
        'pulse-slow': 'pulse 3s ease infinite',
      },
      keyframes: {
        fadeIn:  { from:{ opacity:0,transform:'translateY(6px)' }, to:{ opacity:1,transform:'translateY(0)' } },
        slideUp: { from:{ opacity:0,transform:'translateY(20px)' }, to:{ opacity:1,transform:'translateY(0)' } },
        slideIn: { from:{ opacity:0,transform:'translateX(-10px)' }, to:{ opacity:1,transform:'translateX(0)' } },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
        'gradient-gold':    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'gradient-dark':    'linear-gradient(135deg, #060e1a 0%, #0f2033 100%)',
        'gradient-hero':    'linear-gradient(135deg, #0f2033 0%, #1e3a5f 50%, #162d4a 100%)',
      },
    },
  },
  plugins: [],
}
