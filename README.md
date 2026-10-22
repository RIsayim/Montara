# Montara Home Technology

A static Astro site for Montara, based on the supplied SONA reference. Astro handles page rendering, and GSAP powers the entrance and scroll animations. The reference hero video and service/project images are stored locally in `public/`.

## Getting started

```sh
npm install
npm run dev
```

The development server prints a local URL, usually `http://localhost:4321`.

## Available scripts

- `npm run dev` — start the local development server
- `npm run build` — create the production site in `dist/`
- `npm run preview` — preview the production build locally

## Project structure

```text
src/
  components/     Shared Astro components
  data/           Home page content
  layouts/        Document layout and metadata
  pages/          File-based routes
  scripts/        GSAP animation entry point
  styles/         Global design system and responsive styles
public/
  images/         Static image assets
  videos/         Background video assets
```

The home page is in `src/pages/index.astro`. Shared copy and service/project cards are in `src/data/home.ts`.
