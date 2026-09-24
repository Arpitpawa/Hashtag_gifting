"use client";

// ── Shared storefront button ──────────────────────────────────────────────
// Consolidates what was ~14 hand-copied button styles (different paddings,
// font sizes, hover shades for what was meant to be the same 3 button
// "families") into one component with a fixed, small variant set:
//   - solid / outline   → brand rose, primary vs secondary actions
//   - dark / dark-outline → the site's established secondary/neutral action
//     color (e.g. "Buy now", "Track order" next to a rose primary button)
//   - whatsapp           → WhatsApp's own brand green, used consistently
//     for every "chat with us" CTA — kept distinct on purpose, this is a
//     recognizable pattern users already know, not an inconsistency
//   - icon                → round icon-only button (carousel arrows, etc.)
// Renders a <Link> for an internal href, a plain <a> for an external one
// (mailto:, tel:, http(s):, wa.me), or a <button> when no href is given —
// so one component covers every call site regardless of how it navigates.

import { forwardRef } from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const storeButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
  {
    variants: {
      variant: {
        solid:        "bg-[#c0555a] text-white hover:bg-[#a84449]",
        outline:      "border-2 border-[#c0555a] text-[#c0555a] hover:bg-[#c0555a] hover:text-white",
        dark:         "bg-[#1a1a1a] text-white hover:bg-[#333]",
        "dark-outline": "border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white",
        whatsapp:     "bg-[#25D366] text-white hover:bg-[#1da851]",
        icon:         "bg-white shadow-lg border border-[#e8e0d5] text-[#1a1a1a] hover:bg-black hover:text-white",
      },
      size: {
        sm: "px-5 py-2.5 text-[12px]",
        md: "px-7 py-3.5 text-[14px]",
        lg: "px-8 py-4 text-[15px]",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    compoundVariants: [
      // Icon buttons ignore the padding-based sizes above and use a fixed
      // circle diameter instead — this matches every carousel arrow button
      // already on the site (w-11 h-11 at the default/lg size).
      { variant: "icon", size: "sm", class: "w-9 h-9 p-0" },
      { variant: "icon", size: "md", class: "w-10 h-10 p-0" },
      { variant: "icon", size: "lg", class: "w-11 h-11 p-0" },
    ],
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  }
);

export interface StoreButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size">,
    VariantProps<typeof storeButtonVariants> {
  href?: string;
  external?: boolean; // force a plain <a> even for a path that looks internal
  target?: string;
  rel?: string;
}

function isExternalHref(href: string) {
  return /^(https?:|mailto:|tel:|whatsapp:)/i.test(href) || href.startsWith("//");
}

export const StoreButton = forwardRef<HTMLButtonElement, StoreButtonProps>(
  ({ className, variant, size, fullWidth, href, external, target, rel, children, ...props }, ref) => {
    const classes = cn(storeButtonVariants({ variant, size, fullWidth }), className);

    if (href) {
      if (external || isExternalHref(href)) {
        return (
          <a
            href={href}
            target={target}
            rel={target === "_blank" ? rel ?? "noopener noreferrer" : rel}
            className={classes}
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);
StoreButton.displayName = "StoreButton";
