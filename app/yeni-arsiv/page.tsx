'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import { TEST_ACCOUNTS, getEliteTheme } from '@/utils/themeEngine';

interface OfficialMatch {
  id: number;
  week_num: number;
  match_index: number;
  category: string;
  pool_type: 'DFO' | 'TFF';
  match_date: string;
  match_time: string;
  home_team: string;
  away_team: string;
  home_score: string;
  away_score: string;
  status: string;
  winner_ids: string[];
  winner_count: number;
  points_awarded: number;
}

interface OfficialWeek {
  week_num: number;
  is_completed: boolean;
  bonus_enabled: boolean;
  puan_lideri_ids: string[];
  puan_bonus: number;
  skor_krali_ids: string[];
  skor_bonus: number;
}

interface LiveStandingRow {
  canli_sira: number;
  kesin_sira: number;
  user_id: string;
  oyuncu_adi: string;
  kesin_dfo: number;
  kesin_tff: number;
  bonus_puan: number;
  kesin_master: number;
  kesin_skor: number;
  canli_ek_dfo: number;
  canli_ek_tff: number;
  canli_ek_puan: number;
  canli_ek_skor: number;
  canli_master_toplam: number;
  canli_skor_toplam: number;
  aktif_mac_sayisi: number;
}

const EXCLUDED_STANDINGS_IDS = new Set(['mankoman', '272727', '262787']);

export default function YeniArsivVeKontrolMerkezi() {
  const [allMatches, setAllMatches] = useState<OfficialMatch[]>([]);
  const [allWeeks, setAllWeeks] = useState<OfficialWeek[]>([]);
  const [liveStandings, setLiveStandings] = useState<LiveStandingRow[]>([]);
  const [activeLiveMatchCount, setActiveLiveMatchCount] = useState<number>(0);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'CARDS' | 'WEEK_CHECK' | 'TOTAL_STANDINGS'>('CARDS');
  const [standingsFilter, setStandingsFilter] = useState<'MASTER' | 'CANLI' | 'DFO' | 'TFF' | 'SKOR' | 'BONUS'>('MASTER');
  const [hiddenWinnersMap, setHiddenWinnersMap] = useState<Record<number, boolean>>({});
  const [accounts, setAccounts] = useState<Record<string, { pass: string; name: string }>>(TEST_ACCOUNTS);
  const [inactiveIds, setInactiveIds] = useState<Set<string>>(new Set(EXCLUDED_STANDINGS_IDS));
  const [isLoading, setIsLoading] = useState(true);

  const fetchLiveSummary = useCallback(async () => {
    const { data, error } = await supabase
      .from('etml_live_standings_summary')
      .select('*')
      .order('canli_sira', { ascending: true });

    if (!error && data) {
      const rows = data as LiveStandingRow[];
      setLiveStandings(rows);
      setActiveLiveMatchCount(rows.length > 0 ? Number(rows[0].aktif_mac_sayisi || 0) : 0);
    }
  }, []);

  const loadAllData = useCallback(async (keepSelectedWeek = false) => {
    if (!keepSelectedWeek) setIsLoading(true);

    const [playersRes, officialPlayersRes, weeksRes] = await Promise.all([
      supabase.from('players').select('*'),
      supabase.from('etml_official_players').select('*'),
      supabase.from('etml_official_weeks').select('*').order('week_num', { ascending: false })
    ]);

    const merged: Record<string, { pass: string; name: string }> = {
      ...TEST_ACCOUNTS,
      '262787': { pass: '', name: 'MUSTAFA TUCİ' },
      '272727': { pass: '', name: 'ESKİ ÜYE' }
    };
    const hiddenSet = new Set<string>(EXCLUDED_STANDINGS_IDS);

    if (officialPlayersRes.data) {
      officialPlayersRes.data.forEach((op: any) => {
        const uid = String(op.user_id || '').trim();
        const fname = String(op.full_name || '').trim();
        if (!uid) return;
        if (op.is_active === false) hiddenSet.add(uid);
        if (fname && fname !== uid) {
          merged[uid] = { pass: merged[uid]?.pass || '', name: fname };
        }
      });
    }

    if (playersRes.data) {
      playersRes.data.forEach((p: any) => {
        const pid = String(p.username || p.user_id || p.id || '').trim();
        const rawName = String(p.name || p.full_name || '').trim();
        if (pid && pid !== 'mankoman') {
          merged[pid] = {
            pass: p.password || merged[pid]?.pass || '',
            name: rawName || merged[pid]?.name || pid
          };
        }
      });
    }

    setAccounts(merged);
    setInactiveIds(hiddenSet);

    let fetchedMatches: OfficialMatch[] = [];
    let from = 0;
    const step = 1000;
    let keepGoing = true;

    while (keepGoing) {
      const { data } = await supabase
        .from('etml_official_matches')
        .select('*')
        .order('week_num', { ascending: true })
        .order('match_index', { ascending: true })
        .range(from, from + step - 1);

      if (data && data.length > 0) {
        fetchedMatches = [...fetchedMatches, ...(data as OfficialMatch[])];
        if (data.length < step) keepGoing = false;
        else from += step;
      } else {
        keepGoing = false;
      }
    }

    setAllMatches(fetchedMatches);
    setAllWeeks((weeksRes.data || []) as OfficialWeek[]);

    if (!keepSelectedWeek && fetchedMatches.length > 0) {
      const maxW = Math.max(...fetchedMatches.map((m) => m.week_num));
      setSelectedWeek(maxW);
    }

    await fetchLiveSummary();
    if (!keepSelectedWeek) setIsLoading(false);
  }, [fetchLiveSummary]);

  useEffect(() => {
    loadAllData(false);

    // Canlı skor veya resmi kasa güncellendiğinde tabloyu otomatik tazele
    const channel = supabase
      .channel('etml-kasa-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_matches' }, () => {
        fetchLiveSummary();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'etml_official_matches' }, () => {
        loadAllData(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAllData, fetchLiveSummary]);

  const availableWeeks = useMemo(() => {
    const setW = new Set<number>(allMatches.map((m) => m.week_num));
    return Array.from(setW).sort((a, b) => b - a);
  }, [allMatches]);

  const currentWeekMatches = useMemo(() => {
    return allMatches
      .filter((m) => m.week_num === selectedWeek)
      .sort((a, b) => a.match_index - b.match_index);
  }, [allMatches, selectedWeek]);

  const currentWeekMeta = useMemo(() => {
    return allWeeks.find((w) => w.week_num === selectedWeek) || null;
  }, [allWeeks, selectedWeek]);

  // Seçili Haftanın Kesinleşmiş Puan Özeti
  const weeklyCheckTable = useMemo(() => {
    const map: Record<string, { id: string; name: string; dfo: number; tff: number; rawTotal: number; scores: number; bonus: number }> = {};

    currentWeekMatches.forEach((m) => {
      if (m.status !== 'FINISHED') return;
      (m.winner_ids || []).forEach((uid) => {
        if (inactiveIds.has(uid)) return;
        if (!map[uid]) {
          map[uid] = {
            id: uid,
            name: accounts[uid]?.name || uid,
            dfo: 0,
            tff: 0,
            rawTotal: 0,
            scores: 0,
            bonus: 0
          };
        }
        if (m.pool_type === 'TFF') map[uid].tff += m.points_awarded;
        else map[uid].dfo += m.points_awarded;

        map[uid].rawTotal += m.points_awarded;
        map[uid].scores += 1;
      });
    });

    if (currentWeekMeta && currentWeekMeta.is_completed && currentWeekMeta.bonus_enabled) {
      if (currentWeekMeta.puan_bonus > 0 && currentWeekMeta.puan_lideri_ids?.length === 1) {
        const lid = currentWeekMeta.puan_lideri_ids[0];
        if (map[lid]) map[lid].bonus += currentWeekMeta.puan_bonus;
      }
      if (currentWeekMeta.skor_bonus > 0 && currentWeekMeta.skor_krali_ids?.length === 1) {
        const kid = currentWeekMeta.skor_krali_ids[0];
        if (map[kid]) map[kid].bonus += currentWeekMeta.skor_bonus;
      }
    }

    return Object.values(map).sort(
      (a, b) => b.rawTotal - a.rawTotal || b.scores - a.scores || a.name.localeCompare(b.name, 'tr')
    );
  }, [currentWeekMatches, currentWeekMeta, accounts, inactiveIds]);

  // Kesinleşmiş Kümülatif Genel Puan Durumu (DFO + TFF + Bonus = Master)
  const cumulativeStandings = useMemo(() => {
    const map: Record<
      string,
      { id: string; name: string; dfo: number; tff: number; bonus: number; master: number; scores: number; pCount: number; sCount: number }
    > = {};

    Object.keys(accounts).forEach((uid) => {
      if (inactiveIds.has(uid)) return;
      map[uid] = {
        id: uid,
        name: accounts[uid].name,
        dfo: 0,
        tff: 0,
        bonus: 0,
        master: 0,
        scores: 0,
        pCount: 0,
        sCount: 0
      };
    });

    allMatches.forEach((m) => {
      if (m.status !== 'FINISHED') return;
      (m.winner_ids || []).forEach((uid) => {
        if (inactiveIds.has(uid)) return;
        if (!map[uid]) {
          map[uid] = { id: uid, name: accounts[uid]?.name || uid, dfo: 0, tff: 0, bonus: 0, master: 0, scores: 0, pCount: 0, sCount: 0 };
        }
        if (m.pool_type === 'TFF') map[uid].tff += m.points_awarded;
        else map[uid].dfo += m.points_awarded;

        map[uid].scores += 1;
      });
    });

    allWeeks.forEach((w) => {
      if (!w.is_completed || !w.bonus_enabled) return;
      if (w.puan_bonus > 0 && w.puan_lideri_ids?.length === 1) {
        const lid = w.puan_lideri_ids[0];
        if (!inactiveIds.has(lid) && map[lid]) {
          map[lid].bonus += w.puan_bonus;
          map[lid].pCount += 1;
        }
      }
      if (w.skor_bonus > 0 && w.skor_krali_ids?.length === 1) {
        const kid = w.skor_krali_ids[0];
        if (!inactiveIds.has(kid) && map[kid]) {
          map[kid].bonus += w.skor_bonus;
          map[kid].sCount += 1;
        }
      }
    });

    Object.values(map).forEach((row) => {
      row.master = row.dfo + row.tff + row.bonus;
    });

    const list = Object.values(map);

    if (standingsFilter === 'DFO') return list.sort((a, b) => b.dfo - a.dfo || b.scores - a.scores || a.name.localeCompare(b.name, 'tr'));
    if (standingsFilter === 'TFF') return list.sort((a, b) => b.tff - a.tff || b.scores - a.scores || a.name.localeCompare(b.name, 'tr'));
    if (standingsFilter === 'SKOR') return list.sort((a, b) => b.scores - a.scores || b.master - a.master || a.name.localeCompare(b.name, 'tr'));
    if (standingsFilter === 'BONUS') {
      return list
        .filter((r) => r.bonus > 0)
        .sort((a, b) => b.bonus - a.bonus || b.sCount - a.sCount || a.name.localeCompare(b.name, 'tr'));
    }

    return list.sort((a, b) => b.master - a.master || b.scores - a.scores || a.name.localeCompare(b.name, 'tr'));
  }, [allMatches, allWeeks, accounts, inactiveIds, standingsFilter]);

  // SQL görünümü henüz yoksa bile canlı sekmesinin sorunsuz çalışması için yedek liste
  const effectiveLiveStandings: LiveStandingRow[] = useMemo(() => {
    if (liveStandings.length > 0) return liveStandings;
    return cumulativeStandings.map((r, idx) => ({
      canli_sira: idx + 1,
      kesin_sira: idx + 1,
      user_id: r.id,
      oyuncu_adi: r.name,
      kesin_dfo: r.dfo,
      kesin_tff: r.tff,
      bonus_puan: r.bonus,
      kesin_master: r.master,
      kesin_skor: r.scores,
      canli_ek_dfo: 0,
      canli_ek_tff: 0,
      canli_ek_puan: 0,
      canli_ek_skor: 0,
      canli_master_toplam: r.master,
      canli_skor_toplam: r.scores,
      aktif_mac_sayisi: 0
    }));
  }, [liveStandings, cumulativeStandings]);

  const toggleWinners = (matchId: number) => {
    setHiddenWinnersMap((prev) => ({ ...prev, [matchId]: !prev[matchId] }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-2 py-4 sm:p-8 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* ÜST BAŞLIK VE HAFTA SEÇİCİ */}
        <div className="flex flex-col items-center justify-center mb-6 sm:mb-8">
          <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase mb-3">
            YENİ OTONOM VERİTABANI KONTROL MERKEZİ
          </span>
          <h1 className="text-xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 tracking-tight uppercase text-center mb-4">
            RESMİ MAÇ ARŞİVİ & PUAN SAĞLAMA KASASI
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-slate-900 border border-slate-800 p-2 sm:p-2.5 rounded-2xl shadow-xl">
            <span className="text-[11px] font-black tracking-widest text-slate-400 uppercase pl-1 sm:pl-2">HAFTA SEÇ:</span>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="bg-amber-500 text-slate-950 font-black text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl outline-none cursor-pointer"
            >
              {availableWeeks.map((w) => (
                <option key={w} value={w}>
                  {w}. HAFTA ARŞİVİ
                </option>
              ))}
            </select>

            <div className="flex flex-wrap justify-center gap-1.5">
              <button
                onClick={() => setActiveTab('CARDS')}
                className={`px-2.5 sm:px-3 py-2 rounded-xl text-[10px] sm:text-[11px] font-black tracking-wider uppercase transition-all ${
                  activeTab === 'CARDS' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🗂️ Maç Arşivi
              </button>
              <button
                onClick={() => setActiveTab('WEEK_CHECK')}
                className={`px-2.5 sm:px-3 py-2 rounded-xl text-[10px] sm:text-[11px] font-black tracking-wider uppercase transition-all ${
                  activeTab === 'WEEK_CHECK' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                📋 {selectedWeek}. Hafta Özeti
              </button>
              <button
                onClick={() => setActiveTab('TOTAL_STANDINGS')}
                className={`px-2.5 sm:px-3 py-2 rounded-xl text-[10px] sm:text-[11px] font-black tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                  activeTab === 'TOTAL_STANDINGS' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>🏆 Genel Puan ({availableWeeks.length} Hafta)</span>
                {activeLiveMatchCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-amber-400 font-black tracking-widest animate-pulse">
            YENİ ARŞİV KASASI YÜKLENİYOR...
          </div>
        ) : allMatches.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <p className="text-slate-400 font-bold text-sm">
              Henüz Supabase <code className="text-amber-400">etml_official_matches</code> tablosunda kayıt bulunamadı.
            </p>
          </div>
        ) : (
          <>
            {/* SEKME 1: MAÇ ARŞİVİ */}
            {activeTab === 'CARDS' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {currentWeekMatches.map((match) => {
                  const homeUpper = match.home_team.toUpperCase();
                  const awayUpper = match.away_team.toUpperCase();
                  const themeCat =
                    match.pool_type === 'TFF' && !match.category.toUpperCase().includes('TÜRKİYE') && !match.category.toUpperCase().includes('TFF')
                      ? `TÜRKİYE ${match.category}`
                      : match.category;
                  const theme = getEliteTheme(themeCat, homeUpper, awayUpper);

                  const isOpen = !hiddenWinnersMap[match.id];
                  const sortedWinnerNames = (match.winner_ids || [])
                    .map((uid) => (accounts[uid]?.name || uid).replace(/🏆/g, '').trim())
                    .sort((a, b) => a.localeCompare(b, 'tr'));

                  return (
                    <div
                      key={match.id}
                      className={`w-full border rounded-2xl overflow-hidden flex flex-col relative transition-all ${theme.containerBorder} ${theme.containerShadow} ${theme.containerBg}`}
                    >
                      {theme.bgImg && (
                        <>
                          <div
                            className="absolute inset-0 z-0 opacity-100"
                            style={{ backgroundImage: theme.bgImg, backgroundSize: 'cover', backgroundPosition: 'center' }}
                          />
                          <div className="absolute inset-0 z-0 bg-slate-950/65" />
                        </>
                      )}

                      <div className="relative z-10 flex flex-col p-4 sm:p-5">
                        <div className="text-center mb-2">
                          <span className="text-[10px] font-black tracking-widest uppercase bg-slate-950/80 border border-slate-700/60 px-3 py-1 rounded-full text-slate-200">
                            {match.week_num}. HAFTA - {match.match_index}. MAÇ
                          </span>
                        </div>

                        <div className="text-center mb-2">
                          <span
                            className={`inline-block px-3 py-1 rounded-lg border text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
                          >
                            🏆 {match.category}
                          </span>
                        </div>

                        <div className="text-center text-[10px] font-bold text-slate-400 tracking-widest mb-3">
                          {match.match_date} <span className="mx-1 text-slate-600">|</span> {match.match_time}
                        </div>

                        <div className="flex items-center justify-between px-2 sm:px-4 py-2">
                          <div className="flex flex-col items-center flex-1 gap-2">
                            <img src={theme.homeLogo} alt={homeUpper} className="w-14 h-14 sm:w-20 sm:h-20 object-contain drop-shadow-lg" />
                            <span className="text-white font-black text-[10px] sm:text-xs text-center uppercase tracking-wide">{homeUpper}</span>
                          </div>

                          <div className="flex flex-col items-center justify-center mx-2 sm:mx-4 w-32 sm:w-40">
                            {theme.leagueLogo && (
                              <img src={theme.leagueLogo} alt="Lig" className="w-9 h-9 sm:w-11 sm:h-11 object-contain mb-2 drop-shadow-md" />
                            )}
                            <div className={`w-full bg-[#080d1a]/90 border ${theme.scoreBorder} py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-3 shadow-inner`}>
                              <span className="text-xl sm:text-3xl font-black text-white">{match.home_score}</span>
                              <span className="text-slate-500 font-bold">:</span>
                              <span className="text-xl sm:text-3xl font-black text-white">{match.away_score}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-center flex-1 gap-2">
                            <img src={theme.awayLogo} alt={awayUpper} className="w-14 h-14 sm:w-20 sm:h-20 object-contain drop-shadow-lg" />
                            <span className="text-white font-black text-[10px] sm:text-xs text-center uppercase tracking-wide">{awayUpper}</span>
                          </div>
                        </div>
                      </div>

                      <div className={`${theme.bottomBar} border-t border-slate-800/80 px-4 py-3 relative z-10`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 text-left">
                            {match.status === 'POSTPONED' ? (
                              <span className="text-[11px] text-amber-400/90 italic font-semibold">Ertelendi / İptal</span>
                            ) : match.status !== 'FINISHED' ? (
                              <span className="text-[11px] text-sky-400 font-semibold">Henüz sonuçlanmadı</span>
                            ) : match.winner_count > 0 ? (
                              <span className="text-[11px] text-slate-300 font-bold">
                                <strong className="text-amber-400">{match.winner_count} kişi</strong> tam isabetli
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500 italic">Bu skoru bilen yok</span>
                            )}
                          </div>

                          <div>
                            <span
                              className={`text-[9px] font-black tracking-widest px-2.5 py-1 rounded border ${
                                match.pool_type === 'TFF'
                                  ? 'bg-rose-950/90 text-rose-300 border-rose-500/60'
                                  : 'bg-teal-950/90 text-teal-300 border-teal-500/60'
                              }`}
                            >
                              {match.pool_type} MAÇI
                            </span>
                          </div>

                          <div className="flex-1 text-right">
                            {match.status === 'FINISHED' && match.winner_count > 0 && (
                              <button
                                onClick={() => toggleWinners(match.id)}
                                className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300"
                              >
                                {isOpen ? 'Gizle ▲' : 'Göster ▼'}
                              </button>
                            )}
                          </div>
                        </div>

                        {match.status === 'FINISHED' && match.winner_count > 0 && isOpen && (
                          <div className="mt-3 bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2.5">
                              <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                                BİLEN YARIŞMACILAR (A-Z)
                              </span>
                              <span className="bg-amber-950/90 border border-amber-500/50 text-amber-400 text-[9px] font-black px-2.5 py-0.5 rounded-md">
                                Kişi Başı: {match.points_awarded} Puan
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {sortedWinnerNames.map((wName, i) => (
                                <span
                                  key={i}
                                  className="bg-slate-900 border border-slate-700/70 text-slate-200 text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-md tracking-wide"
                                >
                                  {wName}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SEKME 2: HAFTALIK KESİNLEŞMİŞ ÖZET */}
            {activeTab === 'WEEK_CHECK' && (
              <div className="max-w-4xl mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl px-2.5 py-4 sm:p-6 shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
                  <h2 className="text-sm sm:text-lg font-black text-emerald-400 uppercase tracking-wider">
                    📋 {selectedWeek}. HAFTA PUAN ÖZETİ
                  </h2>
                  <span className="text-xs font-bold text-slate-400">
                    Puan Alan Oyuncu: <strong className="text-white">{weeklyCheckTable.length}</strong>
                  </span>
                </div>

                <table className="w-full table-fixed text-left text-xs sm:text-sm tabular-nums">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 text-[9px] sm:text-xs uppercase tracking-tight sm:tracking-wider">
                      <th className="py-2 px-1 w-[26px] sm:w-10">#</th>
                      <th className="py-2 px-1">Yarışmacı</th>
                      <th className="py-2 px-0.5 w-[34px] sm:w-16 text-center">DFO</th>
                      <th className="py-2 px-0.5 w-[34px] sm:w-16 text-center">TFF</th>
                      <th className="py-2 px-0.5 w-[38px] sm:w-20 text-center">Bns</th>
                      <th className="py-2 px-0.5 w-[38px] sm:w-20 text-center">Skor</th>
                      <th className="py-2 px-1 w-[46px] sm:w-24 text-right">Ham</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {weeklyCheckTable.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-slate-800/40">
                        <td className="py-2 px-1 font-black text-slate-500 text-[11px] sm:text-sm">{idx + 1}</td>
                        <td className="py-2 px-1 font-black text-white text-[11px] sm:text-sm truncate">{row.name}</td>
                        <td className="py-2 px-0.5 text-center text-teal-400 font-bold text-[11px] sm:text-sm">{row.dfo}</td>
                        <td className="py-2 px-0.5 text-center text-rose-400 font-bold text-[11px] sm:text-sm">{row.tff}</td>
                        <td className="py-2 px-0.5 text-center text-amber-300 font-bold text-[11px] sm:text-sm">
                          {row.bonus > 0 ? `+${row.bonus}` : '0'}
                        </td>
                        <td className="py-2 px-0.5 text-center text-emerald-400 font-black text-[11px] sm:text-sm">{row.scores}</td>
                        <td className="py-2 px-1 text-right text-amber-400 font-black text-xs sm:text-base">{row.rawTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SEKME 3: YENİ GENEL PUAN DURUMU + CANLI PUANLAMA */}
            {activeTab === 'TOTAL_STANDINGS' && (
              <div className="max-w-5xl mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl px-2 py-4 sm:p-6 shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-800 px-1">
                  <div>
                    <h2 className="text-sm sm:text-lg font-black text-amber-400 uppercase tracking-wider">
                      🏆 YENİ GENEL PUAN DURUMU (DFO + TFF + BONUS = MASTER)
                    </h2>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                      Yüklenen {availableWeeks.length} haftanın tamamı tek merkezden sıfır sapmayla hesaplanmaktadır.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {(['MASTER', 'CANLI', 'DFO', 'TFF', 'SKOR', 'BONUS'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setStandingsFilter(tab)}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                          standingsFilter === tab
                            ? tab === 'CANLI'
                              ? 'bg-rose-600 text-white shadow-md'
                              : 'bg-amber-500 text-slate-950 shadow-md'
                            : tab === 'CANLI'
                            ? 'bg-rose-950/70 border border-rose-500/40 text-rose-300 hover:bg-rose-900/80'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {tab === 'CANLI' && (
                          <span className={`w-1.5 h-1.5 rounded-full ${activeLiveMatchCount > 0 ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
                        )}
                        <span>{tab === 'CANLI' ? `CANLI${activeLiveMatchCount > 0 ? ` (${activeLiveMatchCount})` : ''}` : tab}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* MASTER SEKMESİ: TÜM SÜTUNLAR KAYDIRMASIZ TEK EKRANDA */}
                {standingsFilter === 'MASTER' ? (
                  <table className="w-full table-fixed text-left tabular-nums">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800 text-[9px] sm:text-xs uppercase tracking-tight sm:tracking-wider">
                        <th className="py-2.5 px-1 w-[24px] sm:w-10">#</th>
                        <th className="py-2.5 px-1">Yarışmacı</th>
                        <th className="py-2.5 px-0.5 w-[34px] sm:w-16 text-center text-teal-400/90">DFO</th>
                        <th className="py-2.5 px-0.5 w-[34px] sm:w-16 text-center text-rose-400/90">TFF</th>
                        <th className="py-2.5 px-0.5 w-[38px] sm:w-20 text-center text-amber-300/90">Bonus</th>
                        <th className="py-2.5 px-0.5 w-[38px] sm:w-24 text-center text-emerald-400/90">
                          <span className="sm:hidden">Skor</span>
                          <span className="hidden sm:inline">Tam İsabet</span>
                        </th>
                        <th className="py-2.5 px-1 w-[46px] sm:w-28 text-center text-amber-400 bg-amber-500/10 rounded-t-lg">
                          <span className="sm:hidden">Master</span>
                          <span className="hidden sm:inline">Master Toplam</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {cumulativeStandings.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-slate-800/40">
                          <td className="py-2 px-1 font-black text-slate-500 text-[11px] sm:text-sm">{idx + 1}</td>
                          <td className="py-2 px-1 font-black text-white text-[11px] sm:text-sm truncate" title={row.name}>
                            {row.name}
                          </td>
                          <td className="py-2 px-0.5 text-center text-teal-400 font-bold text-[11px] sm:text-sm">{row.dfo}</td>
                          <td className="py-2 px-0.5 text-center text-rose-400 font-bold text-[11px] sm:text-sm">{row.tff}</td>
                          <td className="py-2 px-0.5 text-center text-amber-300 font-bold text-[11px] sm:text-sm">
                            {row.bonus > 0 ? `+${row.bonus}` : '0'}
                          </td>
                          <td className="py-2 px-0.5 text-center text-emerald-400 font-black text-[11px] sm:text-sm">{row.scores}</td>
                          <td className="py-2 px-1 text-center text-amber-400 font-black text-xs sm:text-base bg-amber-500/5">
                            {row.master}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : standingsFilter === 'CANLI' ? (
                  /* CANLI SEKMESİ: KESİN KASA + O AN OYNANAN MAÇLARIN ANLIK PUANI (KAYDIRMASIZ) */
                  <div>
                    <div className="mb-3 px-2.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[10px] sm:text-xs">
                      {activeLiveMatchCount > 0 ? (
                        <span className="text-emerald-400 font-black tracking-wide">
                          🔴 Şu an {activeLiveMatchCount} maç canlı / onay aşamasında — anlık isabet puanları (+Canlı) dahildir.
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold">
                          ⚪ Şu an oynanan canlı maç bulunmuyor; kesinleşmiş resmi puanlar gösteriliyor.
                        </span>
                      )}
                    </div>

                    <table className="w-full table-fixed text-left tabular-nums">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800 text-[9px] sm:text-xs uppercase tracking-tight sm:tracking-wider">
                          <th className="py-2.5 px-1 w-[28px] sm:w-12">#</th>
                          <th className="py-2.5 px-1">Yarışmacı</th>
                          <th className="py-2.5 px-0.5 w-[40px] sm:w-20 text-center text-slate-300">Kesin</th>
                          <th className="py-2.5 px-0.5 w-[44px] sm:w-20 text-center text-emerald-400">+Canlı</th>
                          <th className="py-2.5 px-0.5 w-[38px] sm:w-20 text-center text-cyan-400">Skor</th>
                          <th className="py-2.5 px-1 w-[48px] sm:w-28 text-center text-rose-400 bg-rose-500/10 rounded-t-lg">
                            <span className="sm:hidden">Canlı</span>
                            <span className="hidden sm:inline">Canlı Toplam</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {effectiveLiveStandings.map((row) => {
                          const diff = row.kesin_sira - row.canli_sira;
                          return (
                            <tr key={row.user_id} className={row.canli_ek_puan > 0 ? 'bg-emerald-950/20 hover:bg-emerald-950/30' : 'hover:bg-slate-800/40'}>
                              <td className="py-2 px-1 font-black text-slate-400 text-[10px] sm:text-sm">
                                <span>{row.canli_sira}</span>
                                {diff > 0 && <span className="ml-0.5 text-[9px] text-emerald-400">▲</span>}
                                {diff < 0 && <span className="ml-0.5 text-[9px] text-rose-400">▼</span>}
                              </td>
                              <td className="py-2 px-1 font-black text-white text-[11px] sm:text-sm truncate" title={row.oyuncu_adi}>
                                {row.oyuncu_adi}
                              </td>
                              <td className="py-2 px-0.5 text-center text-slate-300 font-bold text-[11px] sm:text-sm">
                                {row.kesin_master}
                              </td>
                              <td className="py-2 px-0.5 text-center font-black text-[11px] sm:text-sm">
                                {row.canli_ek_puan > 0 ? (
                                  <span className="text-emerald-400">+{row.canli_ek_puan}</span>
                                ) : (
                                  <span className="text-slate-600">0</span>
                                )}
                              </td>
                              <td className="py-2 px-0.5 text-center text-cyan-400 font-bold text-[11px] sm:text-sm">
                                {row.canli_skor_toplam}
                              </td>
                              <td className="py-2 px-1 text-center text-amber-400 font-black text-xs sm:text-base bg-rose-500/5">
                                {row.canli_master_toplam}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* DFO, TFF, SKOR VE BONUS SEKMELERİ: YALNIZCA KENDİ PUAN SÜTUNU */
                  <table className="w-full table-fixed text-left tabular-nums">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800 text-[10px] sm:text-xs uppercase tracking-wider">
                        <th className="py-2.5 px-2 w-10 sm:w-14">#</th>
                        <th className="py-2.5 px-2">Yarışmacı</th>
                        <th className="py-2.5 px-3 w-28 sm:w-40 text-right">
                          {standingsFilter === 'DFO' && <span className="text-teal-400">DFO Puanı</span>}
                          {standingsFilter === 'TFF' && <span className="text-rose-400">TFF Puanı</span>}
                          {standingsFilter === 'SKOR' && <span className="text-emerald-400">Tam İsabet</span>}
                          {standingsFilter === 'BONUS' && <span className="text-amber-300">Bonus Puanı</span>}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {cumulativeStandings.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-2 font-black text-slate-500 text-xs sm:text-sm">{idx + 1}</td>
                          <td className="py-2.5 px-2 font-black text-white text-xs sm:text-sm truncate">{row.name}</td>
                          <td className="py-2.5 px-3 text-right font-black text-sm sm:text-base">
                            {standingsFilter === 'DFO' && <span className="text-teal-400">{row.dfo}</span>}
                            {standingsFilter === 'TFF' && <span className="text-rose-400">{row.tff}</span>}
                            {standingsFilter === 'SKOR' && <span className="text-emerald-400">{row.scores}</span>}
                            {standingsFilter === 'BONUS' && <span className="text-amber-300">+{row.bonus}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}