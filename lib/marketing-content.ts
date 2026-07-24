export type FaqItem = {
  q: string;
  a: string;
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
    title: "Slack Integration",
    description:
      "Send Zivvy workflow events into Slack for faster updates, alerts, and team coordination.",
    keyword: "slack erp integration",
    problem:
      "Teams miss critical workflow updates when business systems are not connected to daily communication channels.",
    solution:
      "Zivvy can route key workflow signals to Slack so teams respond quickly without losing system-of-record discipline.",
    benefits: [
      "Get real-time alerts for high-priority events",
      "Speed up response on blockers and approvals",
      "Keep execution linked to source records"
    ],
    useCases: [
      "Deal-stage and invoice-status alerts",
      "Approval reminders for managers",
      "Escalation alerts for overdue tasks"
    ],
    faqs: [
      {
        q: "Can alerts be filtered by team?",
        a: "Yes. Routing can be scoped by workflow and ownership."
      },
      {
        q: "Will this replace in-app history?",
        a: "No. Slack notifications complement in-app activity timelines."
      }
    ],
    ctaLabel: "Set up Slack flow",
    ctaHref: "/contact"
  },
  {
    slug: "salesforce",
    title: "Salesforce Integration",
    description:
      "Sync pipeline and customer context between Salesforce and Zivvy for cleaner handoffs.",
    keyword: "salesforce integration with operations",
    problem:
      "Handoffs break when sales and operations run on disconnected records.",
    solution:
      "Zivvy integration patterns keep key account and deal context aligned with execution workflows.",
    benefits: [
      "Improve sales-to-ops handoff quality",
      "Reduce duplicate data entry",
      "Align revenue and delivery readiness"
    ],
    useCases: [
      "Account and contact synchronization",
      "Opportunity stage to workflow triggers",
      "Post-close provisioning workflows"
    ],
    faqs: [
      {
        q: "Is this bi-directional?",
        a: "Integration patterns can support one-way or two-way sync as needed."
      },
      {
        q: "Can we map custom fields?",
        a: "Yes. Field mapping strategy is part of integration setup."
      }
    ],
    ctaLabel: "Discuss Salesforce setup",
    ctaHref: "/contact"
  },
  {
    slug: "hubspot",
    title: "HubSpot Integration",
    description:
      "Connect HubSpot lifecycle data to Zivvy workflows for tighter marketing, sales, and operations alignment.",
    keyword: "hubspot operations integration",
    problem:
      "Lifecycle context is lost when GTM systems are disconnected from execution systems.",
    solution:
      "Zivvy integrates lifecycle updates with operations workflows to keep teams aligned from lead to cash.",
    benefits: [
      "Preserve lifecycle context across teams",
      "Trigger operational tasks from GTM events",
      "Improve conversion and handoff speed"
    ],
    useCases: [
      "MQL-to-SQL workflow triggers",
      "Deal won to onboarding kickoff",
      "Campaign attribution in revenue dashboards"
    ],
    faqs: [
      {
        q: "Can we sync contacts and companies?",
        a: "Yes. Standard integration patterns support core CRM objects."
      },
      {
        q: "Can we keep historical records?",
        a: "Yes. Sync plans include safe handling for historical context."
      }
    ],
    ctaLabel: "Plan HubSpot sync",
    ctaHref: "/contact"
  },
  {
    slug: "zapier",
    title: "Zapier Integration",
    description:
      "Automate cross-tool workflows quickly by connecting Zivvy events with Zapier actions.",
    keyword: "zapier workflow integration",
    problem:
      "Teams want automation across tools, but custom integrations can delay time-to-value.",
    solution:
      "Zapier-compatible flows help teams ship practical automations without full custom development.",
    benefits: [
      "Launch automations in hours, not weeks",
      "Connect Zivvy with hundreds of apps",
      "Reduce manual transfer work across systems"
    ],
    useCases: [
      "Create tasks from external form submissions",
      "Push billing updates to internal channels",
      "Sync records with spreadsheet workflows"
    ],
    faqs: [
      {
        q: "Can we start with no-code automation?",
        a: "Yes. Zapier is ideal for fast no-code process improvements."
      },
      {
        q: "Can we later move to API-based automation?",
        a: "Yes. Teams often graduate to API-driven flows over time."
      }
    ],
    ctaLabel: "Automate with Zapier",
    ctaHref: "/features/ai-automation"
  },
  {
    slug: "google-drive",
    title: "Google Drive Integration",
    description:
      "Link operational records with shared documents in Google Drive for cleaner collaboration.",
    keyword: "google drive business integration",
    problem:
      "Supporting documents often live in separate folders without clear linkage to business records.",
    solution:
      "Zivvy can pair workflow records with Drive content so teams keep context and compliance together.",
    benefits: [
      "Attach documents to workflows without confusion",
      "Reduce version mismatch across teams",
      "Speed up audits and reviews with linked evidence"
    ],
    useCases: [
      "Contract and quote support files",
      "Invoice and approval attachments",
      "Project documentation handoff"
    ],
    faqs: [
      {
        q: "Can we control document visibility?",
        a: "Yes. Access can follow role and process requirements."
      },
      {
        q: "Can this support compliance evidence trails?",
        a: "Yes. Linked records and history improve audit readiness."
      }
    ],
    ctaLabel: "Set up Drive flow",
    ctaHref: "/contact"
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

export const integrationCards: HubCardItem[] = integrationDetails.map(({ slug, title, description }) => ({
  slug,
  title,
  description
}));

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
