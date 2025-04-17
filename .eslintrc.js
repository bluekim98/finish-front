module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    '@nuxtjs', // Nuxt.js 기본 ESLint 설정
    'plugin:prettier/recommended', // Prettier와 연동
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error', { singleQuote: true }],
  },
};
