import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BarChart3, Rows3 } from "lucide-react";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { SingleCertificateForm } from "@/components/admin/single-certificate-form";
import { UploadPanel } from "@/components/admin/upload-panel";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type EventIssuancePageProps = {
  params: Promise<{ eventId: number }>;
};

export default async function AdminEventIssuancePage({
  params,
}: EventIssuancePageProps) {
  const { eventId } = await params;
  const event = await prisma.event.findUnique({ where: { id: eventId } });

  if (!event) {
    notFound();
  }

  const [certificateCount, revokedCount, branchesRepresented] = await Promise.all([
    prisma.certificate.count({ where: { eventId } }),
    prisma.certificate.count({ where: { eventId, revokedAt: { not: null } } }),
    prisma.certificate.findMany({
      where: { eventId },
      distinct: ["branch"],
      select: { branch: true },
    }),
  ]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(22rem,26rem)_minmax(0,1fr)]">
      <div className="grid gap-6">
        <UploadPanel eventId={eventId} />
        <SingleCertificateForm eventId={eventId} />
      </div>

      <div className="grid gap-6">
        <AdminSectionCard
          eyebrow="Issuance workspace"
          title="Keep certificate issuing focused"
          description="This screen is only for creating and importing certificates. Records and analytics now live on their own routes."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Total certificates", value: certificateCount },
              {
                label: "Active certificates",
                value: certificateCount - revokedCount,
              },
              { label: "Branches represented", value: branchesRepresented.length },
            ].map((stat) => (
              <Card key={stat.label} className="rounded-2xl bg-muted/20 shadow-none">
                <CardContent className="px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </AdminSectionCard>

        <section className="grid gap-4 lg:grid-cols-2">
          <AdminSectionCard
            eyebrow="Participant records"
            title="Review the full issuance table"
            description="Search, inspect, and revoke certificates without the forms competing for attention."
          >
            <Button asChild className="gap-2">
              <Link href={`/admin/events/${eventId}/certificates`}>
                Open records
                <Rows3 className="size-4" />
              </Link>
            </Button>
          </AdminSectionCard>

          <AdminSectionCard
            eyebrow="Analytics"
            title="Open the dedicated metrics screen"
            description="Charts now use the full viewport instead of stacking underneath forms and tables."
          >
            <Button asChild variant="outline" className="gap-2">
              <Link href={`/admin/events/${eventId}/analytics`}>
                Open analytics
                <BarChart3 className="size-4" />
              </Link>
            </Button>
          </AdminSectionCard>
        </section>

        <AdminSectionCard
          eyebrow="Export"
          title="Download event data"
          description="Generate a CSV export when you need an offline list of every certificate issued for this event."
        >
          <div className="flex flex-wrap gap-3">
            <Button asChild size="sm" variant="outline">
              <a href={`/api/admin/events/${eventId}/export?format=csv`}>
                Download CSV
                <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>
        </AdminSectionCard>
      </div>
    </div>
  );
}
