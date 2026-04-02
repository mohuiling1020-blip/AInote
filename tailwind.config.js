/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      colors: {
        morandi: {
          sage: '#6C786E',
          'sage-light': '#8A9A8D',
          cream: '#C8B88A',
          mint: '#B5C4B1',
          beige: '#E8E0CC',
          paper: '#FAF8F4',
          'paper-warm': '#F5F0E8',
          text: {
            primary: '#2D3A3A',
            secondary: '#6B7A7A',
            muted: '#9BA8A8',
          },
        },
      },
      animation: {
        'float-slow': 'float 25s ease-in-out infinite',
        'float-medium': 'float 18s ease-in-out infinite reverse',
        'float-fast': 'float 12s ease-in-out infinite',
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'confetti-fall': 'confettiFall 3s ease-in forwards',
        'fly-up': 'flyUp 0.5s ease-in forwards',
        'flip-out': 'flipOut 0.4s ease-in forwards',
        'spark-glow': 'sparkGlow 1s ease-in-out',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up-delayed': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.97)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(32px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        confettiFall: {
          '0%': { opacity: '1', transform: 'translateY(0) rotate(0deg)' },
          '100%': { opacity: '0', transform: 'translateY(100vh) rotate(720deg)' },
        },
        flyUp: {
          '0%': { transform: 'scale(1) translateY(0)', opacity: '1' },
          '100%': { transform: 'scale(0.3) translateY(-200px)', opacity: '0' },
        },
        flipOut: {
          '0%': { transform: 'perspective(600px) rotateY(0) translateX(0)', opacity: '1' },
          '100%': { transform: 'perspective(600px) rotateY(90deg) translateX(-80px)', opacity: '0' },
        },
        sparkGlow: {
          '0%': { boxShadow: '0 0 0 0 rgba(200, 184, 138, 0)' },
          '50%': { boxShadow: '0 0 20px 5px rgba(200, 184, 138, 0.3)' },
          '100%': { boxShadow: '0 0 0 0 rgba(200, 184, 138, 0)' },
        },
      },
    },
  },
  plugins: [],
};
