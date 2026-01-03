"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

type Props = {
  href: string;
  label: string;
  ariaLabel?: string;
  className?: string;
};

export default function SectionCTA({ href, label, ariaLabel, className }: Props) {
  const pathname = usePathname() || "/";
  const normalize = (p: string) => (p.endsWith("/") && p !== "/" ? p.slice(0, -1) : p);

  if (normalize(pathname) === normalize(href)) return null;

  return (
    <div className="mt-8 flex justify-center">
      <Link
        href={href}
        className={
          className ||
          "inline-flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--accent)_60%,transparent)] px-4 py-2 text-sm text-[var(--text)] transition hover:shadow-[0_0_20px_var(--glow)] focus-ring"
        }
        aria-label={ariaLabel}
      >
        {label} <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
      </Link>
    </div>
  );
}
