import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { ContactForm } from "@/components/site/contact-form";
import { Mail, MapPin, MessagesSquare } from "lucide-react";
import { makeMetadata } from "@/lib/seo";

export const metadata = makeMetadata({
  title: "Contact Sales, Support and Partnerships",
  description: "Reach Zivvy sales, support or partnerships. Book a demo, get help with your workspace or discuss integration and reseller opportunities.",
  canonicalPath: "/contact",
});

const CONTACTS = [
  {
    icon: Mail,
    label: "Email",
    value: "support@zivvy.xyz",
    href: "mailto:support@zivvy.xyz"
  },
  {
    icon: MessagesSquare,
    label: "Support",
    value: "Priority support included on Pro ($18)",
    href: "/pricing"
  },
  {
    icon: MapPin,
    label: "Company",
    value: "Zivvy",
    href: null
  }
];

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-3xl px-6 pt-20 pb-4 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Talk to us
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We answer within a business day. Faster on Pro.
          </p>
        </section>

        <div className="mx-auto max-w-5xl px-6 pb-24 pt-8">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <ul className="space-y-6">
                {CONTACTS.map(({ icon: Icon, label, value, href }) => (
                  <li key={label} className="flex items-start gap-3">
                    <div className="bg-primary-gradient grid size-10 shrink-0 place-items-center rounded-md text-primary-foreground shadow-elevation-sm">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          className="text-sm font-medium hover:text-primary"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium">{value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <ContactForm />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
