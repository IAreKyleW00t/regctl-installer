import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import jest from 'eslint-plugin-jest'
import github from 'eslint-plugin-github'
import prettier from 'eslint-plugin-prettier/recommended'

export default tseslint.config(
  {
    ignores: [
      '.git/',
      'node_modules/',
      'dist/',
      'eslint.config.mjs',
      'jest.config.js'
    ]
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  jest.configs['flat/recommended'],
  github.getFlatConfigs().recommended,
  ...github.getFlatConfigs().typescript,
  prettier,
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    languageOptions: {
      parserOptions: {
        project: true,
        ecmaVersion: 2023,
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      camelcase: 'off',
      'eslint-comments/no-use': 'off',
      'eslint-comments/no-unused-disable': 'off',
      'i18n-text/no-en': 'off',
      'importPlugin/no-namespace': 'off',
      'importPlugin/no-unresolved': 'off',
      'no-console': 'off',
      'no-unused-vars': 'off',
      'prettier/prettier': 'error',
      semi: 'off',
      '@typescript-eslint/array-type': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { accessibility: 'no-public' }
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true }
      ],
      '@typescript-eslint/no-array-constructor': 'error',
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-extraneous-class': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-unnecessary-qualifier': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-useless-constructor': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/prefer-for-of': 'warn',
      '@typescript-eslint/prefer-function-type': 'warn',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/require-array-sort-compare': 'error',
      '@typescript-eslint/restrict-plus-operands': 'error',
      '@typescript-eslint/space-before-function-paren': 'off',
      '@typescript-eslint/unbound-method': 'error'
    }
  }
)
