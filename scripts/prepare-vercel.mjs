import { createHash } from "node:crypto";
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const sourceDirectory = path.join(projectRoot, "site-source");
const sourceAssetsDirectory = path.join(projectRoot, "site-assets");
const publicDirectory = path.join(projectRoot, "public");
const outputDirectory = path.join(publicDirectory, "_site");
const assetsDirectory = path.join(publicDirectory, "_site-assets");
const productionOrigin = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://www.citrusdemolitionandlandclearing.com"
).replace(/\/$/, "");

const responsiveAssets = [
  '<link rel="stylesheet" href="/responsive.css">',
  '<script src="/responsive.js" defer></script>',
].join("\n");

const mobileMenuMarkup = `
<nav class="mobile-menu" id="mobile-menu" aria-label="Mobile navigation" hidden>
  <button class="mobile-menu-close" type="button" aria-label="Close menu"><span aria-hidden="true">×</span></button>
  <div class="mobile-menu-inner">
    <p class="mobile-menu-label">Menu</p>
    <details>
      <summary>Demolition Services</summary>
      <div class="mobile-menu-links">
        <a href="/">All Demolition Services</a>
        <a href="/residential-demolition">Residential Demolition</a>
        <a href="/commercial-demolition">Commercial Demolition</a>
        <a href="/selective-demolition">Selective Demolition</a>
        <a href="/emergency-demolition">Emergency Demolition</a>
        <a href="/mobile-home-demolition">Mobile Home Demolition</a>
        <a href="/concrete-foundation-removal">Concrete &amp; Foundation Removal</a>
      </div>
    </details>
    <details>
      <summary>Site &amp; Property Work</summary>
      <div class="mobile-menu-links">
        <a href="/land-clearing">Land Clearing</a>
        <a href="/site-preparation">Site Preparation</a>
        <a href="/pool-removal">Pool Removal</a>
        <a href="/debris-removal-hauling">Debris Removal &amp; Hauling</a>
      </div>
    </details>
    <details>
      <summary>Service Areas</summary>
      <div class="mobile-menu-links">
        <a href="/brooksville">Brooksville</a>
        <a href="/spring-hill">Spring Hill</a>
        <a href="/inverness">Inverness</a>
        <a href="/hernando">Hernando County</a>
      </div>
    </details>
    <a class="mobile-menu-primary-link" href="/projects">Projects</a>
    <a class="mobile-menu-primary-link" href="/blog">Blog</a>
    <a class="mobile-menu-primary-link" href="/why-citrus">Why Citrus</a>
    <a class="mobile-menu-primary-link" href="/contact">Contact</a>
    <a class="mobile-menu-estimate" href="/contact">Request a free estimate <span aria-hidden="true">↗</span></a>
  </div>
</nav>`;

export const routeByFile = {
  "design.html": "/",
  "blog.html": "/blog",
  "brooksville.html": "/brooksville",
  "commercial-demolition.html": "/commercial-demolition",
  "concrete-foundation-removal.html": "/concrete-foundation-removal",
  "contact.html": "/contact",
  "choosing-the-right-demolition-contractor.html": "/choosing-the-right-demolition-contractor",
  "a-comprehensive-guide-to-residential-demolition-services.html": "/a-comprehensive-guide-to-residential-demolition-services",
  "debris-removal-hauling.html": "/debris-removal-hauling",
  "demolition-permits-citrus-county-fl.html": "/demolition-permits-citrus-county-fl",
  "emergency-demolition.html": "/emergency-demolition",
  "hernando-residential-demolition.html": "/hernando/residential-demolition",
  "hernando.html": "/hernando",
  "house-demolition-cost.html": "/house-demolition-cost",
  "inverness-commercial-demolition.html": "/inverness/commercial-demolition",
  "inverness-demolition.html": "/inverness/demolition",
  "inverness-land-clearing.html": "/inverness/land-clearing",
  "inverness-residential-demolition.html": "/inverness/residential-demolition",
  "inverness-site-preparation.html": "/inverness/site-prep",
  "inverness.html": "/inverness",
  "land-clearing.html": "/land-clearing",
  "mobile-home-demolition.html": "/mobile-home-demolition",
  "pool-removal.html": "/pool-removal",
  "projects.html": "/projects",
  "residential-demolition.html": "/residential-demolition",
  "selective-demolition.html": "/selective-demolition",
  "site-preparation-services-crystal-river-fl.html": "/site-preparation-services-crystal-river-fl",
  "site-preparation.html": "/site-preparation",
  "spring-hill-land-clearing.html": "/spring-hill/land-clearing",
  "spring-hill.html": "/spring-hill",
  "why-citrus.html": "/why-citrus",
};

function decodeHtmlAttribute(value) {
  const namedEntities = { amp: "&", apos: "'", gt: ">", lt: "<", quot: '"' };
  return value.replace(
    /&(#x[0-9a-f]+|#\d+|amp|apos|gt|lt|quot);/gi,
    (_, entity) => {
      if (entity.startsWith("#x") || entity.startsWith("#X")) {
        return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
      }
      if (entity.startsWith("#")) {
        return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
      }
      return namedEntities[entity.toLowerCase()];
    },
  );
}

function plainText(value) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function extractInnerDocument(wrapper, filename) {
  const match = wrapper.match(/\bsrcdoc="([\s\S]*?)"\s*>\s*<\/iframe>/i);
  return match ? decodeHtmlAttribute(match[1]) : wrapper;
}

function pageDescription(html) {
  const heroCopy = html.match(/<p\b[^>]*class=["'][^"']*\bhero-copy\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
  const firstParagraph = html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
  const fallback = "Licensed demolition, land clearing, site preparation, and debris removal services across Central Florida.";
  const description = plainText(heroCopy?.[1] || firstParagraph?.[1] || fallback);
  if (description.length <= 158) return description;
  return `${description.slice(0, 155).replace(/\s+\S*$/, "")}...`;
}

function pageTitle(html, filename) {
  if (filename === "design.html") return "Citrus Demolition & Land Clearing | Central Florida";
  const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const title = plainText(heading?.[1] || filename.replace(/\.html$/, "").replaceAll("-", " "));
  return `${title} | Citrus Demolition & Land Clearing`;
}

function cleanInternalUrls(html) {
  let cleaned = html;
  const routes = Object.entries(routeByFile).sort(([left], [right]) => right.length - left.length);
  for (const [filename, route] of routes) cleaned = cleaned.replaceAll(`/${filename}`, route);
  return cleaned.replace(/href=["']{2}/gi, 'href="/"');
}

function prepareDocument(html, filename) {
  const route = routeByFile[filename];
  const canonicalUrl = `${productionOrigin}${route === "/" ? "/" : route}`;
  const title = pageTitle(html, filename);
  const description = pageDescription(html);
  let prepared = cleanInternalUrls(html)
    .replace(/<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>\s*/gi, "")
    .replace(/<meta\b[^>]*name=["']description["'][^>]*>\s*/gi, "")
    .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>\s*/gi, "")
    .replace(/<meta\b[^>]*property=["']og:[^"']+["'][^>]*>\s*/gi, "")
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  const metadata = [
    `<meta name="description" content="${description.replaceAll('"', "&quot;")}">`,
    `<link rel="canonical" href="${canonicalUrl}">`,
    `<meta property="og:title" content="${title.replaceAll('"', "&quot;")}">`,
    `<meta property="og:description" content="${description.replaceAll('"', "&quot;")}">`,
    `<meta property="og:url" content="${canonicalUrl}">`,
    '<meta property="og:type" content="website">',
  ].join("\n");
  prepared = prepared.replace(/<\/head>/i, `${metadata}\n${responsiveAssets}\n</head>`);
  prepared = prepared.replace(
    /(<header\b[\s\S]*?<\/header>)/i,
    `$1${mobileMenuMarkup}`,
  );
  return `<!-- Generated from site-source/${filename} by scripts/prepare-vercel.mjs. -->\n${prepared}`;
}

async function extractEmbeddedImages(html) {
  const matches = [...html.matchAll(/data:(image\/(?:gif|jpeg|png|webp));base64,([a-z0-9+/=\r\n]+)/gi)];
  let prepared = html;
  const writtenAssets = new Set();
  const extensionByMimeType = {
    "image/gif": "gif",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  for (const match of matches) {
    const bytes = Buffer.from(match[2].replace(/\s+/g, ""), "base64");
    const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 20);
    const extension = extensionByMimeType[match[1].toLowerCase()];
    const assetName = `${hash}.${extension}`;
    if (!writtenAssets.has(assetName)) {
      await writeFile(path.join(assetsDirectory, assetName), bytes);
      writtenAssets.add(assetName);
    }
    prepared = prepared.replaceAll(match[0], `/_site-assets/${assetName}`);
  }

  return prepared;
}

async function main() {
  await rm(outputDirectory, { force: true, recursive: true });
  await rm(assetsDirectory, { force: true, recursive: true });
  await mkdir(outputDirectory, { recursive: true });
  await mkdir(assetsDirectory, { recursive: true });
  await cp(sourceAssetsDirectory, assetsDirectory, { recursive: true, force: true });
  const files = (await readdir(sourceDirectory)).filter((filename) => filename.endsWith(".html")).sort();
  const expectedFiles = Object.keys(routeByFile).sort();
  if (files.join("\n") !== expectedFiles.join("\n")) {
    throw new Error("The public HTML page list changed. Update routeByFile before building so no page is omitted.");
  }
  for (const filename of files) {
    const wrapper = await readFile(path.join(sourceDirectory, filename), "utf8");
    const outputName = filename === "design.html" ? "index.html" : filename;
    const standaloneHtml = prepareDocument(extractInnerDocument(wrapper, filename), filename);
    await writeFile(path.join(outputDirectory, outputName), await extractEmbeddedImages(standaloneHtml), "utf8");
  }
  const sitemapUrls = [...new Set(Object.values(routeByFile))].sort().map((route) => {
    const url = `${productionOrigin}${route === "/" ? "/" : route}`;
    return `  <url><loc>${url}</loc></url>`;
  }).join("\n");
  await writeFile(path.join(publicDirectory, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>\n`, "utf8");
  await writeFile(path.join(publicDirectory, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${productionOrigin}/sitemap.xml\n`, "utf8");
  const assets = await readdir(assetsDirectory);
  console.log(`Prepared ${files.length} pages and ${assets.length} optimized static assets for Next.js and Vercel.`);
}

await main();
