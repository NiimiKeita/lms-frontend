"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-foreground/10 bg-background">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-foreground">
          SkillBridge LMS
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-sm text-foreground/60">
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
