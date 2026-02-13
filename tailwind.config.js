/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{ts,tsx,js,jsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                'serif-elegant': ['Cormorant Garamond', 'Georgia', 'serif'],
            },
            colors: {
                gold: {
                    light: '#FFD700',
                    DEFAULT: '#D4AF37',
                    dark: '#B8860B',
                },
            },
        },
    },
    plugins: [],
};
