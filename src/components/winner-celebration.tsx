"use client";

import { Trophy } from "lucide-react";
import { CertificateAwardMarker } from "@/components/certificate-type-badge";
import { ConfettiTrigger } from "@/components/confetti-trigger";

export function WinnerCelebration({
  awardLabel,
  eventName,
  autoPlay = true,
}: {
  awardLabel?: string | null;
  eventName: string;
  autoPlay?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-amber-400/25 bg-[linear-gradient(135deg,rgba(255,251,235,0.95),rgba(255,247,214,0.88),rgba(255,255,255,0.92))] p-6 shadow-[0_24px_80px_rgba(245,158,11,0.16)] dark:border-amber-300/12 dark:bg-[linear-gradient(135deg,rgba(56,35,8,0.92),rgba(40,28,8,0.88),rgba(17,24,39,0.95))]">
      <div className="relative flex flex-col gap-4">
        <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-amber-400/18 text-amber-700 dark:bg-amber-300/14 dark:text-amber-100">
          <Trophy className="size-7" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700/80 dark:text-amber-100/70">
            Achievement unlocked
          </p>
          <h2 className="mt-3 font-heading text-3xl text-foreground">
            Congratulations on your achievement
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Your certificate confirms a standout result in {eventName}. Share it proudly and celebrate what you earned.
          </p>
        </div>
        <CertificateAwardMarker label={awardLabel} />
        <ConfettiTrigger autoPlay={autoPlay} label="Celebrate again" />
      </div>
    </div>
  );
}
