import Link from "next/link";
import type { BlogPost, BlogSection } from "@/lib/blog";
import { BlogCta } from "@/components/site/blog/blog-cta";

function SectionView({ section }: { section: BlogSection }) {
  switch (section.type) {
    case "h2":
      return (
        <h2 id={section.id} className="mt-12 scroll-mt-24 font-display text-2xl font-semibold tracking-tight">
          {section.text}
        </h2>
      );
    case "h3":
      return (
        <h3 id={section.id} className="mt-8 scroll-mt-24 font-display text-xl font-semibold tracking-tight">
          {section.text}
        </h3>
      );
    case "p":
      return <p className="mt-4 text-base leading-relaxed text-foreground/90">{section.text}</p>;
    case "ul":
      return (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground/90">
          {section.items.map((item) => (
            <li key={item.slice(0, 80)}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-base leading-relaxed text-foreground/90">
          {section.items.map((item) => (
            <li key={item.slice(0, 80)}>{item}</li>
          ))}
        </ol>
      );
    case "table":
      return (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border/70">
          {section.caption ? (
            <p className="border-b border-border/60 bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
              {section.caption}
            </p>
          ) : null}
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-muted/30">
              <tr>
                {section.headers.map((header) => (
                  <th key={header} className="px-4 py-3 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row, idx) => (
                <tr key={idx} className="border-t border-border/60 align-top">
                  {row.map((cell, cellIdx) => (
                    <td key={`${idx}-${cellIdx}`} className="px-4 py-3 text-foreground/90">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "callout":
      return (
        <aside className="mt-6 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
          <p className="text-sm font-semibold text-primary">{section.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">{section.text}</p>
        </aside>
      );
    case "faq":
      return (
        <div className="mt-4 space-y-4">
          {section.items.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-border/70 bg-card/50 px-4 py-3 open:bg-card/80"
            >
              <summary className="cursor-pointer list-none font-medium marker:content-none">
                {item.q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      );
    default:
      return null;
  }
}

export function BlogPostBody({ post }: { post: BlogPost }) {
  return (
    <article className="mx-auto max-w-3xl px-6 pb-16 pt-4">
      <div className="prose-zivvy">
        {post.sections.map((section, idx) => (
          <SectionView key={idx} section={section} />
        ))}
      </div>

      {post.internalLinks.length > 0 ? (
        <nav className="mt-12 rounded-xl border border-border/70 bg-card/50 p-5">
          <p className="text-sm font-semibold">Keep exploring</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {post.internalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div className="mt-10">
        <BlogCta primary={post.primaryCta} secondary={post.secondaryCta} />
      </div>
    </article>
  );
}
