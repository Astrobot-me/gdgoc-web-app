import Link from "next/link";
import { CalendarDays, Home, Users } from "lucide-react";
import { SignOutButton } from "@/components/admin/sign-out-button";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fef3c7,transparent_45%),linear-gradient(160deg,#f8fafc,#ffffff)]">
      <div className="mx-auto flex w-full max-w-6xl gap-6 px-6 py-8">
        <aside className="hidden w-64 flex-col gap-6 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur lg:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Admin console
            </p>
            <h2 className="mt-2 font-heading text-xl text-foreground">
              GDG Certificates
            </h2>
          </div>
          <nav className="flex flex-col gap-2 text-sm">
            <Link
              href="/admin/events"
              className="flex items-center gap-2 rounded-2xl border border-muted/50 px-3 py-2 font-semibold text-foreground"
            >
              <CalendarDays className="size-4" />
              Events
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-2xl border border-transparent px-3 py-2 text-muted-foreground hover:border-muted/50 hover:text-foreground"
            >
              <Home className="size-4" />
              Public site
            </Link>
          </nav>
          <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
            <span>Admin access</span>
            <SignOutButton />
          </div>
        </aside>
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between rounded-3xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Users className="size-4" />
              Admin console
            </div>
            <SignOutButton />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
