/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#FAF7F2',
          secondary: '#F5EDE6',
          card: '#FFFFFF',
        },
        text: {
          primary: '#2C2825',
          secondary: '#6B6560',
          light: '#8A837D',
        },
        accent: {
          DEFAULT: '#C67B5C',
          dark: '#A85E42',
          light: '#E8D5CB',
          bg: '#FDF8F5',
        },
        sage: '#8BA888',
        border: {
          light: '#E8E0D8',
          medium: '#D5CBC2',
        },
        status: {
          pending: '#F59E0B',
          progress: '#3B82F6',
          completed: '#10B981',
          cancelled: '#EF4444',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 2px 12px rgba(44, 40, 37, 0.06)',
        md: '0 8px 30px rgba(44, 40, 37, 0.1)',
        lg: '0 20px 50px rgba(44, 40, 37, 0.15)',
      },
    },
  },
  plugins: [],
}
