'use client';

import React, { useMemo, useState, useEffect, useId } from 'react';
import { supabase } from '@/utils/supabase';
import { getEliteTheme } from '@/utils/themeEngine';
import { getClubLogoUrl, isNationalTeamName } from '@/components/FavoriteTeamSelector';

export interface DossierMatchItem {
  id: string | number;
  week_num: number;
  match_index: number;
  category: string;
  pool_type?: string;
  match_date?: string;
  match_time?: string;
  home_team: string;
  away_team: string;
  home_score: string | number | null;
  away_score: string | number | null;
  status: string;
  winner_ids: string[] | null;
  points_awarded: number | null;
  isLiveActive?: boolean;
}

export interface DossierWeekBonusItem {
  week_num: number;
  is_completed: boolean;
  bonus_enabled?: boolean;
  puan_lideri_ids: string[] | null;
  puan_bonus: number | null;
  skor_krali_ids: string[] | null;
  skor_bonus: number | null;
}

interface PlayerSeasonDossierModalProps {
  playerId: string | null;
  onClose: () => void;
  playersDirectory: Record<string, { name: string; favoriteTeam?: string }>;
  matches: DossierMatchItem[];
  weeksBonus?: DossierWeekBonusItem[];
  seasonLabel?: string;
}

const stripEmojis = (s?: string | null) =>
  String(s || '')
    .replace(/(🏆|🇹🇷)+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const normKey = (s?: string | null) =>
  stripEmojis(s)
    .toLocaleUpperCase('tr-TR')
    .replace(/İ/g, 'I')
    .replace(/Ş/g, 'S')
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ö/g, 'O')
    .replace(/Ç/g, 'C')
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeScoreText = (raw?: string | null) => {
  const cleaned = String(raw || '')
    .trim()
    .replace(/\s+/g, '')
    .replace(':', '-');
  if (!/^\d+-\d+$/.test(cleaned)) return '';
  const [h, a] = cleaned.split('-');
  return `${Number(h)}-${Number(a)}`;
};

const OFFICIAL_CHAMPIONS: Record<string, { stars: number; reigning: boolean }> = {
  'OSMAN ALI AYDIN': { stars: 2, reigning: true },
  'ISMAIL EKER': { stars: 1, reigning: true },
  'GAZI AYAN': { stars: 2, reigning: false },
  'RECEP ILHAN KARACA': { stars: 2, reigning: false },
  'RECEP ILAN KARACA': { stars: 2, reigning: false },
  'R ILHAN KARACA': { stars: 2, reigning: false },
  'YAHSI ERKAN': { stars: 1, reigning: false },
  'AHMET BIRCAN': { stars: 1, reigning: false },
  'CEMAL SIVRIKAYA': { stars: 1, reigning: false },
  'HUDAVERDI TOPARDIC': { stars: 1, reigning: false },
  'HUDAVER TOPARDIC': { stars: 1, reigning: false },
  'MURAT KARA': { stars: 1, reigning: false },
  'METE BUYUKGOL': { stars: 1, reigning: false }
};

// Sadece tıklanan yarışmacının tahminlerini oturum boyunca bellekte tutar (tekrar tıklamada 0 Byte Egress)
const PLAYER_PRED_CACHE: Record<
  string,
  { totalCount: number; distinctWeeks: number; freqMap: Record<string, number> }
> = {};

const calcPtsByWinners = (cnt: number) => {
  if (cnt === 1) return 12;
  if (cnt === 2) return 6;
  if (cnt === 3) return 5;
  if (cnt === 4) return 4;
  if (cnt === 5) return 3;
  if (cnt === 6) return 2;
  if (cnt >= 7) return 1;
  return 0;
};

const checkIsTff = (poolType?: string, category?: string, home?: string, away?: string) => {
  if (poolType === 'TFF') return true;
  if (poolType === 'DFO') return false;
  const cat = normKey(category);
  if (
    cat.includes('UEFA') ||
    cat.includes('SAMPIYONLAR') ||
    cat.includes('CHAMPIONS') ||
    cat.includes('AVRUPA LIGI') ||
    cat.includes('EUROPA') ||
    cat.includes('KONFERANS') ||
    cat.includes('CONFERENCE') ||
    cat.includes('ULUSLAR') ||
    cat.includes('NATIONS') ||
    cat.includes('PREMIER') ||
    cat.includes('LA LIGA') ||
    cat.includes('SERIE A') ||
    cat.includes('BUNDESLIGA') ||
    cat.includes('LIGUE 1')
  ) {
    return false;
  }
  if (
    cat.includes('TURKIYE') ||
    cat.includes('TFF') ||
    cat.includes('SUPER LIG') ||
    cat.includes('1 LIG') ||
    cat.includes('2 LIG') ||
    cat.includes('3 LIG') ||
    cat.includes('ZIRAAT') ||
    cat.includes('KUPA')
  ) {
    return true;
  }
  const h = normKey(home);
  const a = normKey(away);
  const rx =
    /(SPOR|GUCU|GENCLER|GALATASARAY|FENERBAHCE|BESIKTAS|GOZTEPE|KARSIYAKA|ALTAY|TRABZON|BURSA|ESKISEHIR|KASIMPASA|EYUP|AMED|IGDIR)/;
  return rx.test(h) && rx.test(a);
};

const ModalCupCrest = ({ name }: { name: string }) => {
  const gid = useId().replace(/:/g, '');
  const info = OFFICIAL_CHAMPIONS[normKey(name)];
  if (!info || info.stars <= 0) return null;

  const makeStar = (cx: number, cy: number, rO: number, rI: number) => {
    const pts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? rO : rI;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
    }
    return pts.join(' ');
  };

  return (
    <span
      className="inline-flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 shrink-0 drop-shadow-[0_3px_8px_rgba(0,0,0,0.8)]"
      title={info.reigning ? `${info.stars} Şampiyonluk • Son Şampiyon` : `${info.stars} Şampiyonluk`}
    >
      <svg viewBox="0 0 64 68" className="w-full h-full overflow-visible block">
        <defs>
          <linearGradient id={`mdlCup-${gid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="45%" stopColor="#FACC15" />
            <stop offset="100%" stopColor="#CA8A04" />
          </linearGradient>
          <linearGradient id={`mdlStar-${gid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="55%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        {info.stars === 1 ? (
          <polygon points={makeStar(32, 9, 8.3, 3.6)} fill={`url(#mdlStar-${gid})`} stroke="#92400E" strokeWidth="1.2" />
        ) : (
          <>
            <polygon points={makeStar(22, 9.5, 7.6, 3.3)} fill={`url(#mdlStar-${gid})`} stroke="#92400E" strokeWidth="1.2" />
            <polygon points={makeStar(42, 9.5, 7.6, 3.3)} fill={`url(#mdlStar-${gid})`} stroke="#92400E" strokeWidth="1.2" />
          </>
        )}
        <path d="M17 24 H8.5 C6.5 24 5.5 25.5 6 28 C7.2 35.5 11.5 40.5 19.5 42" fill="none" stroke={`url(#mdlCup-${gid})`} strokeWidth="4.2" strokeLinecap="round" />
        <path d="M47 24 H55.5 C57.5 24 58.5 25.5 58 28 C56.8 35.5 52.5 40.5 44.5 42" fill="none" stroke={`url(#mdlCup-${gid})`} strokeWidth="4.2" strokeLinecap="round" />
        <path d="M15 20 H49 L46 39 C44.5 48.5 38.8 53 32 53 C25.2 53 19.5 48.5 18 39 Z" fill={`url(#mdlCup-${gid})`} stroke="#854D0E" strokeWidth="1.6" />
        <rect x="13.5" y="18" width="37" height="4.5" rx="2.2" fill="#FEF08A" stroke="#854D0E" strokeWidth="1.3" />
        <path d="M28.5 52.5 H35.5 L37 60 H27 Z" fill={`url(#mdlCup-${gid})`} stroke="#854D0E" strokeWidth="1.4" />
        <rect x="20" y="59.5" width="24" height="5.5" rx="2.5" fill={`url(#mdlCup-${gid})`} stroke="#854D0E" strokeWidth="1.5" />
        {info.reigning ? (
          <g>
            <path d="M32 22.8 C36.2 24.4 40.5 24.6 44 24 V36 C44 43.8 38.6 49 32 51.4 C25.4 49 20 43.8 20 36 V24 C23.5 24.6 27.8 24.4 32 22.8 Z" fill="#E30A17" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="30.1" cy="36.6" r="5.7" fill="#FFFFFF" />
            <circle cx="31.7" cy="36.6" r="4.5" fill="#E30A17" />
            <polygon points="35.3,36.6 39.2,37.9 36.8,34.5 36.8,38.7 39.2,35.3" fill="#FFFFFF" />
          </g>
        ) : (
          <path d="M21.5 25 L23 38 C23.6 42.5 25.8 45.8 28.5 47.5" fill="none" stroke="#FEF9C3" strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
        )}
      </svg>
    </span>
  );
};

const TIERS = [
  { pts: 12, label: '12 PUAN (TEK BAŞINA)', short: '12P TEK', badgeCls: 'bg-amber-500/20 border-amber-400 text-amber-300' },
  { pts: 6, label: '6 PUAN (2 KİŞİ)', short: '6 PUAN', badgeCls: 'bg-purple-500/20 border-purple-400 text-purple-200' },
  { pts: 5, label: '5 PUAN (3 KİŞİ)', short: '5 PUAN', badgeCls: 'bg-indigo-500/20 border-indigo-400 text-indigo-200' },
  { pts: 4, label: '4 PUAN (4 KİŞİ)', short: '4 PUAN', badgeCls: 'bg-sky-500/20 border-sky-400 text-sky-200' },
  { pts: 3, label: '3 PUAN (5 KİŞİ)', short: '3 PUAN', badgeCls: 'bg-cyan-500/20 border-cyan-400 text-cyan-200' },
  { pts: 2, label: '2 PUAN (6 KİŞİ)', short: '2 PUAN', badgeCls: 'bg-teal-500/20 border-teal-400 text-teal-200' },
  { pts: 1, label: '1 PUAN (7+ KİŞİ)', short: '1 PUAN', badgeCls: 'bg-emerald-500/20 border-emerald-400 text-emerald-200' }
] as const;

export default function PlayerSeasonDossierModal({
  playerId,
  onClose,
  playersDirectory,
  matches,
  weeksBonus = [],
  seasonLabel = '2026-2027 SEZONU'
}: PlayerSeasonDossierModalProps) {
  const [activeView, setActiveView] = useState<'STATS' | 'CARDS'>('STATS');
  const [tierFilter, setTierFilter] = useState<number | 'ALL'>('ALL');
  const [poolFilter, setPoolFilter] = useState<'ALL' | 'DFO' | 'TFF'>('ALL');
  const [weekFilter, setWeekFilter] = useState<number | 'ALL'>('ALL');
  const [scoreFilter, setScoreFilter] = useState<string | 'ALL'>('ALL');

  const [predHabitState, setPredHabitState] = useState<{
    loading: boolean;
    totalCount: number;
    distinctWeeks: number;
    freqMap: Record<string, number>;
  }>({ loading: false, totalCount: 0, distinctWeeks: 0, freqMap: {} });

  // Yarışmacı değiştiğinde filtreleri sıfırla ve SADECE bu yarışmacının tahmin dağılımını çek (~3-4 KB)
  useEffect(() => {
    setActiveView('STATS');
    setTierFilter('ALL');
    setPoolFilter('ALL');
    setWeekFilter('ALL');
    setScoreFilter('ALL');

    if (!playerId) return;
    const pid = String(playerId).trim();

    if (PLAYER_PRED_CACHE[pid]) {
      setPredHabitState({
        loading: false,
        ...PLAYER_PRED_CACHE[pid]
      });
      return;
    }

    let active = true;
    setPredHabitState({ loading: true, totalCount: 0, distinctWeeks: 0, freqMap: {} });

    (async () => {
      try {
        let allRows: { week_num: number; predicted_score: string }[] = [];
        let from = 0;
        const step = 1000;
        let keepGoing = true;

        while (keepGoing) {
          const { data, error } = await supabase
            .from('player_predictions')
            .select('week_num, predicted_score')
            .eq('user_id', pid)
            .range(from, from + step - 1);

          if (error || !data || data.length === 0) {
            keepGoing = false;
          } else {
            allRows = [...allRows, ...(data as any[])];
            if (data.length < step) keepGoing = false;
            else from += step;
          }
        }

        if (!active) return;

        const freq: Record<string, number> = {};
        const weekSet = new Set<number>();
        let validTotal = 0;

        allRows.forEach((r) => {
          const normSc = normalizeScoreText(r.predicted_score);
          if (!normSc) return;
          validTotal += 1;
          if (r.week_num) weekSet.add(Number(r.week_num));
          freq[normSc] = (freq[normSc] || 0) + 1;
        });

        const payload = {
          totalCount: validTotal,
          distinctWeeks: weekSet.size,
          freqMap: freq
        };
        PLAYER_PRED_CACHE[pid] = payload;

        setPredHabitState({
          loading: false,
          ...payload
        });
      } catch {
        if (active) {
          setPredHabitState({ loading: false, totalCount: 0, distinctWeeks: 0, freqMap: {} });
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [playerId]);

  const dossier = useMemo(() => {
    if (!playerId) return null;
    const pid = String(playerId).trim();
    const pInfo = playersDirectory[pid] || { name: pid, favoriteTeam: '' };
    const cleanName = stripEmojis(pInfo.name || pid);
    const favTeam = isNationalTeamName(pInfo.favoriteTeam) ? '' : pInfo.favoriteTeam || '';
    const clubLogo = getClubLogoUrl(favTeam);
    const champInfo = OFFICIAL_CHAMPIONS[normKey(cleanName)] || { stars: 0, reigning: false };

    const allPlayerIds = Object.keys(playersDirectory).filter((id) => id !== 'mankoman');
    if (!allPlayerIds.includes(pid)) allPlayerIds.push(pid);

    const weeksMap: Record<number, DossierMatchItem[]> = {};
    matches.forEach((m) => {
      if (m.status !== 'FINISHED' && !m.isLiveActive) return;
      const w = Number(m.week_num);
      if (!weeksMap[w]) weeksMap[w] = [];
      weeksMap[w].push(m);
    });

    const bonusByWeek: Record<number, DossierWeekBonusItem> = {};
    weeksBonus.forEach((wb) => {
      bonusByWeek[Number(wb.week_num)] = wb;
    });

    const sortedWeeks = Object.keys(weeksMap)
      .map(Number)
      .filter((w) => w > 0)
      .sort((a, b) => a - b);

    const runningMaster: Record<string, { pts: number; skor: number; name: string }> = {};
    allPlayerIds.forEach((uid) => {
      runningMaster[uid] = {
        pts: 0,
        skor: 0,
        name: stripEmojis(playersDirectory[uid]?.name || uid)
      };
    });

    let dfoPts = 0;
    let tffPts = 0;
    let bonusPts = 0;
    let dfoSkor = 0;
    let tffSkor = 0;
    const puanLiderWeeks: number[] = [];
    const skorKralWeeks: number[] = [];

    const tierStats: Record<
      number,
      { count: number; totalPts: number; dfoCount: number; tffCount: number }
    > = {
      12: { count: 0, totalPts: 0, dfoCount: 0, tffCount: 0 },
      6: { count: 0, totalPts: 0, dfoCount: 0, tffCount: 0 },
      5: { count: 0, totalPts: 0, dfoCount: 0, tffCount: 0 },
      4: { count: 0, totalPts: 0, dfoCount: 0, tffCount: 0 },
      3: { count: 0, totalPts: 0, dfoCount: 0, tffCount: 0 },
      2: { count: 0, totalPts: 0, dfoCount: 0, tffCount: 0 },
      1: { count: 0, totalPts: 0, dfoCount: 0, tffCount: 0 }
    };

    // EN ÇOK TAM İSABET ALDIĞI SKORLAR HAVUZU
    const exactHitScoresMap: Record<
      string,
      { score: string; count: number; totalPts: number; dfoCount: number; tffCount: number }
    > = {};

    const wonMatches: (DossierMatchItem & {
      ptsEarned: number;
      winnerCount: number;
      isTff: boolean;
      scoreStr: string;
      coWinnerNames: string[];
    })[] = [];

    const weeklyHistory: {
      week: number;
      weekPts: number;
      weekSkor: number;
      rankAfterWeek: number;
      cumMaster: number;
    }[] = [];

    sortedWeeks.forEach((wn) => {
      const wList = weeksMap[wn] || [];
      let playerWeekPts = 0;
      let playerWeekSkor = 0;

      wList.forEach((m) => {
        const winners = (m.winner_ids || [])
          .map((x) => String(x).trim())
          .filter((x) => x && x !== 'mankoman');
        if (winners.length === 0) return;

        const pts =
          m.points_awarded !== null && m.points_awarded !== undefined && Number(m.points_awarded) > 0
            ? Number(m.points_awarded)
            : calcPtsByWinners(winners.length);

        const isTff = checkIsTff(m.pool_type, m.category, m.home_team, m.away_team);

        winners.forEach((wUid) => {
          if (!runningMaster[wUid]) {
            runningMaster[wUid] = {
              pts: 0,
              skor: 0,
              name: stripEmojis(playersDirectory[wUid]?.name || wUid)
            };
          }
          runningMaster[wUid].pts += pts;
          runningMaster[wUid].skor += 1;
        });

        if (winners.includes(pid)) {
          playerWeekPts += pts;
          playerWeekSkor += 1;
          if (isTff) {
            tffPts += pts;
            tffSkor += 1;
          } else {
            dfoPts += pts;
            dfoSkor += 1;
          }

          const tierKey = [12, 6, 5, 4, 3, 2].includes(pts) ? pts : 1;
          tierStats[tierKey].count += 1;
          tierStats[tierKey].totalPts += pts;
          if (isTff) tierStats[tierKey].tffCount += 1;
          else tierStats[tierKey].dfoCount += 1;

          const scKey =
            m.home_score !== null &&
            m.home_score !== undefined &&
            m.away_score !== null &&
            m.away_score !== undefined
              ? normalizeScoreText(`${m.home_score}-${m.away_score}`)
              : '';

          if (scKey) {
            if (!exactHitScoresMap[scKey]) {
              exactHitScoresMap[scKey] = {
                score: scKey,
                count: 0,
                totalPts: 0,
                dfoCount: 0,
                tffCount: 0
              };
            }
            exactHitScoresMap[scKey].count += 1;
            exactHitScoresMap[scKey].totalPts += pts;
            if (isTff) exactHitScoresMap[scKey].tffCount += 1;
            else exactHitScoresMap[scKey].dfoCount += 1;
          }

          const coWinnerNames = winners
            .filter((id) => id !== pid)
            .map((id) => stripEmojis(playersDirectory[id]?.name || id))
            .sort((a, b) => a.localeCompare(b, 'tr'));

          wonMatches.push({
            ...m,
            ptsEarned: pts,
            winnerCount: winners.length,
            isTff,
            scoreStr: scKey,
            coWinnerNames
          });
        }
      });

      const wb = bonusByWeek[wn];
      if (wb && wb.bonus_enabled !== false && wb.is_completed) {
        const pB = Number(wb.puan_bonus || 0);
        const sB = Number(wb.skor_bonus || 0);
        if (pB > 0 && Array.isArray(wb.puan_lideri_ids)) {
          wb.puan_lideri_ids.forEach((rawId) => {
            const u = String(rawId).trim();
            if (runningMaster[u]) runningMaster[u].pts += pB;
            if (u === pid) {
              bonusPts += pB;
              playerWeekPts += pB;
              puanLiderWeeks.push(wn);
            }
          });
        }
        if (sB > 0 && Array.isArray(wb.skor_krali_ids)) {
          wb.skor_krali_ids.forEach((rawId) => {
            const u = String(rawId).trim();
            if (runningMaster[u]) runningMaster[u].pts += sB;
            if (u === pid) {
              bonusPts += sB;
              playerWeekPts += sB;
              skorKralWeeks.push(wn);
            }
          });
        }
      }

      const sortedSnap = Object.entries(runningMaster).sort(
        (a, b) =>
          b[1].pts - a[1].pts ||
          b[1].skor - a[1].skor ||
          a[1].name.localeCompare(b[1].name, 'tr')
      );
      const rankIdx = sortedSnap.findIndex(([id]) => id === pid);

      weeklyHistory.push({
        week: wn,
        weekPts: playerWeekPts,
        weekSkor: playerWeekSkor,
        rankAfterWeek: rankIdx >= 0 ? rankIdx + 1 : allPlayerIds.length,
        cumMaster: runningMaster[pid]?.pts || 0
      });
    });

    wonMatches.sort(
      (a, b) => Number(b.week_num) - Number(a.week_num) || Number(a.match_index) - Number(b.match_index)
    );

    const exactHitScoresRanked = Object.values(exactHitScoresMap).sort(
      (a, b) => b.count - a.count || b.totalPts - a.totalPts || a.score.localeCompare(b.score)
    );

    const activeRanks = weeklyHistory.map((h) => h.rankAfterWeek);
    const bestRank = activeRanks.length > 0 ? Math.min(...activeRanks) : null;
    const worstRank = activeRanks.length > 0 ? Math.max(...activeRanks) : null;
    const currentRank = activeRanks.length > 0 ? activeRanks[activeRanks.length - 1] : null;

    const bestWeekObj =
      weeklyHistory.length > 0
        ? [...weeklyHistory].sort((a, b) => b.weekPts - a.weekPts || b.weekSkor - a.weekSkor)[0]
        : null;

    const totalMaster = dfoPts + tffPts + bonusPts;
    const totalSkor = dfoSkor + tffSkor;
    const totalFinishedMatchesCount = matches.filter((m) => m.status === 'FINISHED' || m.isLiveActive).length;
    const hitRate =
      totalFinishedMatchesCount > 0 ? ((totalSkor / totalFinishedMatchesCount) * 100).toFixed(1) : '0.0';
    const avgPtsPerHit = totalSkor > 0 ? ((dfoPts + tffPts) / totalSkor).toFixed(2) : '0.00';

    return {
      pid,
      cleanName,
      favTeam,
      clubLogo,
      champInfo,
      dfoPts,
      tffPts,
      bonusPts,
      totalMaster,
      dfoSkor,
      tffSkor,
      totalSkor,
      puanLiderWeeks,
      skorKralWeeks,
      tierStats,
      exactHitScoresMap,
      exactHitScoresRanked,
      wonMatches,
      weeklyHistory,
      bestRank,
      worstRank,
      currentRank,
      bestWeekObj,
      totalFinishedMatchesCount,
      hitRate,
      avgPtsPerHit
    };
  }, [playerId, playersDirectory, matches, weeksBonus]);

  // EN ÇOK TAHMİN YAPTIĞI SKORLAR SIRALAMASI
  const predictedScoresRanked = useMemo(() => {
    const entries = Object.entries(predHabitState.freqMap).map(([score, count]) => ({
      score,
      count,
      pct: predHabitState.totalCount > 0 ? ((count / predHabitState.totalCount) * 100).toFixed(1) : '0.0'
    }));
    return entries.sort((a, b) => b.count - a.count || a.score.localeCompare(b.score));
  }, [predHabitState]);

  if (!playerId || !dossier) return null;

  const filteredCards = dossier.wonMatches.filter((m) => {
    if (tierFilter !== 'ALL') {
      const tKey = [12, 6, 5, 4, 3, 2].includes(m.ptsEarned) ? m.ptsEarned : 1;
      if (tKey !== tierFilter) return false;
    }
    if (poolFilter === 'DFO' && m.isTff) return false;
    if (poolFilter === 'TFF' && !m.isTff) return false;
    if (weekFilter !== 'ALL' && Number(m.week_num) !== weekFilter) return false;
    if (scoreFilter !== 'ALL' && m.scoreStr !== scoreFilter) return false;
    return true;
  });

  const wonDistinctWeeks = Array.from(new Set(dossier.wonMatches.map((m) => Number(m.week_num)))).sort(
    (a, b) => b - a
  );

  const wonDistinctScores = dossier.exactHitScoresRanked.map((x) => x.score);

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-gradient-to-b from-[#08152e] via-[#061022] to-[#040914] border border-sky-500/45 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden my-2 sm:my-6 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ÜST KÜNYE BAŞLIĞI */}
        <div className="bg-[#040a18]/95 border-b border-slate-800 px-3.5 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {dossier.clubLogo && (
              <img
                src={dossier.clubLogo}
                alt={dossier.favTeam}
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0 drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)]"
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-xl font-black text-white uppercase tracking-wide truncate">
                  {dossier.cleanName}
                </h2>
                <ModalCupCrest name={dossier.cleanName} />
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px] sm:text-xs font-bold text-sky-300">
                <span>📊 {seasonLabel} ANALİZİ</span>
                {dossier.currentRank && (
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400/50 text-sky-200 font-black">
                    GÜNCEL SIRA: #{dossier.currentRank}
                  </span>
                )}
                {dossier.champInfo.stars > 0 && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/60 text-amber-300 font-black">
                    {dossier.champInfo.stars}x ŞAMPİYON
                    {dossier.champInfo.reigning ? ' • SON ŞAMPİYON' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-950/70 hover:bg-rose-600 border border-rose-500/50 text-white font-black text-sm flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            title="Kapat"
          >
            ✕
          </button>
        </div>

        {/* ANA PUAN ÖZET ŞERİDİ */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 px-3 py-2.5 sm:px-6 bg-[#050d1f] border-b border-slate-800/90 shrink-0 text-center tabular-nums">
          <div className="bg-[#08142c] border border-sky-500/30 rounded-xl py-1.5 px-1">
            <div className="text-[9px] sm:text-[10px] font-black text-sky-400 uppercase">DFO</div>
            <div className="text-sm sm:text-lg font-black text-white">{dossier.dfoPts}</div>
            <div className="text-[8.5px] sm:text-[9.5px] font-bold text-slate-400">{dossier.dfoSkor} maç</div>
          </div>
          <div className="bg-[#08142c] border border-rose-500/30 rounded-xl py-1.5 px-1">
            <div className="text-[9px] sm:text-[10px] font-black text-rose-400 uppercase">TFF</div>
            <div className="text-sm sm:text-lg font-black text-white">{dossier.tffPts}</div>
            <div className="text-[8.5px] sm:text-[9.5px] font-bold text-slate-400">{dossier.tffSkor} maç</div>
          </div>
          <div className="bg-[#08142c] border border-emerald-500/30 rounded-xl py-1.5 px-1">
            <div className="text-[9px] sm:text-[10px] font-black text-emerald-400 uppercase">BONUS</div>
            <div className="text-sm sm:text-lg font-black text-emerald-300">
              {dossier.bonusPts > 0 ? `+${dossier.bonusPts}` : '0'}
            </div>
            <div className="text-[8.5px] sm:text-[9.5px] font-bold text-slate-400">
              {dossier.puanLiderWeeks.length + dossier.skorKralWeeks.length} ödül
            </div>
          </div>
          <div className="bg-[#08142c] border border-orange-500/30 rounded-xl py-1.5 px-1">
            <div className="text-[9px] sm:text-[10px] font-black text-orange-400 uppercase">SKOR</div>
            <div className="text-sm sm:text-lg font-black text-orange-300">{dossier.totalSkor}</div>
            <div className="text-[8.5px] sm:text-[9.5px] font-bold text-slate-400">%{dossier.hitRate}</div>
          </div>
          <div className="bg-sky-600/20 border border-sky-400/60 rounded-xl py-1.5 px-1">
            <div className="text-[9px] sm:text-[10px] font-black text-sky-200 uppercase">MASTER</div>
            <div className="text-sm sm:text-xl font-black text-white">{dossier.totalMaster}</div>
            <div className="text-[8.5px] sm:text-[9.5px] font-bold text-sky-300">{dossier.avgPtsPerHit} P/maç</div>
          </div>
        </div>

        {/* SEKME GEÇİŞİ */}
        <div className="px-3 py-2 sm:px-6 bg-[#040a18] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveView('STATS')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
                activeView === 'STATS'
                  ? 'bg-blue-600 text-white border-sky-300 shadow'
                  : 'bg-[#071126] text-slate-300 border-slate-800 hover:text-white'
              }`}
            >
              📈 SEZON İSTATİSTİKLERİ & SKOR ANALİZİ
            </button>
            <button
              type="button"
              onClick={() => setActiveView('CARDS')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
                activeView === 'CARDS'
                  ? 'bg-emerald-600 text-white border-emerald-300 shadow'
                  : 'bg-[#071126] text-emerald-300 border-slate-800 hover:text-white'
              }`}
            >
              ⚽ BİLDİĞİ MAÇ KARTLARI ({dossier.wonMatches.length})
            </button>
          </div>

          {dossier.tierStats[12].count > 0 && (
            <button
              type="button"
              onClick={() => {
                setTierFilter(12);
                setPoolFilter('ALL');
                setWeekFilter('ALL');
                setScoreFilter('ALL');
                setActiveView('CARDS');
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/70 text-amber-300 text-[10px] font-black uppercase tracking-wider cursor-pointer"
            >
              🎯 {dossier.tierStats[12].count} KEZ TEK BAŞINA (12P) →
            </button>
          )}
        </div>

        {/* İÇERİK GÖVDESİ */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeView === 'STATS' ? (
            <>
              {/* 1. SEZON DERECE & BAŞARI KARTLARI */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 tabular-nums">
                <div className="bg-[#071329] border border-emerald-500/35 rounded-xl p-3">
                  <div className="text-[9.5px] font-black text-emerald-400 uppercase">EN YÜKSEK SIRA</div>
                  <div className="text-lg sm:text-2xl font-black text-white mt-0.5">
                    {dossier.bestRank ? `${dossier.bestRank}. Sıra` : '-'}
                  </div>
                  <div className="text-[9.5px] text-slate-400 font-bold">Sezon zirvesi</div>
                </div>

                <div className="bg-[#071329] border border-rose-500/35 rounded-xl p-3">
                  <div className="text-[9.5px] font-black text-rose-400 uppercase">EN DÜŞÜK SIRA</div>
                  <div className="text-lg sm:text-2xl font-black text-white mt-0.5">
                    {dossier.worstRank ? `${dossier.worstRank}. Sıra` : '-'}
                  </div>
                  <div className="text-[9.5px] text-slate-400 font-bold">Sezon tabanı</div>
                </div>

                <div className="bg-[#071329] border border-amber-500/35 rounded-xl p-3">
                  <div className="text-[9.5px] font-black text-amber-300 uppercase">REKOR HAFTASI</div>
                  <div className="text-lg sm:text-2xl font-black text-white mt-0.5">
                    {dossier.bestWeekObj && dossier.bestWeekObj.weekPts > 0
                      ? `${dossier.bestWeekObj.weekPts} P`
                      : '-'}
                  </div>
                  <div className="text-[9.5px] text-slate-400 font-bold">
                    {dossier.bestWeekObj && dossier.bestWeekObj.weekPts > 0
                      ? `${dossier.bestWeekObj.week}. Hafta (${dossier.bestWeekObj.weekSkor} skor)`
                      : 'Henüz kayıt yok'}
                  </div>
                </div>

                <div className="bg-[#071329] border border-sky-500/35 rounded-xl p-3">
                  <div className="text-[9.5px] font-black text-sky-300 uppercase">HAFTA LİDERLİĞİ</div>
                  <div className="text-sm sm:text-base font-black text-white mt-1 leading-tight">
                    <div>🏅 Puan Lideri: {dossier.puanLiderWeeks.length}x</div>
                    <div className="text-orange-300 mt-0.5">👑 Skor Kralı: {dossier.skorKralWeeks.length}x</div>
                  </div>
                </div>
              </div>

              {/* 2. YENİ: SKOR ANALİZİ İKİZ PANEL (EN ÇOK İSABET ALDIĞI SKORLAR & EN ÇOK TAHMİN YAPTIĞI SKORLAR) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 tabular-nums">
                {/* SOL PANEL: EN ÇOK TAM İSABET ALDIĞI SKORLAR */}
                <div className="bg-[#071329] border border-emerald-500/35 rounded-2xl overflow-hidden flex flex-col">
                  <div className="px-3.5 py-2.5 bg-[#040a18] border-b border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-[11px] sm:text-xs font-black text-emerald-300 uppercase tracking-wider">
                        🎯 EN ÇOK TAM İSABET ALDIĞI SKORLAR
                      </h3>
                      <p className="text-[9.5px] font-bold text-slate-400">
                        Skora dokununca o skorla bildiği maç kartlarını açar
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[9.5px] font-black shrink-0">
                      {dossier.totalSkor} İSABET
                    </span>
                  </div>

                  {dossier.exactHitScoresRanked.length === 0 ? (
                    <div className="py-8 text-center text-[11px] font-bold text-slate-400 uppercase">
                      Henüz tam isabet kaydı bulunmuyor
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800/80 max-h-[300px] overflow-y-auto">
                      {dossier.exactHitScoresRanked.map((item, idx) => {
                        const pctOfHits =
                          dossier.totalSkor > 0
                            ? ((item.count / dossier.totalSkor) * 100).toFixed(1)
                            : '0.0';
                        const maxCnt = dossier.exactHitScoresRanked[0]?.count || 1;
                        const barWidth = Math.max(8, Math.round((item.count / maxCnt) * 100));

                        return (
                          <button
                            key={item.score}
                            type="button"
                            onClick={() => {
                              setScoreFilter(item.score);
                              setTierFilter('ALL');
                              setPoolFilter('ALL');
                              setWeekFilter('ALL');
                              setActiveView('CARDS');
                            }}
                            className="w-full px-3 py-2 hover:bg-emerald-950/30 transition-colors flex items-center justify-between gap-2 text-left cursor-pointer"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 text-[10px] font-black text-slate-400">
                                {idx + 1}.
                              </span>
                              <span className="px-2.5 py-0.5 rounded-lg bg-[#040a18] border border-emerald-500/50 text-white font-black text-xs sm:text-sm tracking-wider min-w-[46px] text-center">
                                {item.score}
                              </span>
                              <div className="min-w-0">
                                <div className="w-20 sm:w-24 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                  <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-300"
                                    style={{ width: `${barWidth}%` }}
                                  />
                                </div>
                                <div className="text-[9px] font-bold text-slate-400 mt-0.5">
                                  DFO: <span className="text-sky-400">{item.dfoCount}</span> • TFF:{' '}
                                  <span className="text-rose-400">{item.tffCount}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="text-xs sm:text-sm font-black text-white">
                                {item.count} Kez{' '}
                                <span className="text-[10px] text-emerald-400">(%{pctOfHits})</span>
                              </div>
                              <div className="text-[9.5px] font-black text-amber-300">
                                +{item.totalPts} Puan ↗
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* SAĞ PANEL: EN ÇOK TAHMİN YAPTIĞI SKORLAR (FAVORİ SKOR TERCİHİ) */}
                <div className="bg-[#071329] border border-sky-500/35 rounded-2xl overflow-hidden flex flex-col">
                  <div className="px-3.5 py-2.5 bg-[#040a18] border-b border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-[11px] sm:text-xs font-black text-sky-300 uppercase tracking-wider">
                        🎲 EN ÇOK TAHMİN YAPTIĞI SKORLAR
                      </h3>
                      <p className="text-[9.5px] font-bold text-slate-400">
                        Kayıtlı bültenlerde en sık oynadığı favori skorlar
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-sky-950 border border-sky-500/40 text-sky-300 text-[9.5px] font-black shrink-0">
                      {predHabitState.totalCount > 0
                        ? `${predHabitState.totalCount} TAHMİN`
                        : 'ARŞİV'}
                    </span>
                  </div>

                  {predHabitState.loading ? (
                    <div className="py-10 text-center text-xs font-black text-sky-300 animate-pulse uppercase tracking-wider">
                      Tahmin alışkanlığı hesaplanıyor...
                    </div>
                  ) : predictedScoresRanked.length === 0 ? (
                    <div className="py-8 px-4 text-center text-[11px] font-bold text-slate-400">
                      Bu yarışmacı için dijital bülten tahmin kaydı bulunamadı.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800/80 max-h-[300px] overflow-y-auto">
                      {predictedScoresRanked.slice(0, 15).map((item, idx) => {
                        const maxPred = predictedScoresRanked[0]?.count || 1;
                        const barWidth = Math.max(8, Math.round((item.count / maxPred) * 100));
                        const hitCountForScore = dossier.exactHitScoresMap[item.score]?.count || 0;

                        return (
                          <div
                            key={item.score}
                            className="w-full px-3 py-2 hover:bg-sky-950/25 transition-colors flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 text-[10px] font-black text-slate-400">
                                {idx + 1}.
                              </span>
                              <span className="px-2.5 py-0.5 rounded-lg bg-[#040a18] border border-sky-500/50 text-white font-black text-xs sm:text-sm tracking-wider min-w-[46px] text-center">
                                {item.score}
                              </span>
                              <div className="min-w-0">
                                <div className="w-20 sm:w-24 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                  <div
                                    className="h-full bg-gradient-to-r from-sky-500 to-indigo-400"
                                    style={{ width: `${barWidth}%` }}
                                  />
                                </div>
                                <div className="text-[9px] font-bold text-slate-400 mt-0.5">
                                  {predHabitState.totalCount} maçta {item.count} kez oynadı
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="text-xs sm:text-sm font-black text-sky-300">
                                %{item.pct}{' '}
                                <span className="text-[10.5px] text-white">({item.count}x)</span>
                              </div>
                              <div className="text-[9px] font-bold text-emerald-400">
                                Sezon İsabeti: {hitCountForScore}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. PUAN KADEMELERİ ANALİZ TABLOSU (12 - 6 - 5 - 4 - 3 - 2 - 1) */}
              <div className="bg-[#071329] border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-3.5 py-2.5 bg-[#040a18] border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-[11px] sm:text-xs font-black text-sky-200 uppercase tracking-wider">
                    🏅 KAÇ PUANLIK KAÇ MAÇ BİLDİ? (SATIRA TIKLAYINCA MAÇ KARTLARINI AÇAR)
                  </h3>
                  <span className="text-[9.5px] font-bold text-slate-400">
                    Toplam {dossier.totalSkor} İsabet
                  </span>
                </div>

                <div className="divide-y divide-slate-800/80 tabular-nums">
                  {TIERS.map((t) => {
                    const st = dossier.tierStats[t.pts];
                    const pct =
                      dossier.dfoPts + dossier.tffPts > 0
                        ? Math.round((st.totalPts / (dossier.dfoPts + dossier.tffPts)) * 100)
                        : 0;

                    return (
                      <button
                        key={t.pts}
                        type="button"
                        disabled={st.count === 0}
                        onClick={() => {
                          setTierFilter(t.pts);
                          setPoolFilter('ALL');
                          setWeekFilter('ALL');
                          setScoreFilter('ALL');
                          setActiveView('CARDS');
                        }}
                        className={`w-full px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 text-left transition-colors ${
                          st.count > 0
                            ? 'hover:bg-sky-900/25 cursor-pointer'
                            : 'opacity-45 cursor-default'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`px-2 py-0.5 rounded-md border text-[10px] sm:text-xs font-black shrink-0 ${t.badgeCls}`}
                          >
                            {t.short}
                          </span>
                          <div className="min-w-0">
                            <div className="text-[11px] sm:text-xs font-black text-white truncate">
                              {t.label}
                            </div>
                            <div className="text-[9.5px] font-bold text-slate-400">
                              DFO: <span className="text-sky-400">{st.dfoCount}</span> • TFF:{' '}
                              <span className="text-rose-400">{st.tffCount}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                          <div className="hidden sm:block w-28 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-gradient-to-r from-sky-500 to-emerald-400"
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>

                          <div className="text-right min-w-[92px] sm:min-w-[120px]">
                            <span className="text-xs sm:text-sm font-black text-white">
                              {st.count} Maç
                            </span>
                            <span className="mx-1 text-slate-500">→</span>
                            <span className="text-xs sm:text-sm font-black text-emerald-400">
                              {st.totalPts} P
                            </span>
                          </div>

                          <span className="text-sky-400 text-xs font-black">
                            {st.count > 0 ? 'Kartlar ↗' : '—'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. HAFTALIK SIRA VE PUAN SEYRİ */}
              {dossier.weeklyHistory.length > 0 && (
                <div className="bg-[#071329] border border-slate-800 rounded-2xl p-3.5">
                  <div className="text-[10.5px] sm:text-xs font-black text-sky-200 uppercase tracking-wider mb-2.5">
                    📉 HAFTALIK SIRA VE PUAN SEYRİ (HAFTAYA TIKLAYINCA O HAFTANIN BİLDİĞİ MAÇLARINI AÇAR)
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 tabular-nums">
                    {[...dossier.weeklyHistory].reverse().map((wh) => (
                      <button
                        key={wh.week}
                        type="button"
                        onClick={() => {
                          setWeekFilter(wh.week);
                          setTierFilter('ALL');
                          setPoolFilter('ALL');
                          setScoreFilter('ALL');
                          setActiveView('CARDS');
                        }}
                        className="shrink-0 bg-[#040a18] hover:bg-sky-950/60 border border-slate-800 hover:border-sky-400/60 rounded-xl px-2.5 py-2 text-center min-w-[68px] transition-colors cursor-pointer"
                      >
                        <div className="text-[9.5px] font-black text-sky-400">{wh.week}.H</div>
                        <div className="text-xs font-black text-white mt-0.5">#{wh.rankAfterWeek}</div>
                        <div className="text-[9.5px] font-bold text-emerald-400">+{wh.weekPts}P</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ===================== BİLDİĞİ MAÇ KARTLARI GÖRÜNÜMÜ ===================== */
            <div className="space-y-3">
              {/* FİLTRE ÇUBUĞU */}
              <div className="bg-[#071329] border border-slate-800 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTierFilter('ALL');
                      setScoreFilter('ALL');
                      setWeekFilter('ALL');
                      setPoolFilter('ALL');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[9.5px] sm:text-[10px] font-black uppercase border cursor-pointer ${
                      tierFilter === 'ALL' && scoreFilter === 'ALL' && weekFilter === 'ALL' && poolFilter === 'ALL'
                        ? 'bg-sky-600 text-white border-sky-300'
                        : 'bg-[#040a18] text-slate-300 border-slate-800 hover:text-white'
                    }`}
                  >
                    TÜMÜ ({dossier.wonMatches.length})
                  </button>
                  {TIERS.map((t) => {
                    const cnt = dossier.tierStats[t.pts].count;
                    if (cnt === 0) return null;
                    return (
                      <button
                        key={t.pts}
                        type="button"
                        onClick={() => setTierFilter(t.pts)}
                        className={`px-2.5 py-1 rounded-lg text-[9.5px] sm:text-[10px] font-black uppercase border cursor-pointer ${
                          tierFilter === t.pts
                            ? 'bg-amber-500 text-slate-950 border-amber-200'
                            : 'bg-[#040a18] text-slate-300 border-slate-800 hover:text-white'
                        }`}
                      >
                        {t.pts}P ({cnt})
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(['ALL', 'DFO', 'TFF'] as const).map((pf) => (
                    <button
                      key={pf}
                      type="button"
                      onClick={() => setPoolFilter(pf)}
                      className={`px-2 py-1 rounded-lg text-[9.5px] font-black uppercase border cursor-pointer ${
                        poolFilter === pf
                          ? pf === 'TFF'
                            ? 'bg-rose-700 text-white border-rose-400'
                            : 'bg-blue-700 text-white border-sky-400'
                          : 'bg-[#040a18] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {pf === 'ALL' ? 'DFO+TFF' : pf}
                    </button>
                  ))}

                  <select
                    value={scoreFilter}
                    onChange={(e) => setScoreFilter(e.target.value)}
                    className="bg-[#040a18] border border-emerald-500/50 text-emerald-300 text-[10px] font-black rounded-lg px-2 py-1 outline-none cursor-pointer"
                  >
                    <option value="ALL">Tüm Skorlar</option>
                    {wonDistinctScores.map((sc) => (
                      <option key={sc} value={sc}>
                        Skor: {sc} ({dossier.exactHitScoresMap[sc]?.count || 0})
                      </option>
                    ))}
                  </select>

                  <select
                    value={weekFilter}
                    onChange={(e) =>
                      setWeekFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
                    }
                    className="bg-[#040a18] border border-slate-700 text-white text-[10px] font-black rounded-lg px-2 py-1 outline-none cursor-pointer"
                  >
                    <option value="ALL">Tüm Haftalar</option>
                    {wonDistinctWeeks.map((w) => (
                      <option key={w} value={w}>
                        {w}. Hafta
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredCards.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-black uppercase tracking-widest">
                  SEÇİLEN FİLTREDE TAM İSABET MAÇ KARTI BULUNAMADI
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredCards.map((m) => {
                    const rawCat = String(
                      m.category && m.category !== 'GENEL'
                        ? m.category
                        : m.isTff
                        ? 'TÜRKİYE SÜPER LİG'
                        : 'AVRUPA FUTBOLU'
                    );
                    const theme: any = getEliteTheme(
                      m.isTff && !normKey(rawCat).includes('TURKIYE') ? `TÜRKİYE ${rawCat}` : rawCat,
                      String(m.home_team || '').toUpperCase(),
                      String(m.away_team || '').toUpperCase()
                    );

                    const cardCls = m.isTff
                      ? 'bg-gradient-to-b from-[#4c0714] via-[#2b040c] to-[#140205] border-rose-500/70'
                      : 'bg-gradient-to-b from-[#0a1933] via-[#071124] to-[#040914] border-sky-500/45';

                    return (
                      <div
                        key={`${m.week_num}-${m.match_index}`}
                        className={`rounded-2xl border p-3.5 flex flex-col gap-2.5 shadow-lg ${cardCls}`}
                      >
                        <div className="flex items-center justify-between gap-2 text-[9.5px] sm:text-[10px] font-black uppercase">
                          <span className="text-slate-300">
                            {m.week_num}. HAFTA {m.match_index}. MAÇ
                            {m.match_date ? ` • ${m.match_date}` : ''}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full border ${
                              m.ptsEarned === 12
                                ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                                : 'bg-emerald-500 text-slate-950 border-emerald-200'
                            }`}
                          >
                            {m.ptsEarned === 12
                              ? '🎯 +12 PUAN (TEK BAŞINA!)'
                              : `+${m.ptsEarned} PUAN (${m.winnerCount} KİŞİ)`}
                          </span>
                        </div>

                        <div className="text-center text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider py-1 px-2 rounded-lg bg-black/35 border border-white/10 text-sky-100 truncate">
                          {rawCat.toUpperCase()}
                        </div>

                        <div className="grid grid-cols-3 items-center gap-2 py-1">
                          <div className="flex flex-col items-center gap-1.5 min-w-0">
                            <img
                              src={theme.homeLogo}
                              alt={m.home_team}
                              className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow"
                              loading="lazy"
                            />
                            <span className="text-[10px] sm:text-[11px] font-black text-white uppercase text-center leading-tight line-clamp-2">
                              {m.home_team}
                            </span>
                          </div>

                          <div className="flex flex-col items-center justify-center gap-1">
                            <span className="text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300">
                              {m.isLiveActive ? '🔴 CANLI İSABET' : 'MS (TAM İSABET)'}
                            </span>
                            <div className="px-3 py-1.5 rounded-xl bg-black/65 border border-white/15 text-white text-base sm:text-lg font-black tabular-nums">
                              {m.home_score} : {m.away_score}
                            </div>
                            <span
                              className={`text-[8.5px] font-black px-2 py-0.5 rounded border ${
                                m.isTff
                                  ? 'bg-rose-950 text-rose-200 border-rose-500/60'
                                  : 'bg-sky-950 text-sky-200 border-sky-500/60'
                              }`}
                            >
                              {m.isTff ? 'TFF' : 'DFO'}
                            </span>
                          </div>

                          <div className="flex flex-col items-center gap-1.5 min-w-0">
                            <img
                              src={theme.awayLogo}
                              alt={m.away_team}
                              className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow"
                              loading="lazy"
                            />
                            <span className="text-[10px] sm:text-[11px] font-black text-white uppercase text-center leading-tight line-clamp-2">
                              {m.away_team}
                            </span>
                          </div>
                        </div>

                        {m.coWinnerNames.length > 0 ? (
                          <div className="pt-1.5 border-t border-white/10 text-[9.5px] text-slate-300 leading-snug">
                            <span className="font-black text-sky-300">Birlikte Bilenler: </span>
                            {m.coWinnerNames.join(', ')}
                          </div>
                        ) : (
                          <div className="pt-1.5 border-t border-amber-400/25 text-[9.5px] font-black text-amber-300 text-center uppercase tracking-wider">
                            ★ Tüm Yarışmacılar Arasında Sadece {dossier.cleanName} Bildi!
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}