const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ['dist/**', 'coverage/**', 'screenshots/**']
  },
  {
    files: ['server/**/*.ts'],
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }]
    }
  }
]);
