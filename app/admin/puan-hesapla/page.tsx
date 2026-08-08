"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type MatchItem = {
  id: number;
  hafta: number;
  evsahibi: string;
  deplasman: string;
  evskor: number | null;
  depskor: number | null;
  durum: string;
};

type PredictionItem = {
  id: number;
  hafta: number;
  username: string;
  evsahibi: string;
  deplasman: string;
  tahminev: number;
  tahmindep: number;
};

type PreviewRow = {
  predictionid: number;
  hafta: number;
  username: string;
  evsahibi: string;
  deplasman: string;
  tahminev: number;
  tahmindep: number;
  gercekev: number;
  gercekdep: number;
  isExactScore: boolean;
  bilenSayisi: number;
  puan: number;
};

// Tam isabet skoru tutturan kişi sayısına göre havuz puanı kuralı
function calculateExactScorePoints(exactCount: number): number {
  if (exactCount === 1) return 12;
  if (exactCount === 2) return 6;
  if (exactCount === 3) return 5;
  if (exactCount === 4) return 4;
  if (exactCount === 5) return 3;
  if (exactCount === 6) return 2;
  if (exactCount >= 7) return 1;
  return 0;
}

export default function PuanHesaplaPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [selectedWeek, setSelectedWeek] = useState("1");
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");

    const [matchesRes, predictionsRes] = await Promise.all([
      supabase.from("matches").select("*").order("hafta", { ascending: true }),
      supabase.from("predictions").select("*").order("hafta", { ascending: true }),
    ]);

    if (matchesRes.error) {
      setError(matchesRes.error.message);
      setLoading(false);
      return;
    }

    if (predictionsRes.error) {
      setError(predictionsRes.error.message);
      setLoading(false);
      return;
    }

    const formattedMatches = (matchesRes.data || []).map((m: any) => ({
      ...m,
      evsahibi: m.evsahibi || m.hometeam || m.ev_sahibi || "Ev Sahibi",
      deplasman: m.deplasman || m.awayteam || m.deplasman_takim || "Deplasman",
    }));

    const formattedPredictions = (predictionsRes.data || []).map((p: any) => ({
      ...p,
      username: p.username || p.user_name || "Kullanıcı",
      evsahibi: p.evsahibi || p.ev_sahibi || "Ev Sahibi",
      deplasman: p.deplasman || p.deplasman_takim || "Deplasman",
      tahminev: p.tahminev !== undefined && p.tahminev !== null ? p.tahminev : p.tahmin_ev,
      tahmindep: p.tahmindep !== undefined && p.tahmindep !== null ? p.tahmindep : p.tahmin_dep,
    }));

    setMatches(formattedMatches as MatchItem[]);
    setPredictions(formattedPredictions as PredictionItem[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const weeks = useMemo(() => {
    const weekSet = new Set<number>();
    matches.forEach((m) => weekSet.add(m.hafta));
    predictions.forEach((p) => weekSet.add(p.hafta));
    return Array.from(weekSet).filter(Boolean).sort((a, b) => a - b);
  }, [matches, predictions]);

  const totalPreviewPoints = useMemo(() => {
    return previewRows.reduce((sum, item) => sum + item.puan, 0);
  }, [previewRows]);

  const handleCreatePreview = () => {
    setMessage("");
    setError("");

    const weekNo = Number(selectedWeek);

    // Skoru girilmiş maçlar
    const weekMatches = matches.filter(
      (m) =>
        m.hafta === weekNo &&
        m.evskor !== null &&
        m.evskor !== undefined &&
        m.depskor !== null &&
        m.depskor !== undefined
    );

    const weekPredictions = predictions.filter((p) => p.hafta === weekNo);

    if (weekMatches.length === 0) {
      setPreviewRows([]);
      setError("Bu hafta için skoru girilmiş maç bulunamadı. Lütfen önce 'Sonuç Gir' sayfasından skorları kaydedin.");
      return;
    }

    if (weekPredictions.length === 0) {
      setPreviewRows([]);
      setError("Bu hafta için kaydedilmiş kullanıcı tahmini bulunamadı.");
      return;
    }

    // 1. AŞAMA: Her maç için TAM SKORU BİREBİR tutturan kişi sayısını hesapla
    const exactScoreCounts: { [matchKey: string]: number } = {};

    for (const match of weekMatches) {
      const matchKey = `${match.evsahibi}_VS_${match.deplasman}`;

      // Birebir skor eşleşmesi (Örn: 2-3 ise sadece 2-3 yazanlar)
      const exactPredictions = weekPredictions.filter(
        (p) =>
          p.evsahibi === match.evsahibi &&
          p.deplasman === match.deplasman &&
          Number(p.tahminev) === Number(match.evskor) &&
          Number(p.tahmindep) === Number(match.depskor)
      );

      exactScoreCounts[matchKey] = exactPredictions.length;
    }

    // 2. AŞAMA: Yalnızca TAM SKOR tutturanlara havuz puanı yaz, geriye kalan her duruma 0 puan yaz
    const rows: PreviewRow[] = [];

    for (const prediction of weekPredictions) {
      const relatedMatch = weekMatches.find(
        (match) =>
          match.evsahibi === prediction.evsahibi &&
          match.deplasman === prediction.deplasman
      );

      if (!relatedMatch) continue;
      if (relatedMatch.evskor === null || relatedMatch.depskor === null) continue;

      const matchKey = `${relatedMatch.evsahibi}_VS_${relatedMatch.deplasman}`;
      const exactCount = exactScoreCounts[matchKey] || 0;

      // Soru: Birebir Skor Tutmuş mu?
      const isExactScore =
        Number(prediction.tahminev) === Number(relatedMatch.evskor) &&
        Number(prediction.tahmindep) === Number(relatedMatch.depskor);

      // Sadece tam skor tuttuysa havuz puanı, taraf tutsa dahi skor tutmadıysa 0 puan!
      const puan = isExactScore ? calculateExactScorePoints(exactCount) : 0;

      rows.push({
        predictionid: prediction.id,
        hafta: prediction.hafta,
        username: prediction.username,
        evsahibi: prediction.evsahibi,
        deplasman: prediction.deplasman,
        tahminev: Number(prediction.tahminev),
        tahmindep: Number(prediction.tahmindep),
        gercekev: Number(relatedMatch.evskor),
        gercekdep: Number(relatedMatch.depskor),
        isExactScore,
        bilenSayisi: exactCount,
        puan,
      });
    }

    if (rows.length === 0) {
      setPreviewRows([]);
      setError("Tahminler ile maç isimleri eşleşmedi.");
      return;
    }

    setPreviewRows(rows);
    setMessage(`${weekNo}. hafta için SADECE TAM İSABET SKOR tabanlı puan havuzu oluşturuldu.`);
  };

  const handleSavePoints = async () => {
    setMessage("");
    setError("");

    if (previewRows.length === 0) {
      setError("Önce puan ön izlemesi oluşturmalısınız.");
      return;
    }

    setSaving(true);
    const weekNo = Number(selectedWeek);

    await supabase.from("points").delete().eq("hafta", weekNo);

    const payload = previewRows.map((row) => ({
      hafta: row.hafta,
      username: row.username,
      evsahibi: row.evsahibi,
      deplasman: row.deplasman,
      tahminev: row.tahminev,
      tahmindep: row.tahmindep,
      gercekev: row.gercekev,
      gercekdep: row.gercekdep,
      puan: row.puan,
    }));

    const insertRes = await supabase.from("points").insert(payload);

    if (insertRes.error) {
      setError(insertRes.error.message);
      setSaving(false);
      return;
    }

    setMessage(`${weekNo}. hafta için Tam İsabet Skor puanları veritabanına kaydedildi!`);
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-pink-400">
                ETML Yönetim Paneli
              </p>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Tam İsabet Skor Puanlama Engine
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                Taraf bahsi / Neve puan yok. Sadece birebir skoru tutturanlar maçı bilen kişi sayısına göre havuz puanı kazanır.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-pink-500/20 bg-pink-500/10 px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-pink-300">
                  Seçili Hafta
                </p>
                <p className="mt-2 text-2xl font-black text-white">{selectedWeek}</p>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-cyan-300">
                  Ön İzleme
                </p>
                <p className="mt-2 text-2xl font-black text-white">{previewRows.length}</p>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-emerald-300">
                  Dağıtılan Puan
                </p>
                <p className="mt-2 text-2xl font-black text-white">{totalPreviewPoints}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Kurallar Tablosu Kartı */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-center">
            <p className="text-xs text-yellow-300 font-bold">1 Bilen</p>
            <p className="text-xl font-black text-white mt-1">12 P</p>
          </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-center">
            <p className="text-xs text-cyan-300 font-bold">2 Bilen</p>
            <p className="text-xl font-black text-white mt-1">6 P</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
            <p className="text-xs text-emerald-300 font-bold">3 Bilen</p>
            <p className="text-xl font-black text-white mt-1">5 P</p>
          </div>
          <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-3 text-center">
            <p className="text-xs text-fuchsia-300 font-bold">4 Bilen</p>
            <p className="text-xl font-black text-white mt-1">4 P</p>
          </div>
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-center">
            <p className="text-xs text-indigo-300 font-bold">5 Bilen</p>
            <p className="text-xl font-black text-white mt-1">3 P</p>
          </div>
          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-3 text-center">
            <p className="text-xs text-purple-300 font-bold">6 Bilen</p>
            <p className="text-xl font-black text-white mt-1">2 P</p>
          </div>
          <div className="rounded-2xl border border-slate-500/20 bg-slate-500/10 p-3 text-center col-span-2 sm:col-span-1">
            <p className="text-xs text-slate-300 font-bold">7+ Bilen</p>
            <p className="text-xl font-black text-white mt-1">1 P</p>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Hafta Seç
              </label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-pink-400"
              >
                {weeks.length === 0 ? (
                  <option value="1">1. Hafta</option>
                ) : (
                  weeks.map((week) => (
                    <option key={week} value={String(week)}>
                      {week}. Hafta
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex items-end lg:col-span-3">
              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCreatePreview}
                  disabled={loading}
                  className="rounded-2xl bg-pink-500 px-6 py-3 text-sm font-black text-white hover:bg-pink-400 disabled:opacity-60"
                >
                  Tam İsabet Puan Hesapla
                </button>

                <button
                  type="button"
                  onClick={handleSavePoints}
                  disabled={saving || previewRows.length === 0}
                  className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-black text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                >
                  {saving ? "Kaydediliyor..." : "Puanları Kaydet"}
                </button>

                <button
                  type="button"
                  onClick={fetchData}
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-black text-white hover:bg-white/10"
                >
                  Veriyi Yenile
                </button>
              </div>
            </div>
          </div>

          {message ? (
            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-xl sm:p-6">
          <div className="mb-6">
            <h2 className="text-xl font-black text-white">Hesaplama Ön İzleme Tablosu</h2>
            <p className="mt-1 text-sm text-slate-400">
              Sadece tam skoru birebir tutturan yarışmacılar havuz puanı alır.
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-6 text-center text-slate-300">
              Veriler yükleniyor...
            </div>
          ) : previewRows.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-6 text-center text-slate-300">
              Ön izleme henüz oluşturulmadı.
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-950/80">
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                      <th className="px-4 py-4">Kullanıcı</th>
                      <th className="px-4 py-4">Maç</th>
                      <th className="px-4 py-4">Tahmin</th>
                      <th className="px-4 py-4">Gerçek Skor</th>
                      <th className="px-4 py-4">Tam İsabet Durumu</th>
                      <th className="px-4 py-4">Kazanılan Puan</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10 bg-slate-900/40">
                    {previewRows.map((row) => (
                      <tr key={row.predictionid} className="hover:bg-white/5">
                        <td className="px-4 py-4 text-sm font-semibold text-white">
                          {row.username}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-300">
                          {row.evsahibi} vs {row.deplasman}
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-cyan-300">
                          {row.tahminev} - {row.tahmindep}
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-amber-300">
                          {row.gercekev} - {row.gercekdep}
                        </td>
                        <td className="px-4 py-4 text-sm font-bold">
                          {row.isExactScore ? (
                            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs text-emerald-300">
                              Tam İsabet ({row.bilenSayisi} Kişi Bildi)
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs text-red-400">
                              Iska / Yanlış Skor
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm font-black text-pink-300">
                          {row.puan > 0 ? `${row.puan} P` : "0 P"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}