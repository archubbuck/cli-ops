# Clio Website

Documentation site built with [Docusaurus](https://docusaurus.io/).

## Development

```bash
cd website
pnpm install
pnpm start
```

This starts a local development server at http://localhost:3000. Most changes are reflected live without restarting the server.

## Build

```bash
pnpm build
```

Generates static content into the `build` directory that can be served using any static hosting service.

## Deployment

### GitHub Pages

```bash
GIT_USER=your-github-username pnpm deploy
```

### Vercel / Netlify

Point your hosting provider to the `website` directory and set the build command to `pnpm build`.

## Directory Structure

```
website/
├── docs/              # Markdown documentation
│   ├── intro.md
│   ├── installation.md
│   ├── concepts/      # Core concepts
│   ├── plugins/       # Plugin development
│   └── architecture/  # Architecture docs
├── src/
│   ├── components/    # React components
│   ├── css/          # Custom CSS
│   └── pages/        # Custom pages (plugins registry, etc.)
├── static/           # Static assets
├── docusaurus.config.ts
├── sidebars.ts
└── package.json
```

## Customization

- **Theme**: Edit `src/css/custom.css`
- **Navbar**: Edit `docusaurus.config.ts` → `themeConfig.navbar`
- **Footer**: Edit `docusaurus.config.ts` → `themeConfig.footer`
- **Sidebar**: Edit `sidebars.ts`

## Algolia Search

Update `docusaurus.config.ts` with your Algolia credentials:

```typescript
algolia: {
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_SEARCH_API_KEY',
  indexName: 'clio',
}
```

## Content Guidelines

- Use ADHD-friendly formatting (clear headers, bullet points, visual hierarchy)
- Include code examples with every command
- Add "Next Steps" sections to guide readers
- Keep paragraphs short and scannable
