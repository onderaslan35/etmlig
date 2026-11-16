'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/utils/supabase';
import { TEST_ACCOUNTS, getEliteTheme } from '@/utils/themeEngine';

const EXCLUDED_IDS = new Set(['mankoman', '272727', '262787']);

interface OfficialMatch {
  id: number;
  week_num: number;
  match_index: number;
  category: string;
  match_date: string;
  match_time: string;
  home_team: string;
  away_team: string;
  pool_type: 'DFO' | 'TFF';
  status: string;
  home_score: number | null;
  away_score: number | null;
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

type MainTabType = 'TOTAL_STANDINGS' | 'CARDS' | 'WEEK_CHECK' | 'WEEK_CUMULATIVE' | 'LEADERS_TIMELINE';
type StandingsFilterType = 'CANLI' | 'MASTER' | 'DFO' | 'TFF' | 'SKOR' | 'BONUS';

export default function YeniArsivPage() {
  const [allMatches, setAllMatches] = useState<OfficialMatch[]>([]);
  const [allWeeks, setAllWeeks] = useState<OfficialWeek[]>([]);
  const [liveStandings, setLiveStandings] = useState<LiveStandingRow[]>([]);
  const [accounts, setAccounts] = useState<Record<string, { name: string }>>({});
  const [inactiveIds, setInactiveIds] = useState<Set<string>>(new Set(EXCLUDED_IDS));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedWeek, setSelectedWeek] = useState<number>(41);
  const [activeTab, setActiveTab] = useState<MainTabType>('TOTAL_STANDINGS');

  const [standingsFilter, setStandingsFilter] = useState<StandingsFilterType>('MASTER');
  const [masterSubFilter, setMasterSubFilter] = useState<'DUZ' | 'DETAYLI'>('DUZ');
  const [skorSubFilter, setSkorSubFilter] = useState<'DUZ' | 'DETAYLI' | 'DFO' | 'TFF'>('DUZ');

  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});
  const [openWinnerLists, setOpenWinnerLists] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let isMounted = true;

    const fetchAllOfficialData = async () => {
      setIsLoading(true);

      const fetchAllOfficialMatches = async () => {
        let collected: OfficialMatch[] = [];
        let from = 0;
        const step = 1000;
        let keepGoing = true;
        while (keepGoing) {
          const { data, error } = await supabase
            .from('etml_official_matches')
            .select('*')
            .order('week_num', { ascending: true })
            .order('match_index', { ascending: true })
            .range(from, from + step - 1);

          if (error || !data || data.length === 0) {
            keepGoing = false;
          } else {
            collected = [...collected, ...(data as OfficialMatch[])];
            if (data.length < step) keepGoing = false;
            else from += step;
          }
        }
        return collected;
      };

      const [matchesList, weeksRes, playersRes, offPlayersRes, liveViewRes] = await Promise.all([
        fetchAllOfficialMatches(),
        supabase.from('etml_official_weeks').select('*').order('week_num', { ascending: true }),
        supabase.from('players').select('*'),
        supabase.from('etml_official_players').select('*'),
        supabase.from('etml_live_standings_summary').select('*').order('canli_sira', { ascending: true })
      ]);

      if (!isMounted) return;

      const disabled = new Set<string>(EXCLUDED_IDS);
      const accMap: Record<string, { name: string }> = {};

      Object.keys(TEST_ACCOUNTS).forEach((uid) => {
        if (!disabled.has(uid)) {
          accMap[uid] = { name: TEST_ACCOUNTS[uid].name };
        }
      });

      if (offPlayersRes.data) {
        offPlayersRes.data.forEach((op: any) => {
          const uid = String(op.user_id || '').trim();
          if (!uid) return;
          if (op.is_active === false) {
            disabled.add(uid);
            delete accMap[uid];
          } else if (!disabled.has(uid) && op.full_name) {
            accMap[uid] = { name: op.full_name };
          }
        });
      }

      if (playersRes.data) {
        playersRes.data.forEach((p: any) => {
          const uid = String(p.username || p.user_id || p.id || '').trim();
          if (uid && !disabled.has(uid)) {
            accMap[uid] = { name: p.name || p.full_name || accMap[uid]?.name || uid };
          }
        });
      }

      setInactiveIds(disabled);
      setAccounts(accMap);
      setAllMatches(matchesList);
      setAllWeeks((weeksRes.data || []) as OfficialWeek[]);
      setLiveStandings((liveViewRes.data || []) as LiveStandingRow[]);

      if (matchesList.length > 0) {
        const maxW = Math.max(...matchesList.map((m) => Number(m.week_num)));
        setSelectedWeek(maxW);
      }

      setIsLoading(false);
    };

    fetchAllOfficialData();

    const channel = supabase
      .channel('yeni-arsiv-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_matches' }, async () => {
        const { data } = await supabase
          .from('etml_live_standings_summary')
          .select('*')
          .order('canli_sira', { ascending: true });
        if (isMounted && data) setLiveStandings(data as LiveStandingRow[]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'etml_official_matches' }, async () => {
        const { data: liveData } = await supabase
          .from('etml_live_standings_summary')
          .select('*')
          .order('canli_sira', { ascending: true });
        if (isMounted && liveData) setLiveStandings(liveData as LiveStandingRow[]);
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const availableWeeks = useMemo(() => {
    const wSet = new Set<number>(allMatches.map((m) => Number(m.week_num)));
    const arr = Array.from(wSet).sort((a, b) => b - a);
    return arr.length > 0 ? arr : [41];
  }, [allMatches]);

  const maxAvailableWeek = availableWeeks[0] || 41;

  // Canlı sekmesi yalnızca Genel Puan modundayken anlamlıdır; geçmiş kümülatife geçilirse MASTER'a al
  useEffect(() => {
    if (activeTab === 'WEEK_CUMULATIVE' && standingsFilter === 'CANLI') {
      setStandingsFilter('MASTER');
    }
  }, [activeTab, standingsFilter]);

  const weekMatches = useMemo(() => {
    return allMatches
      .filter((m) => Number(m.week_num) === Number(selectedWeek))
      .sort((a, b) => Number(a.match_index) - Number(b.match_index));
  }, [allMatches, selectedWeek]);

  const selectedWeekMeta = useMemo(() => {
    return allWeeks.find((w) => Number(w.week_num) === Number(selectedWeek)) || null;
  }, [allWeeks, selectedWeek]);

  // SEÇİLEN HAFTANIN TEKİL ÖZETİ (Sadece o hafta alınan puanlar)
  const weeklyCheckTable = useMemo(() => {
    const map: Record<
      string,
      { id: string; name: string; dfo: number; tff: number; bonus: number; scores: number; rawTotal: number; totalWithBonus: number }
    > = {};

    weekMatches.forEach((m) => {
      if (m.status !== 'FINISHED') return;
      (m.winner_ids || []).forEach((uid) => {
        if (inactiveIds.has(uid)) return;
        if (!map[uid]) {
          map[uid] = {
            id: uid,
            name: accounts[uid]?.name || uid,
            dfo: 0,
            tff: 0,
            bonus: 0,
            scores: 0,
            rawTotal: 0,
            totalWithBonus: 0
          };
        }
        if (m.pool_type === 'TFF') map[uid].tff += Number(m.points_awarded || 0);
        else map[uid].dfo += Number(m.points_awarded || 0);
        map[uid].scores += 1;
      });
    });

    if (selectedWeekMeta && selectedWeekMeta.is_completed && selectedWeekMeta.bonus_enabled) {
      if (selectedWeekMeta.puan_bonus > 0 && selectedWeekMeta.puan_lideri_ids?.length === 1) {
        const lid = selectedWeekMeta.puan_lideri_ids[0];
        if (!inactiveIds.has(lid)) {
          if (!map[lid]) {
            map[lid] = { id: lid, name: accounts[lid]?.name || lid, dfo: 0, tff: 0, bonus: 0, scores: 0, rawTotal: 0, totalWithBonus: 0 };
          }
          map[lid].bonus += Number(selectedWeekMeta.puan_bonus);
        }
      }
      if (selectedWeekMeta.skor_bonus > 0 && selectedWeekMeta.skor_krali_ids?.length === 1) {
        const kid = selectedWeekMeta.skor_krali_ids[0];
        if (!inactiveIds.has(kid)) {
          if (!map[kid]) {
            map[kid] = { id: kid, name: accounts[kid]?.name || kid, dfo: 0, tff: 0, bonus: 0, scores: 0, rawTotal: 0, totalWithBonus: 0 };
          }
          map[kid].bonus += Number(selectedWeekMeta.skor_bonus);
        }
      }
    }

    return Object.values(map)
      .map((r) => ({
        ...r,
        rawTotal: r.dfo + r.tff,
        totalWithBonus: r.dfo + r.tff + r.bonus
      }))
      .filter((r) => r.totalWithBonus > 0 || r.scores > 0)
      .sort((a, b) => b.totalWithBonus - a.totalWithBonus || b.scores - a.scores || a.name.localeCompare(b.name, 'tr'));
  }, [weekMatches, selectedWeekMeta, accounts, inactiveIds]);

  // HERHANGİ BİR HAFTAYA KADAR (1..upToWeek) KÜMÜLATİF HESAPLAMA MOTORU
  const buildStandingsUpToWeek = useMemo(() => {
    return (upToWeek: number) => {
      const map: Record<
        string,
        {
          id: string;
          name: string;
          dfo: number;
          tff: number;
          bonus: number;
          master: number;
          scores: number;
          dfoScores: number;
          tffScores: number;
          pCount: number;
          sCount: number;
        }
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
        if (m.status !== 'FINISHED' || Number(m.week_num) > upToWeek) return;
        (m.winner_ids || []).forEach((uid) => {
          if (inactiveIds.has(uid)) return;
          if (!map[uid]) {
            map[uid] = {
              id: uid,
              name: accounts[uid]?.name || uid,
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
          }
          if (m.pool_type === 'TFF') {
            map[uid].tff += Number(m.points_awarded || 0);
            map[uid].tffScores += 1;
          } else {
            map[uid].dfo += Number(m.points_awarded || 0);
            map[uid].dfoScores += 1;
          }
          map[uid].scores += 1;
        });
      });

      allWeeks.forEach((w) => {
        if (!w.is_completed || !w.bonus_enabled || Number(w.week_num) > upToWeek) return;
        if (w.puan_bonus > 0 && w.puan_lideri_ids?.length === 1) {
          const lid = w.puan_lideri_ids[0];
          if (!inactiveIds.has(lid) && map[lid]) {
            map[lid].bonus += Number(w.puan_bonus);
            map[lid].pCount += 1;
          }
        }
        if (w.skor_bonus > 0 && w.skor_krali_ids?.length === 1) {
          const kid = w.skor_krali_ids[0];
          if (!inactiveIds.has(kid) && map[kid]) {
            map[kid].bonus += Number(w.skor_bonus);
            map[kid].sCount += 1;
          }
        }
      });

      Object.values(map).forEach((row) => {
        row.master = row.dfo + row.tff + row.bonus;
      });

      return Object.values(map);
    };
  }, [allMatches, allWeeks, accounts, inactiveIds]);

  // AKTİF HEDEF HAFTA: 'TOTAL_STANDINGS' ise tüm haftalar, 'WEEK_CUMULATIVE' ise 1..selectedWeek arası!
  const targetCumulativeWeek = activeTab === 'WEEK_CUMULATIVE' ? selectedWeek : maxAvailableWeek;

  // Bir önceki haftanın sıralaması (22. Hafta Genel seçildiğinde 21. haftaya göre ▲/▼ değişimini gösterir)
  const prevWeekRankMap = useMemo(() => {
    if (targetCumulativeWeek <= 1) return {};
    const prevList = buildStandingsUpToWeek(targetCumulativeWeek - 1);
    prevList.sort((a, b) => b.master - a.master || b.scores - a.scores || a.name.localeCompare(b.name, 'tr'));
    const rMap: Record<string, number> = {};
    prevList.forEach((r, idx) => {
      rMap[r.id] = idx + 1;
    });
    return rMap;
  }, [buildStandingsUpToWeek, targetCumulativeWeek]);

  // Gösterilecek Kümülatif Puan Tablosu
  const cumulativeStandings = useMemo(() => {
    const list = buildStandingsUpToWeek(targetCumulativeWeek);

    if (standingsFilter === 'DFO') {
      return list.sort((a, b) => b.dfo - a.dfo || b.dfoScores - a.dfoScores || a.name.localeCompare(b.name, 'tr'));
    }
    if (standingsFilter === 'TFF') {
      return list.sort((a, b) => b.tff - a.tff || b.tffScores - a.tffScores || a.name.localeCompare(b.name, 'tr'));
    }
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
  }, [buildStandingsUpToWeek, targetCumulativeWeek, standingsFilter, skorSubFilter]);

  // 1. HAFTADAN SON HAFTAYA KÜMÜLATİF LİDERLER KRONOLOJİSİ ("1. Hafta Mehmet Ali Karay, 2. Hafta Doğa Çalkan...")
  const cumulativeLeadersHistory = useMemo(() => {
    const ascWeeks = [...availableWeeks].sort((a, b) => a - b);
    return ascWeeks
      .map((w) => {
        const hasFinishedMatch = allMatches.some((m) => Number(m.week_num) === w && m.status === 'FINISHED');
        if (!hasFinishedMatch) return null;

        const st = buildStandingsUpToWeek(w).sort(
          (a, b) => b.master - a.master || b.scores - a.scores || a.name.localeCompare(b.name, 'tr')
        );
        if (st.length === 0 || st[0].master === 0) return null;

        const leader = st[0];
        const runnerUp = st[1];
        const diff = runnerUp ? leader.master - runnerUp.master : leader.master;

        // O haftanın kendi içindeki en yüksek puanlısını da bilgi olarak bul
        const wMeta = allWeeks.find((wm) => Number(wm.week_num) === w);
        const weekStarNames = (wMeta?.puan_lideri_ids || []).map((id) => accounts[id]?.name || id);

        return {
          week: w,
          leaderId: leader.id,
          leaderName: leader.name,
          leaderMaster: leader.master,
          leaderDfo: leader.dfo,
          leaderTff: leader.tff,
          leaderBonus: leader.bonus,
          leaderScores: leader.scores,
          runnerUpName: runnerUp?.name || '-',
          runnerUpMaster: runnerUp?.master || 0,
          pointGap: diff,
          weekTopNames: weekStarNames
        };
      })
      .filter(Boolean) as {
      week: number;
      leaderId: string;
      leaderName: string;
      leaderMaster: number;
      leaderDfo: number;
      leaderTff: number;
      leaderBonus: number;
      leaderScores: number;
      runnerUpName: string;
      runnerUpMaster: number;
      pointGap: number;
      weekTopNames: string[];
    }[];
  }, [availableWeeks, allMatches, allWeeks, buildStandingsUpToWeek, accounts]);

  const activeLiveMatchCount = liveStandings.length > 0 ? Number(liveStandings[0].aktif_mac_sayisi || 0) : 0;

  const effectiveLiveStandings = useMemo(() => {
    const filtered = liveStandings.filter((r) => !inactiveIds.has(r.user_id));
    if (filtered.length > 0) return filtered;

    const fullList = buildStandingsUpToWeek(maxAvailableWeek).sort(
      (a, b) => b.master - a.master || b.scores - a.scores || a.name.localeCompare(b.name, 'tr')
    );

    return fullList.map((r, idx) => ({
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
  }, [liveStandings, inactiveIds, buildStandingsUpToWeek, maxAvailableWeek]);

  const toggleCardExpand = (id: number) => setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleWinners = (id: number) => setOpenWinnerLists((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="min-h-screen bg-[#050a14] text-slate-100 pb-20">
      <div className="max-w-6xl mx-auto px-2 sm:px-6 pt-3 sm:pt-5">
        
        {/* ÜST KOMPAKT KUMANDA CETVELİ */}
        <div className="flex flex-col items-center justify-center mb-3 sm:mb-5">
          <div className="w-full max-w-5xl bg-[#071126] border border-slate-800 p-1.5 sm:p-2 rounded-xl shadow-md flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
            
            {/* Hafta Seçici */}
            <div className="flex items-center gap-1 bg-[#040917] border border-slate-700 rounded-lg px-2 py-1">
              <span className="text-[9px] sm:text-[10px] font-black tracking-wider text-sky-300 uppercase">HAFTA:</span>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="bg-transparent text-white font-black text-[11px] sm:text-xs outline-none cursor-pointer"
              >
                {availableWeeks.map((w) => (
                  <option key={w} value={w} className="bg-[#040917] text-white">
                    {w}. Hafta
                  </option>
                ))}
              </select>
            </div>

            {/* 1. Genel Puan */}
            <button
              onClick={() => setActiveTab('TOTAL_STANDINGS')}
              className={`px-2.5 py-1.5 rounded-lg text-[9.5px] sm:text-[11px] font-black tracking-wider uppercase transition-colors ${
                activeTab === 'TOTAL_STANDINGS'
                  ? 'bg-blue-700 text-white border border-sky-400/70'
                  : 'bg-[#040917] text-slate-300 border border-slate-800 hover:border-slate-600 hover:text-white'
              }`}
            >
              GENEL PUAN
            </button>

            {/* 2. Maç Arşivi */}
            <button
              onClick={() => setActiveTab('CARDS')}
              className={`px-2.5 py-1.5 rounded-lg text-[9.5px] sm:text-[11px] font-black tracking-wider uppercase transition-colors ${
                activeTab === 'CARDS'
                  ? 'bg-blue-700 text-white border border-sky-400/70'
                  : 'bg-[#040917] text-slate-300 border border-slate-800 hover:border-slate-600 hover:text-white'
              }`}
            >
              MAÇ ARŞİVİ
            </button>

            {/* 3. Hafta Özeti */}
            <button
              onClick={() => setActiveTab('WEEK_CHECK')}
              className={`px-2.5 py-1.5 rounded-lg text-[9.5px] sm:text-[11px] font-black tracking-wider uppercase transition-colors ${
                activeTab === 'WEEK_CHECK'
                  ? 'bg-blue-700 text-white border border-sky-400/70'
                  : 'bg-[#040917] text-slate-300 border border-slate-800 hover:border-slate-600 hover:text-white'
              }`}
            >
              {selectedWeek}. HAFTA ÖZETİ
            </button>

            {/* 4. Hafta Genel */}
            <button
              onClick={() => setActiveTab('WEEK_CUMULATIVE')}
              className={`px-2.5 py-1.5 rounded-lg text-[9.5px] sm:text-[11px] font-black tracking-wider uppercase transition-colors ${
                activeTab === 'WEEK_CUMULATIVE'
                  ? 'bg-blue-700 text-white border border-sky-400/70'
                  : 'bg-[#040917] text-slate-300 border border-slate-800 hover:border-slate-600 hover:text-white'
              }`}
            >
              {selectedWeek}. HAFTA GENEL
            </button>

            {/* 5. Liderler */}
            <button
              onClick={() => setActiveTab('LEADERS_TIMELINE')}
              className={`px-2.5 py-1.5 rounded-lg text-[9.5px] sm:text-[11px] font-black tracking-wider uppercase transition-colors ${
                activeTab === 'LEADERS_TIMELINE'
                  ? 'bg-blue-700 text-white border border-sky-400/70'
                  : 'bg-[#040917] text-slate-300 border border-slate-800 hover:border-slate-600 hover:text-white'
              }`}
            >
              LİDERLER
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-sky-300 font-black tracking-widest animate-pulse text-sm">
            YÜKLENİYOR...
          </div>
        ) : allMatches.length === 0 ? (
          <div className="text-center py-16 bg-[#071126] border border-blue-900/50 rounded-2xl">
            <p className="text-slate-300 font-bold text-sm">Henüz veritabanında maç kaydı bulunamadı.</p>
          </div>
        ) : (
          <>
            {/* ======================================================================= */}
            {/* SEKME 1: MAÇ ARŞİVİ KARTLARI (DOKUNULMADI - ORİJİNAL GÖRÜNÜM)          */}
            {/* ======================================================================= */}
            {activeTab === 'CARDS' && (
              <div>
                {selectedWeekMeta && selectedWeekMeta.is_completed && (
                  <div className="max-w-4xl mx-auto mb-4 p-3 rounded-xl bg-[#071126] border border-blue-800/50 flex flex-wrap items-center justify-center gap-3 text-[11px]">
                    <span className="text-emerald-400 font-black uppercase">
                      🔥 Haftanın Lideri:{' '}
                      <strong className="text-white">
                        {selectedWeekMeta.puan_lideri_ids?.length > 0
                          ? selectedWeekMeta.puan_lideri_ids.map((id) => accounts[id]?.name || id).join(' & ')
                          : '-'}
                      </strong>
                      {selectedWeekMeta.bonus_enabled && selectedWeekMeta.puan_bonus > 0 && ' (+3 Bonus)'}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-orange-400 font-black uppercase">
                      ⚽ Skor Kralı:{' '}
                      <strong className="text-white">
                        {selectedWeekMeta.skor_krali_ids?.length > 0
                          ? selectedWeekMeta.skor_krali_ids.map((id) => accounts[id]?.name || id).join(' & ')
                          : '-'}
                      </strong>
                      {selectedWeekMeta.bonus_enabled && selectedWeekMeta.skor_bonus > 0 && ' (+3 Bonus)'}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start">
                  {weekMatches.map((m) => {
                    const homeUpper = (m.home_team || '').toUpperCase();
                    const awayUpper = (m.away_team || '').toUpperCase();
                    const isTff = m.pool_type === 'TFF';
                    const themeCat =
                      isTff && !m.category.toUpperCase().includes('TÜRKİYE') && !m.category.toUpperCase().includes('TFF')
                        ? `TÜRKİYE ${m.category}`
                        : m.category;
                    const theme = getEliteTheme(themeCat, homeUpper, awayUpper);
                    const isExpanded = !!expandedCards[m.id];
                    const isWinnersOpen = openWinnerLists[m.id] !== false;
                    const isFin = m.status === 'FINISHED';
                    const isPostponed = m.status === 'POSTPONED';
                    const winnerNames = (m.winner_ids || [])
                      .filter((uid) => !inactiveIds.has(uid))
                      .map((uid) => accounts[uid]?.name || uid)
                      .sort((a, b) => a.localeCompare(b, 'tr'));

                    return (
                      <div
                        key={m.id}
                        className={`w-full border rounded-xl overflow-hidden transition-all duration-300 relative ${theme.containerBorder} ${
                          isExpanded ? `${theme.containerShadow} ${theme.containerBg}` : 'bg-slate-950/90 shadow-md'
                        }`}
                      >
                        {theme.bgImg && (
                          <>
                            <div
                              className="absolute inset-0 z-0 opacity-100"
                              style={{ backgroundImage: theme.bgImg, backgroundSize: 'cover', backgroundPosition: 'center' }}
                            />
                            <div className={`absolute inset-0 z-0 ${isExpanded ? 'bg-slate-900/65' : 'bg-slate-950/75 hover:bg-slate-900/65'}`} />
                          </>
                        )}

                        {!isExpanded ? (
                          <div
                            onClick={() => toggleCardExpand(m.id)}
                            className="cursor-pointer px-2.5 sm:px-4 py-2.5 flex items-center justify-between relative z-10 group"
                          >
                            <div className="flex-1 flex items-center justify-end pr-2 overflow-hidden">
                              <span className="text-[10px] sm:text-xs font-bold text-slate-200 uppercase truncate text-right group-hover:text-white">
                                {homeUpper}
                              </span>
                            </div>

                            <div className="flex items-center justify-center shrink-0">
                              <img src={theme.homeLogo} alt={homeUpper} className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-md" />
                              <div className="flex flex-col items-center mx-1.5 min-w-[46px]">
                                <span className="text-[8px] font-black tracking-wider text-slate-400 mb-0.5">
                                  {isPostponed ? 'ERT' : isFin ? `${m.match_index}. MAÇ` : m.match_time}
                                </span>
                                <div className="px-2 py-0.5 rounded bg-[#080d1a]/90 border border-slate-700/70 text-center w-full">
                                  <span className="font-black text-xs sm:text-sm text-white tracking-widest">
                                    {isFin ? `${m.home_score}-${m.away_score}` : isPostponed ? 'ERT' : 'v'}
                                  </span>
                                </div>
                              </div>
                              <img src={theme.awayLogo} alt={awayUpper} className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-md" />
                            </div>

                            <div className="flex-1 flex items-center justify-start pl-2 overflow-hidden">
                              <span className="text-[10px] sm:text-xs font-bold text-slate-200 uppercase truncate text-left group-hover:text-white">
                                {awayUpper}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="relative z-10 p-3 sm:p-4">
                            <button
                              onClick={() => toggleCardExpand(m.id)}
                              className="absolute top-2 right-2 bg-slate-950/70 text-slate-300 hover:text-white border border-slate-700 rounded-full w-6 h-6 flex items-center justify-center text-xs"
                            >
                              ✕
                            </button>

                            <div className="text-center mb-2">
                              <span className="text-[9px] font-bold text-slate-300 bg-slate-950/70 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                                {m.week_num}. HAFTA • {m.match_index}. MAÇ • {m.match_date} {m.match_time}
                              </span>
                            </div>

                            <div className="text-center mb-3">
                              <span className={`inline-block px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                                {m.category}
                              </span>
                            </div>

                            <div className="flex items-center justify-between px-2 py-2">
                              <div className="flex-1 flex flex-col items-center gap-2">
                                <img src={theme.homeLogo} alt={homeUpper} className="w-14 h-14 sm:w-20 sm:h-20 object-contain drop-shadow-lg" />
                                <span className="text-[10px] sm:text-xs font-black text-white text-center uppercase">{homeUpper}</span>
                              </div>

                              <div className="mx-2 px-4 py-2 rounded-xl bg-[#080d1a]/90 border border-slate-700 text-center">
                                <span className="text-xl sm:text-2xl font-black text-white tracking-widest">
                                  {isFin ? `${m.home_score} : ${m.away_score}` : isPostponed ? 'ERT' : '- : -'}
                                </span>
                              </div>

                              <div className="flex-1 flex flex-col items-center gap-2">
                                <img src={theme.awayLogo} alt={awayUpper} className="w-14 h-14 sm:w-20 sm:h-20 object-contain drop-shadow-lg" />
                                <span className="text-[10px] sm:text-xs font-black text-white text-center uppercase">{awayUpper}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className={`${theme.bottomBar} border-t px-3 py-1.5 relative z-10 flex items-center justify-between text-[9.5px] sm:text-[10px]`}>
                          <div>
                            {!isFin ? (
                              <span className="text-slate-400 italic">{isPostponed ? 'Ertelendi' : 'Sonuç bekleniyor'}</span>
                            ) : winnerNames.length > 0 ? (
                              <span className="text-emerald-300 font-bold">
                                🎯 {winnerNames.length} bilen (+{m.points_awarded} P)
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Skoru bilen çıkmadı</span>
                            )}
                          </div>

                          <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${theme.tagText} ${theme.tagBg} ${theme.tagBorder}`}>
                            {isTff ? 'TFF' : 'DFO'}
                          </span>

                          {isFin && winnerNames.length > 0 && (
                            <button onClick={() => toggleWinners(m.id)} className="text-sky-400 hover:text-sky-300 font-bold">
                              {isWinnersOpen ? 'Gizle ▲' : 'Bilenler ▼'}
                            </button>
                          )}
                        </div>

                        {isFin && winnerNames.length > 0 && isWinnersOpen && (
                          <div className="bg-slate-950/90 border-t border-slate-800/80 px-2.5 py-2 relative z-10 flex flex-wrap gap-1">
                            {winnerNames.map((wName, i) => (
                              <span key={i} className="bg-slate-900 border border-slate-700/80 text-slate-200 text-[9px] font-bold px-2 py-0.5 rounded">
                                {wName}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ======================================================================= */}
            {/* SEKME 2: SEÇİLEN HAFTANIN TEKİL ÖZETİ (İNCE DONDURULMUŞ CETVEL)         */}
            {/* ======================================================================= */}
            {activeTab === 'WEEK_CHECK' && (
              <div className="max-w-4xl mx-auto bg-gradient-to-b from-[#0a1838] via-[#071126] to-[#050b18] border border-blue-500/30 rounded-xl shadow-2xl">
                <div className="sticky top-16 sm:top-20 z-30 bg-[#071126]/95 backdrop-blur-md rounded-t-xl border-b border-blue-500/40 px-2 pt-2 sm:px-5 sm:pt-3 shadow-[0_8px_20px_rgba(0,0,0,0.65)]">
                  <div className="flex items-center justify-between pb-1.5 border-b border-blue-800/50">
                    <h2 className="text-[11px] sm:text-sm font-black text-emerald-400 uppercase tracking-wider">
                      {selectedWeek}. HAFTA TEKİL PUAN ÖZETİ
                    </h2>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-300">
                      Puan Alan: <strong className="text-white">{weeklyCheckTable.length}</strong>
                    </span>
                  </div>

                  <table className="w-full table-fixed text-left tabular-nums">
                    <colgroup>
                      <col className="w-[24px] sm:w-10" />
                      <col />
                      <col className="w-[34px] sm:w-16" />
                      <col className="w-[34px] sm:w-16" />
                      <col className="w-[34px] sm:w-16" />
                      <col className="w-[34px] sm:w-16" />
                      <col className="w-[42px] sm:w-20" />
                    </colgroup>
                    <thead>
                      <tr className="text-slate-200 text-[9px] sm:text-[11px] uppercase tracking-tight">
                        <th className="py-1.5 px-0.5">#</th>
                        <th className="py-1.5 px-1 text-white">Yarışmacı</th>
                        <th className="py-1.5 px-0.5 text-center text-sky-400">DFO</th>
                        <th className="py-1.5 px-0.5 text-center text-rose-500">TFF</th>
                        <th className="py-1.5 px-0.5 text-center text-emerald-400">Bns</th>
                        <th className="py-1.5 px-0.5 text-center text-orange-400">Skor</th>
                        <th className="py-1.5 px-1 text-right text-sky-200">Toplam</th>
                      </tr>
                    </thead>
                  </table>
                </div>

                <div className="px-2 pb-3 sm:px-5 sm:pb-5">
                  {weeklyCheckTable.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-bold">
                      Bu haftada henüz kesinleşmiş puan bulunmuyor.
                    </div>
                  ) : (
                    <table className="w-full table-fixed text-left tabular-nums">
                      <colgroup>
                        <col className="w-[24px] sm:w-10" />
                        <col />
                        <col className="w-[34px] sm:w-16" />
                        <col className="w-[34px] sm:w-16" />
                        <col className="w-[34px] sm:w-16" />
                        <col className="w-[34px] sm:w-16" />
                        <col className="w-[42px] sm:w-20" />
                      </colgroup>
                      <tbody className="divide-y divide-blue-900/35">
                        {weeklyCheckTable.map((row, idx) => (
                          <tr key={row.id} className="hover:bg-blue-900/25">
                            <td className="py-1.5 px-0.5 font-black text-slate-400 text-[10.5px] sm:text-xs">{idx + 1}</td>
                            <td className="py-1.5 px-1 font-black text-white text-[11px] sm:text-sm truncate">{row.name}</td>
                            <td className="py-1.5 px-0.5 text-center text-sky-400 font-bold text-[11px] sm:text-xs">{row.dfo}</td>
                            <td className="py-1.5 px-0.5 text-center text-rose-500 font-bold text-[11px] sm:text-xs">{row.tff}</td>
                            <td className="py-1.5 px-0.5 text-center text-emerald-400 font-bold text-[11px] sm:text-xs">
                              {row.bonus > 0 ? `+${row.bonus}` : '0'}
                            </td>
                            <td className="py-1.5 px-0.5 text-center text-orange-400 font-black text-[11px] sm:text-xs">{row.scores}</td>
                            <td className="py-1.5 px-1 text-right text-sky-200 font-black text-xs sm:text-sm bg-sky-500/10">
                              {row.totalWithBonus}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* ======================================================================= */}
            {/* SEKME 3 & 4: GENEL PUAN DURUMU VE SEÇİLEN HAFTANIN KÜMÜLATİF GENELİ     */}
            {/* ======================================================================= */}
            {(activeTab === 'TOTAL_STANDINGS' || activeTab === 'WEEK_CUMULATIVE') && (
              <div className="max-w-5xl mx-auto bg-gradient-to-b from-[#0a1838] via-[#071126] to-[#050b18] border border-slate-800 rounded-xl shadow-xl">
                
                {/* DONDURULMUŞ ÜST PENCERE */}
                <div className="sticky top-16 sm:top-20 z-30 bg-[#071126]/95 backdrop-blur-md rounded-t-xl border-b border-slate-700/80 px-1.5 pt-1.5 sm:px-5 sm:pt-3 shadow-md">
                  
                  {/* Başlık + Sekme Cetveli */}
                  <div className="flex flex-wrap items-center justify-between gap-1 pb-1.5 border-b border-slate-800">
                    <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase px-1 text-sky-200">
                      {activeTab === 'WEEK_CUMULATIVE'
                        ? `${selectedWeek}. HAFTA GENEL PUAN DURUMU`
                        : 'GENEL PUAN DURUMU'}
                    </span>

                    {/* Sıralama: CANLI -> MASTER -> DFO -> TFF -> SKOR -> BONUS */}
                    <div className="flex flex-wrap items-center gap-1">
                      {(activeTab === 'WEEK_CUMULATIVE'
                        ? (['MASTER', 'DFO', 'TFF', 'SKOR', 'BONUS'] as const)
                        : (['CANLI', 'MASTER', 'DFO', 'TFF', 'SKOR', 'BONUS'] as const)
                      ).map((tab) => {
                        const isTabActive = standingsFilter === tab;
                        const isLiveGreen = tab === 'CANLI' && activeLiveMatchCount > 0;

                        let btnCls = 'bg-[#040917] text-slate-300 border-slate-800 hover:border-slate-600 hover:text-white';
                        if (isTabActive) {
                          if (tab === 'TFF') btnCls = 'bg-rose-700 text-white border-rose-400/80';
                          else if (tab === 'DFO') btnCls = 'bg-blue-700 text-white border-sky-400/80';
                          else if (tab === 'BONUS') btnCls = 'bg-emerald-700 text-white border-emerald-400/80';
                          else if (tab === 'SKOR') btnCls = 'bg-orange-600 text-white border-orange-300/80';
                          else if (tab === 'CANLI' && isLiveGreen) btnCls = 'bg-emerald-700 text-white border-emerald-400/80';
                          else btnCls = 'bg-sky-700 text-white border-sky-300/80';
                        } else if (tab === 'CANLI' && isLiveGreen) {
                          btnCls = 'bg-emerald-950/80 text-emerald-300 border-emerald-700';
                        } else if (tab === 'TFF') {
                          btnCls = 'bg-[#040917] text-rose-400 border-slate-800 hover:border-rose-700';
                        } else if (tab === 'DFO') {
                          btnCls = 'bg-[#040917] text-sky-400 border-slate-800 hover:border-sky-700';
                        } else if (tab === 'BONUS') {
                          btnCls = 'bg-[#040917] text-emerald-400 border-slate-800 hover:border-emerald-700';
                        } else if (tab === 'SKOR') {
                          btnCls = 'bg-[#040917] text-orange-400 border-slate-800 hover:border-orange-700';
                        }

                        return (
                          <button
                            key={tab}
                            onClick={() => {
                              setStandingsFilter(tab);
                              if (tab === 'MASTER') setMasterSubFilter('DUZ');
                              if (tab === 'SKOR') setSkorSubFilter('DUZ');
                            }}
                            className={`px-2 sm:px-3 py-1 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider border transition-colors ${btnCls}`}
                          >
                            {tab === 'CANLI' && activeLiveMatchCount > 0 ? `CANLI (${activeLiveMatchCount})` : tab}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* MASTER Alt Satırı: MASTER PUAN | DETAYLI MASTER */}
                  {standingsFilter === 'MASTER' && (
                    <div className="flex items-center justify-center gap-1.5 py-1 border-b border-slate-800">
                      <button
                        onClick={() => setMasterSubFilter('DUZ')}
                        className={`px-2.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider border transition-colors ${
                          masterSubFilter === 'DUZ'
                            ? 'bg-sky-900/50 text-sky-200 border-sky-400/70'
                            : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        MASTER PUAN
                      </button>
                      <button
                        onClick={() => setMasterSubFilter('DETAYLI')}
                        className={`px-2.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider border transition-colors ${
                          masterSubFilter === 'DETAYLI'
                            ? 'bg-sky-900/50 text-white border-sky-300/70'
                            : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        DETAYLI MASTER
                      </button>
                    </div>
                  )}

                  {/* SKOR Alt Satırı: MASTER SKOR | DETAYLI | DFO SKOR | TFF SKOR */}
                  {standingsFilter === 'SKOR' && (
                    <div className="flex items-center justify-center gap-1 py-1 border-b border-slate-800">
                      {([
                        { key: 'DUZ', label: 'MASTER SKOR', cls: 'bg-orange-950/60 text-orange-300 border-orange-400/70' },
                        { key: 'DETAYLI', label: 'DETAYLI', cls: 'bg-orange-950/60 text-white border-orange-300/70' },
                        { key: 'DFO', label: 'DFO SKOR', cls: 'bg-blue-950/60 text-sky-300 border-sky-400/70' },
                        { key: 'TFF', label: 'TFF SKOR', cls: 'bg-rose-950/60 text-rose-300 border-rose-400/70' }
                      ] as const).map((st) => (
                        <button
                          key={st.key}
                          onClick={() => setSkorSubFilter(st.key)}
                          className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider border transition-colors ${
                            skorSubFilter === st.key ? st.cls : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Canlı Bilgi Satırı */}
                  {standingsFilter === 'CANLI' && (
                    <div className="py-1 border-b border-slate-800 text-center text-[9.5px] sm:text-[11px]">
                      {activeLiveMatchCount > 0 ? (
                        <span className="text-emerald-400 font-black">
                          🔴 {activeLiveMatchCount} maç canlı oynanıyor — anlık puanlar (+Canlı) dahildir.
                        </span>
                      ) : (
                        <span className="text-slate-300 font-bold">
                          Şu an canlı maç yok; kesinleşmiş resmi puanlar gösteriliyor.
                        </span>
                      )}
                    </div>
                  )}

                  {/* DONDURULMUŞ SÜTUN BAŞLIKLARI */}
                  {standingsFilter === 'MASTER' && masterSubFilter === 'DUZ' ? (
                    <table className="w-full table-fixed text-left tabular-nums">
                      <colgroup>
                        <col className="w-10 sm:w-14" />
                        <col />
                        <col className="w-24 sm:w-36" />
                      </colgroup>
                      <thead>
                        <tr className="text-sky-200 text-[9.5px] sm:text-xs uppercase tracking-wider">
                          <th className="py-1.5 px-1.5">#</th>
                          <th className="py-1.5 px-1.5 text-white">Yarışmacı</th>
                          <th className="py-1.5 px-2 text-right text-sky-300">Master Puanı</th>
                        </tr>
                      </thead>
                    </table>
                  ) : standingsFilter === 'MASTER' && masterSubFilter === 'DETAYLI' ? (
                    <table className="w-full table-fixed text-left tabular-nums">
                      <colgroup>
                        <col className="w-[26px] sm:w-11" />
                        <col />
                        <col className="w-[34px] sm:w-16" />
                        <col className="w-[34px] sm:w-16" />
                        <col className="w-[34px] sm:w-18" />
                        <col className="w-[34px] sm:w-20" />
                        <col className="w-[44px] sm:w-24" />
                      </colgroup>
                      <thead>
                        <tr className="text-slate-200 text-[9px] sm:text-xs uppercase tracking-tight">
                          <th className="py-1.5 px-0.5">#</th>
                          <th className="py-1.5 px-1 text-white">Yarışmacı</th>
                          <th className="py-1.5 px-0.5 text-center text-sky-400">DFO</th>
                          <th className="py-1.5 px-0.5 text-center text-rose-500">TFF</th>
                          <th className="py-1.5 px-0.5 text-center text-emerald-400">Bns</th>
                          <th className="py-1.5 px-0.5 text-center text-orange-400">Skor</th>
                          <th className="py-1.5 px-1 text-center text-sky-200 bg-sky-500/15 rounded-t">Master</th>
                        </tr>
                      </thead>
                    </table>
                  ) : standingsFilter === 'CANLI' ? (
                    <table className="w-full table-fixed text-left tabular-nums">
                      <colgroup>
                        <col className="w-[28px] sm:w-12" />
                        <col />
                        <col className="w-[38px] sm:w-20" />
                        <col className="w-[42px] sm:w-20" />
                        <col className="w-[36px] sm:w-20" />
                        <col className="w-[46px] sm:w-24" />
                      </colgroup>
                      <thead>
                        <tr className="text-slate-200 text-[9px] sm:text-xs uppercase tracking-tight">
                          <th className="py-1.5 px-0.5">#</th>
                          <th className="py-1.5 px-1 text-white">Yarışmacı</th>
                          <th className="py-1.5 px-0.5 text-center text-slate-300">Kesin</th>
                          <th className="py-1.5 px-0.5 text-center text-emerald-400">+Canlı</th>
                          <th className="py-1.5 px-0.5 text-center text-orange-400">Skor</th>
                          <th className="py-1.5 px-1 text-center text-sky-200 bg-sky-500/15 rounded-t">Toplam</th>
                        </tr>
                      </thead>
                    </table>
                  ) : standingsFilter === 'SKOR' && skorSubFilter === 'DETAYLI' ? (
                    <table className="w-full table-fixed text-left tabular-nums">
                      <colgroup>
                        <col className="w-[28px] sm:w-12" />
                        <col />
                        <col className="w-[44px] sm:w-24" />
                        <col className="w-[44px] sm:w-24" />
                        <col className="w-[52px] sm:w-28" />
                      </colgroup>
                      <thead>
                        <tr className="text-slate-200 text-[9px] sm:text-xs uppercase tracking-tight">
                          <th className="py-1.5 px-1">#</th>
                          <th className="py-1.5 px-1 text-white">Yarışmacı</th>
                          <th className="py-1.5 px-1 text-center text-sky-400">DFO</th>
                          <th className="py-1.5 px-1 text-center text-rose-500">TFF</th>
                          <th className="py-1.5 px-1 text-center text-orange-400 bg-orange-500/15 rounded-t">Master</th>
                        </tr>
                      </thead>
                    </table>
                  ) : (
                    <table className="w-full table-fixed text-left tabular-nums">
                      <colgroup>
                        <col className="w-10 sm:w-14" />
                        <col />
                        <col className="w-24 sm:w-36" />
                      </colgroup>
                      <thead>
                        <tr className="text-slate-200 text-[9.5px] sm:text-xs uppercase tracking-wider">
                          <th className="py-1.5 px-1.5">#</th>
                          <th className="py-1.5 px-1.5 text-white">Yarışmacı</th>
                          <th className="py-1.5 px-2 text-right">
                            {standingsFilter === 'DFO' && <span className="text-sky-400">DFO Puanı</span>}
                            {standingsFilter === 'TFF' && <span className="text-rose-500">TFF Puanı</span>}
                            {standingsFilter === 'SKOR' && skorSubFilter === 'DUZ' && <span className="text-orange-400">Master Skor</span>}
                            {standingsFilter === 'SKOR' && skorSubFilter === 'DFO' && <span className="text-sky-400">DFO Skor</span>}
                            {standingsFilter === 'SKOR' && skorSubFilter === 'TFF' && <span className="text-rose-500">TFF Skor</span>}
                            {standingsFilter === 'BONUS' && <span className="text-emerald-400">Bonus Puanı</span>}
                          </th>
                        </tr>
                      </thead>
                    </table>
                  )}
                </div>

                {/* AKAN LİSTE GÖVDESİ */}
                <div className="px-1.5 pb-3 sm:px-5 sm:pb-5">
                  {standingsFilter === 'MASTER' && masterSubFilter === 'DUZ' ? (
                    <table className="w-full table-fixed text-left tabular-nums">
                      <colgroup>
                        <col className="w-10 sm:w-14" />
                        <col />
                        <col className="w-24 sm:w-36" />
                      </colgroup>
                      <tbody className="divide-y divide-slate-800/70">
                        {cumulativeStandings.map((row, idx) => {
                          const currentRank = idx + 1;
                          const prevRank = prevWeekRankMap[row.id];
                          const diff = activeTab === 'WEEK_CUMULATIVE' && prevRank ? prevRank - currentRank : 0;
                          return (
                            <tr key={row.id} className="hover:bg-blue-900/20">
                              <td className="py-1.5 px-1.5 font-black text-slate-400 text-[11px] sm:text-sm">
                                <span>{currentRank}</span>
                                {diff > 0 && <span className="ml-0.5 text-[8px] text-emerald-400">▲</span>}
                                {diff < 0 && <span className="ml-0.5 text-[8px] text-rose-400">▼</span>}
                              </td>
                              <td className="py-1.5 px-1.5 font-black text-white text-xs sm:text-sm truncate">{row.name}</td>
                              <td className="py-1.5 px-2 text-right font-black text-xs sm:text-base text-sky-300">{row.master}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : standingsFilter === 'MASTER' && masterSubFilter === 'DETAYLI' ? (
                    <table className="w-full table-fixed text-left tabular-nums">
                      <colgroup>
                        <col className="w-[26px] sm:w-11" />
                        <col />
                        <col className="w-[34px] sm:w-16" />
                        <col className="w-[34px] sm:w-16" />
                        <col className="w-[34px] sm:w-18" />
                        <col className="w-[34px] sm:w-20" />
                        <col className="w-[44px] sm:w-24" />
                      </colgroup>
                      <tbody className="divide-y divide-slate-800/70">
                        {cumulativeStandings.map((row, idx) => {
                          const currentRank = idx + 1;
                          const prevRank = prevWeekRankMap[row.id];
                          const diff = activeTab === 'WEEK_CUMULATIVE' && prevRank ? prevRank - currentRank : 0;
                          return (
                            <tr key={row.id} className="hover:bg-blue-900/20">
                              <td className="py-1.5 px-0.5 font-black text-slate-400 text-[10.5px] sm:text-sm">
                                <span>{currentRank}</span>
                                {diff > 0 && <span className="ml-0.5 text-[8px] text-emerald-400">▲</span>}
                                {diff < 0 && <span className="ml-0.5 text-[8px] text-rose-400">▼</span>}
                              </td>
                              <td className="py-1.5 px-1 font-black text-white text-[11px] sm:text-sm truncate" title={row.name}>
                                {row.name}
                              </td>
                              <td className="py-1.5 px-0.5 text-center text-sky-400 font-bold text-[11px] sm:text-sm">{row.dfo}</td>
                              <td className="py-1.5 px-0.5 text-center text-rose-500 font-bold text-[11px] sm:text-sm">{row.tff}</td>
                              <td className="py-1.5 px-0.5 text-center text-emerald-400 font-bold text-[11px] sm:text-sm">
                                {row.bonus > 0 ? `+${row.bonus}` : '0'}
                              </td>
                              <td className="py-1.5 px-0.5 text-center text-orange-400 font-black text-[11px] sm:text-sm">{row.scores}</td>
                              <td className="py-1.5 px-1 text-center text-sky-200 font-black text-xs sm:text-base bg-sky-500/10">
                                {row.master}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : standingsFilter === 'CANLI' ? (
                    <table className="w-full table-fixed text-left tabular-nums">
                      <colgroup>
                        <col className="w-[28px] sm:w-12" />
                        <col />
                        <col className="w-[38px] sm:w-20" />
                        <col className="w-[42px] sm:w-20" />
                        <col className="w-[36px] sm:w-20" />
                        <col className="w-[46px] sm:w-24" />
                      </colgroup>
                      <tbody className="divide-y divide-slate-800/70">
                        {effectiveLiveStandings.map((row) => {
                          const diff = row.kesin_sira - row.canli_sira;
                          return (
                            <tr
                              key={row.user_id}
                              className={row.canli_ek_puan > 0 ? 'bg-emerald-950/25 hover:bg-emerald-950/40' : 'hover:bg-blue-900/20'}
                            >
                              <td className="py-1.5 px-0.5 font-black text-slate-400 text-[10px] sm:text-sm">
                                <span>{row.canli_sira}</span>
                                {diff > 0 && <span className="ml-0.5 text-[8px] text-emerald-400">▲</span>}
                                {diff < 0 && <span className="ml-0.5 text-[8px] text-rose-400">▼</span>}
                              </td>
                              <td className="py-1.5 px-1 font-black text-white text-[11px] sm:text-sm truncate" title={row.oyuncu_adi}>
                                {row.oyuncu_adi}
                              </td>
                              <td className="py-1.5 px-0.5 text-center text-slate-300 font-bold text-[11px] sm:text-sm">
                                {row.kesin_master}
                              </td>
                              <td className="py-1.5 px-0.5 text-center font-black text-[11px] sm:text-sm">
                                {row.canli_ek_puan > 0 ? (
                                  <span className="text-emerald-400">+{row.canli_ek_puan}</span>
                                ) : (
                                  <span className="text-slate-600">0</span>
                                )}
                              </td>
                              <td className="py-1.5 px-0.5 text-center text-orange-400 font-bold text-[11px] sm:text-sm">
                                {row.canli_skor_toplam}
                              </td>
                              <td className="py-1.5 px-1 text-center text-sky-200 font-black text-xs sm:text-base bg-sky-500/10">
                                {row.canli_master_toplam}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : standingsFilter === 'SKOR' && skorSubFilter === 'DETAYLI' ? (
                    <table className="w-full table-fixed text-left tabular-nums">
                      <colgroup>
                        <col className="w-[28px] sm:w-12" />
                        <col />
                        <col className="w-[44px] sm:w-24" />
                        <col className="w-[44px] sm:w-24" />
                        <col className="w-[52px] sm:w-28" />
                      </colgroup>
                      <tbody className="divide-y divide-slate-800/70">
                        {cumulativeStandings.map((row, idx) => (
                          <tr key={row.id} className="hover:bg-blue-900/20">
                            <td className="py-1.5 px-1 font-black text-slate-400 text-[11px] sm:text-sm">{idx + 1}</td>
                            <td className="py-1.5 px-1 font-black text-white text-[11px] sm:text-sm truncate">{row.name}</td>
                            <td className="py-1.5 px-1 text-center text-sky-400 font-bold text-[11px] sm:text-sm">{row.dfoScores}</td>
                            <td className="py-1.5 px-1 text-center text-rose-500 font-bold text-[11px] sm:text-sm">{row.tffScores}</td>
                            <td className="py-1.5 px-1 text-center text-orange-400 font-black text-xs sm:text-base bg-orange-500/10">{row.scores}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full table-fixed text-left tabular-nums">
                      <colgroup>
                        <col className="w-10 sm:w-14" />
                        <col />
                        <col className="w-24 sm:w-36" />
                      </colgroup>
                      <tbody className="divide-y divide-slate-800/70">
                        {cumulativeStandings.map((row, idx) => (
                          <tr key={row.id} className="hover:bg-blue-900/20">
                            <td className="py-1.5 px-1.5 font-black text-slate-400 text-[11px] sm:text-sm">{idx + 1}</td>
                            <td className="py-1.5 px-1.5 font-black text-white text-xs sm:text-sm truncate">{row.name}</td>
                            <td className="py-1.5 px-2 text-right font-black text-xs sm:text-base">
                              {standingsFilter === 'DFO' && <span className="text-sky-400">{row.dfo}</span>}
                              {standingsFilter === 'TFF' && <span className="text-rose-500">{row.tff}</span>}
                              {standingsFilter === 'SKOR' && skorSubFilter === 'DUZ' && <span className="text-orange-400">{row.scores}</span>}
                              {standingsFilter === 'SKOR' && skorSubFilter === 'DFO' && <span className="text-sky-400">{row.dfoScores}</span>}
                              {standingsFilter === 'SKOR' && skorSubFilter === 'TFF' && <span className="text-rose-500">{row.tffScores}</span>}
                              {standingsFilter === 'BONUS' && <span className="text-emerald-400">+{row.bonus}</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* ======================================================================= */}
            {/* SEKME 5: LİDERLER TABLOSU (DETAYLI MASTER İLE BİREBİR AYNI SÜTUN ORANI) */}
            {/* ======================================================================= */}
            {activeTab === 'LEADERS_TIMELINE' && (
              <div className="max-w-5xl mx-auto bg-gradient-to-b from-[#0a1838] via-[#071126] to-[#050b18] border border-slate-800 rounded-xl shadow-xl">
                
                {/* DONDURULMUŞ BAŞLIK */}
                <div className="sticky top-16 sm:top-20 z-30 bg-[#071126]/95 backdrop-blur-md rounded-t-xl border-b border-slate-700/80 px-1.5 pt-1.5 sm:px-5 sm:pt-3 shadow-md">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 px-1">
                    <h2 className="text-[10px] sm:text-xs font-black text-sky-200 uppercase tracking-wider">
                      LİDERLER TABLOSU
                    </h2>
                    <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">
                      Satıra tıklayarak o haftanın genel puan durumunu açabilirsin
                    </span>
                  </div>

                  <table className="w-full table-fixed text-left tabular-nums">
                    <colgroup>
                      <col className="w-[34px] sm:w-14" />
                      <col />
                      <col className="w-[34px] sm:w-16" />
                      <col className="w-[34px] sm:w-16" />
                      <col className="w-[34px] sm:w-18" />
                      <col className="w-[34px] sm:w-20" />
                      <col className="w-[44px] sm:w-24" />
                    </colgroup>
                    <thead>
                      <tr className="text-slate-200 text-[9px] sm:text-xs uppercase tracking-tight">
                        <th className="py-1.5 px-0.5 text-center">Hafta</th>
                        <th className="py-1.5 px-1 text-white">Lider</th>
                        <th className="py-1.5 px-0.5 text-center text-sky-400">DFO</th>
                        <th className="py-1.5 px-0.5 text-center text-rose-500">TFF</th>
                        <th className="py-1.5 px-0.5 text-center text-emerald-400">Bns</th>
                        <th className="py-1.5 px-0.5 text-center text-orange-400">Skor</th>
                        <th className="py-1.5 px-1 text-center text-sky-200 bg-sky-500/15 rounded-t">Master</th>
                      </tr>
                    </thead>
                  </table>
                </div>

                {/* AKAN LİDERLER LİSTESİ (1, 2, 3... DİYE İNER; DFO, TFF, BONUS, SKOR, MASTER YAZAR) */}
                <div className="px-1.5 pb-3 sm:px-5 sm:pb-5">
                  <table className="w-full table-fixed text-left tabular-nums">
                    <colgroup>
                      <col className="w-[34px] sm:w-14" />
                      <col />
                      <col className="w-[34px] sm:w-16" />
                      <col className="w-[34px] sm:w-16" />
                      <col className="w-[34px] sm:w-18" />
                      <col className="w-[34px] sm:w-20" />
                      <col className="w-[44px] sm:w-24" />
                    </colgroup>
                    <tbody className="divide-y divide-slate-800/70">
                      {cumulativeLeadersHistory.map((item) => (
                        <tr
                          key={item.week}
                          onClick={() => {
                            setSelectedWeek(item.week);
                            setActiveTab('WEEK_CUMULATIVE');
                          }}
                          className="cursor-pointer hover:bg-blue-900/25 transition-colors"
                          title={`${item.week}. Hafta genel puan durumunu aç`}
                        >
                          <td className="py-1.5 px-0.5 text-center font-black text-slate-400 text-[10.5px] sm:text-sm">
                            {item.week}
                          </td>
                          <td className="py-1.5 px-1 font-black text-white text-[11px] sm:text-sm truncate" title={item.leaderName}>
                            {item.leaderName}
                          </td>
                          <td className="py-1.5 px-0.5 text-center text-sky-400 font-bold text-[11px] sm:text-sm">
                            {item.leaderDfo}
                          </td>
                          <td className="py-1.5 px-0.5 text-center text-rose-500 font-bold text-[11px] sm:text-sm">
                            {item.leaderTff}
                          </td>
                          <td className="py-1.5 px-0.5 text-center text-emerald-400 font-bold text-[11px] sm:text-sm">
                            {item.leaderBonus > 0 ? `+${item.leaderBonus}` : '0'}
                          </td>
                          <td className="py-1.5 px-0.5 text-center text-orange-400 font-black text-[11px] sm:text-sm">
                            {item.leaderScores}
                          </td>
                          <td className="py-1.5 px-1 text-center text-sky-200 font-black text-xs sm:text-base bg-sky-500/10">
                            {item.leaderMaster}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}