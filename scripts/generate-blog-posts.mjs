#!/usr/bin/env node
/**
 * Expands scripts/blog-topics.json into long-form content/blog/*.json posts.
 * Run: node scripts/generate-blog-posts.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const TOPICS_PATH = path.join(__dirname, "blog-topics.json");
const OUT_DIR = path.join(ROOT, "content", "blog");

const LINK_POOL = {
  features: [
    { label: "AI automation", href: "/features/ai-automation" },
    { label: "Reporting dashboard", href: "/features/reporting-dashboard" },
    { label: "Team collaboration", href: "/features/team-collaboration" },
    { label: "Analytics", href: "/features/analytics" },
    { label: "API", href: "/features/api" },
    { label: "Workflow builder", href: "/features/workflow-builder" }
  ],
  solutions: [
    { label: "Zivvy for startups", href: "/solutions/startups" },
    { label: "Zivvy for agencies", href: "/solutions/agencies" },
    { label: "Zivvy for enterprises", href: "/solutions/enterprises" },
    { label: "Zivvy for HR teams", href: "/solutions/hr-teams" },
    { label: "Zivvy for marketing teams", href: "/solutions/marketing-teams" },
    { label: "Zivvy for developers", href: "/solutions/developers" }
  ],
  compare: [
    { label: "Zivvy vs Odoo", href: "/compare/odoo" },
    { label: "Zivvy vs Zoho", href: "/compare/zoho" },
    { label: "Zivvy vs NetSuite", href: "/compare/netsuite" }
  ],
  alternatives: [
    { label: "Odoo alternative", href: "/alternatives/odoo" },
    { label: "Zoho alternative", href: "/alternatives/zoho" },
    { label: "Legacy ERP alternative", href: "/alternatives/legacy-erp" }
  ],
  industries: [
    { label: "Manufacturing", href: "/industries/manufacturing" },
    { label: "SaaS", href: "/industries/saas" },
    { label: "Finance", href: "/industries/finance" },
    { label: "Healthcare", href: "/industries/healthcare" },
    { label: "Education", href: "/industries/education" }
  ],
  useCases: [
    { label: "CRM automation", href: "/use-cases/crm-automation" },
    { label: "Project management", href: "/use-cases/project-management" },
    { label: "Employee onboarding", href: "/use-cases/employee-onboarding" },
    { label: "Customer support", href: "/use-cases/customer-support" },
    { label: "Content planning", href: "/use-cases/content-planning" }
  ],
  core: [
    { label: "Pricing", href: "/pricing" },
    { label: "Product tour", href: "/product-tour" },
    { label: "Security", href: "/security" },
    { label: "Integrations", href: "/integrations" },
    { label: "Contact", href: "/contact" },
    { label: "Features overview", href: "/features" }
  ]
};

function headingId(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function daysAgo(n) {
  const d = new Date("2026-07-22T12:00:00.000Z");
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function pickLinks(keys, seed = 0) {
  const pool = (keys || ["core", "features"]).flatMap((k) => LINK_POOL[k] || []);
  const out = [];
  for (let i = 0; i < pool.length && out.length < 7; i++) {
    const item = pool[(i * 2 + seed) % pool.length];
    if (!out.some((x) => x.href === item.href)) out.push(item);
  }
  for (const must of [
    { label: "Pricing", href: "/pricing" },
    { label: "Product tour", href: "/product-tour" },
    { label: "Start free", href: "/signup" }
  ]) {
    if (out.length < 8 && !out.some((x) => x.href === must.href)) out.push(must);
  }
  return out.slice(0, 8);
}

function wordCountFromSections(sections) {
  let words = 0;
  for (const s of sections) {
    if (s.type === "p" || s.type === "h2" || s.type === "h3") words += s.text.split(/\s+/).length;
    else if (s.type === "callout") words += `${s.title} ${s.text}`.split(/\s+/).length;
    else if (s.type === "ul" || s.type === "ol") words += s.items.join(" ").split(/\s+/).length;
    else if (s.type === "table")
      words += [...s.headers, ...s.rows.flat()].join(" ").split(/\s+/).length;
    else if (s.type === "faq") words += s.items.map((i) => `${i.q} ${i.a}`).join(" ").split(/\s+/).length;
  }
  return words;
}

function domainFlavor(domain) {
  const map = {
    inventory:
      "Treat on-hand, reserved, and incoming stock as different truths. Transfers, returns, and kits should be documents—not chat messages.",
    crm: "Pipeline stages need exit criteria, next actions, and a clean handoff into quotes, delivery, and invoices.",
    finance:
      "Cash, AR, AP, and inventory valuation only reconcile when operational documents are finished on time with owners.",
    ai: "Use AI to draft, triage, and route. Keep humans in the loop for money movement, credit holds, and irreversible posts.",
    security:
      "Residency, access control, audit trails, and restore drills matter more than marketing badge walls.",
    hosting:
      "Cloud speed is real; self-host control is real. Pick the burden you can staff for three years, not one quarter.",
    mfg: "BOM accuracy, work orders, scrap, and material availability beat fancy scheduling slides.",
    retail: "One stock ledger should feed every channel. Buffers are intentional policy, not silent overstock.",
    services: "Capacity is inventory for services firms. Projects, time, and invoices must share one customer truth.",
    startup: "Buy fewer systems of record. Automate only after the happy path is boring and owned.",
    migration: "Masters first, open documents second, history selectively. Parallel run beats weekend heroics.",
    pricing: "Model seats, modules, hosting constraints, and internal hours—not only list price.",
    buying: "Pilot with real documents. Score time-to-first successful invoice, transfer, or close—not demo wow.",
    workflow: "Approve risk with thresholds and SLAs. Route to roles, escalate stalls, and measure cycle time.",
    hr: "Onboarding and offboarding are ops workflows. Access bundles should follow roles, not peer copying.",
    ecommerce: "Kits, returns, and marketplace buffers break naive ATP. Disposition codes protect sellable stock.",
    wholesale: "Price lists, credit limits, allocations, and partials are the real B2B CRM.",
    collab: "Chat is for speed; the ERP/CRM record is for commitments that survive employee turnover.",
    reporting: "Fewer metrics with owners beat dashboards nobody trusts. Drill from KPI to document.",
    integrations:
      "APIs and connectors should extend a system of record—not create a second conflicting master.",
    adoption: "Train roles with scenarios. Measure document creation and cycle time, not login vanity.",
    support: "Support severity, ownership, and customer context belong next to the account record.",
    marketing: "Handoffs need SLAs and recycle reasons. Marketing tools can coexist with ops CRM.",
    enterprise: "Roll out by process boundary. Permissions and company membership come before customization.",
    healthcare:
      "Keep clinical systems purpose-built. Use Zivvy for business ops and be explicit about data boundaries.",
    education: "Treat cohorts like projects with enrollment status, billing rules, and staff assignments.",
    nonprofit: "Programs need budgets, approvals, and permissioned access—without pretending to be niche nonprofit ERP theater.",
    saas: "Activation, onboarding tasks, support priority, and expansion signals should share a customer record.",
    purchasing: "POs above threshold, receiving discipline, and match exceptions prevent AP surprises.",
    spreadsheets: "Sheets are fine for analysis. They fail as multi-user systems of record for stock, CRM, and cash."
  };
  return map[domain] || map.buying;
}

function buildFaqs(topic) {
  const base = [
    {
      q: `Who is this ${topic.category.toLowerCase()} guide for?`,
      a: `Primarily ${topic.audience}. If your pain matches “${topic.problem.slice(0, 120)}…”, this playbook applies.`
    },
    {
      q: "Does Zivvy invent customer count or rating claims in this article?",
      a: "No. We avoid vanity metrics. Evaluate Zivvy with a trial, product tour, and your own workflow scorecard."
    },
    {
      q: "Where should we start inside Zivvy?",
      a: `Begin with the smallest revenue-critical loop related to ${topic.tags[0] || "operations"}, then expand modules once masters are clean.`
    },
    {
      q: "How do we get help?",
      a: "Email support@zivvy.xyz, or use the contact page for migration and region/self-host questions."
    },
    {
      q: "Is there a free way to try?",
      a: "Yes—start from /signup (or /login#signup). Confirm current Free/Pro/Business limits on /pricing."
    }
  ];
  if (topic.category === "Comparisons" || topic.category === "Alternatives") {
    base.splice(2, 0, {
      q: "How should we compare vendors fairly?",
      a: "Run the same pilot script on both sides: create a customer, item, quote/order, stock movement, and invoice—then time admin effort."
    });
  }
  if (topic.domain === "security" || topic.domain === "hosting") {
    base.splice(2, 0, {
      q: "Does Zivvy support region-pinned data or self-host?",
      a: "Zivvy supports region-pinned data options, and self-host is available on Business. Confirm your region and deployment needs with support@zivvy.xyz."
    });
  }
  return base.slice(0, 6);
}

function buildPost(topic, index) {
  const links = pickLinks(topic.linkKeys, index);
  const pillars = topic.pillars || [];
  const pitfalls = topic.pitfalls || [];
  const checklist = topic.checklist || [];
  const flavor = domainFlavor(topic.domain);
  const h = (text) => ({ type: "h2", id: headingId(text), text });
  const p = (text) => ({ type: "p", text });
  const h3 = (text) => ({ type: "h3", id: headingId(text), text });

  const sections = [
    p(
      `${topic.title} is written for ${topic.audience}. The core problem is simple: ${topic.problem} The promise of this guide is equally direct: ${topic.promise}`
    ),
    p(
      `The working angle throughout is that ${topic.angle}. Zivvy is business/ERP software covering CRM, stock, accounting, HR, manufacturing, and AI automation—with region-pinned data options and self-host on Business. We will stay product-true: no invented customer counts, no fake star ratings, and no third-party attribution noise in the marketing UI.`
    ),
    h("Who this is for (and who should skip it)"),
    p(
      `If you are ${topic.audience}, you likely feel the cost of inaction as rework, slow cash, stock surprises, or leadership arguments about whose spreadsheet is correct. This article is for teams ready to replace fragile habits with documents, owners, and permissions.`
    ),
    p(
      `Skip a full platform change if your process is still undefined and you only need a temporary tracker for a one-off project. In that case, define the process first—then choose software. When the process repeats weekly and multiple roles touch money or goods, structured software wins.`
    ),
    h3("Fit signals"),
    {
      type: "ul",
      items: [
        `Your team debates conflicting numbers related to ${topic.tags.slice(0, 3).join(", ")}`,
        "Handoffs die in email/Slack without a durable record",
        "A second location, entity, or channel appeared in the last year",
        "Approvals and permissions are becoming a real risk—not a formality"
      ]
    },
    h("The operating principle"),
    p(flavor),
    p(
      `Applied to ${topic.tags[0] || "operations"}, that principle means you stop optimizing isolated tools and start optimizing the path a document travels: who creates it, who approves it, what it reserves or bills, and how exceptions get cleared. Zivvy’s value shows up when CRM, stock, and accounting stop being separate novels about the same customer.`
    ),
    callout(
      "Product-true note",
      "Zivvy includes Free/Pro/Business pricing paths, AI automation with human-in-the-loop controls, and Business options for self-host. For residency or deployment specifics, confirm with support@zivvy.xyz rather than assuming a region from a blog post."
    ),
    h("Step-by-step playbook"),
    p(
      `Use this sequence as a 2–6 week improvement program. Compress it if you are a tiny team; extend it if you have multiple warehouses or entities. The order matters more than the tooling brand—though tooling that keeps masters unified (like Zivvy) reduces re-entry and reconciliation tax.`
    )
  ];

  // Expand each pillar into a substantial subsection
  pillars.forEach((pillar, i) => {
    sections.push(h3(`${i + 1}. ${pillar}`));
    sections.push(
      p(
        `${pillar} sounds obvious until you watch a busy week. Write the definition of done for this pillar in one paragraph your team can recite. Name the role that owns it when something breaks at 4:55pm. If nobody owns it, the spreadsheet will quietly become the system of record again.`
      )
    );
    sections.push(
      p(
        `In practice for ${topic.audience}, implement the pillar with a thin slice: one customer segment, one warehouse, one invoice type, or one approval threshold. Prove the loop end-to-end in Zivvy—create the record, move it through stages, and report on it—before you expand scope. This is how you avoid six-month “transformation” theater.`
      )
    );
    sections.push({
      type: "ul",
      items: [
        `Document the current broken path related to “${pillar}” with screenshots or sample files`,
        "Define the target document types and required fields (keep the first version short)",
        "Assign a primary owner and a backup for exceptions",
        "Add a weekly metric that proves the pillar is working (cycle time, error rate, or aging)"
      ]
    });
  });

  sections.push(h("Comparison table: fragile habits vs durable ops"));
  sections.push({
    type: "table",
    caption: `Decision lens for ${topic.tags[0] || "ops"}`,
    headers: ["Dimension", "Fragile approach", "Durable approach in Zivvy"],
    rows: [
      [
        "System of record",
        "Sheets + inbox + tribal memory",
        "Documents with owners, timestamps, and permissions"
      ],
      [
        "Handoffs",
        "Forwarded threads and @mentions",
        "Assignments and comments on the customer/order/stock record"
      ],
      [
        "Controls",
        "Hope and heroics",
        "Role-based access, thresholds, and audit trails"
      ],
      [
        "Automation",
        "Brittle personal macros",
        "Workflow/AI assist with human approval for high impact"
      ],
      [
        "Reporting",
        "Conflicting exports",
        "Dashboards that drill into the same operational facts"
      ],
      [
        "Hosting & data",
        "Unknown subprocessors",
        "Clear pricing tiers; region-pin/self-host options on Business"
      ]
    ]
  });

  sections.push(h("Common pitfalls (and how to avoid them)"));
  sections.push(
    p(
      `Most failed rollouts do not fail because a button was missing. They fail because incentives still reward shadow systems. Watch for these traps while improving ${topic.subject || topic.tags[0] || "operations"}.`
    )
  );
  pitfalls.forEach((pit) => {
    sections.push(h3(pit));
    sections.push(
      p(
        `${pit} usually appears when teams optimize for speed this afternoon instead of correctness this quarter. Counter it with a written policy, a pilot scorecard, and a visible exception queue. If leaders bypass the process “just this once,” expect the bypass to become the process.`
      )
    );
    sections.push(
      p(
        `Zivvy cannot culturally enforce discipline alone—but it can make the durable path the easiest path: required fields that matter, approvals that match risk, and reports that expose unfinished work before month-end.`
      )
    );
  });

  sections.push(h("Implementation checklist"));
  sections.push(
    p(
      "Print this checklist or copy it into your project tracker. Do not mark an item done until a real user completed the task on production-like data."
    )
  );
  sections.push({
    type: "ol",
    items: [
      ...checklist,
      "Confirm Free vs Pro vs Business needs on /pricing (seats, modules, self-host/region)",
      "Watch the product tour at /product-tour with your pilot team",
      "Create a trial workspace via /signup and run one thin end-to-end scenario",
      "Email support@zivvy.xyz if you need migration or residency guidance"
    ]
  });

  sections.push(h("Internal resources to open next"));
  sections.push(
    p(
      "These are real routes on zivvy.xyz—use them to go deeper without bouncing through generic blog CTAs only:"
    )
  );
  sections.push({
    type: "ul",
    items: links.map((l) => `${l.label}: ${l.href}`)
  });

  sections.push(h("FAQ"));
  sections.push({ type: "faq", items: buildFaqs(topic) });

  sections.push(h("Conversion path: what to do in the next 30 minutes"));
  sections.push(
    p(
      `If this article matched your pain around ${topic.tags.join(", ")}, do not schedule another abstract evaluation meeting. Open the product tour, sketch your thin-slice pilot, and create a workspace. Bring one skeptical operator and one finance/ops owner. Decide with evidence.`
    )
  );
  sections.push(
    p(
      `Primary next step: ${topic.ctaLabel} (${topic.ctaHref}). Secondary: compare plans on /pricing, or email support@zivvy.xyz with your industry, company structure, and hosting constraints. Zivvy is built to help you run the business—not to decorate another slide deck.`
    )
  );
  sections.push(
    callout(
      "Start where work already hurts",
      "Pick the workflow that creates the most rework this month. Instrument it in Zivvy. Expand only after the first loop is trusted."
    )
  );

  // Extra depth paragraphs to ensure long-form substance
  sections.splice(
    8,
    0,
    h("What “good” looks like in 30, 60, and 90 days"),
    p(
      `Day 30: masters are cleaner, the thin-slice workflow produces real documents, and the pilot team can explain the happy path without a consultant. You are not “fully transformed”—you are trustworthy on one loop related to ${topic.tags[0]}.`
    ),
    p(
      `Day 60: adjacent roles join (for example sales + warehouse, or project managers + billing). Exception queues are visible. A weekly review uses Zivvy dashboards/analytics instead of rebuilding slides from exports.`
    ),
    p(
      `Day 90: permissions are intentional, automations handle repetitive follow-ups, and leadership arguments shift from “whose number is right?” to “what decision does this number imply?” That is the conversion moment for most teams evaluating Zivvy against spreadsheets or fragmented suites.`
    ),
    h("Metrics that matter (without vanity)"),
    p(
      "Avoid fake social proof. Measure your own baseline before and after the pilot:"
    ),
    {
      type: "ul",
      items: [
        "Time from trigger event to posted document (order, transfer, invoice, approval)",
        "Error/rework rate on that document type",
        "Percent of records with a living owner and next action",
        "Hours/week spent reconciling conflicting tools",
        "Aging: stale deals, overdue invoices, or uncounted high-velocity SKUs"
      ]
    },
    p(
      "If a vendor (any vendor) refuses a pilot framed around these metrics, believe that signal. Zivvy should be judged the same way: open /signup, run the loop, and keep the scorecard honest."
    )
  );

  const words = wordCountFromSections(sections);
  const readingMinutes = Math.max(6, Math.round(words / 220));

  return {
    slug: topic.slug,
    title: topic.title,
    metaTitle: `${topic.title} | Zivvy Blog`,
    metaDescription: truncateMeta(
      `${topic.promise} Practical guidance for ${topic.audience}. Try Zivvy for CRM, stock, accounting, HR, and manufacturing.`
    ),
    excerpt: truncateMeta(`${topic.problem} ${topic.promise}`, 180),
    category: topic.category,
    tags: topic.tags,
    publishedAt: daysAgo(index % 160),
    readingMinutes,
    primaryCta: { label: topic.ctaLabel, href: topic.ctaHref },
    secondaryCta: { label: "See pricing", href: "/pricing" },
    internalLinks: links,
    sections
  };
}

function callout(title, text) {
  return { type: "callout", title, text };
}

function truncateMeta(text, max = 158) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

function main() {
  const topics = JSON.parse(fs.readFileSync(TOPICS_PATH, "utf8"));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Clean previous generated json posts only
  for (const file of fs.readdirSync(OUT_DIR)) {
    if (file.endsWith(".json")) fs.unlinkSync(path.join(OUT_DIR, file));
  }

  let minWords = Infinity;
  let maxWords = 0;
  let totalWords = 0;

  for (let i = 0; i < topics.length; i++) {
    const post = buildPost(topics[i], i);
    // Ensure length: if somehow short, append depth section
    let words = wordCountFromSections(post.sections);
    if (words < 1200) {
      post.sections.push(
        { type: "h2", id: "deeper-practice", text: "Deeper practice drills" },
        {
          type: "p",
          text: `To push this from advice into muscle memory, run two drills this month. Drill one: create the full document chain for a realistic scenario in Zivvy and time every handoff. Drill two: break the scenario on purpose (wrong price, missing stock, disputed invoice) and watch whether your exception path is obvious. Teams that only demo the happy path underestimate change management. ${topics[i].promise}`
        },
        {
          type: "p",
          text: `Drill scoring should be boring and numeric: minutes to complete, number of tool switches, number of clarifying DMs required, and whether a new teammate could follow a written role playbook. If the score is ugly, simplify fields and permissions before you buy more modules. Complexity is not a strategy. Clarity is.`
        },
        {
          type: "ul",
          items: [
            "Record a loom/video of the happy path for training",
            "Write a one-page role playbook for each persona",
            "List the top 10 exceptions and the owner for each",
            "Schedule a 30-day retrospective with keep/kill/change decisions"
          ]
        }
      );
      words = wordCountFromSections(post.sections);
      post.readingMinutes = Math.max(6, Math.round(words / 220));
    }

    minWords = Math.min(minWords, words);
    maxWords = Math.max(maxWords, words);
    totalWords += words;

    fs.writeFileSync(path.join(OUT_DIR, `${post.slug}.json`), JSON.stringify(post, null, 2));
  }

  const index = topics.map((t) => t.slug);
  fs.writeFileSync(path.join(OUT_DIR, "_index.json"), JSON.stringify({ count: topics.length, slugs: index }, null, 2));

  console.log(
    JSON.stringify(
      {
        posts: topics.length,
        minWords,
        maxWords,
        avgWords: Math.round(totalWords / topics.length),
        outDir: OUT_DIR
      },
      null,
      2
    )
  );
}

main();
