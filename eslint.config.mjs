import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import jestPlugin from 'eslint-plugin-jest';
import prettierConfig from 'eslint-config-prettier';

const compat = new FlatCompat({
    recommendedConfig: js.configs.recommended,
    baseDirectory: new URL('.', import.meta.url).pathname, // Adjust the base directory as needed
});

export default [
    {
        ignores: ['node_modules/**', 'dist/**', 'src/tests/*', '**/*.json'], // Add other paths to ignore as needed
    },
    ...compat.extends('eslint:recommended'),
    ...compat.extends('plugin:@typescript-eslint/recommended'),
    ...compat.extends('plugin:jest/recommended'),
    ...compat.extends('prettier'),
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parser: tsParser,
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            'jest': jestPlugin,
        },
        rules: {
            '@typescript-eslint/no-unused-vars': 'off',
        },
    },
];
