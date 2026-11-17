'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/utils/supabase';
import {
  TEST_ACCOUNTS,
  getEliteTheme,
  getMatchTimeMs,
  getUniqueMatchId
} from '@/utils/themeEngine';

const EXCLUDED_IDS = new Set(['mankoman', '272727', '262787']);

// Şampiyonluk Kupası Sayıları ve Son Şampiyon Türk Bayrağı Arması
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
    .replace(/İ/g, 'I')
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
  if (norm.includes('OSMAN ALI AYDIN') || norm.includes('GAZI AYAN') || norm.includes('ILHAN KARACA')) return 2;
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
      <polygon
        points="16.2,10 19.3,11 17.4,8.4 17.4,11.6 19.3,9"
        fill="#FFFFFF"
      />
    </svg>
  </span>
);

const hasChampionCup = (name: string, isChampFlag?: boolean) => {
  return getChampionCupCount(name, isChampFlag) > 0;
};

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

const advancedTffCheck = (category: string, home: string, away: string) => {
  const cat = normalizeTrName(category);
  const h = normalizeTrName(home);
  const a = normalizeTrName(away);

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
    cat.includes('MILLI') ||
    cat.includes('DUNYA KUPASI') ||
    cat.includes('WORLD CUP') ||
    cat.includes('INGILTERE') ||
    cat.includes('PREMIER') ||
    cat.includes('ISPANYA') ||
    cat.includes('LA LIGA') ||
    cat.includes('ITALYA') ||
    cat.includes('SERIE A') ||
    cat.includes('ALMANYA') ||
    cat.includes('BUNDESLIGA') ||
    cat.includes('FRANSA') ||
    cat.includes('LIGUE 1') ||
    cat.includes('HOLLANDA') ||
    cat.includes('PORTEKIZ') ||
    cat.includes('BELCIKA') ||
    cat.includes('ISKOCYA') ||
    cat.includes('DANIMARKA')
  ) {
    return false;
  }

  if (
    cat.includes('TURKIYE') ||
    cat.includes('TFF') ||
    cat.includes('TRENDYOL') ||
    cat.includes('NESINE') ||
    cat.includes('SUPER LIG') ||
    cat.includes('1. LIG') ||
    cat.includes('1.LIG') ||
    cat.includes('2. LIG') ||
    cat.includes('3. LIG') ||
    cat.includes('ZIRAAT')
  ) {
    return true;
  }

  const teamRegex =
    /(SPOR|GUCU|GENCLER|ANKARA|IZMIR|ISTANBUL|BURSA|TRABZON|ANTALYA|ESKISEHIR|KARSIYAKA|KASIMPASA|GAZIANTEP|SARIYER|IGDIR|GALATASARAY|FENERBAHCE|BESIKTAS|GOZTEPE|KAYSERI|SIVAS|ALANYA|RIZE|KONYA|SAMSUN|BODRUM|PENDIK|KARAGUMRUK|EYUP|AMED|ERZURUM|KOCAELI|BANDIRMA|UMRANIYE|MARDIN|MUGLA|BATMAN|CORUM|MANISA|BOLU|EROK)/;
  return teamRegex.test(h) && teamRegex.test(a);
};

interface OfficialMatchRow {
  id: number | string;
  week_num: number;
  match_index: number;
  category: string;
  pool_type: 'DFO' | 'TFF' | string;
  match_date: string;
  match_time: string;
  home_team: string;
  away_team: string;
  home_score: string | number | null;
  away_score: string | number | null;
  status: string;
  winner_ids: string[] | null;
  points_awarded: number | null;
}

interface OfficialWeekRow {
  week_num: number;
  is_completed: boolean;
  bonus_enabled: boolean;
  puan_lideri_ids: string[] | null;
  puan_bonus: number | null;
  skor_krali_ids: string[] | null;
  skor_bonus: number | null;
}

interface PlayerStatRow {
  id: string;
  name: string;
  isChampion: boolean;
  dfoPts: number;
  tffPts: number;
  bonusPts: number;
  masterPts: number;
  dfoSkor: number;
  tffSkor: number;
  totalSkor: number;
  liveAddPts: number;
  liveAddSkor: number;
  puanLiderWeeks: number[];
  skorKralWeeks: number[];
}

export default function YeniArsivPage() {
  const [loading, setLoading] = useState<boolean>(true);

  // VARSAYILAN (DEFAULT) EKRAN DURUMLARI:
  // HAFTA: Takvim & saat senkronlu aktif hafta (şu an 41. Hafta)
  // SEKME: GENEL PUAN -> MASTER -> DETAYLI MASTER
  const [activeTab, setActiveTab] = useState<
    'TOTAL_STANDINGS' | 'CARDS' | 'WEEK_CHECK' | 'WEEK_CUMULATIVE' | 'LEADERS_TIMELINE'
  >('TOTAL_STANDINGS');
  const [standingsFilter, setStandingsFilter] = useState<
    'CANLI' | 'MASTER' | 'DFO' | 'TFF' | 'SKOR' | 'BONUS'
  >('MASTER');
  const [masterSubFilter, setMasterSubFilter] = useState<'DUZ' | 'DETAYLI'>('DETAYLI');
  const [skorSubFilter, setSkorSubFilter] = useState<'DUZ' | 'DETAYLI' | 'DFO' | 'TFF'>('DUZ');

  const [weekSummaryFilter, setWeekSummaryFilter] = useState<'MASTER' | 'DFO' | 'TFF' | 'SKOR'>('MASTER');
  const [weekSummaryMasterMode, setWeekSummaryMasterMode] = useState<'DUZ' | 'DETAYLI'>('DETAYLI');

  const [weekGenelFilter, setWeekGenelFilter] = useState<'MASTER' | 'DFO' | 'TFF' | 'SKOR' | 'BONUS'>('MASTER');
  const [weekGenelMasterMode, setWeekGenelMasterMode] = useState<'DUZ' | 'DETAYLI'>('DETAYLI');

  const [archivePoolFilter, setArchivePoolFilter] = useState<'ALL' | 'DFO' | 'TFF'>('ALL');
  const [expandedArchiveCards, setExpandedArchiveCards] = useState<Record<string, boolean>>({});

  const [availableWeeks, setAvailableWeeks] = useState<number[]>([41]);
  const [selectedWeek, setSelectedWeek] = useState<number>(41);
  const [activeRealTimeWeeks, setActiveRealTimeWeeks] = useState<number[]>([41]);

  const [playersMap, setPlayersMap] = useState<
    Record<string, { name: string; isChampion: boolean }>
  >({});
  const [officialMatches, setOfficialMatches] = useState<OfficialMatchRow[]>([]);
  const [officialWeeks, setOfficialWeeks] = useState<OfficialWeekRow[]>([]);
  const [recentBulletins, setRecentBulletins] = useState<any[]>([]);
  const [liveMatchesMap, setLiveMatchesMap] = useState<Record<string, any>>({});
  const [activePredictionsMap, setActivePredictionsMap] = useState<Record<string, string>>({});
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchAllOfficialMatchesPaged = async () => {
      let allRows: OfficialMatchRow[] = [];
      let from = 0;
      const step = 500;
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
          allRows = [...allRows, ...(data as OfficialMatchRow[])];
          if (data.length < step) keepGoing = false;
          else from += step;
        }
      }
      return allRows;
    };

    const loadArchiveSystem = async () => {
      try {
        const [offPlayersRes, legacyPlayersRes, offWeeksRes, offMatchesAll, recentBulRes] =
          await Promise.all([
            supabase.from('etml_official_players').select('*'),
            supabase.from('players').select('*'),
            supabase
              .from('etml_official_weeks')
              .select('*')
              .order('week_num', { ascending: true }),
            fetchAllOfficialMatchesPaged(),
            supabase
              .from('matches_bulletin')
              .select('*')
              .gte('week_num', 40)
              .order('week_num', { ascending: true })
              .order('match_index', { ascending: true })
          ]);

        if (!mounted) return;

        // 1. Oyuncu İsim & Şampiyonluk Havuzu
        const pMap: Record<string, { name: string; isChampion: boolean }> = {};
        const disabledIds = new Set<string>(EXCLUDED_IDS);

        Object.keys(TEST_ACCOUNTS).forEach((uid) => {
          if (!disabledIds.has(uid)) {
            const nm = TEST_ACCOUNTS[uid]?.name || uid;
            pMap[uid] = { name: nm, isChampion: hasChampionCup(nm) };
          }
        });

        (offPlayersRes.data || []).forEach((op: any) => {
          const uid = String(op.user_id || '').trim();
          if (!uid) return;
          if (op.is_active === false || EXCLUDED_IDS.has(uid)) {
            disabledIds.add(uid);
            delete pMap[uid];
          } else {
            const nm = String(op.full_name || pMap[uid]?.name || uid).trim();
            const champ = Boolean(op.is_champion || op.has_cup || hasChampionCup(nm));
            pMap[uid] = { name: nm, isChampion: champ };
          }
        });

        (legacyPlayersRes.data || []).forEach((lp: any) => {
          const uid = String(lp.username || lp.user_id || lp.id || '').trim();
          if (!uid || disabledIds.has(uid)) return;
          const nm = String(lp.name || lp.full_name || pMap[uid]?.name || uid).trim();
          const champ = Boolean(lp.is_champion || pMap[uid]?.isChampion || hasChampionCup(nm));
          pMap[uid] = { name: nm, isChampion: champ };
        });

        setPlayersMap(pMap);

        const weeksRows = (offWeeksRes.data || []) as OfficialWeekRow[];
        setOfficialWeeks(weeksRows);
        setOfficialMatches(offMatchesAll);

        const recentBul = recentBulRes.data || [];
        setRecentBulletins(recentBul);

        // 2. Gerçek Zamanlı (Takvim ve Saat Senkronlu) Aktif Hafta Tespiti
        const currentNow = Date.now();
        const weekSet = new Set<number>();
        offMatchesAll.forEach((m) => weekSet.add(Number(m.week_num)));
        weeksRows.forEach((w) => weekSet.add(Number(w.week_num)));
        recentBul.forEach((b: any) => weekSet.add(Number(b.week_num)));

        const allDistinctWeeks = Array.from(weekSet)
          .filter((w) => w > 0)
          .sort((a, b) => a - b);

        // Yalnızca ilk maçının başlama saniyesi gelmiş olan (veya geçmişte tamamlanmış) haftaları al:
        // Böylece henüz başlamamış 42, 43, 44, 45, 46. haftalar zamanı gelene kadar gizli kalır.
        const startedWeeks = allDistinctWeeks.filter((w) => {
          const bulForW = recentBul.filter((b: any) => Number(b.week_num) === w);
          const offForW = offMatchesAll.filter((m) => Number(m.week_num) === w);

          // Geçmişte bitmiş maçı olan arşiv haftaları her zaman dahildir
          if (offForW.some((m) => m.status === 'FINISHED')) return true;

          const sourceMatches = bulForW.length > 0 ? bulForW : offForW;
          if (sourceMatches.length === 0) return w <= 41;

          const kickoffs = sourceMatches
            .map((m: any) =>
              getMatchTimeMs(String(m.match_date || '').trim(), String(m.match_time || '').trim())
            )
            .filter((ms: number) => ms > 0);

          if (kickoffs.length === 0) return w <= 41;
          const firstKickoffMs = Math.min(...kickoffs);
          return currentNow >= firstKickoffMs;
        });

        const effectiveWeeks = startedWeeks.length > 0 ? startedWeeks : [41];
        setAvailableWeeks(effectiveWeeks);

        // Başlamış haftalar içinde henüz oynanmamış / tamamlanmamış maçı olan geçerli haftayı bul (örn: 41. Hafta)
        const ongoingStartedWeeks = effectiveWeeks.filter((w) => {
          const offForW = offMatchesAll.filter((m) => Number(m.week_num) === w);
          const bulForW = recentBul.filter((b: any) => Number(b.week_num) === w);
          if (offForW.length > 0) {
            return offForW.some((m) => m.status !== 'FINISHED' && m.status !== 'POSTPONED');
          }
          if (bulForW.length > 0) {
            return true;
          }
          return false;
        });

        const defaultSyncedWeek =
          ongoingStartedWeeks.length > 0
            ? ongoingStartedWeeks[0]
            : effectiveWeeks[effectiveWeeks.length - 1];

        setSelectedWeek(defaultSyncedWeek);

        // Canlı sekmesi için takip edilecek aktif haftalar
        const liveTargetWeeks =
          ongoingStartedWeeks.length > 0
            ? ongoingStartedWeeks
            : [effectiveWeeks[effectiveWeeks.length - 1]];
        setActiveRealTimeWeeks(liveTargetWeeks);

        // 3. Aktif haftaların canlı maçlarını ve tahminlerini (500'erli dilimlerle 1000 sınırına takılmadan) çek
        const targetLiveIds: number[] = [];
        liveTargetWeeks.forEach((w) => {
          for (let idx = 1; idx <= 24; idx++) {
            targetLiveIds.push(Number(getUniqueMatchId(w, idx)));
          }
        });

        const fetchActivePreds = async () => {
          const chunks = await Promise.all(
            liveTargetWeeks.map(async (w) => {
              let rows: any[] = [];
              let from = 0;
              const step = 500;
              let more = true;
              while (more) {
                const { data, error } = await supabase
                  .from('player_predictions')
                  .select('user_id, week_num, match_index, predicted_score')
                  .eq('week_num', w)
                  .order('match_index', { ascending: true })
                  .order('user_id', { ascending: true })
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
          return chunks.flat();
        };

        const [liveDbRes, activePredRows] = await Promise.all([
          targetLiveIds.length > 0
            ? supabase.from('live_matches').select('*').in('id', targetLiveIds)
            : Promise.resolve({ data: [] as any[] }),
          fetchActivePreds()
        ]);

        if (!mounted) return;

        const lMap: Record<string, any> = {};
        (liveDbRes.data || []).forEach((r: any) => {
          lMap[String(r.id)] = r;
        });
        setLiveMatchesMap(lMap);

        const predMap: Record<string, string> = {};
        activePredRows.forEach((pr: any) => {
          const uid = String(pr.user_id || '').trim();
          if (!uid || EXCLUDED_IDS.has(uid)) return;
          const sc = String(pr.predicted_score || '')
            .replace(/\s+/g, '')
            .replace(':', '-');
          if (sc) {
            predMap[`${uid}-${pr.week_num}-${pr.match_index}`] = sc;
          }
        });
        setActivePredictionsMap(predMap);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadArchiveSystem();

    const channel = supabase
      .channel('yeni-arsiv-live-sync')
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

  // HESAPLAMA MOTORU:
  // 1) Genel Puan Durumu (Kesin + Canlı)
  // 2) Seçili Hafta Özeti (Sadece o haftanın puanları)
  // 3) Seçili Hafta Genel (1. haftadan seçili haftaya kadar toplam)
  // 4) Liderler Kronolojisi (1. haftadan bugüne Detaylı Master formatında hafta liderleri)
  const {
    totalStandings,
    weekSummaryRows,
    weekGenelRows,
    leadersTimeline,
    selectedWeekMatches,
    selectedWeekBonusInfo,
    liveActiveMatchCount
  } = useMemo(() => {
    const playerIds = Object.keys(playersMap).filter((id) => !EXCLUDED_IDS.has(id));

    const weeksByNum: Record<number, OfficialWeekRow> = {};
    officialWeeks.forEach((w) => {
      weeksByNum[Number(w.week_num)] = w;
    });

    const createBlankMap = () => {
      const m: Record<string, PlayerStatRow> = {};
      playerIds.forEach((uid) => {
        m[uid] = {
          id: uid,
          name: playersMap[uid]?.name || uid,
          isChampion: Boolean(playersMap[uid]?.isChampion),
          dfoPts: 0,
          tffPts: 0,
          bonusPts: 0,
          masterPts: 0,
          dfoSkor: 0,
          tffSkor: 0,
          totalSkor: 0,
          liveAddPts: 0,
          liveAddSkor: 0,
          puanLiderWeeks: [],
          skorKralWeeks: []
        };
      });
      return m;
    };

    const ensurePlayer = (mapObj: Record<string, PlayerStatRow>, uid: string) => {
      if (EXCLUDED_IDS.has(uid)) return null;
      if (!mapObj[uid]) {
        const nm = playersMap[uid]?.name || TEST_ACCOUNTS[uid]?.name || uid;
        mapObj[uid] = {
          id: uid,
          name: nm,
          isChampion: hasChampionCup(nm, playersMap[uid]?.isChampion),
          dfoPts: 0,
          tffPts: 0,
          bonusPts: 0,
          masterPts: 0,
          dfoSkor: 0,
          tffSkor: 0,
          totalSkor: 0,
          liveAddPts: 0,
          liveAddSkor: 0,
          puanLiderWeeks: [],
          skorKralWeeks: []
        };
      }
      return mapObj[uid];
    };

    const maxStartedWeek =
      availableWeeks.length > 0 ? availableWeeks[availableWeeks.length - 1] : 41;

    // A) TÜM ZAMANLAR GENEL PUAN + LİDERLER KRONOLOJİSİ + SEÇİLİ HAFTA GENEL
    const cumulativeMap = createBlankMap();
    const weekOnlyMap = createBlankMap();
    const upToSelectedMap = createBlankMap();

    const matchesByWeek: Record<number, OfficialMatchRow[]> = {};
    officialMatches.forEach((m) => {
      const wn = Number(m.week_num);
      if (!matchesByWeek[wn]) matchesByWeek[wn] = [];
      matchesByWeek[wn].push(m);
    });

    const timelineRows: {
      weekNum: number;
      leaderId: string;
      leaderName: string;
      isChampion: boolean;
      dfoPts: number;
      tffPts: number;
      bonusPts: number;
      totalSkor: number;
      masterPts: number;
      isCompleted: boolean;
    }[] = [];

    availableWeeks.forEach((wn) => {
      const wMatches = matchesByWeek[wn] || [];
      let finishedInWeek = 0;

      wMatches.forEach((m) => {
        if (m.status !== 'FINISHED') return;
        finishedInWeek += 1;
        const winners = (m.winner_ids || []).filter((id) => !EXCLUDED_IDS.has(String(id).trim()));
        const pts =
          m.points_awarded !== null && m.points_awarded !== undefined
            ? Number(m.points_awarded)
            : calcMatchPts(winners.length);
        const isTff =
          m.pool_type === 'TFF' ||
          (!m.pool_type && advancedTffCheck(m.category, m.home_team, m.away_team));

        winners.forEach((rawId) => {
          const uid = String(rawId).trim();
          const pCum = ensurePlayer(cumulativeMap, uid);
          if (pCum) {
            if (isTff) {
              pCum.tffPts += pts;
              pCum.tffSkor += 1;
            } else {
              pCum.dfoPts += pts;
              pCum.dfoSkor += 1;
            }
            pCum.masterPts += pts;
            pCum.totalSkor += 1;
          }

          if (wn === selectedWeek) {
            const pWk = ensurePlayer(weekOnlyMap, uid);
            if (pWk) {
              if (isTff) {
                pWk.tffPts += pts;
                pWk.tffSkor += 1;
              } else {
                pWk.dfoPts += pts;
                pWk.dfoSkor += 1;
              }
              pWk.masterPts += pts;
              pWk.totalSkor += 1;
            }
          }

          if (wn <= selectedWeek) {
            const pUp = ensurePlayer(upToSelectedMap, uid);
            if (pUp) {
              if (isTff) {
                pUp.tffPts += pts;
                pUp.tffSkor += 1;
              } else {
                pUp.dfoPts += pts;
                pUp.dfoSkor += 1;
              }
              pUp.masterPts += pts;
              pUp.totalSkor += 1;
            }
          }
        });
      });

      // Hafta Bonuslarını İşle
      const wBonusRow = weeksByNum[wn];
      if (wBonusRow && wBonusRow.bonus_enabled !== false && wBonusRow.is_completed) {
        const pBonus = Number(wBonusRow.puan_bonus || 0);
        const sBonus = Number(wBonusRow.skor_bonus || 0);

        if (pBonus > 0 && Array.isArray(wBonusRow.puan_lideri_ids)) {
          wBonusRow.puan_lideri_ids.forEach((rawId) => {
            const uid = String(rawId).trim();
            const pCum = ensurePlayer(cumulativeMap, uid);
            if (pCum) {
              pCum.bonusPts += pBonus;
              pCum.masterPts += pBonus;
              pCum.puanLiderWeeks.push(wn);
            }
            if (wn === selectedWeek) {
              const pWk = ensurePlayer(weekOnlyMap, uid);
              if (pWk) {
                pWk.bonusPts += pBonus;
                pWk.masterPts += pBonus;
                pWk.puanLiderWeeks.push(wn);
              }
            }
            if (wn <= selectedWeek) {
              const pUp = ensurePlayer(upToSelectedMap, uid);
              if (pUp) {
                pUp.bonusPts += pBonus;
                pUp.masterPts += pBonus;
                pUp.puanLiderWeeks.push(wn);
              }
            }
          });
        }

        if (sBonus > 0 && Array.isArray(wBonusRow.skor_krali_ids)) {
          wBonusRow.skor_krali_ids.forEach((rawId) => {
            const uid = String(rawId).trim();
            const pCum = ensurePlayer(cumulativeMap, uid);
            if (pCum) {
              pCum.bonusPts += sBonus;
              pCum.masterPts += sBonus;
              pCum.skorKralWeeks.push(wn);
            }
            if (wn === selectedWeek) {
              const pWk = ensurePlayer(weekOnlyMap, uid);
              if (pWk) {
                pWk.bonusPts += sBonus;
                pWk.masterPts += sBonus;
                pWk.skorKralWeeks.push(wn);
              }
            }
            if (wn <= selectedWeek) {
              const pUp = ensurePlayer(upToSelectedMap, uid);
              if (pUp) {
                pUp.bonusPts += sBonus;
                pUp.masterPts += sBonus;
                pUp.skorKralWeeks.push(wn);
              }
            }
          });
        }
      }

      // Liderler Kronolojisi Satırı (En az 1 maç bitmişse o haftanın genel liderini al)
      if (finishedInWeek > 0 && wn <= maxStartedWeek) {
        const snapshotSorted = Object.values(cumulativeMap).sort(
          (a, b) =>
            b.masterPts - a.masterPts ||
            b.totalSkor - a.totalSkor ||
            a.name.localeCompare(b.name, 'tr')
        );
        const topLeader = snapshotSorted[0];
        if (topLeader && topLeader.masterPts > 0) {
          timelineRows.push({
            weekNum: wn,
            leaderId: topLeader.id,
            leaderName: topLeader.name,
            isChampion: topLeader.isChampion,
            dfoPts: topLeader.dfoPts,
            tffPts: topLeader.tffPts,
            bonusPts: topLeader.bonusPts,
            totalSkor: topLeader.totalSkor,
            masterPts: topLeader.masterPts,
            isCompleted: Boolean(wBonusRow?.is_completed || finishedInWeek >= 24)
          });
        }
      }
    });

    // B) CANLI MAÇ KATKISI (CANLI Sekmesi İçin)
    let liveCount = 0;
    const liveMapClone: Record<string, PlayerStatRow> = {};
    Object.keys(cumulativeMap).forEach((uid) => {
      liveMapClone[uid] = {
        ...cumulativeMap[uid],
        puanLiderWeeks: [...cumulativeMap[uid].puanLiderWeeks],
        skorKralWeeks: [...cumulativeMap[uid].skorKralWeeks]
      };
    });

    activeRealTimeWeeks.forEach((aw) => {
      const bulMatches = recentBulletins.filter((b: any) => Number(b.week_num) === aw);
      const offForAw = matchesByWeek[aw] || [];
      const offByIdx: Record<number, OfficialMatchRow> = {};
      offForAw.forEach((om) => {
        offByIdx[Number(om.match_index)] = om;
      });

      const matchList =
        bulMatches.length > 0
          ? bulMatches.map((b: any) => ({
              week_num: Number(b.week_num),
              match_index: Number(b.match_index),
              category: b.category || '',
              match_date: String(b.match_date || '').trim(),
              match_time: String(b.match_time || '').trim(),
              home_team: b.home_team || '',
              away_team: b.away_team || ''
            }))
          : offForAw.map((om) => ({
              week_num: Number(om.week_num),
              match_index: Number(om.match_index),
              category: om.category || '',
              match_date: String(om.match_date || '').trim(),
              match_time: String(om.match_time || '').trim(),
              home_team: om.home_team || '',
              away_team: om.away_team || ''
            }));

      matchList.forEach((m) => {
        const offM = offByIdx[m.match_index];
        if (offM && (offM.status === 'FINISHED' || offM.status === 'POSTPONED')) return;

        const uidStr = String(getUniqueMatchId(m.week_num, m.match_index));
        const dbLive = liveMatchesMap[uidStr];
        if (!dbLive) return;

        const st = String(dbLive.status || '');
        const hSc = String(dbLive.home_score ?? '-');
        const aSc = String(dbLive.away_score ?? '-');
        if (hSc === '-' || aSc === '-') return;

        const kMs = getMatchTimeMs(m.match_date, m.match_time);
        const isLiveActive =
          ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'WAITING_APPROVAL', 'FINISHED', 'FT', 'AET', 'PEN'].includes(
            st
          ) &&
          (kMs === 0 || (nowMs >= kMs && nowMs <= kMs + 14 * 3600 * 1000));

        if (!isLiveActive) return;

        if (['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'WAITING_APPROVAL'].includes(st)) {
          liveCount += 1;
        }

        const targetScore = `${hSc}-${aSc}`.replace(/\s+/g, '');
        const allKnownIds = Object.keys(liveMapClone);
        const winners = allKnownIds.filter(
          (pid) => activePredictionsMap[`${pid}-${m.week_num}-${m.match_index}`] === targetScore
        );
        const pts = calcMatchPts(winners.length);
        const isTff = offM?.pool_type
          ? offM.pool_type === 'TFF'
          : advancedTffCheck(m.category, m.home_team, m.away_team);

        winners.forEach((wId) => {
          const row = liveMapClone[wId];
          if (!row) return;
          if (isTff) {
            row.tffPts += pts;
            row.tffSkor += 1;
          } else {
            row.dfoPts += pts;
            row.dfoSkor += 1;
          }
          row.masterPts += pts;
          row.totalSkor += 1;
          row.liveAddPts += pts;
          row.liveAddSkor += 1;
        });
      });
    });

    // Seçili Haftanın Maç Arşivi Kartları (Resmi Kasa + Henüz Oynanmamış Bülten Maçları Birleşimi)
    const offSelected = [...(matchesByWeek[selectedWeek] || [])].sort(
      (a, b) => Number(a.match_index) - Number(b.match_index)
    );
    const bulSelected = recentBulletins
      .filter((b: any) => Number(b.week_num) === selectedWeek)
      .sort((a: any, b: any) => Number(a.match_index) - Number(b.match_index));

    const mergedWeekMatches: OfficialMatchRow[] =
      offSelected.length >= bulSelected.length && offSelected.length > 0
        ? offSelected
        : bulSelected.map((b: any) => {
            const existing = offSelected.find(
              (o) => Number(o.match_index) === Number(b.match_index)
            );
            if (existing) return existing;
            const isTff = advancedTffCheck(b.category || '', b.home_team || '', b.away_team || '');
            return {
              id: getUniqueMatchId(Number(b.week_num), Number(b.match_index)),
              week_num: Number(b.week_num),
              match_index: Number(b.match_index),
              category: b.category || '',
              pool_type: isTff ? 'TFF' : 'DFO',
              match_date: String(b.match_date || '').trim(),
              match_time: String(b.match_time || '').trim(),
              home_team: b.home_team || '',
              away_team: b.away_team || '',
              home_score: null,
              away_score: null,
              status: 'NOT_STARTED',
              winner_ids: [],
              points_awarded: 0
            };
          });

    return {
      totalStandings: {
        kesin: Object.values(cumulativeMap),
        canli: Object.values(liveMapClone)
      },
      weekSummaryRows: Object.values(weekOnlyMap),
      weekGenelRows: Object.values(upToSelectedMap),
      leadersTimeline: timelineRows,
      selectedWeekMatches: mergedWeekMatches,
      selectedWeekBonusInfo: weeksByNum[selectedWeek] || null,
      liveActiveMatchCount: liveCount
    };
  }, [
    playersMap,
    officialMatches,
    officialWeeks,
    availableWeeks,
    selectedWeek,
    activeRealTimeWeeks,
    recentBulletins,
    liveMatchesMap,
    activePredictionsMap,
    nowMs
  ]);

  // SIRALAMA YARDIMCILARI
  const sortMaster = (list: PlayerStatRow[]) =>
    [...list].sort(
      (a, b) =>
        b.masterPts - a.masterPts ||
        b.totalSkor - a.totalSkor ||
        a.name.localeCompare(b.name, 'tr')
    );

  const sortDfo = (list: PlayerStatRow[]) =>
    [...list].sort(
      (a, b) =>
        b.dfoPts - a.dfoPts || b.dfoSkor - a.dfoSkor || a.name.localeCompare(b.name, 'tr')
    );

  const sortTff = (list: PlayerStatRow[]) =>
    [...list].sort(
      (a, b) =>
        b.tffPts - a.tffPts || b.tffSkor - a.tffSkor || a.name.localeCompare(b.name, 'tr')
    );

  const sortSkorMaster = (list: PlayerStatRow[]) =>
    [...list].sort(
      (a, b) =>
        b.totalSkor - a.totalSkor ||
        b.masterPts - a.masterPts ||
        a.name.localeCompare(b.name, 'tr')
    );

  const sortSkorDfo = (list: PlayerStatRow[]) =>
    [...list].sort(
      (a, b) =>
        b.dfoSkor - a.dfoSkor || b.dfoPts - a.dfoPts || a.name.localeCompare(b.name, 'tr')
    );

  const sortSkorTff = (list: PlayerStatRow[]) =>
    [...list].sort(
      (a, b) =>
        b.tffSkor - a.tffSkor || b.tffPts - a.tffPts || a.name.localeCompare(b.name, 'tr')
    );

  const sortBonus = (list: PlayerStatRow[]) =>
    [...list]
      .filter((r) => r.bonusPts > 0)
      .sort(
        (a, b) =>
          b.bonusPts - a.bonusPts ||
          b.masterPts - a.masterPts ||
          a.name.localeCompare(b.name, 'tr')
      );

  const renderPlayerNameWithCup = (name: string, isChamp: boolean, liveAdd: number = 0) => {
    const cleanDisplay = stripTrophies(name);
    const cupCount = getChampionCupCount(name, isChamp);
    const showTrFlag = hasReigningTurkishFlag(name);
    return (
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="truncate uppercase">{cleanDisplay}</span>
        {cupCount > 0 && (
          <span
            className="shrink-0 text-[11px] sm:text-xs leading-none tracking-tight"
            title={`${cupCount} Kez Şampiyon`}
          >
            {'🏆'.repeat(cupCount)}
          </span>
        )}
        {showTrFlag && <TurkishChampionBadge title="Son Şampiyon Göğüs Arması" />}
        {liveAdd > 0 && (
          <span className="shrink-0 bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 text-[9px] font-black px-1.5 py-0.5 rounded leading-none">
            +{liveAdd} CANLI
          </span>
        )}
      </div>
    );
  };
  // DETAYLI MASTER TABLO BİLEŞENİ (Genel Puan, Hafta Genel ve Canlı için ortak hiza)
  const renderDetailedMasterTable = (
    rows: PlayerStatRow[],
    showLiveBadge: boolean = false,
    emptyText: string = 'VERİ BULUNAMADI'
  ) => {
    const sorted = sortMaster(rows);
    if (sorted.length === 0) {
      return (
        <div className="text-center py-10 text-slate-400 text-xs font-bold tracking-widest uppercase">
          {emptyText}
        </div>
      );
    }

    return (
      <table className="w-full table-fixed text-left tabular-nums">
        <thead className="sticky top-[104px] sm:top-[112px] z-20 bg-[#050c1d] border-b border-slate-800">
          <tr className="text-[9.5px] sm:text-xs uppercase tracking-wider font-black">
            <th className="py-2.5 px-1.5 sm:px-3 w-[28px] sm:w-12 text-slate-400">#</th>
            <th className="py-2.5 px-1.5 sm:px-3 text-slate-200">YARIŞMACI</th>
            <th className="py-2.5 px-1 w-[38px] sm:w-20 text-center text-sky-400">DFO</th>
            <th className="py-2.5 px-1 w-[38px] sm:w-20 text-center text-rose-500">TFF</th>
            <th className="py-2.5 px-1 w-[38px] sm:w-20 text-center text-emerald-400">BNS</th>
            <th className="py-2.5 px-1 w-[40px] sm:w-20 text-center text-orange-400">SKOR</th>
            <th className="py-2.5 px-1.5 sm:px-3 w-[52px] sm:w-28 text-center text-sky-100 bg-sky-500/15">
              MASTER
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70">
          {sorted.map((row, idx) => (
            <tr
              key={row.id}
              className={
                showLiveBadge && row.liveAddPts > 0
                  ? 'bg-emerald-950/25 hover:bg-emerald-950/40 transition-colors'
                  : 'hover:bg-slate-800/35 transition-colors'
              }
            >
              <td className="py-2 px-1.5 sm:px-3 font-bold text-slate-400 text-[11px] sm:text-sm">
                {idx + 1}
              </td>
              <td
                className="py-2 px-1.5 sm:px-3 font-black text-white text-[11px] sm:text-sm"
                title={row.name}
              >
                {renderPlayerNameWithCup(
                  row.name,
                  row.isChampion,
                  showLiveBadge ? row.liveAddPts : 0
                )}
              </td>
              <td className="py-2 px-1 text-center text-sky-400 font-bold text-[11px] sm:text-sm">
                {row.dfoPts}
              </td>
              <td className="py-2 px-1 text-center text-rose-500 font-bold text-[11px] sm:text-sm">
                {row.tffPts}
              </td>
              <td className="py-2 px-1 text-center text-emerald-400 font-bold text-[11px] sm:text-sm">
                {row.bonusPts > 0 ? `+${row.bonusPts}` : '0'}
              </td>
              <td className="py-2 px-1 text-center text-orange-400 font-black text-[11px] sm:text-sm">
                {row.totalSkor}
              </td>
              <td className="py-2 px-1.5 sm:px-3 text-center text-white font-black text-xs sm:text-base bg-sky-500/10">
                {row.masterPts}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // TEK SÜTUNLU STANDART TABLO BİLEŞENİ (MASTER PUAN, DFO, TFF, SKOR)
  const renderSingleMetricTable = (
    rows: PlayerStatRow[],
    metric: 'MASTER' | 'DFO' | 'TFF' | 'SKOR_MASTER' | 'SKOR_DFO' | 'SKOR_TFF',
    emptyText: string = 'VERİ BULUNAMADI'
  ) => {
    const sorted =
      metric === 'MASTER'
        ? sortMaster(rows)
        : metric === 'DFO'
        ? sortDfo(rows)
        : metric === 'TFF'
        ? sortTff(rows)
        : metric === 'SKOR_DFO'
        ? sortSkorDfo(rows)
        : metric === 'SKOR_TFF'
        ? sortSkorTff(rows)
        : sortSkorMaster(rows);

    if (sorted.length === 0) {
      return (
        <div className="text-center py-10 text-slate-400 text-xs font-bold tracking-widest uppercase">
          {emptyText}
        </div>
      );
    }

    const colTitle =
      metric === 'MASTER'
        ? 'MASTER PUAN'
        : metric === 'DFO'
        ? 'DFO PUAN'
        : metric === 'TFF'
        ? 'TFF PUAN'
        : metric === 'SKOR_DFO'
        ? 'DFO SKOR'
        : metric === 'SKOR_TFF'
        ? 'TFF SKOR'
        : 'TOPLAM SKOR';

    const colColor =
      metric === 'DFO' || metric === 'SKOR_DFO'
        ? 'text-sky-400'
        : metric === 'TFF' || metric === 'SKOR_TFF'
        ? 'text-rose-500'
        : metric.startsWith('SKOR')
        ? 'text-orange-400'
        : 'text-sky-200';

    return (
      <table className="w-full table-fixed text-left tabular-nums">
        <thead className="sticky top-[104px] sm:top-[112px] z-20 bg-[#050c1d] border-b border-slate-800">
          <tr className="text-[10px] sm:text-xs uppercase tracking-wider font-black">
            <th className="py-2.5 px-2 sm:px-3 w-10 sm:w-14 text-slate-400">#</th>
            <th className="py-2.5 px-2 sm:px-3 text-slate-200">YARIŞMACI</th>
            <th className={`py-2.5 px-3 w-28 sm:w-40 text-right ${colColor}`}>{colTitle}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70">
          {sorted.map((row, idx) => {
            const val =
              metric === 'MASTER'
                ? row.masterPts
                : metric === 'DFO'
                ? row.dfoPts
                : metric === 'TFF'
                ? row.tffPts
                : metric === 'SKOR_DFO'
                ? row.dfoSkor
                : metric === 'SKOR_TFF'
                ? row.tffSkor
                : row.totalSkor;

            return (
              <tr key={row.id} className="hover:bg-slate-800/35 transition-colors">
                <td className="py-2 px-2 sm:px-3 font-bold text-slate-400 text-xs sm:text-sm">
                  {idx + 1}
                </td>
                <td className="py-2 px-2 sm:px-3 font-black text-white text-xs sm:text-sm">
                  {renderPlayerNameWithCup(row.name, row.isChampion)}
                </td>
                <td className={`py-2 px-3 text-right font-black text-xs sm:text-base ${colColor}`}>
                  {val}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  // BONUS TABLOSU BİLEŞENİ
  const renderBonusTable = (rows: PlayerStatRow[], emptyText: string = 'HENÜZ BONUS KAZANAN YOK') => {
    const sorted = sortBonus(rows);
    if (sorted.length === 0) {
      return (
        <div className="text-center py-10 text-slate-400 text-xs font-bold tracking-widest uppercase">
          {emptyText}
        </div>
      );
    }

    return (
      <table className="w-full table-fixed text-left tabular-nums">
        <thead className="sticky top-[104px] sm:top-[112px] z-20 bg-[#050c1d] border-b border-slate-800">
          <tr className="text-[9.5px] sm:text-xs uppercase tracking-wider font-black">
            <th className="py-2.5 px-1.5 sm:px-3 w-8 sm:w-12 text-slate-400">#</th>
            <th className="py-2.5 px-1.5 sm:px-3 text-slate-200">YARIŞMACI</th>
            <th className="py-2.5 px-1 w-24 sm:w-44 text-center text-sky-300">PUAN LİDERİ</th>
            <th className="py-2.5 px-1 w-24 sm:w-44 text-center text-orange-400">SKOR KRALI</th>
            <th className="py-2.5 px-2 sm:px-3 w-16 sm:w-28 text-right text-emerald-400">BONUS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70">
          {sorted.map((row, idx) => (
            <tr key={row.id} className="hover:bg-slate-800/35 transition-colors">
              <td className="py-2 px-1.5 sm:px-3 font-bold text-slate-400 text-xs sm:text-sm">
                {idx + 1}
              </td>
              <td className="py-2 px-1.5 sm:px-3 font-black text-white text-xs sm:text-sm">
                {renderPlayerNameWithCup(row.name, row.isChampion)}
              </td>
              <td className="py-2 px-1 text-center text-[10px] sm:text-xs text-sky-300 font-bold">
                {row.puanLiderWeeks.length > 0
                  ? row.puanLiderWeeks.map((w) => `${w}.H`).join(', ')
                  : '-'}
              </td>
              <td className="py-2 px-1 text-center text-[10px] sm:text-xs text-orange-400 font-bold">
                {row.skorKralWeeks.length > 0
                  ? row.skorKralWeeks.map((w) => `${w}.H`).join(', ')
                  : '-'}
              </td>
              <td className="py-2 px-2 sm:px-3 text-right font-black text-xs sm:text-base text-emerald-400">
                +{row.bonusPts}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto py-16 flex justify-center">
        <span className="text-sky-300 text-xs sm:text-sm font-black tracking-widest uppercase animate-pulse">
          Arşiv ve Puan Tablosu Yükleniyor...
        </span>
      </div>
    );
  }

  const filteredArchiveMatches = selectedWeekMatches.filter((m) => {
    if (archivePoolFilter === 'ALL') return true;
    const isTff =
      m.pool_type === 'TFF' ||
      (!m.pool_type && advancedTffCheck(m.category, m.home_team, m.away_team));
    return archivePoolFilter === 'TFF' ? isTff : !isTff;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 pt-3 pb-12 flex flex-col gap-3">
      {/* ÜST HAFTA SEÇİCİ VE ANA SEKMELER BARI */}
      <div className="bg-[#071126] border border-slate-800 rounded-2xl px-2.5 py-2.5 sm:px-4 sm:py-3 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 shadow-md">
        <div className="flex items-center gap-1.5 bg-[#040917] border border-slate-800 rounded-xl px-2.5 py-1.5">
          <span className="text-[10px] sm:text-[11px] font-black text-sky-400 uppercase tracking-wider">
            HAFTA:
          </span>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(Number(e.target.value))}
            className="bg-transparent text-white text-[11px] sm:text-xs font-black outline-none cursor-pointer pr-1"
          >
            {[...availableWeeks]
              .sort((a, b) => b - a)
              .map((w) => (
                <option key={w} value={w} className="bg-[#071126] text-white">
                  {w}. Hafta
                </option>
              ))}
          </select>
        </div>

        {(
          [
            { key: 'TOTAL_STANDINGS', label: 'GENEL PUAN' },
            { key: 'CARDS', label: 'MAÇ ARŞİVİ' },
            { key: 'WEEK_CHECK', label: `${selectedWeek}. HAFTA ÖZETİ` },
            { key: 'WEEK_CUMULATIVE', label: `${selectedWeek}. HAFTA GENEL` },
            { key: 'LEADERS_TIMELINE', label: 'LİDERLER' }
          ] as const
        ).map((tab) => {
          const isAct = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-colors border ${
                isAct
                  ? 'bg-blue-600 text-white border-sky-400/70'
                  : 'bg-[#040917] text-slate-300 border-slate-800 hover:border-slate-600 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ===================== 1. SEKME: GENEL PUAN DURUMU (DEFAULT) ===================== */}
      {activeTab === 'TOTAL_STANDINGS' && (
        <div className="bg-[#071126] border border-slate-800 rounded-2xl shadow-lg">
          {/* DONDURULMUŞ (STICKY) BAŞLIK VE KATEGORİ SEÇİCİ */}
          <div className="sticky top-14 sm:top-16 z-30 bg-[#071126]/95 backdrop-blur-md rounded-t-2xl border-b border-slate-800 px-2.5 pt-2.5 pb-2 sm:px-5 sm:pt-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
              <h1 className="text-xs sm:text-sm font-black text-sky-100 uppercase tracking-wider">
                {standingsFilter === 'CANLI' ? 'CANLI GENEL PUAN DURUMU' : 'GENEL PUAN DURUMU'}
              </h1>

              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                {(
                  [
                    { key: 'CANLI', label: liveActiveMatchCount > 0 ? `CANLI (${liveActiveMatchCount})` : 'CANLI' },
                    { key: 'MASTER', label: 'MASTER' },
                    { key: 'DFO', label: 'DFO' },
                    { key: 'TFF', label: 'TFF' },
                    { key: 'SKOR', label: 'SKOR' },
                    { key: 'BONUS', label: 'BONUS' }
                  ] as const
                ).map((f) => {
                  const isSelected = standingsFilter === f.key;
                  let cls = 'bg-[#040917] text-slate-300 border-slate-800 hover:border-slate-600 hover:text-white';

                  if (isSelected) {
                    if (f.key === 'MASTER') cls = 'bg-sky-600 text-white border-sky-300/80';
                    else if (f.key === 'DFO') cls = 'bg-blue-700 text-white border-sky-400/80';
                    else if (f.key === 'TFF') cls = 'bg-rose-700 text-white border-rose-400/80';
                    else if (f.key === 'SKOR') cls = 'bg-orange-600 text-white border-orange-300/80';
                    else if (f.key === 'BONUS') cls = 'bg-emerald-700 text-white border-emerald-400/80';
                    else cls = 'bg-emerald-700 text-white border-emerald-400/80';
                  } else {
                    if (f.key === 'DFO') cls = 'bg-[#040917] text-sky-400 border-slate-800 hover:border-sky-700';
                    else if (f.key === 'TFF') cls = 'bg-[#040917] text-rose-500 border-slate-800 hover:border-rose-700';
                    else if (f.key === 'SKOR') cls = 'bg-[#040917] text-orange-400 border-slate-800 hover:border-orange-700';
                    else if (f.key === 'BONUS') cls = 'bg-[#040917] text-emerald-400 border-slate-800 hover:border-emerald-700';
                    else if (f.key === 'CANLI') cls = 'bg-[#040917] text-slate-200 border-slate-800 hover:border-emerald-700';
                  }

                  return (
                    <button
                      key={f.key}
                      onClick={() => setStandingsFilter(f.key)}
                      className={`px-2.5 sm:px-3 py-1 rounded-lg text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider transition-colors border ${cls}`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ALT KIRILIM: MASTER PUAN | DETAYLI MASTER (DEFAULT: DETAYLI MASTER) */}
            {(standingsFilter === 'MASTER' || standingsFilter === 'CANLI') && (
              <div className="flex items-center justify-center gap-1.5 pt-2">
                <button
                  onClick={() => setMasterSubFilter('DUZ')}
                  className={`px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider border transition-colors ${
                    masterSubFilter === 'DUZ'
                      ? 'bg-sky-900/50 text-sky-200 border-sky-400/70'
                      : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  MASTER PUAN
                </button>
                <button
                  onClick={() => setMasterSubFilter('DETAYLI')}
                  className={`px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider border transition-colors ${
                    masterSubFilter === 'DETAYLI'
                      ? 'bg-sky-900/50 text-sky-200 border-sky-400/70'
                      : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  DETAYLI MASTER
                </button>
              </div>
            )}

            {/* ALT KIRILIM: SKOR */}
            {standingsFilter === 'SKOR' && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                {(
                  [
                    { key: 'DUZ', label: 'MASTER SKOR' },
                    { key: 'DETAYLI', label: 'DETAYLI SKOR' },
                    { key: 'DFO', label: 'DFO SKOR' },
                    { key: 'TFF', label: 'TFF SKOR' }
                  ] as const
                ).map((sf) => (
                  <button
                    key={sf.key}
                    onClick={() => setSkorSubFilter(sf.key)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider border transition-colors ${
                      skorSubFilter === sf.key
                        ? 'bg-orange-950/60 text-orange-300 border-orange-400/70'
                        : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {sf.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TABLO GÖVDESİ */}
          <div className="px-1.5 pb-4 sm:px-4 sm:pb-6">
            {standingsFilter === 'CANLI' &&
              (masterSubFilter === 'DETAYLI'
                ? renderDetailedMasterTable(totalStandings.canli, true)
                : renderSingleMetricTable(totalStandings.canli, 'MASTER'))}

            {standingsFilter === 'MASTER' &&
              (masterSubFilter === 'DETAYLI'
                ? renderDetailedMasterTable(totalStandings.kesin, false)
                : renderSingleMetricTable(totalStandings.kesin, 'MASTER'))}

            {standingsFilter === 'DFO' && renderSingleMetricTable(totalStandings.kesin, 'DFO')}
            {standingsFilter === 'TFF' && renderSingleMetricTable(totalStandings.kesin, 'TFF')}

            {standingsFilter === 'SKOR' &&
              (skorSubFilter === 'DETAYLI' ? (
                <table className="w-full table-fixed text-left tabular-nums">
                  <thead className="sticky top-[104px] sm:top-[112px] z-20 bg-[#050c1d] border-b border-slate-800">
                    <tr className="text-[9.5px] sm:text-xs uppercase tracking-wider font-black">
                      <th className="py-2.5 px-1.5 sm:px-3 w-8 sm:w-12 text-slate-400">#</th>
                      <th className="py-2.5 px-1.5 sm:px-3 text-slate-200">YARIŞMACI</th>
                      <th className="py-2.5 px-1 w-14 sm:w-24 text-center text-sky-400">DFO</th>
                      <th className="py-2.5 px-1 w-14 sm:w-24 text-center text-rose-500">TFF</th>
                      <th className="py-2.5 px-2 sm:px-3 w-16 sm:w-28 text-center text-orange-400 bg-orange-500/10">
                        SKOR
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {sortSkorMaster(totalStandings.kesin).map((row, idx) => (
                      <tr key={row.id} className="hover:bg-slate-800/35 transition-colors">
                        <td className="py-2 px-1.5 sm:px-3 font-bold text-slate-400 text-xs sm:text-sm">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-1.5 sm:px-3 font-black text-white text-xs sm:text-sm">
                          {renderPlayerNameWithCup(row.name, row.isChampion)}
                        </td>
                        <td className="py-2 px-1 text-center text-sky-400 font-bold text-xs sm:text-sm">
                          {row.dfoSkor}
                        </td>
                        <td className="py-2 px-1 text-center text-rose-500 font-bold text-xs sm:text-sm">
                          {row.tffSkor}
                        </td>
                        <td className="py-2 px-2 sm:px-3 text-center text-orange-400 font-black text-xs sm:text-base bg-orange-500/10">
                          {row.totalSkor}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : skorSubFilter === 'DFO' ? (
                renderSingleMetricTable(totalStandings.kesin, 'SKOR_DFO')
              ) : skorSubFilter === 'TFF' ? (
                renderSingleMetricTable(totalStandings.kesin, 'SKOR_TFF')
              ) : (
                renderSingleMetricTable(totalStandings.kesin, 'SKOR_MASTER')
              ))}

            {standingsFilter === 'BONUS' && renderBonusTable(totalStandings.kesin)}
          </div>
        </div>
      )}

      {/* ===================== 2. SEKME: SEÇİLİ HAFTA MAÇ ARŞİVİ ===================== */}
      {activeTab === 'CARDS' && (
        <div className="bg-[#071126] border border-slate-800 rounded-2xl p-3 sm:p-5 flex flex-col gap-3 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
            <h2 className="text-xs sm:text-sm font-black text-sky-100 uppercase tracking-wider">
              {selectedWeek}. HAFTA MAÇ ARŞİVİ ({filteredArchiveMatches.length} MAÇ)
            </h2>
            <div className="flex items-center gap-1">
              {(
                [
                  { key: 'ALL', label: 'TÜMÜ' },
                  { key: 'DFO', label: 'DFO' },
                  { key: 'TFF', label: 'TFF' }
                ] as const
              ).map((pf) => (
                <button
                  key={pf.key}
                  onClick={() => setArchivePoolFilter(pf.key)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-colors ${
                    archivePoolFilter === pf.key
                      ? pf.key === 'TFF'
                        ? 'bg-rose-700 text-white border-rose-400/80'
                        : 'bg-sky-600 text-white border-sky-300/80'
                      : 'bg-[#040917] text-slate-300 border-slate-800 hover:text-white'
                  }`}
                >
                  {pf.label}
                </button>
              ))}
            </div>
          </div>

          {filteredArchiveMatches.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest">
              {selectedWeek}. HAFTA İÇİN KAYITLI MAÇ BULUNAMADI
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredArchiveMatches.map((m) => {
                const key = `${m.week_num}-${m.match_index}`;
                const isOpen = Boolean(expandedArchiveCards[key]);
                const isFin = m.status === 'FINISHED';
                const isPost = m.status === 'POSTPONED';
                const isTff =
                  m.pool_type === 'TFF' ||
                  (!m.pool_type && advancedTffCheck(m.category, m.home_team, m.away_team));
                const theme = getEliteTheme(
                  isTff && !m.category.toUpperCase().includes('TÜRKİYE')
                    ? `TÜRKİYE ${m.category}`
                    : m.category,
                  m.home_team?.toUpperCase(),
                  m.away_team?.toUpperCase()
                );

                const winnerIds = (m.winner_ids || []).filter(
                  (id) => !EXCLUDED_IDS.has(String(id).trim())
                );
                const pts =
                  m.points_awarded !== null && m.points_awarded !== undefined
                    ? Number(m.points_awarded)
                    : calcMatchPts(winnerIds.length);
                const winnerNames = winnerIds
                  .map((uid) => playersMap[String(uid).trim()]?.name || String(uid).trim())
                  .sort((a, b) => a.localeCompare(b, 'tr'));

                return (
                  <div
                    key={key}
                    className="bg-[#040a18] border border-slate-800 rounded-xl overflow-hidden flex flex-col"
                  >
                    <div className="px-3 py-1.5 bg-[#071126] border-b border-slate-800/80 flex items-center justify-between text-[9.5px] font-bold">
                      <span className="text-slate-400 uppercase tracking-wider">
                        {m.week_num}. HAFTA • {m.match_index}. MAÇ • {m.match_date} {m.match_time}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-black uppercase ${
                          isTff
                            ? 'bg-rose-950/70 text-rose-400 border border-rose-800/70'
                            : 'bg-sky-950/70 text-sky-400 border border-sky-800/70'
                        }`}
                      >
                        {isTff ? 'TFF' : 'DFO'}
                      </span>
                    </div>

                    <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                      <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
                        <span className="text-[11px] sm:text-xs font-black text-white uppercase truncate text-right">
                          {m.home_team}
                        </span>
                        <img
                          src={theme.homeLogo}
                          alt={m.home_team}
                          className="w-7 h-7 object-contain shrink-0"
                        />
                      </div>

                      <div className="px-2.5 py-1 rounded-lg bg-[#091328] border border-slate-700/70 min-w-[58px] text-center shrink-0">
                        {isFin ? (
                          <span className="text-xs sm:text-sm font-black text-white tracking-widest">
                            {m.home_score}-{m.away_score}
                          </span>
                        ) : isPost ? (
                          <span className="text-[10px] font-black text-amber-400">ERT</span>
                        ) : (
                          <span className="text-[10px] font-bold text-sky-300">{m.match_time || 'v'}</span>
                        )}
                      </div>

                      <div className="flex-1 flex items-center justify-start gap-2 min-w-0">
                        <img
                          src={theme.awayLogo}
                          alt={m.away_team}
                          className="w-7 h-7 object-contain shrink-0"
                        />
                        <span className="text-[11px] sm:text-xs font-black text-white uppercase truncate text-left">
                          {m.away_team}
                        </span>
                      </div>
                    </div>

                    <div className="px-3 py-1.5 bg-[#060d1f] border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      {isFin ? (
                        winnerNames.length > 0 ? (
                          <span className="text-emerald-400 font-bold">
                            {winnerNames.length} kişi bildi (+{pts} P)
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Tam isabet çıkmadı</span>
                        )
                      ) : isPost ? (
                        <span className="text-amber-400 font-bold">Ertelendi</span>
                      ) : (
                        <span className="text-slate-500 italic">Oynanmadı</span>
                      )}

                      {isFin && winnerNames.length > 0 && (
                        <button
                          onClick={() =>
                            setExpandedArchiveCards((prev) => ({ ...prev, [key]: !prev[key] }))
                          }
                          className="text-sky-400 hover:text-sky-300 font-black uppercase tracking-wider"
                        >
                          {isOpen ? 'Gizle ▲' : 'Bilenler ▼'}
                        </button>
                      )}
                    </div>

                    {isOpen && winnerNames.length > 0 && (
                      <div className="px-3 py-2 bg-[#030712] border-t border-slate-800 flex flex-wrap gap-1.5">
                        {winnerNames.map((nm, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-bold uppercase"
                          >
                            {nm}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================== 3. SEKME: SEÇİLİ HAFTA ÖZETİ ===================== */}
      {activeTab === 'WEEK_CHECK' && (
        <div className="bg-[#071126] border border-slate-800 rounded-2xl shadow-lg">
          <div className="sticky top-14 sm:top-16 z-30 bg-[#071126]/95 backdrop-blur-md rounded-t-2xl border-b border-slate-800 px-3 pt-3 pb-2 sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <h2 className="text-xs sm:text-sm font-black text-sky-100 uppercase tracking-wider">
                {selectedWeek}. HAFTA ÖZETİ
              </h2>
              <div className="flex items-center gap-1">
                {(['MASTER', 'DFO', 'TFF', 'SKOR'] as const).map((wf) => (
                  <button
                    key={wf}
                    onClick={() => setWeekSummaryFilter(wf)}
                    className={`px-2.5 py-1 rounded-lg text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider border transition-colors ${
                      weekSummaryFilter === wf
                        ? wf === 'TFF'
                          ? 'bg-rose-700 text-white border-rose-400/80'
                          : wf === 'SKOR'
                          ? 'bg-orange-600 text-white border-orange-300/80'
                          : 'bg-sky-600 text-white border-sky-300/80'
                        : 'bg-[#040917] text-slate-300 border-slate-800 hover:text-white'
                    }`}
                  >
                    {wf}
                  </button>
                ))}
              </div>
            </div>

            {selectedWeekBonusInfo && selectedWeekBonusInfo.is_completed && (
              <div className="flex flex-wrap items-center gap-2 pt-2 text-[10px] font-bold">
                {(selectedWeekBonusInfo.puan_lideri_ids || []).length > 0 && (
                  <span className="bg-sky-950/60 border border-sky-800/70 text-sky-300 px-2.5 py-0.5 rounded">
                    Puan Lideri (+{selectedWeekBonusInfo.puan_bonus || 0}):{' '}
                    {(selectedWeekBonusInfo.puan_lideri_ids || [])
                      .map((id) => playersMap[id]?.name || id)
                      .join(', ')}
                  </span>
                )}
                {(selectedWeekBonusInfo.skor_krali_ids || []).length > 0 && (
                  <span className="bg-orange-950/60 border border-orange-800/70 text-orange-300 px-2.5 py-0.5 rounded">
                    Skor Kralı (+{selectedWeekBonusInfo.skor_bonus || 0}):{' '}
                    {(selectedWeekBonusInfo.skor_krali_ids || [])
                      .map((id) => playersMap[id]?.name || id)
                      .join(', ')}
                  </span>
                )}
              </div>
            )}

            {weekSummaryFilter === 'MASTER' && (
              <div className="flex items-center justify-center gap-1.5 pt-2">
                <button
                  onClick={() => setWeekSummaryMasterMode('DUZ')}
                  className={`px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${
                    weekSummaryMasterMode === 'DUZ'
                      ? 'bg-sky-900/50 text-sky-200 border-sky-400/70'
                      : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  MASTER PUAN
                </button>
                <button
                  onClick={() => setWeekSummaryMasterMode('DETAYLI')}
                  className={`px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${
                    weekSummaryMasterMode === 'DETAYLI'
                      ? 'bg-sky-900/50 text-sky-200 border-sky-400/70'
                      : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  DETAYLI MASTER
                </button>
              </div>
            )}
          </div>

          <div className="px-1.5 pb-4 sm:px-4 sm:pb-6">
            {weekSummaryFilter === 'MASTER' &&
              (weekSummaryMasterMode === 'DETAYLI'
                ? renderDetailedMasterTable(
                    weekSummaryRows.filter((r) => r.masterPts > 0),
                    false,
                    `${selectedWeek}. HAFTADA HENÜZ PUAN KAYDI BULUNMUYOR`
                  )
                : renderSingleMetricTable(
                    weekSummaryRows.filter((r) => r.masterPts > 0),
                    'MASTER',
                    `${selectedWeek}. HAFTADA HENÜZ PUAN KAYDI BULUNMUYOR`
                  ))}
            {weekSummaryFilter === 'DFO' &&
              renderSingleMetricTable(
                weekSummaryRows.filter((r) => r.dfoPts > 0),
                'DFO',
                `${selectedWeek}. HAFTADA DFO PUANI BULUNMUYOR`
              )}
            {weekSummaryFilter === 'TFF' &&
              renderSingleMetricTable(
                weekSummaryRows.filter((r) => r.tffPts > 0),
                'TFF',
                `${selectedWeek}. HAFTADA TFF PUANI BULUNMUYOR`
              )}
            {weekSummaryFilter === 'SKOR' &&
              renderSingleMetricTable(
                weekSummaryRows.filter((r) => r.totalSkor > 0),
                'SKOR_MASTER',
                `${selectedWeek}. HAFTADA SKOR İSABETİ BULUNMUYOR`
              )}
          </div>
        </div>
      )}

      {/* ===================== 4. SEKME: SEÇİLİ HAFTA GENEL (1..SEÇİLİ HAFTA TOPLAMI) ===================== */}
      {activeTab === 'WEEK_CUMULATIVE' && (
        <div className="bg-[#071126] border border-slate-800 rounded-2xl shadow-lg">
          <div className="sticky top-14 sm:top-16 z-30 bg-[#071126]/95 backdrop-blur-md rounded-t-2xl border-b border-slate-800 px-3 pt-3 pb-2 sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <h2 className="text-xs sm:text-sm font-black text-sky-100 uppercase tracking-wider">
                {selectedWeek}. HAFTA SONU GENEL PUAN DURUMU
              </h2>
              <div className="flex items-center gap-1">
                {(['MASTER', 'DFO', 'TFF', 'SKOR', 'BONUS'] as const).map((gf) => (
                  <button
                    key={gf}
                    onClick={() => setWeekGenelFilter(gf)}
                    className={`px-2.5 py-1 rounded-lg text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider border transition-colors ${
                      weekGenelFilter === gf
                        ? gf === 'TFF'
                          ? 'bg-rose-700 text-white border-rose-400/80'
                          : gf === 'SKOR'
                          ? 'bg-orange-600 text-white border-orange-300/80'
                          : gf === 'BONUS'
                          ? 'bg-emerald-700 text-white border-emerald-400/80'
                          : 'bg-sky-600 text-white border-sky-300/80'
                        : 'bg-[#040917] text-slate-300 border-slate-800 hover:text-white'
                    }`}
                  >
                    {gf}
                  </button>
                ))}
              </div>
            </div>

            {weekGenelFilter === 'MASTER' && (
              <div className="flex items-center justify-center gap-1.5 pt-2">
                <button
                  onClick={() => setWeekGenelMasterMode('DUZ')}
                  className={`px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${
                    weekGenelMasterMode === 'DUZ'
                      ? 'bg-sky-900/50 text-sky-200 border-sky-400/70'
                      : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  MASTER PUAN
                </button>
                <button
                  onClick={() => setWeekGenelMasterMode('DETAYLI')}
                  className={`px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${
                    weekGenelMasterMode === 'DETAYLI'
                      ? 'bg-sky-900/50 text-sky-200 border-sky-400/70'
                      : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  DETAYLI MASTER
                </button>
              </div>
            )}
          </div>

          <div className="px-1.5 pb-4 sm:px-4 sm:pb-6">
            {weekGenelFilter === 'MASTER' &&
              (weekGenelMasterMode === 'DETAYLI'
                ? renderDetailedMasterTable(weekGenelRows, false)
                : renderSingleMetricTable(weekGenelRows, 'MASTER'))}
            {weekGenelFilter === 'DFO' && renderSingleMetricTable(weekGenelRows, 'DFO')}
            {weekGenelFilter === 'TFF' && renderSingleMetricTable(weekGenelRows, 'TFF')}
            {weekGenelFilter === 'SKOR' && renderSingleMetricTable(weekGenelRows, 'SKOR_MASTER')}
            {weekGenelFilter === 'BONUS' && renderBonusTable(weekGenelRows)}
          </div>
        </div>
      )}

      {/* ===================== 5. SEKME: LİDERLER (DETAYLI MASTER İLE BİREBİR HİZALI) ===================== */}
      {activeTab === 'LEADERS_TIMELINE' && (
        <div className="bg-[#071126] border border-slate-800 rounded-2xl shadow-lg">
          <div className="sticky top-14 sm:top-16 z-30 bg-[#071126]/95 backdrop-blur-md rounded-t-2xl border-b border-slate-800 px-3 py-3 sm:px-5">
            <h2 className="text-xs sm:text-sm font-black text-sky-100 uppercase tracking-wider">
              HAFTALARA GÖRE GENEL LİDERLER
            </h2>
          </div>

          <div className="px-1.5 pb-4 sm:px-4 sm:pb-6">
            <table className="w-full table-fixed text-left tabular-nums">
              <thead className="sticky top-[92px] sm:top-[98px] z-20 bg-[#050c1d] border-b border-slate-800">
                <tr className="text-[9.5px] sm:text-xs uppercase tracking-wider font-black">
                  <th className="py-2.5 px-1.5 sm:px-3 w-[46px] sm:w-20 text-slate-400">HAFTA</th>
                  <th className="py-2.5 px-1.5 sm:px-3 text-slate-200">LİDER YARIŞMACI</th>
                  <th className="py-2.5 px-1 w-[38px] sm:w-20 text-center text-sky-400">DFO</th>
                  <th className="py-2.5 px-1 w-[38px] sm:w-20 text-center text-rose-500">TFF</th>
                  <th className="py-2.5 px-1 w-[38px] sm:w-20 text-center text-emerald-400">BNS</th>
                  <th className="py-2.5 px-1 w-[40px] sm:w-20 text-center text-orange-400">SKOR</th>
                  <th className="py-2.5 px-1.5 sm:px-3 w-[52px] sm:w-28 text-center text-sky-100 bg-sky-500/15">
                    MASTER
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {[...leadersTimeline].reverse().map((row) => (
                  <tr key={row.weekNum} className="hover:bg-slate-800/35 transition-colors">
                    <td className="py-2 px-1.5 sm:px-3 font-black text-sky-300 text-[11px] sm:text-sm">
                      {row.weekNum}.H
                    </td>
                    <td className="py-2 px-1.5 sm:px-3 font-black text-white text-[11px] sm:text-sm">
                      {renderPlayerNameWithCup(row.leaderName, row.isChampion)}
                    </td>
                    <td className="py-2 px-1 text-center text-sky-400 font-bold text-[11px] sm:text-sm">
                      {row.dfoPts}
                    </td>
                    <td className="py-2 px-1 text-center text-rose-500 font-bold text-[11px] sm:text-sm">
                      {row.tffPts}
                    </td>
                    <td className="py-2 px-1 text-center text-emerald-400 font-bold text-[11px] sm:text-sm">
                      {row.bonusPts > 0 ? `+${row.bonusPts}` : '0'}
                    </td>
                    <td className="py-2 px-1 text-center text-orange-400 font-black text-[11px] sm:text-sm">
                      {row.totalSkor}
                    </td>
                    <td className="py-2 px-1.5 sm:px-3 text-center text-white font-black text-xs sm:text-base bg-sky-500/10">
                      {row.masterPts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}