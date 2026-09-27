import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, globSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parse, walkSync } from 'ultrahtml';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { atomFeed } from '../src/lib/feed.mjs';

const origin = 'https://kengp3.github.io';
const home = `${origin}/blog/`;
const legacyPosts = [
  '/2020/02/05/start-blog/',
  '/2020/02/07/build-blog-with-vuepress/',
  '/2020/02/09/vuepress-comment-vssue/',
  '/2020/02/13/css-box-sizing/',
];
const tags = ['css', 'diary', 'javascript', 'programming', 'vssue', 'vuepress'];
const legacyRoutes = [
  '/',
  '/about/',
  '/tag/',
  ...legacyPosts,
  ...tags.map((tag) => `/tag/${tag}/`),
];
const read = (path) => readFileSync(`dist/${path}`, 'utf8');
const elements = (html) => {
  const nodes = [];
  walkSync(parse(html), (node) => {
    if (node.type === 1) nodes.push(node);
  });
  return nodes;
};
const pageFile = (path) =>
  `dist/${path.slice('/blog/'.length)}${path.endsWith('/') ? 'index.html' : ''}`;
const parser = new XMLParser({ ignoreAttributes: false });
const xml = (path) => {
  const body = read(path);
  assert.equal(XMLValidator.validate(body), true, `${path} must be valid XML`);
  return parser.parse(body);
};

test('historical URLs, local resources, anchors, SEO and content survive the static build', () => {
  for (const route of legacyRoutes) assert.ok(existsSync(pageFile(`/blog${route}`)), route);
  const files = globSync('dist/**/*.html');
  assert.ok(files.length >= 13);
  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    const nodes = elements(html);
    const pathname = '/blog/' + file.slice(5).replace(/index\.html$/, '');
    assert.equal(nodes.find((node) => node.name === 'html')?.attributes.lang, 'zh-Hant');
    assert.equal(nodes.filter((node) => node.name === 'h1').length, 1, `${file}: one h1`);
    assert.equal(
      nodes.find((node) => node.name === 'link' && node.attributes.rel === 'canonical')?.attributes
        .href,
      origin + pathname,
    );
    const ids = nodes.map((node) => node.attributes.id).filter(Boolean);
    assert.equal(new Set(ids).size, ids.length, `${file}: unique IDs`);
    for (const node of nodes) {
      for (const attr of ['src', 'href']) {
        const value = node.attributes[attr];
        if (!value) continue;
        const url = new URL(value, origin + pathname);
        if (url.origin !== origin) continue;
        assert.ok(url.pathname.startsWith('/blog/'), `${file}: base missing in ${value}`);
        assert.ok(!url.pathname.includes('/blog/blog/'));
        assert.ok(!url.pathname.endsWith('.md'));
        const target = pageFile(url.pathname);
        assert.ok(existsSync(target), `${file}: missing ${value}`);
        if (url.hash) {
          const targetIds = elements(readFileSync(target, 'utf8')).map(
            (node) => node.attributes.id,
          );
          assert.ok(
            targetIds.includes(decodeURIComponent(url.hash.slice(1))),
            `${file}: missing anchor ${value}`,
          );
        }
      }
    }
    assert.ok(!html.includes('~@alias/'), `${file}: webpack alias survived`);
    assert.ok(
      !nodes.some(
        (node) =>
          node.name === 'script' &&
          /google-analytics|googletagmanager|vssue/i.test(node.attributes.src ?? ''),
      ),
    );
  }
  const build = read('2020/02/07/build-blog-with-vuepress/index.html');
  const vssue = read('2020/02/09/vuepress-comment-vssue/index.html');
  for (const id of [
    '申請-github-token',
    '_1-在根目錄上建立-travis-yml-內容如下',
    '_2-設定-travis-ci',
  ])
    assert.ok(elements(build).some((node) => node.attributes.id === id));
  assert.equal(
    elements(build + vssue).filter((node) => node.name === 'img' && node.attributes.src).length,
    8,
  );
  assert.ok(vssue.includes('https://github.com/kengp3/blog/issues/4'));
  assert.ok(
    read('2020/02/05/start-blog/index.html').includes('https://github.com/kengp3/blog/issues/3'),
  );
  const penPage = elements(read('2020/02/13/css-box-sizing/index.html'));
  assert.ok(penPage.some((node) => node.attributes?.['data-slug-hash'] === 'OJVMPNM'));
  assert.ok(penPage.some((node) => node.name === 'script' &&
    node.attributes.src === 'https://static.codepen.io/assets/embed/ei.js'));
  assert.equal(
    createHash('sha256').update(readFileSync('dist/coindesk.json')).digest('hex'),
    '72df8073667580be5ad6e19c6d0c752a0dfa2fe0f9a63ed1a58231ea8646c0db',
  );
  assert.ok(!existsSync('dist/assets/test.html'));
});

test('RSS, Atom, JSON and sitemap retain IDs and valid formats', () => {
  const json = JSON.parse(read('feed.json'));
  const rss = xml('rss.xml').rss.channel;
  const atom = xml('feed.atom').feed;
  assert.equal(json.items.length, globSync('blog/_posts/**/*.md').length);
  const ids = json.items.map((item) => item.id).sort();
  assert.deepEqual(rss.item.map((item) => item.guid['#text']).sort(), ids);
  assert.deepEqual(atom.entry.map((item) => item.id).sort(), ids);
  for (const path of legacyPosts) assert.ok(ids.includes(origin + '/blog' + path));
  assert.equal(json.feed_url, home + 'feed.json');
  assert.equal(rss['atom:link']['@_href'], home + 'rss.xml');
  assert.equal(atom.link.find((link) => link['@_rel'] === 'self')['@_href'], home + 'feed.atom');
  assert.ok(
    json.items.every((item) => item.content_text && item.date_published.endsWith('T00:00:00Z')),
  );
  assert.deepEqual(
    json.items.map((item) => item.date_published),
    json.items
      .map((item) => item.date_published)
      .sort()
      .reverse(),
  );
  const sitemap = xml('sitemap.xml');
  const chunks = [sitemap.sitemapindex.sitemap].flat().map((item) => item.loc);
  const urls = chunks.flatMap((url) =>
    [xml(url.replace(home, '')).urlset.url].flat().map((item) => item.loc),
  );
  for (const route of legacyRoutes) assert.ok(urls.includes(origin + '/blog' + route));
  assert.equal(new Set(urls).size, urls.length);
  for (const url of urls) assert.ok(existsSync(pageFile(new URL(url).pathname)));
  const special = `中文 & <test> "quote" 'apostrophe'`;
  const escaped = atomFeed(
    [
      {
        title: special,
        description: special,
        url: home + '?a=1&b=2',
        date: '2020-02-29',
        tags: [special],
      },
    ],
    home,
  );
  assert.equal(XMLValidator.validate(escaped), true);
  const entry = parser.parse(escaped).feed.entry;
  assert.equal(entry.title, special);
  assert.equal(entry.summary, special);
  assert.equal(entry.category['@_term'], special);
});

test('one lockfile and no legacy VuePress runtime dependency chain', () => {
  assert.ok(!existsSync('yarn.lock'));
  const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
  for (const path of Object.keys(lock.packages))
    assert.ok(!/node_modules\/(vue|vuepress|webpack|@vssue)(\/|$)/.test(path), path);
  assert.equal(JSON.parse(readFileSync('package.json', 'utf8')).devDependencies.astro, '7.3.5');
});
