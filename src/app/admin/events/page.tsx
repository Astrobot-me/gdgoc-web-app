import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CreateEventForm } from "@/components/admin/create-event-form";

export const dynamic = "force-dynamic";

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
          <div
            key={stat.label}
            className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-3 text-2xl font-semibold text-foreground">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-muted/50 bg-white/80 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Events
              </p>
              <h1 className="mt-2 font-heading text-2xl text-foreground">
                Manage chapter events
              </h1>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-(--gdg-blue)"
            >
              View public site
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <th className="py-2">Event</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Certificates</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/40">
                {events.map((event) => (
                  <tr key={event.id} className="text-foreground">
                    <td className="py-3">
                      <div className="font-semibold">{event.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {event.description ?? "No description"}
                      </div>
                    </td>
                    <td>{formatDate(event.eventDate)}</td>
                    <td>{event.venue ?? "-"}</td>
                    <td>{event._count.certificates}</td>
                    <td className="text-right">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="inline-flex items-center gap-2 rounded-full border border-muted/50 px-3 py-1 text-xs font-semibold"
                      >
                        Open
                        <ArrowUpRight className="size-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!events.length ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No events yet. Create your first event.
              </p>
            ) : null}
          </div>
        </div>

        <CreateEventForm />
      </section>
    </div>
  );
}
