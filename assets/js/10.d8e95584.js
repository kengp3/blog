(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{178:function(t,n,a){},316:function(t,n,a){"use strict";var o=a(178);a.n(o).a},340:function(t,n,a){"use strict";a.r(n);a(64),a(1);var o=a(39),s=a.n(o),e=a(4),i=a(210),r={components:{NavigationIcon:e.l,ClockIcon:e.a,TagIcon:e.o},data:function(){return{paginationComponent:null}},computed:{pages:function(){return this.$pagination.pages}},created:function(){this.paginationComponent=this.getPaginationComponent()},methods:{getPaginationComponent:function(){return i.b},resolvePostDate:function(t){return s()(t).format(this.$themeConfig.dateFormat||"ddd MMM DD YYYY")},resolvePostTags:function(t){return!t||Array.isArray(t)?t:[t]}}},u=(a(316),a(3)),c=Object(u.a)(r,(function(){var t=this,n=t.$createElement,a=t._self._c||n;return a("div",{attrs:{id:"base-list-layout"}},[a("div",{staticClass:"ui-posts"},t._l(t.pages,(function(n){return a("div",{key:n.key,staticClass:"ui-post"},[a("div",{staticClass:"ui-post-title"},[a("NavLink",{attrs:{link:n.path}},[t._v(t._s(n.title))])],1),t._v(" "),a("p",{staticClass:"ui-post-summary"},[t._v("\n        "+t._s(n.frontmatter.summary||n.summary)+"\n        ")]),t._v(" "),n.frontmatter.author?a("div",{staticClass:"ui-post-meta ui-post-author"},[a("NavigationIcon"),t._v(" "),a("span",[t._v(t._s(n.frontmatter.author))]),t._v(" "),n.frontmatter.location?a("span",[t._v("\n            in "+t._s(n.frontmatter.location)+"\n        ")]):t._e()],1):t._e(),t._v(" "),n.frontmatter.date?a("div",{staticClass:"ui-post-meta ui-post-date"},[a("ClockIcon"),t._v(" "),a("span",[t._v(t._s(t.resolvePostDate(n.frontmatter.date)))])],1):t._e(),t._v(" "),n.frontmatter.tags?a("div",{staticClass:"ui-post-meta ui-post-tag"},[a("TagIcon"),t._v(" "),t._l(t.resolvePostTags(n.frontmatter.tags),(function(n){return a("router-link",{key:n,attrs:{to:"/tag/"+n}},[t._v("\n          "+t._s(n)+"\n        ")])}))],2):t._e()])})),0),t._v(" "),t.$pagination.length>1&&t.paginationComponent?a(t.paginationComponent,{tag:"component"}):t._e()],1)}),[],!1,null,null,null);n.default=c.exports}}]);