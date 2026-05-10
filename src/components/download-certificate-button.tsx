"use client";

import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { snapshotDiv } from "@/lib/htmlSnapshot";

type DownloadCertificateButtonProps = {
  certId: string;
};

export function DownloadCertificateButton({
  certId,
  className,
}: DownloadCertificateButtonProps & { className?: string }) {
  const handleDownload = async () => {
    const certificateCard = document.getElementById("certifcate-card");

    if (!certificateCard) {
      return;
    }

    // const el : HTMLElement = document.getElementById("certificate-card");
    // console.log(el.scrollWidth, el.scrollHeight, el.getBoundingClientRect());

    await snapshotDiv(certificateCard, `GDG-Certificate-${certId}.png`);
  };

  return (
    <Button type="button" variant="outline" onClick={handleDownload} className={className}>
      Download Certificate
      <ArrowUpRight className="size-4" />
    </Button>
  );
}
