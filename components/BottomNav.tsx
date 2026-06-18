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
        // Full-width anchor; visual content is padded up above gesture zone
        background: "transparent",
        fontFamily: "'Rubik', system-ui, sans-serif",
        // Reserve space for the safe-area + 16px extra so the bar floats above gesture handles
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
        paddingLeft: 12,
        paddingRight: 12,
      }}
    >
      {/* Floating pill — visually separated from phone edge */}
      <div
        className="flex overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.98)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: 24,
          border: "1.5px solid #d4d4d4",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)",
          // Inner tab row height — 60px gives comfortable 56×60 touch area per tab
          height: 60,
        }}
      >
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              // Each link fills its flex-1 column: 60px tall × ≥52px wide on 375px device
              className="flex flex-1 flex-col items-center justify-center gap-1 transition-colors duration-150"
              style={{
                textDecoration: "none",
                minHeight: 60,
                minWidth: 44,
                // Extend tap area slightly beyond icon for comfort
                padding: "0 4px",
              }}
            >
              {/* Active pill: solid dark background, white icon */}
              <div
                className="flex items-center justify-center rounded-2xl transition-all duration-200"
                style={{
                  width: 48,
                  height: 34,
                  background: active ? "#171717" : "transparent",
                  flexShrink: 0,
                }}
              >
                <Icon
                  style={{
                    // 26px — ~18% larger than previous 22px, hits the user's 15-25% request
                    width: 26,
                    height: 26,
                    color: active ? "#ffffff" : "#525252",
                    flexShrink: 0,
                  }}
                />
              </div>
              {/* Label — 11px, high contrast for sunlight readability */}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: active ? 700 : 500,
                  lineHeight: 1,
                  color: active ? "#171717" : "#525252",
                  letterSpacing: active ? "-0.01em" : "0",
                  flexShrink: 0,
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
