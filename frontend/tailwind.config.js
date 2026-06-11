module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      sans: ['Prompt', 'sans-serif'],
      serif: ['Sarabun', 'serif'],
      body: ['Prompt', 'sans-serif'],
    },
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#4f46e5', // Indigo 600 - Main Brand Color
          600: '#4338ca',
          700: '#3730a3',
          800: '#312e81',
          900: '#1e1b4b',
        },
        secondary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Orange 500 - Accent
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        theme: {
          // Mapping old theme colors to new palette for backward compatibility if needed, 
          // but preferably use primary/secondary classes
          50: '#eef2ff', 
          100: '#e0e7ff', 
          200: '#c7d2fe', 
          300: '#a5b4fc', 
          400: '#818cf8', 
          500: '#4f46e5',  
          600: '#4338ca', 
          700: '#3730a3', 
          800: '#312e81', 
          900: '#1e1b4b',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 0 20px rgba(0, 0, 0, 0.03)',
        'glow': '0 0 15px rgba(79, 70, 229, 0.3)', 
      },
      spacing: {
        '80': '20rem', // 320px
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
