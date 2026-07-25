import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Cable,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  ListChecks,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wrench
} from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { makeMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

/**
 * /developers/mcp — one-page reference for the Zivvy MCP server.
 *
 * This page is intentionally text-first. The audience is a developer who's
 * already used `npx` and `~/.claude/settings.json`; they need to know
 * (a) which tools exist, (b) exactly what to paste, (c) what security posture
 * they're inheriting. Marketing goes on /features and /integrations — this
 * one earns its keep by being copy-pasteable.
 */

export const metadata = makeMetadata({
  title: "MCP server",
  description:
    "Model Context Protocol server for Zivvy. Wire Claude, Claude Code, Cursor, or any MCP-aware client to the Zivvy API — customers, invoices, sales orders, bank transactions — with a five-line config.",
  canonicalPath: "/developers/mcp"
});

const TOOLS: {
  name: string;
  rest: string;
  purpose: string;
}[] = [
  {
    name: "list_resources",
    rest: "GET /v1/resources",
    purpose:
      "Enumerate the resource slugs this API key can address, with tier, module, and submittable flag."
  },
  {
    name: "list_records",
    rest: "GET /v1/:resource",
    purpose:
      "Paginated list with optional server-side filter and order_by. Only `filterable` fields are honored."
  },
  {
    name: "get_record",
    rest: "GET /v1/:resource/:id",
    purpose:
      "Fetch a single record by ID — usually the Frappe `name`, or `item_code` for items."
  },
  {
    name: "create_record",
    rest: "POST /v1/:resource",
    purpose:
      "Create a new record. Submittable docs are created in Draft; call `submit_record` next."
  },
  {
    name: "update_record",
    rest: "PATCH /v1/:resource/:id",
    purpose:
      "Partial update. `createOnly` fields are rejected. Submitted docs must be cancelled first."
  },
  {
    name: "delete_record",
    rest: "DELETE /v1/:resource/:id",
    purpose:
      "Delete unsubmitted, non-referenced records. Returns 409 with the linked docs when blocked."
  },
  {
    name: "submit_record",
    rest: "POST /v1/:resource/:id/submit",
    purpose:
      "Submit a draft document (docstatus 0 → 1). Only for `submittable: true` resources."
  },
  {
    name: "list_addons",
    rest: "GET /v1/addons",
    purpose:
      "Marketplace add-ons for this workspace, with billing state and price."
  },
  {
    name: "list_tiers",
    rest: "GET /v1/tiers",
    purpose:
      "Free / Pro / Business tiers, what each includes, and the workspace's current tier."
  },
  {
    name: "subscribe_tier",
    rest: "POST /v1/tiers/:slug/subscribe",
    purpose:
      "Change tier. Returns a checkout URL when payment is needed; otherwise applies immediately."
  },
  {
    name: "list_events",
    rest: "GET /v1/events",
    purpose:
      "Event log — created / updated / submitted / paid / cancelled across every resource."
  },
  {
    name: "list_webhook_subscriptions",
    rest: "GET /v1/webhooks",
    purpose:
      "Webhook subscriptions on this workspace: target URL, subscribed events, last delivery."
  }
];

const RESOURCES: { uri: string; description: string }[] = [
  {
    uri: "zivvy://openapi",
    description:
      "Full OpenAPI 3.1 spec for the /v1 surface — request/response shapes, required fields, examples."
  },
  {
    uri: "zivvy://resources",
    description:
      "The resource catalog. Cheaper than reading the full OpenAPI when you only need slugs, tiers, and filterables."
  }
];

const EXAMPLE_PROMPTS = [
  "List the ten most recent unpaid sales invoices for Acme Corp.",
  "Draft a sales order for two units of IT-001 for Acme Corp, then submit it.",
  "Show me every bank transaction from last week that's still unreconciled.",
  "Which add-ons are inactive? Which ones would help a Pro workspace?"
];

const CLAUDE_CODE_CONFIG = `{
  "mcpServers": {
    "zivvy": {
      "command": "npx",
      "args": ["-y", "@zivvy/mcp-server"],
      "env": {
        "ZIVVY_API_KEY": "zk_live_...",
        "ZIVVY_API_BASE": "https://integrate.zivvy.xyz"
      }
    }
  }
}`;

const CLAUDE_DESKTOP_CONFIG = `{
  "mcpServers": {
    "zivvy": {
      "command": "npx",
      "args": ["-y", "@zivvy/mcp-server"],
      "env": { "ZIVVY_API_KEY": "zk_live_..." }
    }
  }
}`;

const NPX_ONE_LINER = "npx -y @zivvy/mcp-server";
const GLOBAL_INSTALL = "npm install -g @zivvy/mcp-server";

const ENV_VARS: { name: string; required: boolean; default?: string; purpose: string }[] = [
  {
    name: "ZIVVY_API_KEY",
    required: true,
    purpose: "Per-workspace API key. Create one at /settings/developer."
  },
  {
    name: "ZIVVY_API_BASE",
    required: false,
    default: "https://integrate.zivvy.xyz",
    purpose: "Override for staging or a self-hosted Zivvy."
  },
  {
    name: "ZIVVY_MCP_DEBUG",
    required: false,
    purpose: "Set to `1` to log a single startup line to stderr. Never logs your key."
  }
];

function CodeBlock({
  code,
  label,
  language = "bash"
}: {
  code: string;
  label?: string;
  language?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-muted/40 backdrop-blur-sm">
      {label ? (
        <div className="flex items-center justify-between border-b border-border/50 bg-muted/60 px-4 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </span>
          <span className="text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground/70">
            {language}
          </span>
        </div>
      ) : null}
      <pre className="overflow-x-auto p-4 text-[12.5px] leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default function MCPPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% -10%, color-mix(in oklab, var(--primary) 15%, transparent), transparent 70%)"
            }}
          />
          <div className="relative mx-auto max-w-4xl px-6 pb-16 pt-20 text-center sm:pt-24">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10">
              <Bot className="size-8 text-primary" />
            </div>
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11.5px] font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="size-3 text-primary" aria-hidden />
              For developers · Model Context Protocol
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
              Zivvy MCP server
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              A tiny stdio server that lets Claude, Claude Code, Cursor, and
              any MCP-aware client read and write your Zivvy workspace —
              customers, invoices, sales orders, bank transactions — through
              the public <code className="rounded bg-muted px-1 py-0.5 text-[13px]">/v1</code> API.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished">
                <a
                  href="https://www.npmjs.com/package/@zivvy/mcp-server"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Install from npm
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <a
                  href="https://integrate.zivvy.xyz/docs"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  API reference
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/developers/webhooks">
                  Webhooks
                </Link>
              </Button>
            </div>
            <div className="mt-10">
              <CodeBlock code={NPX_ONE_LINER} label="Try it now" language="bash" />
            </div>
          </div>
        </section>

        {/* Install */}
        <section
          className="mx-auto max-w-6xl px-6 py-16"
          aria-labelledby="install-heading"
        >
          <SectionHeading
            eyebrow="1 · Install"
            title="Two ways to run it"
            description="Either let npx spawn it on demand, or install once and reference the binary. Both wire the same way."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-background/60 p-6">
              <div className="flex items-center gap-2">
                <Terminal className="size-4 text-primary" aria-hidden />
                <h3 className="text-[15px] font-semibold">On-demand with npx</h3>
                <Badge variant="secondary" className="ml-auto">
                  Recommended
                </Badge>
              </div>
              <p className="mt-2 text-[13.5px] text-muted-foreground">
                Nothing to install globally. The MCP client spawns the server
                the first time a tool is called.
              </p>
              <div className="mt-4">
                <CodeBlock code={NPX_ONE_LINER} language="bash" />
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/60 p-6">
              <div className="flex items-center gap-2">
                <Wrench className="size-4 text-primary" aria-hidden />
                <h3 className="text-[15px] font-semibold">Global install</h3>
              </div>
              <p className="mt-2 text-[13.5px] text-muted-foreground">
                Ship the binary once, reference it as{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-[12px]">
                  zivvy-mcp
                </code>{" "}
                in your MCP client config.
              </p>
              <div className="mt-4">
                <CodeBlock code={GLOBAL_INSTALL} language="bash" />
              </div>
            </div>
          </div>
        </section>

        {/* Configure */}
        <section
          className="border-y border-border/60 bg-muted/25"
          aria-labelledby="configure-heading"
        >
          <div className="mx-auto max-w-6xl px-6 py-16">
            <SectionHeading
              eyebrow="2 · Configure"
              title="Paste, restart, done"
              description="Every MCP client uses the same stdio contract. The block below drops into Claude Code, Claude Desktop, Cursor, Cline, or Windsurf — the path to the settings file is the only thing that changes."
            />

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    Claude Code
                  </Badge>
                  <code className="text-[12px] text-muted-foreground">
                    ~/.claude/settings.json
                  </code>
                </div>
                <CodeBlock code={CLAUDE_CODE_CONFIG} language="json" />
                <p className="mt-3 text-[13px] text-muted-foreground">
                  Restart Claude Code. Type <code className="rounded bg-muted px-1 py-0.5 text-[12px]">/mcp</code> to
                  confirm the <code className="rounded bg-muted px-1 py-0.5 text-[12px]">zivvy</code> server
                  is healthy and every tool is listed.
                </p>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    Claude Desktop
                  </Badge>
                  <code className="text-[12px] text-muted-foreground">
                    claude_desktop_config.json
                  </code>
                </div>
                <CodeBlock code={CLAUDE_DESKTOP_CONFIG} language="json" />
                <p className="mt-3 text-[13px] text-muted-foreground">
                  On macOS the file lives at{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-[12px]">
                    ~/Library/Application Support/Claude/
                  </code>
                  . Restart the app.
                </p>
              </div>
            </div>

            {/* Env vars */}
            <div className="mt-10">
              <h3 className="flex items-center gap-2 text-[15px] font-semibold">
                <KeyRound className="size-4 text-primary" aria-hidden />
                Environment variables
              </h3>
              <div className="mt-4 overflow-hidden rounded-2xl border border-border/60 bg-background/60">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground">
                      <th className="px-4 py-2 font-medium">Variable</th>
                      <th className="px-4 py-2 font-medium">Required</th>
                      <th className="px-4 py-2 font-medium">Default</th>
                      <th className="px-4 py-2 font-medium">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ENV_VARS.map((v) => (
                      <tr key={v.name} className="border-b border-border/40 last:border-0">
                        <td className="px-4 py-2 align-top font-mono text-[12.5px]">
                          {v.name}
                        </td>
                        <td className="px-4 py-2 align-top">
                          {v.required ? (
                            <Badge variant="default" className="bg-primary/15 text-primary">
                              yes
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">no</span>
                          )}
                        </td>
                        <td className="px-4 py-2 align-top font-mono text-[12.5px] text-muted-foreground">
                          {v.default ?? "—"}
                        </td>
                        <td className="px-4 py-2 align-top text-muted-foreground">
                          {v.purpose}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[13px] text-muted-foreground">
                A missing <code className="rounded bg-muted px-1 py-0.5 text-[12px]">ZIVVY_API_KEY</code> never
                crashes the server. Each tool call returns a friendly error
                so the LLM can surface the fix.
              </p>
              <div className="mt-4">
                <Button asChild variant="outline" size="sm">
                  <Link href="/dev/settings/developer">
                    Create an API key
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Tools */}
        <section
          className="mx-auto max-w-6xl px-6 py-16"
          aria-labelledby="tools-heading"
        >
          <SectionHeading
            eyebrow="3 · Tools"
            title="Twelve tools, one shape"
            description="Every tool maps 1:1 to a REST call. The MCP server holds no state and caches nothing — the JSON coming back is exactly what the API returned."
          />

          <div className="mt-8 overflow-hidden rounded-2xl border border-border/60 bg-background/60">
            <table className="w-full text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Tool</th>
                  <th className="px-4 py-2.5 font-medium">REST call</th>
                  <th className="px-4 py-2.5 font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {TOOLS.map((t) => (
                  <tr key={t.name} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-3 align-top">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-[12.5px] font-medium">
                        {t.name}
                      </code>
                    </td>
                    <td className="px-4 py-3 align-top font-mono text-[12px] text-muted-foreground">
                      {t.rest}
                    </td>
                    <td className="px-4 py-3 align-top text-muted-foreground">
                      {t.purpose}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10">
            <h3 className="flex items-center gap-2 text-[15px] font-semibold">
              <ListChecks className="size-4 text-primary" aria-hidden />
              Resources (MCP concept)
            </h3>
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              The server also exposes two <em>resources</em> — read-only URIs
              the client can pull without calling a tool. Use these when the
              LLM needs to understand the schema before writing anything.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {RESOURCES.map((r) => (
                <div
                  key={r.uri}
                  className="rounded-xl border border-border/60 bg-background/60 p-5"
                >
                  <code className="text-[13px] font-semibold text-primary">
                    {r.uri}
                  </code>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {r.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Example prompts */}
        <section
          className="border-y border-border/60 bg-muted/25"
          aria-labelledby="prompts-heading"
        >
          <div className="mx-auto max-w-6xl px-6 py-16">
            <SectionHeading
              eyebrow="4 · Prompts"
              title="Try these in Claude"
              description="Once the server is wired, ask the model in plain English. It will call `list_resources` and `zivvy://openapi` on its own when it needs the shape."
            />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {EXAMPLE_PROMPTS.map((p) => (
                <div
                  key={p}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border border-border/60 bg-background/70 p-5",
                    "text-[14.5px] leading-relaxed"
                  )}
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security */}
        <section
          className="mx-auto max-w-6xl px-6 py-16"
          aria-labelledby="security-heading"
        >
          <SectionHeading
            eyebrow="5 · Security"
            title="What the server sees, what it doesn't"
            description="The MCP server is a thin proxy — the same trust posture as calling the API directly, plus the fact that the LLM now sees the responses."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-background/60 p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" aria-hidden />
                <h3 className="text-[15px] font-semibold">Tenancy</h3>
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                API keys are scoped to a single workspace. A leaked key cannot
                read another tenant's data — the check happens at the request
                layer, not in application code.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/60 p-6">
              <div className="flex items-center gap-2">
                <Cable className="size-4 text-primary" aria-hidden />
                <h3 className="text-[15px] font-semibold">Transport</h3>
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                Traffic goes directly from your local process to{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-[12px]">
                  integrate.zivvy.xyz
                </code>{" "}
                over TLS. No third party sits between the client and Zivvy.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/60 p-6">
              <div className="flex items-center gap-2">
                <KeyRound className="size-4 text-primary" aria-hidden />
                <h3 className="text-[15px] font-semibold">Secrets</h3>
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                The server never logs your API key.{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-[12px]">
                  ZIVVY_MCP_DEBUG=1
                </code>{" "}
                logs only whether a key is present.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/60 p-6">
              <div className="flex items-center gap-2">
                <Bot className="size-4 text-primary" aria-hidden />
                <h3 className="text-[15px] font-semibold">The LLM sees responses</h3>
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                Every tool result is JSON the model reads. If a resource
                contains data you don't want in the model's context, don't
                call the tool that returns it — the server does not filter
                fields on your behalf.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          className="mx-auto max-w-4xl px-6 pb-24 pt-6 text-center"
          aria-labelledby="cta-heading"
        >
          <h2
            id="cta-heading"
            className="font-display text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Ready to try it?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-muted-foreground">
            Grab an API key, paste the config block, and ask Claude to draft
            an invoice.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="polished">
              <Link href="/dev/settings/developer">
                Create an API key
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a
                href="https://www.npmjs.com/package/@zivvy/mcp-server"
                target="_blank"
                rel="noreferrer noopener"
              >
                View on npm
                <ExternalLink className="size-3.5" />
              </a>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/developers/webhooks">
                Webhooks reference
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
