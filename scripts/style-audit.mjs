import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourceRoot = path.join(root, "src");
const extensions = new Set([".ts", ".tsx", ".js", ".jsx", ".css"]);

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(fullPath));
      continue;
    }

    if (extensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function countMatches(text, regex) {
  return text.match(regex)?.length ?? 0;
}

const files = await collectFiles(sourceRoot);
const totals = {
  files: files.length,
  inlineStyle: 0,
  arbitraryClass: 0,
  importantUtility: 0,
  hardcodedColor: 0,
  themeColorDefinition: 0,
};

for (const file of files) {
  const text = await readFile(file, "utf8");
  const isThemeSource = path.relative(root, file) === path.join("src", "global.css");
  const colorCount = countMatches(text, /#[0-9a-f]{3,8}\b|rgba?\(/gi);

  totals.inlineStyle += countMatches(text, /\bstyle=\{\{/g);
  totals.arbitraryClass += countMatches(text, /(?:className|class)\s*=\{?["'`][^"'`]*\[[^\]]+\]/g);
  totals.importantUtility += countMatches(text, /["'`\s]![a-z0-9_:/.[\]-]+/gi);
  if (isThemeSource) {
    totals.themeColorDefinition += colorCount;
  } else {
    totals.hardcodedColor += colorCount;
  }
}

console.table(totals);
