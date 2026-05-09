"use client";

import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

const getSectionLabel = (pathname: string) => {
  if (pathname === "/admin/events") {
    return "Events";
  }

  if (/^\/admin\/events\/[^/]+\/analytics$/.test(pathname)) {
    return "Analytics";
  }

  if (/^\/admin\/events\/[^/]+\/certificates\/[^/]+$/.test(pathname)) {
    return "Certificate detail";
  }

  if (/^\/admin\/events\/[^/]+\/certificates$/.test(pathname)) {
    return "Participant records";
  }

  if (/^\/admin\/events\/[^/]+$/.test(pathname)) {
    return "Issuance workspace";
  }

  return "Admin console";
};

export function AdminTopbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/82 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Admin
          </p>
          <p className="text-sm font-semibold text-foreground">
            {getSectionLabel(pathname)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="hidden sm:block">
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
