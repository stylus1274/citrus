import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import nextConfig from "../next.config.ts";

const projectRoot = process.cwd();
const outputDirectory = path.join(projectRoot, "public", "_site");

test("exports all approved titles consistently in search, social, and page schema", async () => {
  const titles = JSON.parse(await readFile(path.join(projectRoot, "site-source", "page-titles.json"), "utf8"));
  const files = (await readdir(outputDirectory)).filter((file) => file.endsWith(".html"));
  const seen = new Set();
  const decode = (value) => value.replace(/&amp;/g, "&").replace(/&quot;/g, '"');
  for (const filename of files) {
    const html = await readFile(path.join(outputDirectory, filename), "utf8");
    const route = new URL(html.match(/<link rel="canonical" href="([^"]+)"/i)[1]).pathname;
    const expected = titles[route];
    assert.ok(expected, route);
    assert.equal([...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)].length, 1, route);
    assert.equal(decode(html.match(/<title>([\s\S]*?)<\/title>/i)[1]), expected, route);
    assert.equal(decode(html.match(/<meta property="og:title" content="([^"]+)"/i)[1]), expected, route);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i)[1]);
    const page = schema["@graph"].find((item) => ["WebPage", "CollectionPage"].includes(item["@type"]));
    assert.equal(page.name, expected, route);
    seen.add(route);
  }
  assert.equal(seen.size, 62);
  assert.deepEqual([...seen].sort(), Object.keys(titles).sort());
  assert.equal(new Set(Object.values(titles)).size, 62);
  assert.equal(titles["/"], "Citrus Demolition & Land Clearing | Central Florida");
});

test("redirects direct generated-page URLs to their public canonicals", async () => {
  const redirects = await nextConfig.redirects();
  const genericRedirect = redirects.find((item) => item.source === "/_site/:slug.html");
  assert.ok(genericRedirect);

  const files = (await readdir(outputDirectory)).filter((file) => file.endsWith(".html"));
  for (const filename of files) {
    const html = await readFile(path.join(outputDirectory, filename), "utf8");
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
    assert.ok(canonical, filename);
    const source = `/_site/${filename}`;
    const redirect = redirects.find((item) => item.source === source) ?? genericRedirect;
    const destination = redirect.destination.replace(":slug", filename.slice(0, -5));
    assert.equal(destination, new URL(canonical).pathname, filename);
    assert.equal(redirect.permanent, true, filename);
  }
});

test("exports every site page as standalone, crawlable HTML", async () => {
  const files = (await readdir(outputDirectory)).filter((file) => file.endsWith(".html"));
  assert.equal(files.length, 62);
  for (const filename of files) {
    const html = await readFile(path.join(outputDirectory, filename), "utf8");
    assert.match(html, /<!doctype html>/i, filename);
    assert.match(html, /<h1\b/i, filename);
    assert.match(html, /<link rel="canonical"/i, filename);
    assert.match(html, /<link rel="stylesheet" href="\/responsive\.css">/i, filename);
    assert.match(html, /<script src="\/responsive\.js" defer><\/script>/i, filename);
    assert.match(html, /id="mobile-menu"/i, filename);
    assert.doesNotMatch(html, /<iframe\b/i, filename);
    assert.doesNotMatch(html, /data:image\/(?:gif|jpeg|png|webp);base64/i, filename);
  }
});

test("ships shared responsive navigation and narrow-screen safeguards", async () => {
  const responsiveCss = await readFile(path.join(projectRoot, "public", "responsive.css"), "utf8");
  const responsiveJs = await readFile(path.join(projectRoot, "public", "responsive.js"), "utf8");
  assert.match(responsiveCss, /@media \(max-width: 980px\)/);
  assert.match(responsiveCss, /@media \(max-width: 480px\)/);
  assert.match(responsiveCss, /\.mobile-menu-toggle/);
  assert.match(responsiveCss, /font-size: 16px/);
  assert.match(responsiveJs, /aria-expanded/);
  assert.match(responsiveJs, /event\.key === "Escape"/);
});

test("stacks the full-width estimate button below the mobile logo and menu", async () => {
  const responsiveCss = await readFile(path.join(projectRoot, "public", "responsive.css"), "utf8");
  const responsiveJs = await readFile(path.join(projectRoot, "public", "responsive.js"), "utf8");
  assert.match(responsiveCss, /@media \(max-width: 980px\)[\s\S]*?grid-template-columns: minmax\(145px, 1fr\) 48px/);
  assert.match(responsiveCss, /@media \(max-width: 980px\)[\s\S]*?\.header-cta \{[\s\S]*?width: 100%[\s\S]*?grid-column: 1 \/ -1[\s\S]*?grid-row: 2/);
  assert.match(responsiveCss, /@media \(max-width: 980px\)[\s\S]*?\.mobile-menu-toggle \{[\s\S]*?grid-column: 2[\s\S]*?grid-row: 1/);
  assert.match(responsiveCss, /@media \(max-width: 480px\)[\s\S]*?grid-template-columns: minmax\(104px, 1fr\) 42px/);
  assert.match(responsiveCss, /@media \(max-width: 480px\)[\s\S]*?\.header-cta \{[\s\S]*?display: inline-flex/);
  assert.doesNotMatch(responsiveCss, /@media \(max-width: 480px\)[\s\S]*?\.header-cta \{[^}]*display: none/);
  assert.match(responsiveJs, /--mobile-menu-top/);
});

test("hides only the hero pre-heading on mobile", async () => {
  const responsiveCss = await readFile(path.join(projectRoot, "public", "responsive.css"), "utf8");
  assert.match(responsiveCss, /@media \(max-width: 720px\)[\s\S]*?\.hero-content > \.eyebrow \{[\s\S]*?display: none/);
  assert.doesNotMatch(responsiveCss, /@media \(max-width: 720px\)[\s\S]*?\n\s*#citrus-demolition-services-redesign \.eyebrow \{[\s\S]*?display: none/);
});

test("does not ship placeholder or known dead internal links", async () => {
  const files = (await readdir(outputDirectory)).filter((file) => file.endsWith(".html"));
  for (const filename of files) {
    const html = await readFile(path.join(outputDirectory, filename), "utf8");
    assert.doesNotMatch(html, /<a\b[^>]*href=["']#["']/i, filename);
    assert.doesNotMatch(html, /commercial-land-clearing-tampa-bay/i, filename);
  }
});

test("connects every estimate form to the shared email endpoint", async () => {
  const responsiveJs = await readFile(path.join(projectRoot, "public", "responsive.js"), "utf8");
  assert.match(responsiveJs, /fetch\("\/api\/contact"/);
  assert.match(responsiveJs, /form-status/);
  assert.match(responsiveJs, /generate_lead/);

  const files = (await readdir(outputDirectory)).filter((file) => file.endsWith(".html"));
  for (const filename of files) {
    const html = await readFile(path.join(outputDirectory, filename), "utf8");
    if (html.includes('class="estimate-form"')) {
      assert.match(html, /<script src="\/responsive\.js" defer><\/script>/, filename);
    }
  }
});

test("reduces heading sizes globally while preserving the larger H1 adjustment", async () => {
  const html = await readFile(path.join(outputDirectory, "index.html"), "utf8");
  assert.match(html, /font-size:\s*calc\(clamp\(45px,\s*6\.5vw,\s*92px\) - 10px\)/);
  assert.match(html, /font-size:\s*calc\(clamp\(44px,\s*6\.1vw,\s*82px\) - 8px\)/);
  assert.match(html, /font-size:\s*calc\(clamp\(29px,\s*3vw,\s*44px\) - 8px\)/);
});

test("extracts embedded photographs into cacheable static files", async () => {
  const assets = await readdir(path.join(projectRoot, "public", "_site-assets"));
  assert.ok(assets.length > 10);
  assert.ok(assets.every((asset) => /\.(?:gif|jpg|png|webp)$/.test(asset)));
});

test("generates search-engine discovery files", async () => {
  const postSitemap = await readFile(path.join(projectRoot, "public", "post-sitemap.xml"), "utf8");
  const pageSitemap = await readFile(path.join(projectRoot, "public", "page-sitemap.xml"), "utf8");
  const sitemap = `${postSitemap}\n${pageSitemap}`;
  const robots = await readFile(path.join(projectRoot, "public", "robots.txt"), "utf8");
  assert.match(postSitemap, /<urlset\b/);
  assert.match(pageSitemap, /<urlset\b/);
  assert.match(pageSitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/projects/);
  assert.doesNotMatch(postSitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/projects/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/choosing-the-right-demolition-contractor/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/a-comprehensive-guide-to-residential-demolition-services/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/5-signs-you-need-a-licensed-demolition-contractor/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/crystal-river-debris-removal-after-demolition/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/emergency-demolition-crystal-river/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/understanding-hidden-costs-residential-demolition/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/residential-contractor-florida/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/demolition-excavation-services-citrus-county-fl/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/how-long-does-it-take-to-demolish-a-house-in-crystal-river-fl/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/who-removes-old-mobile-homes-crystal-river-fl/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/mobile-home-demolition-vs-removal-central-florida/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/mobile-home-demolition-services-citrus-county/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/mobile-home-demolition-contractor-license-insurance-crystal-river-fl/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/licensed-residential-demolition-contractor-crystal-river-fl/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/choose-foundation-demolition-contractor-crystal-river-fl/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/mobile-home-demolition-contractor-services-crystal-river-fl/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/can-you-demolish-a-house-with-asbestos-florida/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/total-demolition-faq/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/house-demolition-permit-crystal-river/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/environmental-impact-old-building-demolition/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/marion-county-residential-demolition-faq/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/foundation-slab-removal-required-pricing/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/land-preparation-after-demolition-citrus-county/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/hurricane-damaged-house-demolition-in-citrus-county/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/whats-the-difference-between-cleanup-and-demolition/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/house-demolition-cost-citrus-county-guide/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/top-signs-property-needs-emergency-demolition-florida/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/storm-damage-repair-vs-demolition-west-central-florida/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/demolition-waste-florida-guide/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/pool-removal-cost-in-florida/);
  assert.match(postSitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/mobile-home-demolition-cost-florida/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/what-to-expect-during-detached-garage-demolition/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/concrete-removal-faqs-guide/);
  assert.match(robots, /Sitemap: https:\/\/www\.citrusdemolitionandlandclearing\.com\/post-sitemap\.xml/);
  assert.match(robots, /Sitemap: https:\/\/www\.citrusdemolitionandlandclearing\.com\/page-sitemap\.xml/);

  const sitemapUrls = [...sitemap.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.ok(sitemapUrls.length > 0);
  assert.ok(sitemapUrls.every((url) => new URL(url).pathname === "/" || new URL(url).pathname.endsWith("/")));
});

test("generates complete structured data for every blog post", async () => {
  const postSitemap = await readFile(path.join(projectRoot, "public", "post-sitemap.xml"), "utf8");
  const postUrls = [...postSitemap.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(postUrls.length, 35);

  for (const url of postUrls) {
    const slug = new URL(url).pathname.split("/").filter(Boolean).join("/");
    const html = await readFile(path.join(outputDirectory, `${slug}.html`), "utf8");
    const jsonLdBlocks = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
    assert.equal(jsonLdBlocks.length, 1, slug);
    const schema = JSON.parse(jsonLdBlocks[0][1]);
    const graph = schema["@graph"];
    const types = graph.flatMap((item) => Array.isArray(item["@type"]) ? item["@type"] : [item["@type"]]);
    assert.ok(types.includes("LocalBusiness"), slug);
    assert.ok(types.includes("GeneralContractor"), slug);
    assert.ok(types.includes("WebSite"), slug);
    assert.ok(types.includes("BreadcrumbList"), slug);
    assert.ok(types.includes("BlogPosting"), slug);
    assert.ok(types.includes("FAQPage"), slug);

    const article = graph.find((item) => item["@type"] === "BlogPosting");
    assert.ok(article.headline, slug);
    assert.match(article.url, /^https:\/\/www\.citrusdemolitionandlandclearing\.com\/.+\/$/, slug);
    assert.match(article.image[0], /^https:\/\//, slug);
    assert.equal(article.author["@id"], "https://www.citrusdemolitionandlandclearing.com/#organization", slug);
    assert.match(article.datePublished, /^\d{4}-\d{2}-\d{2}$/, slug);
    assert.match(article.dateModified, /^\d{4}-\d{2}-\d{2}$/, slug);
    assert.match(html, /<meta property="og:type" content="article">/, slug);

    const breadcrumb = graph.find((item) => item["@type"] === "BreadcrumbList");
    assert.equal(breadcrumb.itemListElement.length, 3, slug);
    assert.equal(breadcrumb.itemListElement[1].name, "Blog", slug);
    assert.equal(breadcrumb.itemListElement[2].item, url, slug);

    const faq = graph.find((item) => item["@type"] === "FAQPage");
    assert.ok(faq.mainEntity.length > 0, slug);
    assert.ok(faq.mainEntity.every((item) => item.name && item.acceptedAnswer?.text), slug);
  }
});

test("describes the blog index as a collection", async () => {
  const html = await readFile(path.join(outputDirectory, "blog.html"), "utf8");
  const json = html.match(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i)?.[1];
  assert.ok(json);
  const schema = JSON.parse(json);
  const types = schema["@graph"].flatMap((item) => Array.isArray(item["@type"]) ? item["@type"] : [item["@type"]]);
  assert.ok(types.includes("CollectionPage"));
  assert.ok(types.includes("BreadcrumbList"));
  assert.ok(!types.includes("BlogPosting"));
  assert.match(html, /<meta property="og:type" content="website">/);
});

test("uses trailing slashes in canonical URLs and internal navigation", async () => {
  const files = (await readdir(outputDirectory)).filter((file) => file.endsWith(".html"));
  const publicPaths = new Set(
    files.map((filename) => filename === "index.html" ? "/" : `/${filename.replace(/\.html$/, "")}`),
  );

  for (const filename of files) {
    const html = await readFile(path.join(outputDirectory, filename), "utf8");
    const canonical = html.match(/<link rel="canonical" href="([^"]+)">/i)?.[1];
    assert.ok(canonical, filename);
    const canonicalPath = new URL(canonical).pathname;
    assert.ok(canonicalPath === "/" || canonicalPath.endsWith("/"), `${filename}: ${canonical}`);

    for (const match of html.matchAll(/href=["'](\/[^"'#?]*)/gi)) {
      const hrefPath = match[1];
      if (publicPaths.has(hrefPath.replace(/\/$/, ""))) {
        assert.ok(hrefPath === "/" || hrefPath.endsWith("/"), `${filename}: ${hrefPath}`);
      }
    }
  }
});

test("installs exactly one Google tag immediately after head on every page", async () => {
  const files = (await readdir(outputDirectory)).filter((file) => file.endsWith(".html"));
  for (const filename of files) {
    const html = await readFile(path.join(outputDirectory, filename), "utf8");
    assert.match(html, /<head\b[^>]*>\s*<!-- Google tag \(gtag\.js\) -->\s*<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-4WQ5Z1CLMZ"><\/script>/i, filename);
    assert.equal((html.match(/googletagmanager\.com\/gtag\/js\?id=G-4WQ5Z1CLMZ/g) || []).length, 1, filename);
    assert.equal((html.match(/gtag\('config', 'G-4WQ5Z1CLMZ'\)/g) || []).length, 1, filename);
  }
});
