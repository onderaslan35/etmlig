"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type MatchItem = {
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

type ScoreMap = {
  [matchId: number]: {
    home: string;
    away: string;
  };
};

const SCORE_OPTIONS = Array.from({ length: 10 }, (_, i) => String(i)); // ["0", "1", ..., "9"]

function formatDateTime(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function SonuclarPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [scores, setScores] = useState<ScoreMap>({});
  const [selectedWeek, setSelectedWeek] = useState("all");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchMatches = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("hafta", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const formattedData = (data || []).map((m: any) => ({
      ...m,
      evsahibi:
        m.evsahibi ||
        m.hometeam ||
        m.ev_sahibi ||
        m.home ||
        m.ev ||
        "Ev Sahibi",
      deplasman:
        m.deplasman ||
        m.awayteam ||
        m.deplasman_takim ||
        m.away ||
        m.dep ||
        "Deplasman",
      mactarihi: m.mactarihi || m.matchdate || m.tarih || "",
    }));

    setMatches(formattedData as MatchItem[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const weeks = useMemo(() => {
    return Array.from(new Set(matches.map((match) => match.hafta)))
      .filter(Boolean)
      .sort((a, b) => a - b);
  }, [matches]);

  const filteredMatches = useMemo(() => {
    if (selectedWeek === "all") return matches;
    return matches.filter((match) => String(match.hafta) === selectedWeek);
  }, [matches, selectedWeek]);

  const handleScoreChange = (
    matchId: number,
    field: "home" | "away",
    value: string
  ) => {
    setScores((prev) => ({
      ...prev,
      [matchId]: {
        home: prev[matchId]?.home ?? "",
        away: prev[matchId]?.away ?? "",
        [field]: value,
      },
    }));
  };

  const handleSaveResult = async (match: MatchItem) => {
    setMessage("");
    setError("");

    const currentScore = scores[match.id] || {
      home: match.evskor !== undefined && match.evskor !== null ? String(match.evskor) : "",
      away: match.depskor !== undefined && match.depskor !== null ? String(match.depskor) : "",
    };

    if (currentScore.home === "" || currentScore.away === "") {
      setError(`${match.evsahibi} - ${match.deplasman} maçı için her iki takımın da skorunu seçmelisin.`);
      return;
    }

    setSavingId(match.id);

    const homeScore = Number(currentScore.home);
    const awayScore = Number(currentScore.away);

    const { error } = await supabase
      .from("matches")
      .update({
        durum: "Tamamlandı",
        evskor: homeScore,
        depskor: awayScore,
      })
      .eq("id", match.id);

    if (error) {
      setError(error.message);
      setSavingId(null);
      return;
    }

    setMessage(`⚽ ${match.evsahibi} ${homeScore} - ${awayScore} ${match.deplasman} maçı kaydedildi.`);
    setSavingId(null);
    fetchMatches();
  };

  const totalMatches = filteredMatches.length;
  const completedMatches = filteredMatches.filter(
    (match) => match.durum === "Tamamlandı"
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-400">
                ETML Yönetim Paneli
              </p>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Sonuç Gir
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                Skorları açılır kutulardan (0-9) kolayca seç, sonucu anında kaydet.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  Gösterilen
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {totalMatches}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-emerald-300">
                  Tamamlanan
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {completedMatches}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Hafta Seçin
              </label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400"
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

          {message && (
            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-xl sm:p-6">
          {loading && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-6 text-center text-slate-300">
              Maçlar yükleniyor...
            </div>
          )}

          {!loading && filteredMatches.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-6 text-center text-slate-300">
              Sonuç girilecek maç bulunamadı.
            </div>
          )}

          {!loading && filteredMatches.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {filteredMatches.map((match) => {
                const currentScore = scores[match.id] || {
                  home:
                    match.evskor !== undefined && match.evskor !== null
                      ? String(match.evskor)
                      : "",
                  away:
                    match.depskor !== undefined && match.depskor !== null
                      ? String(match.depskor)
                      : "",
                };

                return (
                  <div
                    key={match.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 shadow-lg"
                  >
                    <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-400">
                          {match.hafta ? `${match.hafta}. HAFTA` : ""}{" "}
                          {match.macno ? `• MAÇ ${match.macno}` : ""} • {match.lig}
                        </p>
                        <h3 className="mt-1 text-xl font-black text-white">
                          {match.evsahibi} vs {match.deplasman}
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">
                          {formatDateTime(match.mactarihi)}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          match.durum === "Tamamlandı"
                            ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                            : "border border-amber-500/20 bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        {match.durum || "Bekliyor"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                      {/* Ev Sahibi Skor Menüsü */}
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-300">
                          {match.evsahibi} Gol
                        </label>
                        <select
                          value={currentScore.home}
                          onChange={(e) =>
                            handleScoreChange(match.id, "home", e.target.value)
                          }
                          className="w-full rounded-2xl border border-amber-500/30 bg-slate-900 px-4 py-3 text-lg font-black text-amber-400 outline-none transition focus:border-amber-400 cursor-pointer"
                        >
                          <option value="">Skor Seç</option>
                          {SCORE_OPTIONS.map((val) => (
                            <option key={val} value={val} className="bg-slate-950 text-white font-bold">
                              {val} Gol
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Deplasman Skor Menüsü */}
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-300">
                          {match.deplasman} Gol
                        </label>
                        <select
                          value={currentScore.away}
                          onChange={(e) =>
                            handleScoreChange(match.id, "away", e.target.value)
                          }
                          className="w-full rounded-2xl border border-amber-500/30 bg-slate-900 px-4 py-3 text-lg font-black text-amber-400 outline-none transition focus:border-amber-400 cursor-pointer"
                        >
                          <option value="">Skor Seç</option>
                          {SCORE_OPTIONS.map((val) => (
                            <option key={val} value={val} className="bg-slate-950 text-white font-bold">
                              {val} Gol
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Kaydet Butonu */}
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => handleSaveResult(match)}
                          disabled={savingId === match.id}
                          className="w-full rounded-2xl bg-amber-500 px-4 py-3.5 text-sm font-black text-slate-950 transition hover:bg-amber-400 disabled:opacity-60 shadow-lg shadow-amber-500/10"
                        >
                          {savingId === match.id
                            ? "Kaydediliyor..."
                            : "Sonucu Kaydet"}
                        </button>
                      </div>
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