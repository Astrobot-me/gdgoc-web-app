import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { AlertTriangle, BadgeCheck, ArrowUpRight } from "lucide-react";
import { CertificateTypeBadge } from "@/components/certificate-type-badge";
import { ConfettiTrigger } from "@/components/confetti-trigger";
import { ShareButton } from "@/components/share-button";
import { WinnerCelebration } from "@/components/winner-celebration";
import { Button } from "@/components/ui/button";

export const runtime = "nodejs";

type VerifyPageProps = {
  params: Promise<{ certId: string }>;
};

type VerifyResponse = {
  status: "valid" | "revoked";
  certificate: {
    certificateId: string;
    credentialId: string;
    holderName: string;
    rollNumber: string;
    branch: string;
    certificateType: "PARTICIPATION" | "WINNER";
    description: string | null;
    issuedAt: string;
    revokedAt: string | null;
  };
  event: {
    id: string;
    name: string;
    description: string | null;
    eventDate: string;
    venue: string | null;
    bannerUrl: string | null;
  };
};

const communityUrl =
  process.env.GDG_COMMUNITY_URL ??
  "https://gdg.community.dev/gdg-on-campus-roorkee-institute-of-technology-roorkee-india";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const getBaseUrl = async () => {
  const headerStore = await headers();
  const host = headerStore.get("host");
  if (!host) {
    return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  }
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
};

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { certId } = await params;
  const baseUrl = await getBaseUrl();

  let response: Response | null = null;
  let payload: VerifyResponse | null = null;

  if (baseUrl) {
    response = await fetch(`${baseUrl}/api/verify/${certId}`, {
      cache: "no-store",
    });
  }

  if (response?.ok) {
    payload = (await response.json()) as VerifyResponse;
  }

  const status = payload?.status ?? "not_found";
  const isValid = status === "valid";
  const isRevoked = status === "revoked";
  const verifyId = payload?.certificate.credentialId ?? certId;
  const verifyUrl = `${baseUrl}/verify/${verifyId}`;
  const awardLabel =
    payload?.certificate.certificateType === "WINNER"
      ? payload.certificate.description
      : undefined;

  const qrCode = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 140,
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe,transparent_50%),linear-gradient(160deg,#f8fafc,#ffffff)] px-6 py-12">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/80 p-8 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Certificate Verification
              </p>
              <h1 className="mt-2 font-heading text-3xl text-foreground">
                {isValid && "Certificate verified"}
                {isRevoked && "Certificate revoked"}
                {!isValid && !isRevoked && "Certificate not found"}
              </h1>
            </div>
            <div
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                isValid
                  ? "bg-(--gdg-green)/15 text-(--gdg-green)"
                  : "bg-(--gdg-red)/15 text-(--gdg-red)"
              }`}
            >
              {isValid ? "Verified" : isRevoked ? "Revoked" : "Invalid"}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            This page confirms the authenticity of a GDG on Campus certificate.
          </p>
        </header>

        {!isValid && !isRevoked ? (
          <section className="rounded-3xl border border-white/70 bg-white/80 p-10 text-center shadow-sm">
            <AlertTriangle className="mx-auto size-10 text-(--gdg-red)" />
            <h2 className="mt-4 font-heading text-2xl text-foreground">
              Certificate not found
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Double-check the verification link or contact the GDG on Campus
              team for help.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href={communityUrl} target="_blank" rel="noreferrer">
                  Contact the chapter
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
              <ShareButton value={verifyUrl} />
            </div>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm">
              <h2 className="font-heading text-2xl text-foreground">
                Certificate details
              </h2>
              {payload?.certificate.certificateType ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <CertificateTypeBadge
                    certificateType={payload.certificate.certificateType}
                    label={awardLabel}
                  />
                </div>
              ) : null}
              <div className="mt-6 grid gap-4 text-sm">
                <div className="flex items-center justify-between border-b border-muted/40 pb-3">
                  <span className="text-muted-foreground">Credential ID</span>
                  <span className="font-semibold text-foreground">
                    {payload?.certificate.credentialId}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-muted/40 pb-3">
                  <span className="text-muted-foreground">Certificate ID</span>
                  <span className="font-semibold text-foreground">
                    {payload?.certificate.certificateId}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-muted/40 pb-3">
                  <span className="text-muted-foreground">Holder name</span>
                  <span className="font-semibold text-foreground">
                    {payload?.certificate.holderName}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-muted/40 pb-3">
                  <span className="text-muted-foreground">Roll number</span>
                  <span className="font-semibold text-foreground">
                    {payload?.certificate.rollNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-muted/40 pb-3">
                  <span className="text-muted-foreground">Branch</span>
                  <span className="font-semibold text-foreground">
                    {payload?.certificate.branch}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-muted/40 pb-3">
                  <span className="text-muted-foreground">Event</span>
                  <span className="font-semibold text-foreground">
                    {payload?.event.name}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-muted/40 pb-3">
                  <span className="text-muted-foreground">Event date</span>
                  <span className="font-semibold text-foreground">
                    {payload?.event.eventDate
                      ? formatDate(payload.event.eventDate)
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-muted/40 pb-3">
                  <span className="text-muted-foreground">Issued on</span>
                  <span className="font-semibold text-foreground">
                    {payload?.certificate.issuedAt
                      ? formatDate(payload.certificate.issuedAt)
                      : "-"}
                  </span>
                </div>
                {payload?.certificate.description ? (
                  <div className="rounded-2xl border border-muted/40 bg-muted/30 p-4 text-sm text-muted-foreground">
                    {payload.certificate.description}
                  </div>
                ) : null}
                {payload?.event.venue ? (
                  <div className="flex items-center justify-between border-b border-muted/40 pb-3">
                    <span className="text-muted-foreground">Venue</span>
                    <span className="font-semibold text-foreground">
                      {payload.event.venue}
                    </span>
                  </div>
                ) : null}
                {payload?.event.description ? (
                  <div className="rounded-2xl border border-muted/40 bg-muted/30 p-4 text-sm text-muted-foreground">
                    {payload.event.description}
                  </div>
                ) : null}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <ShareButton value={verifyUrl} />
                <Button asChild variant="secondary">
                  <Link href={communityUrl} target="_blank" rel="noreferrer">
                    Powered by GDG on Campus
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {isValid && !isRevoked ? (
                payload?.certificate.certificateType === "WINNER" ? (
                  <WinnerCelebration
                    eventName={payload.event.name}
                    awardLabel={awardLabel}
                    autoPlay
                  />
                ) : (
                  <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm">
                    <h3 className="font-heading text-xl text-foreground">
                      Celebrate the verification
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This certificate is verified and ready to share. Throw some confetti or send the link below.
                    </p>
                    <div className="mt-4">
                      <ConfettiTrigger autoPlay label="Throw confetti" />
                    </div>
                  </div>
                )
              ) : null}

              {isRevoked ? (
                <div className="flex items-center gap-2 rounded-3xl border border-(--gdg-red)/30 bg-(--gdg-red)/10 px-4 py-4 text-sm text-(--gdg-red)">
                  <AlertTriangle className="size-4" />
                  This certificate has been revoked by the chapter admins.
                </div>
              ) : null}

              <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Shareable QR
                    </p>
                    <h4 className="mt-2 font-heading text-xl text-foreground">
                      Scan to verify
                    </h4>
                  </div>
                  <BadgeCheck className="size-6 text-(--gdg-green)" />
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <Image
                    src={qrCode}
                    alt="Verification QR code"
                    width={140}
                    height={140}
                    className="rounded-2xl border border-muted/40 bg-white p-2"
                    unoptimized
                  />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Share this QR code alongside the certificate to let others
                      verify instantly.
                    </p>
                    <Link
                      href={verifyUrl}
                      className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-(--gdg-blue)"
                    >
                      Open verification link
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
