import Link from "next/link";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          404
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 text-muted-foreground">
          That URL is not part of Zivvy. Head home, or jump to pricing or docs.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Home
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-border px-4 py-2 text-sm"
          >
            Pricing
          </Link>
          <Link
            href="https://integrate.zivvy.xyz/docs"
            className="rounded-full border border-border px-4 py-2 text-sm"
          >
            Docs
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
