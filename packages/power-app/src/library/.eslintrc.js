module.exports = {
  root: true,
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      extends: ['plugin:@magicspace/default'],
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
  ],
};
