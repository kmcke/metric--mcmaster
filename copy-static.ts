// copy-static.js
// Copies manifest.json and all icons from src/assets to dist for Chrome extension packaging

import { mkdirSync, copyFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");
const srcDir = join(process.cwd(), "src");
const assetsDir = join(srcDir, "assets");

if (!existsSync(distDir)) mkdirSync(distDir);
if (!existsSync(join(distDir, "assets"))) mkdirSync(join(distDir, "assets"));

// Copy manifest.json
copyFileSync(join(srcDir, "manifest.json"), join(distDir, "manifest.json"));

// Copy all icons from src/assets to dist/assets
for (const file of readdirSync(assetsDir)) {
  copyFileSync(join(assetsDir, file), join(distDir, "assets", file));
}
