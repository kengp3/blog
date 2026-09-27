import rss from '@astrojs/rss';
import { posts, absolute, comments } from '../lib/posts';
import { atomFeed, xml } from '../lib/feed.mjs';
export function getStaticPaths() {
  return ['rss.xml', 'feed.atom', 'feed.json'].map((feed) => ({ params: { feed } }));
}
export async function GET({ params }) {
  const items = (await posts()).map((post) => ({
    ...post.data,
    url: absolute(post.data.permalink),
  }));
  const home = absolute();
  if (params.feed === 'rss.xml') {
    return rss({
      title: 'Ken.logs',
      description: '隨便記錄點什麼。 #java #javascript #python',
      site: home,
      xmlns: { atom: 'http://www.w3.org/2005/Atom' },
      customData: `<language>zh-TW</language><atom:link href="${xml(home + 'rss.xml')}" rel="self" type="application/rss+xml"/>`,
      items: items.map((item) => ({
        title: item.title,
        description: item.description,
        link: item.url,
        pubDate: new Date(`${item.date}T00:00:00Z`),
        categories: item.tags,
        commentsUrl: comments(item),
      })),
    });
  }
  if (params.feed === 'feed.atom')
    return new Response(atomFeed(items, home), {
      headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
    });
  return new Response(
    JSON.stringify(
      {
        version: 'https://jsonfeed.org/version/1.1',
        title: 'Ken.logs',
        home_page_url: home,
        feed_url: home + 'feed.json',
        language: 'zh-Hant',
        description: '隨便記錄點什麼。 #java #javascript #python',
        icon: absolute('/favicon-32x32.png'),
        items: items.map((item) => ({
          id: item.url,
          url: item.url,
          title: item.title,
          summary: item.description,
          content_text: item.description,
          date_published: `${item.date}T00:00:00Z`,
          date_modified: `${item.date}T00:00:00Z`,
          tags: item.tags,
          authors: [{ name: item.author }],
        })),
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/feed+json; charset=utf-8' } },
  );
}
