/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#E63946', // Red from design
                    dark: '#D62828',
                },
                secondary: {
                    DEFAULT: '#F1FAEE', // White/Off-white
                    dark: '#1D3557', // Dark blue text
                },
                accent: {
                    blue: '#457B9D',
                    lightBlue: '#A8DADC',
                }
            }
        },
    },
    plugins: [],
}
