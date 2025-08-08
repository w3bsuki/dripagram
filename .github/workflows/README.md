# 🚀 GitHub Actions CI/CD Workflow

## Overview

This repository uses a comprehensive CI/CD pipeline designed specifically for the **Driplo.bg** Svelte 5 + SvelteKit 2 project. The workflow ensures code quality, type safety, and successful builds before any code reaches production.

## Workflow Structure

### 🔍 Main Jobs

1. **`quality-checks`** - Build validation and artifact caching
2. **`code-quality`** - TypeScript, linting, and formatting checks  
3. **`preview-test`** - Preview server testing (PR only)
4. **`security-audit`** - Dependency and security scanning (PR only)
5. **`ci-success`** - Final status aggregation
6. **`vercel-status`** - Deployment notifications (main branch only)

### ⚡ Performance Features

- **Parallel Execution**: Type checking and building run simultaneously
- **Smart Caching**: Build artifacts cached for faster subsequent runs
- **Fail Fast**: Critical errors stop the pipeline immediately
- **Conditional Jobs**: Preview and security tests only run on PRs

## Triggers

| Event | Description |
|-------|-------------|
| `pull_request` | On any PR to `main` branch |
| `push` | On direct push to `main` branch |
| `workflow_dispatch` | Manual trigger from Actions tab |

## Quality Gates

All jobs must pass for PR approval:

✅ **Production build succeeds**  
✅ **Zero TypeScript errors** (`pnpm run check`)  
✅ **ESLint validation passes** (`pnpm run lint`)  
✅ **Code formatting is correct** (`pnpm run format:check`)  
✅ **Preview server starts successfully** (PR only)

## Status Badges

Add these to your `README.md` for visibility:

```markdown
[![CI Status](https://github.com/YOUR_USERNAME/driplo-fresh/workflows/🚀%20CI/CD%20Pipeline/badge.svg)](https://github.com/YOUR_USERNAME/driplo-fresh/actions)
[![Build Status](https://github.com/YOUR_USERNAME/driplo-fresh/workflows/🚀%20CI/CD%20Pipeline/badge.svg?event=push)](https://github.com/YOUR_USERNAME/driplo-fresh/actions)
```

**Replace `YOUR_USERNAME` with your actual GitHub username.**

## Environment Configuration

The workflow uses these environment variables:

```yaml
NODE_VERSION: '20'      # Node.js LTS version
PNPM_VERSION: 'latest'  # Always use latest pnpm
```

### Adding Secrets (if needed)

For Supabase or other integrations, add secrets in:  
**Settings → Secrets and variables → Actions**

```yaml
# Example environment variables (add when needed)
SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## Local Development Commands

Match your local workflow with CI:

```bash
# Full CI simulation
pnpm run check       # TypeScript + Svelte validation
pnpm run lint        # ESLint validation  
pnpm run format:check # Prettier format check
pnpm run build       # Production build
pnpm run preview     # Preview build test

# Quick fixes
pnpm run lint:fix    # Auto-fix ESLint issues
pnpm run format      # Auto-format with Prettier
```

## Optimization Features

### 📦 Dependency Caching
- **pnpm cache**: Speeds up `pnpm install` by ~60%
- **Build cache**: Reuses `.svelte-kit` and `build` artifacts

### ⚡ Performance Tuning
- **Timeout limits**: Prevents hanging jobs (5-15 minutes)
- **Parallel execution**: Type checking + building run together
- **Conditional runs**: Preview tests only on PRs

### 🔒 Security
- **`pnpm audit`**: Scans for security vulnerabilities
- **Dependency updates**: Lists outdated packages
- **Frozen lockfile**: Ensures consistent installs

## Troubleshooting

### Common Issues

**❌ "Build failed"**
```bash
# Run locally to debug
pnpm run build
```

**❌ "TypeScript errors"**
```bash
# Check types locally
pnpm run check
```

**❌ "Linting failed"**
```bash
# Fix automatically
pnpm run lint:fix
```

**❌ "Format check failed"**
```bash
# Format automatically
pnpm run format
```

### Workflow Debugging

1. **Check the Actions tab** for detailed logs
2. **Look for red ❌ icons** in failed jobs
3. **Expand failed steps** to see error details
4. **Run commands locally** to reproduce issues

## Integration with Vercel

The workflow is optimized for **Vercel deployment**:

- ✅ Vercel automatically deploys on `main` branch pushes
- ✅ Preview deployments created for all PRs
- ✅ Build cache shared between CI and Vercel
- ✅ Environment variables synced from Vercel dashboard

## Customization

### Adding New Checks

Add steps to existing jobs:

```yaml
- name: 🧪 Run tests
  run: pnpm run test
```

### Adding Environment Variables

```yaml
env:
  CUSTOM_VAR: 'value'
```

### Changing Node.js Version

Update in workflow file:

```yaml
env:
  NODE_VERSION: '18'  # or '22'
```

## Maintenance

- **Weekly**: Check for Action updates
- **Monthly**: Review dependency audit results  
- **Quarterly**: Update Node.js version if needed

---

**📚 For more details, see the [project documentation](../README.md) and [PROJECT_STATUS.md](../PROJECT_STATUS.md)**