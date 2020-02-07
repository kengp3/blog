const path = require('path');
module.exports = {
  title: 'Ken.logs',
  description: '隨便記錄點什麼。 #java #javascript #python',
  base: '/blog/',
  repo: 'https://github.com/kengp3/blog',
  head: [['link', { rel: 'shortcut icon', href: '/favicon.ico', type: 'image/x-icon' }]],
  theme: '@vuepress/theme-blog',
  themeConfig: {
    /**
     * Ref: https://vuepress-theme-blog.ulivz.com/#modifyblogpluginoptions
     */
    // modifyBlogPluginOptions(blogPluginOptions) {
    //   return blogPluginOptions;
    // },
    nav: [
      {
        text: 'Blog',
        link: '/',
      },
      {
        text: 'Tags',
        link: '/tag/',
      },
      {
        text: 'Github',
        link: 'https://github.com/kengp3/blog/',
      },
      {
        text: 'About',
        link: '/about/',
      },
    ],
    footer: {
      contact: [
        {
          type: 'github',
          link: 'https://github.com/kengp3',
        },
        {
          type: 'mail',
          link: 'mailto:sibawite@gmail.com',
        },
      ],
      copyright: [
        {
          text: 'KenShen © 2020',
          link: '/',
        },
        {
          text: '本部落格依照創用CC「姓名標示-非商業性-禁止改作 3.0 台灣」授權',
          link: 'https://creativecommons.org/licenses/by-nc-nd/3.0/tw/',
        },
      ],
    },
    directories: [
      {
        id: 'post',
        dirname: '_posts',
        path: '/',
      },
    ],
    comment: {
      service: 'vssue',
      owner: 'kengp3',
      repo: 'blog',
      clientId: 'c5f1d273b26d87f90f7c',
      clientSecret: process.env['VSSUE_CLIENT_SECRET'],
    },
    sitemap: {
      hostname: 'https://kengp3.github.io/blog/',
    },
    smoothScroll: true,
  },
  plugins: [
    [
      '@vuepress/google-analytics',
      {
        ga: process.env['GA_ID'],
      },
    ],
    'vuepress-plugin-nprogress',
    'reading-progress',
    [
      'feed',
      {
        canonical_base: 'https://kengp3.github.io/blog/',
        feed_options: {
          image: 'https://kengp3.github.io/blog/favicon-32x32.png',
          favicon: 'https://kengp3.github.io/blog/favicon.ico',
        },
      },
    ],
  ],
  configureWebpack: {
    resolve: {
      alias: {
        '@alias': path.resolve(__dirname, '../assets'),
      },
    },
  },
  markdown: {
    lineNumbers: true,
  },
  extendMarkdown: (md) => {
    md.set({ breaks: true, html: true, linkify: true });
    md.use(require('markdown-it-task-lists'));
  },
};
