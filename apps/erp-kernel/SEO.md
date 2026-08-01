# Zivvy marketing SEO checklist

Canonical host: **https://zivvy.xyz** (apex). Prefer apex over `www` in all canonicals and sitemaps.

## Per-page surfaces

| Route | Title + description | Canonical | OG / Twitter | JSON-LD | robots |
| --- | --- | --- | --- | --- | --- |
| `/home` | yes | apex | yes | Organization, WebSite, SoftwareApplication | index |
| `/features` | yes | apex | yes | SoftwareApplication | index |
| `/pricing` | yes | apex | yes | SoftwareApplication | index |
| `/blog` | yes | apex | yes | Organization, WebSite | index |
| `/blog/<slug>` | yes (from post) | apex | article | Organization, BlogPosting | index |
| `/contact` | yes | apex | yes | Organization | index |
| `/developers` | yes | apex | yes | — | index |
| `/docs` | yes | apex | yes | — | index |
| `/terms` `/privacy` `/cookies` `/acceptable-use` | yes | apex | yes | — | index |
| `/login` | yes | apex | yes | — | **noindex, nofollow** |

Implementation: `zivvy_brand/marketing/seo.py` + page `get_context` + `templates/marketing/base.html` / `templates/legal/legal_shell.html`.

## Crawl control

- [x] `robots.txt` — allow marketing; disallow `/app`, `/api`, `/desk`, `/private/`, `/login`
- [x] `sitemap.xml` — marketing paths + all seeded blog slugs (`www/sitemap.py` + `www/sitemap.xml`)
- [x] `llms.txt` + `ai.txt` — lightweight AI summaries

## Blog routing (important)

Frappe’s Blog Post web view owns `/blog` and `/blog/<category>` by default. Zivvy uses:

- `website_path_resolver` → `zivvy_brand.www.path_resolver.resolve`
- Seeded posts in `zivvy_brand/blog/posts.py`

Verify after any Frappe upgrade that `/blog` still renders Zivvy marketing cards (not `blog-list`).

## Semantic / content

- [x] One `h1` per marketing/legal page
- [x] Logo `alt="Zivvy"` in nav
- [x] Internal links: nav/footer (Blog, Developers, Features, Pricing, legal)
- [x] No “by Vestcodes” in product lockups; Vestcodes Co OK on legal/about/footer entity line
- [x] No third-party ERP brand names in blog copy

## Performance notes

- PostHog remains consent-gated (`posthog_boot.html` / cookie banner)
- Marketing JS is a small deferred-ish footer script; avoid large blocking third-party tags in `head_include`

## Verify (curl)

```bash
for p in /home /features /pricing /blog /contact /developers /terms /login; do
  echo "== $p"
  curl -sL "https://zivvy.xyz$p" | grep -oE '<title>[^<]+|meta name="description"[^>]+|rel="canonical"[^>]+|application/ld\+json|name="robots"[^>]+' | head -8
done

curl -sL https://zivvy.xyz/sitemap.xml
curl -sL https://zivvy.xyz/robots.txt
curl -sL https://zivvy.xyz/blog/crm-for-indian-smes | grep -oE '<title>[^<]+|BlogPosting'
```

Expect: filled sitemap URLs, blog titles with `· Zivvy`, login `noindex`, JSON-LD on home/posts.

## Deploy note

Prefer SSH sync of `apps/zivvy_brand` + `bench --site zivvy.xyz clear-cache` (and clear website route cache). Full Railway redeploy only if hooks fail to reload.
