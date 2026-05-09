"use client";

import { useState, useTransition } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type RevokeButtonProps = {
  certId: string;
  revokedAt?: string | null;
  onChange?: (value: string | null) => void;
};

export function RevokeButton({ certId, revokedAt, onChange }: RevokeButtonProps) {
  const [current, setCurrent] = useState(revokedAt ?? null);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const response = await fetch(`/api/admin/certificates/${certId}/revoke`, {
        method: "POST",
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as {
        certificate: { revokedAt: string | null };
      };

      setCurrent(data.certificate.revokedAt);
      onChange?.(data.certificate.revokedAt);
    });
  };

  const isRevoked = Boolean(current);

  return (
    <Button
      type="button"
      size="sm"
      variant={isRevoked ? "secondary" : "destructive"}
      onClick={handleToggle}
      disabled={isPending}
      className="gap-2"
    >
      {isRevoked ? "Restore" : "Revoke"}
      {isRevoked ? (
        <ShieldCheck className="size-4" />
      ) : (
        <ShieldAlert className="size-4" />
      )}
    </Button>
  );
}
