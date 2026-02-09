"use client";

import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">ダッシュボード</h1>

      <Card>
        <h2 className="text-lg font-semibold mb-4">
          ようこそ、{user?.username} さん
        </h2>
        <p className="text-foreground/60">
          SkillBridge LMS へようこそ。ここからコースの学習を始めましょう。
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h3 className="font-semibold text-foreground/80">受講中のコース</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </Card>
        <Card>
          <h3 className="font-semibold text-foreground/80">完了したレッスン</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </Card>
        <Card>
          <h3 className="font-semibold text-foreground/80">提出した課題</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </Card>
      </div>
    </div>
  );
}
