import Link from "next/link";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { VerifyLookupForm } from "@/components/verify-lookup-form";

const communityUrl =
  process.env.GDG_COMMUNITY_URL ??
  "https://gdg.community.dev/gdg-on-campus-roorkee-institute-of-technology-roorkee-india";

export default function VerifyIndexPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe,transparent_45%),linear-gradient(140deg,#f8fafc,#ffffff)] px-6 py-12">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-sm backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Verify a GDG certificate
          </p>
          <h1 className="mt-3 font-heading text-3xl text-foreground">
            Confirm authenticity in seconds
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Paste the credential ID, certificate ID, or scanned QR code URL. We
            will confirm the holder details, event, and status instantly.
          </p>
          <div className="mt-6">
            <VerifyLookupForm placeholder="Credential ID or certificate ID" />
          </div>
        </header>

        <section className="grid gap-4 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="font-heading text-2xl text-foreground">
              What gets verified
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Participant name, roll number, and branch.</li>
              <li>Event name, date, and issued status.</li>
              <li>Revoked certificates clearly flagged.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-muted/40 bg-muted/20 p-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 text-(--gdg-green)">
              <BadgeCheck className="size-4" />
              Verified certificates carry an official GDG on Campus badge.
            </div>
            <p className="mt-3">
              Need help? Reach out to the chapter team for support.
            </p>
            <Link
              href={communityUrl}
              className="mt-3 inline-flex items-center gap-2 font-semibold text-(--gdg-blue)"
              target="_blank"
              rel="noreferrer"
            >
              Visit GDG on Campus
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
