import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { UploadPanel } from "@/components/admin/upload-panel";
import { SingleCertificateForm } from "@/components/admin/single-certificate-form";
import { CertificateTable } from "@/components/admin/certificate-table";
import { EventAnalytics } from "@/components/admin/event-analytics";

export const dynamic = "force-dynamic";

type EventDetailProps = {
  params: Promise<{ eventId: string }>;
};

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);

const formatDateKey = (value: Date) =>
  value.toISOString().slice(0, 10);

export default async function AdminEventDetailPage({ params }: EventDetailProps) {
  const { eventId } = await params;
  const event = await prisma.event.findUnique({ where: { id: eventId } });

  if (!event) {
    notFound();
  }

  const certificates = await prisma.certificate.findMany({
    where: { eventId },
    orderBy: { issuedAt: "desc" },
  });

  const branchMap = new Map<string, number>();
  const issuedMap = new Map<string, number>();
  let revokedCount = 0;

  for (const cert of certificates) {
    branchMap.set(cert.branch, (branchMap.get(cert.branch) ?? 0) + 1);
    const issuedKey = formatDateKey(cert.issuedAt);
    issuedMap.set(issuedKey, (issuedMap.get(issuedKey) ?? 0) + 1);
    if (cert.revokedAt) {
      revokedCount += 1;
    }
  }

  const branchMetrics = Array.from(branchMap.entries()).map(([branch, count]) => ({
    branch,
    count,
  }));
  const issuedMetrics = Array.from(issuedMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  const statusMetrics = [
    { label: "Active", count: certificates.length - revokedCount },
    { label: "Revoked", count: revokedCount },
  ];

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const verifyLogs = await prisma.verificationLog.findMany({
    where: { eventId, createdAt: { gte: since } },
    select: { createdAt: true },
  });

  const verifyMap = new Map<string, number>();
  for (const log of verifyLogs) {
    const key = formatDateKey(log.createdAt);
    verifyMap.set(key, (verifyMap.get(key) ?? 0) + 1);
  }

  const verifyMetrics = Array.from(verifyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-muted/50 bg-white/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Event detail
            </p>
            <h1 className="mt-2 font-heading text-2xl text-foreground">
              {event.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4" />
                {formatDate(event.eventDate)}
              </span>
              <span>{event.venue ?? "RIT Roorkee"}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`/api/admin/events/${eventId}/export?format=csv`}
              className="inline-flex items-center gap-2 rounded-full border border-muted/50 px-3 py-1 text-xs font-semibold"
            >
              Download CSV
              <ArrowUpRight className="size-4" />
            </a>
            <Link
              href="/admin/events"
              className="inline-flex items-center gap-2 text-sm font-semibold text-(--gdg-blue)"
            >
              Back to events
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
        {event.description ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {event.description}
          </p>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-6">
          <UploadPanel eventId={eventId} />
          <SingleCertificateForm eventId={eventId} />
        </div>
        <div className="rounded-3xl border border-muted/50 bg-white/80 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Summary
          </p>
          <h2 className="mt-2 font-heading text-xl text-foreground">
            Event stats
          </h2>
          <div className="mt-4 grid gap-4">
            {[
              { label: "Total certificates", value: certificates.length },
              {
                label: "Active certificates",
                value: certificates.length - revokedCount,
              },
              { label: "Revoked certificates", value: revokedCount },
              { label: "Branches represented", value: branchMetrics.length },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-muted/50 bg-muted/20 px-4 py-3"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-2 text-xl font-semibold text-foreground">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <EventAnalytics
        branchMetrics={branchMetrics}
        issuedMetrics={issuedMetrics}
        statusMetrics={statusMetrics}
        verifyMetrics={verifyMetrics}
      />

      <CertificateTable
        eventId={eventId}
        rows={certificates.map((cert) => ({
          id: cert.id,
          credentialId: cert.credentialId,
          holderName: cert.holderName,
          rollNumber: cert.rollNumber,
          branch: cert.branch,
          issuedAt: formatDate(cert.issuedAt),
          revokedAt: cert.revokedAt?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
