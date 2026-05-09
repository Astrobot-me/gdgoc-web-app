"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="gap-2"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sign out
      <LogOut className="size-4" />
    </Button>
  );
}
