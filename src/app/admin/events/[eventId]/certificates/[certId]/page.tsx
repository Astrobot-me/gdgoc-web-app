import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { CertificateTypeBadge } from "@/components/certificate-type-badge";
import { prisma } from "@/lib/prisma";
import { ShareButton } from "@/components/share-button";
import { RevokeButton } from "@/components/admin/revoke-button";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";

type CertificateDetailProps = {
  params: Promise<{ eventId: string; certId: string }>;
};

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function CertificateDetailPage({
  params,
}: CertificateDetailProps) {
  const { eventId, certId } = await params;
  const eventIdValue = Number(eventId);
  if (Number.isNaN(eventIdValue)) {
    notFound();
  }
  const certificate = await prisma.certificate.findFirst({
    where: {
      eventId: eventIdValue,
      OR: [{ credentialId: certId }, { certificateId: certId }],
    },
    include: { event: true },
  });

  if (!certificate) {
    notFound();
  }

  const verifyId = certificate.credentialId;
  const baseUrl = getBaseUrl();
  const verifyUrl = `${baseUrl}/verify/${verifyId}`;
  const awardLabel =
    certificate.certificateType === "WINNER" ? certificate.description : undefined;

  return (
    <div className="space-y-6">
      <AdminSectionCard
        eyebrow="Certificate detail"
        title={certificate.holderName}
        titleClassName="text-2xl"
        description={`${certificate.event.name} • ${formatDate(certificate.event.eventDate)}`}
        actions={
          <Button asChild variant="link" className="h-auto px-0 text-(--gdg-blue)">
            <Link href={`/admin/events/${eventIdValue}/certificates`}>
              Back to records
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <AdminSectionCard
          title="Certificate info"
          actions={<BadgeCheck className="size-5 text-(--gdg-green)" />}
        >
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">Credential ID:</span>{" "}
              {certificate.credentialId}
            </p>
            <p>
              <span className="font-semibold text-foreground">Certificate ID:</span>{" "}
              {certificate.certificateId}
            </p>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Type:</span>
              <CertificateTypeBadge
                certificateType={certificate.certificateType}
                label={awardLabel}
              />
            </div>
            <p>
              <span className="font-semibold text-foreground">Roll number:</span>{" "}
              {certificate.rollNumber}
            </p>
            <p>
              <span className="font-semibold text-foreground">Branch:</span>{" "}
              {certificate.branch}
            </p>
            <p>
              <span className="font-semibold text-foreground">Issued:</span>{" "}
              {formatDate(certificate.issuedAt)}
            </p>
            <p>
              <span className="font-semibold text-foreground">Status:</span>{" "}
              <StatusBadge tone={certificate.revokedAt ? "revoked" : "active"}>
                {certificate.revokedAt ? "Revoked" : "Active"}
              </StatusBadge>
            </p>
            {certificate.description ? (
              <p>
                <span className="font-semibold text-foreground">Notes:</span>{" "}
                {certificate.description}
              </p>
            ) : null}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <RevokeButton
              certId={verifyId}
              revokedAt={certificate.revokedAt?.toISOString() ?? null}
            />
            <Button asChild size="sm" variant="outline">
              <Link href={verifyUrl}>
                Open verification link
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Share verification">
          <p className="text-sm text-muted-foreground">
            Send this verification link to organizers or employers to confirm authenticity.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ShareButton value={verifyUrl} />
            <Button asChild size="sm" variant="outline">
              <Link href={verifyUrl}>
                Open verification link
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </AdminSectionCard>
      </section>
    </div>
  );
}
