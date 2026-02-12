"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getEnrollmentTrends,
  getCompletionStats,
  getPopularCourses,
  downloadAnalyticsCsv,
} from "@/lib/analyticsApi";
import type {
  EnrollmentTrend,
  CompletionStats,
  PopularCourse,
} from "@/types/analytics";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AnalyticsPage() {
  const [trends, setTrends] = useState<EnrollmentTrend[]>([]);
  const [completions, setCompletions] = useState<CompletionStats[]>([]);
  const [popular, setPopular] = useState<PopularCourse[]>([]);
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [csvLoading, setCsvLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [trendsData, completionsData, popularData] = await Promise.all([
        getEnrollmentTrends(period),
        getCompletionStats(),
        getPopularCourses(),
      ]);
      setTrends(trendsData);
      setCompletions(completionsData);
      setPopular(popularData);
    } catch {
      setError("分析データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCsvDownload = async () => {
    try {
      setCsvLoading(true);
      await downloadAnalyticsCsv();
    } catch {
      setError("CSVエクスポートに失敗しました");
    } finally {
      setCsvLoading(false);
    }
  };

  const pieData = completions
    .filter((c) => c.totalEnrollments > 0)
    .map((c) => ({
      name: c.courseTitle.length > 15 ? c.courseTitle.slice(0, 15) + "..." : c.courseTitle,
      value: c.completionRate,
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">分析ダッシュボード</h1>
        <Button onClick={handleCsvDownload} loading={csvLoading} variant="outline">
          CSVエクスポート
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}

      {/* 受講者推移 */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">受講者推移</h2>
          <div className="flex gap-2">
            {["7d", "30d", "all"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  period === p
                    ? "bg-foreground text-background"
                    : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
                }`}
              >
                {p === "7d" ? "7日" : p === "30d" ? "30日" : "全期間"}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-foreground)" opacity={0.1} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" name="受講数" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 完了率 */}
        <Card>
          <h2 className="text-lg font-bold text-foreground mb-4">完了率統計</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-foreground/50 py-8 text-center">データがありません</p>
          )}
        </Card>

        {/* 人気コース */}
        <Card>
          <h2 className="text-lg font-bold text-foreground mb-4">人気コースランキング</h2>
          {popular.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={popular} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-foreground)" opacity={0.1} />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="courseTitle"
                  tick={{ fontSize: 11 }}
                  width={120}
                  tickFormatter={(v) => v.length > 12 ? v.slice(0, 12) + "..." : v}
                />
                <Tooltip />
                <Bar dataKey="enrollmentCount" fill="#3b82f6" name="受講者数" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-foreground/50 py-8 text-center">データがありません</p>
          )}
        </Card>
      </div>

      {/* 完了率テーブル */}
      <Card>
        <h2 className="text-lg font-bold text-foreground mb-4">コース別完了率</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-foreground/10">
                <th className="text-left py-2 px-3 text-foreground/60 font-medium">コース</th>
                <th className="text-right py-2 px-3 text-foreground/60 font-medium">受講者</th>
                <th className="text-right py-2 px-3 text-foreground/60 font-medium">完了者</th>
                <th className="text-right py-2 px-3 text-foreground/60 font-medium">完了率</th>
              </tr>
            </thead>
            <tbody>
              {completions.map((c, i) => (
                <tr key={i} className="border-b border-foreground/5">
                  <td className="py-2 px-3 text-foreground">{c.courseTitle}</td>
                  <td className="py-2 px-3 text-right text-foreground/70">{c.totalEnrollments}</td>
                  <td className="py-2 px-3 text-right text-foreground/70">{c.completedEnrollments}</td>
                  <td className="py-2 px-3 text-right text-foreground/70">{c.completionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
