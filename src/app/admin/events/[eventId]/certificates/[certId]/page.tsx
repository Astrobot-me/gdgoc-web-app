import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ShareButton } from "@/components/share-button";
import { RevokeButton } from "@/components/admin/revoke-button";

export const dynamic = "force-dynamic";

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
      <section className="rounded-3xl border border-muted/50 bg-white/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Certificate detail
            </p>
            <h1 className="mt-2 font-heading text-2xl text-foreground">
              {certificate.holderName}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {certificate.event.name} • {formatDate(certificate.event.eventDate)}
            </p>
          </div>
          <Link
            href={`/admin/events/${eventId}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-(--gdg-blue)"
          >
            Back to event
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-muted/50 bg-white/80 p-6 shadow-sm">
          <h2 className="font-heading text-xl text-foreground">
            Certificate preview
          </h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-muted/40 bg-white">
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
            <a
              href={`${baseUrl}/api/certificate/${verifyId}/image`}
              className="inline-flex items-center gap-2 rounded-full border border-muted/50 px-3 py-1 text-xs font-semibold"
              download
            >
              Download image
              <ArrowUpRight className="size-4" />
            </a>
            <ShareButton value={verifyUrl} />
          </div>
        </div>

        <div className="rounded-3xl border border-muted/50 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl text-foreground">
              Certificate status
            </h2>
            <BadgeCheck className="size-5 text-(--gdg-green)" />
          </div>
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
              {certificate.revokedAt ? "Revoked" : "Active"}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <RevokeButton
              certId={verifyId}
              revokedAt={certificate.revokedAt?.toISOString() ?? null}
            />
            <Link
              href={verifyUrl}
              className="inline-flex items-center gap-2 rounded-full border border-muted/50 px-3 py-1 text-xs font-semibold"
            >
              Open verification link
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
