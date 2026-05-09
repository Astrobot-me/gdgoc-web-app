import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const statusBadgeVariants = cva("", {
  variants: {
    tone: {
      active: "border-transparent bg-(--gdg-green)/15 text-(--gdg-green)",
      revoked: "border-transparent bg-(--gdg-red)/15 text-(--gdg-red)",
      info: "border-transparent bg-(--gdg-blue)/10 text-(--gdg-blue)",
      neutral: "border-border/60 bg-background/70 text-foreground",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
});

function StatusBadge({
  className,
  tone,
  ...props
}: React.ComponentProps<typeof Badge> & VariantProps<typeof statusBadgeVariants>) {
  return (
    <Badge
      variant="outline"
      className={cn(statusBadgeVariants({ tone }), className)}
      {...props}
    />
  );
}

export { StatusBadge };
