"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Home,
  Layers3,
  Rows3,
} from "lucide-react";
import { SignOutButton } from "@/components/admin/sign-out-button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const getEventIdFromPath = (pathname: string) => {
  const match = pathname.match(/^\/admin\/events\/([^/]+)/);
  return match?.[1] ?? null;
};

export function AdminSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const eventId = getEventIdFromPath(pathname);

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/55">
            Admin console
          </p>
          <h2 className="mt-2 font-heading text-xl text-sidebar-foreground">
            GDG Certificates
          </h2>
          <p className="mt-2 text-sm text-sidebar-foreground/65">
            Separate issuance, records, and analytics into dedicated workspaces.
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild active={pathname === "/admin/events"}>
                  <Link href="/admin/events">
                    <CalendarDays className="size-4" />
                    Events
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild variant="ghost">
                  <Link href="/">
                    <Home className="size-4" />
                    Public site
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {eventId ? (
          <SidebarGroup>
            <SidebarGroupLabel>Selected event</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    active={pathname === `/admin/events/${eventId}`}
                  >
                    <Link href={`/admin/events/${eventId}`}>
                      <Layers3 className="size-4" />
                      Issuance
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    active={
                      pathname === `/admin/events/${eventId}/certificates` ||
                      pathname.startsWith(`/admin/events/${eventId}/certificates/`)
                    }
                  >
                    <Link href={`/admin/events/${eventId}/certificates`}>
                      <Rows3 className="size-4" />
                      Participant records
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    active={pathname === `/admin/events/${eventId}/analytics`}
                  >
                    <Link href={`/admin/events/${eventId}/analytics`}>
                      <BarChart3 className="size-4" />
                      Analytics
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between rounded-2xl border border-sidebar-border bg-sidebar-accent/40 px-3 py-2">
          <span className="text-xs text-sidebar-foreground/65">Admin access</span>
          <SignOutButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
