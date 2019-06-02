const path = require("path");
const typescriptRules = require("@typescript-eslint/eslint-plugin");

module.exports = {
    extends: [
        "eslint:recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
    ],
    rules: {
        indent: [
            "error",
            4,
            {
                SwitchCase: 1,
            },
        ],
        quotes: [
            "error",
            "double",
            {
                avoidEscape: true,
                allowTemplateLiterals: true,
            },
        ],
        "linebreak-style": [
            "error",
            "unix",
        ],
        semi: [
            "error",
            "always",
        ],
        "no-unused-vars": [
            "error",
            {
                args: "none",
                ignoreRestSiblings: true,
            },
        ],
        "no-console": [
            "off",
        ],
        "comma-dangle": [
            "warn",
            "always-multiline",
        ],
        "no-trailing-spaces": [
            "error",
        ],
        "import/no-unresolved": [
            "warn",
            {
                commonjs: true,
            },
        ],
    },
    env: {
        es6: true,
        node: true,
        browser: true,
        webextensions: true,
    },
    parserOptions: {
        ecmaVersion: 2019,
        sourceType: "module",
        ecmaFeatures: {
        },
    },
    plugins: [
    ],
    overrides: [
        {
            files: ["**/*.test.js", "**/*.test.jsx"],
            env: {
                mocha: true,
                jest: true,
            },
        },
        {
            files: ["**/*.ts", "**/*.tsx"],
            parser: "@typescript-eslint/parser",
            parserOptions: {
                project: path.join(__dirname, "tsconfig.json"),
            },
            settings: {
                "import/extensions": [".js", ".jsx", "mjs", "mjsx", ".ts", ".tsx"],
                "import/parsers": {
                    "@typescript-eslint/parser": [".ts", ".tsx"],
                },
                "import/resolver": {
                    typescript: {
                    },
                    node: {
                        extensions: [".js", ".jsx", "mjs", "mjsx", ".ts", ".tsx"],
                    },
                },
            },
            rules: Object.assign(
                {},
                typescriptRules.configs.recommended.rules,
                {
                    /**
                     * @link https://github.com/benmosher/eslint-plugin-import/issues/920
                     */
                    "import/named": "off",

                    "react/display-name": "off",

                    "@typescript-eslint/no-object-literal-type-assertion": [
                        true,
                        {
                            "allow-arguments": true,
                        },
                    ],
                    "@typescript-eslint/no-non-null-assertion": false,
                    "@typescript-eslint/interface-name-prefix": false,

                    /**
                     * @link https://github.com/typescript-eslint/typescript-eslint/issues/342
                     */
                    "no-undef": "off",
                },
            ),
            /*
            extends: [
                "plugin:import/react",
                "plugin:import/typescript",
                "plugin:react/recommended",
                "plugin:@typescript-eslint/recommended",
            ],
            */
            plugins: [
                "@typescript-eslint",
            ],
        },
    ],
};
