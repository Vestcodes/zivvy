import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { BlogIndex } from "@/components/site/blog/blog-index";
import { BlogCta } from "@/components/site/blog/blog-cta";
import { BlurFade } from "@/components/ui/blur-fade";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { RetroGrid } from "@/components/ui/retro-grid";
import { getAllBlogPosts, getBlogCategories } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Zivvy",
  description:
    "Long-form guides on ERP, CRM, inventory, accounting, AI automation, migrations, and software comparisons for growing teams.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Zivvy Blog",
    description:
      "High-intent guides for operators replacing spreadsheets and fragmented tools with structured workflows.",
    url: "https://zivvy.xyz/blog",
    siteName: "Zivvy",
    type: "website"
  }
};

type Props = {
  searchParams?: Promise<{ category?: string }>;
};

export default async function BlogPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const posts = getAllBlogPosts().map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    tags: post.tags,
    publishedAt: post.publishedAt,
    readingMinutes: post.readingMinutes
  }));
  const categories = getBlogCategories();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <RetroGrid className="opacity-40" />
          <div className="relative mx-auto max-w-4xl px-6 pb-10 pt-20 text-center sm:pt-24">
            <BlurFade>
              <div className="mb-5 inline-flex items-center justify-center rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
                <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
                  {posts.length}+ long-form guides · updated for 2026
                </AnimatedShinyText>
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Zivvy blog
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Practical ERP, CRM, inventory, accounting, and AI ops writing for teams that want fewer tools and clearer ownership—not vanity metrics.
              </p>
            </BlurFade>
          </div>
        </section>

        <BlogIndex
          posts={posts}
          categories={categories}
          initialCategory={params.category || "All"}
        />

        <section className="mx-auto max-w-3xl px-6 pb-20">
          <BlogCta
            primary={{ label: "Start free", href: "/signup" }}
            secondary={{ label: "See product tour", href: "/product-tour" }}
          />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
