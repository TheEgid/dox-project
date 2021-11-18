module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        project: 'tsconfig.json',
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint/eslint-plugin', 'import', 'prettier'],
    extends: [
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        'plugin:prettier/recommended',
    ],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    ignorePatterns: ['.eslintrc.js'],
    rules: {
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        "semi": 0,
        "space-before-function-paren": 0,
        "arrow-parens": 0, // Несовместимо с prettier
        "linebreak-style": 0,
        "no-nested-ternary": 2,
        "no-console": 0,
        "class-methods-use-this": 0,
        "object-curly-newline": 0,
        "prettier/prettier": [
            "warn",
            {
                "printWidth": 100,
                "tabWidth": 2,
                "bracketSpacing": true,
                "bracketSameLine": true,
                "semi": true,
                "singleQuote": false,
                "trailingComma": "es5"
            }
        ]
    },
};