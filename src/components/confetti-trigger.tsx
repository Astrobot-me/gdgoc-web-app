"use client";

import { useCallback, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfettiTriggerProps = {
  autoPlay?: boolean;
  label?: string;
  className?: string;
};

const confettiDefaults = {
  startVelocity: 30,
  spread: 360,
  ticks: 60,
  zIndex: 0,
};

const randomInRange = (min: number, max: number) =>
  Math.random() * (max - min) + min;

export function ConfettiTrigger({
  autoPlay = false,
  label = "Celebrate again",
  className,
}: ConfettiTriggerProps) {
  const intervalRef = useRef<number | null>(null);
  const hasPlayedRef = useRef(false);

  const fireConfetti = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
    }

    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;

    intervalRef.current = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        if (intervalRef.current !== null) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      const particleCount = Math.round(50 * (timeLeft / duration));
      confetti({
        ...confettiDefaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...confettiDefaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }, []);

  useEffect(() => {
    if (autoPlay && !hasPlayedRef.current) {
      hasPlayedRef.current = true;
      fireConfetti();
    }
  }, [autoPlay, fireConfetti]);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={fireConfetti}
      className={cn("gap-2", className)}
    >
      <PartyPopper className="size-4" />
      {label}
    </Button>
  );
}
