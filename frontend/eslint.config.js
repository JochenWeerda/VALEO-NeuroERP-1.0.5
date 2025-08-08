import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config([
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'dist-analysis/**',
      'node_modules/**',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: { sourceType: 'module' },
    },
    rules: {
      'react-refresh/only-export-components': 'off',
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-useless-escape': 'warn',
      'no-case-declarations': 'off',
      'no-empty-pattern': 'off',
      'prefer-const': 'warn',
    },
  },
  {
    files: [
      'legacy/**/*.{ts,tsx}',
      'src/pages/**/*.{ts,tsx}',
      'src/tests/**/*.{ts,tsx}',
      'store/**/*.{ts,tsx}',
      'src/types/**/*.{ts,tsx}',
      'src/services/**/*.{ts,tsx}',
      'src/security/**/*.{ts,tsx}',
      'src/utils/**/*.{ts,tsx}',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-useless-escape': 'warn',
      'no-case-declarations': 'off',
      'no-empty-pattern': 'off',
      'prefer-const': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
])
