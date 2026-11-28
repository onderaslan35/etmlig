'use client';

import React, { useMemo, useState, useEffect, useId, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { getEliteTheme, getMatchTimeMs } from '@/utils/themeEngine';
import { getClubLogoUrl, isNationalTeamName } from '@/components/FavoriteTeamSelector';
import { readPortalSession } from '@/components/PortalAuthGate';

export interface DossierMatchItem {
  id?: string | number;
  week_num: number;
  match_index: number;
  category?: string | null;
  pool_type?: string | null;
  match_date?: string | null;
  match_time?: string | null;
  home_team: string;
  away_team: string;
  home_score?: string | number | null;
  away_score?: string | number | null;
  status?: string | null;
  winner_ids?: string[] | null;
  points_awarded?: number | null;
  isLiveActive?: boolean;
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
  weeksBonus?: DossierWeekBonusItem[];
  seasonLabel?: string;
}

interface MissingOpenMatch {
  weekNum: number;
  matchIndex: number;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  matchTime: string;
}

interface FinishedRecentMatch {
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
}

interface ZirveStint {
  start: number;
  end: number;
  count: number;
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

const checkIsTff = (poolType?: string | null, category?: string | null, home?: string, away?: string) => {
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
      className="inline-flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 shrink-0 drop-shadow-[0_3px_8px_rgba(0,0,0,0.8)]"
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
  const router = useRouter();
  const cardsSectionRef = useRef<HTMLDivElement | null>(null);

  const [missingOpenExpanded, setMissingOpenExpanded] = useState(false);
  const [recentFinishedOpen, setRecentFinishedOpen] = useState(false);
  const [wonCardsOpen, setWonCardsOpen] = useState(false);

  const [tierFilter, setTierFilter] = useState<number | 'ALL'>('ALL');
  const [poolFilter, setPoolFilter] = useState<'ALL' | 'DFO' | 'TFF'>('ALL');
  const [weekFilter, setWeekFilter] = useState<number | 'ALL'>('ALL');
  const [scoreFilter, setScoreFilter] = useState<string | 'ALL'>('ALL');

  const [activityLoading, setActivityLoading] = useState(false);
  const [rawUserPreds, setRawUserPreds] = useState<
    Array<{ week_num: number; match_index: number; predicted_score: string }>
  >([]);
  const [bulletinRows, setBulletinRows] = useState<
    Array<{
      week_num: number;
      match_index: number;
      category: string;
      match_date: string;
      match_time: string;
      home_team: string;
      away_team: string;
    }>
  >([]);
  const [liveStatusSet, setLiveStatusSet] = useState<Set<string>>(new Set());

  const viewerSession = useMemo(() => {
    if (!playerId) return null;
    try {
      return readPortalSession();
    } catch {
      return null;
    }
  }, [playerId]);

  const isViewingOwnProfile = Boolean(
    viewerSession?.role === 'player' &&
      viewerSession.userId &&
      playerId &&
      String(viewerSession.userId).trim() === String(playerId).trim()
  );

  useEffect(() => {
    setTierFilter('ALL');
    setPoolFilter('ALL');
    setWeekFilter('ALL');
    setScoreFilter('ALL');
    setMissingOpenExpanded(false);
    setRecentFinishedOpen(false);
    setWonCardsOpen(false);

    if (!playerId) {
      setRawUserPreds([]);
      return;
    }

    const pid = String(playerId).trim();
    let active = true;
    setActivityLoading(true);

    (async () => {
      try {
        let allRows: { week_num: number; match_index: number; predicted_score: string }[] = [];
        let from = 0;
        const step = 1000;
        let keepGoing = true;

        while (keepGoing) {
          const { data, error } = await supabase
            .from('player_predictions')
            .select('week_num, match_index, predicted_score')
            .eq('user_id', pid)
            .order('week_num', { ascending: false })
            .order('match_index', { ascending: false })
            .range(from, from + step - 1);

          if (error || !data || data.length === 0) {
            keepGoing = false;
          } else {
            allRows = [...allRows, ...(data as any[])];
            if (data.length < step) keepGoing = false;
            else from += step;
          }
        }

        const [bulRes, liveRes] = await Promise.all([
          supabase
            .from('matches_bulletin')
            .select('week_num, match_index, category, match_date, match_time, home_team, away_team')
            .gte('week_num', 41)
            .order('week_num', { ascending: true })
            .order('match_index', { ascending: true })
            .limit(400),
          supabase.from('live_matches').select('id, status').limit(300)
        ]);

        if (!active) return;

        const closedLive = new Set<string>();
        (liveRes.data || []).forEach((lm: any) => {
          const st = String(lm.status || '').toUpperCase();
          if (['LIVE', '1H', '2H', 'HT', 'FINISHED', 'FT', 'WAITING_APPROVAL', 'POSTPONED', 'PST'].includes(st)) {
            const w = Math.floor(Number(lm.id) / 100);
            const idx = Number(lm.id) % 100;
            closedLive.add(`${w}-${idx}`);
          }
        });

        setRawUserPreds(allRows);
        setBulletinRows((bulRes.data || []) as any[]);
        setLiveStatusSet(closedLive);
      } finally {
        if (active) setActivityLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [playerId]);

  const openCardsAndScroll = (opts?: {
    tier?: number | 'ALL';
    pool?: 'ALL' | 'DFO' | 'TFF';
    week?: number | 'ALL';
    score?: string | 'ALL';
  }) => {
    if (opts?.tier !== undefined) setTierFilter(opts.tier);
    if (opts?.pool !== undefined) setPoolFilter(opts.pool);
    if (opts?.week !== undefined) setWeekFilter(opts.week);
    if (opts?.score !== undefined) setScoreFilter(opts.score);
    setWonCardsOpen(true);
    setTimeout(() => {
      cardsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 90);
  };

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
    const officialLookup: Record<string, DossierMatchItem> = {};
    matches.forEach((m) => {
      const w = Number(m.week_num);
      const idx = Number(m.match_index);
      officialLookup[`${w}-${idx}`] = m;
      if (m.status !== 'FINISHED' && !m.isLiveActive) return;
      if (!weeksMap[w]) weeksMap[w] = [];
      weeksMap[w].push(m);
    });

    const bonusByWeek: Record<number, DossierWeekBonusItem> = {};
    weeksBonus.forEach((wb) => {
      bonusByWeek[Number(wb.week_num)] = wb;
    });

    // Son yayınlanan bültende henüz sonuçlanmamış maç var mı kontrolü (devam eden hafta bitmeden zirve haftası yazmamak için)
    let maxBulletinWeek = 0;
    bulletinRows.forEach((b) => {
      const w = Number(b.week_num);
      if (w > maxBulletinWeek) maxBulletinWeek = w;
    });
    const hasUnfinishedInMaxBulletin =
      maxBulletinWeek > 0 &&
      bulletinRows.some((b) => {
        if (Number(b.week_num) !== maxBulletinWeek) return false;
        const off = officialLookup[`${maxBulletinWeek}-${Number(b.match_index)}`];
        return !off || (off.status !== 'FINISHED' && off.status !== 'POSTPONED');
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
      isCompletedBulletin: boolean;
    }[] = [];

    let bestRank: number | null = null;
    let bestRankWeeks: number[] = [];
    let worstRank: number | null = null;
    let worstRankWeek: number | null = null;
    const zirveWeeks: number[] = [];
    let lastCompletedBulletinWeek = 0;

    sortedWeeks.forEach((wn) => {
      const wList = weeksMap[wn] || [];
      let playerWeekPts = 0;
      let playerWeekSkor = 0;
      let finishedCountInThisWeek = 0;

      wList.forEach((m) => {
        if (m.status === 'FINISHED') finishedCountInThisWeek += 1;

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
      const rk = rankIdx >= 0 ? rankIdx + 1 : allPlayerIds.length;

      const isOngoingIncompleteWeek =
        finishedCountInThisWeek === 0 ||
        (wn === maxBulletinWeek &&
          hasUnfinishedInMaxBulletin &&
          bonusByWeek[wn]?.is_completed !== true);

      const isCompletedBulletin = !isOngoingIncompleteWeek;

      if (isCompletedBulletin) {
        lastCompletedBulletinWeek = Math.max(lastCompletedBulletinWeek, wn);

        if (bestRank === null || rk < bestRank) {
          bestRank = rk;
          bestRankWeeks = [wn];
        } else if (rk === bestRank) {
          bestRankWeeks.push(wn);
        }

        if (worstRank === null || rk >= worstRank) {
          worstRank = rk;
          worstRankWeek = wn;
        }

        if (rk === 1) {
          zirveWeeks.push(wn);
        }
      }

      weeklyHistory.push({
        week: wn,
        weekPts: playerWeekPts,
        weekSkor: playerWeekSkor,
        rankAfterWeek: rk,
        cumMaster: runningMaster[pid]?.pts || 0,
        isCompletedBulletin
      });
    });

    // MASTER ZİRVE DÖNEMLERİ (STINTS) VE AKTİF ZİRVE SERİSİ HESABI
    const zirveStints: ZirveStint[] = [];
    zirveWeeks.forEach((w) => {
      const prev = zirveStints[zirveStints.length - 1];
      if (prev && w === prev.end + 1) {
        prev.end = w;
        prev.count += 1;
      } else {
        zirveStints.push({ start: w, end: w, count: 1 });
      }
    });

    const longestZirveStint =
      zirveStints.length > 0
        ? [...zirveStints].sort((a, b) => b.count - a.count || b.end - a.end)[0]
        : null;

    const lastStint = zirveStints.length > 0 ? zirveStints[zirveStints.length - 1] : null;
    const activeZirveStreak =
      lastStint && lastCompletedBulletinWeek > 0 && lastStint.end === lastCompletedBulletinWeek
        ? lastStint.count
        : 0;
    const activeZirveStartWeek =
      activeZirveStreak > 0 && lastStint ? lastStint.start : null;

    wonMatches.sort(
      (a, b) => Number(b.week_num) - Number(a.week_num) || Number(b.match_index) - Number(a.match_index)
    );

    const lastWonMatch = wonMatches.length > 0 ? wonMatches[0] : null;

    const exactHitScoresRanked = Object.values(exactHitScoresMap).sort(
      (a, b) => b.count - a.count || b.totalPts - a.totalPts || a.score.localeCompare(b.score)
    );

    const currentRank =
      weeklyHistory.length > 0 ? weeklyHistory[weeklyHistory.length - 1].rankAfterWeek : 1;

    if (bestRank === null) {
      bestRank = currentRank;
    }

    const bestWeekObj =
      weeklyHistory.length > 0
        ? [...weeklyHistory].sort((a, b) => b.weekPts - a.weekPts || b.weekSkor - a.weekSkor)[0]
        : null;

    const totalMaster = dfoPts + tffPts + bonusPts;
    const totalSkor = dfoSkor + tffSkor;
    const totalFinishedMatchesCount = matches.filter(
      (m) => m.status === 'FINISHED' || m.isLiveActive
    ).length;
    const hitRate =
      totalFinishedMatchesCount > 0
        ? ((totalSkor / totalFinishedMatchesCount) * 100).toFixed(1)
        : '0.0';
    const avgPtsPerHit = totalSkor > 0 ? ((dfoPts + tffPts) / totalSkor).toFixed(2) : '0.00';

    const matchCountPerWeek: Record<number, number> = {};
    let maxLeagueWeek = sortedWeeks.length > 0 ? sortedWeeks[sortedWeeks.length - 1] : 0;

    matches.forEach((m) => {
      const w = Number(m.week_num);
      const idx = Number(m.match_index);
      matchCountPerWeek[w] = Math.max(matchCountPerWeek[w] || 0, idx);
      if (w > maxLeagueWeek) maxLeagueWeek = w;
    });
    bulletinRows.forEach((b) => {
      const w = Number(b.week_num);
      const idx = Number(b.match_index);
      matchCountPerWeek[w] = Math.max(matchCountPerWeek[w] || 0, idx);
      if (w > maxLeagueWeek) maxLeagueWeek = w;
    });

    const predFreqMap: Record<string, number> = {};
    let totalPredCount = 0;
    const validPredByWeek: Record<number, Array<{ matchIndex: number; score: string }>> = {};
    const validPredKeySet = new Set<string>();

    rawUserPreds.forEach((r) => {
      const normSc = normalizeScoreText(r.predicted_score);
      if (!normSc) return;
      const wn = Number(r.week_num);
      const idx = Number(r.match_index);
      const k = `${wn}-${idx}`;
      if (validPredKeySet.has(k)) return;
      validPredKeySet.add(k);

      if (!validPredByWeek[wn]) validPredByWeek[wn] = [];
      validPredByWeek[wn].push({ matchIndex: idx, score: normSc });

      const offM = officialLookup[k];
      if (offM && offM.status === 'FINISHED') {
        totalPredCount += 1;
        predFreqMap[normSc] = (predFreqMap[normSc] || 0) + 1;
      }
    });

    const predictedScoresRanked = Object.entries(predFreqMap)
      .map(([score, count]) => ({
        score,
        count,
        pct: totalPredCount > 0 ? ((count / totalPredCount) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.count - a.count || a.score.localeCompare(b.score));

    const predictedWeeksDesc = Object.keys(validPredByWeek)
      .map(Number)
      .filter((w) => validPredByWeek[w].length > 0)
      .sort((a, b) => b - a);

    const wonWeeksFallback = Array.from(new Set(wonMatches.map((m) => Number(m.week_num)))).sort(
      (a, b) => b - a
    );

    const lastPlayedWeek: number | null =
      predictedWeeksDesc.length > 0
        ? predictedWeeksDesc[0]
        : wonWeeksFallback.length > 0
        ? wonWeeksFallback[0]
        : null;

    const lastWeekTotalMatches =
      lastPlayedWeek !== null ? matchCountPerWeek[lastPlayedWeek] || 24 : 24;
    const lastWeekFilledCount =
      lastPlayedWeek !== null && validPredByWeek[lastPlayedWeek]
        ? validPredByWeek[lastPlayedWeek].length
        : null;

    const missedWeeksAfterLast =
      lastPlayedWeek !== null && maxLeagueWeek > lastPlayedWeek
        ? maxLeagueWeek - lastPlayedWeek
        : 0;

    const nowPlusBuf = Date.now() + 60000;
    const missingOpenMatches: MissingOpenMatch[] = [];
    bulletinRows.forEach((b) => {
      const wn = Number(b.week_num);
      const idx = Number(b.match_index);
      const k = `${wn}-${idx}`;
      if (validPredKeySet.has(k)) return;
      if (liveStatusSet.has(k)) return;
      const offM = officialLookup[k];
      if (offM && (offM.status === 'FINISHED' || offM.status === 'POSTPONED')) return;

      const kMs = getMatchTimeMs(String(b.match_date || ''), String(b.match_time || ''));
      if (kMs > nowPlusBuf) {
        missingOpenMatches.push({
          weekNum: wn,
          matchIndex: idx,
          homeTeam: b.home_team,
          awayTeam: b.away_team,
          matchDate: b.match_date || '',
          matchTime: b.match_time || ''
        });
      }
    });

    missingOpenMatches.sort((a, b) => a.weekNum - b.weekNum || a.matchIndex - b.matchIndex);
    const missingByWeekCounts: Record<number, number> = {};
    missingOpenMatches.forEach((mm) => {
      missingByWeekCounts[mm.weekNum] = (missingByWeekCounts[mm.weekNum] || 0) + 1;
    });
    const missingWeeksSummary = Object.keys(missingByWeekCounts)
      .map((w) => `${w}. Haftada ${missingByWeekCounts[Number(w)]} açık maç`)
      .join(' • ');

    const finishedRecentList: FinishedRecentMatch[] = [];
    predictedWeeksDesc.forEach((wn) => {
      const arr = [...(validPredByWeek[wn] || [])].sort((a, b) => b.matchIndex - a.matchIndex);
      arr.forEach((ent) => {
        const offM = officialLookup[`${wn}-${ent.matchIndex}`];
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
        const actualSc = normalizeScoreText(`${offM.home_score}-${offM.away_score}`);
        const winners = (offM.winner_ids || [])
          .map((x) => String(x).trim())
          .filter((x) => x && x !== 'mankoman');
        const isHit = Boolean(winners.includes(pid) || (actualSc && actualSc === ent.score));
        const pts = isHit
          ? offM.points_awarded !== null && offM.points_awarded !== undefined && Number(offM.points_awarded) > 0
            ? Number(offM.points_awarded)
            : calcPtsByWinners(winners.length)
          : 0;

        finishedRecentList.push({
          weekNum: wn,
          matchIndex: ent.matchIndex,
          homeTeam: offM.home_team,
          awayTeam: offM.away_team,
          matchDate: String(offM.match_date || ''),
          matchTime: String(offM.match_time || ''),
          predictedScore: ent.score,
          actualScore: actualSc || `${offM.home_score}-${offM.away_score}`,
          isExactHit: isHit,
          pointsEarned: pts,
          isTff: checkIsTff(offM.pool_type, offM.category, offM.home_team, offM.away_team)
        });
      });
    });

    const recentFiveFinished: FinishedRecentMatch[] =
      finishedRecentList.length > 0
        ? finishedRecentList.slice(0, 5)
        : wonMatches.slice(0, 5).map((wm) => ({
            weekNum: Number(wm.week_num),
            matchIndex: Number(wm.match_index),
            homeTeam: wm.home_team,
            awayTeam: wm.away_team,
            matchDate: String(wm.match_date || ''),
            matchTime: String(wm.match_time || ''),
            predictedScore: wm.scoreStr,
            actualScore: wm.scoreStr,
            isExactHit: true,
            pointsEarned: wm.ptsEarned,
            isTff: wm.isTff
          }));

    const formatBestWeeksText = (wks: number[]) => {
      if (wks.length === 0) return 'Sezon derecesi';
      if (wks.length === 1) return `${wks[0]}. Hafta`;
      if (wks.length <= 3) return `${wks.join(', ')}. Hafta`;
      return `İlk: ${wks[0]}.H • Son: ${wks[wks.length - 1]}.H`;
    };

    const formatShortWeekList = (wks: number[], fallback: string) => {
      if (wks.length === 0) return fallback;
      if (wks.length <= 4) return `${wks.join(', ')}. Hafta`;
      return `${wks.slice(0, 3).join(', ')}... (${wks[wks.length - 1]}.H)`;
    };

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
      puanLiderSubText: formatShortWeekList(puanLiderWeeks, 'Hafta Puan Lideri'),
      skorKralSubText: formatShortWeekList(skorKralWeeks, 'Hafta Skor Kralı'),
      tierStats,
      exactHitScoresMap,
      exactHitScoresRanked,
      predictedScoresRanked,
      totalPredCount,
      wonMatches,
      lastWonMatch,
      weeklyHistory,
      bestRank,
      bestRankWeeksText: formatBestWeeksText(bestRankWeeks),
      zirveWeeks,
      zirveStints,
      longestZirveStint,
      activeZirveStreak,
      activeZirveStartWeek,
      lastCompletedBulletinWeek,
      worstRank,
      worstRankWeek,
      currentRank,
      bestWeekObj,
      hitRate,
      avgPtsPerHit,
      lastPlayedWeek,
      lastWeekTotalMatches,
      lastWeekFilledCount,
      missedWeeksAfterLast,
      missingOpenMatches,
      missingWeeksSummary,
      recentFiveFinished
    };
  }, [playerId, playersDirectory, matches, weeksBonus, rawUserPreds, bulletinRows, liveStatusSet]);

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
  const hasEverReachedZirve = dossier.zirveWeeks.length > 0 || dossier.bestRank === 1;

  return (
    <div
      className="fixed inset-0 z-[180] bg-black/85 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-gradient-to-b from-[#091733] via-[#061024] to-[#040914] border border-blue-500/45 rounded-3xl shadow-[0_24px_70px_rgba(0,0,0,0.92)] overflow-hidden my-2 sm:my-5 flex flex-col max-h-[93vh] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===================== ÜST BAŞLIK: SOL SÜTUN SEZON+ARMA | SAĞ SÜTUN GÜNCEL SIRA | ALTTA TAM İSİM & 5'Lİ ŞERİT ===================== */}
        <div className="bg-gradient-to-r from-[#0c214a] via-[#091838] to-[#071229] border-b border-slate-700/80 px-3.5 py-3 sm:px-6 sm:py-4 shrink-0 space-y-2.5">
          {/* 1. SATIR: SOL SÜTUN (ARMA + SEZON) ve SAĞ SÜTUN (GÜNCEL SIRA + KAPAT) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {dossier.clubLogo && (
                <img
                  src={dossier.clubLogo}
                  alt={dossier.favTeam}
                  className="w-11 h-11 sm:w-14 sm:h-14 object-contain shrink-0 drop-shadow-[0_4px_10px_rgba(0,0,0,0.75)]"
                />
              )}
              <div className="min-w-0">
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-sky-300 leading-tight">
                  {seasonLabel}
                </div>
                <div className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-slate-300 leading-tight">
                  ANALİZİ
                </div>
                {dossier.champInfo.stars > 0 && (
                  <span className="mt-1 inline-block px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/60 text-amber-300 text-[9px] font-black uppercase">
                    {dossier.champInfo.stars}x ŞAMPİYON
                    {dossier.champInfo.reigning ? ' • SON ŞAMPİYON' : ''}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div
                className={`rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 text-center border-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] ${
                  dossier.currentRank === 1
                    ? 'bg-gradient-to-b from-amber-500/25 via-[#173b96] to-[#0e2460] border-amber-400'
                    : 'bg-gradient-to-b from-[#173b96] to-[#0e2460] border-sky-400/75'
                }`}
              >
                <div className="text-[8.5px] sm:text-[10px] font-black uppercase tracking-widest text-sky-200 leading-none mb-0.5">
                  GÜNCEL SIRA
                </div>
                <div className="text-lg sm:text-2xl font-black text-white leading-none tabular-nums">
                  {dossier.currentRank}.{' '}
                  <span className="text-[11px] sm:text-sm text-sky-200">
                    {dossier.currentRank === 1 ? 'ZİRVE' : 'SIRA'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-950/75 hover:bg-rose-600 border border-rose-500/50 text-white text-sm font-black flex items-center justify-center cursor-pointer transition-colors shrink-0"
                title="Kapat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 2. SATIR: TAM GENİŞLİKTE KESİLMEYEN YARIŞMACI İSMİ (OSMAN ALİ AYDIN / DOĞAÇ ALKAN TAM GÖRÜNÜR) */}
          <div className="flex items-center gap-2 pt-0.5">
            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wide text-white leading-snug break-words">
              {dossier.cleanName}
            </h2>
            <ModalCupCrest name={dossier.cleanName} />
          </div>

          {/* 3. SATIR: TAM GENİŞLİKTE YAN YANA 5 EŞİT PUAN SÜTUNU */}
          <div className="grid grid-cols-5 gap-1.5 text-center tabular-nums pt-0.5">
            <div className="rounded-xl bg-[#15368a] border border-blue-400/65 py-1.5 px-1 shadow">
              <div className="text-[8.5px] sm:text-[10px] font-black text-blue-100 uppercase leading-none">
                MASTER
              </div>
              <div className="text-xs sm:text-base font-black text-white mt-0.5 leading-none">
                {dossier.totalMaster} P
              </div>
            </div>

            <div className="rounded-xl bg-sky-950/85 border border-sky-500/45 py-1.5 px-1">
              <div className="text-[8.5px] sm:text-[10px] font-black text-sky-300 uppercase leading-none">
                DFO
              </div>
              <div className="text-xs sm:text-base font-black text-white mt-0.5 leading-none">
                {dossier.dfoPts}
              </div>
            </div>

            <div className="rounded-xl bg-rose-950/85 border border-rose-500/45 py-1.5 px-1">
              <div className="text-[8.5px] sm:text-[10px] font-black text-rose-300 uppercase leading-none">
                TFF
              </div>
              <div className="text-xs sm:text-base font-black text-white mt-0.5 leading-none">
                {dossier.tffPts}
              </div>
            </div>

            <div className="rounded-xl bg-emerald-950/85 border border-emerald-500/45 py-1.5 px-1">
              <div className="text-[8.5px] sm:text-[10px] font-black text-emerald-300 uppercase leading-none">
                BONUS
              </div>
              <div className="text-xs sm:text-base font-black text-emerald-300 mt-0.5 leading-none">
                +{dossier.bonusPts}
              </div>
            </div>

            <div className="rounded-xl bg-orange-950/85 border border-orange-500/45 py-1.5 px-1">
              <div className="text-[8.5px] sm:text-[10px] font-black text-orange-300 uppercase leading-none">
                SKOR
              </div>
              <div className="text-xs sm:text-base font-black text-orange-300 mt-0.5 leading-none">
                {dossier.totalSkor}
              </div>
            </div>
          </div>
        </div>

        {/* ===================== KAYDIRILABİLİR ANA İSTATİSTİK GÖVDESİ ===================== */}
        <div className="p-3 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
          {/* 1. ÖZEL MASTER ZİRVE KARNESİ (1 HAFTA BİLE BÜLTENİ ZİRVEDE TAMAMLAYAN OYUNCULARDA İLK SIRADA ÇIKAR) */}
          {dossier.zirveWeeks.length > 0 && (
            <div className="rounded-2xl bg-gradient-to-br from-amber-500/15 via-[#0c214a] to-[#050c1d] border-2 border-amber-400/75 p-3 sm:p-4 shadow-[0_10px_30px_rgba(245,158,11,0.18)] space-y-2.5 tabular-nums">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-300">
                  <span>👑</span>
                  <span>MASTER ZİRVE KARNESİ</span>
                </div>

                {dossier.activeZirveStreak > 1 ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wide shadow">
                    🔥 SON {dossier.activeZirveStreak} HAFTADIR ZİRVEDE
                  </span>
                ) : dossier.activeZirveStreak === 1 ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wide shadow">
                    🔥 GÜNCEL ZİRVE LİDERİ
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-950/90 border border-amber-400/60 text-amber-200 text-[9.5px] font-black uppercase">
                    🏆 ZİRVE KULÜBÜ ({dossier.zirveWeeks.length} HAFTA)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl bg-[#040a18]/90 border border-amber-400/40 p-2.5 text-center">
                  <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-300">
                    TOPLAM ZİRVE SÜRESİ
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-white mt-0.5">
                    {dossier.zirveWeeks.length} HAFTA
                  </div>
                  <div className="text-[9.5px] font-bold text-slate-300 mt-0.5">
                    Master 1. Sıra Liderliği
                  </div>
                </div>

                <div className="rounded-xl bg-[#040a18]/90 border border-sky-400/40 p-2.5 text-center">
                  {dossier.activeZirveStreak > 0 ? (
                    <>
                      <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-300">
                        KESİNTİSİZ AKTİF SERİ
                      </div>
                      <div className="text-lg sm:text-2xl font-black text-emerald-300 mt-0.5">
                        SON {dossier.activeZirveStreak} HFT
                      </div>
                      <div className="text-[9.5px] font-bold text-slate-300 mt-0.5">
                        {dossier.activeZirveStreak > 1
                          ? `${dossier.activeZirveStartWeek}.H - ${dossier.lastCompletedBulletinWeek}.H Aralıksız`
                          : `${dossier.lastCompletedBulletinWeek}. Hafta Lideri`}
                      </div>
                    </>
                  ) : dossier.zirveWeeks.length === 1 ? (
                    <>
                      <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-sky-300">
                        ZİRVE HAFTASI
                      </div>
                      <div className="text-lg sm:text-2xl font-black text-sky-300 mt-0.5">
                        {dossier.zirveWeeks[0]}. HAFTA
                      </div>
                      <div className="text-[9.5px] font-bold text-slate-300 mt-0.5">
                        Bülteni Zirvede Tamamladı
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-sky-300">
                        EN UZUN SERİ
                      </div>
                      <div className="text-lg sm:text-2xl font-black text-sky-300 mt-0.5">
                        {dossier.longestZirveStint?.count || 1} HAFTA
                      </div>
                      <div className="text-[9.5px] font-bold text-slate-300 mt-0.5">
                        {dossier.longestZirveStint
                          ? `${dossier.longestZirveStint.start}.H - ${dossier.longestZirveStint.end}.H Aralıksız`
                          : 'Aralıksız Zirve'}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[9.5px] font-black uppercase text-amber-200/90">
                  Zirve Dönemleri:
                </span>
                {dossier.zirveStints.map((st, idx) => (
                  <span
                    key={`st-${st.start}-${st.end}-${idx}`}
                    className="px-2 py-0.5 rounded-lg bg-[#040a18] border border-amber-400/45 text-[10px] font-black text-white"
                  >
                    {st.start === st.end
                      ? `${st.start}. Hafta (1 Hft)`
                      : `${st.start}-${st.end}.H (${st.count} Hft)`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 2. SİMETRİK 2 SÜTUNLU (SOL | SAĞ) 8 ANA İSTATİSTİK KARTI (TEK SATIRA YAYILMA YOK) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 tabular-nums">
            {/* KUTU 1: EN YÜKSEK SIRA (1. SIRA İSE ALTINDA ÖZEL ZİRVE YAZAR) */}
            <div
              className={`rounded-2xl p-3 text-center border ${
                hasEverReachedZirve
                  ? 'bg-gradient-to-b from-amber-950/35 to-[#050c1d] border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                  : 'bg-[#050c1d] border-amber-400/45'
              }`}
            >
              <div className="text-[9.5px] font-black uppercase tracking-wider text-amber-300">
                EN YÜKSEK SIRA
              </div>
              <div className="text-lg sm:text-2xl font-black text-white mt-0.5">
                {dossier.bestRank}. SIRA
              </div>
              <div className="text-[10px] font-extrabold text-amber-300 mt-0.5">
                {hasEverReachedZirve
                  ? `👑 ZİRVE (${dossier.zirveWeeks.length || 1} Hafta)`
                  : `🏆 ${dossier.bestRankWeeksText}`}
              </div>
            </div>

            {/* KUTU 2: EN DÜŞÜK SIRA */}
            <div className="rounded-2xl bg-[#050c1d] border border-rose-500/40 p-3 text-center">
              <div className="text-[9.5px] font-black uppercase tracking-wider text-rose-400">
                EN DÜŞÜK SIRA
              </div>
              <div className="text-lg sm:text-2xl font-black text-white mt-0.5">
                {dossier.worstRank ? `${dossier.worstRank}. SIRA` : '-'}
              </div>
              <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                {dossier.worstRankWeek ? `${dossier.worstRankWeek}. Hafta tabanı` : 'Sezon tabanı'}
              </div>
            </div>

            {/* KUTU 3: MASTER TOPLAM */}
            <div className="rounded-2xl bg-[#050c1d] border border-blue-400/45 p-3 text-center">
              <div className="text-[9.5px] font-black uppercase tracking-wider text-sky-300">
                MASTER TOPLAM
              </div>
              <div className="text-lg sm:text-2xl font-black text-white mt-0.5">
                {dossier.totalMaster} P
              </div>
              <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                Ort: {dossier.avgPtsPerHit} P/maç
              </div>
            </div>

            {/* KUTU 4: TAM SKOR İSABETİ */}
            <div className="rounded-2xl bg-[#050c1d] border border-orange-400/45 p-3 text-center">
              <div className="text-[9.5px] font-black uppercase tracking-wider text-orange-300">
                TAM SKOR İSABETİ
              </div>
              <div className="text-lg sm:text-2xl font-black text-orange-400 mt-0.5">
                {dossier.totalSkor} MAÇ
              </div>
              <div className="text-[10px] font-bold text-slate-300 mt-0.5">
                DFO {dossier.dfoSkor} • TFF {dossier.tffSkor} (%{dossier.hitRate})
              </div>
            </div>

            {/* KUTU 5: REKOR HAFTASI */}
            <div className="rounded-2xl bg-[#050c1d] border border-amber-500/40 p-3 text-center">
              <div className="text-[9.5px] font-black uppercase tracking-wider text-amber-300">
                REKOR HAFTASI
              </div>
              <div className="text-lg sm:text-2xl font-black text-white mt-0.5">
                {dossier.bestWeekObj && dossier.bestWeekObj.weekPts > 0
                  ? `${dossier.bestWeekObj.weekPts} PUAN`
                  : '-'}
              </div>
              <div className="text-[10px] font-bold text-slate-300 mt-0.5">
                {dossier.bestWeekObj && dossier.bestWeekObj.weekPts > 0
                  ? `${dossier.bestWeekObj.week}. Hafta (${dossier.bestWeekObj.weekSkor} skor)`
                  : 'Henüz kayıt yok'}
              </div>
            </div>

            {/* KUTU 6: EN SON KATILDIĞI BÜLTEN */}
            <div className="rounded-2xl bg-[#050c1d] border border-emerald-400/45 p-3 text-center">
              <div className="text-[9.5px] font-black uppercase tracking-wider text-emerald-300">
                SON AKTİF BÜLTEN
              </div>
              <div className="text-lg sm:text-2xl font-black text-emerald-300 mt-0.5">
                {dossier.lastPlayedWeek ? `${dossier.lastPlayedWeek}. HAFTA` : 'YOK'}
              </div>
              <div className="text-[10px] font-extrabold text-slate-200 mt-0.5">
                {dossier.lastPlayedWeek
                  ? dossier.lastWeekFilledCount !== null
                    ? `${dossier.lastWeekTotalMatches}'te ${dossier.lastWeekFilledCount} Maç`
                    : 'Arşiv Kaydı'
                  : 'Tahmin Yok'}
              </div>
            </div>

            {/* KUTU 7: HAFTALIK PUAN LİDERLİĞİ */}
            <div className="rounded-2xl bg-[#050c1d] border border-sky-500/40 p-3 text-center">
              <div className="text-[9.5px] font-black uppercase tracking-wider text-sky-300">
                PUAN LİDERLİĞİ
              </div>
              <div className="text-lg sm:text-2xl font-black text-white mt-0.5">
                🏅 {dossier.puanLiderWeeks.length} KEZ
              </div>
              <div className="text-[10px] font-bold text-slate-300 mt-0.5">
                {dossier.puanLiderSubText}
              </div>
            </div>

            {/* KUTU 8: HAFTALIK SKOR KRALLIĞI */}
            <div className="rounded-2xl bg-[#050c1d] border border-orange-500/40 p-3 text-center">
              <div className="text-[9.5px] font-black uppercase tracking-wider text-orange-300">
                SKOR KRALLIĞI
              </div>
              <div className="text-lg sm:text-2xl font-black text-orange-300 mt-0.5">
                👑 {dossier.skorKralWeeks.length} KEZ
              </div>
              <div className="text-[10px] font-bold text-slate-300 mt-0.5">
                {dossier.skorKralSubText}
              </div>
            </div>
          </div>

          {/* 3. AÇIK / EKSİK MAÇ AÇILIR-KAPANIR BİLGİ ŞERİDİ */}
          {!activityLoading && (dossier.missingOpenMatches.length > 0 || dossier.missedWeeksAfterLast > 0) && (
            <div className="rounded-2xl bg-amber-950/30 border border-amber-400/55 overflow-hidden">
              <div className="px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setMissingOpenExpanded((p) => !p)}
                  className="flex items-center gap-2 text-left cursor-pointer min-w-0"
                >
                  <span className="text-sm">⚠️</span>
                  <div className="text-[11px] sm:text-xs font-black text-amber-200">
                    {dossier.missingOpenMatches.length > 0 ? (
                      <>
                        Açık bültende tamamlanmamış{' '}
                        <span className="text-white underline">{dossier.missingOpenMatches.length} maç</span> var (
                        {dossier.missingWeeksSummary}){' '}
                        <span className="text-sky-300 ml-1">
                          {missingOpenExpanded ? 'Gizle ▲' : 'Maçları Gör ▼'}
                        </span>
                      </>
                    ) : (
                      <span>
                        {dossier.lastPlayedWeek}. Haftadan sonra ({dossier.missedWeeksAfterLast} haftadır) tahmin yapmadı.
                      </span>
                    )}
                  </div>
                </button>

                {dossier.missingOpenMatches.length > 0 && isViewingOwnProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push('/tahmin');
                    }}
                    className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow cursor-pointer shrink-0"
                  >
                    ✍️ Hemen Tahmin Yap →
                  </button>
                )}
              </div>

              {missingOpenExpanded && dossier.missingOpenMatches.length > 0 && (
                <div className="px-3.5 pb-3 pt-1 border-t border-amber-500/25 space-y-1.5 max-h-48 overflow-y-auto">
                  {dossier.missingOpenMatches.map((mm) => (
                    <div
                      key={`miss-${mm.weekNum}-${mm.matchIndex}`}
                      onClick={() => {
                        if (isViewingOwnProfile) {
                          onClose();
                          router.push('/tahmin');
                        }
                      }}
                      className={`flex items-center justify-between gap-2 rounded-xl bg-[#040914]/90 border border-slate-800 px-3 py-1.5 text-[10.5px] sm:text-xs ${
                        isViewingOwnProfile ? 'hover:border-amber-400 cursor-pointer' : ''
                      }`}
                    >
                      <div className="font-black text-white truncate">
                        <span className="text-amber-300 mr-1.5">
                          {mm.weekNum}.H {mm.matchIndex}.M:
                        </span>
                        {mm.homeTeam} - {mm.awayTeam}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 shrink-0">
                        {mm.matchDate} {mm.matchTime}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. SKOR ANALİZİ İKİZ PANEL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 tabular-nums">
            <div className="bg-[#071329] border border-emerald-500/35 rounded-2xl overflow-hidden flex flex-col">
              <div className="px-3.5 py-2.5 bg-[#040a18] border-b border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-[11px] sm:text-xs font-black text-emerald-300 uppercase tracking-wider">
                    🎯 EN ÇOK TAM İSABET ALDIĞI SKORLAR
                  </h3>
                  <p className="text-[9.5px] font-bold text-slate-400">
                    Skora dokununca alttaki bildiği maç kartlarını açar
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
                <div className="divide-y divide-slate-800/80 max-h-[260px] overflow-y-auto">
                  {dossier.exactHitScoresRanked.map((item, idx) => {
                    const pctOfHits =
                      dossier.totalSkor > 0 ? ((item.count / dossier.totalSkor) * 100).toFixed(1) : '0.0';
                    const maxCnt = dossier.exactHitScoresRanked[0]?.count || 1;
                    const barWidth = Math.max(8, Math.round((item.count / maxCnt) * 100));

                    return (
                      <button
                        key={item.score}
                        type="button"
                        onClick={() =>
                          openCardsAndScroll({
                            score: item.score,
                            tier: 'ALL',
                            pool: 'ALL',
                            week: 'ALL'
                          })
                        }
                        className="w-full px-3 py-2 hover:bg-emerald-950/30 transition-colors flex items-center justify-between gap-2 text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 text-[10px] font-black text-slate-400">{idx + 1}.</span>
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

            <div className="bg-[#071329] border border-sky-500/35 rounded-2xl overflow-hidden flex flex-col">
              <div className="px-3.5 py-2.5 bg-[#040a18] border-b border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-[11px] sm:text-xs font-black text-sky-300 uppercase tracking-wider">
                    🎲 EN ÇOK TAHMİN YAPTIĞI SKORLAR
                  </h3>
                  <p className="text-[9.5px] font-bold text-slate-400">
                    Tamamlanan maçlarda en sık oynadığı favori skorlar
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-sky-950 border border-sky-500/40 text-sky-300 text-[9.5px] font-black shrink-0">
                  {dossier.totalPredCount > 0 ? `${dossier.totalPredCount} MAÇ` : 'ARŞİV'}
                </span>
              </div>

              {activityLoading ? (
                <div className="py-10 text-center text-xs font-black text-sky-300 animate-pulse uppercase tracking-wider">
                  Tahmin alışkanlığı hesaplanıyor...
                </div>
              ) : dossier.predictedScoresRanked.length === 0 ? (
                <div className="py-8 px-4 text-center text-[11px] font-bold text-slate-400">
                  Sonuçlanmış dijital bülten tahmin kaydı bulunamadı.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80 max-h-[260px] overflow-y-auto">
                  {dossier.predictedScoresRanked.slice(0, 15).map((item, idx) => {
                    const maxPred = dossier.predictedScoresRanked[0]?.count || 1;
                    const barWidth = Math.max(8, Math.round((item.count / maxPred) * 100));
                    const hitCountForScore = dossier.exactHitScoresMap[item.score]?.count || 0;

                    return (
                      <div
                        key={item.score}
                        className="w-full px-3 py-2 hover:bg-sky-950/25 transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 text-[10px] font-black text-slate-400">{idx + 1}.</span>
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
                              {dossier.totalPredCount} maçta {item.count} kez oynadı
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs sm:text-sm font-black text-sky-300">
                            %{item.pct} <span className="text-[10.5px] text-white">({item.count}x)</span>
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

          {/* 5. KAÇ PUANLIK KAÇ MAÇ BİLDİ? */}
          <div className="bg-[#071329] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-3.5 py-2.5 bg-[#040a18] border-b border-slate-800 flex items-center justify-between gap-2">
              <h3 className="text-[11px] sm:text-xs font-black text-sky-200 uppercase tracking-wider">
                🏅 KAÇ PUANLIK KAÇ MAÇ BİLDİ? (SATIRA TIKLAYINCA KARTLARI AÇAR)
              </h3>
              {dossier.tierStats[12].count > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    openCardsAndScroll({ tier: 12, pool: 'ALL', week: 'ALL', score: 'ALL' })
                  }
                  className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/70 text-amber-300 text-[9.5px] font-black uppercase cursor-pointer shrink-0"
                >
                  🎯 {dossier.tierStats[12].count}x TEK BAŞINA (12P)
                </button>
              )}
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
                    onClick={() =>
                      openCardsAndScroll({ tier: t.pts, pool: 'ALL', week: 'ALL', score: 'ALL' })
                    }
                    className={`w-full px-3 sm:px-4 py-2 flex items-center justify-between gap-2 text-left transition-colors ${
                      st.count > 0 ? 'hover:bg-sky-900/25 cursor-pointer' : 'opacity-45 cursor-default'
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
                        <span className="text-xs sm:text-sm font-black text-white">{st.count} Maç</span>
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

          {/* 6. HAFTALIK SIRA VE PUAN SEYRİ */}
          {dossier.weeklyHistory.length > 0 && (
            <div className="bg-[#071329] border border-slate-800 rounded-2xl p-3.5">
              <div className="text-[10.5px] sm:text-xs font-black text-sky-200 uppercase tracking-wider mb-2.5">
                📉 HAFTALIK SIRA VE PUAN SEYRİ (HAFTAYA TIKLAYINCA O HAFTANIN KARTLARINI AÇAR)
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 tabular-nums">
                {[...dossier.weeklyHistory].reverse().map((wh) => (
                  <button
                    key={wh.week}
                    type="button"
                    onClick={() =>
                      openCardsAndScroll({
                        week: wh.week,
                        tier: 'ALL',
                        pool: 'ALL',
                        score: 'ALL'
                      })
                    }
                    className={`shrink-0 rounded-xl px-2.5 py-2 text-center min-w-[72px] transition-colors cursor-pointer border ${
                      wh.rankAfterWeek === 1 && wh.isCompletedBulletin
                        ? 'bg-amber-950/35 hover:bg-amber-950/55 border-amber-400/70'
                        : 'bg-[#040a18] hover:bg-sky-950/60 border-slate-800 hover:border-sky-400/60'
                    }`}
                  >
                    <div className="text-[9.5px] font-black text-sky-400">{wh.week}.H</div>
                    <div
                      className={`text-xs font-black mt-0.5 ${
                        wh.rankAfterWeek === 1 ? 'text-amber-300' : 'text-white'
                      }`}
                    >
                      {wh.rankAfterWeek === 1 ? '👑 1. Sıra' : `${wh.rankAfterWeek}. Sıra`}
                    </div>
                    <div className="text-[9.5px] font-bold text-emerald-400">+{wh.weekPts}P</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 7. AÇILIR-KAPANIR 1: BİLDİĞİ SON MAÇ & SON SONUÇLANAN 5 MAÇI */}
          <div className="bg-[#071329] border border-blue-500/35 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setRecentFinishedOpen((p) => !p)}
              className="w-full px-3.5 py-3 bg-[#040a18] hover:bg-[#061024] flex flex-wrap items-center justify-between gap-2 text-left cursor-pointer transition-colors"
            >
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-black text-sky-300 uppercase tracking-wider">
                  🏆 BİLDİĞİ SON MAÇ & SON SONUÇLANAN 5 MAÇI
                </div>
                {dossier.lastWonMatch ? (
                  <div className="text-[10.5px] sm:text-xs font-bold text-slate-200 truncate mt-0.5">
                    Son İsabet:{' '}
                    <span className="text-amber-300 font-black">
                      {dossier.lastWonMatch.week_num}.H {dossier.lastWonMatch.match_index}.M
                    </span>{' '}
                    • {dossier.lastWonMatch.home_team} {dossier.lastWonMatch.home_score}-
                    {dossier.lastWonMatch.away_score} {dossier.lastWonMatch.away_team}{' '}
                    <span className="text-emerald-400 font-black">
                      (+{dossier.lastWonMatch.ptsEarned} PUAN ALDI)
                    </span>
                  </div>
                ) : (
                  <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                    Henüz tam isabet kaydı bulunmuyor
                  </div>
                )}
              </div>

              <span className="px-3 py-1 rounded-xl bg-[#15368a] border border-blue-400/60 text-white text-[10px] font-black uppercase shrink-0">
                {recentFinishedOpen ? 'KAPAT ▲' : 'SON 5 MAÇI AÇ ▼'}
              </span>
            </button>

            {recentFinishedOpen && (
              <div className="p-3 space-y-2 border-t border-slate-800">
                {dossier.recentFiveFinished.length === 0 ? (
                  <div className="text-center py-6 text-xs font-bold text-slate-400 uppercase">
                    Sonuçlanmış maç kaydı bulunamadı.
                  </div>
                ) : (
                  dossier.recentFiveFinished.map((rm) => (
                    <div
                      key={`fin5-${rm.weekNum}-${rm.matchIndex}`}
                      className={`rounded-xl border px-3 py-2 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 ${
                        rm.isExactHit
                          ? 'bg-emerald-950/30 border-emerald-500/60'
                          : 'bg-rose-950/15 border-rose-900/50'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-black uppercase">
                          <span className="text-amber-300">
                            {rm.weekNum}. HAFTA {rm.matchIndex}. MAÇ
                          </span>
                          <span
                            className={`px-1.5 rounded border text-[8.5px] ${
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

                      <div className="shrink-0 flex items-center gap-1.5 sm:gap-2 tabular-nums">
                        <div className="px-2.5 py-1 rounded-lg bg-[#040914] border border-slate-700 text-center min-w-[54px]">
                          <div className="text-[8.5px] font-black text-slate-400 uppercase">SONUÇ</div>
                          <div className="text-xs sm:text-sm font-black text-white">{rm.actualScore}</div>
                        </div>

                        <div
                          className={`px-2.5 py-1 rounded-lg border text-center min-w-[56px] ${
                            rm.isExactHit
                              ? 'bg-emerald-950/90 border-emerald-400'
                              : 'bg-rose-950/90 border-rose-500'
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
                            className={`text-xs sm:text-sm font-black ${
                              rm.isExactHit ? 'text-emerald-300' : 'text-rose-400'
                            }`}
                          >
                            {rm.predictedScore}
                          </div>
                        </div>

                        {rm.isExactHit && (
                          <span className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-[10px] sm:text-[11px] font-black uppercase whitespace-nowrap shadow">
                            +{rm.pointsEarned} PUAN ALDI
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 8. AÇILIR-KAPANIR 2: BİLDİĞİ TÜM MAÇ KARTLARI */}
          <div
            ref={cardsSectionRef}
            className="bg-[#071329] border border-emerald-500/40 rounded-2xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setWonCardsOpen((p) => !p)}
              className="w-full px-3.5 py-3 bg-[#040a18] hover:bg-[#061224] flex items-center justify-between gap-2 text-left cursor-pointer transition-colors"
            >
              <div>
                <div className="text-[11px] sm:text-xs font-black text-emerald-300 uppercase tracking-wider">
                  ⚽ BİLDİĞİ TÜM MAÇ KARTLARI ({dossier.wonMatches.length} TAM İSABET)
                </div>
                <div className="text-[9.5px] font-bold text-slate-400">
                  DFO: {dossier.dfoSkor} maç • TFF: {dossier.tffSkor} maç • Puan ve skora göre filtrele
                </div>
              </div>

              <span className="px-3 py-1 rounded-xl bg-emerald-600 border border-emerald-300 text-white text-[10px] font-black uppercase shrink-0">
                {wonCardsOpen ? 'KARTLARI GİZLE ▲' : 'KARTLARI AÇ ▼'}
              </span>
            </button>

            {wonCardsOpen && (
              <div className="p-3 sm:p-4 space-y-3 border-t border-slate-800">
                <div className="bg-[#040a18] border border-slate-800 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2">
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
                        tierFilter === 'ALL' &&
                        scoreFilter === 'ALL' &&
                        weekFilter === 'ALL' &&
                        poolFilter === 'ALL'
                          ? 'bg-[#15368a] text-white border-blue-400'
                          : 'bg-[#071329] text-slate-300 border-slate-800 hover:text-white'
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
                              : 'bg-[#071329] text-slate-300 border-slate-800 hover:text-white'
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
                            : 'bg-[#071329] text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {pf === 'ALL' ? 'DFO+TFF' : pf}
                      </button>
                    ))}

                    <select
                      value={scoreFilter}
                      onChange={(e) => setScoreFilter(e.target.value)}
                      className="bg-[#071329] border border-emerald-500/50 text-emerald-300 text-[10px] font-black rounded-lg px-2 py-1 outline-none cursor-pointer"
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
                      className="bg-[#071329] border border-slate-700 text-white text-[10px] font-black rounded-lg px-2 py-1 outline-none cursor-pointer"
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
                  <div className="text-center py-10 text-slate-400 text-xs font-black uppercase tracking-widest">
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
    </div>
  );
}