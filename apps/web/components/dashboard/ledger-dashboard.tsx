import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { fetchBootinfo } from "@/lib/boot-server";
import { fetchDashboardData, type AttentionItem, type ActivityItem } from "@/lib/dashboard-data";
import { personaCopy, resolvePersona } from "@/lib/dashboard-persona";
import { cn } from "@/lib/utils";

/**
 * The operator ledger.
 *
 * Design contract:
 *   - Neutral card on the app-shell canvas — no color seam against the
 *     sidebar/topbar. The identity comes from typography + structure
 *     (mono eyebrows, tight-heavy headline, tabular amounts, hairline
 *     rows) rather than a distinct surface color.
 *   - No KPI cards. Every number appears next to the thing to do about it.
 *   - Time is the axis (Today / This week). Never module.
 *   - Row: [status dot] [subject + note] [amount, mono, right] [verb + arrow]
 *   - Three earned accents: clay=overdue, copper=waiting, spruce=done.
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
    <article className="ledger-row grid grid-cols-[10px_1fr_auto_auto] items-center gap-x-6 py-5 max-md:grid-cols-[10px_1fr] max-md:gap-y-1.5">
      <span
        className="ledger-dot mt-1 self-start"
        data-tone={row.tone === "ink" ? undefined : row.tone}
        aria-hidden
      />
      <div className="min-w-0 max-md:col-start-2">
        <p className="type-ledger-title">
          {row.title}
          {row.ref ? <span className="type-ledger-ref ml-2">{row.ref}</span> : null}
        </p>
        <p className="type-ledger-note mt-1">{row.note}</p>
      </div>
      <p
        className={cn(
          "type-ledger-amount min-w-[8ch]",
          row.amountKind === "none" && "text-muted-foreground"
        )}
      >
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
    <header className="mb-6 flex items-baseline justify-between">
      <p className="type-ledger-eyebrow">{label}</p>
      <p className="type-ledger-eyebrow tabular-nums">
        <span className="text-border">·</span> {count}
      </p>
    </header>
  );
}

function buildHero(
  attention: AttentionItem[],
  activity: ActivityItem[]
): { title: string; meta: string } {
  const criticals = attention.filter((a) => a.severity === "critical");
  const waiting = attention.filter((a) => a.severity !== "critical");
  const totalMoney = attention
    .map((a) => extractAmount(a.meta).amount)
    .filter(Boolean).length;

  let title: string;
  if (attention.length === 0 && activity.length === 0) {
    title = "Nothing on your plate. Get ahead on next week.";
  } else if (attention.length === 0) {
    title = "Books are clear. Recent movement is below.";
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
  if (totalMoney > 0) bits.push("money on the line");
  const meta = bits.length > 0 ? bits.join(" · ") : "";

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

  const hero = buildHero(attention, activity);
  const greeting = getGreeting();
  const hasAnyRows = criticalRows.length + waitingRows.length + activityRows.length > 0;

  return (
    // Card wrapper: neutral surface on the app-shell canvas. Rounded, subtle
    // border in the shared --border token so the card matches every other
    // surface in the app. Fills the content area top-to-bottom so it never
    // reads as a small floating widget.
    <div
      className={cn(
        "bg-card text-card-foreground relative flex flex-col overflow-hidden",
        "rounded-2xl border border-border",
        "min-h-[calc(100dvh-var(--app-topbar-height,3rem)-2rem)] md:min-h-[calc(100dvh-var(--app-topbar-height,3rem)-2.5rem)]"
      )}
    >
      {/* Masthead — the ledger's own topline, sitting on the bone */}
      <header className="mx-auto w-full max-w-5xl px-6 pt-10 pb-6 md:px-10 md:pt-14 lg:px-14 lg:pt-16">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="type-ledger-eyebrow">{copy.eyebrow}</span>
          <span className="type-ledger-eyebrow text-border" aria-hidden>·</span>
          <span className="type-ledger-eyebrow">{today}</span>
        </div>
      </header>

      {/* Hero — the thesis */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-10 md:px-10 md:pb-14 lg:px-14 lg:pb-16">
        <p className="type-ledger-eyebrow mb-4">
          {greeting}{firstName ? `, ${firstName}` : ""}
        </p>
        <h1 className="type-ledger-hero">{hero.title}</h1>
        {hero.meta && (
          <p className="mt-5 max-w-[52ch] text-[15px] text-muted-foreground">
            {hero.meta}
          </p>
        )}
      </section>

      {/* Bands — only render if there's something to show */}
      {hasAnyRows && (
        <div className="border-t border-[color:var(--ledger-rule)]">
          <div className="mx-auto w-full max-w-5xl px-6 md:px-10 lg:px-14">
            {criticalRows.length > 0 && (
              <section className="py-10 md:py-12">
                <BandHead label="Today" count={criticalRows.length} />
                <div>
                  {criticalRows.map((row) => (
                    <Row key={row.key} row={row} />
                  ))}
                </div>
              </section>
            )}
            {waitingRows.length > 0 && (
              <section className={cn("py-10 md:py-12", criticalRows.length > 0 && "ledger-band")}>
                <BandHead label="This week" count={waitingRows.length} />
                <div>
                  {waitingRows.map((row) => (
                    <Row key={row.key} row={row} />
                  ))}
                </div>
              </section>
            )}
            {activityRows.length > 0 && (
              <section
                className={cn(
                  "py-10 md:py-12",
                  (criticalRows.length > 0 || waitingRows.length > 0) && "ledger-band"
                )}
              >
                <BandHead label="Recent movement" count={activityRows.length} />
                <div>
                  {activityRows.map((row) => (
                    <Row key={row.key} row={row} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}

      {/* Colophon anchors the bottom so short states still fill the page */}
      <div className="mt-auto">
        <div className="mx-auto w-full max-w-5xl px-6 py-8 md:px-10 md:py-10 lg:px-14">
          <div className="flex items-baseline justify-between border-t border-border pt-5">
            <span className="type-ledger-eyebrow">
              {boot.zivvy?.tenant?.company ?? "Zivvy"} · {copy.eyebrow.toLowerCase()}
            </span>
            <Link
              href="/apps"
              className="ledger-cta"
            >
              See every workspace
              <span aria-hidden><ArrowUpRight className="size-3.5" /></span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
