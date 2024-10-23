import path from 'path';

/** @type {import('postcss-load-config').Config} */
const config = {
    plugins: {
        tailwindcss: {
            config: path.join(__dirname, 'tailwind.config.js'),
        },
        autoprefixer: {},
    },
};

export default config;
