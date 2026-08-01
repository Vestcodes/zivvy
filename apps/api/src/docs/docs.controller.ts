import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../auth/decorators';
import * as fs from 'fs';
import * as path from 'path';

interface GuideMeta {
  title: string;
  description: string;
  order: number;
  slug: string;
}

@ApiExcludeController()
@Controller('docs')
export class DocsController {
  private readonly docsDir = path.join(process.cwd(), 'docs');

  // ───────────────────────────────────────────────
  // GET /docs — Redoc API reference
  // ───────────────────────────────────────────────

  @Public()
  @Get()
  getRedoc(@Res() res: Response) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Zivvy API Documentation</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>&#x1f331;</text></svg>" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', system-ui, sans-serif; }

    .zivvy-navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      height: 56px;
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .zivvy-navbar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: #111827;
      font-weight: 700;
      font-size: 18px;
    }
    .zivvy-navbar-brand svg {
      width: 28px;
      height: 28px;
    }
    .zivvy-navbar-links {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .zivvy-navbar-links a {
      display: inline-flex;
      align-items: center;
      padding: 6px 14px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      transition: background 0.15s, color 0.15s;
    }
    .zivvy-navbar-links a:hover {
      background: #f3f4f6;
      color: #111827;
    }
    .zivvy-navbar-links a.active {
      background: #e8f5ee;
      color: #4a8c6f;
    }

    #redoc-container { margin-top: 0; }
  </style>
</head>
<body>
  <nav class="zivvy-navbar">
    <a href="/docs" class="zivvy-navbar-brand">
      <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="28" height="28" rx="6" fill="#4a8c6f"/>
        <text x="14" y="20" text-anchor="middle" font-size="16" font-weight="bold" fill="white" font-family="Inter, sans-serif">Z</text>
      </svg>
      Zivvy Docs
    </a>
    <div class="zivvy-navbar-links">
      <a href="/docs" class="active">API Reference</a>
      <a href="/docs/guides">Guides</a>
      <a href="https://zivvy.xyz/dashboard" target="_blank" rel="noopener">Dashboard &nearr;</a>
    </div>
  </nav>

  <div id="redoc-container"></div>

  <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  <script>
    Redoc.init('/openapi.json', {
      expandResponses: '200,201',
      hideDownloadButton: false,
      hideHostname: false,
      pathInMiddlePanel: true,
      requiredPropsFirst: true,
      sortPropsAlphabetically: true,
      theme: {
        colors: {
          primary: { main: '#4a8c6f' }
        },
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          headings: { fontFamily: 'Inter, system-ui, sans-serif' }
        },
        rightPanel: {
          backgroundColor: '#1a1a2e'
        }
      }
    }, document.getElementById('redoc-container'));
  </script>
</body>
</html>`;

    res.type('text/html').send(html);
  }

  // ───────────────────────────────────────────────
  // GET /docs/guides — Guide index
  // ───────────────────────────────────────────────

  @Public()
  @Get('guides')
  getGuidesIndex(@Res() res: Response) {
    const guides = this.listGuides();

    const guideCards = guides
      .map(
        (g) => `
      <a href="/docs/guides/${g.slug}" class="guide-card">
        <h3>${g.title}</h3>
        <p>${g.description}</p>
        <span class="guide-card-link">Read guide &rarr;</span>
      </a>`,
      )
      .join('\n');

    const html = this.wrapHtml(
      'Guides',
      `
      <div class="guides-hero">
        <h1>Guides</h1>
        <p>Everything you need to integrate with the Zivvy API.</p>
      </div>
      <div class="guides-grid">
        ${guideCards}
      </div>`,
      `
      .guides-hero {
        text-align: center;
        padding: 48px 0 32px;
      }
      .guides-hero h1 {
        font-size: 32px;
        font-weight: 700;
        color: #111827;
        margin-bottom: 8px;
      }
      .guides-hero p {
        font-size: 16px;
        color: #6b7280;
      }
      .guides-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        max-width: 900px;
        margin: 0 auto;
        padding: 0 24px 64px;
      }
      .guide-card {
        display: flex;
        flex-direction: column;
        padding: 24px;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        text-decoration: none;
        color: inherit;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .guide-card:hover {
        border-color: #4a8c6f;
        box-shadow: 0 2px 8px rgba(74,140,111,0.10);
      }
      .guide-card h3 {
        font-size: 17px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 6px;
      }
      .guide-card p {
        font-size: 14px;
        color: #6b7280;
        flex: 1;
        margin-bottom: 12px;
      }
      .guide-card-link {
        font-size: 13px;
        font-weight: 600;
        color: #4a8c6f;
      }
      `,
    );

    res.type('text/html').send(html);
  }

  // ───────────────────────────────────────────────
  // GET /docs/guides/:slug — Individual guide
  // ───────────────────────────────────────────────

  @Public()
  @Get('guides/:slug')
  getGuide(@Param('slug') slug: string, @Res() res: Response) {
    const filePath = path.join(this.docsDir, `${slug}.mdx`);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Guide "${slug}" not found.`);
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, body } = this.parseFrontmatter(raw);
    const contentHtml = this.mdToHtml(body);
    const guides = this.listGuides();

    const sidebar = guides
      .map(
        (g) =>
          `<a href="/docs/guides/${g.slug}" class="sidebar-link${g.slug === slug ? ' active' : ''}">${g.title}</a>`,
      )
      .join('\n');

    const title = frontmatter.title || slug;

    const html = this.wrapHtml(
      title,
      `
      <div class="guide-layout">
        <aside class="guide-sidebar">
          <div class="sidebar-heading">Guides</div>
          ${sidebar}
        </aside>
        <main class="guide-content">
          <nav class="breadcrumb">
            <a href="/docs">Docs</a>
            <span>/</span>
            <a href="/docs/guides">Guides</a>
            <span>/</span>
            <span class="breadcrumb-current">${title}</span>
          </nav>
          <article class="prose">
            ${contentHtml}
          </article>
        </main>
      </div>`,
      `
      .guide-layout {
        display: flex;
        min-height: calc(100vh - 56px);
      }
      .guide-sidebar {
        width: 240px;
        flex-shrink: 0;
        border-right: 1px solid #e5e7eb;
        padding: 24px 16px;
        background: #fafafa;
      }
      .sidebar-heading {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #9ca3af;
        margin-bottom: 12px;
        padding: 0 8px;
      }
      .sidebar-link {
        display: block;
        padding: 7px 8px;
        border-radius: 6px;
        font-size: 14px;
        color: #374151;
        text-decoration: none;
        margin-bottom: 2px;
        transition: background 0.1s;
      }
      .sidebar-link:hover { background: #f3f4f6; }
      .sidebar-link.active {
        background: #e8f5ee;
        color: #4a8c6f;
        font-weight: 600;
      }
      .guide-content {
        flex: 1;
        max-width: 780px;
        padding: 32px 48px 80px;
      }
      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #9ca3af;
        margin-bottom: 24px;
      }
      .breadcrumb a {
        color: #6b7280;
        text-decoration: none;
      }
      .breadcrumb a:hover {
        color: #4a8c6f;
        text-decoration: underline;
      }
      .breadcrumb-current {
        color: #374151;
        font-weight: 500;
      }

      /* Prose */
      .prose h1 { font-size: 28px; font-weight: 700; color: #111827; margin: 0 0 16px; line-height: 1.3; }
      .prose h2 { font-size: 22px; font-weight: 600; color: #111827; margin: 40px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6; }
      .prose h3 { font-size: 17px; font-weight: 600; color: #111827; margin: 28px 0 8px; }
      .prose p { font-size: 15px; line-height: 1.7; color: #374151; margin: 0 0 16px; }
      .prose ul, .prose ol { margin: 0 0 16px; padding-left: 24px; }
      .prose li { font-size: 15px; line-height: 1.7; color: #374151; margin-bottom: 4px; }
      .prose a { color: #4a8c6f; text-decoration: underline; text-underline-offset: 2px; }
      .prose a:hover { color: #3a7159; }
      .prose strong { font-weight: 600; color: #111827; }
      .prose code {
        font-family: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, monospace;
        font-size: 13px;
        background: #f3f4f6;
        padding: 2px 6px;
        border-radius: 4px;
        color: #1f2937;
      }
      .prose pre {
        background: #1a1a2e;
        color: #e2e8f0;
        padding: 16px 20px;
        border-radius: 8px;
        overflow-x: auto;
        margin: 0 0 20px;
        font-size: 13px;
        line-height: 1.6;
      }
      .prose pre code {
        background: none;
        padding: 0;
        border-radius: 0;
        color: inherit;
        font-size: inherit;
      }
      .prose .code-lang {
        display: block;
        font-size: 11px;
        color: #9ca3af;
        margin-bottom: 4px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .prose table {
        width: 100%;
        border-collapse: collapse;
        margin: 0 0 20px;
        font-size: 14px;
      }
      .prose th {
        text-align: left;
        font-weight: 600;
        color: #374151;
        padding: 10px 12px;
        border-bottom: 2px solid #e5e7eb;
      }
      .prose td {
        padding: 10px 12px;
        border-bottom: 1px solid #f3f4f6;
        color: #4b5563;
      }
      .prose blockquote {
        border-left: 3px solid #4a8c6f;
        margin: 0 0 16px;
        padding: 12px 16px;
        background: #f0faf4;
        border-radius: 0 6px 6px 0;
        color: #374151;
        font-size: 14px;
      }
      .prose hr {
        border: none;
        border-top: 1px solid #e5e7eb;
        margin: 32px 0;
      }

      /* Syntax highlighting — minimal CSS approach */
      .prose pre .kw { color: #c792ea; }
      .prose pre .str { color: #c3e88d; }
      .prose pre .num { color: #f78c6c; }
      .prose pre .cmt { color: #697098; }

      @media (max-width: 768px) {
        .guide-layout { flex-direction: column; }
        .guide-sidebar {
          width: 100%;
          border-right: none;
          border-bottom: 1px solid #e5e7eb;
          padding: 16px;
          display: flex;
          gap: 8px;
          overflow-x: auto;
          flex-wrap: nowrap;
        }
        .sidebar-heading { display: none; }
        .sidebar-link { white-space: nowrap; }
        .guide-content { padding: 24px 20px 64px; }
      }
      `,
    );

    res.type('text/html').send(html);
  }

  // ───────────────────────────────────────────────
  // Helpers
  // ───────────────────────────────────────────────

  private listGuides(): GuideMeta[] {
    if (!fs.existsSync(this.docsDir)) return [];

    return fs
      .readdirSync(this.docsDir)
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => {
        const raw = fs.readFileSync(path.join(this.docsDir, f), 'utf-8');
        const { frontmatter } = this.parseFrontmatter(raw);
        return {
          title: frontmatter.title || f.replace('.mdx', ''),
          description: frontmatter.description || '',
          order: parseInt(frontmatter.order, 10) || 99,
          slug: f.replace('.mdx', ''),
        };
      })
      .sort((a, b) => a.order - b.order);
  }

  private parseFrontmatter(raw: string): {
    frontmatter: Record<string, string>;
    body: string;
  } {
    const fm: Record<string, string> = {};
    let body = raw;

    const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (match) {
      const lines = match[1].split('\n');
      for (const line of lines) {
        const idx = line.indexOf(':');
        if (idx > 0) {
          const key = line.slice(0, idx).trim();
          const val = line.slice(idx + 1).trim();
          fm[key] = val;
        }
      }
      body = match[2];
    }

    return { frontmatter: fm, body };
  }

  /**
   * Lightweight Markdown-to-HTML converter.
   * Handles headers, code blocks, tables, links, bold, italic,
   * inline code, lists, blockquotes, horizontal rules, and paragraphs.
   */
  private mdToHtml(md: string): string {
    const lines = md.split('\n');
    const out: string[] = [];
    let i = 0;
    let inList: 'ul' | 'ol' | null = null;

    const closeList = () => {
      if (inList) {
        out.push(inList === 'ul' ? '</ul>' : '</ol>');
        inList = null;
      }
    };

    while (i < lines.length) {
      const line = lines[i];

      // Fenced code block
      const codeMatch = line.match(/^```(\w*)/);
      if (codeMatch) {
        closeList();
        const lang = codeMatch[1];
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing ```
        const langLabel = lang
          ? `<span class="code-lang">${this.escapeHtml(lang)}</span>`
          : '';
        out.push(
          `<pre>${langLabel}<code>${this.escapeHtml(codeLines.join('\n'))}</code></pre>`,
        );
        continue;
      }

      // Table (starts with |)
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        closeList();
        const tableRows: string[] = [];
        while (
          i < lines.length &&
          lines[i].trim().startsWith('|') &&
          lines[i].trim().endsWith('|')
        ) {
          tableRows.push(lines[i]);
          i++;
        }
        out.push(this.parseTable(tableRows));
        continue;
      }

      // Heading
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        closeList();
        const level = headingMatch[1].length;
        const text = this.inlineMarkdown(headingMatch[2]);
        out.push(`<h${level}>${text}</h${level}>`);
        i++;
        continue;
      }

      // Blockquote
      if (line.startsWith('> ')) {
        closeList();
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].startsWith('> ')) {
          quoteLines.push(lines[i].slice(2));
          i++;
        }
        out.push(
          `<blockquote>${this.inlineMarkdown(quoteLines.join(' '))}</blockquote>`,
        );
        continue;
      }

      // Horizontal rule
      if (/^---+$/.test(line.trim())) {
        closeList();
        out.push('<hr />');
        i++;
        continue;
      }

      // Unordered list item
      const ulMatch = line.match(/^[-*]\s+(.+)$/);
      if (ulMatch) {
        if (inList !== 'ul') {
          closeList();
          out.push('<ul>');
          inList = 'ul';
        }
        out.push(`<li>${this.inlineMarkdown(ulMatch[1])}</li>`);
        i++;
        continue;
      }

      // Ordered list item
      const olMatch = line.match(/^\d+\.\s+(.+)$/);
      if (olMatch) {
        if (inList !== 'ol') {
          closeList();
          out.push('<ol>');
          inList = 'ol';
        }
        out.push(`<li>${this.inlineMarkdown(olMatch[1])}</li>`);
        i++;
        continue;
      }

      // Blank line
      if (line.trim() === '') {
        closeList();
        i++;
        continue;
      }

      // Paragraph — collect consecutive non-blank lines that aren't special
      closeList();
      const paraLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() !== '' &&
        !lines[i].match(/^#{1,6}\s/) &&
        !lines[i].startsWith('```') &&
        !lines[i].startsWith('> ') &&
        !lines[i].match(/^[-*]\s+/) &&
        !lines[i].match(/^\d+\.\s+/) &&
        !(lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) &&
        !/^---+$/.test(lines[i].trim())
      ) {
        paraLines.push(lines[i]);
        i++;
      }
      if (paraLines.length) {
        out.push(`<p>${this.inlineMarkdown(paraLines.join(' '))}</p>`);
      }
    }

    closeList();
    return out.join('\n');
  }

  private inlineMarkdown(text: string): string {
    // Inline code (must be before bold/italic)
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Bold + italic
    text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    // Bold
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Links
    text = text.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2">$1</a>',
    );
    return text;
  }

  private parseTable(rows: string[]): string {
    const parse = (row: string) =>
      row
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());

    if (rows.length < 2) return '';

    const headers = parse(rows[0]);
    // rows[1] is the separator
    const body = rows.slice(2).map(parse);

    let html = '<table><thead><tr>';
    for (const h of headers) {
      html += `<th>${this.inlineMarkdown(h)}</th>`;
    }
    html += '</tr></thead><tbody>';
    for (const row of body) {
      html += '<tr>';
      for (const cell of row) {
        html += `<td>${this.inlineMarkdown(cell)}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table>';
    return html;
  }

  private escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private wrapHtml(
    title: string,
    content: string,
    extraCss: string = '',
  ): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${this.escapeHtml(title)} - Zivvy Docs</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>&#x1f331;</text></svg>" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', system-ui, sans-serif; color: #111827; background: #fff; }

    .zivvy-navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      height: 56px;
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .zivvy-navbar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: #111827;
      font-weight: 700;
      font-size: 18px;
    }
    .zivvy-navbar-brand svg {
      width: 28px;
      height: 28px;
    }
    .zivvy-navbar-links {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .zivvy-navbar-links a {
      display: inline-flex;
      align-items: center;
      padding: 6px 14px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      transition: background 0.15s, color 0.15s;
    }
    .zivvy-navbar-links a:hover {
      background: #f3f4f6;
      color: #111827;
    }
    .zivvy-navbar-links a.active {
      background: #e8f5ee;
      color: #4a8c6f;
    }

    ${extraCss}
  </style>
</head>
<body>
  <nav class="zivvy-navbar">
    <a href="/docs" class="zivvy-navbar-brand">
      <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="28" height="28" rx="6" fill="#4a8c6f"/>
        <text x="14" y="20" text-anchor="middle" font-size="16" font-weight="bold" fill="white" font-family="Inter, sans-serif">Z</text>
      </svg>
      Zivvy Docs
    </a>
    <div class="zivvy-navbar-links">
      <a href="/docs">API Reference</a>
      <a href="/docs/guides" class="active">Guides</a>
      <a href="https://zivvy.xyz/dashboard" target="_blank" rel="noopener">Dashboard &nearr;</a>
    </div>
  </nav>
  ${content}
</body>
</html>`;
  }
}
