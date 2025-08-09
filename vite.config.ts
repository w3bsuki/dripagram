import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { sentrySvelteKit } from '@sentry/sveltekit';

export default defineConfig(({ mode }) => ({
	plugins: [
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
		}),
		tailwindcss(),
		...(mode === 'production' && process.env.SENTRY_AUTH_TOKEN
			? [
					sentrySvelteKit({
						sourceMapsUploadOptions: {
							org: process.env.SENTRY_ORG,
							project: process.env.SENTRY_PROJECT,
							authToken: process.env.SENTRY_AUTH_TOKEN,
						},
					}),
				]
			: []),
	],
	server: {
		port: 3000,
		strictPort: false,
		hmr: {
			overlay: false,
		},
	},
	build: {
		sourcemap: true,
		minify: 'esbuild',
		cssMinify: 'esbuild',
		target: ['es2022', 'chrome89', 'firefox89', 'safari15'],
		rollupOptions: {
			// Basic optimizations without manual chunking to avoid circular dependency issues
		},
		chunkSizeWarningLimit: 1000, // 1MB warning threshold
	},
	optimizeDeps: {
		include: [
			'svelte',
			'@supabase/supabase-js',
			'bits-ui',
			'@lucide/svelte',
			'date-fns',
			'zod',
			'clsx',
			'tailwind-merge',
			'class-variance-authority',
		],
		exclude: ['@sveltejs/kit'],
	},
}));
