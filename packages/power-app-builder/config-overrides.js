// @ts-check

const {
  override,
  disableEsLint,
  fixBabelImports,
  addLessLoader,
} = require('customize-cra');

module.exports = override(
  disableEsLint(),
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: {'@primary-color': '#009960'},
  }),
);
