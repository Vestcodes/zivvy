import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/site/logo";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export const metadata: Metadata = {
  title: "Set new password — Zivvy"
};

interface Props {
  searchParams: Promise<{ key?: string }>;
}

export default async function UpdatePasswordPage({ searchParams }: Props) {
  const { key } = await searchParams;

  if (!key) {
    redirect("/login#reset");
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      <header className="mb-8">
        <Link href="/">
          <Logo />
        </Link>
      </header>
      <UpdatePasswordForm resetKey={key} />
    </div>
  );
}
