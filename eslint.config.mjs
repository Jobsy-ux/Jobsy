import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/**
 * Flat config. Next's shared configs are spread directly — `FlatCompat` is not needed
 * (and does not work) with eslint-config-next 16.
 */
const config = [
  { ignores: ['.next/**', 'node_modules/**', 'public/**', 'coverage/**', 'next-env.d.ts'] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];

export default config;
