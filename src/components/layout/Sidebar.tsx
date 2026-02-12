"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  label: string;
  href: string;
  adminOnly?: boolean;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: "ダッシュボード", href: "/dashboard" },
  { label: "コース一覧", href: "/courses" },
  { label: "マイコース", href: "/my-courses" },
  { label: "証明書", href: "/my-certificates" },
  { label: "プロフィール", href: "/profile" },
  { label: "コース管理", href: "/admin/courses/new", adminOnly: true },
  { label: "ユーザー管理", href: "/admin/users", adminOnly: true },
  { label: "進捗管理", href: "/admin/progress", adminOnly: true },
  { label: "分析", href: "/admin/analytics", adminOnly: true },
  { label: "監査ログ", href: "/admin/audit-logs", adminOnly: true },
  { label: "提出管理", href: "/admin/submissions", roles: ["ADMIN", "INSTRUCTOR"] },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobile, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const userRole = user?.role;
  const isAdmin = userRole === "ADMIN";

  const filteredItems = navItems.filter((item) => {
    if (item.roles) return userRole ? item.roles.includes(userRole) : false;
    if (item.adminOnly) return isAdmin;
    return true;
  });

  return (
    <>
      {/* Mobile overlay */}
      {mobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={
          mobile
            ? "fixed left-0 top-0 z-50 w-64 h-full bg-background border-r border-foreground/10 md:hidden"
            : "hidden md:block w-56 shrink-0 border-r border-foreground/10 bg-background min-h-[calc(100vh-4rem)]"
        }
      >
        {mobile && (
          <div className="flex items-center justify-between p-4 border-b border-foreground/10">
            <span className="font-bold text-foreground">メニュー</span>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-foreground/5 text-foreground/60"
              aria-label="メニューを閉じる"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        <nav className="p-4 space-y-1">
          {filteredItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
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
    </>
  );
}
