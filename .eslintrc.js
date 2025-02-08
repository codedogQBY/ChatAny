// .eslintrc.js
module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    rules: {
        semi: ['error', 'always'],
        'no-console': 0,
        'new-cap': 0,
        'no-shadow': ['error', { builtinGlobals: false, hoist: 'functions', allow: [] }],
        'require-await': 'error',
        'no-await-in-loop': 'error',
    },
};
