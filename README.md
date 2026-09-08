# Citrus Demolition & Land Clearing

Production-ready Next.js site for Citrus Demolition & Land Clearing. It is configured for GitHub source control and zero-configuration deployment on Vercel.

## Local development

Requirements:

- Node.js 22 or newer
- npm

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run build
npm run start
```

The preparation step runs automatically before development and production builds. It converts the approved static design files into standalone, crawlable pages and generates canonical metadata, `robots.txt`, and `sitemap.xml`.

## Deploy to Vercel from GitHub

1. Create an empty GitHub repository.
2. Push this repository to GitHub.
3. In Vercel, choose **Add New > Project** and import the GitHub repository.
4. Keep Vercel's detected framework as **Next.js** and use the default build settings.
5. Add `NEXT_PUBLIC_SITE_URL` with the production domain if it differs from `https://www.citrusdemolitionandlandclearing.com`.
6. Deploy, then attach the production domain in Vercel.

No Vercel-specific configuration file is required.

## Content and routes

- Clean standalone page sources live in `site-source/*.html`.
- Optimized, deduplicated image sources live in `site-assets/`.
- `scripts/prepare-vercel.mjs` publishes the pages and assets during each build.
- Clean public routes and legacy redirects are declared in `next.config.ts`.
- Generated files in `public/_site`, `public/_site-assets`, `public/sitemap.xml`, and `public/robots.txt` are intentionally excluded from Git because Vercel rebuilds them.

When a new page is added, add its filename and canonical route to `routeByFile` in `scripts/prepare-vercel.mjs`, then add the matching rewrite in `next.config.ts`.
