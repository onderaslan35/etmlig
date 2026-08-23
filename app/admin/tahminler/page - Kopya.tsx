"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type PredictionItem = {
  id: number;
  hafta: number;
  user_name: string;
  ev_sahibi: string;
  deplasman: string;
  tahmin_ev: number;
  tahmin_dep: number;
  durum: string;
};

export default function TahminlerPage() {
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [filteredPredictions, setFilteredPredictions] = useState<
    PredictionItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [weekFilter, setWeekFilter] = useState("all");

  const fetchPredictions = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("predictions")
      .select("*")
      .order("hafta", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setPredictions((data as PredictionItem[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  useEffect(() => {
    let result = [...predictions];

    if (weekFilter !== "all") {
      result = result.filter(
        (prediction) => String(prediction.hafta) === weekFilter
      );
    }

    if (search.trim()) {
      const query = search.toLocaleLowerCase("tr");

      result = result.filter((prediction) =>
        [
          prediction.user_name,
          prediction.ev_sahibi,
          prediction.deplasman,
          prediction.durum,
          String(prediction.hafta),
        ]
          .join(" ")
          .toLocaleLowerCase("tr")
          .includes(query)
      );
    }

    setFilteredPredictions(result);
  }, [predictions, search, weekFilter]);

  const weeks = useMemo(() => {
    return Array.from(
      new Set(predictions.map((prediction) => prediction.hafta))
    ).sort((a, b) => a - b);
  }, [predictions]);

  const totalPredictions = predictions.length;
  const waitingPredictions = predictions.filter(
    (prediction) => prediction.durum === "Bekliyor"
  ).length;
  const filteredCount = filteredPredictions.length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
                ETML Yönetim Paneli
              </p>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Tahminler
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                Kullanıcı tahminlerini veritabanından çek, haftaya göre filtrele
                ve kontrol et.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-violet-300">
                  Toplam Tahmin
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {totalPredictions}
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-cyan-300">
                  Filtrelenen
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {filteredCount}
                </p>
              </div>

              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-amber-300">
                  Bekleyen
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {waitingPredictions}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Ara
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Kullanıcı, takım veya hafta ara..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Hafta
              </label>
              <select
                value={weekFilter}
                onChange={(e) => setWeekFilter(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-400"
              >
                <option value="all">Tüm Haftalar</option>
                {weeks.map((week) => (
                  <option key={week} value={String(week)}>
                    {week}. Hafta
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-xl sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Tahmin Listesi</h2>
              <p className="mt-1 text-sm text-slate-400">
                Gerçek tahmin verileri aşağıda listelenir.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchPredictions}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Yenile
            </button>
          </div>

          {loading && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-6 text-center text-slate-300">
              Tahminler yükleniyor...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && filteredPredictions.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-6 text-center text-slate-300">
              Gösterilecek tahmin bulunamadı.
            </div>
          )}

          {!loading && !error && filteredPredictions.length > 0 && (
            <div className="overflow-hidden rounded-3xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-950/80">
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                      <th className="px-4 py-4">Hafta</th>
                      <th className="px-4 py-4">Kullanıcı</th>
                      <th className="px-4 py-4">Maç</th>
                      <th className="px-4 py-4">Tahmin</th>
                      <th className="px-4 py-4">Durum</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10 bg-slate-900/40">
                    {filteredPredictions.map((prediction) => (
                      <tr
                        key={prediction.id}
                        className="transition hover:bg-white/5"
                      >
                        <td className="px-4 py-4 text-sm font-bold text-white">
                          {prediction.hafta}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-300">
                          {prediction.user_name}
                        </td>
                        <td className="px-4 py-4 text-sm text-white">
                          {prediction.ev_sahibi} vs {prediction.deplasman}
                        </td>
                        <td className="px-4 py-4 text-sm font-black text-violet-300">
                          {prediction.tahmin_ev} - {prediction.tahmin_dep}
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                            {prediction.durum}
                          </span>
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
