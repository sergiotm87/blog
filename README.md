# Kammin

Sergio Teran's personal blog: SRE, cloud, devops and platform engineering notes,
and the Kajuna side project. Published at <https://sergiotm87.github.io/blog/>.

A [Nextra 4](https://nextra.site) blog (`nextra-theme-blog`) on Next.js 16, with
Tailwind CSS + shadcn/ui, [Pagefind](https://pagefind.app/) for static search and
[Giscus](https://giscus.app/) for comments (GitHub Discussions of this repo).

## Lifecycle

```bash
pnpm install
pnpm dev        # http://localhost:3000/blog/ (drafts switch in the footer)
pnpm build      # static export to out/ + Pagefind index in out/_pagefind
pnpm preview    # serves out/ under http://localhost:3001/blog/
```

Everything is served under the **`/blog` base path** (`next.config.mjs`), so every
URL carries that prefix. Production builds use `output: "export"`; development
does not, because the drafts switch needs cookies.

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the static
site and deploys `out/` to GitHub Pages.

## Structure

```
content/
├── index.mdx                    # home page
└── posts/<slug>.mdx             # one article per file

public/
├── images/                      # post images, referenced as /images/<file>
├── logos/
└── post/<slug>/index.html       # redirects from the old Hugo URLs

src/
├── app/
│   ├── [[...mdxPath]]/page.tsx  # catch-all that renders content/ as MDX
│   ├── posts/page.tsx           # article index
│   ├── tags/[tag]/page.tsx      # one page per tag
│   ├── rss.xml/route.ts         # feed (index.xml serves it too, legacy URL)
│   ├── sitemap.ts · robots.ts
│   └── layout.tsx
├── components/                  # header/footer, Posts, Tags, Giscus, drafts switch
└── lib/get-posts.ts             # page-map reader; owns PostItem
```

## Writing a post

1. Create `content/posts/<slug>.mdx` (kebab-case, English).
2. Frontmatter:

   ```yaml
   ---
   title: Article title
   date: 2026-04-13
   description: Short summary for SEO and listings.
   author: Sergio Teran
   tags: [Go, DevEx]
   ---
   ```

3. **Drafts**: add `display: hidden`. The post is left out of listings, feed,
   sitemap and the static export. In `pnpm dev`, the *Drafts* switch in the
   footer shows them marked as DRAFT.
4. **Comments** are on by default; set `enableComment: false` to turn them off.
5. Use H2/H3 inside the post (the title is the H1), code fences with a language
   hint, and images in `public/images/`.

## Credits

Based on the Nextra blog starter by Phuc Bui (see `LICENSE`). Posts from 2020–2021
come from the previous Hugo version of this blog.
