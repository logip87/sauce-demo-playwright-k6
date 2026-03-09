import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import playwright from 'eslint-plugin-playwright';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/artifacts/**',
      '**/dist/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '*.pdf',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs['recommended-type-checked'].rules,
      ...tsPlugin.configs['stylistic-type-checked'].rules,
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        {
          ignoreArrowShorthand: true,
        },
      ],
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['e2e/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      playwright,
    },
    rules: {
      'playwright/no-focused-test': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/no-skipped-test': 'warn',
      'playwright/no-wait-for-timeout': 'error',
      'playwright/prefer-web-first-assertions': 'error',
    },
  },
  {
    files: ['lt/**/*.ts'],
    languageOptions: {
      globals: {
        __ENV: 'readonly',
      },
    },
  },
];
