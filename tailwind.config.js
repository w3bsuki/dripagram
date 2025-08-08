export default {
	content: [
		'./src/**/*.{html,js,svelte,ts,md,mdx}',
		'./src/**/*.stories.{js,ts}',
		'./.svelte-kit/generated/**/*.{js,ts}',
		'./node_modules/bits-ui/**/*.{js,svelte,ts}',
		'./node_modules/shadcn-svelte/**/*.{js,svelte,ts}',
	],
	theme: {
		extend: {
			// Custom animations for the marketplace
			animation: {
				'fade-in': 'fadeIn 0.2s ease-in-out',
				'slide-up': 'slideUp 0.2s ease-out',
				'scale-in': 'scaleIn 0.15s ease-out',
				shimmer: 'shimmer 1.5s infinite',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				slideUp: {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				scaleIn: {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				shimmer: {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
			},
			// Safe area utilities for mobile
			padding: {
				'safe-top': 'env(safe-area-inset-top)',
				'safe-bottom': 'env(safe-area-inset-bottom)',
				'safe-left': 'env(safe-area-inset-left)',
				'safe-right': 'env(safe-area-inset-right)',
			},
			// Marketplace-specific aspect ratios
			aspectRatio: {
				product: '4/3',
				story: '9/16',
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
};
