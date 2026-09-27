export function xml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char],
  );
}
export function atomFeed(items, home) {
  const updated =
    items
      .map((item) => item.date)
      .sort()
      .at(-1) ?? '1970-01-01';
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="zh-Hant">
<title>Ken.logs</title><id>${xml(home)}</id><link href="${xml(home)}"/>
<link rel="self" href="${xml(home + 'feed.atom')}"/><updated>${updated}T00:00:00Z</updated>
<author><name>Ken</name></author>
${items.map((item) => `<entry><title>${xml(item.title)}</title><id>${xml(item.url)}</id><link href="${xml(item.url)}"/><published>${item.date}T00:00:00Z</published><updated>${item.date}T00:00:00Z</updated><summary>${xml(item.description)}</summary>${item.tags.map((tag) => `<category term="${xml(tag)}"/>`).join('')}</entry>`).join('\n')}
</feed>`;
}
