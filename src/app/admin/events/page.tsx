import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { prisma } from "@/lib/prisma";
import { CreateEventForm } from "@/components/admin/create-event-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);

export default async function AdminEventsPage() {
  const [events, certificatesCount, uniqueParticipants, topBranch] =
    await Promise.all([
      prisma.event.findMany({
        orderBy: { eventDate: "desc" },
        include: { _count: { select: { certificates: true } } },
      }),
      prisma.certificate.count(),
      prisma.certificate.findMany({
        distinct: ["rollNumber"],
        select: { rollNumber: true },
      }),
      prisma.certificate.groupBy({
        by: ["branch"],
        _count: { branch: true },
        orderBy: { _count: { branch: "desc" } },
        take: 1,
      }),
    ]);

  const totalEvents = events.length;
  const topBranchName = topBranch[0]?.branch ?? "-";
  const topBranchCount = topBranch[0]?._count.branch ?? 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total events", value: totalEvents },
          { label: "Certificates issued", value: certificatesCount },
          { label: "Unique participants", value: uniqueParticipants.length },
          { label: "Most active branch", value: `${topBranchName} (${topBranchCount})` },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-3 text-2xl font-semibold text-foreground">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <AdminSectionCard
          eyebrow="Events"
          title="Manage chapter events"
          titleClassName="text-2xl"
          actions={
            <Button asChild variant="link" className="h-auto px-0 text-(--gdg-blue)">
              <Link href="/">
                View public site
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          }
        >
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Certificates</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="font-semibold">{event.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {event.description ?? "No description"}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(event.eventDate)}</TableCell>
                    <TableCell>{event.venue ?? "-"}</TableCell>
                    <TableCell>{event._count.certificates}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/events/${event.id}/certificates`}>
                            Records
                          </Link>
                        </Button>
                        <Button asChild size="sm">
                          <Link href={`/admin/events/${event.id}`}>
                            Issuance
                            <ArrowUpRight className="size-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!events.length ? (
              <p className="py-2 text-center text-sm text-muted-foreground">
                No events yet. Create your first event.
              </p>
            ) : null}
          </div>
        </AdminSectionCard>

        <CreateEventForm />
      </section>
    </div>
  );
}
