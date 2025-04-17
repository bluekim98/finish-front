module.exports = {
  singleQuote: true,
  parser: 'typescript',
  semi: true,
  useTabs: false,
  tabWidth: 2,
  printWidth: 120,
  arrowParens: 'always',
  htmlWhitespaceSensitivity: 'ignore',
  overrides: [
    {
      files: '*.vue',
      options: {
        parser: 'vue',
      },
    },
  ],
};
