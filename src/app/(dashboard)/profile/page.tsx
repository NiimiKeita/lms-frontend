"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getProfile, updateProfile } from "@/lib/userApi";
import type { Profile } from "@/lib/userApi";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setUsername(data.username);
      } catch {
        setError("プロフィールの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!username.trim()) {
      setError("ユーザー名を入力してください");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateProfile({ username: username.trim() });
      setProfile(updated);
      setEditing(false);
      setSuccess("プロフィールを更新しました");
    } catch {
      setError("プロフィールの更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setUsername(profile.username);
    }
    setEditing(false);
    setError("");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">プロフィール</h1>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
          {success}
        </div>
      )}

      <Card>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              基本情報
            </h2>
            {!editing && (
              <Button variant="secondary" onClick={() => setEditing(true)}>
                編集
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-1">
                メールアドレス
              </label>
              <p className="text-foreground">{profile?.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-1">
                ユーザー名
              </label>
              {editing ? (
                <Input
                  label=""
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ユーザー名"
                />
              ) : (
                <p className="text-foreground">{profile?.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-1">
                ロール
              </label>
              <span
                className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                  profile?.role === "ADMIN"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {profile?.role === "ADMIN" ? "管理者" : "学習者"}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-1">
                登録日
              </label>
              <p className="text-foreground">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("ja-JP")
                  : "-"}
              </p>
            </div>
          </div>

          {editing && (
            <div className="flex gap-2 pt-4 border-t border-foreground/10">
              <Button onClick={handleSave} loading={saving}>
                保存
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                キャンセル
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
