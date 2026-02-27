import prettier from 'eslint-config-prettier';
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import { plugin as ex } from 'eslint-plugin-exception-handling';
import drizzle from 'eslint-plugin-drizzle';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{ plugins: { ex }, rules: { 'ex/no-unhandled': 'error' } },
	{
		plugins: { drizzle },
		rules: {
			'drizzle/enforce-delete-with-where': ['error', { drizzleObjectName: 'db' }],
			'drizzle/enforce-update-with-where': ['error', { drizzleObjectName: 'db' }],
		},
	},
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },

		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off',
		},
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],

		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig,
			},
		},
	},
);
