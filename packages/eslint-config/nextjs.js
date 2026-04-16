/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    './index.js',
    'plugin:@next/next/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  env: {
    browser: true,
    node: true,
  },
};
