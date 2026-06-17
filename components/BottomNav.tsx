"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Hotel, Utensils, Compass, CheckSquare, Wallet, Map, Settings } from "lucide-react";

const tabs = [
  { href: "/",            label: "בית",       Icon: LayoutDashboard },
  { href: "/hotels",      label: "מלונות",    Icon: Hotel           },
  { href: "/restaurants", label: "מסעדות",    Icon: Utensils        },
  { href: "/planner",     label: "אטרקציות",  Icon: Compass         },
  { href: "/checklist",   label: "צ'קליסט",  Icon: CheckSquare     },
  { href: "/budget",      label: "תקציב",     Icon: Wallet          },
  { href: "/map",         label: "מפה",       Icon: Map             },
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
              className="flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors duration-150"
              style={{ color: active ? "#171717" : "#a3a3a3", textDecoration: "none", minHeight: 52 }}
            >
              <div
                className="flex h-6 w-6 items-center justify-center rounded-lg transition-all duration-150"
                style={{ background: active ? "#f5f5f5" : "transparent" }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span style={{ fontSize: 9, fontWeight: active ? 700 : 400, lineHeight: 1 }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
