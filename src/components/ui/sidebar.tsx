"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { PanelLeft, X } from "lucide-react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

type SidebarContextValue = {
  openMobile: boolean;
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>;
  toggleMobile: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error("Sidebar components must be used within SidebarProvider.");
  }

  return context;
}

function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [openMobile, setOpenMobile] = React.useState(false);

  const toggleMobile = React.useCallback(() => {
    setOpenMobile((value) => !value);
  }, []);

  return (
    <SidebarContext.Provider value={{ openMobile, setOpenMobile, toggleMobile }}>
      <div className="flex min-h-screen w-full bg-transparent">{children}</div>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  children,
  className,
}: React.ComponentProps<"aside">) {
  const { openMobile, setOpenMobile } = useSidebar();

  return (
    <>
      <aside
        data-slot="sidebar"
        className={cn(
          "hidden w-72 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col",
          className,
        )}
      >
        {children}
      </aside>
      {openMobile ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="flex-1 bg-black/55 backdrop-blur-sm"
            onClick={() => setOpenMobile(false)}
          />
          <aside className="relative flex h-full w-[min(20rem,88vw)] flex-col border-l border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl">
            <button
              type="button"
              aria-label="Close sidebar"
              className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-full text-sidebar-foreground/70 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => setOpenMobile(false)}
            >
              <X className="size-4" />
            </button>
            {children}
          </aside>
        </div>
      ) : null}
    </>
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn("border-b border-sidebar-border px-4 py-4", className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn("flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-4", className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("border-t border-sidebar-border px-3 py-3", className)}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn(
        "px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/55",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn("list-none", className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring/40",
  {
    variants: {
      variant: {
        default: "",
        ghost: "text-sidebar-foreground/75 hover:text-sidebar-accent-foreground",
      },
      active: {
        true: "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      active: false,
    },
  },
);

function SidebarMenuButton({
  className,
  asChild = false,
  variant,
  active,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof sidebarMenuButtonVariants> & {
    asChild?: boolean;
    active?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="sidebar-menu-button"
      data-active={active}
      className={cn(sidebarMenuButtonVariants({ variant, active }), className)}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-inset"
      className={cn("flex min-h-screen min-w-0 flex-1 flex-col", className)}
      {...props}
    />
  );
}

function SidebarTrigger({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { toggleMobile } = useSidebar();

  return (
    <button
      type="button"
      aria-label="Toggle sidebar"
      data-slot="sidebar-trigger"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-xl border border-border/70 bg-card/80 text-foreground shadow-sm backdrop-blur transition hover:bg-muted lg:hidden",
        className,
      )}
      onClick={toggleMobile}
      {...props}
    >
      <PanelLeft className="size-4" />
    </button>
  );
}

export {
  useSidebar,
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
};
