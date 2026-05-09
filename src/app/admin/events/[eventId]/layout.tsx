import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

type EventWorkspaceLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
};

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);

export default async function EventWorkspaceLayout({
  children,
  params,
}: EventWorkspaceLayoutProps) {
  const { eventId } = await params;
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { certificates: true } } },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AdminSectionCard
        eyebrow="Selected event"
        title={event.name}
        titleClassName="text-3xl md:text-4xl"
        description={
          event.description ??
          "Use dedicated screens for issuing certificates, reviewing participant records, and inspecting analytics."
        }
        actions={
          <>
            <Button asChild size="sm" variant="outline">
              <Link href={`/admin/events/${eventId}/certificates`}>
                Participant records
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/admin/events/${eventId}/analytics`}>
                Analytics
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="link" className="h-auto px-0 text-(--gdg-blue)">
              <Link href="/admin/events">
                Back to events
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-4" />
            {formatDate(event.eventDate)}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-4" />
            {event.venue ?? "Venue not specified"}
          </span>
          <StatusBadge tone="info">
            {event._count.certificates} certificates issued
          </StatusBadge>
        </div>
      </AdminSectionCard>
      {children}
    </div>
  );
}
