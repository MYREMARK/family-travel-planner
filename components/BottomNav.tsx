"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Utensils, CheckSquare, Wallet, Settings } from "lucide-react";

const tabs = [
  { href: "/",            label: "בית",      Icon: LayoutDashboard },
  { href: "/planner",     label: "מסלול",    Icon: CalendarDays    },
  { href: "/restaurants", label: "מסעדות",   Icon: Utensils        },
  { href: "/checklist",   label: "צ'קליסט", Icon: CheckSquare     },
  { href: "/budget",      label: "תקציב",    Icon: Wallet          },
  { href: "/settings",    label: "הגדרות",   Icon: Settings        },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        // High-opacity background for outdoor sunlight readability
        background: "rgba(255,255,255,0.98)",
        backdropFilter: "blur(16px)",
        borderTop: "1.5px solid #d4d4d4",
        boxShadow: "0 -2px 16px rgba(0,0,0,0.10)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        fontFamily: "'Rubik', system-ui, sans-serif",
      }}
    >
      <div className="flex" style={{ height: 68 }}>
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              // Full-height tap area — each tab is (screen width / 6) × 68px ≥ 48px touch target
              className="flex flex-1 flex-col items-center justify-center gap-1 transition-colors duration-150"
              style={{
                color: active ? "#171717" : "#525252",
                textDecoration: "none",
                minHeight: 68,
                minWidth: 44,
              }}
            >
              {/* Icon pill — 44×36 touch-friendly container, filled when active */}
              <div
                className="flex items-center justify-center rounded-2xl transition-all duration-200"
                style={{
                  width: 44,
                  height: 32,
                  background: active ? "#171717" : "transparent",
                }}
              >
                <Icon
                  style={{
                    width: 22,
                    height: 22,
                    color: active ? "#ffffff" : "#525252",
                  }}
                />
              </div>
              {/* Label — 11px, high-contrast for outdoor readability */}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: active ? 700 : 500,
                  lineHeight: 1,
                  color: active ? "#171717" : "#525252",
                  letterSpacing: active ? "-0.01em" : "0",
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
