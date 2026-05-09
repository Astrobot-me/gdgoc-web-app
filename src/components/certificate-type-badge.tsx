import type { ReactNode } from "react";
import { Award, Medal, Users } from "lucide-react";
import {
  certificateTypeLabels,
  type CertificateTypeValue,
} from "@/lib/certificate-types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CertificateTypeBadgeProps = {
  certificateType: CertificateTypeValue;
  distinction?: string | null;
  className?: string;
};

const winnerPalette = "border-transparent bg-amber-400/18 text-amber-700 dark:bg-amber-300/18 dark:text-amber-200";
const participantPalette =
  "border-transparent bg-sky-500/14 text-sky-700 dark:bg-sky-400/16 dark:text-sky-200";

export function CertificateTypeBadge({
  certificateType,
  distinction,
  className,
}: CertificateTypeBadgeProps) {
  const isWinner = certificateType === "WINNER";
  const label = isWinner ? distinction || certificateTypeLabels.WINNER : certificateTypeLabels.PARTICIPATION;
  const Icon = isWinner ? Medal : Users;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        isWinner ? winnerPalette : participantPalette,
        className,
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </Badge>
  );
}

export function CertificateAwardMarker({
  distinction,
  className,
}: {
  distinction?: string | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/14 px-4 py-2 text-sm font-semibold text-amber-700 dark:border-amber-300/18 dark:bg-amber-300/14 dark:text-amber-100",
        className,
      )}
    >
      <Award className="size-4" />
      {distinction || "Winner"}
    </div>
  );
}
