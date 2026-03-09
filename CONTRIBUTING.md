# Contributing to OpenClaw Dashboard

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/OpenClaw/openclaw-dashboard.git
   cd openclaw-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your paths
   ```

4. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3333](http://localhost:3333)

## Pull Request Process

1. Fork the repository and create a feature branch from `main`
2. Make your changes with clear, focused commits
3. Ensure `npm run build` passes without errors
4. Run `npm run lint` and fix any issues
5. Open a PR with a clear description of what changed and why

## Code Style

- TypeScript throughout (strict mode)
- Tailwind CSS for styling — use design tokens from `tailwind.config.ts`
- React Server Components by default; add `'use client'` only when needed
- Keep components focused and composable

## Reporting Bugs

Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS/Node version
- Screenshots if applicable

## Feature Requests

Open an issue tagged `enhancement` describing the use case and proposed solution.
