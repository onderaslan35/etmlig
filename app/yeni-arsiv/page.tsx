'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getEliteTheme, TEST_ACCOUNTS } from '@/utils/themeEngine';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Yalnızca admin hesabı gizli tutulur; pasiften açılan tüm yarışmacılar görünür
const EXCLUDED_IDS = new Set(['mankoman']);

// Geçmiş sezon şampiyonluk sayılarını isim bazlı eşleştirme (2 kupa, 1 kupa + Ay-Yıldız)
const CHAMPION_TITLES_BY_KEY: Record<string, number> = {
  'OSMAN ALI AYDIN': 2,
  'ISMAIL EKER': 1,
  'MURAT KARA': 1,
  'ONDER ASLAN': 1,
  'HAKAN AYAN': 1,
};

function toAsciiKey(str: string): string {
  return String(str || '')
    .replace(/🏆/g, '')
    .replace(/🇹🇷/g, '')
    .trim()
    .toLocaleUpperCase('tr-TR')
    .replace(/İ/g, 'I')
    .replace(/Ş/g, 'S')
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ö/g, 'O')
    .replace(/Ç/g, 'C')
    .replace(/\s+/g, ' ')
    .trim();
}

function getChampionCupCount(cleanName: string, dbIsChampion: boolean): number {
  const key = toAsciiKey(cleanName);
  if (CHAMPION_TITLES_BY_KEY[key]) return CHAMPION_TITLES_BY_KEY[key];
  return dbIsChampion ? 1 : 0;
}

function resolveClubCrestUrl(favoriteTeam?: string): string {
  const raw = String(favoriteTeam || '').trim();
  if (!raw) return '';
  try {
    const theme: any = getEliteTheme(raw, raw, 'GENEL');
    return String(theme?.homeLogo || theme?.logo || theme?.crest || '').trim();
  } catch {
    return '';
  }
}

function getMatchTimeMs(dateStr: string, timeStr: string): number {
  const d = String(dateStr || '').trim();
  const t = String(timeStr || '00:00').trim();
  if (!d) return 0;

  const timeParts = t.match(/(\d{1,2}):(\d{2})/);
  const hh = timeParts ? Number(timeParts[1]) : 0;
  const mm = timeParts ? Number(timeParts[2]) : 0;

  // GG.AA.YYYY veya GG/AA/YYYY
  const dotMatch = d.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (dotMatch) {
    const day = Number(dotMatch[1]);
    const month = Number(dotMatch[2]) - 1;
    const year = Number(dotMatch[3]);
    return new Date(year, month, day, hh, mm, 0).getTime();
  }

  // YYYY-AA-GG
  const isoMatch = d.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]) - 1;
    const day = Number(isoMatch[3]);
    return new Date(year, month, day, hh, mm, 0).getTime();
  }

  const parsed = Date.parse(`${d} ${t}`);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export interface OfficialPlayerRow {
  user_id: string;
  full_name: string;
  is_active?: boolean;
  is_champion?: boolean;
  champion_count?: number;
  favorite_team?: string;
}

export interface OfficialWeekRow {
  week_num: number;
  is_completed: boolean;
  bonus_enabled: boolean;
  puan_lideri_ids: string[];
  puan_bonus: number;
  skor_krali_ids: string[];
  skor_bonus: number;
}

export interface OfficialMatchRow {
  id: number;
  week_num: number;
  match_index: number;
  category: string;
  pool_type: string;
  match_date: string;
  match_time: string;
  home_team: string;
  away_team: string;
  home_score: string;
  away_score: string;
  status: string;
  points_awarded?: number;
  winner_ids: string[];
}

export interface PlayerMapEntry {
  name: string;
  isChampion: boolean;
  cupCount: number;
  favoriteTeam: string;
}

export interface PlayerStatRow {
  id: string;
  name: string;
  isChampion: boolean;
  cupCount: number;
  favoriteTeam: string;
  dfoPts: number;
  tffPts: number;
  bonusPts: number;
  totalPts: number;
  dfoExact: number;
  tffExact: number;
  totalExact: number;
  puanLiderWeeks: number[];
  skorKralWeeks: number[];
}

type ArchiveTopTab = 'GENEL' | 'MAC_ARSIVI' | 'HAFTA_OZET' | 'HAFTA_GENEL' | 'LIDERLER';
type MainCategoryTab = 'MASTER' | 'DFO' | 'TFF' | 'SKOR' | 'BONUS';
type MasterSubMode = 'DETAYLI' | 'DUZ';
type SkorSubMode = 'DETAYLI' | 'DUZ' | 'DFO' | 'TFF';

export default function YeniArsivPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [playersMap, setPlayersMap] = useState<Record<string, PlayerMapEntry>>({});
  const [officialWeeks, setOfficialWeeks] = useState<OfficialWeekRow[]>([]);
  const [officialMatches, setOfficialMatches] = useState<OfficialMatchRow[]>([]);
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number>(41);

  // Varsayılan açılış: GENEL PUAN -> MASTER -> DETAYLI MASTER ve üst çekmece KAPALI
  const [activeTab, setActiveTab] = useState<ArchiveTopTab>('GENEL');
  const [mainCat, setMainCat] = useState<MainCategoryTab>('MASTER');
  const [masterMode, setMasterMode] = useState<MasterSubMode>('DETAYLI');
  const [skorMode, setSkorMode] = useState<SkorSubMode>('DETAYLI');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);

  // Kulüp Arması + İsim + Altın Kupa + Ay-Yıldız Türk Bayrağı Çizici
  const renderPlayerNameWithCup = (
    rawName: string,
    isChamp: boolean,
    explicitCups: number = 0,
    favoriteTeam: string = ''
  ) => {
    const cleanName = String(rawName || '')
      .replace(/🏆/g, '')
      .replace(/🇹🇷/g, '')
      .trim();

    const cups = explicitCups > 0 ? explicitCups : getChampionCupCount(cleanName, isChamp);
    const crestUrl = resolveClubCrestUrl(favoriteTeam);

    return (
      <div className="flex items-center gap-1.5 min-w-0">
        {crestUrl ? (
          <img
            src={crestUrl}
            alt=""
            className="w-4 h-4 sm:w-[18px] sm:h-[18px] object-contain shrink-0 drop-shadow-sm"
            loading="lazy"
          />
        ) : (
          <span className="w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-full bg-slate-800 border border-slate-700 shrink-0 inline-block" />
        )}

        <span className="truncate leading-tight">{cleanName}</span>

        {cups > 0 && (
          <span className="inline-flex items-center gap-0.5 shrink-0 ml-0.5">
            {Array.from({ length: cups }).map((_, i) => (
              <span key={i} className="text-[11px] sm:text-xs leading-none">
                🏆
              </span>
            ))}
            <img
              src="https://flagcdn.com/w40/tr.png"
              alt="TR"
              className="w-3.5 h-2.5 sm:w-4 sm:h-3 object-cover rounded-[2px] shadow-sm ml-0.5"
              loading="lazy"
            />
          </span>
        )}
      </div>
    );
  };

  useEffect(() => {
    const loadArchiveSystem = async () => {
      setLoading(true);
      try {
        // Tüm resmi maçları 1000 satır limitine takılmadan sayfalayarak çek
        const fetchAllOfficialMatches = async (): Promise<OfficialMatchRow[]> => {
          const all: OfficialMatchRow[] = [];
          let from = 0;
          const step = 1000;
          while (true) {
            const { data, error } = await supabase
              .from('etml_official_matches')
              .select('*')
              .order('week_num', { ascending: true })
              .order('match_index', { ascending: true })
              .range(from, from + step - 1);

            if (error || !data || data.length === 0) break;
            all.push(...(data as OfficialMatchRow[]));
            if (data.length < step) break;
            from += step;
          }
          return all;
        };

        const [offPlayersRes, legacyPlayersRes, offWeeksRes, recentBulRes, offMatchesAll] =
          await Promise.all([
            supabase.from('etml_official_players').select('*'),
            supabase.from('players').select('*'),
            supabase.from('etml_official_weeks').select('*').order('week_num', { ascending: true }),
            supabase.from('matches_bulletin').select('*'),
            fetchAllOfficialMatches(),
          ]);

        const pMap: Record<string, PlayerMapEntry> = {};

        // 1) Yedek TEST_ACCOUNTS tabanı
        if (TEST_ACCOUNTS && typeof TEST_ACCOUNTS === 'object') {
          Object.entries(TEST_ACCOUNTS as Record<string, any>).forEach(([uid, val]) => {
            const cleanUid = String(uid || '').trim();
            if (!cleanUid || EXCLUDED_IDS.has(cleanUid.toLowerCase())) return;
            const rawName = String(val?.name || val?.full_name || cleanUid);
            const hasTrophyInText = rawName.includes('🏆');
            const clean = rawName.replace(/🏆/g, '').replace(/🇹🇷/g, '').trim();
            const cCount = getChampionCupCount(clean, hasTrophyInText);
            pMap[cleanUid] = {
              name: clean,
              isChampion: cCount > 0,
              cupCount: cCount,
              favoriteTeam: String(val?.favorite_team || val?.favoriteTeam || '').trim(),
            };
          });
        }

        // 2) Klasik players tablosu
        (legacyPlayersRes.data || []).forEach((lp: any) => {
          const uid = String(lp?.username || lp?.user_id || lp?.id || '').trim();
          if (!uid || EXCLUDED_IDS.has(uid.toLowerCase())) return;
          if (lp?.is_active === false) return;
          const rawName = String(lp?.name || lp?.full_name || pMap[uid]?.name || uid);
          const hasTrophy = rawName.includes('🏆') || Boolean(lp?.is_champion);
          const clean = rawName.replace(/🏆/g, '').replace(/🇹🇷/g, '').trim();
          const cCount = getChampionCupCount(clean, hasTrophy);
          pMap[uid] = {
            name: clean,
            isChampion: cCount > 0,
            cupCount: cCount,
            favoriteTeam: String(lp?.favorite_team || pMap[uid]?.favoriteTeam || '').trim(),
          };
        });

        // 3) Resmi oyuncular tablosu (En güncel isim, aktiflik ve kulüp arması)
        (offPlayersRes.data || []).forEach((op: any) => {
          const uid = String(op?.user_id || '').trim();
          if (!uid || EXCLUDED_IDS.has(uid.toLowerCase())) return;
          if (op?.is_active === false) {
            delete pMap[uid];
            return;
          }
          const rawName = String(op?.full_name || pMap[uid]?.name || uid);
          const hasTrophy = rawName.includes('🏆') || Boolean(op?.is_champion);
          const clean = rawName.replace(/🏆/g, '').replace(/🇹🇷/g, '').trim();
          const explicitCount = Number(op?.champion_count || 0);
          const cCount = explicitCount > 0 ? explicitCount : getChampionCupCount(clean, hasTrophy);
          pMap[uid] = {
            name: clean,
            isChampion: cCount > 0,
            cupCount: cCount,
            favoriteTeam: String(op?.favorite_team || pMap[uid]?.favoriteTeam || '').trim(),
          };
        });

        setPlayersMap(pMap);

        const weeksRows = (offWeeksRes.data || []) as OfficialWeekRow[];
        setOfficialWeeks(weeksRows);
        setOfficialMatches(offMatchesAll);

        const recentBul = recentBulRes.data || [];
        const currentNow = Date.now();
        const weekSet = new Set<number>();

        offMatchesAll.forEach((m) => weekSet.add(Number(m.week_num)));
        weeksRows.forEach((w) => weekSet.add(Number(w.week_num)));
        recentBul.forEach((b: any) => {
          const wn = Number(b?.week_num || b?.week || 0);
          if (wn > 0) weekSet.add(wn);
        });

        const allDistinctWeeks = Array.from(weekSet)
          .filter((w) => w > 0)
          .sort((a, b) => a - b);

        const startedWeeks = allDistinctWeeks.filter((w) => {
          const bulForW = recentBul.filter((b: any) => Number(b?.week_num || b?.week) === w);
          const offForW = offMatchesAll.filter((m) => Number(m.week_num) === w);

          if (offForW.some((m) => m.status === 'FINISHED')) return true;

          const sourceMatches = bulForW.length > 0 ? bulForW : offForW;
          if (sourceMatches.length === 0) return w <= 41;

          const kickoffs = sourceMatches
            .map((m: any) =>
              getMatchTimeMs(
                String(m?.match_date || m?.date || '').trim(),
                String(m?.match_time || m?.time || '').trim()
              )
            )
            .filter((ms: number) => ms > 0);

          if (kickoffs.length === 0) return w <= 41;
          const firstKickoffMs = Math.min(...kickoffs);
          return currentNow >= firstKickoffMs;
        });

        const activeList = startedWeeks.length > 0 ? startedWeeks : allDistinctWeeks;
        const latestWeek = activeList.length > 0 ? activeList[activeList.length - 1] : 41;

        setAvailableWeeks(activeList.length > 0 ? activeList : [41]);
        setSelectedWeek(latestWeek);
      } catch (err) {
        console.error('Arşiv yükleme hatası:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArchiveSystem();
  }, []);
  // Kümülatif veya tek haftalık puan hesaplama motoru
  const buildStandingsForRange = (fromWeek: number, toWeek: number): PlayerStatRow[] => {
    const stats: Record<string, PlayerStatRow> = {};

    Object.entries(playersMap).forEach(([uid, pInfo]) => {
      if (EXCLUDED_IDS.has(uid.toLowerCase())) return;
      stats[uid] = {
        id: uid,
        name: pInfo.name,
        isChampion: pInfo.isChampion,
        cupCount: pInfo.cupCount,
        favoriteTeam: pInfo.favoriteTeam || '',
        dfoPts: 0,
        tffPts: 0,
        bonusPts: 0,
        totalPts: 0,
        dfoExact: 0,
        tffExact: 0,
        totalExact: 0,
        puanLiderWeeks: [],
        skorKralWeeks: [],
      };
    });

    officialMatches.forEach((m) => {
      const w = Number(m.week_num);
      if (w < fromWeek || w > toWeek) return;
      if (m.status !== 'FINISHED') return;

      const isTff = String(m.pool_type || '').toUpperCase() === 'TFF';
      const defaultPts = isTff ? 4 : 3;
      const pts = Number(m.points_awarded ?? defaultPts);
      const winners = Array.isArray(m.winner_ids) ? m.winner_ids : [];

      winners.forEach((rawUid) => {
        const uid = String(rawUid || '').trim();
        if (!uid || EXCLUDED_IDS.has(uid.toLowerCase())) return;
        if (!stats[uid]) {
          const cCount = getChampionCupCount(uid, false);
          stats[uid] = {
            id: uid,
            name: uid,
            isChampion: cCount > 0,
            cupCount: cCount,
            favoriteTeam: '',
            dfoPts: 0,
            tffPts: 0,
            bonusPts: 0,
            totalPts: 0,
            dfoExact: 0,
            tffExact: 0,
            totalExact: 0,
            puanLiderWeeks: [],
            skorKralWeeks: [],
          };
        }
        if (isTff) {
          stats[uid].tffPts += pts;
          stats[uid].tffExact += 1;
        } else {
          stats[uid].dfoPts += pts;
          stats[uid].dfoExact += 1;
        }
        stats[uid].totalExact += 1;
      });
    });

    officialWeeks.forEach((ow) => {
      const w = Number(ow.week_num);
      if (w < fromWeek || w > toWeek) return;
      if (!ow.is_completed || !ow.bonus_enabled) return;

      const pBonus = Number(ow.puan_bonus || 0);
      const sBonus = Number(ow.skor_bonus || 0);
      const pLeaders = Array.isArray(ow.puan_lideri_ids) ? ow.puan_lideri_ids : [];
      const sKings = Array.isArray(ow.skor_krali_ids) ? ow.skor_krali_ids : [];

      if (pBonus > 0 && pLeaders.length === 1) {
        const uid = String(pLeaders[0] || '').trim();
        if (stats[uid]) {
          stats[uid].bonusPts += pBonus;
          stats[uid].puanLiderWeeks.push(w);
        }
      }
      if (sBonus > 0 && sKings.length === 1) {
        const uid = String(sKings[0] || '').trim();
        if (stats[uid]) {
          stats[uid].bonusPts += sBonus;
          stats[uid].skorKralWeeks.push(w);
        }
      }
    });

    return Object.values(stats).map((r) => ({
      ...r,
      totalPts: r.dfoPts + r.tffPts + r.bonusPts,
    }));
  };

  const maxStartedWeek = useMemo(() => {
    return availableWeeks.length > 0 ? availableWeeks[availableWeeks.length - 1] : 41;
  }, [availableWeeks]);

  const cumulativeRows = useMemo(
    () => buildStandingsForRange(1, maxStartedWeek),
    [playersMap, officialMatches, officialWeeks, maxStartedWeek]
  );

  const weekCumulativeRows = useMemo(
    () => buildStandingsForRange(1, selectedWeek),
    [playersMap, officialMatches, officialWeeks, selectedWeek]
  );

  const singleWeekRows = useMemo(
    () => buildStandingsForRange(selectedWeek, selectedWeek),
    [playersMap, officialMatches, officialWeeks, selectedWeek]
  );

  // Sıralama fonksiyonları
  const sortMaster = (rows: PlayerStatRow[]) =>
    [...rows].sort(
      (a, b) =>
        b.totalPts - a.totalPts ||
        b.totalExact - a.totalExact ||
        b.dfoPts - a.dfoPts ||
        a.name.localeCompare(b.name, 'tr')
    );

  const sortDfo = (rows: PlayerStatRow[]) =>
    [...rows].sort(
      (a, b) =>
        b.dfoPts - a.dfoPts ||
        b.dfoExact - a.dfoExact ||
        b.totalPts - a.totalPts ||
        a.name.localeCompare(b.name, 'tr')
    );

  const sortTff = (rows: PlayerStatRow[]) =>
    [...rows].sort(
      (a, b) =>
        b.tffPts - a.tffPts ||
        b.tffExact - a.tffExact ||
        b.totalPts - a.totalPts ||
        a.name.localeCompare(b.name, 'tr')
    );

  const sortSkorMaster = (rows: PlayerStatRow[]) =>
    [...rows].sort(
      (a, b) =>
        b.totalExact - a.totalExact ||
        b.totalPts - a.totalPts ||
        b.dfoExact - a.dfoExact ||
        a.name.localeCompare(b.name, 'tr')
    );

  const sortSkorDfo = (rows: PlayerStatRow[]) =>
    [...rows].sort(
      (a, b) =>
        b.dfoExact - a.dfoExact ||
        b.dfoPts - a.dfoPts ||
        a.name.localeCompare(b.name, 'tr')
    );

  const sortSkorTff = (rows: PlayerStatRow[]) =>
    [...rows].sort(
      (a, b) =>
        b.tffExact - a.tffExact ||
        b.tffPts - a.tffPts ||
        a.name.localeCompare(b.name, 'tr')
    );

  const sortBonus = (rows: PlayerStatRow[]) =>
    [...rows]
      .filter((r) => r.bonusPts > 0)
      .sort(
        (a, b) =>
          b.bonusPts - a.bonusPts ||
          b.totalPts - a.totalPts ||
          a.name.localeCompare(b.name, 'tr')
      );

  // Üstteki kapalı barın üzerinde görünen özet başlık
  const activeSummaryLabel = useMemo(() => {
    if (activeTab === 'MAC_ARSIVI') return `${selectedWeek}. HAFTA MAÇ ARŞİVİ`;
    if (activeTab === 'LIDERLER') return 'HAFTALIK LİDERLER TABLOSU';
    const prefix =
      activeTab === 'GENEL'
        ? 'GENEL PUAN DURUMU'
        : activeTab === 'HAFTA_OZET'
        ? `${selectedWeek}. HAFTA ÖZETİ`
        : `${selectedWeek}. HAFTA GENEL`;

    if (mainCat === 'MASTER') {
      return `${prefix} • ${masterMode === 'DETAYLI' ? 'DETAYLI MASTER' : 'MASTER PUAN'}`;
    }
    if (mainCat === 'DFO') return `${prefix} • DFO PUANI`;
    if (mainCat === 'TFF') return `${prefix} • TFF PUANI`;
    if (mainCat === 'BONUS') return `${prefix} • BONUS PUAN`;
    const sLabel =
      skorMode === 'DETAYLI'
        ? 'DETAYLI SKOR'
        : skorMode === 'DFO'
        ? 'DFO SKOR'
        : skorMode === 'TFF'
        ? 'TFF SKOR'
        : 'TOPLAM SKOR';
    return `${prefix} • ${sLabel}`;
  }, [activeTab, selectedWeek, mainCat, masterMode, skorMode]);

  // ÇİFT EKSENLİ DONDURULMUŞ TABLO: ÜST SÜTUN BAŞLIKLARI + SOL YARIŞMACI SÜTUNU SABİT, SAĞ SÜTUNLAR KAYDIRMALI
  // Not: Tarayıcıda dikey sticky'nin bozulmaması için tablo yatay kaydırması sticky thead'in altında çalışır.
  const renderDetailedMasterTable = (rows: PlayerStatRow[], headerTitle: string = 'GENEL PUAN DURUMU') => {
    const sorted = sortMaster(rows);

    return (
      <div className="w-full overflow-x-auto overscroll-x-contain">
        <table className="w-max min-w-full border-separate border-spacing-0 text-left tabular-nums">
          <thead>
            <tr className="bg-[#050c1d] text-[10px] sm:text-xs uppercase font-black">
              <th className="sticky left-0 z-30 bg-[#050c1d] border-b border-slate-800 py-2.5 pl-2 pr-1 w-[28px] sm:w-12 text-slate-400 align-bottom">
                #
              </th>
              <th className="sticky left-[28px] sm:left-12 z-30 bg-[#050c1d] border-b border-r border-slate-700 shadow-[4px_0_10px_rgba(0,0,0,0.55)] py-2.5 px-2 min-w-[222px] max-w-[238px] sm:min-w-[290px] sm:max-w-none text-white tracking-wide align-bottom">
                {headerTitle}
              </th>
              <th className="bg-[#050c1d] border-b border-slate-800 py-2 px-2 w-[56px] sm:w-20 text-center text-sky-400 align-bottom">
                <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">
                  DFO
                </span>
              </th>
              <th className="bg-[#050c1d] border-b border-slate-800 py-2 px-2 w-[56px] sm:w-20 text-center text-rose-500 align-bottom">
                <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">
                  TFF
                </span>
              </th>
              <th className="bg-[#050c1d] border-b border-slate-800 py-2 px-2 w-[56px] sm:w-20 text-center text-orange-400 align-bottom">
                <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">
                  SKOR
                </span>
              </th>
              <th className="bg-[#050c1d] border-b border-slate-800 py-2 px-2 w-[56px] sm:w-20 text-center text-emerald-400 align-bottom">
                <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">
                  BONUS
                </span>
              </th>
              <th className="bg-[#081530] border-b border-slate-800 py-2 px-2.5 w-[66px] sm:w-24 text-center text-sky-200 align-bottom">
                <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">
                  MASTER
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => (
              <tr key={row.id} className="group hover:bg-slate-800/40 transition-colors">
                <td className="sticky left-0 z-10 bg-[#060d1f] group-hover:bg-[#0d1830] border-b border-slate-800/70 py-2.5 pl-2 pr-1 font-bold text-slate-400 text-xs sm:text-sm">
                  {idx + 1}
                </td>
                <td className="sticky left-[28px] sm:left-12 z-10 bg-[#060d1f] group-hover:bg-[#0d1830] border-b border-r border-slate-700/80 shadow-[4px_0_10px_rgba(0,0,0,0.45)] py-2.5 px-2 min-w-[222px] max-w-[238px] sm:min-w-[290px] sm:max-w-none font-black text-white text-[12.5px] sm:text-sm">
                  {renderPlayerNameWithCup(row.name, row.isChampion, row.cupCount, row.favoriteTeam)}
                </td>
                <td className="border-b border-slate-800/70 py-2.5 px-2 text-center font-extrabold text-sky-400 text-[13.5px] sm:text-sm">
                  {row.dfoPts}
                </td>
                <td className="border-b border-slate-800/70 py-2.5 px-2 text-center font-extrabold text-rose-500 text-[13.5px] sm:text-sm">
                  {row.tffPts}
                </td>
                <td className="border-b border-slate-800/70 py-2.5 px-2 text-center font-black text-orange-400 text-[13.5px] sm:text-sm">
                  {row.totalExact}
                </td>
                <td className="border-b border-slate-800/70 py-2.5 px-2 text-center font-bold text-emerald-400 text-[13.5px] sm:text-sm">
                  {row.bonusPts > 0 ? `+${row.bonusPts}` : '0'}
                </td>
                <td className="border-b border-slate-800/70 bg-sky-500/10 py-2.5 px-2.5 text-center font-black text-sky-200 text-sm sm:text-base">
                  {row.totalPts}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // DETAYLI SKOR TABLOSU (SOLDAN SABİT + SAĞDAN KAYDIRMALI)
  const renderDetailedSkorTable = (rows: PlayerStatRow[], headerTitle: string = 'GENEL SKOR DURUMU') => {
    const sorted = sortSkorMaster(rows);
    return (
      <div className="w-full overflow-x-auto overscroll-x-contain">
        <table className="w-max min-w-full border-separate border-spacing-0 text-left tabular-nums">
          <thead>
            <tr className="bg-[#050c1d] text-[10px] sm:text-xs uppercase font-black">
              <th className="sticky left-0 z-30 bg-[#050c1d] border-b border-slate-800 py-2.5 pl-2 pr-1 w-[28px] sm:w-12 text-slate-400 align-bottom">
                #
              </th>
              <th className="sticky left-[28px] sm:left-12 z-30 bg-[#050c1d] border-b border-r border-slate-700 shadow-[4px_0_10px_rgba(0,0,0,0.55)] py-2.5 px-2 min-w-[222px] max-w-[238px] sm:min-w-[290px] sm:max-w-none text-white align-bottom">
                {headerTitle}
              </th>
              <th className="bg-[#050c1d] border-b border-slate-800 py-2 px-2.5 w-[60px] sm:w-24 text-center text-sky-400 align-bottom">
                <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">
                  DFO
                </span>
              </th>
              <th className="bg-[#050c1d] border-b border-slate-800 py-2 px-2.5 w-[60px] sm:w-24 text-center text-rose-500 align-bottom">
                <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">
                  TFF
                </span>
              </th>
              <th className="bg-[#081530] border-b border-slate-800 py-2 px-3 w-[68px] sm:w-28 text-center text-orange-400 align-bottom">
                <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">
                  SKOR
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => (
              <tr key={row.id} className="group hover:bg-slate-800/40 transition-colors">
                <td className="sticky left-0 z-10 bg-[#060d1f] group-hover:bg-[#0d1830] border-b border-slate-800/70 py-2.5 pl-2 pr-1 font-bold text-slate-400 text-xs sm:text-sm">
                  {idx + 1}
                </td>
                <td className="sticky left-[28px] sm:left-12 z-10 bg-[#060d1f] group-hover:bg-[#0d1830] border-b border-r border-slate-700/80 shadow-[4px_0_10px_rgba(0,0,0,0.45)] py-2.5 px-2 min-w-[222px] max-w-[238px] sm:min-w-[290px] sm:max-w-none font-black text-white text-[12.5px] sm:text-sm">
                  {renderPlayerNameWithCup(row.name, row.isChampion, row.cupCount, row.favoriteTeam)}
                </td>
                <td className="border-b border-slate-800/70 py-2.5 px-2.5 text-center font-bold text-sky-400 text-[13.5px] sm:text-sm">
                  {row.dfoExact}
                </td>
                <td className="border-b border-slate-800/70 py-2.5 px-2.5 text-center font-bold text-rose-500 text-[13.5px] sm:text-sm">
                  {row.tffExact}
                </td>
                <td className="border-b border-slate-800/70 bg-orange-500/10 py-2.5 px-3 text-center font-black text-orange-400 text-sm sm:text-base">
                  {row.totalExact}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // STANDART 3 SÜTUNLU TABLO (MASTER PUAN, DFO, TFF, SKOR DÜZ, BONUS) - ÜST BAŞLIK DONMUŞ
  const renderSimpleThreeColTable = (
    sortedRows: PlayerStatRow[],
    leftTitle: string,
    rightTitle: string,
    valueColorCls: string,
    getVal: (r: PlayerStatRow) => string | number
  ) => {
    if (sortedRows.length === 0) {
      return (
        <div className="text-center py-10 text-slate-400 text-xs font-bold tracking-widest uppercase">
          HENÜZ PUAN ALAN YARIŞMACI BULUNMUYOR
        </div>
      );
    }

    return (
      <table className="w-full table-fixed text-left tabular-nums">
        <thead className="sticky top-[52px] z-20 bg-[#050c1d]">
          <tr className="bg-[#050c1d] border-b border-slate-800 text-[10px] sm:text-xs uppercase tracking-wider font-black">
            <th className="py-2.5 px-2 sm:px-3 w-8 sm:w-14 text-slate-400 border-b border-slate-800">#</th>
            <th className="py-2.5 px-1.5 sm:px-3 text-white border-b border-slate-800">{leftTitle}</th>
            <th className={`py-2.5 px-2.5 sm:px-3 w-28 sm:w-40 text-right border-b border-slate-800 ${valueColorCls}`}>
              {rightTitle}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70">
          {sortedRows.map((row, idx) => (
            <tr key={row.id} className="hover:bg-slate-800/35 transition-colors">
              <td className="py-2.5 px-2 sm:px-3 font-bold text-slate-400 text-xs sm:text-sm">
                {idx + 1}
              </td>
              <td className="py-2.5 px-1.5 sm:px-3 font-black text-white text-[12.5px] sm:text-sm">
                {renderPlayerNameWithCup(row.name, row.isChampion, row.cupCount, row.favoriteTeam)}
              </td>
              <td className={`py-2.5 px-2.5 sm:px-3 text-right font-black text-[13.5px] sm:text-base ${valueColorCls}`}>
                {getVal(row)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // BONUS TABLOSU (STANDART 3 SÜTUN)
  const renderBonusTable = (rows: PlayerStatRow[]) =>
    renderSimpleThreeColTable(
      sortBonus(rows),
      'GENEL PUAN DURUMU',
      'BONUS PUAN',
      'text-emerald-400',
      (r) => `+${r.bonusPts}`
    );

  // AKTİF PUAN GÖRÜNÜMÜ SEÇİCİSİ
  const renderStandingsDispatcher = (rows: PlayerStatRow[], headerTitle: string) => {
    if (mainCat === 'MASTER') {
      return masterMode === 'DETAYLI'
        ? renderDetailedMasterTable(rows, headerTitle)
        : renderSimpleThreeColTable(sortMaster(rows), headerTitle, 'MASTER PUAN', 'text-sky-300', (r) => r.totalPts);
    }
    if (mainCat === 'DFO') {
      return renderSimpleThreeColTable(sortDfo(rows), headerTitle, 'DFO PUANI', 'text-sky-400', (r) => r.dfoPts);
    }
    if (mainCat === 'TFF') {
      return renderSimpleThreeColTable(sortTff(rows), headerTitle, 'TFF PUANI', 'text-rose-500', (r) => r.tffPts);
    }
    if (mainCat === 'BONUS') {
      return renderBonusTable(rows);
    }
    if (skorMode === 'DETAYLI') return renderDetailedSkorTable(rows, headerTitle);
    if (skorMode === 'DFO') {
      return renderSimpleThreeColTable(sortSkorDfo(rows), headerTitle, 'DFO SKOR', 'text-sky-400', (r) => r.dfoExact);
    }
    if (skorMode === 'TFF') {
      return renderSimpleThreeColTable(sortSkorTff(rows), headerTitle, 'TFF SKOR', 'text-rose-500', (r) => r.tffExact);
    }
    return renderSimpleThreeColTable(sortSkorMaster(rows), headerTitle, 'TOPLAM SKOR', 'text-orange-400', (r) => r.totalExact);
  };

  // MAÇ ARŞİVİ GÖRÜNÜMÜ
  const renderMatchArchiveView = () => {
    const weekMatches = officialMatches
      .filter((m) => Number(m.week_num) === selectedWeek)
      .sort((a, b) => Number(a.match_index) - Number(b.match_index));

    if (weekMatches.length === 0) {
      return (
        <div className="text-center py-12 text-slate-400 text-xs font-bold uppercase tracking-widest">
          {selectedWeek}. HAFTAYA AİT RESMİ MAÇ KAYDI BULUNAMADI
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-2 sm:p-4">
        {weekMatches.map((m) => {
          const winners = (m.winner_ids || [])
            .filter((uid) => !EXCLUDED_IDS.has(String(uid || '').toLowerCase()))
            .map((uid) => playersMap[uid]?.name || uid)
            .filter(Boolean);
          const isTff = String(m.pool_type || '').toUpperCase() === 'TFF';

          return (
            <div
              key={m.id}
              className="rounded-xl border border-slate-800 bg-[#071024] p-3 flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                <span className={isTff ? 'text-rose-400' : 'text-sky-400'}>
                  #{m.match_index} • {m.category}
                </span>
                <span className="text-slate-400">
                  {m.match_date} {m.match_time}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 py-1 text-xs sm:text-sm font-black text-white">
                <span className="truncate flex-1">{m.home_team}</span>
                <span className="px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 tabular-nums">
                  {m.status === 'POSTPONED' ? 'ERT' : `${m.home_score} - ${m.away_score}`}
                </span>
                <span className="truncate flex-1 text-right">{m.away_team}</span>
              </div>
              <div className="text-[10.5px] text-slate-300 border-t border-slate-800/80 pt-1.5">
                {winners.length > 0 ? (
                  <span>
                    <strong className="text-emerald-400">Bilenler ({winners.length}):</strong>{' '}
                    {winners.join(', ')}
                  </span>
                ) : (
                  <span className="text-slate-500">Tam skor bilen çıkmadı</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // HAFTALIK LİDERLER TABLOSU
  const renderWeeklyLeadersView = () => {
    const completedWeeks = [...officialWeeks]
      .filter((w) => w.is_completed && Number(w.week_num) <= maxStartedWeek)
      .sort((a, b) => Number(b.week_num) - Number(a.week_num));

    return (
      <div className="w-full overflow-x-auto overscroll-x-contain">
        <table className="w-max min-w-full border-separate border-spacing-0 text-left tabular-nums">
          <thead>
            <tr className="bg-[#050c1d] text-[10px] sm:text-xs uppercase font-black">
              <th className="sticky left-0 z-20 bg-[#050c1d] border-b border-slate-800 py-2.5 px-2 w-[48px] sm:w-16 text-slate-400">
                HAFTA
              </th>
              <th className="sticky left-[48px] sm:left-16 z-20 bg-[#050c1d] border-b border-r border-slate-700/80 shadow-[4px_0_10px_rgba(0,0,0,0.55)] py-2.5 px-2 min-w-[215px] sm:min-w-[270px] text-white">
                HAFTANIN LİDERİ
              </th>
              <th className="border-b border-slate-800 py-2.5 px-2 text-center text-sky-400">DFO</th>
              <th className="border-b border-slate-800 py-2.5 px-2 text-center text-rose-500">TFF</th>
              <th className="border-b border-slate-800 py-2.5 px-2 text-center text-orange-400">SKOR</th>
              <th className="border-b border-slate-800 py-2.5 px-2 text-center text-emerald-400">BNS</th>
              <th className="border-b border-slate-800 py-2.5 px-2.5 text-center text-sky-200 bg-[#081530]">
                MASTER
              </th>
            </tr>
          </thead>
          <tbody>
            {completedWeeks.map((ow) => {
              const w = Number(ow.week_num);
              const wRows = buildStandingsForRange(w, w);
              const leaderIds = Array.isArray(ow.puan_lideri_ids) ? ow.puan_lideri_ids : [];
              const leadersToRender =
                leaderIds.length > 0
                  ? leaderIds.map((id) => wRows.find((r) => r.id === id)).filter(Boolean)
                  : [sortMaster(wRows)[0]].filter(Boolean);

              return leadersToRender.map((ldr, idx) =>
                ldr ? (
                  <tr key={`${w}-${ldr.id}-${idx}`} className="hover:bg-slate-800/35">
                    <td className="sticky left-0 z-10 bg-[#060d1f] border-b border-slate-800/70 py-2 px-2 font-black text-amber-400 text-xs">
                      {w}.H
                    </td>
                    <td className="sticky left-[48px] sm:left-16 z-10 bg-[#060d1f] border-b border-r border-slate-700/80 shadow-[4px_0_10px_rgba(0,0,0,0.45)] py-2 px-2 font-black text-white text-xs sm:text-sm">
                      {renderPlayerNameWithCup(ldr.name, ldr.isChampion, ldr.cupCount, ldr.favoriteTeam)}
                    </td>
                    <td className="border-b border-slate-800/70 py-2 px-2 text-center font-bold text-sky-400 text-xs sm:text-sm">
                      {ldr.dfoPts}
                    </td>
                    <td className="border-b border-slate-800/70 py-2 px-2 text-center font-bold text-rose-500 text-xs sm:text-sm">
                      {ldr.tffPts}
                    </td>
                    <td className="border-b border-slate-800/70 py-2 px-2 text-center font-black text-orange-400 text-xs sm:text-sm">
                      {ldr.totalExact}
                    </td>
                    <td className="border-b border-slate-800/70 py-2 px-2 text-center font-bold text-emerald-400 text-xs sm:text-sm">
                      {ldr.bonusPts > 0 ? `+${ldr.bonusPts}` : '0'}
                    </td>
                    <td className="border-b border-slate-800/70 bg-sky-500/10 py-2 px-2.5 text-center font-black text-sky-200 text-xs sm:text-sm">
                      {ldr.totalPts}
                    </td>
                  </tr>
                ) : null
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
        <div className="text-xs sm:text-sm font-black uppercase tracking-widest text-sky-400 animate-pulse">
          PUAN DURUMLARI VE ARŞİV YÜKLENİYOR...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white pb-14">
      <div className="max-w-5xl mx-auto px-1 sm:px-4 pt-1.5">
        {/* TEK KUTUDA DONDURULMUŞ AÇILIR/KAPANIR KONTROL PANELİ + SABİT SÜTUN BİLGİSİ */}
        <div className="sticky top-0 z-40 bg-[#040918]/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-lg mb-1.5">
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen((prev) => !prev)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left"
          >
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-sky-300 truncate">
                {activeSummaryLabel}
              </div>
              <div className="text-[9.5px] sm:text-[10.5px] font-semibold text-slate-400 truncate">
                {isFilterDrawerOpen
                  ? 'Kapatmak için dokunun • Sütunları sağdan sola kaydırın'
                  : 'Hafta ve kategori ayarları için dokunun • Sütunlar: DFO | TFF | SKOR | BNS | MASTER'}
              </div>
            </div>
            <span className="shrink-0 px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-[10px] font-black text-amber-300">
              {isFilterDrawerOpen ? 'KAPAT ▲' : 'AYARLAR ▼'}
            </span>
          </button>

          {isFilterDrawerOpen && (
            <div className="px-2.5 pb-2.5 pt-1.5 border-t border-slate-800/90 space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <div className="flex items-center gap-1 bg-[#071024] border border-slate-700 rounded-lg px-2 py-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase">HAFTA</span>
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(Number(e.target.value))}
                    className="bg-transparent text-amber-300 text-[11px] font-black focus:outline-none"
                  >
                    {availableWeeks.map((w) => (
                      <option key={w} value={w} className="bg-[#050c1d] text-white">
                        {w}. Hafta
                      </option>
                    ))}
                  </select>
                </div>

                {(
                  [
                    { key: 'GENEL', label: 'GENEL PUAN' },
                    { key: 'MAC_ARSIVI', label: 'MAÇ ARŞİVİ' },
                    { key: 'HAFTA_OZET', label: `${selectedWeek}. HAFTA ÖZETİ` },
                    { key: 'HAFTA_GENEL', label: `${selectedWeek}. HAFTA GENEL` },
                    { key: 'LIDERLER', label: 'LİDERLER' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-colors ${
                      activeTab === t.key
                        ? 'bg-sky-700 text-white border-sky-400'
                        : 'bg-[#071024] text-slate-300 border-slate-800 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {(activeTab === 'GENEL' || activeTab === 'HAFTA_OZET' || activeTab === 'HAFTA_GENEL') && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/70">
                  {(['MASTER', 'DFO', 'TFF', 'SKOR', 'BONUS'] as const).map((cat) => {
                    const active = mainCat === cat;
                    let cls = 'bg-[#071024] text-slate-300 border-slate-800';
                    if (active) {
                      if (cat === 'TFF') cls = 'bg-rose-700 text-white border-rose-400';
                      else if (cat === 'DFO') cls = 'bg-blue-700 text-white border-sky-400';
                      else if (cat === 'SKOR') cls = 'bg-orange-600 text-white border-orange-300';
                      else if (cat === 'BONUS') cls = 'bg-emerald-700 text-white border-emerald-400';
                      else cls = 'bg-sky-700 text-white border-sky-300';
                    }
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setMainCat(cat);
                          if (cat === 'MASTER') setMasterMode('DETAYLI');
                          if (cat === 'SKOR') setSkorMode('DETAYLI');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${cls}`}
                      >
                        {cat}
                      </button>
                    );
                  })}

                  {mainCat === 'MASTER' && (
                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        type="button"
                        onClick={() => setMasterMode('DETAYLI')}
                        className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase border ${
                          masterMode === 'DETAYLI'
                            ? 'bg-sky-900/70 text-white border-sky-300'
                            : 'bg-[#040917] text-slate-400 border-slate-800'
                        }`}
                      >
                        DETAYLI MASTER
                      </button>
                      <button
                        type="button"
                        onClick={() => setMasterMode('DUZ')}
                        className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase border ${
                          masterMode === 'DUZ'
                            ? 'bg-sky-900/70 text-sky-200 border-sky-400'
                            : 'bg-[#040917] text-slate-400 border-slate-800'
                        }`}
                      >
                        MASTER PUAN
                      </button>
                    </div>
                  )}

                  {mainCat === 'SKOR' && (
                    <div className="flex flex-wrap items-center gap-1 ml-auto">
                      {(
                        [
                          { k: 'DETAYLI', l: 'DETAYLI' },
                          { k: 'DUZ', l: 'TOPLAM' },
                          { k: 'DFO', l: 'DFO' },
                          { k: 'TFF', l: 'TFF' },
                        ] as const
                      ).map((s) => (
                        <button
                          key={s.k}
                          type="button"
                          onClick={() => setSkorMode(s.k)}
                          className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase border ${
                            skorMode === s.k
                              ? 'bg-orange-950/80 text-orange-300 border-orange-400'
                              : 'bg-[#040917] text-slate-400 border-slate-800'
                          }`}
                        >
                          {s.l}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ANA TABLO KARTI */}
        <div className="bg-[#060d1f] border border-slate-800/90 rounded-xl shadow-xl">
          {activeTab === 'GENEL' && renderStandingsDispatcher(cumulativeRows, 'GENEL PUAN DURUMU')}
          {activeTab === 'HAFTA_OZET' &&
            renderStandingsDispatcher(singleWeekRows, `${selectedWeek}. HAFTA ÖZETİ`)}
          {activeTab === 'HAFTA_GENEL' &&
            renderStandingsDispatcher(weekCumulativeRows, `${selectedWeek}. HAFTA GENEL`)}
          {activeTab === 'MAC_ARSIVI' && renderMatchArchiveView()}
          {activeTab === 'LIDERLER' && renderWeeklyLeadersView()}
        </div>
      </div>
    </div>
  );
}