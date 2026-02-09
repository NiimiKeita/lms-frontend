# SkillBridge LMS - Frontend

学習管理システム（LMS）のフロントエンド。

## 技術スタック

- Next.js 16.1.6 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript 5
- Zod v4 (バリデーション)
- react-hook-form (フォーム管理)
- axios (HTTP クライアント)
- react-markdown + rehype-highlight + remark-gfm (Markdownレンダリング)

## セットアップ

```bash
npm install
npm run dev
```

`http://localhost:3000` で起動します。Backend (`http://localhost:8080`) が稼働している必要があります。

## ビルド

```bash
npm run build
```

## プロジェクト構成

```
src/
├── app/
│   ├── (auth)/          # 認証ページ (login, register, forgot-password, reset-password)
│   ├── (dashboard)/     # ダッシュボード
│   │   ├── admin/       # 管理者ページ
│   │   │   ├── courses/ # コース管理 (new, [id]/edit)
│   │   │   ├── users/   # ユーザー管理 (一覧, new, [id]/edit, [id]/progress)
│   │   │   └── progress/# 進捗管理
│   │   ├── courses/     # コース (一覧, [id]詳細, [id]/learn学習)
│   │   ├── dashboard/   # ダッシュボード
│   │   ├── my-courses/  # マイコース
│   │   └── profile/     # プロファイル
│   └── globals.css
├── components/
│   ├── layout/          # Header, Sidebar, DashboardLayout
│   ├── ui/              # Button, Card, Input
│   └── MarkdownRenderer.tsx
├── context/             # AuthContext
├── lib/
│   ├── api.ts           # axios インスタンス + インターセプター
│   ├── courseApi.ts      # コース/レッスン/コンテンツ API
│   ├── adminApi.ts      # 管理者 API (ユーザー管理, 進捗)
│   ├── progressApi.ts   # 進捗 API
│   └── validations.ts   # Zod スキーマ
└── types/
    ├── course.ts        # コース/レッスン型
    ├── enrollment.ts    # 受講/進捗型
    └── admin.ts         # 管理者型
```

## ページ一覧 (17ページ)

| パス | 説明 | 権限 |
|------|------|------|
| `/login` | ログイン | 未認証 |
| `/register` | ユーザー登録 | 未認証 |
| `/forgot-password` | パスワードリセット要求 | 未認証 |
| `/reset-password` | パスワードリセット | 未認証 |
| `/dashboard` | ダッシュボード | 認証済み |
| `/courses` | コース一覧 | 認証済み |
| `/courses/[id]` | コース詳細 | 認証済み |
| `/courses/[id]/learn` | 学習ページ | 認証済み |
| `/my-courses` | マイコース | 認証済み |
| `/profile` | プロファイル | 認証済み |
| `/admin/courses/new` | コース作成 | ADMIN |
| `/admin/courses/[id]/edit` | コース編集 | ADMIN |
| `/admin/users` | ユーザー管理 | ADMIN |
| `/admin/users/new` | ユーザー追加 | ADMIN |
| `/admin/users/[id]/edit` | ユーザー編集 | ADMIN |
| `/admin/users/[id]/progress` | ユーザー進捗詳細 | ADMIN |
| `/admin/progress` | 進捗管理 | ADMIN |
