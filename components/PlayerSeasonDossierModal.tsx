'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { getClubLogoUrl, isNationalTeamName } from '@/components/FavoriteTeamSelector';
import { isStrictTffMatch } from '@/utils/tffDetector';
import { getMatchTimeMs } from '@/utils/themeEngine';

const EXCLUDED_IDS = new Set(['mankoman']);

export interface DossierMatchItem {
  id?: number | string;
  week_num: number;
  match_index: number;
  category?: string | null;
  pool_type?: 'DFO' | 'TFF' | string | null;
  match_date?: string | null;
  match_time?: string | null;
  home_team: string;
  away_team: string;
  home_score?: string | number | null;
  away_score?: string | number | null;
  status?: string | null;
  winner_ids?: string[] | null;
  points_awarded?: number | null;
}

export interface DossierWeekBonusItem {
  week_num: number;
  is_completed?: boolean | null;
  bonus_enabled?: boolean | null;
  puan_lideri_ids?: string[] | null;
  puan_bonus?: number | null;
  skor_krali_ids?: string[] | null;
  skor_bonus?: number | null;
}

export type DossierMatchRow = DossierMatchItem;
export type DossierWeekBonusRow = DossierWeekBonusItem;

export interface PlayerDirectoryEntry {
  name: string;
  isChampion?: boolean;
  favoriteTeam?: string;
}

export interface PlayerSeasonDossierModalProps {
  playerId: string | null;
  onClose: () => void;
  playersDirectory: Record<string, PlayerDirectoryEntry>;
  matches: DossierMatchItem[];
  weeksBonus: DossierWeekBonusItem[];
  seasonLabel?: string;
}

interface PlayedMatchDetail {
  weekNum: number;
  matchIndex: number;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  matchTime: string;
  predictedScore: string;
  actualScore: string;
  isExactHit: boolean;
  pointsEarned: number;
  isTff: boolean;
  sortKey: number;
}

const stripTrophies = (s: string) =>
  (s || '')
    .replace(/(🏆|🇹🇷)+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const calcFallbackPts = (winnerCount: number) => {
  if (winnerCount === 1) return 12;
  if (winnerCount === 2) return 6;
  if (winnerCount === 3) return 5;
  if (winnerCount === 4) return 4;
  if (winnerCount === 5) return 3;
  if (winnerCount === 6) return 2;
  if (winnerCount >= 7) return 1;
  return 0;
};

export default function PlayerSeasonDossierModal({
  playerId,
  onClose,
  playersDirectory,
  matches,
  weeksBonus,
  seasonLabel = '2026-2027 SEZONU'
}: PlayerSeasonDossierModalProps) {
  const [activityLoading, setActivityLoading] = useState(false);
  const [rawUserPreds, setRawUserPreds] = useState<
    Array<{ week_num: number; match_index: number; predicted_score: string }>
  >([]);
  const [recentBulletinRows, setRecentBulletinRows] = useState<
    Array<{
      week_num: number;
      match_index: number;
    }>
  >([]);
  const [activeTabView, setActiveTabView] = useState<'ACTIVITY' | 'HITS'>('ACTIVITY');

  useEffect(() => {
    if (!playerId) {
      setRawUserPreds([]);
      return;
    }

    let cancelled = false;
    setActivityLoading(true);
    setActiveTabView('ACTIVITY');

    const loadPlayerActivity = async () => {
      try {
        let allPreds: Array<{ week_num: number; match_index: number; predicted_score: string }> = [];
        let from = 0;
        const step = 1000;
        let more = true;

        while (more) {
          const { data, error } = await supabase
            .from('player_predictions')
            .select('week_num, match_index, predicted_score')
            .eq('user_id', String(playerId).trim())
            .order('week_num', { ascending: false })
            .order('match_index', { ascending: false })
            .range(from, from + step - 1);

          if (error || !data || data.length === 0) {
            more = false;
          } else {
            allPreds = [...allPreds, ...(data as any[])];
            if (data.length < step) more = false;
            else from += step;
          }
        }

        const { data: bulData } = await supabase
          .from('matches_bulletin')
          .select('week_num, match_index')
          .gte('week_num', 41)
          .limit(500);

        if (!cancelled) {
          setRawUserPreds(allPreds);
          setRecentBulletinRows((bulData || []) as any[]);
        }
      } finally {
        if (!cancelled) setActivityLoading(false);
      }
    };

    loadPlayerActivity();
    return () => {
      cancelled = true;
    };
  }, [playerId]);

  const dossier = useMemo(() => {
    if (!playerId) return null;
    const targetId = String(playerId).trim();
    const playerInfo = playersDirectory[targetId];
    const cleanName = stripTrophies(playerInfo?.name || targetId);
    const favTeam =
      playerInfo?.favoriteTeam && !isNationalTeamName(playerInfo.favoriteTeam)
        ? playerInfo.favoriteTeam
        : '';
    const clubLogo = getClubLogoUrl(favTeam);

    const allPlayerIds = Array.from(
      new Set([
        ...Object.keys(playersDirectory).filter((id) => !EXCLUDED_IDS.has(id)),
        targetId
      ])
    );

    const runningStats: Record<string, { masterPts: number; totalSkor: number; name: string }> = {};
    allPlayerIds.forEach((uid) => {
      runningStats[uid] = {
        masterPts: 0,
        totalSkor: 0,
        name: stripTrophies(playersDirectory[uid]?.name || uid)
      };
    });

    const matchesByWeek: Record<number, DossierMatchItem[]> = {};
    const officialLookup: Record<string, DossierMatchItem> = {};
    matches.forEach((m) => {
      const wn = Number(m.week_num);
      if (!matchesByWeek[wn]) matchesByWeek[wn] = [];
      matchesByWeek[wn].push(m);
      officialLookup[`${wn}-${Number(m.match_index)}`] = m;
    });

    const bonusByWeek: Record<number, DossierWeekBonusItem> = {};
    weeksBonus.forEach((wb) => {
      bonusByWeek[Number(wb.week_num)] = wb;
    });

    const distinctOfficialWeeks = Array.from(
      new Set([
        ...Object.keys(matchesByWeek).map(Number),
        ...Object.keys(bonusByWeek).map(Number)
      ])
    )
      .filter((w) => w > 0)
      .sort((a, b) => a - b);

    let dfoPts = 0;
    let tffPts = 0;
    let bonusPts = 0;
    let dfoSkor = 0;
    let tffSkor = 0;
    const exactHitMatches: PlayedMatchDetail[] = [];

    let bestRank: number | null = null;
    let bestRankWeeks: number[] = [];
    let currentRank = 1;
    let totalRankedPlayers = allPlayerIds.length;
    let latestStartedLeagueWeek =
      distinctOfficialWeeks.length > 0 ? distinctOfficialWeeks[distinctOfficialWeeks.length - 1] : 0;

    distinctOfficialWeeks.forEach((wn) => {
      const wMatches = matchesByWeek[wn] || [];
      let finishedInWeek = 0;

      wMatches.forEach((m) => {
        if (m.status !== 'FINISHED') return;
        finishedInWeek += 1;

        const winners = (m.winner_ids || [])
          .map((id) => String(id).trim())
          .filter((id) => id && !EXCLUDED_IDS.has(id));
        const pts =
          m.points_awarded !== null && m.points_awarded !== undefined
            ? Number(m.points_awarded)
            : calcFallbackPts(winners.length);
        const isTff = isStrictTffMatch(
          m.category || '',
          m.home_team,
          m.away_team,
          m.pool_type || undefined
        );

        winners.forEach((wId) => {
          if (!runningStats[wId]) {
            runningStats[wId] = {
              masterPts: 0,
              totalSkor: 0,
              name: stripTrophies(playersDirectory[wId]?.name || wId)
            };
          }
          runningStats[wId].masterPts += pts;
          runningStats[wId].totalSkor += 1;
        });

        if (winners.includes(targetId)) {
          if (isTff) {
            tffPts += pts;
            tffSkor += 1;
          } else {
            dfoPts += pts;
            dfoSkor += 1;
          }
          const actualSc = `${m.home_score ?? '-'}-${m.away_score ?? '-'}`;
          const mDateStr = String(m.match_date || '');
          const mTimeStr = String(m.match_time || '');
          const kMs = getMatchTimeMs(mDateStr, mTimeStr);
          exactHitMatches.push({
            weekNum: wn,
            matchIndex: Number(m.match_index),
            homeTeam: m.home_team,
            awayTeam: m.away_team,
            matchDate: mDateStr,
            matchTime: mTimeStr,
            predictedScore: actualSc,
            actualScore: actualSc,
            isExactHit: true,
            pointsEarned: pts,
            isTff,
            sortKey: wn * 1000 + Number(m.match_index) + (kMs > 0 ? kMs / 1e13 : 0)
          });
        }
      });

      const wb = bonusByWeek[wn];
      if (wb && wb.bonus_enabled !== false && wb.is_completed) {
        const pB = Number(wb.puan_bonus || 0);
        const sB = Number(wb.skor_bonus || 0);

        if (pB > 0 && Array.isArray(wb.puan_lideri_ids)) {
          wb.puan_lideri_ids.forEach((rawId) => {
            const uid = String(rawId).trim();
            if (!EXCLUDED_IDS.has(uid)) {
              if (!runningStats[uid]) {
                runningStats[uid] = { masterPts: 0, totalSkor: 0, name: uid };
              }
              runningStats[uid].masterPts += pB;
              if (uid === targetId) bonusPts += pB;
            }
          });
        }

        if (sB > 0 && Array.isArray(wb.skor_krali_ids)) {
          wb.skor_krali_ids.forEach((rawId) => {
            const uid = String(rawId).trim();
            if (!EXCLUDED_IDS.has(uid)) {
              if (!runningStats[uid]) {
                runningStats[uid] = { masterPts: 0, totalSkor: 0, name: uid };
              }
              runningStats[uid].masterPts += sB;
              if (uid === targetId) bonusPts += sB;
            }
          });
        }
      }

      if (finishedInWeek > 0) {
        latestStartedLeagueWeek = Math.max(latestStartedLeagueWeek, wn);
        const sortedSnapshot = Object.entries(runningStats).sort(
          ([, a], [, b]) =>
            b.masterPts - a.masterPts ||
            b.totalSkor - a.totalSkor ||
            a.name.localeCompare(b.name, 'tr')
        );
        totalRankedPlayers = sortedSnapshot.length;
        const rIdx = sortedSnapshot.findIndex(([uid]) => uid === targetId);
        if (rIdx !== -1) {
          const rk = rIdx + 1;
          currentRank = rk;
          if (bestRank === null || rk < bestRank) {
            bestRank = rk;
            bestRankWeeks = [wn];
          } else if (rk === bestRank) {
            bestRankWeeks.push(wn);
          }
        }
      }
    });

    const matchCountPerWeek: Record<number, number> = {};
    matches.forEach((m) => {
      const wn = Number(m.week_num);
      const idx = Number(m.match_index);
      matchCountPerWeek[wn] = Math.max(matchCountPerWeek[wn] || 0, idx);
    });
    recentBulletinRows.forEach((b) => {
      const wn = Number(b.week_num);
      const idx = Number(b.match_index);
      matchCountPerWeek[wn] = Math.max(matchCountPerWeek[wn] || 0, idx);
      if (wn > latestStartedLeagueWeek) {
        latestStartedLeagueWeek = wn;
      }
    });

    // Geçerli tahminler (yalnızca bülten doluluk sayacı ve SONUÇLANMIŞ maçlar için kullanılır!)
    const validPredByWeek: Record<number, Array<{ matchIndex: number; score: string }>> = {};
    rawUserPreds.forEach((pr) => {
      const sc = String(pr.predicted_score || '')
        .replace(/\s+/g, '')
        .replace(':', '-');
      if (!sc || sc === 'PAS' || sc === '-' || sc === '---' || sc.includes('--')) return;
      const [hPart, aPart] = sc.split('-');
      if (hPart === undefined || aPart === undefined || hPart === '' || aPart === '') return;

      const wn = Number(pr.week_num);
      const idx = Number(pr.match_index);
      if (!validPredByWeek[wn]) validPredByWeek[wn] = [];
      if (!validPredByWeek[wn].some((x) => x.matchIndex === idx)) {
        validPredByWeek[wn].push({ matchIndex: idx, score: sc });
      }
    });

    const hitWeeksFallback = Array.from(new Set(exactHitMatches.map((hm) => hm.weekNum))).sort(
      (a, b) => b - a
    );
    const predictedWeeksDesc = Object.keys(validPredByWeek)
      .map(Number)
      .filter((w) => validPredByWeek[w].length > 0)
      .sort((a, b) => b - a);

    const lastPlayedWeek: number | null =
      predictedWeeksDesc.length > 0
        ? predictedWeeksDesc[0]
        : hitWeeksFallback.length > 0
        ? hitWeeksFallback[0]
        : null;

    const hasDetailedPredsForLastWeek =
      lastPlayedWeek !== null &&
      Array.isArray(validPredByWeek[lastPlayedWeek]) &&
      validPredByWeek[lastPlayedWeek].length > 0;

    const lastWeekTotalMatches =
      lastPlayedWeek !== null ? matchCountPerWeek[lastPlayedWeek] || 24 : 24;
    const lastWeekFilledCount =
      lastPlayedWeek !== null && hasDetailedPredsForLastWeek
        ? validPredByWeek[lastPlayedWeek].length
        : null;

    const missedWeeksAfterLast =
      lastPlayedWeek !== null && latestStartedLeagueWeek > lastPlayedWeek
        ? latestStartedLeagueWeek - lastPlayedWeek
        : 0;

    // KESİN SPOILER KİLİDİ: YALNIZCA RESMİ OLARAK SONUÇLANMIŞ (FINISHED) MAÇLAR LİSTEYE GİRER!
    // Oynanmamış / devam eden hiçbir maçın tahmini asla okunmaz ve gösterilmez.
    const finishedPlayedTimeline: PlayedMatchDetail[] = [];
    predictedWeeksDesc.forEach((wn) => {
      const entries = [...validPredByWeek[wn]].sort((a, b) => b.matchIndex - a.matchIndex);
      entries.forEach((ent) => {
        const key = `${wn}-${ent.matchIndex}`;
        const offM = officialLookup[key];

        // Maç resmi olarak bitmemişse (Oynanmadı / Ertelendi / Başlamadı) KESİNLİKLE ATLA!
        if (
          !offM ||
          offM.status !== 'FINISHED' ||
          offM.home_score === null ||
          offM.home_score === undefined ||
          offM.away_score === null ||
          offM.away_score === undefined
        ) {
          return;
        }

        const actualSc = `${offM.home_score}-${offM.away_score}`.replace(/\s+/g, '');
        const winners = (offM.winner_ids || []).map((x) => String(x).trim());
        const isHit = Boolean(winners.includes(targetId) || actualSc === ent.score);
        const pts = isHit
          ? offM.points_awarded !== null && offM.points_awarded !== undefined
            ? Number(offM.points_awarded)
            : calcFallbackPts(winners.filter((id) => !EXCLUDED_IDS.has(id)).length)
          : 0;

        const mDate = String(offM.match_date || '');
        const mTime = String(offM.match_time || '');
        const cat = String(offM.category || '');
        const kMs = getMatchTimeMs(mDate, mTime);

        finishedPlayedTimeline.push({
          weekNum: wn,
          matchIndex: ent.matchIndex,
          homeTeam: offM.home_team,
          awayTeam: offM.away_team,
          matchDate: mDate,
          matchTime: mTime,
          predictedScore: ent.score,
          actualScore: actualSc,
          isExactHit: isHit,
          pointsEarned: pts,
          isTff: isStrictTffMatch(cat, offM.home_team, offM.away_team, offM.pool_type || undefined),
          sortKey: wn * 10000000000000 + (kMs > 0 ? kMs : ent.matchIndex * 1000)
        });
      });
    });

    finishedPlayedTimeline.sort((a, b) => b.weekNum - a.weekNum || b.matchIndex - a.matchIndex);

    const effectiveRecentFinished =
      finishedPlayedTimeline.length > 0
        ? finishedPlayedTimeline.slice(0, 5)
        : [...exactHitMatches]
            .sort((a, b) => b.weekNum - a.weekNum || b.matchIndex - a.matchIndex)
            .slice(0, 5);

    const lastFinishedMatch =
      effectiveRecentFinished.length > 0 ? effectiveRecentFinished[0] : null;

    const masterPts = dfoPts + tffPts + bonusPts;
    const totalSkor = dfoSkor + tffSkor;
    const avgPtsPerHit = totalSkor > 0 ? ((dfoPts + tffPts) / totalSkor).toFixed(2) : '0.00';

    const formatBestWeeksText = (wks: number[]) => {
      if (wks.length === 0) return 'Henüz oluşmadı';
      if (wks.length === 1) return `${wks[0]}. Hafta Zirvesi`;
      if (wks.length <= 3) return `${wks.join(', ')}. Haftalar`;
      return `${wks[0]}. Hafta (İlk) • ${wks[wks.length - 1]}. Hafta (Son)`;
    };

    return {
      targetId,
      cleanName,
      favTeam,
      clubLogo,
      currentRank,
      totalRankedPlayers,
      bestRank: bestRank ?? currentRank,
      bestRankWeeksText: formatBestWeeksText(bestRankWeeks),
      masterPts,
      dfoPts,
      tffPts,
      bonusPts,
      totalSkor,
      dfoSkor,
      tffSkor,
      avgPtsPerHit,
      lastPlayedWeek,
      hasDetailedPredsForLastWeek,
      lastWeekFilledCount,
      lastWeekTotalMatches,
      missedWeeksAfterLast,
      latestStartedLeagueWeek,
      lastFinishedMatch,
      recentFiveFinishedMatches: effectiveRecentFinished,
      exactHitsSorted: [...exactHitMatches].sort(
        (a, b) => b.weekNum - a.weekNum || b.matchIndex - a.matchIndex
      )
    };
  }, [playerId, playersDirectory, matches, weeksBonus, rawUserPreds, recentBulletinRows]);

  if (!playerId || !dossier) return null;

  return (
    <div
      className="fixed inset-0 z-[180] bg-black/85 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-gradient-to-b from-[#091733] via-[#061024] to-[#040915] border border-blue-500/45 shadow-[0_24px_70px_rgba(0,0,0,0.92)] overflow-hidden text-white my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ÜST BAŞLIK */}
        <div className="bg-gradient-to-r from-[#0c214a] via-[#091838] to-[#071229] border-b border-slate-700/80 px-4 py-3.5 sm:px-6 sm:py-4 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {dossier.clubLogo && (
                <img
                  src={dossier.clubLogo}
                  alt={dossier.favTeam}
                  className="w-11 h-11 sm:w-14 sm:h-14 object-contain shrink-0 drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)]"
                />
              )}
              <div className="min-w-0">
                <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-sky-400">
                  {seasonLabel} ANALİZİ
                </div>
                <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-white truncate leading-tight">
                  {dossier.cleanName}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10.5px] sm:text-xs font-black">
                  <span className="px-2 py-0.5 rounded-md bg-[#15368a] border border-blue-400/60 text-white">
                    MASTER: {dossier.masterPts} P
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-sky-950/80 border border-sky-500/40 text-sky-300">
                    DFO: {dossier.dfoPts}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-500/40 text-rose-300">
                    TFF: {dossier.tffPts}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                    BONUS: +{dossier.bonusPts}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 shrink-0">
              <div className="rounded-2xl bg-gradient-to-b from-[#173b96] to-[#0e2460] border-2 border-sky-400/75 px-3 py-1.5 sm:px-4 sm:py-2 text-center shadow-[0_0_20px_rgba(37,99,235,0.45)]">
                <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-sky-200 leading-none mb-1">
                  GÜNCEL SIRA
                </div>
                <div className="text-xl sm:text-2xl font-black text-white leading-none tabular-nums">
                  {dossier.currentRank}. <span className="text-xs sm:text-sm text-sky-200">SIRA</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-900/90 hover:bg-rose-700 border border-slate-700 text-slate-200 hover:text-white text-sm font-black flex items-center justify-center cursor-pointer transition-colors"
                title="Kapat"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* İÇERİK GÖVDESİ */}
        <div className="p-3.5 sm:p-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-2xl bg-[#050c1d] border border-amber-400/45 p-3 text-center">
              <div className="text-[9.5px] font-black uppercase tracking-wider text-amber-300">
                EN YÜKSEK SIRA
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5 tabular-nums">
                {dossier.bestRank}. SIRA
              </div>
              <div className="text-[10px] font-extrabold text-amber-300/95 mt-0.5 truncate">
                🏆 {dossier.bestRankWeeksText}
              </div>
            </div>

            <div className="rounded-2xl bg-[#050c1d] border border-blue-400/45 p-3 text-center">
              <div className="text-[9.5px] font-black uppercase tracking-wider text-sky-300">
                MASTER TOPLAM
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5 tabular-nums">
                {dossier.masterPts} P
              </div>
              <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                İsabet Ort: {dossier.avgPtsPerHit} P
              </div>
            </div>

            <div className="rounded-2xl bg-[#050c1d] border border-orange-400/45 p-3 text-center">
              <div className="text-[9.5px] font-black uppercase tracking-wider text-orange-300">
                TAM SKOR İSABETİ
              </div>
              <div className="text-xl sm:text-2xl font-black text-orange-400 mt-0.5 tabular-nums">
                {dossier.totalSkor} MAÇ
              </div>
              <div className="text-[10px] font-bold text-slate-300 mt-0.5">
                DFO {dossier.dfoSkor} • TFF {dossier.tffSkor}
              </div>
            </div>

            <div className="rounded-2xl bg-[#050c1d] border border-emerald-400/45 p-3 text-center">
              <div className="text-[9.5px] font-black uppercase tracking-wider text-emerald-300">
                SON AKTİF BÜLTEN
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5 tabular-nums">
                {dossier.lastPlayedWeek ? `${dossier.lastPlayedWeek}. HAFTA` : 'YOK'}
              </div>
              <div className="text-[10px] font-extrabold text-slate-200 mt-0.5">
                {dossier.lastPlayedWeek
                  ? dossier.lastWeekFilledCount !== null
                    ? `${dossier.lastWeekTotalMatches}'te ${dossier.lastWeekFilledCount} Maç`
                    : 'Arşiv Kaydı'
                  : 'Tahmin Kaydı Yok'}
              </div>
            </div>
          </div>

          {/* SON TAHMİN VE KATILIM DURUMU (SIFIR SPOILER: SADECE ADET VE SON BİTEN MAÇ!) */}
          <div
            className={`rounded-2xl border p-3.5 sm:p-4 space-y-2.5 ${
              dossier.missedWeeksAfterLast > 0
                ? 'bg-rose-950/25 border-rose-500/60'
                : 'bg-emerald-950/20 border-emerald-500/50'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <span>📡</span>
                <span>SON TAHMİN VE KATILIM DURUMU</span>
              </div>

              {activityLoading ? (
                <span className="text-[10px] font-black text-sky-300 animate-pulse">
                  Bülten geçmişi taranıyor...
                </span>
              ) : dossier.lastPlayedWeek === null ? (
                <span className="px-2.5 py-1 rounded-lg bg-rose-900/80 border border-rose-400/60 text-[10.5px] font-black text-rose-100 uppercase">
                  ⚠️ Kayıtlı tahmin bulunamadı
                </span>
              ) : dossier.missedWeeksAfterLast > 0 ? (
                <span className="px-2.5 py-1 rounded-lg bg-rose-900/90 border border-rose-400/70 text-[10.5px] font-black text-rose-100 uppercase">
                  ⚠️ {dossier.lastPlayedWeek}. Haftadan sonra yapmadı ({dossier.missedWeeksAfterLast} haftadır pasif)
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-800/80 border border-emerald-400/70 text-[10.5px] font-black text-emerald-100 uppercase">
                  🟢 Güncel Bültende Aktif
                </span>
              )}
            </div>

            {!activityLoading && dossier.lastPlayedWeek !== null && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="rounded-xl bg-[#040914]/90 border border-slate-800 px-3 py-2.5">
                  <div className="text-[9.5px] font-black text-sky-400 uppercase tracking-wider">
                    EN SON KATILDIĞI BÜLTEN DOLULUĞU
                  </div>
                  <div className="text-sm sm:text-base font-black text-white mt-0.5">
                    {dossier.lastPlayedWeek}. Hafta •{' '}
                    <span className="text-amber-300">
                      {dossier.lastWeekFilledCount !== null
                        ? `${dossier.lastWeekTotalMatches}'te ${dossier.lastWeekFilledCount} Maç Oynadı`
                        : 'Eski Arşiv Haftası'}
                    </span>
                  </div>
                  <div className="text-[10.5px] font-bold text-slate-400 mt-0.5">
                    {dossier.missedWeeksAfterLast > 0
                      ? `${dossier.lastPlayedWeek}. Haftadan sonra (${dossier.lastPlayedWeek + 1} - ${dossier.latestStartedLeagueWeek}. Hafta) tahmin girişi yok.`
                      : '🔒 Oynanmamış maçların skorları maç bitene kadar gizlidir.'}
                  </div>
                </div>

                <div className="rounded-xl bg-[#040914]/90 border border-slate-800 px-3 py-2.5">
                  <div className="text-[9.5px] font-black text-emerald-400 uppercase tracking-wider">
                    SON SONUÇLANAN MAÇ TAHMİNİ
                  </div>
                  {dossier.lastFinishedMatch ? (
                    <>
                      <div className="text-xs sm:text-sm font-black text-white uppercase truncate mt-0.5">
                        {dossier.lastFinishedMatch.homeTeam} - {dossier.lastFinishedMatch.awayTeam}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[10.5px] font-black mt-1">
                        <span className="text-slate-300">
                          {dossier.lastFinishedMatch.weekNum}.H {dossier.lastFinishedMatch.matchIndex}.M
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-white">
                          Sonuç: {dossier.lastFinishedMatch.actualScore}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded border ${
                            dossier.lastFinishedMatch.isExactHit
                              ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300'
                              : 'bg-rose-950/90 border-rose-500 text-rose-300'
                          }`}
                        >
                          Tahmin: {dossier.lastFinishedMatch.predictedScore}
                        </span>
                        {dossier.lastFinishedMatch.isExactHit && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                            +{dossier.lastFinishedMatch.pointsEarned} Puan Aldı
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-xs font-bold text-slate-400 mt-1">
                      🔒 Maçlar sonuçlandığında açılır
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ALT SEKMELER */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTabView('ACTIVITY')}
              className={`px-3.5 py-1.5 rounded-xl text-[10.5px] sm:text-xs font-black uppercase tracking-wider border cursor-pointer transition-colors ${
                activeTabView === 'ACTIVITY'
                  ? 'bg-[#15368a] text-white border-blue-400/80'
                  : 'bg-[#040917] text-slate-300 border-slate-800 hover:text-white'
              }`}
            >
              🕒 SON SONUÇLANAN 5 MAÇI
            </button>
            <button
              type="button"
              onClick={() => setActiveTabView('HITS')}
              className={`px-3.5 py-1.5 rounded-xl text-[10.5px] sm:text-xs font-black uppercase tracking-wider border cursor-pointer transition-colors ${
                activeTabView === 'HITS'
                  ? 'bg-emerald-700 text-white border-emerald-400/80'
                  : 'bg-[#040917] text-slate-300 border-slate-800 hover:text-white'
              }`}
            >
              🎯 BİLDİĞİ MAÇ KARTLARI ({dossier.exactHitsSorted.length})
            </button>
          </div>

          {activeTabView === 'ACTIVITY' ? (
            <div className="space-y-2">
              {activityLoading ? (
                <div className="text-center py-8 text-xs font-black text-sky-300 uppercase tracking-widest animate-pulse">
                  Sonuçlanan maçlar yükleniyor...
                </div>
              ) : dossier.recentFiveFinishedMatches.length === 0 ? (
                <div className="text-center py-8 text-xs font-bold text-slate-400 uppercase">
                  🔒 Henüz sonuçlanmış maç kaydı bulunmuyor (Açık bülten tahminleri gizlidir).
                </div>
              ) : (
                dossier.recentFiveFinishedMatches.map((rm) => (
                  <div
                    key={`rec-${rm.weekNum}-${rm.matchIndex}`}
                    className={`rounded-xl border px-3 sm:px-3.5 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 ${
                      rm.isExactHit
                        ? 'bg-emerald-950/30 border-emerald-500/60'
                        : 'bg-rose-950/15 border-rose-900/50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
                        <span className="text-amber-300">
                          {rm.weekNum}. HAFTA {rm.matchIndex}. MAÇ
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded border text-[8.5px] ${
                            rm.isTff
                              ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                              : 'bg-sky-950 text-sky-300 border-sky-500/50'
                          }`}
                        >
                          {rm.isTff ? 'TFF' : 'DFO'}
                        </span>
                        {rm.matchDate && (
                          <span className="text-slate-400">
                            • {rm.matchDate} {rm.matchTime}
                          </span>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm font-black text-white uppercase truncate mt-0.5">
                        {rm.homeTeam} <span className="text-sky-400">-</span> {rm.awayTeam}
                      </div>
                    </div>

                    {/* ÖNCE SONUÇ, SONRA YEŞİL/KIRMIZI TAHMİN, BİLMİŞSE YANINA +X PUAN ALDI */}
                    <div className="shrink-0 flex items-center gap-1.5 sm:gap-2">
                      <div className="px-2.5 py-1 rounded-lg bg-[#040914] border border-slate-700 text-center min-w-[54px]">
                        <div className="text-[8.5px] font-black text-slate-400 uppercase">SONUÇ</div>
                        <div className="text-xs sm:text-sm font-black text-white tabular-nums">
                          {rm.actualScore}
                        </div>
                      </div>

                      <div
                        className={`px-2.5 py-1 rounded-lg border text-center min-w-[56px] ${
                          rm.isExactHit
                            ? 'bg-emerald-950/90 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                            : 'bg-rose-950/90 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                        }`}
                      >
                        <div
                          className={`text-[8.5px] font-black uppercase ${
                            rm.isExactHit ? 'text-emerald-300' : 'text-rose-300'
                          }`}
                        >
                          TAHMİN
                        </div>
                        <div
                          className={`text-xs sm:text-sm font-black tabular-nums ${
                            rm.isExactHit ? 'text-emerald-300' : 'text-rose-400'
                          }`}
                        >
                          {rm.predictedScore}
                        </div>
                      </div>

                      {rm.isExactHit && (
                        <span className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-[10px] sm:text-[11px] font-black uppercase tracking-wide whitespace-nowrap shadow">
                          +{rm.pointsEarned} PUAN ALDI
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {dossier.exactHitsSorted.length === 0 ? (
                <div className="text-center py-8 text-xs font-bold text-slate-400 uppercase">
                  Bu sezon henüz tam skor isabeti bulunmuyor.
                </div>
              ) : (
                dossier.exactHitsSorted.map((hm) => (
                  <div
                    key={`hit-${hm.weekNum}-${hm.matchIndex}`}
                    className="rounded-xl bg-[#050d1c] border border-emerald-500/40 px-3.5 py-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase">
                        <span className="text-sky-300">
                          {hm.weekNum}. HAFTA {hm.matchIndex}. MAÇ
                        </span>
                        <span
                          className={`px-1.5 rounded text-[8.5px] border ${
                            hm.isTff
                              ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                              : 'bg-sky-950 text-sky-300 border-sky-500/50'
                          }`}
                        >
                          {hm.isTff ? 'TFF' : 'DFO'}
                        </span>
                        {hm.matchDate && <span className="text-slate-400">• {hm.matchDate}</span>}
                      </div>
                      <div className="text-xs sm:text-sm font-black text-white uppercase truncate mt-0.5">
                        {hm.homeTeam} - {hm.awayTeam}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-[#040914] border border-emerald-500/40 text-xs sm:text-sm font-black text-emerald-300 tabular-nums">
                        {hm.actualScore}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-xs font-black tabular-nums">
                        +{hm.pointsEarned} PUAN ALDI
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}