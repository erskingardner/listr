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
            colors: {
                ltngWhite: "#FFF0D6",
                ltngYellow: "#EEC47A",
                btcOrange: "#f7931a",
                btcGray: "#4d4d4d",
                btcBlue: "#0d579b",
                btcGreen: "#329239",
                gitOrange: "rgb(227, 90, 56)",
            },
        },
    },
    plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
