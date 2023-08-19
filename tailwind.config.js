/** @type {import('tailwindcss').Config} */

module.exports = {
    darkMode: "media",
    content: ["./src/**/*.{html,js,svelte,ts}"],
    theme: {
        extend: {
            fontSize: {
                "2xs": "0.625rem",
                "3xs": "0.5rem",
            },
            fontFamily: {
                sans: [
                    "Inter var, sans-serif",
                    {
                        fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
                        fontVariationSettings: '"opsz" 32',
                    },
                ],
                cursive: ["Unica One"],
            },
        },
    },
    plugins: [require("@tailwindcss/typography")],
};
