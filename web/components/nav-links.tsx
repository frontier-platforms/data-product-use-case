"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/presentation", label: "Presentation" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/ask", label: "Ask the data" },
  { href: "/how-it-works", label: "How it's built" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="-mx-2 flex flex-wrap text-sm font-semibold">
      {LINKS.map(({ href, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded px-2 py-1.5 transition-colors ${
              active ? "text-cgy-red" : "text-cgy-charcoal hover:text-cgy-red"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
