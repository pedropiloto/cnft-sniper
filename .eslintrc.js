module.exports = {
    root: true,
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    extends: ['eslint:recommended', 'prettier'],
    env: {
        es2021: true,
        node: true,
    },
    rules: {
        'no-console': 'error',
    },
    ignorePatterns: ['client/*'], // <<< ignore all files in test folder
}
