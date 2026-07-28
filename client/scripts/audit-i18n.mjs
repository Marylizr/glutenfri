import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ADMIN_COPY } from '../src/admin/adminCopy.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(root, 'src');
const locales = ['pt-PT', 'en', 'es'];
const failures = [];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function extractLocaleBlock(source, locale) {
  const expression = locale === 'pt-PT'
    ? /^\s*'pt-PT':\s*\{/m
    : new RegExp(`^\\s*${locale}:\\s*\\{`, 'm');
  const match = expression.exec(source);
  if (!match) throw new Error(`No se encontró el bloque ${locale}`);
  const start = source.indexOf('{', match.index);
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === "'" || character === '"' || character === '`') {
      quote = character;
      continue;
    }
    if (character === '{') depth += 1;
    if (character === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start + 1, index);
    }
  }
  throw new Error(`El bloque ${locale} no está cerrado`);
}

function flatMessageEntries(block) {
  return Object.fromEntries(
    [...block.matchAll(/^\s{4}([A-Za-z][A-Za-z0-9_]*):\s*(['"`])([\s\S]*?)\2,\s*$/gm)]
      .map((match) => [match[1], match[3]])
  );
}

function placeholders(value) {
  return [...String(value).matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(',');
}

function flatten(value, prefix = '', output = {}) {
  for (const [key, child] of Object.entries(value)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) flatten(child, next, output);
    else output[next] = child;
  }
  return output;
}

function compareCatalog(name, catalog) {
  const flattened = Object.fromEntries(locales.map((locale) => [locale, flatten(catalog[locale])]));
  const baseKeys = Object.keys(flattened['pt-PT']).sort();
  for (const locale of locales) {
    const keys = Object.keys(flattened[locale]).sort();
    const missing = baseKeys.filter((key) => !keys.includes(key));
    const extra = keys.filter((key) => !baseKeys.includes(key));
    if (missing.length || extra.length) failures.push(`${name}/${locale}: faltan [${missing}] y sobran [${extra}]`);
    for (const key of keys) {
      const value = flattened[locale][key];
      if (value === '' || value === null || value === undefined) failures.push(`${name}/${locale}/${key}: valor vacío`);
      const expected = placeholders(flattened['pt-PT'][key]);
      const actual = placeholders(value);
      if (expected !== actual) failures.push(`${name}/${locale}/${key}: placeholders ${actual || 'ninguno'}; esperados ${expected || 'ninguno'}`);
    }
  }
  return Object.fromEntries(locales.map((locale) => [locale, Object.keys(flattened[locale]).length]));
}

const i18nSource = fs.readFileSync(path.join(sourceRoot, 'i18n/index.jsx'), 'utf8');
const messages = Object.fromEntries(locales.map((locale) => [locale, flatMessageEntries(extractLocaleBlock(i18nSource, locale))]));
const messageCounts = compareCatalog('messages', messages);
const adminCounts = compareCatalog('admin', ADMIN_COPY);

const sourceFiles = walk(sourceRoot).filter((file) => /\.(?:js|jsx)$/.test(file));
const applicationSource = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const localizedModules = [];
for (const file of sourceFiles) {
  if (file.endsWith('adminCopy.js')) continue;
  const source = fs.readFileSync(file, 'utf8');
  if (!locales.every((locale) => source.includes(locale === 'pt-PT' ? "'pt-PT': {" : `${locale}: {`))) continue;
  const structures = Object.fromEntries(locales.map((locale) => {
    const block = extractLocaleBlock(source, locale);
    const keys = [...block.matchAll(/(?:^|[,{]\s*)(?:'([^']+)'|([A-Za-z][A-Za-z0-9_]*))\s*:/gm)]
      .map((match) => match[1] || match[2])
      .sort();
    return [locale, { keys, placeholders: [...block.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort() }];
  }));
  for (const locale of locales.slice(1)) {
    if (structures[locale].keys.join('|') !== structures['pt-PT'].keys.join('|')) {
      failures.push(`${path.relative(root, file)}/${locale}: estructura incompatible con PT-PT`);
    }
    if (structures[locale].placeholders.join('|') !== structures['pt-PT'].placeholders.join('|')) {
      failures.push(`${path.relative(root, file)}/${locale}: interpolaciones incompatibles con PT-PT`);
    }
  }
  localizedModules.push(path.relative(root, file));
}
const directKeys = [...applicationSource.matchAll(/\bt\(\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
const pluralKeys = [...applicationSource.matchAll(/\btp\(\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
for (const key of new Set(directKeys)) {
  if (!messages['pt-PT'][key]) failures.push(`uso de t('${key}') sin clave en el catálogo central`);
}
for (const key of new Set(pluralKeys)) {
  for (const suffix of ['one', 'other']) {
    if (!messages['pt-PT'][`${key}_${suffix}`]) failures.push(`uso de tp('${key}') sin clave ${key}_${suffix}`);
  }
}

const adminFiles = sourceFiles.filter((file) => file.includes(`${path.sep}admin${path.sep}`) && !file.endsWith('adminCopy.js'));
const allowedStatic = new Set(['NORTE', 'ADMIN', 'Admin', 'API', 'MongoDB Atlas', 'Google Places', '⌘ K']);
const hardcoded = [];
for (const file of adminFiles) {
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(/>\s*([^<>{}\n]*[A-Za-zÁÉÍÓÚÀÂÃÇÑ][^<>{}\n]*)\s*</g)) {
    const text = match[1].trim();
    if (text && !text.includes('?') && !allowedStatic.has(text)) {
      hardcoded.push(`${path.relative(root, file)}: ${text}`);
    }
  }
}
if (hardcoded.length) failures.push(`literales visibles en admin:\n${hardcoded.join('\n')}`);

const report = {
  locales,
  mainCatalogKeys: messageCounts,
  adminCatalogLeaves: adminCounts,
  referencedMainKeys: new Set(directKeys).size,
  referencedPluralKeys: new Set(pluralKeys).size,
  localizedModulesChecked: localizedModules.length,
  hardcodedAdminCandidates: hardcoded.length,
  failures,
};

console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
