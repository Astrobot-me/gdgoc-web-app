"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

type ShareButtonProps = {
  value: string;
};

export function ShareButton({ value }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button type="button" variant="outline" onClick={handleCopy}>
      {copied ? (
        <>
          Copied
          <Check className="size-4" />
        </>
      ) : (
        <>
          Copy link
          <Copy className="size-4" />
        </>
      )}
    </Button>
  );
}
