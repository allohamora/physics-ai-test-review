// @ts-check
import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import beautifulSort from 'eslint-plugin-beautiful-sort';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginAstro from 'eslint-plugin-astro';
import pluginTailwind from 'eslint-plugin-tailwindcss';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  ...pluginTailwind.configs['flat/recommended'],
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  pluginJsxA11y.flatConfigs.recommended,
  eslintPluginPrettierRecommended,
  { ignores: ['node_modules', 'dist'] },
  {
    files: ['**/*.{ts,tsx,astro}'],
    languageOptions: { globals: { ...globals.browser }, parserOptions: { project: true } },
    plugins: { 'beautiful-sort': beautifulSort },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'no-use-before-define': 'warn',
      'object-shorthand': 'warn',
      'no-async-promise-executor': 'warn',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-deprecated': 'error',
      'react/no-unknown-property': ['error', { ignore: ['class', 'set:html'] }],
      'beautiful-sort/import': [
        'error',
        { special: [], order: ['special', 'namespace', 'default', 'defaultObj', 'obj', 'none'] },
      ],
    },
  },
);
