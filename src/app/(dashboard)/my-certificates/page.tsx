"use client";

import { useEffect, useState, useCallback } from "react";
import { getMyCertificates, downloadCertificatePdf } from "@/lib/certificateApi";
import type { Certificate } from "@/types/certificate";

export default function MyCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState<number | null>(null);

  const fetchCertificates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyCertificates();
      setCertificates(data);
    } catch {
      setError("証明書の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleDownload = async (id: number) => {
    try {
      setDownloading(id);
      await downloadCertificatePdf(id);
    } catch {
      setError("PDFのダウンロードに失敗しました");
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">証明書</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {certificates.length === 0 ? (
        <div className="text-center py-12 text-foreground/60">
          <p className="text-lg mb-2">証明書はまだありません</p>
          <p className="text-sm">コースを完了すると、証明書が自動的に発行されます。</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="border border-foreground/10 rounded-xl p-6 bg-background shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-lg">
                  🏆
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                {cert.courseTitle}
              </h3>
              <p className="text-xs text-foreground/50 mb-1">
                証明書番号: {cert.certificateNumber.slice(0, 8)}...
              </p>
              <p className="text-xs text-foreground/50 mb-4">
                発行日: {new Date(cert.issuedAt).toLocaleDateString("ja-JP")}
              </p>
              <button
                onClick={() => handleDownload(cert.id)}
                disabled={downloading === cert.id}
                className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                {downloading === cert.id ? "ダウンロード中..." : "PDFダウンロード"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
