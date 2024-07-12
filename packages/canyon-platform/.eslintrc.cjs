module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/recommended",
    "plugin:import/typescript",
    "plugin:react/jsx-runtime",
    "plugin:prettier/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier"
  ],
  ignorePatterns: ["dist"],
  parser: "@typescript-eslint/parser",
  plugins: [
    "react-refresh",
    "react",
    "@typescript-eslint",
    "import",
    "simple-import-sort",
    "jsx-a11y",
    "react-hooks",
    "prettier"
  ],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true }
    ]
  }
};
