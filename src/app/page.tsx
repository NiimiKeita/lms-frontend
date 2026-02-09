import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <main className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-foreground">
          SkillBridge LMS
        </h1>
        <p className="text-lg text-foreground/70">
          学習管理システム
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            ログイン
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 border border-foreground/20 rounded-lg font-medium hover:bg-foreground/5 transition-colors"
          >
            新規登録
          </Link>
        </div>
      </main>
    </div>
  );
}
