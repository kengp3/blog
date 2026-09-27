import { getCollection } from 'astro:content';
export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const site = 'https://kengp3.github.io';
export const href = (path = '/') => `${base}${path}`;
export const absolute = (path = '/') => new URL(href(path), site).href;
export async function posts() {
  const entries = await getCollection('posts');
  const paths = entries.map((entry) => entry.data.permalink);
  if (new Set(paths).size !== paths.length) throw new Error('Duplicate article permalink');
  return entries.sort((a, b) => b.data.date.localeCompare(a.data.date));
}
export function comments(data: { title: string; issue?: number }) {
  return data.issue
    ? `https://github.com/kengp3/blog/issues/${data.issue}`
    : `https://github.com/kengp3/blog/issues/new?title=${encodeURIComponent(`[留言] ${data.title}`)}`;
}
