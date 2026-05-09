import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CertificateNotFound() {
  return (
    <div className="rounded-3xl border border-muted/50 bg-white/80 p-10 text-center shadow-sm">
      <h1 className="font-heading text-2xl text-foreground">
        Certificate not found
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        The certificate ID is invalid or no longer available.
      </p>
      <Button asChild className="mt-6">
        <Link href="/admin/events">Back to events</Link>
      </Button>
    </div>
  );
}
