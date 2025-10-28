/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx}',
        './public/index.html',
        // Add any other paths where you use Tailwind classes
    ],
    theme: {
        extend: {
            colors: {
                primary: 'black', // Define your primary color
            },
        },
    },
    plugins: [],
};
