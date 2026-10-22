import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const OUTPUT_DIRECTORY = fileURLToPath(new URL('../dist/', import.meta.url));
const REQUIRED_PAGES = [
  'index.html',
  'projects/index.html',
  'blog/index.html',
  'about/index.html',
  '404.html',
  'projects/mcards/index.html',
  'projects/horizon/index.html',
  'projects/night-hotel/index.html',
  'projects/unreal-tools/index.html',
  'projects/agent-infrastructure/index.html',
  'blog/simulation-boundaries/index.html',
  'blog/dual-window-coordinates/index.html',
  'blog/procedural-validation/index.html',
];
const PROJECT_EXPECTATIONS = [
  { slug: 'mcards', status: 'prototype', terms: ['asmdef', 'ProcessGraph', 'WorldTime'] },
  { slug: 'horizon', status: 'prototype', terms: ['坐标', '窗口', '实体'] },
  { slug: 'night-hotel', status: 'development', terms: ['WFC', '全局', '验证'] },
  { slug: 'unreal-tools', status: 'research', terms: ['公开', '属性', 'Slate'] },
  { slug: 'agent-infrastructure', status: 'planned', terms: ['待完善', '计划', '验证'] },
];
const MINIMUM_PROJECT_PARAGRAPHS = 6;
const MINIMUM_PROJECT_CHARACTERS = 300;
const MINIMUM_CASE_STUDY_SECTIONS = 8;
const ENTITY_VALUES = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
const SOCIAL_IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);
const WEBP_CONTAINER_SIGNATURE = Buffer.from('RIFF');
const WEBP_FORMAT_SIGNATURE = Buffer.from('WEBP');
const WEBP_FORMAT_OFFSET = 8;

function listFiles(directory) {
  assert.ok(existsSync(directory), `Build output missing: ${directory}. Run npm run build first.`);
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function decodeEntities(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (_, entity) => {
    const normalized = entity.toLowerCase();
    if (normalized.startsWith('#x')) return String.fromCodePoint(parseInt(normalized.slice(2), 16));
    if (normalized.startsWith('#')) return String.fromCodePoint(parseInt(normalized.slice(1), 10));
    return ENTITY_VALUES[normalized];
  });
}

function parseAttributes(source) {
  const attributes = new Map();
  const pattern = /([^\s=/'"<>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of source.matchAll(pattern)) {
    attributes.set(match[1].toLowerCase(), decodeEntities(match[2] ?? match[3] ?? match[4] ?? ''));
  }
  return attributes;
}

function parseElements(html) {
  const markup = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1</script>')
    .replace(/(<style\b[^>]*>)[\s\S]*?<\/style>/gi, '$1</style>');
  const tags = /<([a-z][\w:-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi;
  return [...markup.matchAll(tags)].map((match) => ({
    tag: match[1].toLowerCase(),
    attributes: parseAttributes(match[2]),
  }));
}

function readDocument(path) {
  const html = readFileSync(path, 'utf8');
  const elements = parseElements(html);
  const identifiers = elements.map((element) => element.attributes.get('id')).filter(Boolean);
  return { path, html, elements, identifiers: new Set(identifiers), allIdentifiers: identifiers };
}

function plainText(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function getCanonical(document) {
  const canonical = document.elements.find(
    (element) => element.tag === 'link' && element.attributes.get('rel') === 'canonical',
  );
  assert.ok(canonical?.attributes.get('href'), `${document.path}: canonical URL missing`);
  return new URL(canonical.attributes.get('href'));
}

function pageUrl(path, origin) {
  const outputPath = relative(OUTPUT_DIRECTORY, path).split(sep).join('/');
  return new URL(outputPath.replace(/index\.html$/, ''), `${origin}/`);
}

function resolveOutput(url) {
  const pathname = decodeURIComponent(url.pathname);
  const target = resolve(OUTPUT_DIRECTORY, `.${pathname}`);
  const relativeTarget = relative(OUTPUT_DIRECTORY, target);
  assert.ok(relativeTarget !== '..' && !relativeTarget.startsWith(`..${sep}`), 'URL escapes build output');
  const candidates = [target, join(target, 'index.html')];
  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
}

function assertInternalReference(value, document, siteOrigin) {
  assert.ok(value.trim() && value !== '#', `${document.path}: empty reference or placeholder link`);
  const url = new URL(value, pageUrl(document.path, siteOrigin));
  assert.notEqual(url.protocol, 'javascript:', `${document.path}: executable URL found`);
  if (url.origin !== siteOrigin) return;
  const target = resolveOutput(url);
  assert.ok(target, `${document.path}: missing internal destination ${value}`);
  if (!url.hash || extname(target) !== '.html') return;
  const anchor = decodeURIComponent(url.hash.slice(1));
  const targetDocument = DOCUMENTS.get(target);
  assert.ok(targetDocument?.identifiers.has(anchor), `${document.path}: missing anchor ${value}`);
}

function assertDocumentMetadata(document) {
  const { elements, html, path } = document;
  const root = elements.find((element) => element.tag === 'html');
  assert.match(
    root?.attributes.get('lang') ?? '',
    /^zh(?:-|$)/,
    `${path}: Chinese document language required`,
  );
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  assert.ok(title && plainText(title), `${path}: page title missing`);
  const description = elements.find(
    (element) => element.tag === 'meta' && element.attributes.get('name') === 'description',
  );
  assert.ok(description?.attributes.get('content')?.trim(), `${path}: description missing`);
}

function assertDocumentLandmarks(document) {
  const { elements, path } = document;
  assert.equal(
    elements.filter((element) => element.tag === 'main').length,
    1,
    `${path}: one main landmark required`,
  );
  assert.ok(
    elements.some((element) => element.tag === 'nav'),
    `${path}: navigation landmark missing`,
  );
  assert.equal(
    document.identifiers.size,
    document.allIdentifiers.length,
    `${path}: duplicate HTML identifiers`,
  );
}

function assertImages(document) {
  for (const image of document.elements.filter((element) => element.tag === 'img')) {
    const { attributes } = image;
    const label = `${document.path}: ${attributes.get('src')}`;
    assert.ok(attributes.has('alt'), `${label}: alt attribute missing`);
    assert.ok(Number(attributes.get('width')) > 0, `${label}: positive image width required`);
    assert.ok(Number(attributes.get('height')) > 0, `${label}: positive image height required`);
  }
}

function getProjectArticle(document, slug) {
  const article = document.html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1];
  assert.ok(article, `${slug}: semantic article missing`);
  return article;
}

function assertProjectContent(expectation) {
  const document = DOCUMENTS.get(join(OUTPUT_DIRECTORY, 'projects', expectation.slug, 'index.html'));
  assert.ok(document, `${expectation.slug}: case study missing`);
  const article = getProjectArticle(document, expectation.slug);
  assertProjectDepth(article, expectation.slug);
  for (const term of expectation.terms)
    assert.ok(plainText(article).includes(term), `${expectation.slug}: missing ${term}`);
  assertProjectStatus(document, expectation);
  assertConceptMediaLabel(document, expectation.slug);
}

function assertProjectDepth(article, slug) {
  const paragraphs = [...article.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((match) => plainText(match[1]));
  assert.ok(paragraphs.length >= MINIMUM_PROJECT_PARAGRAPHS, `${slug}: technical paragraphs missing`);
  assert.ok(paragraphs.join('').length >= MINIMUM_PROJECT_CHARACTERS, `${slug}: case study is too sparse`);
  assert.ok(
    parseElements(article).filter((element) => element.tag === 'h2').length >= MINIMUM_CASE_STUDY_SECTIONS,
  );
}

function assertProjectStatus(document, expectation) {
  const status = document.elements.find((element) =>
    element.attributes.get('class')?.split(/\s+/).includes('project-status'),
  );
  assert.ok(
    status?.attributes.get('class')?.split(/\s+/).includes(expectation.status),
    `${expectation.slug}: inaccurate public status`,
  );
}

function assertConceptMediaLabel(document, slug) {
  const captions = [...document.html.matchAll(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/gi)];
  assert.ok(
    captions.some((match) => /概念|示意/.test(plainText(match[1]))),
    `${slug}: abstract media must be labeled`,
  );
}

function hasRasterSignature(bytes, extension) {
  if (extension === '.png') return bytes.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE);
  if (extension === '.jpg' || extension === '.jpeg')
    return bytes.subarray(0, JPEG_SIGNATURE.length).equals(JPEG_SIGNATURE);
  const container = bytes.subarray(0, WEBP_CONTAINER_SIGNATURE.length);
  const format = bytes.subarray(WEBP_FORMAT_OFFSET, WEBP_FORMAT_OFFSET + WEBP_FORMAT_SIGNATURE.length);
  return container.equals(WEBP_CONTAINER_SIGNATURE) && format.equals(WEBP_FORMAT_SIGNATURE);
}

function assertSocialImage(value, document) {
  assert.ok(value?.trim(), `${document.path}: Open Graph image URL missing`);
  const url = new URL(value);
  assert.equal(url.origin, SITE_ORIGIN, `${document.path}: Open Graph image must be hosted locally`);
  const path = resolveOutput(url);
  assert.ok(path, `${document.path}: Open Graph image missing from build: ${url.href}`);
  const extension = extname(path).toLowerCase();
  assert.ok(SOCIAL_IMAGE_EXTENSIONS.has(extension), `${document.path}: unsupported social image format`);
  assert.ok(hasRasterSignature(readFileSync(path), extension), `${path}: invalid raster image signature`);
}

function sitemapLocations(path) {
  return [...readFileSync(path, 'utf8').matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map(
    (match) => new URL(decodeEntities(match[1].trim())),
  );
}

const OUTPUT_FILES = listFiles(OUTPUT_DIRECTORY);
const DOCUMENTS = new Map(
  OUTPUT_FILES.filter((path) => extname(path) === '.html').map((path) => [path, readDocument(path)]),
);
const HOMEPAGE = DOCUMENTS.get(join(OUTPUT_DIRECTORY, 'index.html'));
assert.ok(HOMEPAGE, 'The build must contain a homepage.');
const SITE_ORIGIN = getCanonical(HOMEPAGE).origin;

test('required public routes, feed and sitemap are emitted', () => {
  for (const path of [...REQUIRED_PAGES, 'rss.xml', 'robots.txt', 'sitemap-index.xml']) {
    assert.ok(existsSync(join(OUTPUT_DIRECTORY, path)), `Required build artifact missing: ${path}`);
  }
  const feed = readFileSync(join(OUTPUT_DIRECTORY, 'rss.xml'), 'utf8');
  assert.match(feed, /<rss\b/);
  assert.ok([...feed.matchAll(/<item>/g)].length >= 3, 'RSS must publish the initial technical articles');
});

test('every HTML page has reading landmarks, metadata and stable image dimensions', () => {
  for (const document of DOCUMENTS.values()) {
    assertDocumentMetadata(document);
    assertDocumentLandmarks(document);
    assertImages(document);
    assert.equal(getCanonical(document).origin, SITE_ORIGIN, `${document.path}: canonical origin differs`);
  }
});

test('Open Graph images resolve locally and use supported raster image formats', () => {
  for (const document of DOCUMENTS.values()) {
    const images = document.elements.filter(
      (element) => element.tag === 'meta' && element.attributes.get('property') === 'og:image',
    );
    assert.ok(images.length > 0, `${document.path}: Open Graph image metadata missing`);
    for (const image of images) assertSocialImage(image.attributes.get('content'), document);
  }
});

test('internal links, assets and section fragments resolve in the static build', () => {
  for (const document of DOCUMENTS.values()) {
    for (const element of document.elements) {
      for (const attribute of ['href', 'src']) {
        const value = element.attributes.get(attribute);
        if (value !== undefined) assertInternalReference(value, document, SITE_ORIGIN);
      }
    }
  }
});

test('case studies contain technical substance and accurately labeled project states', () => {
  for (const expectation of PROJECT_EXPECTATIONS) assertProjectContent(expectation);
});

test('robots policy and all sitemap URLs agree with the built canonical site origin', () => {
  const index = join(OUTPUT_DIRECTORY, 'sitemap-index.xml');
  const children = sitemapLocations(index);
  assert.ok(children.length > 0, 'Sitemap index must reference at least one sitemap');
  for (const location of children) {
    assert.equal(location.origin, SITE_ORIGIN, 'Sitemap index uses a different site origin');
    const path = resolveOutput(location);
    assert.ok(path, `Sitemap child is missing: ${location.href}`);
    for (const page of sitemapLocations(path)) {
      assert.equal(page.origin, SITE_ORIGIN, 'Sitemap page uses a different site origin');
      assert.ok(resolveOutput(page), `Sitemap points to an absent page: ${page.href}`);
    }
  }
  const robots = readFileSync(join(OUTPUT_DIRECTORY, 'robots.txt'), 'utf8');
  if (['localhost', '127.0.0.1'].includes(new URL(SITE_ORIGIN).hostname)) {
    assert.match(robots, /^Disallow: \/$/m, 'Local preview should remain excluded from indexing');
  } else {
    const declared = robots.match(/^Sitemap:\s*(\S+)\s*$/m)?.[1];
    assert.equal(declared, new URL('/sitemap-index.xml', SITE_ORIGIN).href);
    assert.match(robots, /^Allow: \/$/m, 'Production robots policy should allow crawling');
  }
});
