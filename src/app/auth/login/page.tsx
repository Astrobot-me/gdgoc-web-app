"use client";

import { signIn } from "next-auth/react";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const communityUrl =
  process.env.NEXT_PUBLIC_GDG_COMMUNITY_URL ??
  "https://gdg.community.dev/gdg-on-campus-roorkee-institute-of-technology-roorkee-india";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe,transparent_50%),linear-gradient(140deg,#f8fafc,#ffffff)] px-6 py-12">
      <main className="mx-auto flex w-full max-w-md flex-col gap-8 rounded-3xl border border-white/70 bg-white/80 p-8 text-center shadow-sm backdrop-blur">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-(--gdg-blue)/10 text-(--gdg-blue)">
          <ShieldCheck className="size-6" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Admin login
          </p>
          <h1 className="mt-3 font-heading text-2xl text-foreground">
            Sign in to manage certificates
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Admin access is restricted to approved GDG on Campus organizers.
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          onClick={() => signIn("google", { callbackUrl: "/admin/events" })}
          className="gap-2"
        >
          Continue with Google
          <ArrowUpRight className="size-4" />
        </Button>
        <Link
          href={communityUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold uppercase tracking-[0.2em] text-(--gdg-blue)"
        >
          Back to community
        </Link>
      </main>
    </div>
  );
}
