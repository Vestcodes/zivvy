import fs from "node:fs";
import path from "node:path";

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

export function getBlogCategories(): string[] {
  const cats = new Set(getAllBlogPosts().map((p) => p.category));
  return Array.from(cats).sort((a, b) => a.localeCompare(b));
}

export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".json") && !file.startsWith("_"))
    .sort();

  const posts: BlogPost[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (isPost(parsed)) posts.push(parsed);
  }

  return posts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getBlogPost(slug: string): BlogPost | undefined {
  const file = path.join(CONTENT_DIR, `${slug}.json`);
  if (!fs.existsSync(file)) return undefined;
  const parsed: unknown = JSON.parse(fs.readFileSync(file, "utf8"));
  return isPost(parsed) ? parsed : undefined;
}

export function getBlogSlugs(): string[] {
  return getAllBlogPosts().map((post) => post.slug);
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
