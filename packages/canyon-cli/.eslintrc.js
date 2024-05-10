module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parserOptions: {
    ecmaVersion: 9,
  },
  env: {
    es6: true,
    jest: true,
    node: true,
    'shared-node-browser': true,
  },
  rules: {
    '@typescript-eslint/no-var-requires': 1,
  },
}
