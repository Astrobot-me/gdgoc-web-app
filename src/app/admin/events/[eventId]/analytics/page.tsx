import { notFound } from "next/navigation";
import { EventAnalytics } from "@/components/admin/event-analytics";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

type EventAnalyticsPageProps = {
  params: Promise<{ eventId: string }>;
};

const formatDateKey = (value: Date) =>
  value.toISOString().slice(0, 10);

export default async function EventAnalyticsPage({
  params,
}: EventAnalyticsPageProps) {
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
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total certificates", value: certificates.length },
          { label: "Active certificates", value: certificates.length - revokedCount },
          { label: "Revoked certificates", value: revokedCount },
          { label: "Branches represented", value: branchMetrics.length },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <EventAnalytics
        branchMetrics={branchMetrics}
        issuedMetrics={issuedMetrics}
        statusMetrics={statusMetrics}
        verifyMetrics={verifyMetrics}
      />
    </div>
  );
}
