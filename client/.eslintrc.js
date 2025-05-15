//https://typescript-eslint.io/rules/no-explicit-any/

module.exports = {
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@next/next/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'prettier', 'react'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true, // Enable JSX since you're using React
      tsx: true,
    },
  },
  rules: {
    'prettier/prettier': 'error',
    'prefer-const': 'error',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-var': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-require-imports': 'warn',
    'react/prop-types': 'off', // Disable prop-types as we use TypeScript for type checking
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
