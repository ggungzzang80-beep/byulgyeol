/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F2EDE4',
          300: '#E7DFD2',
          400: '#D8CDBA',
        },
        ink: {
          900: '#141824',
          800: '#1C2130',
          700: '#2A3040',
          600: '#3B4356',
          500: '#5A6274',
          400: '#7C8496',
        },
        gold: {
          600: '#A9834A',
          500: '#C5A059',
          400: '#D4B77E',
          300: '#E5D3AC',
          100: '#F4ECDC',
        },
        seal: '#9E4B3C',
      },
      fontFamily: {
        serif: ['"Noto Serif KR"', '"Nanum Myeongjo"', 'Georgia', 'serif'],
        sans: ['Pretendard', '"Noto Sans KR"', '-apple-system', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,24,36,0.04), 0 12px 32px -18px rgba(20,24,36,0.28)',
        lift: '0 2px 6px rgba(20,24,36,0.06), 0 24px 60px -28px rgba(20,24,36,0.35)',
      },
      letterSpacing: {
        tightest: '-0.045em',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fade: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        grow: { '0%': { transform: 'scaleX(0)' }, '100%': { transform: 'scaleX(1)' } },
        twinkle: {
          '0%,100%': { opacity: '0.25' },
          '50%': { opacity: '0.9' },
        },
      },
      animation: {
        rise: 'rise 0.7s cubic-bezier(0.16,1,0.3,1) both',
        fade: 'fade 0.6s ease both',
        grow: 'grow 1s cubic-bezier(0.16,1,0.3,1) both',
        twinkle: 'twinkle 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
