"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import NotificationBell from "@/components/layout/NotificationBell";
import ThemeToggle from "@/components/layout/ThemeToggle";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-foreground/10 bg-background">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="md:hidden p-2 rounded-lg hover:bg-foreground/5 text-foreground/60"
              aria-label="メニューを開く"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}
          <Link href="/dashboard" className="text-xl font-bold text-foreground">
            SkillBridge LMS
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <NotificationBell />
          <span className="hidden sm:inline text-sm text-foreground/60">
            {user?.username}
            {user?.role === "ADMIN" && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-foreground/10 rounded">
                管理者
              </span>
            )}
          </span>
          <Button variant="outline" onClick={logout}>
            ログアウト
          </Button>
        </div>
      </div>
    </header>
  );
}
