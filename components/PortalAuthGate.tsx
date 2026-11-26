'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import {
  TEST_ACCOUNTS,
  getEliteTheme,
  getMatchTimeMs,
  getUniqueMatchId
} from '@/utils/themeEngine';
import {
  getClubLogoUrl,
  isNationalTeamName,
  refreshCustomClubsCache
} from '@/components/FavoriteTeamSelector';
import { isStrictTffMatch } from '@/utils/tffDetector';

export const PORTAL_SESSION_KEY = 'etml_portal_session_v1';
export const PORTAL_SESSION_EVENT = 'etml-portal-session-changed';
export const PORTAL_OPEN_LOGIN_EVENT = 'etml-portal-open-login';

export interface PortalSession {
  role: 'player' | 'visitor';
  userId?: string;
  name: string;
  favoriteTeam?: string;
}

export const readPortalSession = (): PortalSession | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PORTAL_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.role === 'player' || parsed.role === 'visitor')) {
      return parsed as PortalSession;
    }
  } catch {}
  return null;
};

export const writePortalSession = (session: PortalSession | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (!session) {
      localStorage.removeItem(PORTAL_SESSION_KEY);
    } else {
      localStorage.setItem(PORTAL_SESSION_KEY, JSON.stringify(session));
      if (session.role === 'player' && session.userId) {
        localStorage.setItem(
          'etml_visitor_identity',
          JSON.stringify({ userId: session.userId, name: session.name })
        );
        window.dispatchEvent(new CustomEvent('etml-identity-updated'));
      }
    }
    window.dispatchEvent(new CustomEvent(PORTAL_SESSION_EVENT));
  } catch {}
};

/* ===================== DIŞ KAPI MAÇ VİTRİNİ YARDIMCILARI ===================== */
const EXCLUDED_IDS = new Set(['mankoman']);

const TR_MONTHS = [
  'OCAK',
  'ŞUBAT',
  'MART',
  'NİSAN',
  'MAYIS',
  'HAZİRAN',
  'TEMMUZ',
  'AĞUSTOS',
  'EYLÜL',
  'EKİM',
  'KASIM',
  'ARALIK'
];

const TR_DAYS = [
  'PAZAR',
  'PAZARTESİ',
  'SALI',
  'ÇARŞAMBA',
  'PERŞEMBE',
  'CUMA',
  'CUMARTESİ'
];

const CHAMPION_CUPS: Record<string, number> = {
  'GAZI AYAN': 2,
  'R ILHAN KARACA': 2,
  'RECEP ILHAN KARACA': 2,
  'OSMAN ALI AYDIN': 2,
  'ISMAIL EKER': 1,
  'ISMAIL PEKER': 1,
  'MURAT KARA': 1,
  'MURAT KARAOGLU': 1,
  'HUDAVER TOPARDIC': 1,
  'HUDAVERDI TOPARDIC': 1
};

const stripTrophies = (s: string) => (s || '').replace(/(🏆|🇹🇷)+/g, '').trim();

const normalizeTrName = (s: string) =>
  stripTrophies(s)
    .toUpperCase()
    .replace(/İ/g, 'I')
    .replace(/Ş/g, 'S')
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ö/g, 'O')
    .replace(/Ç/g, 'C')
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getChampionCupCount = (rawName: string, isChampFlag?: boolean) => {
  const existingInText = ((rawName || '').match(/🏆/g) || []).length;
  const norm = normalizeTrName(rawName);
  if (CHAMPION_CUPS[norm] !== undefined) return CHAMPION_CUPS[norm];
  if (
    norm.includes('OSMAN ALI AYDIN') ||
    norm.includes('GAZI AYAN') ||
    norm.includes('ILHAN KARACA')
  ) {
    return 2;
  }
  if (
    norm.includes('ISMAIL EKER') ||
    norm.includes('ISMAIL PEKER') ||
    norm === 'MURAT KARA' ||
    norm === 'MURAT KARAOGLU' ||
    norm.includes('TOPARDIC')
  ) {
    return Math.max(existingInText, 1);
  }
  if (existingInText > 0) return existingInText;
  return isChampFlag ? 1 : 0;
};

const hasReigningTurkishFlag = (rawName: string) => {
  const norm = normalizeTrName(rawName);
  return (
    norm.includes('ISMAIL EKER') ||
    norm.includes('ISMAIL PEKER') ||
    norm.includes('OSMAN ALI AYDIN')
  );
};

const TurkishChampionBadge = ({ title }: { title: string }) => (
  <span
    className="inline-flex items-center shrink-0 rounded-[2px] overflow-hidden border border-white/25 shadow-sm"
    title={title}
  >
    <svg viewBox="0 0 30 20" className="w-4 h-[11px] sm:w-[18px] sm:h-3 block">
      <rect width="30" height="20" fill="#E30A17" />
      <circle cx="10.5" cy="10" r="5" fill="#FFFFFF" />
      <circle cx="11.8" cy="10" r="4" fill="#E30A17" />
      <polygon points="16.2,10 19.3,11 17.4,8.4 17.4,11.6 19.3,9" fill="#FFFFFF" />
    </svg>
  </span>
);

const calcMatchPts = (winnerCount: number) => {
  if (winnerCount === 1) return 12;
  if (winnerCount === 2) return 6;
  if (winnerCount === 3) return 5;
  if (winnerCount === 4) return 4;
  if (winnerCount === 5) return 3;
  if (winnerCount === 6) return 2;
  if (winnerCount >= 7) return 1;
  return 0;
};

function parseDayKeyAndLabel(rawDate: string): {
  dayKey: string;
  dayStartMs: number;
  label: string;
} | null {
  const d = String(rawDate || '').trim();
  if (!d) return null;

  let year = 0;
  let month = 0;
  let day = 0;

  const dmy = d.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (dmy) {
    day = Number(dmy[1]);
    month = Number(dmy[2]);
    year = Number(dmy[3]);
  } else {
    const ymd = d.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
    if (ymd) {
      year = Number(ymd[1]);
      month = Number(ymd[2]);
      day = Number(ymd[3]);
    }
  }

  if (!year || month < 1 || month > 12 || day < 1 || day > 31) {
    const ms = getMatchTimeMs(d, '12:00');
    if (!ms) return null;
    const dt = new Date(ms);
    year = dt.getFullYear();
    month = dt.getMonth() + 1;
    day = dt.getDate();
  }

  const dtObj = new Date(year, month - 1, day, 0, 0, 0, 0);
  if (Number.isNaN(dtObj.getTime())) return null;

  const pad = (n: number) => String(n).padStart(2, '0');
  const dayKey = `${year}-${pad(month)}-${pad(day)}`;
  const label = `${day} ${TR_MONTHS[month - 1]} ${TR_DAYS[dtObj.getDay()]}`;

  return {
    dayKey,
    dayStartMs: dtObj.getTime(),
    label
  };
}

function getTodayTurkeyDayKey(): { todayKey: string; todayStartMs: number; todayLabel: string } {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Istanbul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(new Date());

    const y = Number(parts.find((p) => p.type === 'year')?.value || 0);
    const m = Number(parts.find((p) => p.type === 'month')?.value || 0);
    const d = Number(parts.find((p) => p.type === 'day')?.value || 0);
    if (y && m && d) {
      const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
      const pad = (n: number) => String(n).padStart(2, '0');
      return {
        todayKey: `${y}-${pad(m)}-${pad(d)}`,
        todayStartMs: dt.getTime(),
        todayLabel: `${d} ${TR_MONTHS[m - 1]} ${TR_DAYS[dt.getDay()]}`
      };
    }
  } catch {}
  const now = new Date();
  const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    todayKey: `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`,
    todayStartMs: dt.getTime(),
    todayLabel: `${dt.getDate()} ${TR_MONTHS[dt.getMonth()]} ${TR_DAYS[dt.getDay()]}`
  };
}

interface ShowcaseMatch {
  uidKey: string;
  uniqueId: number;
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
  status: 'LIVE' | 'FINISHED' | 'POSTPONED' | 'UPCOMING';
  statusBadge: string;
  winnerIds: string[];
  pointsAwarded: number;
  dayKey: string;
  dayStartMs: number;
  dayLabel: string;
  kickoffMs: number;
}

/* SADECE DIŞ GİRİŞ EKRANI AÇIKKEN ÇALIŞAN CANLI FİKSTÜR VİTRİNİ */
function OuterGateMatchFixture({ onEnterVisitorCanli }: { onEnterVisitorCanli: () => void }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [playersMap, setPlayersMap] = useState<
    Record<string, { name: string; isChampion: boolean; favoriteTeam: string }>
  >({});
  const [bulletins, setBulletins] = useState<any[]>([]);
  const [officialMatches, setOfficialMatches] = useState<any[]>([]);
  const [liveMatchesMap, setLiveMatchesMap] = useState<Record<string, any>>({});
  const [predictionsMap, setPredictionsMap] = useState<Record<string, string>>({});
  const [expandedRadars, setExpandedRadars] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;

    const loadLandingData = async () => {
      try {
        const [offPlayersRes, legacyPlayersRes, bulRes, offMatchesRes] = await Promise.all([
          supabase.from('etml_official_players').select('*'),
          supabase.from('players').select('*'),
          supabase
            .from('matches_bulletin')
            .select('week_num, match_index, category, match_date, match_time, home_team, away_team')
            .gte('week_num', 41)
            .order('week_num', { ascending: true })
            .order('match_index', { ascending: true })
            .limit(300),
          supabase
            .from('etml_official_matches')
            .select(
              'week_num, match_index, category, pool_type, match_date, match_time, home_team, away_team, home_score, away_score, status, winner_ids, points_awarded'
            )
            .gte('week_num', 41)
            .order('week_num', { ascending: true })
            .order('match_index', { ascending: true })
            .limit(300)
        ]);

        if (!mounted) return;

        const pMap: Record<string, { name: string; isChampion: boolean; favoriteTeam: string }> = {};
        const disabledIds = new Set<string>(EXCLUDED_IDS);

        Object.keys(TEST_ACCOUNTS || {}).forEach((uid) => {
          if (!disabledIds.has(uid)) {
            const nm = TEST_ACCOUNTS[uid]?.name || uid;
            pMap[uid] = {
              name: nm,
              isChampion: getChampionCupCount(nm) > 0,
              favoriteTeam: ''
            };
          }
        });

        (legacyPlayersRes.data || []).forEach((lp: any) => {
          const uid = String(lp.username || '').trim();
          if (!uid || disabledIds.has(uid)) return;
          const nm = String(lp.name || lp.full_name || pMap[uid]?.name || uid).trim();
          pMap[uid] = {
            name: nm,
            isChampion: Boolean(lp.is_champion || pMap[uid]?.isChampion || getChampionCupCount(nm) > 0),
            favoriteTeam: String(lp.favorite_team || pMap[uid]?.favoriteTeam || '').trim()
          };
        });

        (offPlayersRes.data || []).forEach((op: any) => {
          const uid = String(op.user_id || '').trim();
          if (!uid) return;
          if (op.is_active === false || EXCLUDED_IDS.has(uid)) {
            disabledIds.add(uid);
            delete pMap[uid];
          } else {
            const nm = String(op.full_name || pMap[uid]?.name || uid).trim();
            pMap[uid] = {
              name: nm,
              isChampion: Boolean(op.is_champion || getChampionCupCount(nm) > 0),
              favoriteTeam: String(op.favorite_team || pMap[uid]?.favoriteTeam || '').trim()
            };
          }
        });

        setPlayersMap(pMap);

        const bulRows = bulRes.data || [];
        const offRows = offMatchesRes.data || [];
        setBulletins(bulRows);
        setOfficialMatches(offRows);

        const { todayKey, todayStartMs } = getTodayTurkeyDayKey();
        const dayWeeksMap = new Map<string, { dayStartMs: number; weeks: Set<number>; matchIds: number[] }>();

        const registerMatchForDay = (wNum: number, mIdx: number, rawDate: string) => {
          const parsed = parseDayKeyAndLabel(rawDate);
          if (!parsed) return;
          let entry = dayWeeksMap.get(parsed.dayKey);
          if (!entry) {
            entry = { dayStartMs: parsed.dayStartMs, weeks: new Set<number>(), matchIds: [] };
            dayWeeksMap.set(parsed.dayKey, entry);
          }
          entry.weeks.add(wNum);
          const uid = Number(getUniqueMatchId(wNum, mIdx));
          if (!entry.matchIds.includes(uid)) entry.matchIds.push(uid);
        };

        offRows.forEach((o: any) => registerMatchForDay(Number(o.week_num), Number(o.match_index), o.match_date));
        bulRows.forEach((b: any) => registerMatchForDay(Number(b.week_num), Number(b.match_index), b.match_date));

        const sortedDayEntries = Array.from(dayWeeksMap.entries()).sort((a, b) => a[1].dayStartMs - b[1].dayStartMs);
        let chosenDayEntry = dayWeeksMap.get(todayKey);
        if (!chosenDayEntry) {
          chosenDayEntry = sortedDayEntries.find(([, val]) => val.dayStartMs > todayStartMs)?.[1];
        }
        if (!chosenDayEntry && sortedDayEntries.length > 0) {
          chosenDayEntry = sortedDayEntries[sortedDayEntries.length - 1][1];
        }

        const targetMatchIds = chosenDayEntry ? chosenDayEntry.matchIds : [];
        const targetWeeks = chosenDayEntry ? Array.from(chosenDayEntry.weeks) : [];

        const lMap: Record<string, any> = {};
        if (targetMatchIds.length > 0) {
          const { data: liveData } = await supabase
            .from('live_matches')
            .select('id, home_score, away_score, status, elapsed')
            .in('id', targetMatchIds);

          (liveData || []).forEach((lr: any) => {
            lMap[String(lr.id)] = lr;
          });
        }
        setLiveMatchesMap(lMap);

        const offFinishedSet = new Set<number>(
          offRows
            .filter(
              (o: any) =>
                String(o.status || '').toUpperCase() === 'FINISHED' &&
                Array.isArray(o.winner_ids) &&
                o.winner_ids.length > 0
            )
            .map((o: any) => Number(getUniqueMatchId(Number(o.week_num), Number(o.match_index))))
        );

        const needsPredictions = targetMatchIds.some((id) => {
          if (offFinishedSet.has(id)) return false;
          const lr = lMap[String(id)];
          if (!lr) return false;
          const st = String(lr.status || '').toUpperCase();
          return ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'BT', 'FT', 'FINISHED', 'AET', 'PEN', 'WAITING_APPROVAL'].includes(
            st
          );
        });

        if (needsPredictions && targetWeeks.length > 0) {
          const predChunks = await Promise.all(
            targetWeeks.map(async (w) => {
              let rows: any[] = [];
              let from = 0;
              const step = 1000;
              let more = true;
              while (more) {
                const { data, error } = await supabase
                  .from('player_predictions')
                  .select('user_id, week_num, match_index, predicted_score')
                  .eq('week_num', w)
                  .range(from, from + step - 1);
                if (error || !data || data.length === 0) {
                  more = false;
                } else {
                  rows = [...rows, ...data];
                  if (data.length < step) more = false;
                  else from += step;
                }
              }
              return rows;
            })
          );

          if (mounted) {
            const prMap: Record<string, string> = {};
            predChunks.flat().forEach((pr: any) => {
              const uid = String(pr.user_id || '').trim();
              if (!uid || disabledIds.has(uid)) return;
              const sc = String(pr.predicted_score || '')
                .replace(/\s+/g, '')
                .replace(':', '-');
              if (sc) {
                prMap[`${uid}-${pr.week_num}-${pr.match_index}`] = sc;
              }
            });
            setPredictionsMap(prMap);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadLandingData();

    const channel = supabase
      .channel('outer-gate-live-showcase')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_matches' }, (payload: any) => {
        const row = payload.new;
        if (!row || row.id === undefined) return;
        setLiveMatchesMap((prev) => ({ ...prev, [String(row.id)]: row }));
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const { targetDayLabel, isTodayMatchDay, displayMatches, liveNowCount } = useMemo(() => {
    const { todayKey, todayStartMs, todayLabel } = getTodayTurkeyDayKey();

    const mergedMap = new Map<string, any>();

    officialMatches.forEach((om: any) => {
      const key = `${Number(om.week_num)}-${Number(om.match_index)}`;
      mergedMap.set(key, { ...om, source: 'OFFICIAL' });
    });

    bulletins.forEach((bm: any) => {
      const key = `${Number(bm.week_num)}-${Number(bm.match_index)}`;
      const existing = mergedMap.get(key);
      if (!existing) {
        mergedMap.set(key, { ...bm, source: 'BULLETIN' });
      } else {
        mergedMap.set(key, {
          ...existing,
          category: bm.category || existing.category,
          match_date: bm.match_date || existing.match_date,
          match_time: bm.match_time || existing.match_time,
          home_team: bm.home_team || existing.home_team,
          away_team: bm.away_team || existing.away_team
        });
      }
    });

    const allShowcase: ShowcaseMatch[] = [];
    const activePlayerIds = Object.keys(playersMap).filter((id) => !EXCLUDED_IDS.has(id));

    mergedMap.forEach((raw) => {
      const wNum = Number(raw.week_num);
      const mIdx = Number(raw.match_index);
      const mDate = String(raw.match_date || '').trim();
      const mTime = String(raw.match_time || '').trim();
      const parsedDay = parseDayKeyAndLabel(mDate);
      if (!parsedDay) return;

      const uniqueId = Number(getUniqueMatchId(wNum, mIdx));
      const liveRow = liveMatchesMap[String(uniqueId)];
      const kickMs = getMatchTimeMs(mDate, mTime) || parsedDay.dayStartMs;

      const isTff = isStrictTffMatch(raw.category || '', raw.home_team || '', raw.away_team || '', raw.pool_type);

      const rawOffStatus = String(raw.status || '').toUpperCase();
      const liveStatus = String(liveRow?.status || '').toUpperCase();

      let finalStatus: ShowcaseMatch['status'] = 'UPCOMING';
      let statusBadge = mTime || 'BAŞLAMADI';
      let hScore = '-';
      let aScore = '-';

      if (
        rawOffStatus === 'POSTPONED' ||
        ['POSTPONED', 'PST', 'ERT', 'CANCELLED', 'CANC'].includes(liveStatus)
      ) {
        finalStatus = 'POSTPONED';
        statusBadge = 'ERTELENDİ';
      } else if (
        ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'BT'].includes(liveStatus) &&
        rawOffStatus !== 'FINISHED'
      ) {
        finalStatus = 'LIVE';
        const minuteTxt = liveRow?.elapsed || liveRow?.minute;
        statusBadge =
          liveStatus === 'HT'
            ? 'DEVRE ARASI'
            : minuteTxt
            ? `CANLI • ${minuteTxt}'`
            : 'CANLI OYNANIYOR';
        hScore = String(liveRow?.home_score ?? '0');
        aScore = String(liveRow?.away_score ?? '0');
      } else if (
        rawOffStatus === 'FINISHED' ||
        ['FT', 'FINISHED', 'AET', 'PEN', 'MS', 'WAITING_APPROVAL'].includes(liveStatus)
      ) {
        finalStatus = 'FINISHED';
        statusBadge = 'MS (BİTTİ)';
        if (
          raw.home_score !== null &&
          raw.home_score !== undefined &&
          String(raw.home_score) !== '-' &&
          String(raw.home_score) !== ''
        ) {
          hScore = String(raw.home_score);
          aScore = String(raw.away_score);
        } else {
          hScore = String(liveRow?.home_score ?? '-');
          aScore = String(liveRow?.away_score ?? '-');
        }
      }

      let winnerIds: string[] = [];
      let pts = 0;

      if (finalStatus === 'FINISHED' && Array.isArray(raw.winner_ids) && raw.winner_ids.length > 0) {
        winnerIds = raw.winner_ids
          .map((id: any) => String(id).trim())
          .filter((id: string) => id && !EXCLUDED_IDS.has(id) && playersMap[id]);
        pts =
          raw.points_awarded !== null && raw.points_awarded !== undefined && Number(raw.points_awarded) > 0
            ? Number(raw.points_awarded)
            : calcMatchPts(winnerIds.length);
      } else if ((finalStatus === 'LIVE' || finalStatus === 'FINISHED') && hScore !== '-' && aScore !== '-') {
        const scoreKey = `${hScore}-${aScore}`.replace(/\s+/g, '');
        winnerIds = activePlayerIds.filter(
          (pid) => predictionsMap[`${pid}-${wNum}-${mIdx}`] === scoreKey
        );
        pts = calcMatchPts(winnerIds.length);
      }

      allShowcase.push({
        uidKey: `${wNum}-${mIdx}`,
        uniqueId,
        week_num: wNum,
        match_index: mIdx,
        category: String(raw.category || '').trim(),
        pool_type: isTff ? 'TFF' : 'DFO',
        match_date: mDate,
        match_time: mTime,
        home_team: String(raw.home_team || '').trim(),
        away_team: String(raw.away_team || '').trim(),
        home_score: hScore,
        away_score: aScore,
        status: finalStatus,
        statusBadge,
        winnerIds,
        pointsAwarded: pts,
        dayKey: parsedDay.dayKey,
        dayStartMs: parsedDay.dayStartMs,
        dayLabel: parsedDay.label,
        kickoffMs: kickMs
      });
    });

    const byDay = new Map<
      string,
      { dayKey: string; dayStartMs: number; dayLabel: string; matches: ShowcaseMatch[] }
    >();

    allShowcase.forEach((m) => {
      const grp = byDay.get(m.dayKey);
      if (!grp) {
        byDay.set(m.dayKey, {
          dayKey: m.dayKey,
          dayStartMs: m.dayStartMs,
          dayLabel: m.dayLabel,
          matches: [m]
        });
      } else {
        grp.matches.push(m);
      }
    });

    const sortedDays = Array.from(byDay.values()).sort((a, b) => a.dayStartMs - b.dayStartMs);

    let chosenGroup = sortedDays.find((g) => g.dayKey === todayKey);
    let isToday = true;

    if (!chosenGroup) {
      isToday = false;
      chosenGroup = sortedDays.find((g) => g.dayStartMs > todayStartMs);
    }
    if (!chosenGroup && sortedDays.length > 0) {
      isToday = false;
      chosenGroup = sortedDays[sortedDays.length - 1];
    }

    const orderedMatches = (chosenGroup?.matches || []).sort((a, b) => {
      if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
      if (b.status === 'LIVE' && a.status !== 'LIVE') return 1;
      return a.kickoffMs - b.kickoffMs || a.match_index - b.match_index;
    });

    const liveCnt = orderedMatches.filter((m) => m.status === 'LIVE').length;

    return {
      targetDayLabel: chosenGroup?.dayLabel || todayLabel,
      isTodayMatchDay: isToday && orderedMatches.length > 0,
      displayMatches: orderedMatches,
      liveNowCount: liveCnt
    };
  }, [officialMatches, bulletins, liveMatchesMap, predictionsMap, playersMap]);

  return (
    <div className="w-full bg-[#071126] border border-slate-800 rounded-2xl p-3 sm:p-5 flex flex-col gap-3.5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              liveNowCount > 0
                ? 'bg-emerald-400 animate-ping'
                : isTodayMatchDay
                ? 'bg-emerald-400'
                : 'bg-amber-400'
            }`}
          />
          <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
            {isTodayMatchDay
              ? `BUGÜNÜN MAÇ VİTRİNİ • ${targetDayLabel} (${displayMatches.length} MAÇ)`
              : `SIRADAKİ MAÇ GÜNÜ • ${targetDayLabel} (${displayMatches.length} MAÇ)`}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {liveNowCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-600/90 border border-emerald-300/70 text-slate-950 text-[10px] font-black uppercase tracking-wider">
              ● {liveNowCount} MAÇ CANLI
            </span>
          )}
          <button
            type="button"
            onClick={onEnterVisitorCanli}
            className="px-2.5 py-1 rounded-lg bg-[#040917] border border-slate-700 hover:border-sky-400 text-sky-300 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
          >
            TÜM CANLI EKRANI ↗
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs sm:text-sm font-black text-sky-300 uppercase tracking-widest animate-pulse">
          Güncel Maç Kartları Hazırlanıyor...
        </div>
      ) : displayMatches.length === 0 ? (
        <div className="py-10 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          Aktif bülten maçları yükleniyor...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayMatches.map((m) => {
            const isTff = m.pool_type === 'TFF';
            const isRadarOpen = expandedRadars[m.uidKey] !== false;

            const rawCat =
              m.category && m.category !== 'GENEL'
                ? m.category
                : isTff
                ? 'TÜRKİYE SÜPER LİG'
                : 'AVRUPA FUTBOLU';

            const theme: any = getEliteTheme(
              isTff &&
                !normalizeTrName(rawCat).includes('TURKIYE') &&
                !normalizeTrName(rawCat).includes('TFF')
                ? `TÜRKİYE ${rawCat}`
                : rawCat,
              m.home_team.toUpperCase(),
              m.away_team.toUpperCase()
            );

            const leagueTitle = String(
              theme?.leagueName || theme?.title || rawCat || (isTff ? 'TÜRKİYE TFF' : 'DFO AVRUPA')
            ).toUpperCase();

            const leagueLogo = String(
              theme?.leagueLogo || theme?.catLogo || theme?.tournamentLogo || ''
            ).trim();

            const catNorm = normalizeTrName(leagueTitle);

            let cardOuterCls =
              theme?.cardBg ||
              'bg-gradient-to-b from-[#081529] via-[#061020] to-[#040a15] border-sky-500/35 shadow-[0_8px_26px_rgba(2,132,199,0.14)]';
            let bannerCls =
              'bg-[#071d36]/90 border-sky-400/45 text-sky-200 shadow-[0_0_16px_rgba(56,189,248,0.22)]';
            let poolPillCls = 'bg-sky-950/90 border-sky-500/50 text-sky-300';
            let scoreBoxCls = 'bg-[#040914] border-slate-700/80 text-white';

            if (isTff) {
              cardOuterCls =
                'bg-gradient-to-b from-[#4c0714] via-[#2f050d] to-[#170206] border-rose-500/75 shadow-[0_8px_28px_rgba(225,29,72,0.28)]';
              bannerCls =
                'bg-rose-950/90 border-rose-400/65 text-rose-100 shadow-[0_0_18px_rgba(244,63,94,0.32)]';
              poolPillCls = 'bg-rose-950 border-rose-400/70 text-rose-200';
              scoreBoxCls = 'bg-[#1c0308] border-rose-500/60 text-white';
            } else if (catNorm.includes('SAMPIYONLAR') || catNorm.includes('CHAMPIONS')) {
              cardOuterCls =
                'bg-gradient-to-b from-[#0f1a48] via-[#09102e] to-[#040818] border-indigo-400/60 shadow-[0_8px_26px_rgba(99,102,241,0.22)]';
              bannerCls =
                'bg-indigo-950/90 border-indigo-400/55 text-indigo-100 shadow-[0_0_16px_rgba(129,140,248,0.28)]';
              poolPillCls = 'bg-indigo-950/90 border-indigo-400/60 text-indigo-200';
            } else if (catNorm.includes('AVRUPA LIGI') || catNorm.includes('EUROPA')) {
              cardOuterCls =
                'bg-gradient-to-b from-[#3b1906] via-[#240f04] to-[#110702] border-orange-500/60 shadow-[0_8px_26px_rgba(249,115,22,0.2)]';
              bannerCls =
                'bg-orange-950/90 border-orange-400/55 text-orange-100 shadow-[0_0_16px_rgba(251,146,60,0.25)]';
            } else if (catNorm.includes('KONFERANS') || catNorm.includes('CONFERENCE')) {
              cardOuterCls =
                'bg-gradient-to-b from-[#063322] via-[#042015] to-[#02100b] border-emerald-500/60 shadow-[0_8px_26px_rgba(16,185,129,0.2)]';
              bannerCls =
                'bg-emerald-950/90 border-emerald-400/55 text-emerald-100 shadow-[0_0_16px_rgba(52,211,153,0.25)]';
            }

            const winnerEntries = m.winnerIds
              .map((uid) => {
                const pObj = playersMap[uid];
                return {
                  id: uid,
                  name: pObj?.name || uid,
                  isChamp: Boolean(pObj?.isChampion),
                  favTeam: pObj?.favoriteTeam || ''
                };
              })
              .sort((a, b) => a.name.localeCompare(b.name, 'tr'));

            return (
              <div
                key={m.uidKey}
                className={`rounded-2xl border p-3.5 sm:p-4 flex flex-col gap-3 transition-all ${cardOuterCls}`}
              >
                <div className="flex items-center justify-center text-[10px] sm:text-[10.5px] font-black tracking-wider text-slate-300 uppercase">
                  <span>
                    {m.week_num}. HAFTA {m.match_index}. MAÇ
                    {m.match_date ? ` • ${m.match_date}` : ''}
                    {m.match_time ? ` ${m.match_time}` : ''}
                  </span>
                </div>

                <div
                  className={`w-full py-1.5 px-3 rounded-xl border text-center text-[10px] sm:text-[11px] font-black uppercase tracking-widest truncate ${bannerCls}`}
                >
                  {leagueTitle}
                </div>

                <div className="grid grid-cols-3 items-center gap-2 py-1.5">
                  <div className="flex flex-col items-center gap-2 min-w-0">
                    <img
                      src={theme.homeLogo}
                      alt={m.home_team}
                      className="w-[68px] h-[68px] sm:w-[78px] sm:h-[78px] object-contain shrink-0 drop-shadow-[0_6px_12px_rgba(0,0,0,0.55)]"
                      loading="lazy"
                    />
                    <span className="text-[10.5px] sm:text-xs font-black text-white uppercase text-center leading-tight line-clamp-2">
                      {m.home_team}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-1.5">
                    {leagueLogo && (
                      <img
                        src={leagueLogo}
                        alt={leagueTitle}
                        className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow"
                        loading="lazy"
                      />
                    )}

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        m.status === 'LIVE'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-200 animate-pulse'
                          : m.status === 'FINISHED'
                          ? 'bg-slate-900/90 text-slate-200 border-slate-600/80'
                          : m.status === 'POSTPONED'
                          ? 'bg-amber-950/90 text-amber-300 border-amber-500/70'
                          : 'bg-sky-950/90 text-sky-300 border-sky-500/60'
                      }`}
                    >
                      {m.statusBadge}
                    </span>

                    <div
                      className={`px-3.5 py-1.5 rounded-xl border min-w-[84px] sm:min-w-[96px] text-center shadow-inner ${scoreBoxCls}`}
                    >
                      {m.status === 'LIVE' || m.status === 'FINISHED' ? (
                        <span className="text-lg sm:text-xl font-black tracking-wider tabular-nums">
                          {m.home_score} <span className="text-slate-400 mx-0.5">:</span> {m.away_score}
                        </span>
                      ) : m.status === 'POSTPONED' ? (
                        <span className="text-xs sm:text-sm font-black text-amber-400">ERT</span>
                      ) : (
                        <span className="text-sm sm:text-base font-black text-slate-400">- : -</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2 min-w-0">
                    <img
                      src={theme.awayLogo}
                      alt={m.away_team}
                      className="w-[68px] h-[68px] sm:w-[78px] sm:h-[78px] object-contain shrink-0 drop-shadow-[0_6px_12px_rgba(0,0,0,0.55)]"
                      loading="lazy"
                    />
                    <span className="text-[10.5px] sm:text-xs font-black text-white uppercase text-center leading-tight line-clamp-2">
                      {m.away_team}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] font-black">
                  <span
                    className={
                      (m.status === 'LIVE' || m.status === 'FINISHED') && winnerEntries.length > 0
                        ? 'text-emerald-400'
                        : m.status === 'POSTPONED'
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }
                  >
                    {m.status === 'POSTPONED'
                      ? 'Maç ertelendi'
                      : m.status === 'UPCOMING'
                      ? `Başlama: ${m.match_time || '--:--'}`
                      : `${winnerEntries.length} kişi tam isabetli`}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-full border text-[9px] uppercase tracking-wider ${poolPillCls}`}
                  >
                    {isTff ? 'TFF MAÇI' : 'DFO MAÇI'}
                  </span>

                  {(m.status === 'LIVE' || m.status === 'FINISHED') && winnerEntries.length > 0 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedRadars((prev) => ({ ...prev, [m.uidKey]: !isRadarOpen }))
                      }
                      className="text-sky-400 hover:text-sky-300 text-[10px] font-black cursor-pointer"
                    >
                      {isRadarOpen ? 'Radar Gizle ▲' : 'Radar Aç ▼'}
                    </button>
                  ) : (
                    <span className="text-slate-500 text-[10px]">{m.match_date}</span>
                  )}
                </div>

                {(m.status === 'LIVE' || m.status === 'FINISHED') &&
                  winnerEntries.length > 0 &&
                  isRadarOpen && (
                    <div className="rounded-xl border border-emerald-500/35 bg-[#031214]/85 p-2.5 flex flex-col gap-2">
                      <div className="flex justify-center">
                        <span className="px-3.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                          +{m.pointsAwarded} {m.status === 'LIVE' ? 'PUAN YAZILIYOR' : 'PUAN YAZILDI'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        {winnerEntries.map((wEntry) => {
                          const cLogo = getClubLogoUrl(wEntry.favTeam);
                          const cups = getChampionCupCount(wEntry.name, wEntry.isChamp);
                          const showFlag = hasReigningTurkishFlag(wEntry.name);
                          const cleanNm = stripTrophies(wEntry.name);

                          return (
                            <div
                              key={wEntry.id}
                              className="w-full py-2 px-3 rounded-lg bg-[#050b18]/95 border border-slate-800/90 flex items-center justify-center gap-2 text-white text-[12.5px] sm:text-sm font-black uppercase"
                            >
                              {cLogo && (
                                <img
                                  src={cLogo}
                                  alt={wEntry.favTeam}
                                  width={18}
                                  height={18}
                                  style={{ width: '18px', height: '18px', minWidth: '18px', maxWidth: '18px' }}
                                  className="w-[18px] h-[18px] object-contain shrink-0"
                                  loading="lazy"
                                />
                              )}
                              <span className="truncate">{cleanNm}</span>
                              {cups > 0 && (
                                <span className="shrink-0 text-[10.5px] leading-none">
                                  {'🏆'.repeat(cups)}
                                </span>
                              )}
                              {showFlag && <TurkishChampionBadge title="Son Şampiyon Göğüs Arması" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ===================== ANA PORTAL GİRİŞ VE YETKİ KAPISI ===================== */
export default function PortalAuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<PortalSession | null>(null);
  const [forceLoginModal, setForceLoginModal] = useState(false);

  const [userIdInput, setUserIdInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isAdminRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/master') ||
    pathname.startsWith('/yonetim');

  const isVisitorBlockedRoute = pathname.startsWith('/tahminmatik');

  useEffect(() => {
    refreshCustomClubsCache(false);
    setSession(readPortalSession());
    setReady(true);

    const syncHandler = () => {
      setSession(readPortalSession());
    };
    const openLoginHandler = () => setForceLoginModal(true);

    window.addEventListener(PORTAL_SESSION_EVENT, syncHandler);
    window.addEventListener('storage', syncHandler);
    window.addEventListener(PORTAL_OPEN_LOGIN_EVENT, openLoginHandler);
    return () => {
      window.removeEventListener(PORTAL_SESSION_EVENT, syncHandler);
      window.removeEventListener('storage', syncHandler);
      window.removeEventListener(PORTAL_OPEN_LOGIN_EVENT, openLoginHandler);
    };
  }, []);

  const handleContestantLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const uid = userIdInput.trim();
    const pwd = passInput.trim();

    if (!uid || !pwd) {
      setErrorMsg('Lütfen Yarışmacı ID ve Şifrenizi giriniz.');
      return;
    }

    if (uid.toLowerCase() === 'mankoman' || uid === '600060') {
      setErrorMsg('Bu hesap yarışmacı tahmin girişine kapalıdır.');
      return;
    }

    setSubmitting(true);
    try {
      const [legacyRes, officialRes] = await Promise.all([
        supabase.from('players').select('*').eq('username', uid).maybeSingle(),
        supabase.from('etml_official_players').select('*').eq('user_id', uid).maybeSingle()
      ]);

      const fallbackAcc = TEST_ACCOUNTS[uid];
      const legacyRow: any = legacyRes.data;
      const officialRow: any = officialRes.data;

      if (officialRow && officialRow.is_active === false) {
        setErrorMsg('Bu yarışmacı hesabı aktif değildir.');
        setSubmitting(false);
        return;
      }

      const validPass = String(legacyRow?.password || fallbackAcc?.pass || '').trim();
      if (!validPass || String(pwd) !== validPass) {
        setErrorMsg('ID veya Şifre hatalı! Lütfen kontrol edip tekrar deneyin.');
        setSubmitting(false);
        return;
      }

      const resolvedName = String(
        officialRow?.full_name || legacyRow?.name || legacyRow?.full_name || fallbackAcc?.name || uid
      ).trim();

      const rawFav = String(officialRow?.favorite_team || legacyRow?.favorite_team || '').trim();
      const safeFav = isNationalTeamName(rawFav) ? '' : rawFav;

      const newSession: PortalSession = {
        role: 'player',
        userId: uid,
        name: resolvedName,
        favoriteTeam: safeFav
      };

      writePortalSession(newSession);
      setSession(newSession);
      setForceLoginModal(false);
      setUserIdInput('');
      setPassInput('');
      if (pathname === '/') {
        router.replace('/yeni-arsiv');
      }
    } catch {
      setErrorMsg('Bağlantı hatası oluştu, lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVisitorEnter = (targetPath?: string) => {
    const visitorSession: PortalSession = {
      role: 'visitor',
      name: 'ZİYARETÇİ'
    };
    writePortalSession(visitorSession);
    setSession(visitorSession);
    setForceLoginModal(false);
    if (targetPath) {
      router.push(targetPath);
    } else if (isVisitorBlockedRoute || pathname === '/') {
      router.replace('/yeni-arsiv');
    }
  };

  if (isAdminRoute) {
    return <>{children}</>;
  }

  if (!ready) {
    return <div className="min-h-screen bg-[#050b14]" />;
  }

  // EN DIŞ GİRİŞ KAPISI (YASAL DEKLARASYON + KAPALI DEVRE ROZETİ + GÜNÜN MAÇ FİKSTÜRÜ BURADA!)
  if (!session || forceLoginModal) {
    return (
      <div className="min-h-screen bg-[#040914] text-white px-2.5 sm:px-4 pt-5 pb-14 relative overflow-x-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0f295c_0%,#040914_60%)] opacity-90 pointer-events-none" />

        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col gap-4">
          {/* 1. ÜST KAPALI DEVRE DOSTLUK PLATFORMU VE YASAL DEKLARASYON BLOĞU */}
          <div className="relative overflow-hidden rounded-2xl border border-sky-500/35 bg-gradient-to-b from-[#081730] via-[#061022] to-[#040915] p-4 sm:p-6 shadow-[0_10px_32px_rgba(2,132,199,0.16)]">
            <div className="flex flex-col items-center text-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950/90 border border-sky-400/40 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-sky-300">
                ⚽ ELİT TAHMİN MASTER LİGİ • KAPALI DEVRE DOSTLUK PLATFORMU
              </span>

              <div className="w-full max-w-3xl rounded-xl bg-[#030813]/85 border border-slate-800/90 px-3.5 py-3 text-center">
                <p className="text-[10.5px] sm:text-xs font-bold text-amber-300/95 uppercase tracking-wider mb-1">
                  ⚠️ ÖNEMLİ BİLGİLENDİRME VE YASAL DEKLARASYON
                </p>
                <p className="text-[11px] sm:text-xs leading-relaxed text-slate-300 font-medium">
                  Bu platform, yalnızca <strong className="text-white">dostlar arasında kapalı devre</strong> olarak
                  düzenlenen, tamamen futbol bilgisi, öngörü ve centilmence rekabete dayalı amatör bir skor tahmin
                  ligidir. Sitemizde <strong className="text-rose-300">hiçbir şekilde ticari bir faaliyet yürütülmez</strong>;
                  ücretli üyelik, para yatırma, maddi ödül dağıtımı, bahis veya{' '}
                  <strong className="text-rose-300">kumar niteliği taşıyan hiçbir unsur kesinlikle bulunmamaktadır</strong>.
                  Siteye giriş yapan tüm yarışmacı ve ziyaretçiler bu deklarasyonu kabul etmiş sayılır.
                </p>
              </div>
            </div>
          </div>

          {/* 2. YARIŞMACI GİRİŞİ & ZİYARETÇİ GİRİŞİ KARTLARI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {/* SOL KART: YARIŞMACI / TAHMİNCİ GİRİŞİ */}
            <div className="bg-gradient-to-b from-[#0b1936] via-[#081226] to-[#050b18] border-2 border-amber-500/60 rounded-2xl p-5 sm:p-6 shadow-[0_12px_40px_rgba(245,158,11,0.16)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 text-[10px] font-black uppercase tracking-widest">
                    ⚽ TAHMİNCİ / ÜYE GİRİŞİ
                  </span>
                  <span className="text-xl">🔐</span>
                </div>

                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide mb-1">
                  YARIŞMACI GİRİŞİ
                </h2>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  Kayıtlı Yarışmacı ID ve şifrenizle giriş yaparak haftalık bülten tahminlerinizi oluşturabilir ve güncelleyebilirsiniz.
                </p>

                <form onSubmit={handleContestantLogin} className="space-y-2.5">
                  <input
                    type="text"
                    value={userIdInput}
                    onChange={(e) => setUserIdInput(e.target.value)}
                    placeholder="YARIŞMACI ID"
                    className="w-full bg-[#040914] border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-center font-black tracking-widest text-sm text-white outline-none transition-colors"
                  />
                  <input
                    type="password"
                    value={passInput}
                    onChange={(e) => setPassInput(e.target.value)}
                    placeholder="ŞİFRE"
                    className="w-full bg-[#040914] border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-center font-black tracking-[0.35em] text-base text-white outline-none transition-colors placeholder:tracking-widest placeholder:text-sm"
                  />

                  {errorMsg && (
                    <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/60 text-rose-200 text-[11px] font-bold text-center">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'DOĞRULANIYOR...' : '🚀 YARIŞMACI OLARAK GİR'}
                  </button>
                </form>
              </div>
            </div>

            {/* SAĞ KART: ZİYARETÇİ GİRİŞİ */}
            <div className="bg-gradient-to-b from-[#08152c] via-[#061020] to-[#040a14] border border-sky-500/40 rounded-2xl p-5 sm:p-6 shadow-[0_12px_35px_rgba(2,132,199,0.14)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/50 text-sky-300 text-[10px] font-black uppercase tracking-widest">
                    👁️ ŞİFRESİZ İZLEYİCİ MODU
                  </span>
                  <span className="text-xl">🏟️</span>
                </div>

                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide mb-1.5">
                  ZİYARETÇİ GİRİŞİ
                </h2>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  Şifre girmeden Puan Durumları, Maç Arşivi, Canlı Skorlar ve Resmi Deklarasyon tablolarını inceleyin.
                </p>

                <div className="space-y-1.5 text-[11px] font-bold text-slate-300 bg-[#040914]/80 border border-slate-800 rounded-xl p-3.5 mb-4">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <span>✓</span> <span>Genel Puan Durumu & Maç Arşivi</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <span>✓</span> <span>Canlı Skorlar & Resmi Deklarasyon</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-400/90 pt-1 border-t border-slate-800">
                    <span>✕</span> <span>Tahmin Girişi ve Tahminmatik Kapalıdır</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleVisitorEnter('/yeni-arsiv')}
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs sm:text-sm uppercase tracking-widest border border-sky-300/60 shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all cursor-pointer"
              >
                👁️ ZİYARETÇİ OLARAK DEVAM ET
              </button>
            </div>
          </div>

          {session && forceLoginModal && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setForceLoginModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-white underline cursor-pointer"
              >
                Vazgeç ve mevcut oturuma dön
              </button>
            </div>
          )}

          {/* 3. DIŞ KAPI CANLI MAÇ FİKSTÜRÜ VİTRİNİ */}
          <OuterGateMatchFixture onEnterVisitorCanli={() => handleVisitorEnter('/canli')} />
        </div>
      </div>
    );
  }

  // Ziyaretçi yasaklı adrese (/tahminmatik) girerse kilit ekranı
  if (session.role === 'visitor' && isVisitorBlockedRoute) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#071126] border border-rose-500/50 rounded-3xl p-7 text-center space-y-4 shadow-2xl">
          <div className="text-4xl">🔒</div>
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
            YARIŞMACILARA ÖZEL ALAN
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Ziyaretçi modunda yalnızca Puan Durumu, Maç Arşivi, Canlı Skorlar ve Resmi Deklarasyon görüntülenebilir.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setForceLoginModal(true)}
              className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              🔐 Yarışmacı Girişi
            </button>
            <button
              type="button"
              onClick={() => router.push('/tahmin')}
              className="flex-1 py-3 rounded-xl bg-sky-700 hover:bg-sky-600 text-white font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              📜 Resmi Deklarasyon
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}