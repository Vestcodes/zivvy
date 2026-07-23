import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/site/logo";
import { AuthPanel } from "@/components/auth/auth-panel";
import { fetchBootinfo } from "@/lib/boot-server";

export const metadata: Metadata = {
  title: "Sign in — Zivvy",
  description: "Sign in to your Zivvy workspace, or create a free account."
};

export default async function LoginPage() {
  const boot = await fetchBootinfo();
  if (boot.logged_in) {
    redirect("/dashboard");
  }
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <div
        className="relative hidden overflow-hidden text-primary-foreground lg:block"
        style={{
          background:
            "linear-gradient(to bottom, var(--primary-light), var(--primary-dark) 70%)"
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 25% 12%, rgba(255,255,255,0.10), transparent 65%)"
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link href="/" className="inline-flex">
            <Logo className="[&>div]:bg-white/15 [&>div]:text-white [&_span]:text-white" />
          </Link>
          <div className="max-w-md">
            <h2 className="font-display text-4xl leading-[1.1] tracking-tight text-primary-foreground">
              Business software that finally feels made for you.
            </h2>
            <p className="mt-5 text-primary-foreground/75">
              Sales, stock, accounting, HR, and manufacturing in one product.
              Powered by an open ERP core.
            </p>
            <ul className="mt-8 space-y-2 text-sm text-primary-foreground/70">
              <li>· 2 seats on Free, forever</li>
              <li>· No credit card required</li>
              <li>· Data in India, EU, or US — your choice</li>
            </ul>
          </div>
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} Vestcodes Co · Zivvy — business software on an open ERP core
          </p>
        </div>
      </div>

      {/* Auth panel */}
      <div className="flex flex-col">
        <header className="flex items-center justify-between px-6 py-6 lg:hidden">
          <Link href="/">
            <Logo />
          </Link>
        </header>
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <AuthPanel />
        </div>
        <footer className="px-6 pb-6 text-center text-xs text-muted-foreground">
          Trouble signing in?{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact us
          </Link>
        </footer>
      </div>
    </div>
  );
}
