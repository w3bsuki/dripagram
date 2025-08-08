import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import globals from 'globals';

export default [
	js.configs.recommended,
	// JavaScript files - no TypeScript parser needed
	{
		files: ['**/*.{js,jsx}'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es2022
			}
		},
		rules: {
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'no-debugger': 'warn',
			'prefer-const': 'warn'
		}
	},
	// TypeScript files - use TypeScript parser with project
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			parser: tsParser,
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: import.meta.dirname
			},
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es2022
			}
		},
		plugins: {
			'@typescript-eslint': typescript
		},
		rules: {
			...typescript.configs.recommended.rules,
			'@typescript-eslint/no-unused-vars': ['warn', {
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_'
			}],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-non-null-assertion': 'warn',
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'no-debugger': 'warn',
			'prefer-const': 'warn'
		}
	},
	// Svelte files - use Svelte parser with TypeScript support
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tsParser,
				extraFileExtensions: ['.svelte']
			},
			globals: {
				...globals.browser,
				...globals.es2022,
				// Additional browser globals for events
				Event: 'readonly',
				KeyboardEvent: 'readonly',
				MouseEvent: 'readonly',
				FocusEvent: 'readonly',
				InputEvent: 'readonly'
			}
		},
		plugins: {
			svelte,
			'@typescript-eslint': typescript
		},
		rules: {
			...svelte.configs.recommended.rules,
			// Only basic TypeScript rules for Svelte, not project-dependent ones
			'@typescript-eslint/no-unused-vars': ['warn', {
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_'
			}],
			'no-unused-vars': ['warn', {
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_'
			}],
			'svelte/no-at-html-tags': 'error',
			'svelte/no-at-debug-tags': 'warn',
			'svelte/valid-compile': 'error',
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'no-debugger': 'warn',
			'no-undef': 'error'
		}
	},
	{
		ignores: [
			'**/*.cjs',
			'**/node_modules/**',
			'**/.svelte-kit/**',
			'**/dist/**',
			'**/build/**',
			'**/package/**',
			'**/.env',
			'**/.env.*',
			'!**/.env.example',
			'**/src/lib/paraglide/**',
			// Ignore utility/test scripts that are not part of the main app
			'test-*.js',
			'*-test.js',
			'confirm-user.js',
			'mobile-screenshot.js',
			'scripts/*.js'
		]
	}
];