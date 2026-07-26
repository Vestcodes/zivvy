import fs from "node:fs";
import path from "node:path";
import { readingTimeMinutes, stripToText } from "babylovegrowth-next-js-blog";
import { getBlogClient } from "@/lib/blg-client";

export type BlogLink = {
  label: string;
  href: string;
};

export type BlogFaq = {
  q: string;
  a: string;
};

export type BlogSection =
  | { type: "p"; text: string }
  | { type: "h2"; id: string; text: string }
  | { type: "h3"; id: string; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; caption?: string; headers: string[]; rows: string[][] }
  | { type: "callout"; title: string; text: string }
  | { type: "faq"; items: BlogFaq[] };

export type BlogPost = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readingMinutes: number;
  primaryCta: BlogLink;
  secondaryCta?: BlogLink;
  internalLinks: BlogLink[];
  sections: BlogSection[];
  source?: "local" | "blg";
  heroImage?: string;
  contentHtml?: string;
  jsonLd?: Record<string, unknown> | null;
  faqJsonLd?: Record<string, unknown> | null;
};

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

function isPost(value: unknown): value is BlogPost {
  if (!value || typeof value !== "object") return false;
  const post = value as BlogPost;
  return (
    typeof post.slug === "string" &&
    typeof post.title === "string" &&
    Array.isArray(post.sections)
  );
}

function getLocalPosts(): BlogPost[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".json") && !file.startsWith("_"))
    .sort();

  const posts: BlogPost[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (isPost(parsed)) posts.push({ ...parsed, source: "local" });
  }
  return posts;
}

function getLocalPost(slug: string): BlogPost | undefined {
  const file = path.join(CONTENT_DIR, `${slug}.json`);
  if (!fs.existsSync(file)) return undefined;
  const parsed: unknown = JSON.parse(fs.readFileSync(file, "utf8"));
  return isPost(parsed) ? { ...parsed, source: "local" } : undefined;
}

async function getBlgPosts(): Promise<BlogPost[]> {
  const client = getBlogClient();
  if (!client) return [];
  try {
    const articles = await client.getAllArticles({ publishedOnly: true });
    return articles.map((a) => ({
      slug: a.slug,
      title: a.title,
      metaTitle: a.title,
      metaDescription: a.meta_description || a.excerpt || "",
      excerpt: a.excerpt || a.meta_description || "",
      category: a.keywords?.[0] || "Blog",
      tags: a.keywords || [],
      publishedAt: a.created_at?.split("T")[0] || "",
      readingMinutes: 0,
      primaryCta: { label: "Start free", href: "/signup" },
      internalLinks: [],
      sections: [],
      source: "blg" as const,
      heroImage: a.hero_image_url || undefined,
    }));
  } catch {
    return [];
  }
}

export async function getBlogCategories(): Promise<string[]> {
  const posts = await getAllBlogPosts();
  const cats = new Set(posts.map((p) => p.category));
  return Array.from(cats).sort((a, b) => a.localeCompare(b));
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const [local, blg] = await Promise.all([getLocalPosts(), getBlgPosts()]);
  const localSlugs = new Set(local.map((p) => p.slug));
  const merged = [...local, ...blg.filter((p) => !localSlugs.has(p.slug))];
  return merged.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  const local = getLocalPost(slug);
  if (local) return local;

  const client = getBlogClient();
  if (!client) return undefined;
  try {
    const article = await client.getArticleBySlug(slug);
    if (!article) return undefined;
    return {
      slug: article.slug,
      title: article.title,
      metaTitle: article.title,
      metaDescription: article.meta_description || article.excerpt || "",
      excerpt: article.excerpt || article.meta_description || "",
      category: article.keywords?.[0] || "Blog",
      tags: article.keywords || [],
      publishedAt: article.created_at?.split("T")[0] || "",
      readingMinutes: readingTimeMinutes(article.content_markdown || ""),
      primaryCta: { label: "Start free", href: "/signup" },
      internalLinks: [],
      sections: [],
      source: "blg",
      heroImage: article.hero_image_url || undefined,
      contentHtml: article.content_html,
      jsonLd: article.jsonLd,
      faqJsonLd: article.faqJsonLd,
    };
  } catch {
    return undefined;
  }
}

export async function getBlogSlugs(): Promise<string[]> {
  const posts = await getAllBlogPosts();
  return posts.map((post) => post.slug);
}

export function estimateWordCount(post: BlogPost): number {
  let words = 0;
  for (const section of post.sections) {
    if (section.type === "p" || section.type === "h2" || section.type === "h3" || section.type === "callout") {
      const text = section.type === "callout" ? `${section.title} ${section.text}` : section.text;
      words += text.split(/\s+/).filter(Boolean).length;
    } else if (section.type === "ul" || section.type === "ol") {
      words += section.items.join(" ").split(/\s+/).filter(Boolean).length;
    } else if (section.type === "table") {
      words += [...section.headers, ...section.rows.flat()].join(" ").split(/\s+/).filter(Boolean).length;
    } else if (section.type === "faq") {
      words += section.items
        .map((item) => `${item.q} ${item.a}`)
        .join(" ")
        .split(/\s+/)
        .filter(Boolean).length;
    }
  }
  return words;
}

export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export function getToc(post: BlogPost): { id: string; text: string }[] {
  return post.sections
    .filter((section): section is Extract<BlogSection, { type: "h2" }> => section.type === "h2")
    .map((section) => ({ id: section.id, text: section.text }));
}
