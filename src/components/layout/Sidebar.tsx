"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  label: string;
  href: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "ダッシュボード", href: "/dashboard" },
  { label: "コース一覧", href: "/courses" },
  { label: "マイコース", href: "/my-courses" },
  { label: "プロフィール", href: "/profile" },
  { label: "コース管理", href: "/admin/courses/new", adminOnly: true },
  { label: "ユーザー管理", href: "/admin/users", adminOnly: true },
  { label: "進捗管理", href: "/admin/progress", adminOnly: true },
  { label: "提出管理", href: "/admin/submissions", adminOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  return (
    <aside className="w-56 shrink-0 border-r border-foreground/10 bg-background min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-1">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-foreground/10 text-foreground"
                    : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
