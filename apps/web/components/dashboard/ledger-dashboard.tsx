import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { fetchBootinfo } from "@/lib/boot-server";
import { fetchDashboardData, type AttentionItem, type ActivityItem } from "@/lib/dashboard-data";
import { personaCopy, resolvePersona } from "@/lib/dashboard-persona";
import { cn } from "@/lib/utils";

/**
 * The operator ledger. Replaces the KPI-grid dashboard with a single-column
 * ledger of things that need the operator's call today, then this week.
 *
 * Design contract (from docs/product/UX_POLISH_PLAN.md phase 3):
 *   - No KPI cards. Every number appears next to the thing to do about it.
 *   - Time is the primary axis (Today / This week). Never module.
 *   - Row shape: [status dot] [subject + note] [amount, mono, right] [verb + arrow]
 *   - Three earned accents: clay=overdue, copper=waiting, spruce=done. Nothing else.
 *   - Standing card at the bottom is the one exception — cash on hand, not an action.
 */

type Tone = "clay" | "copper" | "spruce" | "ink";

interface LedgerRow {
  key: string;
  tone: Tone;
  title: string;
  ref?: string;
  note: string;
  amount?: string;
  amountKind: "money" | "count" | "none";
  cta: string;
  href: string;
}

function toneForAttention(severity: AttentionItem["severity"]): Tone {
  if (severity === "critical") return "clay";
  if (severity === "warning") return "copper";
  return "ink";
}

function toneForActivity(kind: ActivityItem["kind"]): Tone {
  if (kind === "payment") return "spruce";
  if (kind === "invoice") return "ink";
  if (kind === "delivery") return "spruce";
  return "ink";
}

function ctaForAttention(item: AttentionItem): string {
  if (item.kind === "overdue-invoice") return "Chase";
  if (item.kind === "arriving-po") return "Confirm";
  if (item.kind === "low-stock") return "Reorder";
  return "Open";
}

function extractAmount(meta: string): { amount?: string; note: string } {
  // dashboard-data meta is a free string; pull the leading currency amount if
  // one is there so it lines up on the numeric rail.
  const match = meta.match(/^([$€£₹¥]\s*[\d,]+(?:\.\d+)?)\s*[·•\-—]?\s*(.*)$/);
  if (match) return { amount: match[1].replace(/\s+/, ""), note: match[2] || meta };
  return { note: meta };
}

function attentionToRow(item: AttentionItem, idx: number): LedgerRow {
  const { amount, note } = extractAmount(item.meta);
  const title = item.title.replace(/\s*·.*/, "").trim() || item.title;
  const refMatch = item.title.match(/·\s*(.+)$/);
  return {
    key: `attn-${idx}`,
    tone: toneForAttention(item.severity),
    title,
    ref: refMatch?.[1]?.trim(),
    note,
    amount,
    amountKind: amount ? "money" : "none",
    cta: ctaForAttention(item),
    href: item.href
  };
}

function activityToRow(item: ActivityItem, idx: number): LedgerRow {
  const { amount, note } = extractAmount(item.detail);
  return {
    key: `act-${idx}`,
    tone: toneForActivity(item.kind),
    title: item.title,
    note: note || item.when,
    amount,
    amountKind: amount ? "money" : "none",
    cta: "Open",
    href: item.href
  };
}

function Row({ row }: { row: LedgerRow }) {
  return (
    <article className="ledger-row grid grid-cols-[10px_1fr_auto_auto] items-center gap-x-6 py-4 max-md:grid-cols-[10px_1fr] max-md:gap-y-1.5">
      <span className={cn("ledger-dot mt-1 self-start")} data-tone={row.tone === "ink" ? undefined : row.tone} aria-hidden />
      <div className="min-w-0 max-md:col-start-2">
        <p className="type-ledger-title">
          {row.title}
          {row.ref ? <span className="type-ledger-ref ml-2">{row.ref}</span> : null}
        </p>
        <p className="type-ledger-note mt-1">{row.note}</p>
      </div>
      <p className={cn("type-ledger-amount min-w-[8ch]", row.amountKind === "none" && "text-[color:var(--ledger-pencil)]")}>
        {row.amount ?? (row.amountKind === "none" ? "—" : "")}
      </p>
      <Link
        href={row.href}
        className="ledger-cta"
        data-tone={row.tone === "ink" || row.tone === "spruce" ? undefined : row.tone}
      >
        {row.cta}
        <span aria-hidden><ArrowUpRight className="size-3.5" /></span>
      </Link>
    </article>
  );
}

function BandHead({ label, count }: { label: string; count: number }) {
  return (
    <header className="mb-5 flex items-baseline justify-between">
      <p className="type-ledger-eyebrow">{label}</p>
      <p className="type-ledger-eyebrow tabular-nums">
        <span className="text-[color:var(--ledger-rule)]">·</span> {count}
      </p>
    </header>
  );
}

function buildHeroLine(
  attention: AttentionItem[],
  activity: ActivityItem[],
  personaLabel: string
): { title: string; meta: string } {
  const criticals = attention.filter((a) => a.severity === "critical");
  const waiting = attention.filter((a) => a.severity === "warning");
  const totalMoney = attention
    .map((a) => extractAmount(a.meta).amount)
    .filter(Boolean).length;

  let title: string;
  if (attention.length === 0 && activity.length === 0) {
    title = `Nothing on your plate. Get ahead on next week.`;
  } else if (attention.length === 0) {
    title = `Books are clear. Recent activity is below.`;
  } else if (criticals.length > 0) {
    title = `${criticals.length} ${criticals.length === 1 ? "thing needs" : "things need"} your call today.`;
  } else if (waiting.length > 0) {
    title = `${waiting.length} ${waiting.length === 1 ? "reply is" : "replies are"} waiting on you.`;
  } else {
    title = `${attention.length} ${attention.length === 1 ? "item is" : "items are"} on your plate.`;
  }

  const bits: string[] = [];
  if (criticals.length > 0) bits.push(`${criticals.length} overdue`);
  if (waiting.length > 0) bits.push(`${waiting.length} waiting`);
  if (totalMoney > 0) bits.push(`money on the line`);
  const meta = bits.length > 0
    ? bits.join(" · ")
    : `${personaLabel.toLowerCase()} · nothing urgent`;

  return { title, meta };
}

export async function LedgerDashboard() {
  const [{ attention, activity }, boot] = await Promise.all([
    fetchDashboardData(),
    fetchBootinfo()
  ]);
  const persona = resolvePersona(boot);
  const copy = personaCopy(persona);
  const firstName = boot.user?.full_name?.split(" ")[0];
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  const criticalRows = attention
    .filter((a) => a.severity === "critical")
    .map(attentionToRow);
  const waitingRows = attention
    .filter((a) => a.severity !== "critical")
    .map(attentionToRow);
  const activityRows = activity.slice(0, 6).map(activityToRow);

  const hero = buildHeroLine(attention, activity, copy.eyebrow);
  const greeting = getGreeting();

  return (
    <div className="surface-ledger mx-auto -mx-4 max-w-4xl px-4 pb-16 sm:mx-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      {/* Persona strip — mono, no wrapping card */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-4">
        <span className="type-ledger-eyebrow">{copy.eyebrow}</span>
        <span className="type-ledger-eyebrow text-[color:var(--ledger-rule)]">·</span>
        <span className="type-ledger-eyebrow">{today}</span>
      </div>

      {/* Hero — the thesis line */}
      <section className="border-b border-[color:var(--ledger-rule)] py-8 sm:py-10">
        <p className="type-ledger-eyebrow mb-3">
          {greeting}{firstName ? `, ${firstName}` : ""}
        </p>
        <h1 className="type-ledger-hero">{hero.title}</h1>
        <p className="mt-4 max-w-[52ch] text-[15px] text-[color:var(--ledger-pencil)]">
          {hero.meta}
        </p>
      </section>

      {/* Today */}
      {criticalRows.length > 0 && (
        <section className="py-8">
          <BandHead label="Today" count={criticalRows.length} />
          <div>
            {criticalRows.map((row) => (
              <Row key={row.key} row={row} />
            ))}
          </div>
        </section>
      )}

      {/* This week */}
      {waitingRows.length > 0 && (
        <section className={cn("py-8", criticalRows.length > 0 && "ledger-band")}>
          <BandHead label="This week" count={waitingRows.length} />
          <div>
            {waitingRows.map((row) => (
              <Row key={row.key} row={row} />
            ))}
          </div>
        </section>
      )}

      {/* Recent movement */}
      {activityRows.length > 0 && (
        <section className={cn("py-8", (criticalRows.length > 0 || waitingRows.length > 0) && "ledger-band")}>
          <BandHead label="Recent movement" count={activityRows.length} />
          <div>
            {activityRows.map((row) => (
              <Row key={row.key} row={row} />
            ))}
          </div>
        </section>
      )}

      {/* True empty — hero already reads the message, no need for a party emoji */}
      {criticalRows.length === 0 && waitingRows.length === 0 && activityRows.length === 0 && (
        <section className="py-8 ledger-band">
          <p className="type-ledger-title">Nothing on your plate.</p>
          <p className="type-ledger-note mt-1">This is your moment to get ahead on next week.</p>
        </section>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
