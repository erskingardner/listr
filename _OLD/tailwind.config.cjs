/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
    darkMode: 'media',
    content: [
        './src/**/*.{html,js,svelte,ts}',
        './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
    ],
    theme: {
        extend: {
            fontSize: {
                '2xs': '0.625rem',
                '3xs': '0.5rem'
            },
            fontFamily: {
                sans: [
                    'Inter var, sans-serif',
                    {
                        fontFeatureSettings: '"cv11", "ss01"',
                        fontVariationSettings: '"opsz" 32'
                    }
                ],
                cursive: ['Unica One']
            }
        }
    },
    plugins: [require('@tailwindcss/typography'), require('flowbite/plugin')]
};
