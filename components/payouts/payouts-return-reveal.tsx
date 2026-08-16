"use client";

import { PAYOUTS_PATH } from "@/lib/app-paths";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  justReturned: boolean;
  intro: React.ReactNode;
  children: React.ReactNode;
};

export function PayoutsReturnReveal({ justReturned, intro, children }: Props) {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(justReturned);

  useEffect(() => {
    if (!justReturned) return;
    const timeout = window.setTimeout(() => {
      setShowIntro(false);
      router.replace(PAYOUTS_PATH);
    }, 1100);
    return () => window.clearTimeout(timeout);
  }, [justReturned, router]);

  return showIntro ? intro : children;
}
