
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./public/index.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};


// import { nextui } from "@nextui-org/theme";

// const path = require("path");

// const config = {
//     darkMode: ["class"],
//     content: [
//         path.join(__dirname, "./src/**/*.{js,ts,jsx,tsx}"),
//         path.join(__dirname, "./public/index.html"),
//         "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
//         "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
//         "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
//         "./node_modules/@nextui-org/theme/dist/components/(date-picker|button|ripple|spinner|calendar|date-input|popover).js",
//     ],
//     theme: {
//         extend: {
//             colors: {
//                 background: "hsl(var(--background))",
//                 foreground: "hsl(var(--foreground))",
//                 card: {
//                     DEFAULT: "hsl(var(--card))",
//                     foreground: "hsl(var(--card-foreground))",
//                 },
//                 popover: {
//                     DEFAULT: "hsl(var(--popover))",
//                     foreground: "hsl(var(--popover-foreground))",
//                 },
//                 primary: {
//                     DEFAULT: "hsl(var(--primary))",
//                     foreground: "hsl(var(--primary-foreground))",
//                 },
//                 secondary: {
//                     DEFAULT: "hsl(var(--secondary))",
//                     foreground: "hsl(var(--secondary-foreground))",
//                 },
//                 muted: {
//                     DEFAULT: "hsl(var(--muted))",
//                     foreground: "hsl(var(--muted-foreground))",
//                 },
//                 accent: {
//                     DEFAULT: "hsl(var(--accent))",
//                     foreground: "hsl(var(--accent-foreground))",
//                 },
//                 destructive: {
//                     DEFAULT: "hsl(var(--destructive))",
//                     foreground: "hsl(var(--destructive-foreground))",
//                 },
//                 border: "hsl(var(--border))",
//                 input: "hsl(var(--input))",
//                 ring: "hsl(var(--ring))",
//                 chart: {
//                     1: "hsl(var(--chart-1))",
//                     2: "hsl(var(--chart-2))",
//                     3: "hsl(var(--chart-3))",
//                     4: "hsl(var(--chart-4))",
//                     5: "hsl(var(--chart-5))",
//                 },
//             },
//             borderRadius: {
//                 lg: "var(--radius)",
//                 md: "calc(var(--radius) - 2px)",
//                 sm: "calc(var(--radius) - 4px)",
//             },
//         },
//     },
//     plugins: [require(tailwindcss - animate), nextui()],
// };
// export default config;