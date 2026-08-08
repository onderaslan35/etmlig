"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type FixtureItem = {
  id: number;
  hafta: number;
  lig: string;
  evsahibi: string;
  deplasman: string;
  mactarihi: string;
  durum: string;
  macno: number | null;
  evskor?: number | null;
  depskor?: number | null;
};

function formatDateTime(value: string) {
  if (!value) return { tarih: "-", saat: "-" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { tarih: value, saat: "" };

  const tarih = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

  const saat = new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return { tarih, saat };
}

export default function FiksturPage() {
  const [fixtures, setFixtures] = useState<FixtureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("all");

  const fetchFixtures = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("hafta", { ascending: true })
      .order("macno", { ascending: true });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const formattedData = (data || []).map((m: any) => ({
      ...m,
      evsahibi: m.evsahibi || m.hometeam || m.ev_sahibi || "Ev Sahibi",
      deplasman: m.deplasman || m.awayteam || m.deplasman_takim || "Deplasman",
      mactarihi: m.mactarihi || m.matchdate || m.tarih || "",
    }));

    setFixtures(formattedData as FixtureItem[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchFixtures();
  }, []);

  const weeks = useMemo(() => {
    return Array.from(new Set(fixtures.map((f) => f.hafta)))
      .filter(Boolean)
      .sort((a, b) => a - b);
  }, [fixtures]);

  const filteredFixtures = useMemo(() => {
    let result = [...fixtures];

    if (selectedWeek !== "all") {
      result = result.filter((f) => String(f.hafta) === selectedWeek);
    }

    if (search.trim()) {
      const query = search.toLocaleLowerCase("tr");
      result = result.filter((f) =>
        [f.lig, f.evsahibi, f.deplasman, String(f.hafta)]
          .join(" ")
          .toLocaleLowerCase("tr")
          .includes(query)
      );
    }

    return result;
  }, [fixtures, search, selectedWeek]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
                ETML Kullanıcı Paneli
              </p>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Fikstür ve Program
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                Canlı veritabanındaki maç takvimini incele, karşılaşma saatlerini ve skorlarını takip et.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-cyan-300">
                  Toplam Maç
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {fixtures.length}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-emerald-300">
                  Gösterilen
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {filteredFixtures.length}
                </p>
              </div>

              <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-fuchsia-300">
                  Hafta Sayısı
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {weeks.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Maç veya Lig Ara
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Takım veya lig adı girin..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Hafta Seç
              </label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
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
              <h2 className="text-xl font-black text-white">Maç Takvimi</h2>
              <p className="mt-1 text-sm text-slate-400">
                Sistemdeki maçlar aşağıda listelenmektedir.
              </p>
            </div>
            <button
              onClick={fetchFixtures}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Yenile
            </button>
          </div>

          {loading && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-6 text-center text-slate-300">
              Maç takvimi yükleniyor...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && filteredFixtures.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-6 text-center text-slate-300">
              Maç bulunamadı.
            </div>
          )}

          {!loading && !error && filteredFixtures.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {filteredFixtures.map((fixture) => {
                const dt = formatDateTime(fixture.mactarihi);
                const isCompleted = fixture.durum === "Tamamlandı";

                return (
                  <div
                    key={fixture.id}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/70 p-5 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div>
                      <span className="text-xs uppercase tracking-wider text-cyan-400">
                        {fixture.lig} {fixture.hafta ? `• ${fixture.hafta}. Hafta` : ""} {fixture.macno ? `• Maç ${fixture.macno}` : ""}
                      </span>
                      <h3 className="mt-1 text-lg font-bold text-white">
                        {fixture.evsahibi} vs {fixture.deplasman}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4">
                      {isCompleted && fixture.evskor !== null && fixture.depskor !== null ? (
                        <div className="rounded-xl bg-slate-900 px-4 py-2 text-center border border-white/10">
                          <span className="text-lg font-black text-amber-400">
                            {fixture.evskor} - {fixture.depskor}
                          </span>
                        </div>
                      ) : (
                        <div className="text-left lg:text-right">
                          <p className="text-sm font-semibold text-white">
                            {dt.tarih}
                          </p>
                          <p className="text-xs text-slate-400">{dt.saat}</p>
                        </div>
                      )}

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          isCompleted
                            ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                            : "border border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
                        }`}
                      >
                        {fixture.durum || "Bekliyor"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}