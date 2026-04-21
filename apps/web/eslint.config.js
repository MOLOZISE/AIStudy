/** @type {import("eslint").Linter.Config} */
const config = {
  extends: ['next/core-web-vitals'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
  },
};

module.exports = config;
