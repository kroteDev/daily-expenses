import { AppNav } from "@/components/AppNav";
import { AuthGate } from "@/components/AuthGate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <AppNav />
      {children}
    </AuthGate>
  );
}
