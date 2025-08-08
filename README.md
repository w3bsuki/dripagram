# Driplo.bg

[![CI Pipeline](https://github.com/your-username/driplo-fresh/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/driplo-fresh/actions/workflows/ci.yml)
[![TypeScript](https://badgen.net/badge/TypeScript/5.9+/blue)](https://www.typescriptlang.org/)
[![Svelte](https://badgen.net/badge/Svelte/5.37+/orange)](https://svelte.dev/)
[![Deploy](https://badgen.net/badge/Deploy/Vercel/black)](https://vercel.com/)

> Bulgaria's fastest, most trusted C2C marketplace - Where buying and selling second-hand items is instant, safe, and delightful.

**Driplo.bg** is a modern, social-commerce marketplace platform built for the Bulgarian market. Think Instagram meets Amazon for second-hand fashion and lifestyle items. The platform combines the engaging discovery features of social media with the trust and functionality of professional e-commerce.

## 🚀 Tech Stack

- **Frontend**: Svelte 5.37+ with SvelteKit 2.27+ and TypeScript 5.9+
- **Styling**: Tailwind CSS v4 with shadcn-svelte and Bits UI components
- **Backend**: Supabase (Authentication, Database, Storage, Realtime)
- **Package Manager**: pnpm
- **Deployment**: Vercel with automated CI/CD
- **Development**: Vite 7 with ESR and hot module replacement

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 20+** installed
- **pnpm** package manager (`npm install -g pnpm`)
- **Supabase account** for backend services
- **Git** for version control

## 🛠️ Setup

### 1. Clone & Install

```bash
git clone https://github.com/your-username/driplo-fresh.git
cd driplo-fresh
pnpm install
```

### 2. Environment Configuration

Copy the environment template and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Supabase Configuration (Required)
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Analytics & Monitoring
PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### 3. Database Setup

The project uses Supabase for backend services. To set up your database:

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key to `.env`
3. Run database migrations (coming in Phase 2)

### 4. Development Server

Start the development server:

```bash
pnpm run dev
```

Visit [http://localhost:5173](http://localhost:5173) to see your application.

## 📜 Available Scripts

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `pnpm run dev`         | Start development server             |
| `pnpm run build`       | Create production build              |
| `pnpm run preview`     | Preview production build locally     |
| `pnpm run check`       | TypeScript and Svelte validation     |
| `pnpm run lint`        | ESLint code validation               |
| `pnpm run lint:fix`    | Auto-fix ESLint issues              |
| `pnpm run format`      | Format code with Prettier            |
| `pnpm run format:check`| Check code formatting                |

## 🏗️ Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable UI components
│   │   ├── home/           # Homepage-specific components
│   │   ├── marketplace/    # Product and shopping components
│   │   ├── messages/       # Chat and messaging system
│   │   ├── navigation/     # Headers, navigation, mobile tabs
│   │   ├── social/         # Social commerce features
│   │   └── ui/            # shadcn-svelte base components
│   ├── stores/             # Global state management (Svelte 5 runes)
│   ├── services/           # Business logic and API calls
│   ├── utils/              # Helper functions and utilities
│   └── types/              # TypeScript type definitions
├── routes/                 # SvelteKit pages and API routes
│   ├── api/               # Server-side API endpoints
│   ├── auth/              # Authentication pages
│   └── [pages]/           # Application pages
└── app.html               # HTML template

```

## 🎨 Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled, zero errors policy
- **Formatting**: Prettier with Tailwind CSS plugin
- **Linting**: ESLint with Svelte and TypeScript rules
- **Components**: Svelte 5 syntax with runes (`$state`, `$props`, `$derived`)

### Svelte 5 Best Practices

```typescript
// ✅ Correct Svelte 5 syntax
let { prop } = $props();           // Props
let count = $state(0);             // Reactive state
let doubled = $derived(count * 2); // Computed values
onclick={() => handleClick()}      // Event handlers

// ❌ Avoid Svelte 4 syntax
export let prop;                   // Old props
let count = 0;                     // Non-reactive
$: doubled = count * 2;            // Old reactivity
on:click={handleClick}             // Old events
```

### Commit Conventions

- `feat:` New features
- `fix:` Bug fixes
- `refactor:` Code refactoring
- `style:` Formatting, no code change
- `docs:` Documentation updates
- `test:` Adding or updating tests

### Branch Naming

- `feature/description` - New features
- `fix/issue-description` - Bug fixes
- `refactor/component-name` - Code improvements

## 🚀 Deployment

### Vercel (Recommended)

The project is configured for automatic deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deployments trigger automatically on main branch pushes

### Manual Deployment

```bash
pnpm run build
pnpm run preview  # Test locally
# Deploy the `build` directory to your hosting provider
```

### Environment Variables for Production

Ensure these are configured in your deployment environment:

- `PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- Additional analytics and monitoring keys as needed

## 🔄 Development Workflow

1. **Check Status**: Read `PROJECT_STATUS.md` for current state
2. **Understand Goals**: Review `END_GOAL.md` for project vision  
3. **Quality Gates**: Run `pnpm run check` and `pnpm run build`
4. **Development**: Make changes following Svelte 5 patterns
5. **Testing**: Ensure all checks pass before committing
6. **Update Status**: Document progress in `PROJECT_STATUS.md`

## 📊 Current Status

**Phase**: Foundation (1 of 5) - 90% Complete ✅  
**Health**: Zero TypeScript errors, builds successfully  
**Focus**: Instagram-style social commerce features implemented  

### ✅ Completed Features

- Modern social commerce UI with Instagram-inspired design
- Mobile-first responsive layout with bottom navigation
- Native Svelte 5 component architecture (no external UI deps)
- Complete authentication flow preparation
- Real-time messaging system foundation
- Product showcase with social engagement features
- CI/CD pipeline with quality gates

### 🔄 In Progress

- Supabase integration and database setup
- User authentication and profiles
- Product CRUD operations
- Search and filtering functionality

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Pull Request Requirements

- [ ] All TypeScript checks pass (`pnpm run check`)
- [ ] Code is properly formatted (`pnpm run format`)
- [ ] ESLint validation passes (`pnpm run lint`)
- [ ] Build succeeds (`pnpm run build`)
- [ ] PR description explains changes clearly

## 🐛 Troubleshooting

### Common Issues

**Build fails with TypeScript errors:**
```bash
pnpm run check  # See detailed error messages
```

**Module resolution issues:**
```bash
rm -rf node_modules .svelte-kit
pnpm install
```

**Environment variables not working:**
- Ensure variables start with `PUBLIC_` for client-side access
- Restart development server after changing `.env`

### Getting Help

- Check `PROJECT_STATUS.md` for known issues
- Review the [SvelteKit documentation](https://kit.svelte.dev/docs)
- Open an issue for bugs or feature requests

## 📄 License

This project is private and proprietary. All rights reserved.

## 🌟 Acknowledgments

- **Svelte Team** for the amazing framework
- **Supabase** for the backend infrastructure  
- **shadcn** for the UI component patterns
- **Tailwind CSS** for the utility-first styling approach

---

**Made with ❤️ for the Bulgarian marketplace community**

> Ready to revolutionize second-hand shopping in Bulgaria! 🇧🇬