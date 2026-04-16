/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['./index.js'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
  env: {
    node: true,
  },
};
