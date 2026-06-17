"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Hotel, Utensils, CalendarDays, CheckSquare, Settings } from "lucide-react";

const tabs = [
  { href: "/",            label: "בית",       Icon: LayoutDashboard },
  { href: "/hotels",      label: "מלונות",    Icon: Hotel           },
  { href: "/restaurants", label: "מסעדות",    Icon: Utensils        },
  { href: "/planner",     label: "מסלול",     Icon: CalendarDays    },
  { href: "/checklist",   label: "צ'קליסט",  Icon: CheckSquare     },
  { href: "/settings",    label: "הגדרות",    Icon: Settings        },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid #f0f0f0",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        fontFamily: "'Rubik', system-ui, sans-serif",
      }}
    >
      <div className="flex">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-0.5 py-3 transition-colors duration-150"
              style={{ color: active ? "#171717" : "#a3a3a3", textDecoration: "none", minHeight: 56 }}
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-150"
                style={{ background: active ? "#f5f5f5" : "transparent" }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, lineHeight: 1 }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
