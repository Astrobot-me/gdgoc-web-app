import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const communityUrl =
  process.env.GDG_COMMUNITY_URL ??
  "https://gdg.community.dev/gdg-on-campus-roorkee-institute-of-technology-roorkee-india";

export default function VerifyNotFound() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fee2e2,transparent_50%),#ffffff] px-6 py-12">
      <main className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 rounded-3xl border border-white/70 bg-white/90 p-10 text-center shadow-sm">
        <AlertTriangle className="size-12 text-(--gdg-red)" />
        <h1 className="font-heading text-2xl text-foreground">
          Certificate not found
        </h1>
        <p className="text-sm text-muted-foreground">
          The verification link is invalid or no longer available.
        </p>
        <Button asChild size="lg">
          <Link href={communityUrl} target="_blank" rel="noreferrer">
            Contact the chapter
          </Link>
        </Button>
      </main>
    </div>
  );
}