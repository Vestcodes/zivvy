import { AuthGuard } from "@/components/auth-guard";
import { PortalShell } from "@/components/portal-shell";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <PortalShell>{children}</PortalShell>
    </AuthGuard>
  );
}
