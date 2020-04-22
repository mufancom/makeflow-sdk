module.exports = {
  extends: ['plugin:@magicspace/default', 'prettier'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    '@magicspace/import-path-base-url': ['error', {baseUrl: '.'}],
    '@magicspace/import-path-shallowest': ['error', {baseUrl: '.'}],
    '@magicspace/import-path-strict-hierarchy': [
      'error',
      {
        hierarchy: {},
        baseUrl: '.',
      },
    ],
  },
  settings: {},
};
