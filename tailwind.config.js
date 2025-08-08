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
			// Design System Colors - Instagram-style Social Commerce
			colors: {
				// Primary palette (Instagram blue for actions)
				primary: {
					50: '#eff6ff',
					100: '#dbeafe',
					200: '#bfdbfe',
					300: '#93c5fd',
					400: '#60a5fa',
					500: '#3b82f6', // Main primary
					600: '#2563eb',
					700: '#1d4ed8',
					800: '#1e40af',
					900: '#1e3a8a',
					950: '#172554',
					DEFAULT: '#3b82f6',
					foreground: '#ffffff',
				},
				// Secondary palette (warm for highlights/CTAs)
				secondary: {
					50: '#fef7ee',
					100: '#fdebd3',
					200: '#fbd4a6',
					300: '#f7b76e',
					400: '#f29234',
					500: '#ef7611', // Main secondary
					600: '#e05d07',
					700: '#b84608',
					800: '#94370e',
					900: '#792f0f',
					950: '#411505',
					DEFAULT: '#ef7611',
					foreground: '#ffffff',
				},
				// Success palette (for confirmations, success states)
				success: {
					50: '#f0fdf4',
					100: '#dcfce7',
					200: '#bbf7d0',
					300: '#86efac',
					400: '#4ade80',
					500: '#22c55e', // Main success
					600: '#16a34a',
					700: '#15803d',
					800: '#166534',
					900: '#14532d',
					950: '#052e16',
					DEFAULT: '#22c55e',
					foreground: '#ffffff',
				},
				// Warning palette (for alerts, price drops)
				warning: {
					50: '#fffbeb',
					100: '#fef3c7',
					200: '#fde68a',
					300: '#fcd34d',
					400: '#fbbf24',
					500: '#f59e0b', // Main warning
					600: '#d97706',
					700: '#b45309',
					800: '#92400e',
					900: '#78350f',
					950: '#451a03',
					DEFAULT: '#f59e0b',
					foreground: '#000000',
				},
				// Destructive palette (for errors, delete actions)
				destructive: {
					50: '#fef2f2',
					100: '#fee2e2',
					200: '#fecaca',
					300: '#fca5a5',
					400: '#f87171',
					500: '#ef4444', // Main destructive
					600: '#dc2626',
					700: '#b91c1c',
					800: '#991b1b',
					900: '#7f1d1d',
					950: '#450a0a',
					DEFAULT: '#ef4444',
					foreground: '#ffffff',
				},
				// Surface and background scales (neutral grays)
				surface: {
					50: '#f8fafc',
					100: '#f1f5f9',
					200: '#e2e8f0',
					300: '#cbd5e1',
					400: '#94a3b8',
					500: '#64748b',
					600: '#475569',
					700: '#334155',
					800: '#1e293b',
					900: '#0f172a',
					950: '#020617',
					DEFAULT: '#f8fafc',
				},
				// Background colors
				background: '#ffffff',
				foreground: '#0f172a',
				// Muted colors for secondary text and backgrounds
				muted: {
					DEFAULT: '#f1f5f9',
					foreground: '#64748b',
				},
				// Accent colors (for hover states, highlights)
				accent: {
					DEFAULT: '#f1f5f9',
					foreground: '#0f172a',
				},
				// Card colors
				card: {
					DEFAULT: '#ffffff',
					foreground: '#0f172a',
				},
				// Popover colors
				popover: {
					DEFAULT: '#ffffff',
					foreground: '#0f172a',
				},
				// Border color
				border: '#e2e8f0',
				// Input colors
				input: '#e2e8f0',
				// Ring color (focus states)
				ring: '#3b82f6',
			},
			// Typography Scale - Fluid and responsive
			fontSize: {
				// Fluid typography using clamp()
				'xs': ['clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)', { lineHeight: '1.5' }],
				'sm': ['clamp(0.875rem, 0.825rem + 0.25vw, 1rem)', { lineHeight: '1.5' }],
				'base': ['clamp(1rem, 0.95rem + 0.25vw, 1.125rem)', { lineHeight: '1.6' }],
				'lg': ['clamp(1.125rem, 1.075rem + 0.25vw, 1.25rem)', { lineHeight: '1.5' }],
				'xl': ['clamp(1.25rem, 1.175rem + 0.375vw, 1.5rem)', { lineHeight: '1.4' }],
				'2xl': ['clamp(1.5rem, 1.4rem + 0.5vw, 1.875rem)', { lineHeight: '1.3' }],
				'3xl': ['clamp(1.875rem, 1.725rem + 0.75vw, 2.25rem)', { lineHeight: '1.2' }],
				'4xl': ['clamp(2.25rem, 2.025rem + 1.125vw, 3rem)', { lineHeight: '1.1' }],
				'5xl': ['clamp(3rem, 2.7rem + 1.5vw, 4rem)', { lineHeight: '1' }],
				'6xl': ['clamp(3.75rem, 3.3rem + 2.25vw, 5.25rem)', { lineHeight: '1' }],
				// Semantic typography
				'display-2xl': ['clamp(4.5rem, 3.9rem + 3vw, 6.75rem)', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
				'display-xl': ['clamp(3.75rem, 3.3rem + 2.25vw, 5.25rem)', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
				'display-lg': ['clamp(3rem, 2.7rem + 1.5vw, 4rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
				'display-md': ['clamp(2.25rem, 2.025rem + 1.125vw, 3rem)', { lineHeight: '1', letterSpacing: '-0.01em' }],
				'display-sm': ['clamp(1.875rem, 1.725rem + 0.75vw, 2.25rem)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
				'body-xl': ['clamp(1.25rem, 1.175rem + 0.375vw, 1.5rem)', { lineHeight: '1.6' }],
				'body-lg': ['clamp(1.125rem, 1.075rem + 0.25vw, 1.25rem)', { lineHeight: '1.6' }],
				'body-md': ['clamp(1rem, 0.95rem + 0.25vw, 1.125rem)', { lineHeight: '1.6' }],
				'body-sm': ['clamp(0.875rem, 0.825rem + 0.25vw, 1rem)', { lineHeight: '1.5' }],
				'caption': ['clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)', { lineHeight: '1.4' }],
			},
			// Spacing System - 4/8pt grid with semantic sizes
			spacing: {
				'0.5': '0.125rem', // 2px
				'1': '0.25rem',    // 4px
				'1.5': '0.375rem', // 6px
				'2': '0.5rem',     // 8px
				'2.5': '0.625rem', // 10px
				'3': '0.75rem',    // 12px
				'3.5': '0.875rem', // 14px
				'4': '1rem',       // 16px
				'5': '1.25rem',    // 20px
				'6': '1.5rem',     // 24px
				'7': '1.75rem',    // 28px
				'8': '2rem',       // 32px
				'9': '2.25rem',    // 36px
				'10': '2.5rem',    // 40px
				'11': '2.75rem',   // 44px
				'12': '3rem',      // 48px
				'14': '3.5rem',    // 56px
				'16': '4rem',      // 64px
				'20': '5rem',      // 80px
				'24': '6rem',      // 96px
				'28': '7rem',      // 112px
				'32': '8rem',      // 128px
				'36': '9rem',      // 144px
				'40': '10rem',     // 160px
				'44': '11rem',     // 176px
				'48': '12rem',     // 192px
				'52': '13rem',     // 208px
				'56': '14rem',     // 224px
				'60': '15rem',     // 240px
				'64': '16rem',     // 256px
				'72': '18rem',     // 288px
				'80': '20rem',     // 320px
				'96': '24rem',     // 384px
				// Semantic spacing
				'xs': '0.5rem',    // 8px
				'sm': '0.75rem',   // 12px
				'md': '1rem',      // 16px
				'lg': '1.5rem',    // 24px
				'xl': '2rem',      // 32px
				'2xl': '3rem',     // 48px
				'3xl': '4rem',     // 64px
				// Safe area utilities for mobile
				'safe-top': 'env(safe-area-inset-top)',
				'safe-bottom': 'env(safe-area-inset-bottom)',
				'safe-left': 'env(safe-area-inset-left)',
				'safe-right': 'env(safe-area-inset-right)',
			},
			// Border Radius System
			borderRadius: {
				'none': '0px',
				'sm': '0.25rem',   // 4px
				'DEFAULT': '0.375rem', // 6px
				'md': '0.5rem',    // 8px
				'lg': '0.75rem',   // 12px
				'xl': '1rem',      // 16px
				'2xl': '1.5rem',   // 24px
				'3xl': '2rem',     // 32px
				'full': '9999px',
				// Semantic radius
				'button': '0.5rem',    // 8px - for buttons
				'card': '0.75rem',     // 12px - for cards
				'input': '0.375rem',   // 6px - for inputs
				'modal': '1rem',       // 16px - for modals
			},
			// Container Sizes with consistent gutters
			maxWidth: {
				'xs': '20rem',     // 320px
				'sm': '24rem',     // 384px
				'md': '28rem',     // 448px
				'lg': '32rem',     // 512px
				'xl': '36rem',     // 576px
				'2xl': '42rem',    // 672px
				'3xl': '48rem',    // 768px
				'4xl': '56rem',    // 896px
				'5xl': '64rem',    // 1024px
				'6xl': '72rem',    // 1152px
				'7xl': '80rem',    // 1280px
				'container-xs': '20rem',   // Mobile first
				'container-sm': '36rem',   // Small tablet
				'container-md': '48rem',   // Tablet
				'container-lg': '64rem',   // Desktop
				'container-xl': '80rem',   // Large desktop
				'container-2xl': '96rem',  // Ultra wide
			},
			// Enhanced animations for social commerce
			animation: {
				'fade-in': 'fadeIn 0.2s ease-in-out',
				'slide-up': 'slideUp 0.2s ease-out',
				'slide-down': 'slideDown 0.2s ease-out',
				'scale-in': 'scaleIn 0.15s ease-out',
				'scale-out': 'scaleOut 0.1s ease-in',
				'shimmer': 'shimmer 1.5s infinite',
				'pulse-slow': 'pulse 3s infinite',
				'bounce-soft': 'bounceSoft 0.6s ease-out',
				'heart-beat': 'heartBeat 0.3s ease-in-out',
				'wiggle': 'wiggle 0.5s ease-in-out',
				'slide-in-right': 'slideInRight 0.3s ease-out',
				'slide-in-left': 'slideInLeft 0.3s ease-out',
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
				slideDown: {
					'0%': { transform: 'translateY(-10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				scaleIn: {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				scaleOut: {
					'0%': { transform: 'scale(1)', opacity: '1' },
					'100%': { transform: 'scale(0.95)', opacity: '0' },
				},
				shimmer: {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
				bounceSoft: {
					'0%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.05)' },
					'100%': { transform: 'scale(1)' },
				},
				heartBeat: {
					'0%': { transform: 'scale(1)' },
					'25%': { transform: 'scale(1.1)' },
					'50%': { transform: 'scale(1)' },
					'75%': { transform: 'scale(1.05)' },
					'100%': { transform: 'scale(1)' },
				},
				wiggle: {
					'0%': { transform: 'rotate(0deg)' },
					'25%': { transform: 'rotate(3deg)' },
					'75%': { transform: 'rotate(-3deg)' },
					'100%': { transform: 'rotate(0deg)' },
				},
				slideInRight: {
					'0%': { transform: 'translateX(100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				slideInLeft: {
					'0%': { transform: 'translateX(-100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
			},
			// Enhanced aspect ratios for social commerce
			aspectRatio: {
				'1/1': '1 / 1',
				'3/4': '3 / 4',
				'4/3': '4 / 3',
				'4/5': '4 / 5',
				'5/4': '5 / 4',
				'9/16': '9 / 16',
				'16/9': '16 / 9',
				'21/9': '21 / 9',
				// Social media specific
				'product': '4 / 3',      // Product cards
				'story': '9 / 16',       // Story format
				'square': '1 / 1',       // Instagram square
				'portrait': '4 / 5',     // Instagram portrait
				'landscape': '16 / 9',   // Video landscape
			},
			// Box shadows for elevation
			boxShadow: {
				'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
				'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
				'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
				'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
				'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
				'2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
				'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
				'none': 'none',
				// Semantic shadows
				'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
				'modal': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
				'dropdown': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
};
