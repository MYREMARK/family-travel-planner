"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UtensilsCrossed, CalendarDays, CheckSquare, LayoutDashboard, Wallet, Globe, Settings } from "lucide-react";

const links = [
  { href: "/",            label: "סקירה",    Icon: LayoutDashboard },
  { href: "/planner",     label: "מסלול",    Icon: CalendarDays    },
  { href: "/restaurants", label: "מסעדות",   Icon: UtensilsCrossed },
  { href: "/checklist",   label: "צ'קליסט", Icon: CheckSquare     },
  { href: "/hub",         label: "מרכז",     Icon: Globe           },
  { href: "/budget",      label: "תקציב",    Icon: Wallet          },
  { href: "/settings",    label: "הגדרות",   Icon: Settings        },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">

        {/* wordmark */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#171717] text-white text-sm font-bold transition-transform group-hover:scale-105">
            ✈
          </div>
          <span className="text-base font-semibold tracking-tight text-[#171717]">
            Travel Planner
          </span>
        </Link>

        {/* nav links */}
        <nav className="flex items-center gap-1">
          {links.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-[15px] font-medium transition-all duration-150",
                  active
                    ? "bg-[#171717] text-white"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-[#171717]"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
