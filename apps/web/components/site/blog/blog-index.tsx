"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "@/lib/blog";
import { BlurFade } from "@/components/ui/blur-fade";
import { Marquee } from "@/components/ui/marquee";
import { MagicCard } from "@/components/ui/magic-card";
import { cn } from "@/lib/utils";

type Props = {
  posts: Array<
    Pick<
      BlogPost,
      "slug" | "title" | "excerpt" | "category" | "tags" | "publishedAt" | "readingMinutes"
    >
  >;
  categories: string[];
  initialCategory?: string;
};

export function BlogIndex({ posts, categories, initialCategory = "All" }: Props) {
  const [category, setCategory] = useState(
    initialCategory && (initialCategory === "All" || categories.includes(initialCategory))
      ? initialCategory
      : "All"
  );

  const filtered = useMemo(() => {
    if (category === "All") return posts;
    return posts.filter((post) => post.category === category);
  }, [category, posts]);

  const filters = ["All", ...categories];

  return (
    <div>
      <section className="border-y border-border/60 bg-muted/20 py-3">
        <Marquee pauseOnHover className="[--duration:48s]">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "mx-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                category === cat
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/70 bg-background/80 text-muted-foreground hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </Marquee>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-wrap gap-2">
          {filters.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                category === cat
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/70 text-muted-foreground hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Showing {filtered.length} of {posts.length} posts
          {category !== "All" ? ` in ${category}` : ""}.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((post, idx) => (
            <BlurFade key={post.slug} delay={Math.min(idx * 0.02, 0.4)}>
              <Link href={`/blog/${post.slug}`} className="block h-full">
                <MagicCard
                  className="h-full rounded-2xl border border-border/70 bg-card/60 p-5 transition-colors hover:bg-card/90"
                  gradientFrom="#34d399"
                  gradientTo="#0f766e"
                  gradientColor="#0f766e33"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-primary/80">
                      {post.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {post.readingMinutes} min · {post.publishedAt}
                    </span>
                  </div>
                  <h2 className="mt-3 font-display text-xl font-semibold tracking-tight group-hover:text-primary">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Read guide <ArrowRight className="size-3.5" />
                  </span>
                </MagicCard>
              </Link>
            </BlurFade>
          ))}
        </div>
      </section>
    </div>
  );
}
