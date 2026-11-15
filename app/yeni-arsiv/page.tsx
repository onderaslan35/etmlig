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
  const [skorSubFilter, setSkorSubFilter] = useState<'MASTER' | 'DFO' | 'TFF'>('MASTER');
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
    { id: string; name: string; dfo: number; tff: number; bonus: number; master: number; scores: number; dfoScores: number; tffScores: number; pCount: number; sCount: number }
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
      dfoScores: 0,
      tffScores: 0,
      pCount: 0,
      sCount: 0
    };
  });

  allMatches.forEach((m) => {
    if (m.status !== 'FINISHED') return;
    (m.winner_ids || []).forEach((uid) => {
      if (inactiveIds.has(uid)) return;
      if (!map[uid]) {
        map[uid] = { id: uid, name: accounts[uid]?.name || uid, dfo: 0, tff: 0, bonus: 0, master: 0, scores: 0, dfoScores: 0, tffScores: 0, pCount: 0, sCount: 0 };
      }
      if (m.pool_type === 'TFF') {
        map[uid].tff += m.points_awarded;
        map[uid].tffScores += 1;
      } else {
        map[uid].dfo += m.points_awarded;
        map[uid].dfoScores += 1;
      }
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

  if (standingsFilter === 'DFO') return list.sort((a, b) => b.dfo - a.dfo || b.dfoScores - a.dfoScores || a.name.localeCompare(b.name, 'tr'));
  if (standingsFilter === 'TFF') return list.sort((a, b) => b.tff - a.tff || b.tffScores - a.tffScores || a.name.localeCompare(b.name, 'tr'));
  if (standingsFilter === 'SKOR') {
    if (skorSubFilter === 'DFO') return list.sort((a, b) => b.dfoScores - a.dfoScores || b.dfo - a.dfo || a.name.localeCompare(b.name, 'tr'));
    if (skorSubFilter === 'TFF') return list.sort((a, b) => b.tffScores - a.tffScores || b.tff - a.tff || a.name.localeCompare(b.name, 'tr'));
    return list.sort((a, b) => b.scores - a.scores || b.master - a.master || a.name.localeCompare(b.name, 'tr'));
  }
  if (standingsFilter === 'BONUS') {
    return list
      .filter((r) => r.bonus > 0)
      .sort((a, b) => b.bonus - a.bonus || b.sCount - a.sCount || a.name.localeCompare(b.name, 'tr'));
  }

  return list.sort((a, b) => b.master - a.master || b.scores - a.scores || a.name.localeCompare(b.name, 'tr'));
}, [allMatches, allWeeks, accounts, inactiveIds, standingsFilter, skorSubFilter]);

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
          <h1 className="text-xl sm:text-3xl font-black text-white tracking-widest uppercase text-center mb-4">
            PUAN DURUMLARI VE ARŞİV
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-[#070d19] border border-slate-800 p-2 sm:p-2.5 rounded-2xl shadow-2xl">
            <span className="text-[11px] font-black tracking-widest text-white uppercase pl-1 sm:pl-2">HAFTA SEÇ:</span>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="bg-black text-white border border-slate-700 hover:border-white focus:border-white font-black text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl outline-none cursor-pointer transition-colors"
            >
              {availableWeeks.map((w) => (
                <option key={w} value={w} className="bg-black text-white">
                  {w}. HAFTA
                </option>
              ))}
            </select>

            <div className="flex flex-wrap justify-center gap-1.5">
              <button
                onClick={() => setActiveTab('CARDS')}
                className={`px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-black tracking-widest uppercase transition-all bg-black text-white ${
                  activeTab === 'CARDS'
                    ? 'border-2 border-white shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                    : 'border border-slate-800 hover:border-slate-500'
                }`}
              >
                MAÇ ARŞİVİ
              </button>
              <button
                onClick={() => setActiveTab('WEEK_CHECK')}
                className={`px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-black tracking-widest uppercase transition-all bg-black text-white ${
                  activeTab === 'WEEK_CHECK'
                    ? 'border-2 border-white shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                    : 'border border-slate-800 hover:border-slate-500'
                }`}
              >
                {selectedWeek}. HAFTA ÖZETİ
              </button>
              <button
                onClick={() => setActiveTab('TOTAL_STANDINGS')}
                className={`px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-black tracking-widest uppercase transition-all bg-black text-white ${
                  activeTab === 'TOTAL_STANDINGS'
                    ? 'border-2 border-white shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                    : 'border border-slate-800 hover:border-slate-500'
                }`}
              >
                GENEL PUAN
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-white font-black tracking-widest animate-pulse">
            YÜKLENİYOR...
          </div>
        ) : allMatches.length === 0 ? (
          <div className="text-center py-16 bg-[#070d19] border border-slate-800 rounded-2xl">
            <p className="text-white font-bold text-sm">Henüz veritabanında maç kaydı bulunamadı.</p>
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
              <div className="max-w-4xl mx-auto bg-[#081020] border border-slate-800 rounded-2xl px-2.5 py-4 sm:p-6 shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
                  <h2 className="text-sm sm:text-lg font-black text-white uppercase tracking-widest">
                    {selectedWeek}. HAFTA PUAN ÖZETİ
                  </h2>
                  <span className="text-xs font-bold text-slate-300">
                    Puan Alan Oyuncu: <strong className="text-white">{weeklyCheckTable.length}</strong>
                  </span>
                </div>

                <table className="w-full table-fixed text-left text-xs sm:text-sm tabular-nums">
                  <thead>
                    <tr className="bg-black/60 text-white border-b border-slate-700 text-[9px] sm:text-xs uppercase tracking-tight sm:tracking-wider">
                      <th className="py-2.5 px-1 w-[26px] sm:w-10">#</th>
                      <th className="py-2.5 px-1">Yarışmacı</th>
                      <th className="py-2.5 px-0.5 w-[34px] sm:w-16 text-center">DFO</th>
                      <th className="py-2.5 px-0.5 w-[34px] sm:w-16 text-center">TFF</th>
                      <th className="py-2.5 px-0.5 w-[38px] sm:w-20 text-center">Bns</th>
                      <th className="py-2.5 px-0.5 w-[38px] sm:w-20 text-center">Skor</th>
                      <th className="py-2.5 px-1 w-[46px] sm:w-24 text-right">Ham</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {weeklyCheckTable.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-[#0f1d38] transition-colors">
                        <td className="py-2 px-1 font-black text-slate-300 text-[11px] sm:text-sm">{idx + 1}</td>
                        <td className="py-2 px-1 font-black text-white text-[11px] sm:text-sm truncate">{row.name}</td>
                        <td className="py-2 px-0.5 text-center text-white font-bold text-[11px] sm:text-sm">{row.dfo}</td>
                        <td className="py-2 px-0.5 text-center text-white font-bold text-[11px] sm:text-sm">{row.tff}</td>
                        <td className="py-2 px-0.5 text-center text-white font-bold text-[11px] sm:text-sm">
                          {row.bonus > 0 ? `+${row.bonus}` : '0'}
                        </td>
                        <td className="py-2 px-0.5 text-center text-white font-black text-[11px] sm:text-sm">{row.scores}</td>
                        <td className="py-2 px-1 text-right text-white font-black text-xs sm:text-base bg-black/40">{row.rawTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SEKME 3: GENEL PUAN DURUMU (DFO + TFF + BONUS = MASTER) */}
            {activeTab === 'TOTAL_STANDINGS' && (
              <div className="max-w-5xl mx-auto bg-[#081020] border border-slate-800 rounded-2xl px-2 py-4 sm:p-6 shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-800 px-1">
                  <div>
                    <h2 className="text-sm sm:text-lg font-black text-white uppercase tracking-widest">
                      GENEL PUAN DURUMU (DFO + TFF + BONUS = MASTER)
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {(['CANLI', 'MASTER', 'DFO', 'TFF', 'SKOR', 'BONUS'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setStandingsFilter(tab)}
                        className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all bg-black text-white ${
                          standingsFilter === tab
                            ? 'border-2 border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                            : 'border border-slate-700 hover:border-white'
                        }`}
                      >
                        {tab === 'CANLI' ? `CANLI${activeLiveMatchCount > 0 ? ` (${activeLiveMatchCount})` : ''}` : tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* MASTER SEKMESİ */}
                {standingsFilter === 'MASTER' ? (
                  <table className="w-full table-fixed text-left tabular-nums">
                    <thead>
                      <tr className="bg-black/60 text-white border-b border-slate-700 text-[9px] sm:text-xs uppercase tracking-tight sm:tracking-wider">
                        <th className="py-2.5 px-1 w-[24px] sm:w-10">#</th>
                        <th className="py-2.5 px-1">Yarışmacı</th>
                        <th className="py-2.5 px-0.5 w-[34px] sm:w-16 text-center">DFO</th>
                        <th className="py-2.5 px-0.5 w-[34px] sm:w-16 text-center">TFF</th>
                        <th className="py-2.5 px-0.5 w-[38px] sm:w-20 text-center">Bonus</th>
                        <th className="py-2.5 px-0.5 w-[38px] sm:w-24 text-center">
                          <span className="sm:hidden">Skor</span>
                          <span className="hidden sm:inline">Tam İsabet</span>
                        </th>
                        <th className="py-2.5 px-1 w-[46px] sm:w-28 text-center bg-black border-x border-t border-slate-700 rounded-t-lg">
                          <span className="sm:hidden">Master</span>
                          <span className="hidden sm:inline">Master Toplam</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {cumulativeStandings.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-[#0f1d38] transition-colors">
                          <td className="py-2 px-1 font-black text-slate-300 text-[11px] sm:text-sm">{idx + 1}</td>
                          <td className="py-2 px-1 font-black text-white text-[11px] sm:text-sm truncate" title={row.name}>
                            {row.name}
                          </td>
                          <td className="py-2 px-0.5 text-center text-white font-bold text-[11px] sm:text-sm">{row.dfo}</td>
                          <td className="py-2 px-0.5 text-center text-white font-bold text-[11px] sm:text-sm">{row.tff}</td>
                          <td className="py-2 px-0.5 text-center text-white font-bold text-[11px] sm:text-sm">
                            {row.bonus > 0 ? `+${row.bonus}` : '0'}
                          </td>
                          <td className="py-2 px-0.5 text-center text-white font-black text-[11px] sm:text-sm">{row.scores}</td>
                          <td className="py-2 px-1 text-center text-white font-black text-xs sm:text-base bg-black/50">
                            {row.master}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : standingsFilter === 'CANLI' ? (
                  /* CANLI SEKMESİ */
                  <div>
                    <div className="mb-3 px-3 py-2 rounded-xl bg-black border border-slate-800 flex items-center justify-between text-[10px] sm:text-xs">
                      <span className="text-white font-bold tracking-wide">
                        {activeLiveMatchCount > 0
                          ? `Şu an ${activeLiveMatchCount} maç canlı / onay aşamasında — anlık puanlar (+Canlı) dahildir.`
                          : 'Şu an oynanan canlı maç bulunmuyor; kesinleşmiş puanlar gösteriliyor.'}
                      </span>
                    </div>

                    <table className="w-full table-fixed text-left tabular-nums">
                      <thead>
                        <tr className="bg-black/60 text-white border-b border-slate-700 text-[9px] sm:text-xs uppercase tracking-tight sm:tracking-wider">
                          <th className="py-2.5 px-1 w-[28px] sm:w-12">#</th>
                          <th className="py-2.5 px-1">Yarışmacı</th>
                          <th className="py-2.5 px-0.5 w-[40px] sm:w-20 text-center">Kesin</th>
                          <th className="py-2.5 px-0.5 w-[44px] sm:w-20 text-center">+Canlı</th>
                          <th className="py-2.5 px-0.5 w-[38px] sm:w-20 text-center">Skor</th>
                          <th className="py-2.5 px-1 w-[48px] sm:w-28 text-center bg-black border-x border-t border-slate-700 rounded-t-lg">
                            <span className="sm:hidden">Toplam</span>
                            <span className="hidden sm:inline">Canlı Toplam</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {effectiveLiveStandings.map((row) => {
                          const diff = row.kesin_sira - row.canli_sira;
                          return (
                            <tr
                              key={row.user_id}
                              className={row.canli_ek_puan > 0 ? 'bg-white/[0.07] hover:bg-white/[0.12]' : 'hover:bg-[#0f1d38]'}
                            >
                              <td className="py-2 px-1 font-black text-slate-300 text-[10px] sm:text-sm">
                                <span>{row.canli_sira}</span>
                                {diff > 0 && <span className="ml-0.5 text-[9px] text-white">▲</span>}
                                {diff < 0 && <span className="ml-0.5 text-[9px] text-slate-400">▼</span>}
                              </td>
                              <td className="py-2 px-1 font-black text-white text-[11px] sm:text-sm truncate" title={row.oyuncu_adi}>
                                {row.oyuncu_adi}
                              </td>
                              <td className="py-2 px-0.5 text-center text-white font-bold text-[11px] sm:text-sm">
                                {row.kesin_master}
                              </td>
                              <td className="py-2 px-0.5 text-center font-black text-[11px] sm:text-sm text-white">
                                {row.canli_ek_puan > 0 ? `+${row.canli_ek_puan}` : '0'}
                              </td>
                              <td className="py-2 px-0.5 text-center text-white font-bold text-[11px] sm:text-sm">
                                {row.canli_skor_toplam}
                              </td>
                              <td className="py-2 px-1 text-center text-white font-black text-xs sm:text-base bg-black/50">
                                {row.canli_master_toplam}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* SKOR (MASTER / DFO / TFF) VE DİĞER SEKMELER */
                  <div>
                    {standingsFilter === 'SKOR' && (
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 pb-3 border-b border-slate-800/80">
                        {([
                          { key: 'MASTER', label: 'MASTER SKOR' },
                          { key: 'DFO', label: 'DFO SKOR' },
                          { key: 'TFF', label: 'TFF SKOR' }
                        ] as const).map((st) => (
                          <button
                            key={st.key}
                            onClick={() => setSkorSubFilter(st.key)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all bg-black text-white ${
                              skorSubFilter === st.key
                                ? 'border-2 border-white shadow-[0_0_8px_rgba(255,255,255,0.2)]'
                                : 'border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {standingsFilter === 'SKOR' && skorSubFilter === 'MASTER' ? (
                      <table className="w-full table-fixed text-left tabular-nums">
                        <thead>
                          <tr className="bg-black/60 text-white border-b border-slate-700 text-[9px] sm:text-xs uppercase tracking-tight sm:tracking-wider">
                            <th className="py-2.5 px-1 w-[28px] sm:w-12">#</th>
                            <th className="py-2.5 px-1">Yarışmacı</th>
                            <th className="py-2.5 px-1 w-[48px] sm:w-24 text-center">DFO</th>
                            <th className="py-2.5 px-1 w-[48px] sm:w-24 text-center">TFF</th>
                            <th className="py-2.5 px-1 w-[56px] sm:w-28 text-center bg-black border-x border-t border-slate-700 rounded-t-lg">Master</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                          {cumulativeStandings.map((row, idx) => (
                            <tr key={row.id} className="hover:bg-[#0f1d38] transition-colors">
                              <td className="py-2 px-1 font-black text-slate-300 text-[11px] sm:text-sm">{idx + 1}</td>
                              <td className="py-2 px-1 font-black text-white text-[11px] sm:text-sm truncate">{row.name}</td>
                              <td className="py-2 px-1 text-center text-white font-bold text-[11px] sm:text-sm">{row.dfoScores}</td>
                              <td className="py-2 px-1 text-center text-white font-bold text-[11px] sm:text-sm">{row.tffScores}</td>
                              <td className="py-2 px-1 text-center text-white font-black text-xs sm:text-base bg-black/50">{row.scores}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <table className="w-full table-fixed text-left tabular-nums">
                        <thead>
                          <tr className="bg-black/60 text-white border-b border-slate-700 text-[10px] sm:text-xs uppercase tracking-wider">
                            <th className="py-2.5 px-2 w-10 sm:w-14">#</th>
                            <th className="py-2.5 px-2">Yarışmacı</th>
                            <th className="py-2.5 px-3 w-28 sm:w-40 text-right">
                              {standingsFilter === 'DFO' && 'DFO Puanı'}
                              {standingsFilter === 'TFF' && 'TFF Puanı'}
                              {standingsFilter === 'SKOR' && skorSubFilter === 'DFO' && 'DFO Skor'}
                              {standingsFilter === 'SKOR' && skorSubFilter === 'TFF' && 'TFF Skor'}
                              {standingsFilter === 'BONUS' && 'Bonus Puanı'}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                          {cumulativeStandings.map((row, idx) => (
                            <tr key={row.id} className="hover:bg-[#0f1d38] transition-colors">
                              <td className="py-2.5 px-2 font-black text-slate-300 text-xs sm:text-sm">{idx + 1}</td>
                              <td className="py-2.5 px-2 font-black text-white text-xs sm:text-sm truncate">{row.name}</td>
                              <td className="py-2.5 px-3 text-right font-black text-sm sm:text-base text-white">
                                {standingsFilter === 'DFO' && row.dfo}
                                {standingsFilter === 'TFF' && row.tff}
                                {standingsFilter === 'SKOR' && skorSubFilter === 'DFO' && row.dfoScores}
                                {standingsFilter === 'SKOR' && skorSubFilter === 'TFF' && row.tffScores}
                                {standingsFilter === 'BONUS' && `+${row.bonus}`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}