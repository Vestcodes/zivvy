import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export function LegalShell({
  title,
  updated,
  children
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main>
        <article className="mx-auto max-w-3xl px-6 pt-16 pb-24">
          <header className="mb-10 border-b border-border/60 pb-8">
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              {title}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Last updated: {updated}
            </p>
          </header>
          <div className="prose prose-neutral max-w-none text-[15px] leading-7 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_p]:my-4 [&_p]:text-muted-foreground [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-muted-foreground [&_li]:my-1">
            {children}
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
