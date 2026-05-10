import { notFound } from "next/navigation";
import { CertificateTable } from "@/components/admin/certificate-table";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

type EventCertificatesPageProps = {
  params: Promise<{ eventId: string }>;
};

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);

export default async function EventCertificatesPage({
  params,
}: EventCertificatesPageProps) {
  const { eventId } = await params;
  const eventIdValue = Number(eventId);
  if (Number.isNaN(eventIdValue)) {
    notFound();
  }
  const event = await prisma.event.findUnique({
    where: { id: eventIdValue },
  });

  if (!event) {
    notFound();
  }

  const certificates = await prisma.certificate.findMany({
    where: { eventId: eventIdValue },
    orderBy: { issuedAt: "desc" },
  });

  const revokedCount = certificates.filter((cert) => cert.revokedAt).length;
  const uniqueParticipants = new Set(
    certificates.map((cert) => cert.rollNumber),
  ).size;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Issued certificates", value: certificates.length },
          { label: "Unique participants", value: uniqueParticipants },
          { label: "Revoked records", value: revokedCount },
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

      <CertificateTable
        eventId={eventIdValue}
        rows={certificates.map((cert) => ({
          id: String(cert.id),
          certificateId: cert.certificateId,
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
