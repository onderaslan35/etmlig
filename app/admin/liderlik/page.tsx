"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type PointRow = {
  id: number;
  hafta: number;
  user_name: string;
  puan: number;
};

type LeaderboardRow = {
  sira: number;
  kullanici: string;
  toplam_puan: number;
  kayit_sayisi: number;
  ortalama_puan: number;
};

export default function LiderlikPage() {
  const [points, setPoints] = useState<PointRow[]>([]);
  const [filteredRows, setFilteredRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [weekFilter, setWeekFilter] = useState("all");

  const fetchPoints = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("points")
      .select("*")
      .order("hafta", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setPoints((data as PointRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  const weeks = useMemo(() => {
    return Array.from(new Set(points.map((item) => item.hafta))).sort(
      (a, b) => a - b
    );
  }, [points]);

  const leaderboard = useMemo(() => {
    const source =
      weekFilter === "all"
        ? points
        : points.filter((item) => String(item.hafta) === weekFilter);

    const grouped = new Map<
      string,
      { toplam_puan: number; kayit_sayisi: number }
    >();

    for (const item of source) {
      const current = grouped.get(item.user_name) || {
        toplam_puan: 0,
        kayit_sayisi: 0,
      };

      grouped.set(item.user_name, {
        toplam_puan: current.toplam_puan + item.puan,
        kayit_sayisi: current.kayit_sayisi + 1,
      });
    }

    const rows: LeaderboardRow[] = Array.from(grouped.entries()).map(
      ([kullanici, values]) => ({
        sira: 0,
        kullanici,
        toplam_puan: values.toplam_puan,
        kayit_sayisi: values.kayit_sayisi,
        ortalama_puan:
          values.kayit_sayisi > 0
            ? Number((values.toplam_puan / values.kayit_sayisi).toFixed(2))
            : 0,
      })
    );

    rows.sort((a, b) => {
      if (b.toplam_puan !== a.toplam_puan) {
        return b.toplam_puan - a.toplam_puan;
      }

      return b.ortalama_puan - a.ortalama_puan;
    });

    return rows.map((row, index) => ({
      ...row,
      sira: index + 1,
    }));
  }, [points, weekFilter]);

  useEffect(() => {
    let result = [...leaderboard];

    if (search.trim()) {
      const query = search.toLocaleLowerCase("tr");
      result = result.filter((row) =>
        row.kullanici.toLocaleLowerCase("tr").includes(query)
      );
    }

    setFilteredRows(result);
  }, [leaderboard, search]);

  const totalUsers = leaderboard.length;
  const totalPoints = leaderboard.reduce(
    (sum, row) => sum + row.toplam_puan,
    0
  );
  const leader = leaderboard[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-yellow-400">
                ETML Yönetim Paneli
              </p>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Liderlik Tablosu
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                Gerçek puan verileriyle genel sıralamayı görüntüle, haftalara göre filtrele.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-yellow-300">
                  Lider
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {leader ? leader.kullanici : "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-cyan-300">
                  Yarışmacı
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {totalUsers}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-emerald-300">
                  Toplam Puan
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {totalPoints}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Yarışmacı Ara
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Kullanıcı adı ara..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Hafta
              </label>
              <select
                value={weekFilter}
                onChange={(e) => setWeekFilter(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
              >
                <option value="all">Genel Sıralama</option>
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
              <h2 className="text-xl font-black text-white">Sıralama</h2>
              <p className="mt-1 text-sm text-slate-400">
                Puan tablosundaki verilerden otomatik oluşturulur.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchPoints}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Yenile
            </button>
          </div>

          {loading && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-6 text-center text-slate-300">
              Liderlik verileri yükleniyor...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && filteredRows.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-6 text-center text-slate-300">
              Gösterilecek liderlik verisi bulunamadı.
            </div>
          )}

          {!loading && !error && filteredRows.length > 0 && (
            <div className="overflow-hidden rounded-3xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-950/80">
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                      <th className="px-4 py-4">Sıra</th>
                      <th className="px-4 py-4">Yarışmacı</th>
                      <th className="px-4 py-4">Toplam Puan</th>
                      <th className="px-4 py-4">Kayıt</th>
                      <th className="px-4 py-4">Ortalama</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10 bg-slate-900/40">
                    {filteredRows.map((row) => (
                      <tr key={`${row.kullanici}-${row.sira}`} className="transition hover:bg-white/5">
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                              row.sira === 1
                                ? "bg-yellow-500 text-slate-950"
                                : row.sira === 2
                                ? "bg-slate-300 text-slate-950"
                                : row.sira === 3
                                ? "bg-amber-700 text-white"
                                : "bg-white/10 text-white"
                            }`}
                          >
                            {row.sira}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-sm font-bold text-white">
                          {row.kullanici}
                        </td>

                        <td className="px-4 py-4 text-sm font-black text-emerald-300">
                          {row.toplam_puan}
                        </td>

                        <td className="px-4 py-4 text-sm text-cyan-300">
                          {row.kayit_sayisi}
                        </td>

                        <td className="px-4 py-4 text-sm text-yellow-300">
                          {row.ortalama_puan}
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
