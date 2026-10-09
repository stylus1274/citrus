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

const withTrailingSlash = (route) => route === "/" ? "/" : `${route.replace(/\/+$/, "")}/`;


const googleTag = "<!-- Google tag (gtag.js) -->\n<script async src=\"https://www.googletagmanager.com/gtag/js?id=G-4WQ5Z1CLMZ\"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n\n  gtag('config', 'G-4WQ5Z1CLMZ');\n</script>";

function installGoogleTag(html) {
  // Normalize an existing installation before placing one copy first in the head.
  const cleaned = html
    .replace(/<!--\s*Google tag \(gtag\.js\)\s*-->\s*/gi, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>\s*/gi, (script) =>
      script.includes("G-4WQ5Z1CLMZ") ? "" : script,
    );
  if (!/<head\b[^>]*>/i.test(cleaned)) {
    throw new Error("Cannot install Google tag: page has no head element.");
  }
  return cleaned.replace(/(<head\b[^>]*>)\s*/i, (_, head) => `${head}\n${googleTag}\n`);
}

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
  "5-signs-you-need-a-licensed-demolition-contractor.html": "/5-signs-you-need-a-licensed-demolition-contractor",
  "crystal-river-debris-removal-after-demolition.html": "/crystal-river-debris-removal-after-demolition",
  "emergency-demolition-crystal-river.html": "/emergency-demolition-crystal-river",
  "design.html": "/",
  "blog.html": "/blog",
  "brooksville.html": "/brooksville",
  "commercial-demolition.html": "/commercial-demolition",
  "concrete-foundation-removal.html": "/concrete-foundation-removal",
  "concrete-removal-faqs-guide.html": "/concrete-removal-faqs-guide",
  "contact.html": "/contact",
  "choosing-the-right-demolition-contractor.html": "/choosing-the-right-demolition-contractor",
  "choose-foundation-demolition-contractor-crystal-river-fl.html": "/choose-foundation-demolition-contractor-crystal-river-fl",
  "a-comprehensive-guide-to-residential-demolition-services.html": "/a-comprehensive-guide-to-residential-demolition-services",
  "debris-removal-hauling.html": "/debris-removal-hauling",
  "demolition-permits-citrus-county-fl.html": "/demolition-permits-citrus-county-fl",
  "demolition-waste-florida-guide.html": "/demolition-waste-florida-guide",
  "demolition-excavation-services-citrus-county-fl.html": "/demolition-excavation-services-citrus-county-fl",
  "emergency-demolition.html": "/emergency-demolition",
  "environmental-impact-old-building-demolition.html": "/environmental-impact-old-building-demolition",
  "foundation-slab-removal-required-pricing.html": "/foundation-slab-removal-required-pricing",
  "land-preparation-after-demolition-citrus-county.html": "/land-preparation-after-demolition-citrus-county",
  "hurricane-damaged-house-demolition-in-citrus-county.html": "/hurricane-damaged-house-demolition-in-citrus-county",
  "whats-the-difference-between-cleanup-and-demolition.html": "/whats-the-difference-between-cleanup-and-demolition",
  "house-demolition-cost-citrus-county-guide.html": "/house-demolition-cost-citrus-county-guide",
  "top-signs-property-needs-emergency-demolition-florida.html": "/top-signs-property-needs-emergency-demolition-florida",
  "storm-damage-repair-vs-demolition-west-central-florida.html": "/storm-damage-repair-vs-demolition-west-central-florida",
  "hernando-residential-demolition.html": "/hernando/residential-demolition",
  "hernando.html": "/hernando",
  "house-demolition-cost.html": "/house-demolition-cost",
  "house-demolition-permit-crystal-river.html": "/house-demolition-permit-crystal-river",
  "how-long-does-it-take-to-demolish-a-house-in-crystal-river-fl.html": "/how-long-does-it-take-to-demolish-a-house-in-crystal-river-fl",
  "understanding-hidden-costs-residential-demolition.html": "/understanding-hidden-costs-residential-demolition",
  "inverness-commercial-demolition.html": "/inverness/commercial-demolition",
  "inverness-demolition.html": "/inverness/demolition",
  "inverness-land-clearing.html": "/inverness/land-clearing",
  "inverness-residential-demolition.html": "/inverness/residential-demolition",
  "inverness-site-preparation.html": "/inverness/site-prep",
  "inverness.html": "/inverness",
  "land-clearing.html": "/land-clearing",
  "licensed-residential-demolition-contractor-crystal-river-fl.html": "/licensed-residential-demolition-contractor-crystal-river-fl",
  "marion-county-residential-demolition-faq.html": "/marion-county-residential-demolition-faq",
  "mobile-home-demolition.html": "/mobile-home-demolition",
  "mobile-home-demolition-cost-florida.html": "/mobile-home-demolition-cost-florida",
  "mobile-home-demolition-contractor-license-insurance-crystal-river-fl.html": "/mobile-home-demolition-contractor-license-insurance-crystal-river-fl",
  "mobile-home-demolition-contractor-services-crystal-river-fl.html": "/mobile-home-demolition-contractor-services-crystal-river-fl",
  "can-you-demolish-a-house-with-asbestos-florida.html": "/can-you-demolish-a-house-with-asbestos-florida",
  "mobile-home-demolition-services-citrus-county.html": "/mobile-home-demolition-services-citrus-county",
  "mobile-home-demolition-vs-removal-central-florida.html": "/mobile-home-demolition-vs-removal-central-florida",
  "pool-removal.html": "/pool-removal",
  "pool-removal-cost-in-florida.html": "/pool-removal-cost-in-florida",
  "projects.html": "/projects",
  "residential-demolition.html": "/residential-demolition",
  "residential-contractor-florida.html": "/residential-contractor-florida",
  "selective-demolition.html": "/selective-demolition",
  "site-preparation-services-crystal-river-fl.html": "/site-preparation-services-crystal-river-fl",
  "site-preparation.html": "/site-preparation",
  "spring-hill-land-clearing.html": "/spring-hill/land-clearing",
  "spring-hill.html": "/spring-hill",
  "total-demolition-faq.html": "/total-demolition-faq",
  "why-citrus.html": "/why-citrus",
  "who-removes-old-mobile-homes-crystal-river-fl.html": "/who-removes-old-mobile-homes-crystal-river-fl",
  "what-to-expect-during-detached-garage-demolition.html": "/what-to-expect-during-detached-garage-demolition",
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

function pageHeading(html, filename) {
  const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  return plainText(heading?.[1] || filename.replace(/\.html$/, "").replaceAll("-", " "));
}

function pageTitle(html, filename) {
  if (filename === "design.html") return "Citrus Demolition & Land Clearing | Central Florida";
  return `${pageHeading(html, filename)} | Citrus Demolition & Land Clearing`;
}

function absoluteUrl(value) {
  if (!value) return undefined;
  try {
    return new URL(value, `${productionOrigin}/`).href;
  } catch {
    return undefined;
  }
}

function pageImage(html) {
  const heroRule = html.match(/\.hero-bg\s*\{[^}]*\}/i)?.[0] || "";
  const heroImages = [...heroRule.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)]
    .map((match) => match[2])
    .filter((value) => !value.startsWith("data:"));
  if (heroImages.length) return absoluteUrl(heroImages.at(-1));

  const contentImage = html.match(/<img\b[^>]*src=["']([^"']+)["'][^>]*>/i)?.[1];
  return absoluteUrl(contentImage) || `${productionOrigin}/icon.png`;
}

function pageLogo(html) {
  const brand = html.match(/<a\b[^>]*class=["'][^"']*\bbrand\b[^"']*["'][^>]*>[\s\S]*?<img\b[^>]*src=["']([^"']+)["']/i)?.[1];
  return absoluteUrl(brand) || `${productionOrigin}/icon.png`;
}

function schemaDate(value) {
  const match = value?.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s+(\d{4})/i);
  if (!match) return undefined;
  const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
  ];
  const month = String(months.indexOf(match[1].toLowerCase()) + 1).padStart(2, "0");
  return `${match[3]}-${month}-${match[2].padStart(2, "0")}`;
}

function articleDates(html) {
  const meta = plainText(html.match(/<div\b[^>]*class=["'][^"']*\barticle-meta\b[^"']*["'][^>]*>[\s\S]*?<\/div>/i)?.[0] || "");
  const published = schemaDate(meta.match(/Published\s+([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/i)?.[1]);
  const modified = schemaDate(meta.match(/Updated\s+([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/i)?.[1]);
  return {
    datePublished: published || modified,
    dateModified: modified || published,
  };
}

function faqItems(html) {
  const items = [];
  for (const match of html.matchAll(/<details\b[^>]*class=["'][^"']*\bfaq-item\b[^"']*["'][^>]*>([\s\S]*?)<\/details>/gi)) {
    const question = plainText(match[1].match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i)?.[1] || "");
    const answer = plainText(match[1].match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1] || "");
    if (question && answer) items.push({ question, answer });
  }
  return items;
}

function structuredData(html, filename, isPost) {
  const route = routeByFile[filename];
  const canonicalUrl = `${productionOrigin}${withTrailingSlash(route)}`;
  const heading = pageHeading(html, filename);
  const title = pageTitle(html, filename);
  const description = pageDescription(html);
  const image = pageImage(html);
  const graph = [
    {
      "@type": ["LocalBusiness", "GeneralContractor"],
      "@id": `${productionOrigin}/#organization`,
      name: "Citrus Demolition & Land Clearing",
      url: `${productionOrigin}/`,
      logo: {
        "@type": "ImageObject",
        url: pageLogo(html),
      },
      image,
      telephone: "+1-352-464-5955",
      address: {
        "@type": "PostalAddress",
        streetAddress: "6459 W Seven Rivers Dr",
        addressLocality: "Crystal River",
        addressRegion: "FL",
        postalCode: "34429",
        addressCountry: "US",
      },
      areaServed: ["Citrus County", "Hernando County", "Levy County", "Marion County", "Lake County", "Pasco County"].map((name) => ({
        "@type": "AdministrativeArea",
        name,
      })),
      identifier: {
        "@type": "PropertyValue",
        name: "Florida contractor license",
        value: "CBC1264327",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${productionOrigin}/#website`,
      url: `${productionOrigin}/`,
      name: "Citrus Demolition & Land Clearing",
      publisher: { "@id": `${productionOrigin}/#organization` },
      inLanguage: "en-US",
    },
  ];

  const webpage = {
    "@type": filename === "blog.html" ? "CollectionPage" : "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: title,
    description,
    isPartOf: { "@id": `${productionOrigin}/#website` },
    about: { "@id": `${productionOrigin}/#organization` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: image,
    },
    inLanguage: "en-US",
  };
  graph.push(webpage);

  if (route !== "/") {
    const breadcrumbItems = [
      { name: "Home", item: `${productionOrigin}/` },
    ];
    if (isPost || filename === "blog.html") {
      breadcrumbItems.push({ name: "Blog", item: `${productionOrigin}/blog/` });
    }
    if (isPost) breadcrumbItems.push({ name: heading, item: canonicalUrl });
    if (!isPost && filename !== "blog.html") breadcrumbItems.push({ name: heading, item: canonicalUrl });

    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumb`,
      itemListElement: breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.item,
      })),
    });
    webpage.breadcrumb = { "@id": `${canonicalUrl}#breadcrumb` };
  }

  if (isPost) {
    const dates = articleDates(html);
    const article = {
      "@type": "BlogPosting",
      "@id": `${canonicalUrl}#article`,
      url: canonicalUrl,
      mainEntityOfPage: { "@id": `${canonicalUrl}#webpage` },
      headline: heading,
      description,
      image: [image],
      author: { "@id": `${productionOrigin}/#organization` },
      publisher: { "@id": `${productionOrigin}/#organization` },
      datePublished: dates.datePublished,
      dateModified: dates.dateModified,
      inLanguage: "en-US",
    };
    graph.push(article);
    webpage.mainEntity = { "@id": `${canonicalUrl}#article` };
  }

  const faqs = faqItems(html);
  if (faqs.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${canonicalUrl}#faq`,
      url: canonicalUrl,
      mainEntity: faqs.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      })),
    });
  }

  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replaceAll("<", "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}

function cleanInternalUrls(html) {
  let cleaned = html;
  const routes = Object.entries(routeByFile).sort(([left], [right]) => right.length - left.length);
  for (const [filename, route] of routes) cleaned = cleaned.replaceAll(`/${filename}`, route);
  const publicRoutes = [...new Set(Object.values(routeByFile))]
    .filter((route) => route !== "/")
    .sort((left, right) => right.length - left.length);
  for (const route of publicRoutes) {
    const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleaned = cleaned.replace(
      new RegExp(`(href=["'])${escapedRoute}(?=(?:[?#][^"']*)?["'])`, "gi"),
      `$1${withTrailingSlash(route)}`,
    );
  }
  return cleaned.replace(/href=["']{2}/gi, 'href="/"');
}

function reduceHeadingFontSizes(html) {
  return html.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (_, openingTag, css, closingTag) => {
    const adjustedCss = css.replace(/([^{}]+)\{([^{}]*)\}/g, (rule, selectors, declarations) => {
      const headings = [...selectors.matchAll(/(?:^|[\s>+~,])h([1-6])\b/gi)];
      if (headings.length === 0 || !/font-size\s*:/i.test(declarations)) return rule;

      const levels = new Set(headings.map((match) => match[1]));
      if (levels.has("1") && levels.size > 1) {
        throw new Error(`A mixed H1 and H2-H6 font-size rule cannot use the global heading adjustment: ${selectors.trim()}`);
      }

      const reduction = levels.has("1") ? 10 : 8;
      const adjustedDeclarations = declarations.replace(
        /font-size\s*:\s*([^;}]+)(;?)/gi,
        (_, value, terminator) => `font-size: calc(${value.trim()} - ${reduction}px)${terminator}`,
      );
      return `${selectors}{${adjustedDeclarations}}`;
    });
    return `${openingTag}${adjustedCss}${closingTag}`;
  });
}

function prepareDocument(html, filename, postRoutes) {
  const route = routeByFile[filename];
  const isPost = postRoutes.has(withTrailingSlash(route));
  const canonicalUrl = `${productionOrigin}${withTrailingSlash(route)}`;
  const title = pageTitle(html, filename);
  const description = pageDescription(html);
  let prepared = installGoogleTag(reduceHeadingFontSizes(cleanInternalUrls(html)))
    .replace(/<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>\s*/gi, "")
    .replace(/<meta\b[^>]*name=["']description["'][^>]*>\s*/gi, "")
    .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>\s*/gi, "")
    .replace(/<meta\b[^>]*property=["']og:[^"']+["'][^>]*>\s*/gi, "")
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi, "")
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  const metadata = [
    `<meta name="description" content="${description.replaceAll('"', "&quot;")}">`,
    `<link rel="canonical" href="${canonicalUrl}">`,
    `<meta property="og:title" content="${title.replaceAll('"', "&quot;")}">`,
    `<meta property="og:description" content="${description.replaceAll('"', "&quot;")}">`,
    `<meta property="og:url" content="${canonicalUrl}">`,
    `<meta property="og:type" content="${isPost ? "article" : "website"}">`,
  ].join("\n");
  prepared = prepared.replace(/<\/head>/i, `${metadata}\n${structuredData(prepared, filename, isPost)}\n${responsiveAssets}\n</head>`);
  prepared = prepared.replace(
    /(<header\b[\s\S]*?<\/header>)/i,
    `$1${cleanInternalUrls(mobileMenuMarkup)}`,
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
  const blogHtml = cleanInternalUrls(extractInnerDocument(
    await readFile(path.join(sourceDirectory, "blog.html"), "utf8"),
    "blog.html",
  ));
  const postRoutes = new Set(
    [...blogHtml.matchAll(/<article\b[^>]*class=["'][^"']*\barticle-card\b[^"']*["'][\s\S]*?<a\b[^>]*href=["'](\/[^"'#?]+)["']/gi)]
      .map((match) => withTrailingSlash(match[1])),
  );
  for (const filename of files) {
    const wrapper = await readFile(path.join(sourceDirectory, filename), "utf8");
    const outputName = filename === "design.html" ? "index.html" : filename;
    const standaloneHtml = prepareDocument(extractInnerDocument(wrapper, filename), filename, postRoutes);
    await writeFile(path.join(outputDirectory, outputName), await extractEmbeddedImages(standaloneHtml), "utf8");
  }
  const allRoutes = [...new Set(Object.values(routeByFile).map(withTrailingSlash))].sort();
  const pageRoutes = allRoutes.filter((route) => !postRoutes.has(route));
  if (postRoutes.size + pageRoutes.length !== allRoutes.length) {
    throw new Error("The post and page sitemap routes do not cover every public route exactly once.");
  }
  const sitemapXml = (routes) => {
    const sitemapUrls = routes.map((route) => {
    const url = `${productionOrigin}${withTrailingSlash(route)}`;
    return `  <url><loc>${url}</loc></url>`;
    }).join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>\n`;
  };
  await rm(path.join(publicDirectory, "sitemap.xml"), { force: true });
  await writeFile(path.join(publicDirectory, "post-sitemap.xml"), sitemapXml([...postRoutes].sort()), "utf8");
  await writeFile(path.join(publicDirectory, "page-sitemap.xml"), sitemapXml(pageRoutes), "utf8");
  await writeFile(path.join(publicDirectory, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${productionOrigin}/post-sitemap.xml\nSitemap: ${productionOrigin}/page-sitemap.xml\n`, "utf8");
  const assets = await readdir(assetsDirectory);
  console.log(`Prepared ${files.length} pages and ${assets.length} optimized static assets for Next.js and Vercel.`);
}

await main();
