#!/usr/bin/env node

/**
 * Generates a manifest.json from the configuration in src/config.ts
 */

"use strict";

const fs = require("fs");
const path = require("path");

const configPath = path.resolve(__dirname, "..", "src", "config.ts");
const manifestPath = path.resolve(
  __dirname,
  "..",
  "build",
  "manifest.json"
);

console.log("Loading config from", configPath);

// Because TypeScript uses ES6 modules, we can't exactly load the contents of the config file
// So instead, we read the source and evaluate it.
const config = Function(
  `"use strict"; return ${fs
    .readFileSync(configPath, "utf-8")
    .replace("export default", "")}`
)();

console.log("Loaded config:");
console.dir(config);

let manifest = {};

if (config.manifest.fullName) {
  manifest.name = config.manifest.fullName;
  manifest.short_name = config.title;
} else {
  manifest.name = config.title;
}
manifest.description = config.description;
manifest.icons = Object.values(config.icons);
manifest.start_url = config.manifest.start_url;
manifest.display = config.manifest.display;
manifest.theme_color = config.themeColor;
manifest.background_color = config.manifest.backgroundColor;

console.log("Generated manifest:");
console.dir(manifest);

fs.writeFileSync(manifestPath, JSON.stringify(manifest));

console.log("Wrote manifest to", manifestPath);
