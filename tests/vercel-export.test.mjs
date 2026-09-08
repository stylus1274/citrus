import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const projectRoot = process.cwd();
const outputDirectory = path.join(projectRoot, "public", "_site");

test("exports every site page as standalone, crawlable HTML", async () => {
  const files = (await readdir(outputDirectory)).filter((file) => file.endsWith(".html"));
  assert.equal(files.length, 29);
  for (const filename of files) {
    const html = await readFile(path.join(outputDirectory, filename), "utf8");
    assert.match(html, /<!doctype html>/i, filename);
    assert.match(html, /<h1\b/i, filename);
    assert.match(html, /<link rel="canonical"/i, filename);
    assert.doesNotMatch(html, /<iframe\b/i, filename);
    assert.doesNotMatch(html, /data:image\/(?:gif|jpeg|png|webp);base64/i, filename);
  }
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
  assert.match(robots, /Sitemap: https:\/\/www\.citrusdemolitionandlandclearing\.com\/sitemap\.xml/);
});
