/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                background: '#030014', // Deep Space Blue/Black
                foreground: '#ffffff',
                primary: {
                    DEFAULT: '#00f0ff', // Cyber Cyan
                    hover: '#00c3d9',
                },
                secondary: '#7000ff', // Neon Purple
                accent: '#ff00aa', // Hot Pink
                surface: {
                    DEFAULT: 'rgba(255, 255, 255, 0.03)',
                    highlight: 'rgba(255, 255, 255, 0.08)',
                },
                border: 'rgba(255, 255, 255, 0.1)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'], // Suggested good display font if available, falling back to sans
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'fade-in-up': 'fadeInUp 0.7s ease-out forwards',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'shine': 'shine 3s linear infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                shine: {
                    '0%': { backgroundPosition: '200% center' },
                    '100%': { backgroundPosition: '-200% center' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)' },
                    '100%': { boxShadow: '0 0 25px rgba(0, 240, 255, 0.6), 0 0 10px rgba(0, 240, 255, 0.4)' },
                },
            },
            backgroundImage: {
                'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #161616 0deg, #08081a 55deg, #1e0030 120deg, #090014 160deg, transparent 360deg)',
                'neon-gradient': 'linear-gradient(to right, #00f0ff, #7000ff, #ff00aa)',
                'grid-pattern': "linear-gradient(to right, #1f1f1f 1px, transparent 1px), linear-gradient(to bottom, #1f1f1f 1px, transparent 1px)",
            },
        },
    },
    plugins: [],
}
