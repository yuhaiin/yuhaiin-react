import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const resourceRoot = path.join(root, 'src/i18n/resources');
const baseLanguage = 'en';
const targetLanguages = ['ja', 'ko'];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function flatten(value, prefix = '') {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, child]) => flatten(child, prefix ? `${prefix}.${key}` : key));
  }

  return [{ key: prefix, value }];
}

function compareNamespace(namespace) {
  const basePath = path.join(resourceRoot, baseLanguage, namespace);
  const baseEntries = flatten(readJson(basePath));
  const baseKeys = new Set(baseEntries.map((entry) => entry.key));
  const errors = [];

  for (const entry of baseEntries) {
    if (typeof entry.value === 'string' && entry.value.length === 0) {
      errors.push(`${baseLanguage}/${namespace}: empty value at ${entry.key}`);
    }
  }

  for (const language of targetLanguages) {
    const file = path.join(resourceRoot, language, namespace);
    if (!fs.existsSync(file)) {
      errors.push(`${language}/${namespace}: missing file`);
      continue;
    }

    const entries = flatten(readJson(file));
    const keys = new Set(entries.map((entry) => entry.key));

    for (const key of baseKeys) {
      if (!keys.has(key)) errors.push(`${language}/${namespace}: missing key ${key}`);
    }

    for (const entry of entries) {
      if (!baseKeys.has(entry.key)) errors.push(`${language}/${namespace}: extra key ${entry.key}`);
      if (typeof entry.value === 'string' && entry.value.length === 0) {
        errors.push(`${language}/${namespace}: empty value at ${entry.key}`);
      }
    }
  }

  return errors;
}

const namespaces = fs.readdirSync(path.join(resourceRoot, baseLanguage))
  .filter((file) => file.endsWith('.json'))
  .sort();

const errors = namespaces.flatMap(compareNamespace);

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`i18n resources OK (${namespaces.length} namespaces)`);
