import {
  guideForIntegration,
  MATURITY_HINT,
  MATURITY_LABEL
} from "@/lib/integration-guides";

export type FaqItem = {
  q: string;
  a: string;
};

export type CodeExample = {
  language: "curl" | "javascript" | "python" | "typescript" | "php";
  label: string;
  code: string;
};

export type MarketingDetail = {
  slug: string;
  title: string;
  description: string;
  keyword: string;
  problem: string;
  solution: string;
  benefits: string[];
  useCases: string[];
  faqs: FaqItem[];
  ctaLabel: string;
  ctaHref: string;
  codeExamples?: CodeExample[];
  apiEndpoints?: string[];
  webhookEvents?: string[];
  docsUrl?: string;
  addonRequired?: string;
  addonPrice?: string;
  /** Integration pages only — honest connector maturity */
  maturity?:
    | "native"
    | "addon"
    | "via-webhooks"
    | "via-api"
    | "coming-soon";
  /** One-sentence real integration path */
  realPath?: string;
  /** Numbered how-to for the real path */
  setupSteps?: string[];
  category?:
    | "Payments"
    | "Ecommerce"
    | "Communication"
    | "Analytics"
    | "Compliance"
    | "Developer";
};

export type CompareRow = {
  capability: string;
  zivvy: string;
  other: string;
};

export type CompareDetail = {
  slug: string;
  title: string;
  description: string;
  keyword: string;
  comparedAgainst: string;
  bestFit: string[];
  limitations: string[];
  rows: CompareRow[];
  ctaLabel: string;
  ctaHref: string;
};

export type AlternativeDetail = {
  slug: string;
  title: string;
  description: string;
  keyword: string;
  alternativeTo: string;
  whySwitch: string[];
  migrationSteps: string[];
  differences: string[];
  ctaLabel: string;
  ctaHref: string;
};

export type HubCardItem = {
  slug: string;
  title: string;
  description: string;
  category?: MarketingDetail["category"];
  maturity?: MarketingDetail["maturity"];
};

function bySlug<T extends { slug: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((item) => [item.slug, item])) as Record<string, T>;
}

export const featureDetails: MarketingDetail[] = [
  {
    slug: "ai-automation",
    title: "AI Automation",
    description:
      "Automate repetitive ops work with AI-triggered workflows, approvals, and follow-ups in Zivvy.",
    keyword: "ai automation software",
    problem:
      "Teams lose hours every week on manual follow-ups, task routing, and status updates across chat and spreadsheets.",
    solution:
      "Zivvy AI Automation watches workflow events, triggers the right next action, and keeps every owner accountable.",
    benefits: [
      "Reduce manual status tracking across sales, ops, and finance",
      "Auto-assign owners using rules based on stage, value, or risk",
      "Keep audit trails for every automated decision and action"
    ],
    useCases: [
      "Auto-create tasks when high-value deals stall",
      "Trigger finance checks before purchase approvals",
      "Escalate overdue invoices with guided next actions"
    ],
    faqs: [
      {
        q: "Do I need technical skills to use AI automation?",
        a: "No. Most teams start from templates and adjust logic with simple conditions."
      },
      {
        q: "Can I keep humans in the loop?",
        a: "Yes. You can require approvals before any high-impact action runs."
      }
    ],
    ctaLabel: "Start automating",
    ctaHref: "/login#signup"
  },
  {
    slug: "reporting-dashboard",
    title: "Reporting Dashboard",
    description:
      "Track revenue, stock, cash, and team performance from a single dashboard built for daily operators.",
    keyword: "business reporting dashboard",
    problem:
      "Leadership decisions slow down when metrics are spread across tools and reports are always stale.",
    solution:
      "Zivvy dashboards combine operational and financial signals so you can act from one live source of truth.",
    benefits: [
      "See leading and lagging indicators side by side",
      "Drill from top-line KPI to document-level root cause",
      "Share role-based views for founders, managers, and finance"
    ],
    useCases: [
      "Daily cash and receivables control",
      "Sales pipeline to invoice conversion tracking",
      "Warehouse fill-rate and stockout risk monitoring"
    ],
    faqs: [
      {
        q: "Can I create custom views?",
        a: "Yes. Save filtered views and reuse them across teams."
      },
      {
        q: "Are dashboards real-time?",
        a: "Data refreshes continuously as transactions are updated."
      }
    ],
    ctaLabel: "See dashboard flow",
    ctaHref: "/product-tour"
  },
  {
    slug: "team-collaboration",
    title: "Team Collaboration",
    description:
      "Coordinate cross-functional work with shared context, role-based access, and structured approvals.",
    keyword: "team collaboration for operations",
    problem:
      "Operational teams coordinate in chat while core records live elsewhere, creating gaps and duplicated work.",
    solution:
      "Zivvy keeps context on the record itself with comments, assignments, approvals, and history in one place.",
    benefits: [
      "Eliminate context-switching between chat and ERP records",
      "Use permissions and roles to keep data safe and focused",
      "Improve handoffs with visible activity timelines"
    ],
    useCases: [
      "Sales-to-finance invoice handoff",
      "Procurement approvals across locations",
      "Cross-team resolution of fulfillment blockers"
    ],
    faqs: [
      {
        q: "Can we restrict access by role?",
        a: "Yes. Access controls are tenant-aware and role-based."
      },
      {
        q: "Do we get action history?",
        a: "Every record includes timeline activity for traceability."
      }
    ],
    ctaLabel: "Explore team workflows",
    ctaHref: "/features"
  },
  {
    slug: "analytics",
    title: "Analytics",
    description:
      "Measure trends, bottlenecks, and operational efficiency with built-in analytics across your core workflows.",
    keyword: "operations analytics platform",
    problem:
      "Teams often see what happened, but not where performance broke down or which process change will improve outcomes.",
    solution:
      "Zivvy analytics surfaces trends, bottlenecks, and stage-level conversion drops so improvement is measurable.",
    benefits: [
      "Identify bottlenecks across lead-to-cash stages",
      "Track team throughput and exception rates over time",
      "Compare business units with shared KPI definitions"
    ],
    useCases: [
      "Lead response time optimization",
      "Procurement cycle-time reduction",
      "Forecast vs. actual variance tracking"
    ],
    faqs: [
      {
        q: "Can analytics be filtered by region or team?",
        a: "Yes. Most views support filtering by owner, team, region, and date."
      },
      {
        q: "Can we export data?",
        a: "Yes. Reports can be exported for board packs and external analysis."
      }
    ],
    ctaLabel: "Try analytics",
    ctaHref: "/login#signup"
  },
  {
    slug: "api",
    title: "API",
    description:
      "Integrate Zivvy with your internal tools using secure API endpoints, predictable schemas, and webhooks.",
    keyword: "business software api",
    problem:
      "When core systems are closed, teams end up with brittle scripts, manual sync jobs, and delayed updates.",
    solution:
      "Zivvy API and webhook events let you connect finance, CRM, and operations with secure, versioned endpoints.",
    benefits: [
      "Connect existing tools without rebuilding workflows",
      "Receive real-time events for key business actions",
      "Ship internal automations with predictable API behavior"
    ],
    useCases: [
      "Sync customer records with downstream apps",
      "Push invoicing events into data warehouses",
      "Automate provisioning from deal-closed triggers"
    ],
    faqs: [
      {
        q: "Is API access gated by plan?",
        a: "API capabilities are available for paid operational workflows and scale with plan depth."
      },
      {
        q: "Do you provide examples?",
        a: "Yes. We provide endpoint examples and implementation patterns in support docs."
      }
    ],
    ctaLabel: "Talk API use case",
    ctaHref: "/contact"
  },
  {
    slug: "workflow-builder",
    title: "Workflow Builder",
    description:
      "Design operational flows with clear stages, rules, and handoffs across teams without custom coding.",
    keyword: "workflow builder software",
    problem:
      "Most teams run mission-critical processes from ad-hoc SOPs that are hard to enforce and nearly impossible to audit.",
    solution:
      "Zivvy workflow builder turns your operating model into explicit, trackable stages with automated controls.",
    benefits: [
      "Standardize process execution across teams and locations",
      "Reduce missed steps with stage-based guardrails",
      "Continuously improve flows using measurable outcomes"
    ],
    useCases: [
      "Order-to-fulfillment operating playbooks",
      "Employee onboarding and access workflows",
      "Quarter-close and month-close finance checklists"
    ],
    faqs: [
      {
        q: "Can we start from templates?",
        a: "Yes. Teams typically launch from templates and tailor to their process."
      },
      {
        q: "Will this replace existing approvals?",
        a: "It can mirror your existing approval logic and gradually improve it."
      }
    ],
    ctaLabel: "Build first workflow",
    ctaHref: "/login#signup"
  }
];

export const solutionDetails: MarketingDetail[] = [
  {
    slug: "startups",
    title: "For Startups",
    description: "Run founder-led operations with one system from first customer to repeatable scale.",
    keyword: "startup operations software",
    problem:
      "Startups outgrow fragmented tools quickly, but enterprise suites add complexity before the business is ready.",
    solution:
      "Zivvy gives startup teams one clean operating system with practical defaults and predictable seat-based pricing.",
    benefits: [
      "Launch fast with minimal setup overhead",
      "Scale from founder mode to team-led execution",
      "Avoid costly replatforming during growth"
    ],
    useCases: [
      "Lead-to-cash workflow in one stack",
      "Cash visibility for weekly decisions",
      "Cross-functional task ownership from one queue"
    ],
    faqs: [
      {
        q: "Can we start free?",
        a: "Yes. You can start on Free and upgrade only when workflow depth requires it."
      },
      {
        q: "How fast can we onboard?",
        a: "Most teams get first value in a single working session."
      }
    ],
    ctaLabel: "Start startup workspace",
    ctaHref: "/login#signup"
  },
  {
    slug: "agencies",
    title: "For Agencies",
    description: "Coordinate clients, billing, and delivery workflows without context loss.",
    keyword: "agency operations software",
    problem:
      "Agencies juggle pipelines, delivery plans, and invoices across disconnected tools that break accountability.",
    solution:
      "Zivvy links client operations from opportunity through billing and execution with shared context.",
    benefits: [
      "Track client lifecycle end to end",
      "Reduce billing leakage and missed approvals",
      "Standardize account delivery workflows"
    ],
    useCases: [
      "Retainer and project billing operations",
      "Delivery health and utilization tracking",
      "Client onboarding checklist automation"
    ],
    faqs: [
      {
        q: "Can we manage multiple client entities?",
        a: "Yes. Business tier supports advanced multi-company operations."
      },
      {
        q: "Can account managers and finance share one view?",
        a: "Yes. Teams can align around shared records and dashboards."
      }
    ],
    ctaLabel: "Talk agency setup",
    ctaHref: "/contact"
  },
  {
    slug: "enterprises",
    title: "For Enterprises",
    description: "Bring operational control, permissions, and reporting discipline to complex organizations.",
    keyword: "enterprise operations platform",
    problem:
      "Large teams need strict controls and consistency, but legacy systems often slow down daily execution.",
    solution:
      "Zivvy combines enterprise-grade governance with a modern UX teams can actually adopt.",
    benefits: [
      "Role-based controls with clear audit history",
      "Consistent workflow standards across teams",
      "Operational visibility for leadership and finance"
    ],
    useCases: [
      "Cross-BU process standardization",
      "Controlled procurement and spending approvals",
      "Enterprise reporting with region-level views"
    ],
    faqs: [
      {
        q: "Do you support strict access controls?",
        a: "Yes. Permissions and plan-aware controls are built into the product."
      },
      {
        q: "Can we phase rollout by team?",
        a: "Yes. Most enterprise rollouts start with a pilot function, then expand."
      }
    ],
    ctaLabel: "Plan enterprise rollout",
    ctaHref: "/contact"
  },
  {
    slug: "marketing-teams",
    title: "For Marketing Teams",
    description: "Connect campaign planning, pipeline contribution, and revenue outcomes in one place.",
    keyword: "marketing operations software",
    problem:
      "Marketing teams track execution in one tool and outcomes in another, making ROI attribution slow and noisy.",
    solution:
      "Zivvy links campaign operations to pipeline and revenue movement with shared data and clear ownership.",
    benefits: [
      "Track execution and outcomes in one system",
      "Improve handoff clarity with sales and finance",
      "Use shared dashboards for planning and review"
    ],
    useCases: [
      "Campaign-to-pipeline tracking",
      "Content planning and execution visibility",
      "Marketing budget and ROI governance"
    ],
    faqs: [
      {
        q: "Can we track lead quality and speed?",
        a: "Yes. You can track response SLAs and stage conversion by source."
      },
      {
        q: "Does this replace creative tools?",
        a: "No. It orchestrates operational flow and business reporting around them."
      }
    ],
    ctaLabel: "See marketing workflows",
    ctaHref: "/use-cases/content-planning"
  },
  {
    slug: "hr-teams",
    title: "For HR Teams",
    description: "Run onboarding, attendance, and payroll workflows with stronger visibility and controls.",
    keyword: "hr operations software",
    problem:
      "HR teams often manage onboarding and payroll dependencies through spreadsheets and disconnected approvals.",
    solution:
      "Zivvy gives HR one operating layer for employee records, attendance, leave, and payroll-linked workflows.",
    benefits: [
      "Reduce manual handoffs between HR and finance",
      "Track onboarding progress and blockers",
      "Standardize people operations across teams"
    ],
    useCases: [
      "Employee onboarding checklists",
      "Leave and attendance governance",
      "Payroll readiness and exception tracking"
    ],
    faqs: [
      {
        q: "Can HR and finance share payroll context?",
        a: "Yes. Shared records and permissions support cross-functional workflows."
      },
      {
        q: "Is this useful for distributed teams?",
        a: "Yes. Region-aware configuration supports distributed operating models."
      }
    ],
    ctaLabel: "Explore HR operations",
    ctaHref: "/login#signup"
  },
  {
    slug: "developers",
    title: "For Developers",
    description: "Integrate business workflows with internal systems using API-first extension points.",
    keyword: "developer friendly business software",
    problem:
      "Developers need robust APIs and predictable data behavior to build reliable business integrations.",
    solution:
      "Zivvy exposes secure APIs and event flows so engineering teams can automate and extend core operations safely.",
    benefits: [
      "Integrate quickly with existing systems",
      "Reduce brittle one-off sync scripts",
      "Enable product-led internal automation"
    ],
    useCases: [
      "Internal bot and app integrations",
      "Data sync with analytics stack",
      "Workflow extensions tied to core events"
    ],
    faqs: [
      {
        q: "Is there webhook support?",
        a: "Yes. Real-time events are available for key business actions."
      },
      {
        q: "Can we test safely before go-live?",
        a: "Yes. Teams usually validate flows in staged rollouts."
      }
    ],
    ctaLabel: "Discuss integration architecture",
    ctaHref: "/contact"
  }
];

export const useCaseDetails: MarketingDetail[] = [
  {
    slug: "project-management",
    title: "Project Management",
    description: "Plan, execute, and track project delivery with finance and operations context.",
    keyword: "project management workflow software",
    problem:
      "Project status is often disconnected from billing, resource constraints, and operational risk.",
    solution:
      "Zivvy connects project tasks, ownership, and outcomes to the rest of your business workflows.",
    benefits: [
      "Single source of truth for plan and execution",
      "Clear ownership and stage accountability",
      "Faster risk detection with shared dashboards"
    ],
    useCases: [
      "Client delivery milestones",
      "Internal transformation projects",
      "Cross-functional launch planning"
    ],
    faqs: [
      {
        q: "Can non-project teams collaborate here?",
        a: "Yes. Shared context allows finance, ops, and delivery teams to align."
      },
      {
        q: "Can we track completion trends?",
        a: "Yes. Analytics surfaces throughput and blocker patterns over time."
      }
    ],
    ctaLabel: "Try project workflows",
    ctaHref: "/login#signup"
  },
  {
    slug: "employee-onboarding",
    title: "Employee Onboarding",
    description: "Standardize onboarding so every new hire gets fast, consistent setup.",
    keyword: "employee onboarding workflow",
    problem:
      "Onboarding quality varies when steps live in docs and follow-ups happen manually.",
    solution:
      "Zivvy turns onboarding into a visible, stage-based process with role-specific tasks and approvals.",
    benefits: [
      "Improve onboarding speed and consistency",
      "Reduce missed IT/HR/finance steps",
      "Measure onboarding cycle time and quality"
    ],
    useCases: [
      "New hire equipment and access workflows",
      "Manager and HR approval flows",
      "Probation tracking and check-ins"
    ],
    faqs: [
      {
        q: "Can we template onboarding by role?",
        a: "Yes. You can define reusable paths by department or role type."
      },
      {
        q: "Can onboarding link to payroll readiness?",
        a: "Yes. HR and finance data can stay aligned from day one."
      }
    ],
    ctaLabel: "Run onboarding in Zivvy",
    ctaHref: "/login#signup"
  },
  {
    slug: "customer-support",
    title: "Customer Support",
    description: "Manage support workflows with SLA visibility and stronger cross-team handoffs.",
    keyword: "customer support workflow software",
    problem:
      "Support teams struggle when ticket context, product data, and billing state live in separate places.",
    solution:
      "Zivvy support workflows centralize records, timeline context, and escalation paths for faster resolution.",
    benefits: [
      "Faster triage and response with shared context",
      "Visible escalation rules and ownership",
      "SLA discipline through operational dashboards"
    ],
    useCases: [
      "Billing and account issue resolution",
      "Cross-team escalations to ops or finance",
      "Support trend analytics by category"
    ],
    faqs: [
      {
        q: "Can we prioritize by account value?",
        a: "Yes. Workflow rules can include plan and customer attributes."
      },
      {
        q: "Can support see billing context?",
        a: "Yes. Teams can operate with controlled but shared data visibility."
      }
    ],
    ctaLabel: "Improve support operations",
    ctaHref: "/contact"
  },
  {
    slug: "content-planning",
    title: "Content Planning",
    description: "Coordinate planning, production, and publishing workflows with clear ownership.",
    keyword: "content planning workflow software",
    problem:
      "Content teams lose momentum when approvals, deadlines, and dependencies are managed in disconnected tools.",
    solution:
      "Zivvy content planning workflows map work from brief to publish with accountability at every stage.",
    benefits: [
      "Reduce approval cycle time",
      "Improve deadline predictability",
      "Link execution to business outcomes"
    ],
    useCases: [
      "Campaign calendar planning",
      "Editorial workflow orchestration",
      "Cross-team review and signoff"
    ],
    faqs: [
      {
        q: "Can we assign work by campaign?",
        a: "Yes. You can create structured workflows tied to campaign goals."
      },
      {
        q: "Can this support agencies and in-house teams?",
        a: "Yes. Role-based access supports both internal and external collaborators."
      }
    ],
    ctaLabel: "Plan content better",
    ctaHref: "/login#signup"
  },
  {
    slug: "crm-automation",
    title: "CRM Automation",
    description: "Automate lead routing, follow-up, and pipeline progression without losing human judgment.",
    keyword: "crm automation software",
    problem:
      "Deals stall when follow-ups, ownership updates, and qualification steps rely on manual execution.",
    solution:
      "Zivvy CRM automation keeps your pipeline moving through rule-based actions and visibility.",
    benefits: [
      "Improve lead response consistency",
      "Reduce pipeline leakage from missed follow-ups",
      "Increase conversion through faster handoffs"
    ],
    useCases: [
      "Auto-route inbound leads by segment",
      "Escalate aging opportunities automatically",
      "Sync pipeline activity with billing readiness"
    ],
    faqs: [
      {
        q: "Can we override automation manually?",
        a: "Yes. Teams can override and still keep complete action history."
      },
      {
        q: "Can CRM automation connect to finance workflows?",
        a: "Yes. Deal progression can trigger finance and ops workflows."
      }
    ],
    ctaLabel: "Automate your CRM",
    ctaHref: "/login#signup"
  }
];

export const industryDetails: MarketingDetail[] = [
  {
    slug: "healthcare",
    title: "Healthcare",
    description:
      "Coordinate healthcare operations with clearer workflows, controls, and region-aware data handling.",
    keyword: "healthcare operations software",
    problem:
      "Healthcare teams need controlled operations and reliable records, but fragmented systems slow execution.",
    solution:
      "Zivvy enables structured workflows, traceability, and role-based visibility across core business operations.",
    benefits: [
      "Improve accountability in sensitive workflows",
      "Reduce operational delays across departments",
      "Maintain clean records for audit readiness"
    ],
    useCases: [
      "Vendor and procurement controls",
      "Service workflow orchestration",
      "Finance and compliance reporting support"
    ],
    faqs: [
      {
        q: "Can access be controlled tightly?",
        a: "Yes. Role-based access helps restrict sensitive workflows."
      },
      {
        q: "Do you support region preference?",
        a: "Yes. Teams can select region preference during onboarding."
      }
    ],
    ctaLabel: "Explore healthcare fit",
    ctaHref: "/contact"
  },
  {
    slug: "education",
    title: "Education",
    description:
      "Run institutional operations with better planning, billing control, and team coordination.",
    keyword: "education operations platform",
    problem:
      "Education organizations often manage operations in disconnected systems, making planning and governance harder.",
    solution:
      "Zivvy gives education teams one shared workspace for finance, operations, and support workflows.",
    benefits: [
      "Centralize workflow ownership across teams",
      "Improve cost and billing visibility",
      "Standardize recurring operational processes"
    ],
    useCases: [
      "Administrative workflow governance",
      "Vendor and service operations",
      "Cross-campus operational reporting"
    ],
    faqs: [
      {
        q: "Can teams adopt this without heavy training?",
        a: "Yes. Most workflows launch with simple templates and guided views."
      },
      {
        q: "Can reporting be customized by unit?",
        a: "Yes. Dashboards support team and unit-level segmentation."
      }
    ],
    ctaLabel: "See education workflows",
    ctaHref: "/product-tour"
  },
  {
    slug: "manufacturing",
    title: "Manufacturing",
    description:
      "Manage manufacturing operations from planning through execution with integrated business controls.",
    keyword: "manufacturing operations software",
    problem:
      "Manufacturers struggle with visibility when planning, inventory, quality, and finance are not tightly connected.",
    solution:
      "Zivvy unifies manufacturing and core business operations to improve throughput, control, and predictability.",
    benefits: [
      "Improve plan-to-production execution clarity",
      "Reduce stock and fulfillment surprises",
      "Connect quality and financial impact quickly"
    ],
    useCases: [
      "BOM and work-order coordination",
      "Inventory and warehouse control",
      "Quality and exception tracking"
    ],
    faqs: [
      {
        q: "Is manufacturing available on all plans?",
        a: "Advanced manufacturing depth is available on Business workflows."
      },
      {
        q: "Can we run multi-company operations?",
        a: "Yes. Multi-company operations are available for advanced teams."
      }
    ],
    ctaLabel: "Run manufacturing on Zivvy",
    ctaHref: "/pricing"
  },
  {
    slug: "saas",
    title: "SaaS",
    description:
      "Operate a SaaS business with aligned sales, finance, support, and customer operations workflows.",
    keyword: "saas operations software",
    problem:
      "SaaS teams often have siloed customer, revenue, and support data, slowing execution and decision-making.",
    solution:
      "Zivvy creates a shared operating layer so SaaS teams can move faster with less friction.",
    benefits: [
      "Align GTM and finance around shared metrics",
      "Improve billing and renewal visibility",
      "Close feedback loops between support and product ops"
    ],
    useCases: [
      "Pipeline-to-revenue coordination",
      "Renewal and account health workflows",
      "Support escalation and SLA management"
    ],
    faqs: [
      {
        q: "Can this work for both SMB and mid-market SaaS?",
        a: "Yes. Teams can start lean and unlock depth as complexity grows."
      },
      {
        q: "Can we model multi-team operating workflows?",
        a: "Yes. Workflows are built for cross-functional execution."
      }
    ],
    ctaLabel: "Launch SaaS ops stack",
    ctaHref: "/login#signup"
  },
  {
    slug: "finance",
    title: "Finance",
    description:
      "Strengthen financial operations with tighter controls, faster closes, and shared business context.",
    keyword: "finance operations software",
    problem:
      "Finance teams lose time reconciling operations data from multiple systems before they can act.",
    solution:
      "Zivvy connects finance workflows directly with operational activity so decisions are faster and cleaner.",
    benefits: [
      "Reduce reconciliation and close friction",
      "Improve invoice, payment, and receivable visibility",
      "Enable controlled approvals for spend and risk"
    ],
    useCases: [
      "Month-close workflow management",
      "Receivables and cash monitoring",
      "Approval controls for procurement and payouts"
    ],
    faqs: [
      {
        q: "Can finance dashboards be shared securely?",
        a: "Yes. Access is role-based and configurable by team."
      },
      {
        q: "Does this support operational drill-down?",
        a: "Yes. You can move from KPI to source record quickly."
      }
    ],
    ctaLabel: "See finance control flow",
    ctaHref: "/features/reporting-dashboard"
  }
];

export const integrationDetails: MarketingDetail[] = [
  {
    slug: "slack",
    title: "Slack",
    description:
      "Subscribe Slack channels to Zivvy webhooks and post workflow updates as rich messages.",
    keyword: "slack erp integration",
    category: "Communication",
    problem:
      "Teams miss workflow updates when Zivvy events (invoices submitted, orders shipped, tasks overdue) never reach the channel where daily work happens.",
    solution:
      "Register a Slack incoming webhook as a webhook subscription in Zivvy and route sales-invoices.submitted, sales-orders.submitted, and tasks.overdue events into any channel.",
    benefits: [
      "Route zivvy-web webhook events into #sales, #finance, and #ops in real time",
      "Verify every payload with HMAC-SHA256 to keep channels tamper-proof",
      "Deep-link back to the source record in Zivvy from every Slack message"
    ],
    useCases: [
      "Post to #finance whenever sales-invoices.submitted fires",
      "Ping the account owner in Slack when payment-entries.paid clears",
      "Alert #ops when tasks.overdue crosses the SLA threshold"
    ],
    faqs: [
      {
        q: "How do I connect a Slack channel?",
        a: "Create an incoming webhook in Slack, then POST it to /v1/webhook-subscriptions with the events you want."
      },
      {
        q: "Are payloads signed?",
        a: "Every delivery ships with an X-Zivvy-Signature HMAC-SHA256 header you can verify inside your Slack app."
      }
    ],
    ctaLabel: "Configure webhook",
    ctaHref: "/settings/developer",
    apiEndpoints: [
      "POST /v1/webhook-subscriptions",
      "GET /v1/webhook-subscriptions",
      "DELETE /v1/webhook-subscriptions/{id}"
    ],
    webhookEvents: [
      "sales-invoices.submitted",
      "sales-orders.submitted",
      "payment-entries.paid",
      "tasks.overdue"
    ],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Webhooks",
    codeExamples: [
      {
        language: "curl",
        label: "Register subscription",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/webhook-subscriptions \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "target_url": "https://hooks.slack.com/services/T00/B00/XXX",
    "events": ["sales-invoices.submitted", "payment-entries.paid"],
    "secret": "whsec_slack_prod"
  }'`
      },
      {
        language: "javascript",
        label: "Verify signature in your Slack app",
        code: `import crypto from "crypto";

export function verifyZivvy(rawBody, signature, secret) {
  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(signature)
  );
}`
      }
    ]
  },
  {
    slug: "salesforce",
    title: "Salesforce",
    description:
      "Bidirectional customer and opportunity sync between Salesforce and Zivvy via /v1/customers.",
    keyword: "salesforce integration with operations",
    category: "Communication",
    problem:
      "Sales-to-ops handoffs break when Salesforce accounts and Zivvy customers drift out of sync and no one owns the mapping.",
    solution:
      "Zivvy exposes /v1/customers and /v1/opportunities with idempotency keys and a customers.updated webhook, so a bidirectional sync stays consistent both ways.",
    benefits: [
      "Two-way sync of Salesforce Account / Contact into /v1/customers",
      "Convert closed-won Opportunities into /v1/opportunities and /v1/sales-orders",
      "Idempotency keys prevent duplicate customer creation on retry"
    ],
    useCases: [
      "Push new Salesforce Accounts into Zivvy as /v1/customers records",
      "Fire customers.updated webhook back into Salesforce on billing changes",
      "Convert Closed-Won Opportunity to /v1/sales-orders atomically"
    ],
    faqs: [
      {
        q: "How is conflict resolution handled?",
        a: "Every write accepts an Idempotency-Key header; last-writer-wins by updated_at, and both sides expose customers.updated events."
      },
      {
        q: "Can we map custom fields?",
        a: "Yes. Zivvy custom fields on Customer/Opportunity flow through the same REST endpoints as standard fields."
      }
    ],
    ctaLabel: "Talk Salesforce setup",
    ctaHref: "/contact",
    apiEndpoints: [
      "GET /v1/customers",
      "POST /v1/customers",
      "PATCH /v1/customers/{id}",
      "POST /v1/opportunities",
      "POST /v1/sales-orders"
    ],
    webhookEvents: [
      "customers.created",
      "customers.updated",
      "opportunities.won",
      "sales-orders.submitted"
    ],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Customers",
    codeExamples: [
      {
        language: "curl",
        label: "Upsert customer from Salesforce",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/customers \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Idempotency-Key: sfdc-acct-001-XYZ" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_name": "Acme Corp",
    "customer_type": "Company",
    "email": "billing@acme.com",
    "external_id": "0016g00000ABCDE"
  }'`
      },
      {
        language: "javascript",
        label: "Sync closed-won opportunity",
        code: `import Zivvy from "@zivvy/node";

const zivvy = new Zivvy({ apiKey: process.env.ZIVVY_API_KEY });

export async function onOpportunityClosedWon(sfOpp) {
  await zivvy.customers.upsert({
    external_id: sfOpp.AccountId,
    customer_name: sfOpp.Account.Name
  });
  await zivvy.opportunities.create({
    external_id: sfOpp.Id,
    customer: sfOpp.AccountId,
    amount: sfOpp.Amount,
    status: "Converted"
  });
}`
      }
    ]
  },
  {
    slug: "hubspot",
    title: "HubSpot",
    description:
      "Sync HubSpot contacts and deals with Zivvy /v1/contacts and /v1/opportunities.",
    keyword: "hubspot operations integration",
    category: "Communication",
    problem:
      "HubSpot lifecycle stages never make it into Zivvy, so ops teams can't see which deals are actually ready to invoice.",
    solution:
      "Mirror HubSpot Contacts and Deals into Zivvy /v1/contacts and /v1/opportunities, then let opportunities.won trigger a /v1/sales-orders draft automatically.",
    benefits: [
      "Contact and Deal sync via /v1/contacts and /v1/opportunities",
      "Trigger onboarding on opportunities.won without leaving HubSpot",
      "Roll HubSpot deal amount into Zivvy revenue dashboards"
    ],
    useCases: [
      "New HubSpot Contact creates /v1/contacts with lifecycle_stage",
      "Deal-stage change updates /v1/opportunities.status",
      "Closed-Won deal spawns a /v1/sales-orders draft"
    ],
    faqs: [
      {
        q: "Do we need HubSpot Marketing Hub?",
        a: "No. The integration only needs a private-app token with contacts and deals scopes."
      },
      {
        q: "What triggers a Zivvy sales order?",
        a: "The opportunities.won webhook, which fires whenever HubSpot pushes dealstage=closedwon back into Zivvy."
      }
    ],
    ctaLabel: "Plan HubSpot sync",
    ctaHref: "/contact",
    apiEndpoints: [
      "GET /v1/contacts",
      "POST /v1/contacts",
      "GET /v1/opportunities",
      "POST /v1/opportunities",
      "POST /v1/sales-orders"
    ],
    webhookEvents: [
      "contacts.created",
      "contacts.updated",
      "opportunities.won",
      "opportunities.lost"
    ],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Contacts",
    codeExamples: [
      {
        language: "curl",
        label: "Create contact from HubSpot",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/contacts \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "first_name": "Jane",
    "last_name": "Doe",
    "email_id": "jane@acme.com",
    "lifecycle_stage": "opportunity",
    "external_id": "hs-contact-42"
  }'`
      },
      {
        language: "typescript",
        label: "Bridge HubSpot deal to Zivvy",
        code: `import type { HubspotDeal } from "@hubspot/api-client";
import { zivvy } from "./zivvy-client";

export async function pushDeal(deal: HubspotDeal) {
  return zivvy.opportunities.upsert({
    external_id: deal.id,
    opportunity_amount: Number(deal.properties.amount),
    status: deal.properties.dealstage === "closedwon" ? "Converted" : "Open"
  });
}`
      }
    ]
  },
  {
    slug: "zapier",
    title: "Zapier",
    description:
      "Trigger Zaps from Zivvy webhook events, or run Zap actions against the Zivvy REST API.",
    keyword: "zapier workflow integration",
    category: "Developer",
    problem:
      "Ops teams want to wire Zivvy to 5,000+ tools without maintaining custom glue code for each one.",
    solution:
      "Every zivvy-web webhook event doubles as a Zap trigger, and every /v1/... endpoint is available as a Zap action via authenticated REST.",
    benefits: [
      "Zap trigger for any webhook event (sales-orders.submitted, tasks.completed, ...)",
      "Zap action against any /v1/... endpoint",
      "OAuth-scoped API keys keep Zap permissions minimal"
    ],
    useCases: [
      "New sales-orders.submitted event triggers a Google Sheets row",
      "Slack message action creates /v1/tasks in Zivvy",
      "Airtable form response POSTs to /v1/customers"
    ],
    faqs: [
      {
        q: "Do I need a Zapier Pro plan?",
        a: "Any Zapier plan works. The Zivvy trigger is a plain webhook, and the actions use REST + API key."
      },
      {
        q: "Can we later move to native API calls?",
        a: "Yes. Zaps and the SDK share the same /v1/... endpoints, so migration is drop-in."
      }
    ],
    ctaLabel: "Automate with Zapier",
    ctaHref: "/settings/developer",
    apiEndpoints: [
      "POST /v1/webhook-subscriptions",
      "POST /v1/tasks",
      "POST /v1/customers",
      "GET /v1/sales-orders"
    ],
    webhookEvents: [
      "sales-orders.submitted",
      "sales-invoices.submitted",
      "tasks.completed",
      "customers.created"
    ],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Webhooks",
    codeExamples: [
      {
        language: "curl",
        label: "Subscribe Zap catch-hook",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/webhook-subscriptions \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "target_url": "https://hooks.zapier.com/hooks/catch/1234/abc/",
    "events": ["sales-orders.submitted"]
  }'`
      },
      {
        language: "javascript",
        label: "Zap action: create task",
        code: `// Runs inside a Zap "Code by Zapier" step
const res = await fetch("https://integrate.zivvy.xyz/v1/tasks", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${inputData.zivvyKey}\`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    subject: inputData.subject,
    assigned_to: inputData.owner,
    due_date: inputData.due
  })
});
return await res.json();`
      }
    ]
  },
  {
    slug: "google-drive",
    title: "Google Drive",
    description:
      "Attach Google Drive documents to any Zivvy record via /v1/file-links and /v1/attachments.",
    keyword: "google drive business integration",
    category: "Communication",
    problem:
      "Contracts, POs, and invoices live in scattered Drive folders with no traceable link to the Zivvy record they belong to.",
    solution:
      "Register Drive file IDs against /v1/attachments so every quotation, sales order, and expense in Zivvy carries a signed Drive link.",
    benefits: [
      "Link Drive files to any DocType via /v1/attachments",
      "Signed short-lived URLs keep sensitive files access-controlled",
      "Audit trail on documents.attached lets you prove evidence at audit time"
    ],
    useCases: [
      "Attach signed PDF quote to a /v1/quotations record",
      "Link expense receipt from Drive to /v1/expense-claims",
      "Ship BOM specs from Drive alongside /v1/work-orders"
    ],
    faqs: [
      {
        q: "Do you store the file inside Zivvy?",
        a: "No. Only the Drive file ID and metadata are stored; the binary stays in Drive under your permissions."
      },
      {
        q: "Can we revoke access?",
        a: "Yes. Deleting the /v1/attachments row instantly invalidates the signed short-lived Drive URL."
      }
    ],
    ctaLabel: "Set up Drive flow",
    ctaHref: "/contact",
    apiEndpoints: [
      "POST /v1/attachments",
      "GET /v1/attachments",
      "DELETE /v1/attachments/{id}"
    ],
    webhookEvents: ["documents.attached", "documents.removed"],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Attachments",
    codeExamples: [
      {
        language: "curl",
        label: "Attach a Drive file to a quotation",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/attachments \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "attached_to_doctype": "Quotation",
    "attached_to_name": "SAL-QTN-2026-0001",
    "provider": "google-drive",
    "external_id": "1AbCDe_gDriveFileId",
    "file_name": "acme-quote.pdf"
  }'`
      },
      {
        language: "python",
        label: "Attach in Python",
        code: `import os, requests

requests.post(
    "https://integrate.zivvy.xyz/v1/attachments",
    headers={"Authorization": f"Bearer {os.environ['ZIVVY_API_KEY']}"},
    json={
        "attached_to_doctype": "Quotation",
        "attached_to_name": "SAL-QTN-2026-0001",
        "provider": "google-drive",
        "external_id": file_id,
        "file_name": "acme-quote.pdf",
    },
).raise_for_status()`
      }
    ]
  },
  {
    slug: "stripe",
    title: "Stripe",
    description:
      "Reconcile Stripe charges, subscriptions, and refunds into Zivvy /v1/payment-entries.",
    keyword: "stripe payment integration",
    category: "Payments",
    problem:
      "Finance teams manually match Stripe payouts against sales invoices, and refunds go unrecorded until month-end.",
    solution:
      "Forward the charge.succeeded, charge.refunded, and payout.paid Stripe webhooks into /v1/payment-entries; Zivvy auto-links to the referenced /v1/sales-invoices.",
    benefits: [
      "Auto-create /v1/payment-entries from charge.succeeded",
      "Match Stripe fee + net payout to your bank account ledger",
      "Refund events reverse the payment entry with full audit trail"
    ],
    useCases: [
      "Stripe charge.succeeded → /v1/payment-entries against a Sales Invoice",
      "Stripe payout.paid → bank reconciliation line in Zivvy",
      "Stripe charge.refunded → reverse the payment entry automatically"
    ],
    faqs: [
      {
        q: "How is matching done?",
        a: "The Stripe payment_intent metadata carries the Zivvy sales-invoice name; Zivvy resolves it on the fly."
      },
      {
        q: "Does Zivvy call Stripe directly?",
        a: "It can. Zivvy accepts inbound Stripe webhooks today; outbound charge creation is on the developer roadmap."
      }
    ],
    ctaLabel: "Wire Stripe webhooks",
    ctaHref: "/settings/developer",
    apiEndpoints: [
      "POST /v1/payment-entries",
      "GET /v1/payment-entries",
      "POST /v1/webhook-subscriptions"
    ],
    webhookEvents: [
      "payment-entries.created",
      "payment-entries.paid",
      "payment-entries.reversed"
    ],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Payments",
    codeExamples: [
      {
        language: "curl",
        label: "Record Stripe charge",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/payment-entries \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "payment_type": "Receive",
    "party_type": "Customer",
    "party": "Acme Corp",
    "paid_amount": 1200.00,
    "reference_no": "ch_3PabcDeXYZ",
    "reference_date": "2026-07-25",
    "references": [
      { "reference_doctype": "Sales Invoice",
        "reference_name": "SAL-INV-2026-0042",
        "allocated_amount": 1200.00 }
    ]
  }'`
      },
      {
        language: "javascript",
        label: "Stripe webhook handler",
        code: `import Stripe from "stripe";
import { zivvy } from "./zivvy-client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const raw = await req.text();
  const event = stripe.webhooks.constructEvent(
    raw,
    req.headers.get("stripe-signature"),
    process.env.STRIPE_WEBHOOK_SECRET
  );
  if (event.type === "charge.succeeded") {
    const c = event.data.object;
    await zivvy.paymentEntries.create({
      payment_type: "Receive",
      party_type: "Customer",
      party: c.metadata.zivvy_customer,
      paid_amount: c.amount / 100,
      reference_no: c.id,
      references: [{
        reference_doctype: "Sales Invoice",
        reference_name: c.metadata.zivvy_invoice,
        allocated_amount: c.amount / 100
      }]
    });
  }
  return new Response("ok");
}`
      }
    ]
  },
  {
    slug: "polar",
    title: "Polar",
    description:
      "Turn Polar subscription events into /v1/subscriptions and /v1/sales-invoices in Zivvy.",
    keyword: "polar subscription integration",
    category: "Payments",
    problem:
      "SaaS teams using Polar for open-source and creator subscriptions lose finance visibility because MRR never lands in their ERP.",
    solution:
      "Forward subscription.created and subscription.updated Polar events into /v1/subscriptions; Zivvy generates recurring /v1/sales-invoices automatically.",
    benefits: [
      "Subscription lifecycle mirrored via /v1/subscriptions",
      "MRR and churn rolled into Zivvy revenue reporting",
      "Failed-payment events open a task on the AR owner"
    ],
    useCases: [
      "Polar subscription.created → /v1/subscriptions with billing plan",
      "Polar subscription.updated → plan/status change in Zivvy",
      "Polar subscription.canceled → close subscription + AR task"
    ],
    faqs: [
      {
        q: "Do we need Polar Enterprise?",
        a: "No. Polar's free tier supports outgoing webhooks and OAuth."
      },
      {
        q: "How are recurring invoices generated?",
        a: "Zivvy's subscription generator runs nightly and posts each cycle to /v1/sales-invoices."
      }
    ],
    ctaLabel: "Talk Polar setup",
    ctaHref: "/contact",
    apiEndpoints: [
      "POST /v1/subscriptions",
      "PATCH /v1/subscriptions/{id}",
      "GET /v1/sales-invoices"
    ],
    webhookEvents: [
      "subscriptions.created",
      "subscriptions.updated",
      "subscriptions.canceled",
      "sales-invoices.submitted"
    ],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Subscriptions",
    codeExamples: [
      {
        language: "curl",
        label: "Create a subscription",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/subscriptions \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "party_type": "Customer",
    "party": "Acme Corp",
    "start_date": "2026-07-01",
    "plans": [{ "plan": "Pro Monthly", "qty": 1 }],
    "external_id": "polar_sub_01H..."
  }'`
      },
      {
        language: "javascript",
        label: "Polar webhook -> Zivvy",
        code: `import { zivvy } from "./zivvy-client";

export async function handlePolar(event) {
  if (event.type === "subscription.created") {
    const s = event.data;
    await zivvy.subscriptions.create({
      external_id: s.id,
      party_type: "Customer",
      party: s.customer.email,
      start_date: s.current_period_start,
      plans: [{ plan: s.product.name, qty: 1 }]
    });
  }
}`
      }
    ]
  },
  {
    slug: "plaid",
    title: "Plaid",
    description:
      "Connect bank accounts with Plaid Link and stream transactions into /v1/bank-transactions.",
    keyword: "plaid bank feed integration",
    category: "Payments",
    problem:
      "Manual bank statement uploads delay reconciliation and hide the current cash position from finance.",
    solution:
      "Use Plaid Link on the client, exchange the public token, and let Zivvy pull daily via /v1/bank-transactions into the bank reconciliation queue.",
    benefits: [
      "Plaid Link on the client, exchange handled by Zivvy",
      "Nightly pull into /v1/bank-transactions",
      "Auto-match against /v1/payment-entries on amount + date"
    ],
    useCases: [
      "Plaid Link → /v1/bank-accounts linked and verified",
      "Daily sync of transactions into /v1/bank-transactions",
      "Auto-suggest matches to /v1/payment-entries"
    ],
    faqs: [
      {
        q: "Which Plaid products do I need?",
        a: "Transactions + Auth. Assets is optional if you also want balance snapshots."
      },
      {
        q: "How often does Zivvy poll?",
        a: "Every 6 hours, plus on-demand refresh from the Bank Reconciliation screen."
      }
    ],
    ctaLabel: "Enable Plaid Link",
    ctaHref: "/settings/developer",
    apiEndpoints: [
      "POST /v1/bank-accounts",
      "GET /v1/bank-transactions",
      "POST /v1/payment-entries"
    ],
    webhookEvents: [
      "bank-transactions.created",
      "bank-accounts.linked",
      "bank-accounts.error"
    ],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Banking",
    codeExamples: [
      {
        language: "curl",
        label: "Create a Plaid link token",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/bank-accounts/link-token \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "user_ref": "user_42",
    "products": ["transactions", "auth"],
    "country_codes": ["US"]
  }'`
      },
      {
        language: "javascript",
        label: "Complete the link",
        code: `const { link_token } = await fetch("/api/plaid/link-token", { method: "POST" })
  .then(r => r.json());

Plaid.create({
  token: link_token,
  onSuccess: async (public_token) => {
    await fetch("/api/plaid/exchange", {
      method: "POST",
      body: JSON.stringify({ public_token })
    });
  }
}).open();`
      }
    ]
  },
  {
    slug: "gocardless",
    title: "GoCardless",
    description:
      "Direct-debit collection via GoCardless landing straight in /v1/payment-entries.",
    keyword: "gocardless direct debit",
    category: "Payments",
    problem:
      "Recurring EU/UK direct debits are collected in GoCardless but never make it into finance until the payout report is emailed at month-end.",
    solution:
      "A GoCardless webhook per mandate will post the collection into /v1/payment-entries once the connector ships.",
    benefits: [
      "Direct-debit mandate lifecycle mirrored inside Zivvy",
      "SEPA + BACS + ACH collections land in /v1/payment-entries",
      "Auto-match against submitted sales invoices"
    ],
    useCases: [
      "GoCardless mandate.created → /v1/customers.mandate_ref",
      "GoCardless payment.confirmed → /v1/payment-entries",
      "GoCardless payment.failed → dunning task in Zivvy"
    ],
    faqs: [
      {
        q: "Is GoCardless available today?",
        a: "Coming soon. Zivvy is a launch partner; join /contact to be added to the beta."
      },
      {
        q: "Will existing mandates carry over?",
        a: "Yes. Existing GoCardless mandates will backfill via the /v1/customers upsert path."
      }
    ],
    ctaLabel: "Join the beta",
    ctaHref: "/contact",
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Payments"
  },
  {
    slug: "shopify",
    title: "Shopify",
    description:
      "Sync Shopify orders, refunds, and inventory with Zivvy /v1/sales-orders and /v1/stock-entries.",
    keyword: "shopify erp integration",
    category: "Ecommerce",
    problem:
      "Shopify orders live outside the finance system, so inventory decrements and revenue recognition happen twice.",
    solution:
      "The ecommerce-integrations add-on maps every Shopify orders/create into /v1/sales-orders and mirrors inventory back to Shopify from /v1/items.",
    benefits: [
      "Shopify order → /v1/sales-orders with tax + shipping breakout",
      "Inventory two-way sync between /v1/items and Shopify variants",
      "Refunds create /v1/sales-invoices credit notes"
    ],
    useCases: [
      "Shopify orders/create → /v1/sales-orders draft",
      "Shopify refunds/create → /v1/sales-invoices credit note",
      "Zivvy stock-entries.submitted → Shopify inventory_level update"
    ],
    faqs: [
      {
        q: "Which Shopify plans are supported?",
        a: "Basic, Shopify, Advanced, and Plus. Shopify Starter cannot install private apps."
      },
      {
        q: "Do returns flow back?",
        a: "Yes. Refunds create credit notes in /v1/sales-invoices and restock via /v1/stock-entries."
      }
    ],
    ctaLabel: "Install add-on",
    ctaHref: "/contact",
    addonRequired: "ecommerce-integrations",
    addonPrice: "$29/mo",
    apiEndpoints: [
      "POST /v1/sales-orders",
      "POST /v1/sales-invoices",
      "PATCH /v1/items/{id}",
      "POST /v1/stock-entries"
    ],
    webhookEvents: [
      "sales-orders.submitted",
      "sales-invoices.submitted",
      "items.updated",
      "stock-entries.submitted"
    ],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Sales-Orders",
    codeExamples: [
      {
        language: "curl",
        label: "Create sales order from Shopify",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/sales-orders \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer": "Shopify Guest",
    "external_id": "shopify-order-#1042",
    "items": [
      { "item_code": "SKU-001", "qty": 2, "rate": 39.00 }
    ],
    "taxes": [{ "rate": 8.875, "account_head": "Sales Tax - US" }]
  }'`
      },
      {
        language: "javascript",
        label: "Shopify webhook handler",
        code: `import { zivvy } from "./zivvy-client";

export async function onShopifyOrder(order) {
  await zivvy.salesOrders.create({
    external_id: \`shopify-\${order.id}\`,
    customer: order.email,
    items: order.line_items.map(li => ({
      item_code: li.sku,
      qty: li.quantity,
      rate: Number(li.price)
    }))
  });
}`
      }
    ]
  },
  {
    slug: "amazon",
    title: "Amazon",
    description:
      "Pull Amazon MWS / SP-API orders and settlement reports into /v1/sales-orders.",
    keyword: "amazon mws integration",
    category: "Ecommerce",
    problem:
      "Amazon sellers reconcile settlement reports by hand every 14 days and only discover pricing or fee variances weeks later.",
    solution:
      "The ecommerce-integrations add-on polls Amazon SP-API for orders and settlement reports and posts them into /v1/sales-orders and /v1/payment-entries.",
    benefits: [
      "Orders + FBA shipments mirrored into /v1/sales-orders",
      "Settlement reports posted as bulk /v1/payment-entries",
      "SKU-level fees split into per-item /v1/expense-claims"
    ],
    useCases: [
      "Amazon Order → /v1/sales-orders with marketplace_id",
      "Settlement Report → /v1/payment-entries with fees breakdown",
      "FBA shipment → /v1/stock-entries.material-transfer"
    ],
    faqs: [
      {
        q: "SP-API or MWS?",
        a: "SP-API. MWS is deprecated; Zivvy uses the newer Selling Partner API only."
      },
      {
        q: "Which marketplaces?",
        a: "All 20+ SP-API regions, including US, EU, UK, IN, JP, AU."
      }
    ],
    ctaLabel: "Install add-on",
    ctaHref: "/contact",
    addonRequired: "ecommerce-integrations",
    apiEndpoints: [
      "POST /v1/sales-orders",
      "POST /v1/payment-entries",
      "POST /v1/stock-entries"
    ],
    webhookEvents: [
      "sales-orders.submitted",
      "payment-entries.created",
      "stock-entries.submitted"
    ],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Sales-Orders",
    codeExamples: [
      {
        language: "curl",
        label: "Post an Amazon order",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/sales-orders \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer": "Amazon Marketplace",
    "external_id": "amzn-113-1234567",
    "source": "amazon",
    "items": [{ "item_code": "SKU-001", "qty": 1, "rate": 49.00 }]
  }'`
      },
      {
        language: "python",
        label: "Sync from SP-API",
        code: `from sp_api.api import Orders
from zivvy import Zivvy

zv = Zivvy(api_key=os.environ["ZIVVY_API_KEY"])

for order in Orders().get_orders(CreatedAfter="2026-07-01").payload["Orders"]:
    zv.sales_orders.create({
        "external_id": order["AmazonOrderId"],
        "customer": "Amazon Marketplace",
        "source": "amazon",
    })`
      }
    ]
  },
  {
    slug: "unicommerce",
    title: "Unicommerce",
    description:
      "Bridge Unicommerce order + inventory data with Zivvy /v1/sales-orders and /v1/items.",
    keyword: "unicommerce erp integration",
    category: "Ecommerce",
    problem:
      "Multi-channel sellers use Unicommerce as an OMS but their ERP never sees channel-level order or inventory data.",
    solution:
      "The ecommerce-integrations add-on syncs Unicommerce SaleOrder and Item entities into /v1/sales-orders and /v1/items with channel breakouts.",
    benefits: [
      "Multi-channel orders normalized into /v1/sales-orders",
      "SKU-level inventory reconciled against /v1/items",
      "Channel-wise revenue splits in Zivvy dashboards"
    ],
    useCases: [
      "Unicommerce sale order → /v1/sales-orders with channel tag",
      "Inventory snapshot → /v1/items.stock_qty per warehouse",
      "Return authorization → /v1/sales-invoices credit note"
    ],
    faqs: [
      {
        q: "Which Unicommerce environments?",
        a: "Both India and SEA tenants. OAuth handshake handled by Zivvy."
      },
      {
        q: "Do we need warehouse mapping?",
        a: "Yes. A one-time map from Unicommerce facility → Zivvy warehouse is done in-app."
      }
    ],
    ctaLabel: "Install add-on",
    ctaHref: "/contact",
    addonRequired: "ecommerce-integrations",
    apiEndpoints: [
      "POST /v1/sales-orders",
      "PATCH /v1/items/{id}",
      "POST /v1/sales-invoices"
    ],
    webhookEvents: [
      "sales-orders.submitted",
      "items.updated",
      "sales-invoices.submitted"
    ],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Sales-Orders",
    codeExamples: [
      {
        language: "curl",
        label: "Push a Unicommerce order",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/sales-orders \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer": "Flipkart",
    "external_id": "uc-so-9981",
    "source": "unicommerce",
    "items": [{ "item_code": "SKU-001", "qty": 3, "rate": 249.00 }]
  }'`
      },
      {
        language: "python",
        label: "Bulk sync",
        code: `for so in unicommerce.list_sale_orders(status="COMPLETE"):
    zv.sales_orders.upsert({
        "external_id": so["saleOrderCode"],
        "customer": so["channelName"],
        "source": "unicommerce",
        "items": [
            {"item_code": li["itemSku"], "qty": li["quantity"], "rate": li["sellingPrice"]}
            for li in so["saleOrderItems"]
        ],
    })`
      }
    ]
  },
  {
    slug: "quickbooks",
    title: "QuickBooks",
    description:
      "Pull QuickBooks invoices and payments into /v1/sales-invoices and /v1/payment-entries.",
    keyword: "quickbooks integration",
    category: "Compliance",
    problem:
      "Finance teams double-key invoices between QuickBooks and their operating system, and cash reporting is always a week behind.",
    solution:
      "OAuth into QuickBooks Online, poll the Invoice and Payment endpoints, and upsert into /v1/sales-invoices and /v1/payment-entries.",
    benefits: [
      "Pull QuickBooks invoices → /v1/sales-invoices",
      "Payments landing in QuickBooks mirror to /v1/payment-entries",
      "COA + tax codes mapped one-time during setup"
    ],
    useCases: [
      "QuickBooks Invoice → /v1/sales-invoices with tax breakout",
      "QuickBooks Payment → /v1/payment-entries reconciled",
      "Journal entries synced to /v1/journal-entries"
    ],
    faqs: [
      {
        q: "QuickBooks Online or Desktop?",
        a: "Online. Desktop (QBD) can export IIF, which Zivvy can import via /v1/sales-invoices bulk endpoint."
      },
      {
        q: "Is the sync bidirectional?",
        a: "Yes. New Zivvy invoices push back to QuickBooks after configurable approval gates."
      }
    ],
    ctaLabel: "Connect QuickBooks",
    ctaHref: "/contact",
    apiEndpoints: [
      "POST /v1/sales-invoices",
      "GET /v1/sales-invoices",
      "POST /v1/payment-entries",
      "POST /v1/journal-entries"
    ],
    webhookEvents: [
      "sales-invoices.submitted",
      "payment-entries.paid",
      "journal-entries.submitted"
    ],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Sales-Invoices",
    codeExamples: [
      {
        language: "curl",
        label: "Import a QuickBooks invoice",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/sales-invoices \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer": "Acme Corp",
    "external_id": "qbo-inv-101",
    "posting_date": "2026-07-24",
    "items": [{ "item_code": "SVC-CONS", "qty": 4, "rate": 250 }]
  }'`
      },
      {
        language: "javascript",
        label: "Poll QBO and upsert",
        code: `import { getQBO, getZivvy } from "./clients";

export async function syncInvoices(sinceISO) {
  const qbo = await getQBO();
  const zv = getZivvy();
  const invoices = await qbo.query(
    \`select * from Invoice where MetaData.LastUpdatedTime > '\${sinceISO}'\`
  );
  for (const inv of invoices.QueryResponse.Invoice) {
    await zv.salesInvoices.upsert({
      external_id: \`qbo-\${inv.Id}\`,
      customer: inv.CustomerRef.name,
      posting_date: inv.TxnDate,
      items: inv.Line
        .filter(l => l.DetailType === "SalesItemLineDetail")
        .map(l => ({
          item_code: l.SalesItemLineDetail.ItemRef.name,
          qty: l.SalesItemLineDetail.Qty,
          rate: l.SalesItemLineDetail.UnitPrice
        }))
    });
  }
}`
      }
    ]
  },
  {
    slug: "xero",
    title: "Xero",
    description:
      "Reconcile Xero AP and AR against Zivvy /v1/purchase-invoices and /v1/sales-invoices.",
    keyword: "xero integration",
    category: "Compliance",
    problem:
      "Bookkeepers post AP and AR in Xero while operations run in another system, so reconciliation is always a manual join.",
    solution:
      "Zivvy syncs both directions of Xero AP (Bills) and AR (Invoices) into /v1/purchase-invoices and /v1/sales-invoices, keyed by Xero's InvoiceID.",
    benefits: [
      "Two-way AR sync via /v1/sales-invoices",
      "Two-way AP sync via /v1/purchase-invoices",
      "Xero bank feed reconciled against /v1/payment-entries"
    ],
    useCases: [
      "Xero Bill → /v1/purchase-invoices",
      "Xero Invoice → /v1/sales-invoices",
      "Xero payment reconciles to /v1/payment-entries"
    ],
    faqs: [
      {
        q: "Which Xero region?",
        a: "All regions. Zivvy handles per-tenant tax registration and multi-currency invoicing."
      },
      {
        q: "Do we need Xero Premium?",
        a: "No. Any Xero plan that exposes the API (Starter and above) works."
      }
    ],
    ctaLabel: "Connect Xero",
    ctaHref: "/contact",
    apiEndpoints: [
      "POST /v1/sales-invoices",
      "POST /v1/purchase-invoices",
      "POST /v1/payment-entries"
    ],
    webhookEvents: [
      "sales-invoices.submitted",
      "purchase-invoices.submitted",
      "payment-entries.paid"
    ],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Purchase-Invoices",
    codeExamples: [
      {
        language: "curl",
        label: "Post a Xero bill",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/purchase-invoices \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "supplier": "AWS",
    "external_id": "xero-bill-1234",
    "bill_no": "AWS-INV-2026-07",
    "items": [{ "item_code": "CLOUD-USAGE", "qty": 1, "rate": 4210.55 }]
  }'`
      },
      {
        language: "typescript",
        label: "Bridge Xero webhook",
        code: `import { XeroClient } from "xero-node";
import { zivvy } from "./zivvy-client";

export async function onXeroInvoiceUpdated(evt) {
  const inv = await xero.accountingApi.getInvoice(
    evt.tenantId, evt.resourceId
  );
  await zivvy.salesInvoices.upsert({
    external_id: \`xero-\${inv.body.invoices[0].invoiceID}\`,
    customer: inv.body.invoices[0].contact.name,
    posting_date: inv.body.invoices[0].date
  });
}`
      }
    ]
  },
  {
    slug: "datev",
    title: "DATEV",
    description:
      "Export Zivvy journal entries to DATEV-ready CSV for German tax accountants.",
    keyword: "datev export erp",
    category: "Compliance",
    problem:
      "German finance teams still hand-off month-end books to their Steuerberater via emailed CSV that never matches DATEV Rechnungswesen.",
    solution:
      "The erpnext-datev add-on ships DATEV-compliant CSV exports of /v1/journal-entries, /v1/sales-invoices, and /v1/purchase-invoices.",
    benefits: [
      "DATEV Buchungsstapel export for every posting period",
      "Skonto, USt-ID, and Kostenstelle columns respected",
      "Debitoren + Kreditoren master export in a single click"
    ],
    useCases: [
      "Month-end DATEV Buchungsstapel export",
      "Debitoren/Kreditoren master export for Steuerberater",
      "USt-Voranmeldung reporting pack"
    ],
    faqs: [
      {
        q: "SKR03 or SKR04?",
        a: "Both. The add-on ships mapping presets for SKR03, SKR04, and IKR."
      },
      {
        q: "Is this GoBD compliant?",
        a: "The exports match DATEV's specification, but final GoBD sign-off remains with your Steuerberater."
      }
    ],
    ctaLabel: "Install add-on",
    ctaHref: "/contact",
    addonRequired: "erpnext-datev",
    addonPrice: "$19/mo",
    apiEndpoints: [
      "GET /v1/journal-entries",
      "GET /v1/sales-invoices",
      "GET /v1/purchase-invoices",
      "GET /v1/exports/datev"
    ],
    webhookEvents: ["exports.datev.ready"],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Exports",
    codeExamples: [
      {
        language: "curl",
        label: "Trigger DATEV export",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/exports/datev \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from_date": "2026-07-01",
    "to_date": "2026-07-31",
    "kontenrahmen": "SKR04"
  }'`
      },
      {
        language: "python",
        label: "Download the CSV",
        code: `import requests

exp = requests.post(
    "https://integrate.zivvy.xyz/v1/exports/datev",
    headers={"Authorization": f"Bearer {ZIVVY_API_KEY}"},
    json={"from_date": "2026-07-01", "to_date": "2026-07-31", "kontenrahmen": "SKR04"},
).json()

csv = requests.get(exp["download_url"]).text
open("datev-buchungsstapel.csv", "w").write(csv)`
      }
    ]
  },
  {
    slug: "digital-signer",
    title: "Digital Signer",
    description:
      "Sign quotations, sales orders, and invoices as PDF/A with a legally binding hash chain.",
    keyword: "erp document signing",
    category: "Compliance",
    problem:
      "Sending PDFs to DocuSign for each quote adds friction and cost, and the signed doc rarely finds its way back to the ERP record.",
    solution:
      "The digital-signer add-on signs the PDF inline against /v1/quotations, /v1/sales-orders, and /v1/sales-invoices, and stores the signed PDF/A + hash back on the record.",
    benefits: [
      "Sign inline from Quotation, Sales Order, and Sales Invoice",
      "PDF/A output with embedded hash chain",
      "signatures.completed webhook fires the follow-up workflow"
    ],
    useCases: [
      "Sign a /v1/quotations PDF and email to the customer",
      "Bulk-sign month-end /v1/sales-invoices",
      "Countersign supplier /v1/purchase-orders"
    ],
    faqs: [
      {
        q: "Which signature standard?",
        a: "PAdES B-LT, valid under eIDAS. Certificates can be Zivvy-provided or your own PKI."
      },
      {
        q: "Do recipients need an account?",
        a: "No. The signed PDF is emailed and verifiable on any PDF/A viewer."
      }
    ],
    ctaLabel: "Install add-on",
    ctaHref: "/contact",
    addonRequired: "digital-signer",
    addonPrice: "$15/mo",
    apiEndpoints: [
      "POST /v1/signatures",
      "GET /v1/signatures/{id}",
      "POST /v1/quotations/{id}/sign",
      "POST /v1/sales-invoices/{id}/sign"
    ],
    webhookEvents: [
      "signatures.completed",
      "signatures.declined",
      "signatures.expired"
    ],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Signatures",
    codeExamples: [
      {
        language: "curl",
        label: "Sign a quotation",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/quotations/SAL-QTN-2026-0001/sign \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "signer_email": "cfo@acme.com",
    "signer_name": "Alex Chen",
    "notify": true
  }'`
      },
      {
        language: "javascript",
        label: "Wait for completion",
        code: `import { zivvy } from "./zivvy-client";

const sig = await zivvy.signatures.create({
  doctype: "Sales Invoice",
  name: "SAL-INV-2026-0042",
  signer_email: "cfo@acme.com"
});

zivvy.webhooks.on("signatures.completed", async ({ signature_id }) => {
  if (signature_id === sig.id) {
    // signed PDF is stored under /v1/attachments
  }
});`
      }
    ]
  },
  {
    slug: "payments-processor",
    title: "Payments Processor",
    description:
      "Run bulk supplier payment files (SEPA, ACH, NACHA) directly from /v1/payment-entries.",
    keyword: "bulk payment run erp",
    category: "Payments",
    problem:
      "AP teams manually export bank files from spreadsheets each week, and there is no audit link from the file back to individual invoices.",
    solution:
      "The payments-processor add-on groups approved /v1/payment-entries into a payment run and emits SEPA XML, NACHA, or ACH files with per-invoice traceability.",
    benefits: [
      "Batch approved /v1/payment-entries into a single payment run",
      "SEPA pain.001, NACHA, and ACH file generation",
      "Two-eyes approval + full audit trail per run"
    ],
    useCases: [
      "Weekly supplier payment run to bank",
      "Batch payroll disbursement",
      "Refund runs to customers via ACH"
    ],
    faqs: [
      {
        q: "Which file formats?",
        a: "SEPA pain.001.001.09, US NACHA PPD/CCD, and generic ACH CSV."
      },
      {
        q: "Is dual approval required?",
        a: "Yes. The add-on enforces maker-checker with configurable thresholds."
      }
    ],
    ctaLabel: "Install add-on",
    ctaHref: "/contact",
    addonRequired: "payments-processor",
    addonPrice: "$25/mo",
    apiEndpoints: [
      "POST /v1/payment-runs",
      "POST /v1/payment-runs/{id}/approve",
      "POST /v1/payment-runs/{id}/export",
      "GET /v1/payment-entries"
    ],
    webhookEvents: [
      "payment-runs.created",
      "payment-runs.approved",
      "payment-runs.exported"
    ],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Payments",
    codeExamples: [
      {
        language: "curl",
        label: "Create a payment run",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/payment-runs \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "bank_account": "Deutsche Bank - EUR",
    "payment_entries": ["PAY-2026-0101", "PAY-2026-0102"],
    "value_date": "2026-07-30"
  }'`
      },
      {
        language: "python",
        label: "Export SEPA pain.001",
        code: `import requests

run = requests.post(
    "https://integrate.zivvy.xyz/v1/payment-runs/RUN-2026-0007/export",
    headers={"Authorization": f"Bearer {ZIVVY_API_KEY}"},
    json={"format": "sepa_pain_001_09"},
).json()

pain = requests.get(run["download_url"]).content
open("sepa-2026-07-30.xml", "wb").write(pain)`
      }
    ]
  },
  {
    slug: "twilio",
    title: "Twilio",
    description:
      "Send SMS on invoice.submitted, order shipments, and delivery reminders using Twilio.",
    keyword: "twilio sms erp",
    category: "Communication",
    problem:
      "Customers pay faster when they get an SMS with the invoice link, but wiring one up per template is tedious.",
    solution:
      "Subscribe to sales-invoices.submitted (and other events) and let a Twilio-backed webhook consumer send the SMS.",
    benefits: [
      "Send SMS on sales-invoices.submitted with pay link",
      "Delivery updates on delivery-notes.submitted",
      "OTP for high-value payment reconciliation"
    ],
    useCases: [
      "SMS pay-link when sales-invoices.submitted fires",
      "SMS shipment ETA on delivery-notes.submitted",
      "Two-factor OTP for /v1/payment-entries above threshold"
    ],
    faqs: [
      {
        q: "Is a Zivvy Twilio account required?",
        a: "No. You bring your Twilio account SID + auth token to your webhook consumer."
      },
      {
        q: "Where does the pay link come from?",
        a: "The sales-invoices.submitted payload carries a portal_url field with a signed short-lived pay page."
      }
    ],
    ctaLabel: "Configure webhook",
    ctaHref: "/settings/developer",
    apiEndpoints: [
      "POST /v1/webhook-subscriptions",
      "GET /v1/sales-invoices/{name}",
      "GET /v1/delivery-notes/{name}"
    ],
    webhookEvents: [
      "sales-invoices.submitted",
      "delivery-notes.submitted",
      "payment-entries.paid"
    ],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Webhooks",
    codeExamples: [
      {
        language: "curl",
        label: "Register Twilio webhook",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/webhook-subscriptions \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "target_url": "https://api.your-app.com/hooks/zivvy-twilio",
    "events": ["sales-invoices.submitted"]
  }'`
      },
      {
        language: "javascript",
        label: "Twilio consumer",
        code: `import twilio from "twilio";

const sms = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

export async function POST(req) {
  const evt = await req.json();
  if (evt.event !== "sales-invoices.submitted") return new Response("skip");
  await sms.messages.create({
    from: process.env.TWILIO_FROM,
    to: evt.data.contact_phone,
    body: \`Invoice \${evt.data.name} is ready: \${evt.data.portal_url}\`
  });
  return new Response("ok");
}`
      }
    ]
  },
  {
    slug: "postmark",
    title: "Postmark",
    description:
      "Deliver transactional emails on quotations.sent and sales-invoices.paid via Postmark.",
    keyword: "postmark transactional email",
    category: "Communication",
    problem:
      "Zivvy's built-in SMTP is fine for daily notifications, but transactional deliverability (quotes, receipts) belongs on a proper ESP.",
    solution:
      "Forward quotations.sent and sales-invoices.paid events to a Postmark server; templates render with the event payload verbatim.",
    benefits: [
      "Postmark templates for quote, invoice, and receipt emails",
      "Automatic reply-tracking piped back into /v1/contacts",
      "Bounce + spam events open a task on the account owner"
    ],
    useCases: [
      "Send quote via Postmark on quotations.sent",
      "Send receipt via Postmark on sales-invoices.paid",
      "Send dunning reminder on sales-invoices.overdue"
    ],
    faqs: [
      {
        q: "Do we lose in-Zivvy email history?",
        a: "No. Zivvy still records the outbound send on the /v1/communications timeline."
      },
      {
        q: "Can we mix Postmark with built-in email?",
        a: "Yes. Route by event slug in your webhook consumer."
      }
    ],
    ctaLabel: "Configure webhook",
    ctaHref: "/settings/developer",
    apiEndpoints: [
      "POST /v1/webhook-subscriptions",
      "GET /v1/quotations/{name}",
      "GET /v1/sales-invoices/{name}"
    ],
    webhookEvents: [
      "quotations.sent",
      "sales-invoices.paid",
      "sales-invoices.overdue"
    ],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Webhooks",
    codeExamples: [
      {
        language: "curl",
        label: "Subscribe Postmark consumer",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/webhook-subscriptions \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "target_url": "https://api.your-app.com/hooks/postmark",
    "events": ["quotations.sent", "sales-invoices.paid"]
  }'`
      },
      {
        language: "javascript",
        label: "Send with Postmark template",
        code: `import { ServerClient } from "postmark";

const pm = new ServerClient(process.env.POSTMARK_TOKEN);

export async function POST(req) {
  const evt = await req.json();
  if (evt.event === "sales-invoices.paid") {
    await pm.sendEmailWithTemplate({
      From: "billing@zivvy.xyz",
      To: evt.data.customer_email,
      TemplateAlias: "receipt",
      TemplateModel: { invoice: evt.data }
    });
  }
  return new Response("ok");
}`
      }
    ]
  },
  {
    slug: "github",
    title: "GitHub",
    description:
      "Turn GitHub issues and workflow failures into Zivvy /v1/support-tickets automatically.",
    keyword: "github erp integration",
    category: "Developer",
    problem:
      "Customer bug reports open in GitHub Issues, but support and CS teams never see them until an engineer replies.",
    solution:
      "A GitHub webhook (issues, workflow_run) hits your consumer and creates /v1/support-tickets in Zivvy with the right customer and severity.",
    benefits: [
      "GitHub Issue → /v1/support-tickets with severity + owner",
      "workflow_run failure → /v1/support-tickets for on-call",
      "Issue closed → ticket closed with resolution note"
    ],
    useCases: [
      "External bug report on GitHub → /v1/support-tickets",
      "CI failure → /v1/support-tickets triaged to platform team",
      "Release deploy → note attached to a /v1/projects milestone"
    ],
    faqs: [
      {
        q: "Public or private repos?",
        a: "Both. GitHub Apps and PATs both work with the outbound webhook consumer."
      },
      {
        q: "Do we get bidirectional comments?",
        a: "Yes. Adding a comment to the ticket in Zivvy posts back to the GitHub Issue thread."
      }
    ],
    ctaLabel: "Configure webhook",
    ctaHref: "/settings/developer",
    apiEndpoints: [
      "POST /v1/support-tickets",
      "PATCH /v1/support-tickets/{name}",
      "POST /v1/communications"
    ],
    webhookEvents: [
      "support-tickets.created",
      "support-tickets.replied",
      "support-tickets.resolved"
    ],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Support-Tickets",
    codeExamples: [
      {
        language: "curl",
        label: "Create ticket from GitHub Issue",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/support-tickets \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "subject": "[bug] checkout returns 500",
    "raised_by": "user@acme.com",
    "external_id": "gh-issue-12345",
    "priority": "High"
  }'`
      },
      {
        language: "javascript",
        label: "GitHub webhook consumer",
        code: `import { zivvy } from "./zivvy-client";

export async function POST(req) {
  const evt = await req.json();
  if (evt.action === "opened" && evt.issue) {
    await zivvy.supportTickets.create({
      external_id: \`gh-\${evt.issue.number}\`,
      subject: evt.issue.title,
      raised_by: evt.issue.user.login,
      priority: evt.issue.labels.some(l => l.name === "P0") ? "Urgent" : "Medium"
    });
  }
  return new Response("ok");
}`
      }
    ]
  },
  {
    slug: "notion",
    title: "Notion",
    description:
      "Mirror Zivvy Projects and Tasks into a Notion database for cross-team visibility.",
    keyword: "notion erp integration",
    category: "Communication",
    problem:
      "Product and design read Notion, but operations run in Zivvy — nobody has a single source of truth on delivery.",
    solution:
      "Sync /v1/projects and /v1/tasks into a Notion database with two-way updates and status roll-ups.",
    benefits: [
      "/v1/projects + /v1/tasks mirrored into Notion DB",
      "Two-way updates on assignee, status, due date",
      "Rollups back to Zivvy for weekly reporting"
    ],
    useCases: [
      "New /v1/projects → Notion row created",
      "Notion status change → PATCH /v1/tasks",
      "Zivvy tasks.overdue → Notion callout on the parent page"
    ],
    faqs: [
      {
        q: "Which Notion plan?",
        a: "Any paid plan with the Public API enabled works. Free workspaces are read-only in Notion's API."
      },
      {
        q: "Do subtasks sync?",
        a: "Yes. Sub-tasks map to child rows in the same Notion database."
      }
    ],
    ctaLabel: "Configure integration",
    ctaHref: "/contact",
    apiEndpoints: [
      "GET /v1/projects",
      "POST /v1/projects",
      "PATCH /v1/tasks/{name}",
      "POST /v1/webhook-subscriptions"
    ],
    webhookEvents: [
      "projects.created",
      "tasks.created",
      "tasks.updated",
      "tasks.completed"
    ],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Projects",
    codeExamples: [
      {
        language: "curl",
        label: "Fetch tasks for Notion sync",
        code: `curl "https://integrate.zivvy.xyz/v1/tasks?project=PROJ-2026-0007" \\
  -H "Authorization: Bearer $ZIVVY_API_KEY"`
      },
      {
        language: "javascript",
        label: "Upsert into Notion",
        code: `import { Client } from "@notionhq/client";
import { zivvy } from "./zivvy-client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export async function sync(projectName) {
  const tasks = await zivvy.tasks.list({ project: projectName });
  for (const t of tasks) {
    await notion.pages.create({
      parent: { database_id: process.env.NOTION_DB },
      properties: {
        Name: { title: [{ text: { content: t.subject } }] },
        Status: { select: { name: t.status } },
        Owner: { people: [] },
        Due: t.due_date ? { date: { start: t.due_date } } : undefined
      }
    });
  }
}`
      }
    ]
  },
  {
    slug: "airtable",
    title: "Airtable",
    description:
      "Bidirectional item catalog sync between Airtable bases and Zivvy /v1/items.",
    keyword: "airtable erp integration",
    category: "Communication",
    problem:
      "Merchandising teams manage the item catalog in Airtable, but every launch requires re-keying every SKU into the ERP.",
    solution:
      "Two-way sync of Airtable records into /v1/items via the Airtable REST API and Zivvy webhook events on items.updated.",
    benefits: [
      "Airtable base → /v1/items with UOM, tax, and price list",
      "Zivvy items.updated → Airtable row updates",
      "Bulk upload via CSV attachment on a base view"
    ],
    useCases: [
      "New Airtable row → /v1/items with unit, tax, and price list",
      "Zivvy items.updated → Airtable field update",
      "Airtable form → new /v1/items request"
    ],
    faqs: [
      {
        q: "Which Airtable plan?",
        a: "Any plan with API access. Sync respects Airtable's per-plan rate limits."
      },
      {
        q: "Which side wins on conflict?",
        a: "The side with the later updated_at, and every write logs to the /v1/version-history for audit."
      }
    ],
    ctaLabel: "Configure integration",
    ctaHref: "/contact",
    apiEndpoints: [
      "GET /v1/items",
      "POST /v1/items",
      "PATCH /v1/items/{name}",
      "POST /v1/webhook-subscriptions"
    ],
    webhookEvents: ["items.created", "items.updated", "items.deleted"],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Items",
    codeExamples: [
      {
        language: "curl",
        label: "Upsert item from Airtable",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/items \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "item_code": "SKU-042",
    "item_name": "Ceramic Mug",
    "stock_uom": "Nos",
    "standard_rate": 12.5,
    "external_id": "airtable-recABC"
  }'`
      },
      {
        language: "python",
        label: "Bidirectional sync",
        code: `import os, requests
from pyairtable import Api

air = Api(os.environ["AIRTABLE_TOKEN"])
table = air.table("appXXXX", "Items")

for rec in table.all():
    requests.post(
        "https://integrate.zivvy.xyz/v1/items",
        headers={"Authorization": f"Bearer {os.environ['ZIVVY_API_KEY']}"},
        json={
            "item_code": rec["fields"]["SKU"],
            "item_name": rec["fields"]["Name"],
            "standard_rate": rec["fields"].get("Price", 0),
            "external_id": rec["id"],
        },
    ).raise_for_status()`
      }
    ]
  },
  {
    slug: "google-sheets",
    title: "Google Sheets",
    description:
      "Two-way sync between Google Sheets and /v1/... resources via a Zap or Apps Script.",
    keyword: "google sheets erp",
    category: "Communication",
    problem:
      "Finance and ops keep dropping spreadsheets on top of the ERP; there is no clean way to keep a live sheet in sync with the operating record.",
    solution:
      "Use a Zap or a small Apps Script to push spreadsheet rows into Zivvy /v1/... endpoints, and let webhook events flow back into new sheet rows.",
    benefits: [
      "Any /v1/... resource as a Sheets tab",
      "New Zivvy record → new row via webhook subscription",
      "Sheet edits → PATCH /v1/... via Apps Script"
    ],
    useCases: [
      "Weekly AR aging exported to Google Sheets",
      "Sheet-driven bulk PATCH on /v1/items",
      "New /v1/sales-orders → row on the sales dashboard tab"
    ],
    faqs: [
      {
        q: "Do we need a paid Workspace?",
        a: "No. Personal Gmail works, but Apps Script quotas are lower."
      },
      {
        q: "Zap or Apps Script?",
        a: "Zap is fastest to set up; Apps Script gives more control for high-frequency sync."
      }
    ],
    ctaLabel: "Configure integration",
    ctaHref: "/settings/developer",
    apiEndpoints: [
      "GET /v1/sales-orders",
      "POST /v1/sales-orders",
      "PATCH /v1/items/{name}",
      "POST /v1/webhook-subscriptions"
    ],
    webhookEvents: [
      "sales-orders.submitted",
      "items.updated",
      "sales-invoices.paid"
    ],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Webhooks",
    codeExamples: [
      {
        language: "curl",
        label: "Register the sheet's webhook",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/webhook-subscriptions \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "target_url": "https://script.google.com/macros/s/AKfycb.../exec",
    "events": ["sales-orders.submitted"]
  }'`
      },
      {
        language: "javascript",
        label: "Apps Script consumer",
        code: `function doPost(e) {
  const evt = JSON.parse(e.postData.contents);
  if (evt.event === "sales-orders.submitted") {
    const sheet = SpreadsheetApp
      .getActive()
      .getSheetByName("Sales Orders");
    sheet.appendRow([
      evt.data.name,
      evt.data.customer,
      evt.data.grand_total,
      evt.data.transaction_date
    ]);
  }
  return ContentService.createTextOutput("ok");
}`
      }
    ]
  },
  {
    slug: "segment",
    title: "Segment",
    description:
      "Emit Zivvy events into Segment as canonical track() calls (invoice.paid, order.submitted).",
    keyword: "segment cdp integration",
    category: "Analytics",
    problem:
      "Product analytics teams have to hand-wire every finance event into Segment, and the naming drifts within a quarter.",
    solution:
      "A webhook consumer forwards Zivvy events into Segment's track() with the canonical name (Invoice Paid, Sales Order Submitted, …).",
    benefits: [
      "One canonical event catalog for CDP + ERP",
      "Track properties carry the /v1/... external_id",
      "Segment destinations propagate to every downstream analytics tool"
    ],
    useCases: [
      "sales-invoices.paid → track('Invoice Paid') in Segment",
      "sales-orders.submitted → track('Sales Order Submitted')",
      "customers.created → identify() with Zivvy customer id"
    ],
    faqs: [
      {
        q: "Do we need Segment Business tier?",
        a: "No. Any tier with a valid write key works. Reverse-ETL from Segment back to Zivvy is on the roadmap."
      },
      {
        q: "How do we avoid double-count?",
        a: "Use the event's zivvy_event_id as the messageId in track() — Segment deduplicates on that."
      }
    ],
    ctaLabel: "Configure webhook",
    ctaHref: "/settings/developer",
    apiEndpoints: [
      "POST /v1/webhook-subscriptions",
      "GET /v1/sales-invoices",
      "GET /v1/customers"
    ],
    webhookEvents: [
      "sales-invoices.paid",
      "sales-orders.submitted",
      "customers.created"
    ],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Webhooks",
    codeExamples: [
      {
        language: "curl",
        label: "Subscribe Segment consumer",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/webhook-subscriptions \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "target_url": "https://api.your-app.com/hooks/segment",
    "events": ["sales-invoices.paid", "sales-orders.submitted"]
  }'`
      },
      {
        language: "javascript",
        label: "Consumer -> Segment",
        code: `import { Analytics } from "@segment/analytics-node";

const seg = new Analytics({ writeKey: process.env.SEGMENT_WRITE_KEY });

export async function POST(req) {
  const evt = await req.json();
  if (evt.event === "sales-invoices.paid") {
    seg.track({
      messageId: evt.id,
      userId: evt.data.customer,
      event: "Invoice Paid",
      properties: {
        invoice: evt.data.name,
        amount: evt.data.grand_total
      }
    });
  }
  return new Response("ok");
}`
      }
    ]
  },
  {
    slug: "posthog",
    title: "PostHog",
    description:
      "Capture Zivvy webhook events into PostHog for funnels, cohorts, and retention analysis.",
    keyword: "posthog integration",
    category: "Analytics",
    problem:
      "Growth teams can see product events in PostHog and revenue in the ERP, but never both together — so activation-to-revenue funnels are guesses.",
    solution:
      "Forward sales-invoices.paid, sales-orders.submitted, and quotations.sent to PostHog capture() so funnels see finance events alongside product events.",
    benefits: [
      "PostHog capture() for finance + ops events",
      "Funnels from product signup → sales-orders.submitted → sales-invoices.paid",
      "Cohorts by customer_group from /v1/customers"
    ],
    useCases: [
      "Funnel: signup → first order → first payment",
      "Cohort of high-value /v1/customers on retention curve",
      "Alert on drop in sales-orders.submitted week-over-week"
    ],
    faqs: [
      {
        q: "Cloud or self-hosted?",
        a: "Both. The consumer only needs the POSTHOG_HOST + POSTHOG_KEY."
      },
      {
        q: "Do we lose PII protection?",
        a: "No. The consumer strips PII fields before capture() using an allow-list."
      }
    ],
    ctaLabel: "Configure webhook",
    ctaHref: "/settings/developer",
    apiEndpoints: [
      "POST /v1/webhook-subscriptions",
      "GET /v1/customers",
      "GET /v1/sales-invoices"
    ],
    webhookEvents: [
      "sales-invoices.paid",
      "sales-orders.submitted",
      "quotations.sent"
    ],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Webhooks",
    codeExamples: [
      {
        language: "curl",
        label: "Subscribe PostHog consumer",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/webhook-subscriptions \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "target_url": "https://api.your-app.com/hooks/posthog",
    "events": ["sales-invoices.paid", "sales-orders.submitted"]
  }'`
      },
      {
        language: "javascript",
        label: "PostHog capture()",
        code: `import { PostHog } from "posthog-node";

const ph = new PostHog(process.env.POSTHOG_KEY, {
  host: process.env.POSTHOG_HOST
});

export async function POST(req) {
  const evt = await req.json();
  ph.capture({
    distinctId: evt.data.customer,
    event: evt.event,
    properties: {
      amount: evt.data.grand_total,
      currency: evt.data.currency
    }
  });
  return new Response("ok");
}`
      }
    ]
  },
  {
    slug: "rest-api",
    title: "REST API",
    description:
      "Custom REST integration against 130+ endpoints at integrate.zivvy.xyz/docs.",
    keyword: "zivvy rest api",
    category: "Developer",
    problem:
      "Every business is a little different, and no pre-built integration will cover the fifth-nine edge case you actually care about.",
    solution:
      "The Zivvy REST API exposes 130+ resource endpoints under integrate.zivvy.xyz/v1/... with OpenAPI 3.1, cursor pagination, and per-request idempotency.",
    benefits: [
      "130+ REST endpoints under /v1/...",
      "OpenAPI 3.1 schema + auto-generated SDK stubs",
      "Idempotency-Key support on every mutating call"
    ],
    useCases: [
      "Internal tool integrating with /v1/customers + /v1/sales-orders",
      "Backfill job hitting bulk /v1/items",
      "One-off script that reconciles /v1/payment-entries"
    ],
    faqs: [
      {
        q: "Where do I generate an API key?",
        a: "Settings → Developer → API Keys. Scopes are per-resource and per-verb."
      },
      {
        q: "Is there a Postman collection?",
        a: "Yes. Download it from integrate.zivvy.xyz/docs (top-right menu)."
      }
    ],
    ctaLabel: "Read API docs",
    ctaHref: "/settings/developer",
    apiEndpoints: [
      "GET /v1/customers",
      "POST /v1/sales-orders",
      "POST /v1/sales-invoices",
      "GET /v1/reports/{report}"
    ],
    webhookEvents: [
      "customers.created",
      "sales-orders.submitted",
      "sales-invoices.paid"
    ],
    docsUrl: "https://integrate.zivvy.xyz/docs",
    codeExamples: [
      {
        language: "curl",
        label: "List sales orders",
        code: `curl "https://integrate.zivvy.xyz/v1/sales-orders?limit=25&status=Submitted" \\
  -H "Authorization: Bearer $ZIVVY_API_KEY"`
      },
      {
        language: "typescript",
        label: "Typed SDK usage",
        code: `import Zivvy from "@zivvy/node";

const zivvy = new Zivvy({ apiKey: process.env.ZIVVY_API_KEY });

const orders = await zivvy.salesOrders.list({
  status: "Submitted",
  limit: 25
});

for (const so of orders.data) {
  console.log(so.name, so.grand_total);
}`
      },
      {
        language: "python",
        label: "Requests + pagination",
        code: `import os, requests

url = "https://integrate.zivvy.xyz/v1/sales-orders"
headers = {"Authorization": f"Bearer {os.environ['ZIVVY_API_KEY']}"}
cursor = None

while True:
    params = {"limit": 100}
    if cursor: params["cursor"] = cursor
    r = requests.get(url, headers=headers, params=params).json()
    for so in r["data"]:
        print(so["name"], so["grand_total"])
    cursor = r.get("next_cursor")
    if not cursor: break`
      }
    ]
  },
  {
    slug: "webhooks",
    title: "Webhooks",
    description:
      "Subscribe to 100+ Zivvy events with HMAC-SHA256 signed, retry-safe deliveries.",
    keyword: "zivvy webhooks",
    category: "Developer",
    problem:
      "Polling for record changes is slow, expensive, and always missing the edge case you care about.",
    solution:
      "Register a webhook subscription against 100+ events; every delivery is HMAC-SHA256 signed with your secret and retries with exponential backoff for 24 hours.",
    benefits: [
      "100+ typed event slugs (sales-orders.submitted, payment-entries.paid, ...)",
      "HMAC-SHA256 signature via X-Zivvy-Signature header",
      "Exponential retries for 24h + per-event delivery log"
    ],
    useCases: [
      "Ship a payload only when sales-invoices.submitted actually fires",
      "Chain Zivvy → Slack → PagerDuty for on-call alerts",
      "Warehouse ingest that mirrors every /v1/... row change"
    ],
    faqs: [
      {
        q: "How do I verify a payload?",
        a: "Recompute HMAC-SHA256 over the raw body using your subscription secret; compare with the X-Zivvy-Signature header in constant time."
      },
      {
        q: "What is the retry policy?",
        a: "Immediate, then 1m, 5m, 30m, 1h, 6h, 24h. After that the delivery is marked failed and surfaced in the delivery log."
      }
    ],
    ctaLabel: "Read webhook docs",
    ctaHref: "/settings/developer",
    apiEndpoints: [
      "POST /v1/webhook-subscriptions",
      "GET /v1/webhook-subscriptions",
      "DELETE /v1/webhook-subscriptions/{id}",
      "GET /v1/webhook-deliveries"
    ],
    webhookEvents: [
      "customers.created",
      "sales-orders.submitted",
      "sales-invoices.paid",
      "payment-entries.paid",
      "stock-entries.submitted"
    ],
    docsUrl: "https://integrate.zivvy.xyz/docs#tag/Webhooks",
    codeExamples: [
      {
        language: "curl",
        label: "Register a subscription",
        code: `curl -X POST https://integrate.zivvy.xyz/v1/webhook-subscriptions \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "target_url": "https://api.your-app.com/hooks/zivvy",
    "events": ["sales-invoices.paid", "sales-orders.submitted"],
    "secret": "whsec_..."
  }'`
      },
      {
        language: "javascript",
        label: "Verify + handle",
        code: `import crypto from "crypto";

function verify(rawBody, signature, secret) {
  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(signature)
  );
}

export async function POST(req) {
  const raw = await req.text();
  const ok = verify(raw, req.headers.get("x-zivvy-signature"), process.env.WHSEC);
  if (!ok) return new Response("bad signature", { status: 401 });
  const evt = JSON.parse(raw);
  // ...handle evt.event
  return new Response("ok");
}`
      },
      {
        language: "python",
        label: "Verify in Python",
        code: `import hmac, hashlib

def verify(raw: bytes, signature: str, secret: str) -> bool:
    digest = hmac.new(secret.encode(), raw, hashlib.sha256).hexdigest()
    return hmac.compare_digest(digest, signature)`
      }
    ]
  }
];

export const compareDetails: CompareDetail[] = [
  {
    slug: "odoo",
    title: "Zivvy vs Odoo",
    description: "Compare Zivvy and Odoo on usability, pricing clarity, workflow focus, and speed to value.",
    keyword: "zivvy vs odoo",
    comparedAgainst: "Odoo",
    bestFit: [
      "Teams that want one clean UX without heavy module overhead",
      "Operators optimizing daily execution speed",
      "Companies that prefer transparent seat-based pricing"
    ],
    limitations: [
      "Zivvy is not a marketplace-style app ecosystem",
      "Highly bespoke edge cases may still require custom implementation"
    ],
    rows: [
      {
        capability: "Pricing model",
        zivvy: "Transparent seat-based plans",
        other: "Can vary with module combinations and packaging"
      },
      {
        capability: "Operator UX",
        zivvy: "Modern, focused workflows",
        other: "Powerful but can feel heavier for daily users"
      },
      {
        capability: "Time to first value",
        zivvy: "Fast startup with opinionated defaults",
        other: "Often needs deeper setup choices"
      },
      {
        capability: "Cross-functional visibility",
        zivvy: "Unified flow from sales to finance",
        other: "Depends on implementation depth and module coverage"
      }
    ],
    ctaLabel: "Start free and compare",
    ctaHref: "/login#signup"
  },
  {
    slug: "zoho",
    title: "Zivvy vs Zoho",
    description: "Evaluate Zivvy against Zoho for integrated operations, process control, and scale readiness.",
    keyword: "zivvy vs zoho",
    comparedAgainst: "Zoho",
    bestFit: [
      "Teams that want fewer disconnected product boundaries",
      "Operators needing stronger process discipline",
      "Businesses aligning finance and operations from one stack"
    ],
    limitations: [
      "Zivvy may require migration planning from broad Zoho app footprints",
      "Teams tied to specific niche apps may keep hybrid tooling initially"
    ],
    rows: [
      {
        capability: "System fragmentation",
        zivvy: "Unified operations workflow",
        other: "Broad app suite with varying integration depth"
      },
      {
        capability: "Workflow governance",
        zivvy: "Process-first controls and approvals",
        other: "Can require multiple product touchpoints"
      },
      {
        capability: "Operational reporting",
        zivvy: "Single ops and finance visibility layer",
        other: "Often distributed across app boundaries"
      },
      {
        capability: "Scale posture",
        zivvy: "Workflow depth grows by plan",
        other: "Depends on app combination and setup complexity"
      }
    ],
    ctaLabel: "See migration fit",
    ctaHref: "/alternatives/zoho"
  },
  {
    slug: "netsuite",
    title: "Zivvy vs NetSuite",
    description:
      "Compare Zivvy and NetSuite for implementation speed, usability, and practical operating control.",
    keyword: "zivvy vs netsuite",
    comparedAgainst: "NetSuite",
    bestFit: [
      "Growing teams that want enterprise-grade discipline without enterprise overhead",
      "Operators prioritizing adoption and speed",
      "Businesses seeking faster implementation cycles"
    ],
    limitations: [
      "Global enterprise edge scenarios may still require deeper customization",
      "Very complex legacy integration landscapes need phased rollout"
    ],
    rows: [
      {
        capability: "Implementation pace",
        zivvy: "Fast launch with guided defaults",
        other: "Typically longer implementation programs"
      },
      {
        capability: "User adoption curve",
        zivvy: "Modern and focused UX",
        other: "Powerful but often training-heavy"
      },
      {
        capability: "Operational agility",
        zivvy: "Quick workflow iteration",
        other: "Change cycles may be more involved"
      },
      {
        capability: "Cost predictability",
        zivvy: "Simple seat-based model",
        other: "Can include layered enterprise costs"
      }
    ],
    ctaLabel: "Talk rollout strategy",
    ctaHref: "/contact"
  }
];

export const alternativeDetails: AlternativeDetail[] = [
  {
    slug: "odoo",
    title: "Alternatives to Odoo",
    description:
      "Why teams consider alternatives to Odoo and how to migrate safely to Zivvy with minimal disruption.",
    keyword: "odoo alternatives",
    alternativeTo: "Odoo",
    whySwitch: [
      "Cleaner day-to-day UX for operators",
      "More predictable seat-based pricing",
      "Faster implementation with opinionated defaults"
    ],
    migrationSteps: [
      "Map current modules and critical workflows",
      "Import core masters and open transactions",
      "Run pilot with one team and validate KPIs",
      "Phase rollout by function with clear ownership"
    ],
    differences: [
      "Zivvy emphasizes execution speed and workflow clarity",
      "Odoo offers broad modularity that may need extra governance",
      "Migration usually starts with highest-friction operational areas"
    ],
    ctaLabel: "Plan Odoo migration",
    ctaHref: "/contact"
  },
  {
    slug: "zoho",
    title: "Alternatives to Zoho",
    description:
      "How to evaluate alternatives to Zoho and move to a unified operations stack with Zivvy.",
    keyword: "zoho alternatives",
    alternativeTo: "Zoho",
    whySwitch: [
      "Reduce app sprawl and context switching",
      "Improve cross-functional workflow accountability",
      "Align finance and operations on shared records"
    ],
    migrationSteps: [
      "Inventory Zoho apps currently in use",
      "Prioritize high-impact workflows for migration first",
      "Set role mapping and permission model in Zivvy",
      "Run staged cutover and monitor adoption metrics"
    ],
    differences: [
      "Zivvy is workflow-centric with unified operational context",
      "Zoho depth may be distributed across multiple products",
      "Migration should focus on business-critical flow first"
    ],
    ctaLabel: "Build migration plan",
    ctaHref: "/contact"
  },
  {
    slug: "legacy-erp",
    title: "Alternatives to Legacy ERP",
    description:
      "Replace legacy ERP friction with modern workflows, cleaner UX, and faster operational execution.",
    keyword: "legacy erp alternatives",
    alternativeTo: "Legacy ERP suites",
    whySwitch: [
      "Improve adoption across non-technical teams",
      "Reduce overhead for process change and reporting",
      "Shorten time-to-value for new workflows"
    ],
    migrationSteps: [
      "Identify highest-friction legacy processes",
      "Define target workflow states and owners",
      "Migrate foundational data and validate outputs",
      "Transition in waves with governance checkpoints"
    ],
    differences: [
      "Zivvy favors operator adoption and process clarity",
      "Legacy systems often require heavier change management",
      "Outcome-led migration reduces disruption risk"
    ],
    ctaLabel: "Discuss ERP replacement",
    ctaHref: "/contact"
  }
];

export const resourceCollections = [
  {
    title: "Guides",
    description: "Step-by-step operational guides for finance, sales, inventory, and team workflows.",
    href: "/resources#guides"
  },
  {
    title: "Templates",
    description: "Ready-to-use workflow templates for CRM, planning, onboarding, and reporting.",
    href: "/resources#templates"
  },
  {
    title: "Case studies",
    description: "Customer outcomes with implementation notes and measurable business impact.",
    href: "/resources#case-studies"
  },
  {
    title: "Webinars",
    description: "Recorded product walkthroughs, launch sessions, and operational deep dives.",
    href: "/resources#webinars"
  },
  {
    title: "Glossary",
    description: "Definitions for key operations, finance, and workflow terms teams use daily.",
    href: "/resources#glossary"
  },
  {
    title: "Research reports",
    description: "Practical benchmark and trend snapshots for growing operations teams.",
    href: "/resources#reports"
  }
];

export const featureBySlug = bySlug(featureDetails);
export const solutionBySlug = bySlug(solutionDetails);
export const useCaseBySlug = bySlug(useCaseDetails);
export const industryBySlug = bySlug(industryDetails);

for (const entry of integrationDetails) {
  const guide = guideForIntegration(entry.slug);
  if (!guide) continue;
  entry.maturity = guide.maturity;
  entry.realPath = guide.realPath;
  entry.setupSteps = guide.setupSteps;
  const maturityFaq = {
    q: "What is the maturity of this integration?",
    a: `${MATURITY_LABEL[guide.maturity]}. ${MATURITY_HINT[guide.maturity]} Real path: ${guide.realPath}`
  };
  const howFaq = {
    q: "How do I integrate this for real?",
    a: guide.setupSteps.map((step, i) => `${i + 1}. ${step}`).join(" ")
  };
  const existingQs = new Set(entry.faqs.map((f) => f.q));
  const extras: FaqItem[] = [];
  if (!existingQs.has(maturityFaq.q)) extras.push(maturityFaq);
  if (!existingQs.has(howFaq.q)) extras.push(howFaq);
  if (extras.length) entry.faqs = [...extras, ...entry.faqs];
}

export const integrationBySlug = bySlug(integrationDetails);
export const compareBySlug = bySlug(compareDetails);
export const alternativeBySlug = bySlug(alternativeDetails);

export const featureCards: HubCardItem[] = featureDetails.map(({ slug, title, description }) => ({
  slug,
  title,
  description
}));

export const solutionCards: HubCardItem[] = solutionDetails.map(({ slug, title, description }) => ({
  slug,
  title,
  description
}));

export const useCaseCards: HubCardItem[] = useCaseDetails.map(({ slug, title, description }) => ({
  slug,
  title,
  description
}));

export const industryCards: HubCardItem[] = industryDetails.map(({ slug, title, description }) => ({
  slug,
  title,
  description
}));

export const integrationCards: HubCardItem[] = integrationDetails.map(
  ({ slug, title, description, category, maturity }) => ({
    slug,
    title,
    description,
    category,
    maturity
  })
);

export const compareCards: HubCardItem[] = compareDetails.map(({ slug, title, description }) => ({
  slug,
  title,
  description
}));

export const alternativeCards: HubCardItem[] = alternativeDetails.map(({ slug, title, description }) => ({
  slug,
  title,
  description
}));
