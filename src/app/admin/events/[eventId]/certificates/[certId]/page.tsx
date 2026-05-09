import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
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
  const certificate = await prisma.certificate.findFirst({
    where: {
      eventId,
      OR: [{ id: certId }, { credentialId: certId }],
    },
    include: { event: true },
  });

  if (!certificate) {
    notFound();
  }

  const verifyId = certificate.credentialId ?? certificate.id;
  const baseUrl = getBaseUrl();
  const verifyUrl = `${baseUrl}/verify/${verifyId}`;

  return (
    <div className="space-y-6">
      <AdminSectionCard
        eyebrow="Certificate detail"
        title={certificate.holderName}
        titleClassName="text-2xl"
        description={`${certificate.event.name} • ${formatDate(certificate.event.eventDate)}`}
        actions={
          <Button asChild variant="link" className="h-auto px-0 text-(--gdg-blue)">
            <Link href={`/admin/events/${eventId}/certificates`}>
              Back to records
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <AdminSectionCard title="Certificate preview">
          <div className="mt-4 overflow-hidden rounded-2xl border border-border/60 bg-background/70">
            <Image
              src={`${baseUrl}/api/certificate/${verifyId}/image`}
              alt="Certificate preview"
              width={1200}
              height={850}
              className="h-auto w-full"
              unoptimized
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <a href={`${baseUrl}/api/certificate/${verifyId}/image`} download>
                Download image
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
            <ShareButton value={verifyUrl} />
          </div>
        </AdminSectionCard>

        <AdminSectionCard
          title="Certificate status"
          actions={<BadgeCheck className="size-5 text-(--gdg-green)" />}
        >
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">ID:</span> {verifyId}
            </p>
            <p>
              <span className="font-semibold text-foreground">Roll number:</span>
              {" "}{certificate.rollNumber}
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
      </section>
    </div>
  );
}
