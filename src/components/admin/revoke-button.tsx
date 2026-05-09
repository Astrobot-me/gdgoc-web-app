"use client";

import { useState, useTransition } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant={isRevoked ? "secondary" : "destructive"}
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
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isRevoked ? "Restore certificate?" : "Revoke certificate?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isRevoked
              ? "This will mark the certificate as active again and allow it to verify normally."
              : "This will mark the certificate as revoked and the public verification page will show it as revoked."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleToggle}>
            {isRevoked ? "Restore certificate" : "Revoke certificate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
