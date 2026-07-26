import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { BlogPostBody } from "@/components/site/blog/blog-post-body";
import { BlurFade } from "@/components/ui/blur-fade";
import {
  estimateWordCount,
  getAllBlogPosts,
  getBlogPost,
  getBlogSlugs,
  getToc
} from "@/lib/blog";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Post not found — Zivvy" };

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: `https://zivvy.xyz/blog/${post.slug}`,
      siteName: "Zivvy",
      type: "article",
      publishedTime: post.publishedAt
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription
    }
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const toc = post.source === "blg" ? [] : getToc(post);
  const words = post.source === "blg" ? post.readingMinutes * 250 : estimateWordCount(post);
  const allPosts = await getAllBlogPosts();
  const related = allPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);

  const jsonLd = post.jsonLd || {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishedAt,
    author: {
      "@type": "Organization",
      name: "Zivvy",
      url: "https://zivvy.xyz"
    },
    publisher: {
      "@type": "Organization",
      name: "Zivvy",
      url: "https://zivvy.xyz"
    },
    mainEntityOfPage: `https://zivvy.xyz/blog/${post.slug}`,
    articleSection: post.category,
    keywords: post.tags.join(", "),
    wordCount: words
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {post.faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(post.faqJsonLd) }}
        />
      ) : null}
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-3xl px-6 pb-6 pt-20 sm:pt-24">
          <BlurFade>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Link href="/blog" className="hover:text-primary">
                Blog
              </Link>
              <span>/</span>
              <span className="font-medium text-primary/80">{post.category}</span>
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              By Zivvy Team · {post.publishedAt} · {post.readingMinutes} min read
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border/70 px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </BlurFade>
        </section>

        {post.heroImage ? (
          <div className="mx-auto max-w-3xl px-6 pb-6">
            <Image
              src={post.heroImage}
              alt={post.title}
              width={960}
              height={540}
              className="rounded-xl border border-border/70"
              priority
            />
          </div>
        ) : null}

        {toc.length > 0 ? (
          <nav className="mx-auto max-w-3xl px-6 pb-4">
            <div className="rounded-xl border border-border/70 bg-card/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                On this page
              </p>
              <ol className="mt-3 space-y-1.5 text-sm">
                {toc.map((item, idx) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="text-foreground/80 hover:text-primary">
                      {idx + 1}. {item.text}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>
        ) : null}

        {post.source === "blg" && post.contentHtml ? (
          <article
            className="prose-zivvy mx-auto max-w-3xl px-6 pb-16 pt-4"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        ) : (
          <BlogPostBody post={post} />
        )}

        {related.length > 0 ? (
          <section className="mx-auto max-w-3xl px-6 pb-20">
            <h2 className="font-display text-xl font-semibold">Related in {post.category}</h2>
            <ul className="mt-4 space-y-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/blog/${item.slug}`}
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
