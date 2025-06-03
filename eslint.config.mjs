import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import unusedImports from "eslint-plugin-unused-imports";
import importPlugin from "eslint-plugin-import";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
});

// インポートする際のパス解決設定
const importResolverSettings = {
    "import/resolver": {
        node: {
            extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
        typescript: {
            alwaysTryTypes: true,
            project: "./tsconfig.json",
        },
    },
    "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
    },
};

export default [
    ...compat.extends("next/core-web-vitals"),
    {
        ignores: [".next/**", "node_modules/**", "out/**"],
    },
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        plugins: {
            "unused-imports": unusedImports,
            import: importPlugin,
        },
        rules: {
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_",
                },
            ],
            // import プラグインのルール
            "import/order": [
                "error",
                {
                    groups: [
                        "builtin",
                        "external",
                        "internal",
                        ["parent", "sibling"],
                        "index",
                        "object",
                        "type",
                    ],
                    "newlines-between": "always",
                    alphabetize: { order: "asc", caseInsensitive: true },
                },
            ],
            "import/no-duplicates": "error",
            "import/no-unresolved": "error",
            "import/first": "error",
            "import/no-cycle": "warn",
        },
    },
];
