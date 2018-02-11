module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        node: true
    },
    extends: 'eslint:recommended',
    parserOptions: {
        // Support Async Functions in eslint: https://github.com/jramcast/create-js-package/issues/2
        // ecmaVersion: 8,
        ecmaVersion: 2017,
        ecmaFeatures: {
            jsx: true
        },
        sourceType: 'module'
    },
    rules: {
        // allow async-await
        'generator-star-spacing': 0,
        semi: ['error', 'never'],
        'no-console': ['error', { allow: ['warn', 'error', 'log'] }],
        'no-unused-vars': ['error', { args: 'none' }]
    }
}
