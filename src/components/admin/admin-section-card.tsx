import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AdminSectionCardProps = {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

export function AdminSectionCard({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
  headerClassName,
  titleClassName,
  descriptionClassName,
}: AdminSectionCardProps) {
  return (
    <Card className={className}>
      {eyebrow || title || description || actions ? (
        <CardHeader
          className={cn(
            "flex flex-wrap items-start justify-between gap-4",
            headerClassName,
          )}
        >
          <div>
            {eyebrow ? (
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <CardTitle className={cn("mt-2", titleClassName)}>{title}</CardTitle>
            ) : null}
            {description ? (
              <div
                className={cn(
                  "mt-2 text-sm text-muted-foreground",
                  descriptionClassName,
                )}
              >
                {description}
              </div>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
        </CardHeader>
      ) : null}
      {children != null ? (
        <CardContent className={contentClassName}>{children}</CardContent>
      ) : null}
    </Card>
  );
}
