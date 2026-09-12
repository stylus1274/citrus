import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const projectRoot = process.cwd();
const outputDirectory = path.join(projectRoot, "public", "_site");

test("exports every site page as standalone, crawlable HTML", async () => {
  const files = (await readdir(outputDirectory)).filter((file) => file.endsWith(".html"));
  assert.equal(files.length, 49);
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

test("extracts embedded photographs into cacheable static files", async () => {
  const assets = await readdir(path.join(projectRoot, "public", "_site-assets"));
  assert.ok(assets.length > 10);
  assert.ok(assets.every((asset) => /\.(?:gif|jpg|png|webp)$/.test(asset)));
});

test("generates search-engine discovery files", async () => {
  const sitemap = await readFile(path.join(projectRoot, "public", "sitemap.xml"), "utf8");
  const robots = await readFile(path.join(projectRoot, "public", "robots.txt"), "utf8");
  assert.match(sitemap, /<urlset\b/);
  assert.match(sitemap, /https:\/\/www\.citrusdemolitionandlandclearing\.com\/projects/);
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
  assert.match(robots, /Sitemap: https:\/\/www\.citrusdemolitionandlandclearing\.com\/sitemap\.xml/);
});
