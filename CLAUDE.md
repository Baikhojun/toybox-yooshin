# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Terminology
- **Artifact = Toy**: In this project, we refer to artifacts as "toys" for simplicity. When the user mentions "toy", they mean "artifact".

## Project Overview

This is a TOYBOX template - a React-based portfolio/gallery application for showcasing Claude-generated toys (artifacts). It's designed to be deployed to GitHub Pages and serves as a template for creating personal toy collections.

## Architecture

**Frontend Stack:**
- React 18 with TypeScript
- Vite for build tooling and development server
- Tailwind CSS for styling
- shadcn/ui component library (Radix UI primitives)
- React Router for navigation

**Toy System:**
- Toys are stored in `src/artifacts/` as `.tsx` files or in subdirectories with `index.tsx`
- Static imports via Vite's `import.meta.glob()` for automatic discovery
- Support for React, SVG, and Mermaid diagram types
- Metadata defined within each toy file

**Key Components:**
- `ArtifactLoader` (`src/lib/artifactLoader.ts`): Core system for discovering and loading toys
- `ArtifactRunner` (`src/components/ArtifactRunner.tsx`): Renders individual toys
- `ArtifactGallery` (`src/components/ArtifactGallery.tsx`): Main gallery view
- UI components in `src/components/ui/`: shadcn/ui component library

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build locally
npm run preview

# Deploy to GitHub Pages
npm run deploy

# Test production build with base path
npm run test-production
```

### Testing the Development Server

When testing the development server, run it as a background process that logs to `.local/devserver.log`:

```bash
# Create .local directory if it doesn't exist
mkdir -p .local

# Run dev server in background with logging
npm run dev > .local/devserver.log 2>&1 &
```

## Configuration

**TOYBOX_CONFIG.json**: Site configuration (title, description, theme, layout)
**components.json**: shadcn/ui configuration
**vite.config.ts**: Build configuration with GitHub Pages support
**github.config.json**: GitHub deployment configuration (username and repository name)

### GitHub Deployment Configuration

Before deploying to GitHub Pages:

1. Check if `github.config.json` exists and is properly configured
2. If the file doesn't exist or contains placeholder values (`YOUR_GITHUB_USERNAME` or `YOUR_REPO_NAME`):
   - Ask the user for their GitHub username and repository name
   - Create/update `github.config.json` with these values
   - Run `npm run update-config` to apply the configuration to all relevant files
3. The configuration updates:
   - package.json (homepage and repository URL)
   - vite.config.ts (base path)
   - index.html (title and base URL)
   - public/404.html (title)
   - src/components/AboutPage.tsx (GitHub link)
   - .github/workflows/deploy.yml (BASE_URL)

Example `github.config.json`:
```json
{
  "username": "myusername",
  "repository": "my-toybox",
  "description": "Configuration for GitHub deployment. Update these values when using this template."
}
```

## Path Resolution

- `@/` and `src/` aliases resolve to `./src/`
- Base path handling for GitHub Pages deployment (set to `/YOUR_REPO_NAME/` in production)

## Toy Development

Create new toys in `src/artifacts/`:
- Direct files: `src/artifacts/my-toy.tsx`
- Subdirectories: `src/artifacts/my-toy/index.tsx`

Each toy should export metadata and a default React component.

## Build System

Vite handles:
- Asset optimization and chunking
- TypeScript compilation
- CSS processing with Tailwind and PostCSS
- Source map generation
- GitHub Pages deployment preparation