'use client';
import { getClubLogoUrl, refreshCustomClubsCache } from '@/components/FavoriteTeamSelector';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/utils/supabase';
import {
  TEST_ACCOUNTS,
  getEliteTheme,
  getMatchTimeMs,
  parseDateLocal,
  getUniqueMatchId,
  getTodayDateString
} from '@/utils/themeEngine';

const EXCLUDED_IDS = new Set(['mankoman']);

const formatNameWithCups = (rawName: string) => {
  if (!rawName) return '';
  const existing = (rawName.match(/🏆/g) || []).length;
  const clean = rawName.replace(/(🏆|🇹🇷)+/g, '').trim();
  const norm = clean
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

  let cups = existing;
  if (norm.includes('OSMAN ALI AYDIN') || norm.includes('GAZI AYAN') || norm.includes('ILHAN KARACA')) {
    cups = 2;
  } else if (
    norm === 'MURAT KARA' ||
    norm === 'MURAT KARAOGLU' ||
    norm.includes('ISMAIL EKER') ||
    norm.includes('ISMAIL PEKER') ||
    norm.includes('TOPARDIC')
  ) {
    cups = Math.max(existing, 1);
  }

  return cups > 0 ? `${clean} ${'🏆'.repeat(cups)}` : clean;
};

const LIVE_FAV_TEAMS: Record<string, string> = {};

const normLiveKey = (s: string) =>
  (s || '')
    .replace(/(🏆|🇹🇷)+/g, '')
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

const renderLiveNameWithFlag = (
  rawOrFormattedName: string,
  userId?: string,
  iconPx: number = 18
) => {
  const displayWithCups = formatNameWithCups(rawOrFormattedName);
  const norm = normLiveKey(rawOrFormattedName);
  const favTeam =
    (userId ? LIVE_FAV_TEAMS[`id:${String(userId).trim()}`] : '') ||
    LIVE_FAV_TEAMS[norm] ||
    '';
  const clubLogo = getClubLogoUrl(favTeam);
  const hasFlag =
    norm.includes('ISMAIL EKER') ||
    norm.includes('ISMAIL PEKER') ||
    norm.includes('OSMAN ALI AYDIN');

  return (
    <span className="inline-flex items-center gap-1.5 min-w-0 truncate">
      {clubLogo && (
        <img
          src={clubLogo}
          alt={favTeam}
          width={iconPx}
          height={iconPx}
          style={{
            width: `${iconPx}px`,
            height: `${iconPx}px`,
            minWidth: `${iconPx}px`,
            maxWidth: `${iconPx}px`
          }}
          className="object-contain shrink-0"
          loading="lazy"
        />
      )}
      <span className="truncate">{displayWithCups}</span>
      {hasFlag && (
        <span
          className="inline-flex items-center shrink-0 rounded-[2px] overflow-hidden border border-white/25 shadow-sm"
          title="Son Şampiyon"
        >
          <svg viewBox="0 0 30 20" className="w-4 h-[11px] sm:w-[18px] sm:h-3 block">
            <rect width="30" height="20" fill="#E30A17" />
            <circle cx="10.5" cy="10" r="5" fill="#FFFFFF" />
            <circle cx="11.8" cy="10" r="4" fill="#E30A17" />
            <polygon points="16.2,10 19.3,11 17.4,8.4 17.4,11.6 19.3,9" fill="#FFFFFF" />
          </svg>
        </span>
      )}
    </span>
  );
};
const TR_MONTHS = [
  '',
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
const TR_DAYS_SUN_FIRST = ['PAZAR', 'PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ'];

const formatTrDateLabel = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.trim().split('.');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    const d = new Date(year, month - 1, day);
    if (!isNaN(d.getTime())) {
      return `${day} ${TR_MONTHS[month] || ''} ${TR_DAYS_SUN_FIRST[d.getDay()] || ''}`.trim();
    }
  }
  return dateStr;
};

const engToTr: Record<string, string> = {
  "SERBIA": "SIRBİSTAN", "GERMANY": "ALMANYA", "NETHERLANDS": "HOLLANDA", "HOLLAND": "HOLLANDA",
  "TURKEY": "TÜRKİYE", "TURKIYE": "TÜRKİYE", "FRANCE": "FRANSA", "ITALY": "İTALYA",
  "SPAIN": "İSPANYA", "ENGLAND": "İNGİLTERE", "BELGIUM": "BELÇİKA",
  "PORTUGAL": "PORTEKİZ", "GREECE": "YUNANİSTAN", "NORWAY": "NORVEÇ",
  "DENMARK": "DANİMARKA", "WALES": "GALLER", "IRELAND": "İRLANDA", "REPUBLIC OF IRELAND": "İRLANDA",
  "SWITZERLAND": "İSVİÇRE", "SWEDEN": "İSVEÇ", "CROATIA": "HIRVATİSTAN",
  "CZECH REPUBLIC": "ÇEKYA", "CZECHIA": "ÇEKYA", "POLAND": "POLONYA", "SCOTLAND": "İSKOÇYA",
  "HUNGARY": "MACARİSTAN", "AUSTRIA": "AVUSTURYA", "ROMANIA": "ROMANYA", "ALBANIA": "ARNAVUTLUK",
  "GEORGIA": "GÜRCİSTAN", "ICELAND": "İZLANDA", "SLOVAKIA": "SLOVAKYA", "SLOVENIA": "SLOVENYA",
  "MONTENEGRO": "KARADAĞ", "NORTH MACEDONIA": "KUZEY MAKEDONYA", "MACEDONIA": "KUZEY MAKEDONYA",
  "BOSNIA": "BOSNA-HERSEK", "BOSNIA AND HERZEGOVINA": "BOSNA-HERSEK", "CYPRUS": "KIBRIS",
  "LITHUANIA": "LİTVANYA", "LATVIA": "LETONYA", "ESTONIA": "ESTONYA", "FINLAND": "FİNLANDİYA",
  "BULGARIA": "BULGARİSTAN", "UKRAINE": "UKRAYNA", "RUSSIA": "RUSYA", "ARMENIA": "ERMENİSTAN",
  "FAROE ISLANDS": "FAROE ADALARI", "KAZAKHSTAN": "KAZAKİSTAN", "MOLDOVA": "MOLDOVA",
  "LUXEMBOURG": "LÜKSEMBURG", "LIECHTENSTEIN": "LİHTENŞTAYN", "SAN MARINO": "SAN MARİNO",
  "MALTA": "MALTA", "ANDORRA": "ANDORRA", "KOSOVO": "KOSOVA", "BELARUS": "BELARUS"
};

const sanitizeStr = (s: string) => {
  if (!s) return '';
  let res = s.toUpperCase().trim();
  res = engToTr[res] || res;
  return res
    .replace(/İ/g, 'I')
    .replace(/Ş/g, 'S')
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ö/g, 'O')
    .replace(/Ç/g, 'C')
    .replace(/[^A-Z0-9]/g, '');
};

const advancedTffCheck = (category: string, home: string, away: string) => {
  const cat = (category || '')
    .toUpperCase()
    .replace(/İ/g, 'I')
    .replace(/Ş/g, 'S')
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ö/g, 'O')
    .replace(/Ç/g, 'C');
  const h = (home || '').toUpperCase().replace(/İ/g, 'I');
  const a = (away || '').toUpperCase().replace(/İ/g, 'I');

  if (
    cat.includes('UEFA') ||
    cat.includes('SAMPIYONLAR') || cat.includes('CHAMPIONS') || cat.includes('S.L.') ||
    cat.includes('AVRUPA LIGI') || cat.includes('EUROPA') || cat.includes('A.L.') ||
    cat.includes('KONFERANS') || cat.includes('CONFERENCE') || cat.includes('K.L.') ||
    cat.includes('ULUSLAR') || cat.includes('NATIONS') || cat.includes('MILLI') ||
    cat.includes('DUNYA KUPASI') || cat.includes('WORLD CUP') || cat.includes('EURO 20') ||
    cat.includes('INGILTERE') || cat.includes('PREMIER') ||
    cat.includes('ISPANYA') || cat.includes('LA LIGA') ||
    cat.includes('ITALYA') || cat.includes('SERIE A') ||
    cat.includes('ALMANYA') || cat.includes('BUNDESLIGA') ||
    cat.includes('FRANSA') || cat.includes('LIGUE 1') ||
    cat.includes('HOLLANDA') || cat.includes('PORTEKIZ') || cat.includes('BELCIKA') || cat.includes('ISKOCYA') || cat.includes('DANIMARKA')
  ) {
    return false;
  }

  const isTffCat =
    cat.includes('TURKIYE') || cat.includes('TFF') || cat.includes('TRENDYOL') || cat.includes('NESINE') ||
    cat.includes('AMATOR') || cat.includes('SUPER LIG') ||
    cat.includes('1. LIG') || cat.includes('1.LIG') ||
    cat.includes('2. LIG') || cat.includes('2.LIG') ||
    cat.includes('3. LIG') || cat.includes('3.LIG') ||
    cat.includes('BAL') || cat.includes('ZIRAAT') || cat.includes('KUPASI') || cat.includes('SUPER KUPA') || cat.includes('PTT');

  if (isTffCat) return true;

  const teamRegex = /(SPOR|GUCU|YURDU|BLD|BELEDIYE|DEMIR|GENCLER|BIRLIGI|KARS|ANKARA|IZMIR|ISTANBUL|BURSA|TRABZON|ANTALYA|ESKISEHIR|KARSIYAKA|ALTAY|KASIMPASA|GAZIANTEP|SARIYER|IGDIR|GALATASARAY|FENERBAHCE|BESIKTAS|GOZTEPE|KAYSERI|SIVAS|ADANA|HATAY|ALANYA|RIZE|KONYA|SAMSUN|BODRUM|PENDIK|KARAGUMRUK|EYUP|AMED|ERZURUM|KOCAELI|BANDIRMA|UMRANIYE|MARDIN|MUGLA|BATMAN|CORUM|MANISA|BOLU|EROK)/;

  return teamRegex.test(h) && teamRegex.test(a);
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

interface OfficialSummaryRow {
  master_sira: number;
  user_id: string;
  oyuncu_adi: string;
  dfo_puan: number;
  tff_puan: number;
  bonus_puan: number;
  master_puan: number;
  tam_isabet: number;
  dfo_skor?: number;
  tff_skor?: number;
}

interface WeekLiveBucket {
  totalMatches: number;
  finishedCount: number;
  liveCount: number;
  inPlayCount: number;
  MASTER: {
    id: string;
    name: string;
    rank: number;
    toplamDfo: number;
    toplamTff: number;
    toplamMaster: number;
    toplamSkor: number;
    canliMaster: number;
  }[];
  DFO: { id: string; name: string; rank: number; pts: number; liveAdd: number }[];
  TFF: { id: string; name: string; rank: number; pts: number; liveAdd: number }[];
  SKOR_MASTER: {
    id: string;
    name: string;
    rank: number;
    toplamDfoSkor: number;
    toplamTffSkor: number;
    toplamSkor: number;
    canliSkor: number;
  }[];
  SKOR_DFO: { id: string; name: string; rank: number; pts: number; liveAdd: number }[];
  SKOR_TFF: { id: string; name: string; rank: number; pts: number; liveAdd: number }[];
}

export default function LiveMatchCard() {
  const [favoriteTeamsMap, setFavoriteTeamsMap] = useState<Record<string, string>>({});
  const [isWeekLoaded, setIsWeekLoaded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const soundEnabledRef = useRef(false);
  const prevScoresRef = useRef<Record<string, string>>({});
  const [goalFlashes, setGoalFlashes] = useState<Record<string, boolean>>({});

  const [allRecentBulletinMatches, setAllRecentBulletinMatches] = useState<any[]>([]);
  const [liveMatchesData, setLiveMatchesData] = useState<Record<string, any>>({});
  const [officialWeekMatchesMap, setOfficialWeekMatchesMap] = useState<Record<string, any>>({});
  const [officialSummaryRows, setOfficialSummaryRows] = useState<OfficialSummaryRow[]>([]);
  const [predictionsData, setPredictionsData] = useState<Record<string, string>>({});
  const [now, setNow] = useState<number>(() => Date.now());

  const [selectedMatchDate, setSelectedMatchDate] = useState<string>('');

  const [isLiveAccordionOpen, setIsLiveAccordionOpen] = useState<boolean>(true);
  const [isFinishedAccordionOpen, setIsFinishedAccordionOpen] = useState<boolean>(false);
  const [isLiveStandingsOpen, setIsLiveStandingsOpen] = useState<boolean>(false);
  const [isWeekLiveOpen, setIsWeekLiveOpen] = useState<boolean>(true);
  const [isLiveFocusMode, setIsLiveFocusMode] = useState<boolean>(false);
  const [onlyLiveCardsFilter, setOnlyLiveCardsFilter] = useState<boolean>(false);

  const [liveTableTab, setLiveTableTab] = useState<'WEEK_LIVE' | 'MASTER' | 'DFO' | 'TFF' | 'SKOR'>('MASTER');
  const [selectedBulletinWeek, setSelectedBulletinWeek] = useState<number>(0);

  const [weekSubTab, setWeekSubTab] = useState<'MASTER' | 'DFO' | 'TFF' | 'SKOR'>('MASTER');
  const [weekMasterMode, setWeekMasterMode] = useState<'DUZ' | 'DETAYLI'>('DUZ');
  const [weekSkorMode, setWeekSkorMode] = useState<'DUZ' | 'DETAYLI' | 'DFO' | 'TFF'>('DUZ');

  const [masterSubTab, setMasterSubTab] = useState<'DUZ' | 'DETAYLI'>('DUZ');
  const [skorSubTab, setSkorSubTab] = useState<'DUZ' | 'DETAYLI' | 'DFO' | 'TFF'>('DUZ');

  const [openEventsMap, setOpenEventsMap] = useState<{ [key: string]: boolean }>({});
  const [openWinnersMap, setOpenWinnersMap] = useState<{ [key: string]: boolean }>({});
  const [openPossibleMap, setOpenPossibleMap] = useState<{ [key: string]: boolean }>({});
  const [openEliminatedMap, setOpenEliminatedMap] = useState<{ [key: string]: boolean }>({});
  const [openPlayerRanks, setOpenPlayerRanks] = useState<{ [key: string]: boolean }>({});
  const [expandedMatches, setExpandedMatches] = useState<Record<string, boolean>>({});

  const [mergedAccounts, setMergedAccounts] = useState<Record<string, { pass: string; name: string }>>(() => {
    const clean: Record<string, { pass: string; name: string }> = {};
    Object.keys(TEST_ACCOUNTS).forEach((k) => {
      if (!EXCLUDED_IDS.has(k)) clean[k] = TEST_ACCOUNTS[k];
    });
    return clean;
  });

  const [isMankoman, setIsMankoman] = useState<boolean>(false);
  const [isManualFetching, setIsManualFetching] = useState<boolean>(false);
  const [apiLimitRemaining, setApiLimitRemaining] = useState<number | string>('...');

  const checkMasterApiLimit = async () => {
    try {
      const res = await fetch('https://v3.football.api-sports.io/status', {
        headers: {
          'x-apisports-key': '933e5ccc09194d0db30171e2bca20ca9',
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      });
      const data = await res.json();
      if (data.response && (data.response.subscription || data.response.requests)) {
        const current = data.response.requests?.current ?? data.response.subscription?.current ?? 0;
        const limit = data.response.requests?.limit_day ?? data.response.subscription?.limit_day ?? 100;
        setApiLimitRemaining(limit - current);
      } else {
        setApiLimitRemaining('?');
      }
    } catch {
      setApiLimitRemaining('?');
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isMasterSession =
      localStorage.getItem('etml_master_commander') === 'mankoman' ||
      (sessionStorage.getItem('admin_auth') === 'true' && sessionStorage.getItem('admin_role') === 'master') ||
      localStorage.getItem('etml_user') === 'mankoman' ||
      sessionStorage.getItem('etml_user') === 'mankoman';

    if (isMasterSession) {
      localStorage.setItem('etml_master_commander', 'mankoman');
      setIsMankoman(true);
      checkMasterApiLimit();
    }
  }, []);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundEnabledRef.current = newState;
    if (newState) {
      const audio = new Audio('/sounds/goal.mp3');
      audio.muted = true;
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
        })
        .catch((e) => console.log('Ses kilidi:', e));
    }
  };

  const triggerGoalAlert = (matchKey: string) => {
    if (soundEnabledRef.current) {
      const audio = new Audio('/sounds/goal.mp3');
      audio.play().catch((e) => console.log('Ses çalınamadı:', e));
    }
    setGoalFlashes((prev) => ({ ...prev, [matchKey]: true }));
    setTimeout(() => {
      setGoalFlashes((prev) => {
        const next = { ...prev };
        delete next[matchKey];
        return next;
      });
    }, 8000);
  };

  useEffect(() => {
    const fetchDbPlayers = async () => {
      const [playersRes, officialPlayersRes] = await Promise.all([
        supabase.from('players').select('*'),
        supabase.from('etml_official_players').select('*'),
        refreshCustomClubsCache()
      ]);

      const disabledSet = new Set<string>(EXCLUDED_IDS);
      const newAccounts: Record<string, { pass: string; name: string }> = {};

      Object.keys(TEST_ACCOUNTS).forEach((k) => {
        if (!disabledSet.has(k)) newAccounts[k] = { ...TEST_ACCOUNTS[k] };
      });

      if (officialPlayersRes.data) {
        officialPlayersRes.data.forEach((op: any) => {
          const uid = String(op.user_id || '').trim();
          if (!uid) return;
          if (op.is_active === false) {
            disabledSet.add(uid);
            delete newAccounts[uid];
          } else if (!disabledSet.has(uid)) {
            if (op.full_name) {
              newAccounts[uid] = { pass: newAccounts[uid]?.pass || '', name: op.full_name };
            }
            if (op.favorite_team) {
              const fav = String(op.favorite_team).trim();
              LIVE_FAV_TEAMS[`id:${uid}`] = fav;
              const tName1 = op.full_name || '';
              const tName2 = newAccounts[uid]?.name || '';
              if (tName1) LIVE_FAV_TEAMS[normLiveKey(tName1)] = fav;
              if (tName2) LIVE_FAV_TEAMS[normLiveKey(tName2)] = fav;
            }
          }
        });
      }

      if (playersRes.data) {
        playersRes.data.forEach((p: any) => {
          const pid = String(p.username || p.user_id || p.id || '').trim();
          if (pid && !disabledSet.has(pid)) {
            const pName = p.name || p.full_name || newAccounts[pid]?.name || pid;
            newAccounts[pid] = {
              pass: p.password || newAccounts[pid]?.pass || '',
              name: pName
            };
            if (p.favorite_team && !LIVE_FAV_TEAMS[`id:${pid}`]) {
              const fav = String(p.favorite_team).trim();
              LIVE_FAV_TEAMS[`id:${pid}`] = fav;
              LIVE_FAV_TEAMS[normLiveKey(pName)] = fav;
            }
          }
        });
      }

      setMergedAccounts(newAccounts);
      setFavoriteTeamsMap({ ...LIVE_FAV_TEAMS });
    };

    fetchDbPlayers();

    const onCustomClubsUpdated = () => setFavoriteTeamsMap((prev) => ({ ...prev }));
    if (typeof window !== 'undefined') {
      window.addEventListener('etml-custom-clubs-updated', onCustomClubsUpdated);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('etml-custom-clubs-updated', onCustomClubsUpdated);
      }
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getDynamicElapsed = (logInfo: any) => {
    if (!logInfo || logInfo.status !== 'LIVE' || !logInfo.updated_at || !logInfo.elapsed) {
      return logInfo?.elapsed ? `${logInfo.elapsed}'` : 'Canlı';
    }
    const parts = String(logInfo.updated_at).split(':');
    if (parts.length >= 2) {
      const upDate = new Date(now);
      upDate.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), parseInt(parts[2] || '0', 10), 0);
      let diffMs = now - upDate.getTime();
      if (diffMs < -43200000) diffMs += 86400000;
      const diffMins = Math.floor(Math.max(0, diffMs) / 60000);
      return `${parseInt(String(logInfo.elapsed), 10) + diffMins}'`;
    }
    return `${logInfo.elapsed}'`;
  };

  useEffect(() => {
    let candidateWeeksSnapshot: number[] = [];
    let trackedIdsSet = new Set<string>();
    let cachedHistoricalSplit: Record<string, { dfo: number; tff: number }> | null = null;

    const refreshOfficialKasa = async (weeksToLoad: number[]) => {
      const [summaryRes, offMatchesRes] = await Promise.all([
        supabase
          .from('etml_standings_summary')
          .select('master_sira, user_id, oyuncu_adi, dfo_puan, tff_puan, bonus_puan, master_puan, tam_isabet')
          .order('master_sira', { ascending: true }),
        weeksToLoad.length > 0
          ? supabase
              .from('etml_official_matches')
              .select('id, week_num, match_index, status, pool_type, home_score, away_score, points_awarded, winner_ids')
              .in('week_num', weeksToLoad)
              .limit(500)
          : Promise.resolve({ data: [] as any[] })
      ]);

      let rows = (summaryRes.data || []) as OfficialSummaryRow[];

      // Tüm sezonun bitmiş maçlarını her Realtime tetiklemesinde değil, oturumda SADECE 1 KEZ çek!
      if (rows.length > 0 && !cachedHistoricalSplit) {
        let allFinMatches: any[] = [];
        let from = 0;
        const step = 1000;
        let more = true;
        while (more) {
          const { data: mChunk } = await supabase
            .from('etml_official_matches')
            .select('pool_type, winner_ids')
            .eq('status', 'FINISHED')
            .range(from, from + step - 1);
          if (mChunk && mChunk.length > 0) {
            allFinMatches = [...allFinMatches, ...mChunk];
            if (mChunk.length < step) more = false;
            else from += step;
          } else {
            more = false;
          }
        }

        const scoreSplitMap: Record<string, { dfo: number; tff: number }> = {};
        allFinMatches.forEach((m: any) => {
          (m.winner_ids || []).forEach((uid: string) => {
            if (!scoreSplitMap[uid]) scoreSplitMap[uid] = { dfo: 0, tff: 0 };
            if (m.pool_type === 'TFF') scoreSplitMap[uid].tff += 1;
            else scoreSplitMap[uid].dfo += 1;
          });
        });
        cachedHistoricalSplit = scoreSplitMap;
      }

      if (cachedHistoricalSplit) {
        const splitRef = cachedHistoricalSplit;
        rows = rows.map((r) => ({
          ...r,
          dfo_skor: splitRef[r.user_id]?.dfo || 0,
          tff_skor: splitRef[r.user_id]?.tff || 0
        }));
      }

      setOfficialSummaryRows(rows);

      if (offMatchesRes.data) {
        const offMap: Record<string, any> = {};
        offMatchesRes.data.forEach((m: any) => {
          offMap[String(m.id)] = m;
        });
        setOfficialWeekMatchesMap(offMap);
      }
    };

    const fetchInitialData = async () => {
      let { data: recentBultenData } = await supabase
        .from('matches_bulletin')
        .select('week_num, match_index, category, match_date, match_time, home_team, away_team')
        .gte('week_num', 41)
        .order('week_num', { ascending: true })
        .order('match_index', { ascending: true })
        .limit(500);

      if (!recentBultenData || recentBultenData.length === 0) {
        const fallbackRes = await supabase
          .from('matches_bulletin')
          .select('week_num, match_index, category, match_date, match_time, home_team, away_team')
          .gte('week_num', 40)
          .order('week_num', { ascending: true })
          .order('match_index', { ascending: true })
          .limit(500);
        recentBultenData = fallbackRes.data || [];
      }

      const mappedBulten = (recentBultenData || []).map((m: any) => ({
        id: Number(m.match_index),
        week_num: Number(m.week_num),
        weekLabel: `${m.week_num}. HAFTA ${m.match_index}. MAÇ`,
        category: m.category || '',
        date: String(m.match_date || '').trim(),
        time: String(m.match_time || '').trim(),
        homeTeam: m.home_team || '',
        awayTeam: m.away_team || ''
      }));

      setAllRecentBulletinMatches(mappedBulten);

      const distinctWeeks = Array.from(new Set<number>(mappedBulten.map((m) => m.week_num))).sort((a, b) => a - b);
      const candidateWeeks = distinctWeeks;
      candidateWeeksSnapshot = candidateWeeks;

      // Sadece son 72 saatte oynanmış veya önümüzdeki 36 saat içinde başlayacak haftaların tahminlerini çek (Henüz başlamamış 43-46. haftalar için boşuna binlerce satır çekmez!)
      const nowMs = Date.now();
      const predictionWeeks = distinctWeeks.filter((w) => {
        const wMatches = mappedBulten.filter((m) => m.week_num === w);
        const hasRecentOrUpcoming = wMatches.some((m) => {
          const kMs = getMatchTimeMs(m.date, m.time);
          return kMs > 0 && kMs <= nowMs + 36 * 60 * 60 * 1000 && nowMs - kMs <= 96 * 60 * 60 * 1000;
        });
        return hasRecentOrUpcoming;
      });
      const targetPredWeeks = predictionWeeks.length > 0 ? predictionWeeks : distinctWeeks.slice(0, 2);

      const targetMatchIds = mappedBulten
        .filter((m) => targetPredWeeks.includes(m.week_num))
        .map((m) => getUniqueMatchId(m.week_num, m.id));
      trackedIdsSet = new Set(mappedBulten.map((m) => String(getUniqueMatchId(m.week_num, m.id))));

      const fetchPredictionsPromise = (async () => {
        if (targetPredWeeks.length === 0) return [];
        const perWeekChunks = await Promise.all(
          targetPredWeeks.map(async (w) => {
            let weekPreds: any[] = [];
            let from = 0;
            const step = 1000;
            let keepFetching = true;
            while (keepFetching) {
              const { data, error } = await supabase
                .from('player_predictions')
                .select('user_id, week_num, match_index, predicted_score')
                .eq('week_num', w)
                .range(from, from + step - 1);
              if (error || !data || data.length === 0) {
                keepFetching = false;
              } else {
                weekPreds = [...weekPreds, ...data];
                if (data.length < step) keepFetching = false;
                else from += step;
              }
            }
            return weekPreds;
          })
        );
        return perWeekChunks.flat();
      })();

      const [allPredictions, dbLiveMatchesRes] = await Promise.all([
        fetchPredictionsPromise,
        targetMatchIds.length > 0
          ? supabase
              .from('live_matches')
              .select('id, home_score, away_score, status, updated_at, elapsed, events')
              .in('id', targetMatchIds)
          : Promise.resolve({ data: [] as any[] }),
        refreshOfficialKasa(targetPredWeeks)
      ]);

      const pDict: Record<string, string> = {};
      allPredictions.forEach((pred: any) => {
        const uid = String(pred.user_id || '').trim();
        if (!uid || EXCLUDED_IDS.has(uid)) return;
        const cleanScore = String(pred.predicted_score || '')
          .replace(/\s+/g, '')
          .replace(':', '-');
        if (cleanScore) {
          pDict[`${uid}-${pred.week_num}-${pred.match_index}`] = cleanScore;
        }
      });
      setPredictionsData(pDict);

      const dbLiveMatches = dbLiveMatchesRes.data || [];
      const liveMap: Record<string, any> = {};
      dbLiveMatches.forEach((row: any) => {
        const key = String(row.id);
        liveMap[key] = row;
        if (row.home_score !== '-' && row.away_score !== '-' && row.home_score !== null && row.away_score !== null) {
          prevScoresRef.current[key] = `${row.home_score}-${row.away_score}`;
        }
      });
      setLiveMatchesData(liveMap);
      setIsWeekLoaded(true);
    };

    fetchInitialData();

    const channel = supabase
      .channel('etml-live-card-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_matches' }, (payload: any) => {
        const row = payload.new;
        if (!row || row.id === undefined) return;
        const key = String(row.id);
        if (trackedIdsSet.size > 0 && !trackedIdsSet.has(key)) return;

        const isActiveOrFin = ['FINISHED', 'FT', 'AET', 'PEN', 'LIVE', '1H', '2H', 'HT', 'ET', 'P', 'WAITING_APPROVAL'].includes(row.status);
        if (isActiveOrFin && row.home_score !== '-' && row.away_score !== '-' && row.home_score !== null && row.away_score !== null) {
          const newScore = `${row.home_score}-${row.away_score}`;
          const prevScore = prevScoresRef.current[key];
          if (prevScore && prevScore !== newScore) {
            triggerGoalAlert(key);
          }
          prevScoresRef.current[key] = newScore;
        }
        setLiveMatchesData((prev) => ({ ...prev, [key]: row }));

        if (['FINISHED', 'FT', 'AET', 'PEN', 'NOT_STARTED'].includes(row.status) && candidateWeeksSnapshot.length > 0) {
          refreshOfficialKasa(candidateWeeksSnapshot);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'etml_official_matches' }, () => {
        if (candidateWeeksSnapshot.length > 0) {
          refreshOfficialKasa(candidateWeeksSnapshot);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const liveWindowTick = Math.floor(now / 15000);

  const {
    activeBulletinWeeks,
    availableDateTabs,
    weeklyLiveTables,
    globalLiveRanks,
    liveStandingsTable
  } = useMemo(() => {
    const todayDateStr = getTodayDateString();
    const todayZeroDate = parseDateLocal(todayDateStr);
    todayZeroDate.setHours(0, 0, 0, 0);
    // Son 48 saat içinde oynanan günleri de sekmede tut (gece 00:00 geçişinde dünkü maçlar asla kaybolmasın!)
    const recentHistoryCutoffMs = todayZeroDate.getTime() - 48 * 60 * 60 * 1000;

    const accountIds = Object.keys(mergedAccounts).filter((id) => !EXCLUDED_IDS.has(id));
    const currentCheckMs = liveWindowTick * 15000;

    const allDistinctWeeks = Array.from(new Set<number>(allRecentBulletinMatches.map((m) => m.week_num))).sort((a, b) => a - b);

    // En son oynanmaya başlamış / maçı bitmiş bülteni bul (Örn: 41. Hafta tüm 24 maçı bitse bile 42 başlayana kadar ekranda kalır!)
    let latestStartedWeek = allDistinctWeeks[0] || 41;
    allDistinctWeeks.forEach((w) => {
      const wMatches = allRecentBulletinMatches.filter((m) => m.week_num === w);
      const hasStarted = wMatches.some((m) => {
        const uid = String(getUniqueMatchId(w, m.id));
        const offM = officialWeekMatchesMap[uid];
        const dbM = liveMatchesData[uid];
        if (offM?.status === 'FINISHED' || (dbM && dbM.status && dbM.status !== 'NOT_STARTED')) return true;
        const kMs = getMatchTimeMs(m.date, m.time);
        return kMs > 0 && currentCheckMs >= kMs;
      });
      if (hasStarted) latestStartedWeek = w;
    });

    const openWeeks: number[] = [];
    allDistinctWeeks.forEach((w) => {
      const wMatches = allRecentBulletinMatches.filter((m) => m.week_num === w);
      if (wMatches.length === 0) return;

      const hasUnfinishedMatch = wMatches.some((m) => {
        const uid = String(getUniqueMatchId(w, m.id));
        const offM = officialWeekMatchesMap[uid];
        const dbM = liveMatchesData[uid];
        const isSettled =
          offM?.status === 'FINISHED' ||
          offM?.status === 'POSTPONED' ||
          ['FINISHED', 'FT', 'AET', 'PEN', 'POSTPONED', 'PST'].includes(dbM?.status);
        return !isSettled;
      });

      const playedRecently = wMatches.some((m) => {
        const kMs = getMatchTimeMs(m.date, m.time);
        return kMs > 0 && currentCheckMs >= kMs && currentCheckMs - kMs <= 48 * 60 * 60 * 1000;
      });

      if (hasUnfinishedMatch || w >= latestStartedWeek || playedRecently) {
        openWeeks.push(w);
      }
    });

    if (openWeeks.length === 0 && allDistinctWeeks.length > 0) {
      openWeeks.push(...allDistinctWeeks);
    }

    const activeMatchesPool = allRecentBulletinMatches.filter((m) => openWeeks.includes(m.week_num));

    // Puan hesaplaması için skoru girilmiş aktif canlı maç kontrolü
    const checkIsMatchActivelyLive = (m: any) => {
      const uid = String(getUniqueMatchId(m.week_num, m.id));
      const offM = officialWeekMatchesMap[uid];
      if (offM && (offM.status === 'FINISHED' || offM.status === 'POSTPONED')) return false;

      const dbM = liveMatchesData[uid];
      if (!dbM || ['FINISHED', 'FT', 'AET', 'PEN', 'POSTPONED', 'PST'].includes(dbM.status)) return false;
      if (!['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'WAITING_APPROVAL'].includes(dbM.status)) return false;
      if (dbM.home_score === undefined || dbM.home_score === null || String(dbM.home_score) === '-' || String(dbM.away_score) === '-') {
        return false;
      }

      const kickoffMs = getMatchTimeMs(m.date, m.time);
      return kickoffMs > 0 && currentCheckMs >= kickoffMs && currentCheckMs <= kickoffMs + 16 * 60 * 60 * 1000;
    };

    // Başlama saati geçmiş ve henüz FINISHED onaylanmamış maç kontrolü (Gece 00:00'dan sonra da 16 Kasım'ı otomatik açık tutar!)
    const checkIsMatchInPlayOrWaiting = (m: any) => {
      const uid = String(getUniqueMatchId(m.week_num, m.id));
      const offM = officialWeekMatchesMap[uid];
      if (offM && (offM.status === 'FINISHED' || offM.status === 'POSTPONED')) return false;

      const dbM = liveMatchesData[uid];
      if (dbM && ['FINISHED', 'FT', 'AET', 'PEN', 'POSTPONED', 'PST'].includes(dbM.status)) return false;
      if (dbM && ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'WAITING_APPROVAL'].includes(dbM.status)) return true;

      const kickoffMs = getMatchTimeMs(m.date, m.time);
      return kickoffMs > 0 && currentCheckMs >= kickoffMs && currentCheckMs <= kickoffMs + 18 * 60 * 60 * 1000;
    };

    // 2. Üstteki Gün-Gün Tarih Sekmelerini Oluştur
    const dateGroupMap: Record<
      string,
      {
        dateStr: string;
        sortMs: number;
        label: string;
        totalCount: number;
        liveCount: number;
        inPlayCount: number;
        unfinishedCount: number;
        matches: any[];
      }
    > = {};

    activeMatchesPool.forEach((m) => {
      if (!m.date) return;
      const dObj = parseDateLocal(m.date);
      dObj.setHours(0, 0, 0, 0);
      const dMs = dObj.getTime();

      const uid = String(getUniqueMatchId(m.week_num, m.id));
      const offM = officialWeekMatchesMap[uid];
      const dbM = liveMatchesData[uid];
      const isFin =
        offM?.status === 'FINISHED' ||
        offM?.status === 'POSTPONED' ||
        ['FINISHED', 'FT', 'AET', 'PEN', 'POSTPONED', 'PST'].includes(dbM?.status);
      const isActLive = checkIsMatchActivelyLive(m);
      const isInPlay = checkIsMatchInPlayOrWaiting(m);

      // 48 saatten daha eski ve tüm maçları bitmiş günleri kalabalık etmemesi için atla; bitmemiş tek maç varsa bile göster!
      if (dMs < recentHistoryCutoffMs && isFin && !isInPlay) {
        return;
      }

      if (!dateGroupMap[m.date]) {
        dateGroupMap[m.date] = {
          dateStr: m.date,
          sortMs: dMs,
          label: formatTrDateLabel(m.date),
          totalCount: 0,
          liveCount: 0,
          inPlayCount: 0,
          unfinishedCount: 0,
          matches: []
        };
      }

      dateGroupMap[m.date].totalCount += 1;
      if (!isFin) dateGroupMap[m.date].unfinishedCount += 1;
      if (isActLive) dateGroupMap[m.date].liveCount += 1;
      if (isInPlay) dateGroupMap[m.date].inPlayCount += 1;
      dateGroupMap[m.date].matches.push(m);
    });

    const sortedDateTabs = Object.values(dateGroupMap)
      .sort((a, b) => a.sortMs - b.sortMs)
      .map((grp) => ({
        ...grp,
        matches: grp.matches.sort(
          (a, b) => getMatchTimeMs(a.date, a.time) - getMatchTimeMs(b.date, b.time) || a.week_num - b.week_num || a.id - b.id
        )
      }));

    // 3. Her Aktif Bülten İçin Haftalık Canlı Tablolar (CANLI 41. HAFTA, CANLI 42. HAFTA...)
    const perWeekTables: Record<number, WeekLiveBucket> = {};

    openWeeks.forEach((week) => {
      const wMatches = allRecentBulletinMatches.filter((m) => m.week_num === week);
      let finCount = 0;
      let lvCount = 0;
      let ipCount = 0;

      const wMap: Record<
        string,
        {
          id: string;
          name: string;
          kesinDfo: number;
          kesinTff: number;
          canliDfo: number;
          canliTff: number;
          kesinDfoSkor: number;
          kesinTffSkor: number;
          canliDfoSkor: number;
          canliTffSkor: number;
        }
      > = {};

      accountIds.forEach((uid) => {
        wMap[uid] = {
          id: uid,
          name: mergedAccounts[uid]?.name || uid,
          kesinDfo: 0,
          kesinTff: 0,
          canliDfo: 0,
          canliTff: 0,
          kesinDfoSkor: 0,
          kesinTffSkor: 0,
          canliDfoSkor: 0,
          canliTffSkor: 0
        };
      });

      wMatches.forEach((m) => {
        const uniqueId = String(getUniqueMatchId(week, m.id));
        const offMatch = officialWeekMatchesMap[uniqueId];
        const dbMatch = liveMatchesData[uniqueId];

        if (checkIsMatchInPlayOrWaiting(m)) ipCount += 1;

        const isOffFin = Boolean(offMatch && offMatch.status === 'FINISHED');
        const isDbFin =
          !isOffFin &&
          offMatch?.status !== 'POSTPONED' &&
          Boolean(dbMatch && ['FINISHED', 'FT', 'AET', 'PEN'].includes(dbMatch.status)) &&
          String(dbMatch?.home_score ?? '-') !== '-' &&
          String(dbMatch?.away_score ?? '-') !== '-';

        if (isOffFin) {
          finCount += 1;
          const pts = Number(offMatch.points_awarded || 0);
          const isTff = offMatch.pool_type === 'TFF';
          (offMatch.winner_ids || []).forEach((wId: string) => {
            if (EXCLUDED_IDS.has(wId) || !wMap[wId]) return;
            if (isTff) {
              wMap[wId].kesinTff += pts;
              wMap[wId].kesinTffSkor += 1;
            } else {
              wMap[wId].kesinDfo += pts;
              wMap[wId].kesinDfoSkor += 1;
            }
          });
        } else if (isDbFin) {
          finCount += 1;
          const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`.replace(/\s+/g, '');
          const winnerIds = accountIds.filter((id) => predictionsData[`${id}-${week}-${m.id}`] === targetScore);
          const pts = calcMatchPts(winnerIds.length);
          const isTff = offMatch?.pool_type ? offMatch.pool_type === 'TFF' : advancedTffCheck(m.category, m.homeTeam, m.awayTeam);
          winnerIds.forEach((wId) => {
            if (!wMap[wId]) return;
            if (isTff) {
              wMap[wId].kesinTff += pts;
              wMap[wId].kesinTffSkor += 1;
            } else {
              wMap[wId].kesinDfo += pts;
              wMap[wId].kesinDfoSkor += 1;
            }
          });
        } else if (checkIsMatchActivelyLive(m)) {
          lvCount += 1;
          const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`.replace(/\s+/g, '');
          const winnerIds = accountIds.filter((id) => predictionsData[`${id}-${week}-${m.id}`] === targetScore);
          const pts = calcMatchPts(winnerIds.length);
          const isTff = offMatch?.pool_type ? offMatch.pool_type === 'TFF' : advancedTffCheck(m.category, m.homeTeam, m.awayTeam);
          winnerIds.forEach((wId) => {
            if (!wMap[wId]) return;
            if (isTff) {
              wMap[wId].canliTff += pts;
              wMap[wId].canliTffSkor += 1;
            } else {
              wMap[wId].canliDfo += pts;
              wMap[wId].canliDfoSkor += 1;
            }
          });
        }
      });

      const wRows = Object.values(wMap).map((r) => {
        const toplamDfo = r.kesinDfo + r.canliDfo;
        const toplamTff = r.kesinTff + r.canliTff;
        const canliMaster = r.canliDfo + r.canliTff;
        const toplamMaster = toplamDfo + toplamTff;
        const toplamDfoSkor = r.kesinDfoSkor + r.canliDfoSkor;
        const toplamTffSkor = r.kesinTffSkor + r.canliTffSkor;
        const canliSkor = r.canliDfoSkor + r.canliTffSkor;
        const toplamSkor = toplamDfoSkor + toplamTffSkor;
        return {
          ...r,
          toplamDfo,
          toplamTff,
          canliMaster,
          toplamMaster,
          toplamDfoSkor,
          toplamTffSkor,
          canliSkor,
          toplamSkor
        };
      });

      perWeekTables[week] = {
        totalMatches: wMatches.length,
        finishedCount: finCount,
        liveCount: lvCount,
        inPlayCount: ipCount,
        MASTER: wRows
          .filter((r) => r.toplamMaster > 0)
          .sort((a, b) => b.toplamMaster - a.toplamMaster || b.toplamSkor - a.toplamSkor || a.name.localeCompare(b.name, 'tr'))
          .map((r, i) => ({
            id: r.id,
            name: r.name,
            rank: i + 1,
            toplamDfo: r.toplamDfo,
            toplamTff: r.toplamTff,
            toplamMaster: r.toplamMaster,
            toplamSkor: r.toplamSkor,
            canliMaster: r.canliMaster
          })),
        DFO: wRows
          .filter((r) => r.toplamDfo > 0)
          .sort((a, b) => b.toplamDfo - a.toplamDfo || b.toplamDfoSkor - a.toplamDfoSkor || a.name.localeCompare(b.name, 'tr'))
          .map((r, i) => ({ id: r.id, name: r.name, rank: i + 1, pts: r.toplamDfo, liveAdd: r.canliDfo })),
        TFF: wRows
          .filter((r) => r.toplamTff > 0)
          .sort((a, b) => b.toplamTff - a.toplamTff || b.toplamTffSkor - a.toplamTffSkor || a.name.localeCompare(b.name, 'tr'))
          .map((r, i) => ({ id: r.id, name: r.name, rank: i + 1, pts: r.toplamTff, liveAdd: r.canliTff })),
        SKOR_MASTER: wRows
          .filter((r) => r.toplamSkor > 0)
          .sort((a, b) => b.toplamSkor - a.toplamSkor || b.toplamMaster - a.toplamMaster || a.name.localeCompare(b.name, 'tr'))
          .map((r, i) => ({
            id: r.id,
            name: r.name,
            rank: i + 1,
            toplamDfoSkor: r.toplamDfoSkor,
            toplamTffSkor: r.toplamTffSkor,
            toplamSkor: r.toplamSkor,
            canliSkor: r.canliSkor
          })),
        SKOR_DFO: wRows
          .filter((r) => r.toplamDfoSkor > 0)
          .sort((a, b) => b.toplamDfoSkor - a.toplamDfoSkor || b.toplamDfo - a.toplamDfo || a.name.localeCompare(b.name, 'tr'))
          .map((r, i) => ({ id: r.id, name: r.name, rank: i + 1, pts: r.toplamDfoSkor, liveAdd: r.canliDfoSkor })),
        SKOR_TFF: wRows
          .filter((r) => r.toplamTffSkor > 0)
          .sort((a, b) => b.toplamTffSkor - a.toplamTffSkor || b.toplamTff - a.toplamTff || a.name.localeCompare(b.name, 'tr'))
          .map((r, i) => ({ id: r.id, name: r.name, rank: i + 1, pts: r.toplamTffSkor, liveAdd: r.canliTffSkor }))
      };
    });

    // 4. Genel Puan Durumları
    const baseMap: Record<
      string,
      {
        id: string;
        name: string;
        kesinDfo: number;
        kesinTff: number;
        bonus: number;
        kesinMaster: number;
        kesinDfoSkor: number;
        kesinTffSkor: number;
        kesinSkor: number;
        canliDfo: number;
        canliTff: number;
        canliMaster: number;
        canliDfoSkor: number;
        canliTffSkor: number;
        canliSkor: number;
      }
    > = {};

    officialSummaryRows.forEach((r) => {
      if (EXCLUDED_IDS.has(r.user_id)) return;
      baseMap[r.user_id] = {
        id: r.user_id,
        name: mergedAccounts[r.user_id]?.name || r.oyuncu_adi || r.user_id,
        kesinDfo: Number(r.dfo_puan || 0),
        kesinTff: Number(r.tff_puan || 0),
        bonus: Number(r.bonus_puan || 0),
        kesinMaster: Number(r.master_puan || 0),
        kesinDfoSkor: Number(r.dfo_skor || 0),
        kesinTffSkor: Number(r.tff_skor || 0),
        kesinSkor: Number(r.tam_isabet || 0),
        canliDfo: 0,
        canliTff: 0,
        canliMaster: 0,
        canliDfoSkor: 0,
        canliTffSkor: 0,
        canliSkor: 0
      };
    });

    accountIds.forEach((uid) => {
      if (!baseMap[uid]) {
        baseMap[uid] = {
          id: uid,
          name: mergedAccounts[uid]?.name || uid,
          kesinDfo: 0,
          kesinTff: 0,
          bonus: 0,
          kesinMaster: 0,
          kesinDfoSkor: 0,
          kesinTffSkor: 0,
          kesinSkor: 0,
          canliDfo: 0,
          canliTff: 0,
          canliMaster: 0,
          canliDfoSkor: 0,
          canliTffSkor: 0,
          canliSkor: 0
        };
      }
    });

    activeMatchesPool.forEach((m) => {
      const uniqueId = String(getUniqueMatchId(m.week_num, m.id));
      const offMatch = officialWeekMatchesMap[uniqueId];
      if (offMatch && (offMatch.status === 'FINISHED' || offMatch.status === 'POSTPONED')) {
        return;
      }

      const dbMatch = liveMatchesData[uniqueId];
      const isDbFinNotSynced =
        Boolean(dbMatch && ['FINISHED', 'FT', 'AET', 'PEN'].includes(dbMatch.status)) &&
        String(dbMatch?.home_score ?? '-') !== '-' &&
        String(dbMatch?.away_score ?? '-') !== '-';

      if (isDbFinNotSynced) {
        const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`.replace(/\s+/g, '');
        const winnerIds = accountIds.filter((id) => predictionsData[`${id}-${m.week_num}-${m.id}`] === targetScore);
        const pts = calcMatchPts(winnerIds.length);
        const isTff = offMatch?.pool_type ? offMatch.pool_type === 'TFF' : advancedTffCheck(m.category, m.homeTeam, m.awayTeam);
        winnerIds.forEach((wId) => {
          if (!baseMap[wId]) return;
          if (isTff) {
            baseMap[wId].kesinTff += pts;
            baseMap[wId].kesinTffSkor += 1;
          } else {
            baseMap[wId].kesinDfo += pts;
            baseMap[wId].kesinDfoSkor += 1;
          }
          baseMap[wId].kesinMaster += pts;
          baseMap[wId].kesinSkor += 1;
        });
      } else if (checkIsMatchActivelyLive(m)) {
        const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`.replace(/\s+/g, '');
        const winnerIds = accountIds.filter((id) => predictionsData[`${id}-${m.week_num}-${m.id}`] === targetScore);
        const pts = calcMatchPts(winnerIds.length);
        const isTff = offMatch?.pool_type ? offMatch.pool_type === 'TFF' : advancedTffCheck(m.category, m.homeTeam, m.awayTeam);

        winnerIds.forEach((wId) => {
          if (!baseMap[wId]) return;
          if (isTff) {
            baseMap[wId].canliTff += pts;
            baseMap[wId].canliTffSkor += 1;
          } else {
            baseMap[wId].canliDfo += pts;
            baseMap[wId].canliDfoSkor += 1;
          }
          baseMap[wId].canliMaster += pts;
          baseMap[wId].canliSkor += 1;
        });
      }
    });

    const baseList = Object.values(baseMap);

    const kesinMasterRankMap: Record<string, number> = {};
    [...baseList]
      .sort((a, b) => b.kesinMaster - a.kesinMaster || b.kesinSkor - a.kesinSkor || a.name.localeCompare(b.name, 'tr'))
      .forEach((r, i) => {
        kesinMasterRankMap[r.id] = i + 1;
      });

    const kesinDfoRankMap: Record<string, number> = {};
    [...baseList]
      .sort((a, b) => b.kesinDfo - a.kesinDfo || b.kesinDfoSkor - a.kesinDfoSkor || a.name.localeCompare(b.name, 'tr'))
      .forEach((r, i) => {
        kesinDfoRankMap[r.id] = i + 1;
      });

    const kesinTffRankMap: Record<string, number> = {};
    [...baseList]
      .sort((a, b) => b.kesinTff - a.kesinTff || b.kesinTffSkor - a.kesinTffSkor || a.name.localeCompare(b.name, 'tr'))
      .forEach((r, i) => {
        kesinTffRankMap[r.id] = i + 1;
      });

    const kesinSkorRankMap: Record<string, number> = {};
    [...baseList]
      .sort((a, b) => b.kesinSkor - a.kesinSkor || b.kesinMaster - a.kesinMaster || a.name.localeCompare(b.name, 'tr'))
      .forEach((r, i) => {
        kesinSkorRankMap[r.id] = i + 1;
      });

    const kesinDfoSkorRankMap: Record<string, number> = {};
    [...baseList]
      .sort((a, b) => b.kesinDfoSkor - a.kesinDfoSkor || b.kesinDfo - a.kesinDfo || a.name.localeCompare(b.name, 'tr'))
      .forEach((r, i) => {
        kesinDfoSkorRankMap[r.id] = i + 1;
      });

    const kesinTffSkorRankMap: Record<string, number> = {};
    [...baseList]
      .sort((a, b) => b.kesinTffSkor - a.kesinTffSkor || b.kesinTff - a.kesinTff || a.name.localeCompare(b.name, 'tr'))
      .forEach((r, i) => {
        kesinTffSkorRankMap[r.id] = i + 1;
      });

    const combinedList = baseList.map((row) => ({
      ...row,
      kesinSira: kesinMasterRankMap[row.id] || 99,
      toplamDfo: row.kesinDfo + row.canliDfo,
      toplamTff: row.kesinTff + row.canliTff,
      toplamMaster: row.kesinMaster + row.canliMaster,
      toplamDfoSkor: row.kesinDfoSkor + row.canliDfoSkor,
      toplamTffSkor: row.kesinTffSkor + row.canliTffSkor,
      toplamSkor: row.kesinSkor + row.canliSkor
    }));

    const sortedMaster = [...combinedList]
      .sort((a, b) => b.toplamMaster - a.toplamMaster || b.toplamSkor - a.toplamSkor || a.name.localeCompare(b.name, 'tr'))
      .map((r, i) => ({ ...r, rankMaster: i + 1 }));

    const sortedDfo = [...combinedList]
      .sort((a, b) => b.toplamDfo - a.toplamDfo || b.toplamDfoSkor - a.toplamDfoSkor || a.name.localeCompare(b.name, 'tr'))
      .map((r, i) => ({
        id: r.id,
        name: r.name,
        pts: r.toplamDfo,
        liveAdd: r.canliDfo,
        rank: i + 1,
        prevRank: kesinDfoRankMap[r.id] || i + 1
      }));

    const sortedTff = [...combinedList]
      .sort((a, b) => b.toplamTff - a.toplamTff || b.toplamTffSkor - a.toplamTffSkor || a.name.localeCompare(b.name, 'tr'))
      .map((r, i) => ({
        id: r.id,
        name: r.name,
        pts: r.toplamTff,
        liveAdd: r.canliTff,
        rank: i + 1,
        prevRank: kesinTffRankMap[r.id] || i + 1
      }));

    const sortedSkorMaster = [...combinedList]
      .sort((a, b) => b.toplamSkor - a.toplamSkor || b.toplamMaster - a.toplamMaster || a.name.localeCompare(b.name, 'tr'))
      .map((r, i) => ({ ...r, rankSkor: i + 1, prevSkorRank: kesinSkorRankMap[r.id] || i + 1 }));

    const sortedSkorDfo = [...combinedList]
      .sort((a, b) => b.toplamDfoSkor - a.toplamDfoSkor || b.toplamDfo - a.toplamDfo || a.name.localeCompare(b.name, 'tr'))
      .map((r, i) => ({
        id: r.id,
        name: r.name,
        pts: r.toplamDfoSkor,
        liveAdd: r.canliDfoSkor,
        rank: i + 1,
        prevRank: kesinDfoSkorRankMap[r.id] || i + 1
      }));

    const sortedSkorTff = [...combinedList]
      .sort((a, b) => b.toplamTffSkor - a.toplamTffSkor || b.toplamTff - a.toplamTff || a.name.localeCompare(b.name, 'tr'))
      .map((r, i) => ({
        id: r.id,
        name: r.name,
        pts: r.toplamTffSkor,
        liveAdd: r.canliTffSkor,
        rank: i + 1,
        prevRank: kesinTffSkorRankMap[r.id] || i + 1
      }));

    return {
      activeBulletinWeeks: openWeeks,
      availableDateTabs: sortedDateTabs,
      weeklyLiveTables: perWeekTables,
      globalLiveRanks: {
        MASTER: sortedMaster.map((r) => ({ id: r.id, name: r.name, pts: r.toplamMaster, rank: r.rankMaster })),
        DFO: sortedDfo,
        TFF: sortedTff,
        SKOR: sortedSkorMaster.map((r) => ({ id: r.id, name: r.name, pts: r.toplamSkor, rank: r.rankSkor }))
      },
      liveStandingsTable: {
        MASTER: sortedMaster,
        DFO: sortedDfo,
        TFF: sortedTff,
        SKOR_MASTER: sortedSkorMaster,
        SKOR_DFO: sortedSkorDfo,
        SKOR_TFF: sortedSkorTff
      }
    };
  }, [allRecentBulletinMatches, liveMatchesData, officialWeekMatchesMap, officialSummaryRows, predictionsData, mergedAccounts, liveWindowTick]);

  // Seçili Maç Tarihi Sekmesini Otomatik Çözümle:
  // Gece 00:00'ı geçse bile 16 Kasım'dan hâlâ oynanan/onay bekleyen maç varsa otomatik 16 Kasım'ı açar!
  const effectiveMatchDate = useMemo(() => {
    if (selectedMatchDate && availableDateTabs.some((t) => t.dateStr === selectedMatchDate)) {
      return selectedMatchDate;
    }
    const inPlayTab = availableDateTabs.find((t) => t.inPlayCount > 0 || t.liveCount > 0);
    if (inPlayTab) return inPlayTab.dateStr;

    const todayStr = getTodayDateString();
    const todayTab = availableDateTabs.find((t) => t.dateStr === todayStr);
    if (todayTab) return todayTab.dateStr;

    const todayZero = parseDateLocal(todayStr);
    todayZero.setHours(0, 0, 0, 0);
    const nextUpcoming = availableDateTabs.find((t) => t.sortMs >= todayZero.getTime());
    if (nextUpcoming) return nextUpcoming.dateStr;

    return availableDateTabs[availableDateTabs.length - 1]?.dateStr || todayStr;
  }, [selectedMatchDate, availableDateTabs]);

  const currentDayTabObj = useMemo(() => {
    return availableDateTabs.find((t) => t.dateStr === effectiveMatchDate) || null;
  }, [availableDateTabs, effectiveMatchDate]);

  const selectedDayMatches = currentDayTabObj ? currentDayTabObj.matches : [];
  const selectedDayLabel = currentDayTabObj ? currentDayTabObj.label : formatTrDateLabel(effectiveMatchDate);
  const isSelectedDayToday = effectiveMatchDate === getTodayDateString();

  // Seçili Haftalık Canlı Bülten: Önce canlı/onay bekleyen maçı olan haftayı (örn: 41), yoksa en son puan alınmış haftayı açar!
  const effectiveBulletinWeek = useMemo(() => {
    if (selectedBulletinWeek && activeBulletinWeeks.includes(selectedBulletinWeek)) {
      return selectedBulletinWeek;
    }
    const weekInPlay = activeBulletinWeeks.find(
      (w) => (weeklyLiveTables[w]?.liveCount || 0) > 0 || (weeklyLiveTables[w]?.inPlayCount || 0) > 0
    );
    if (weekInPlay) return weekInPlay;

    const latestScoredWeek = [...activeBulletinWeeks].reverse().find((w) => (weeklyLiveTables[w]?.finishedCount || 0) > 0);
    return latestScoredWeek || activeBulletinWeeks[0] || 41;
  }, [selectedBulletinWeek, activeBulletinWeeks, weeklyLiveTables]);

  const currentWeekBucket = weeklyLiveTables[effectiveBulletinWeek];
  const totalActiveLiveMatches = activeBulletinWeeks.reduce((acc, w) => acc + (weeklyLiveTables[w]?.liveCount || 0), 0);

  const handleLiveUltraFetch = async () => {
    setIsManualFetching(true);
    try {
      const todayStr = getTodayDateString();
      const targetFetchDate =
        effectiveMatchDate && allRecentBulletinMatches.some((m: any) => m.date === effectiveMatchDate)
          ? effectiveMatchDate
          : todayStr;

      const dayBulletinMatches = allRecentBulletinMatches.filter((m: any) => m.date === targetFetchDate);

      if (dayBulletinMatches.length === 0) {
        alert(`⚠️ Bültende ${targetFetchDate} tarihinde oynanacak maç bulunamadı!`);
        setIsManualFetching(false);
        return;
      }

      let formattedDate = targetFetchDate;
      if (formattedDate.includes('.')) {
        const parts = formattedDate.split('.');
        formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }

      const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${formattedDate}`, {
        headers: {
          'x-apisports-key': '933e5ccc09194d0db30171e2bca20ca9',
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      });
      const data = await res.json();

      if (data.errors && Object.keys(data.errors).length > 0) {
        alert('❌ API UYARISI: ' + JSON.stringify(data.errors));
        setIsManualFetching(false);
        return;
      }

      if (!data.response || data.response.length === 0) {
        alert(`⚠️ Uydu ${targetFetchDate} tarihi için boş yanıt verdi.`);
        setIsManualFetching(false);
        return;
      }

      const allFixtures = data.response;
      const nowTime = new Date();
      const timeString = `${String(nowTime.getHours()).padStart(2, '0')}:${String(nowTime.getMinutes()).padStart(2, '0')}:${String(nowTime.getSeconds()).padStart(2, '0')}`;

      const targetWeeks = Array.from(new Set(dayBulletinMatches.map((m: any) => m.week_num)));
      const { data: dbBulletinWithApi } = await supabase
        .from('matches_bulletin')
        .select('week_num, match_index, home_team, away_team, api_match_id')
        .in('week_num', targetWeeks);

      const apiIdLookup: Record<string, any> = {};
      (dbBulletinWithApi || []).forEach((b: any) => {
        apiIdLookup[`${b.week_num}-${b.match_index}`] = b.api_match_id;
      });

      const idsToFetch = dayBulletinMatches.map((m: any) => getUniqueMatchId(m.week_num, m.id));
      const { data: latestLiveDb } = await supabase.from('live_matches').select('id, status').in('id', idsToFetch);
      const dbStatusMap: Record<string, string> = {};
      (latestLiveDb || []).forEach((l: any) => {
        dbStatusMap[String(l.id)] = l.status;
      });

      const updates: any[] = [];
      const bulletinUpdates: any[] = [];

      for (const bMac of dayBulletinMatches) {
        const uniqueId = getUniqueMatchId(bMac.week_num, bMac.id);
        const uidStr = String(uniqueId);

        if (dbStatusMap[uidStr] === 'FINISHED' || officialWeekMatchesMap[uidStr]?.status === 'FINISHED') {
          continue;
        }

        let fixtureId = apiIdLookup[`${bMac.week_num}-${bMac.id}`];
        let fix = null;

        if (fixtureId && !String(fixtureId).startsWith('manuel-')) {
          fix = allFixtures.find((f: any) => f.fixture.id == fixtureId);
        } else {
          const hClean = sanitizeStr(bMac.homeTeam);
          const aClean = sanitizeStr(bMac.awayTeam);
          fix = allFixtures.find((f: any) => {
            const apiHome = sanitizeStr(f.teams.home.name);
            const apiAway = sanitizeStr(f.teams.away.name);
            const homeOk = apiHome === hClean || apiHome.includes(hClean) || hClean.includes(apiHome);
            const awayOk = apiAway === aClean || apiAway.includes(aClean) || aClean.includes(apiAway);
            return homeOk && awayOk;
          });

          if (fix) {
            fixtureId = fix.fixture.id;
            bulletinUpdates.push({
              week_num: bMac.week_num,
              match_index: bMac.id,
              api_match_id: fixtureId
            });
          }
        }

        if (fix) {
          const homeScore = fix.goals.home !== null ? String(fix.goals.home) : '-';
          const awayScore = fix.goals.away !== null ? String(fix.goals.away) : '-';
          let status = fix.fixture.status.short;

          if (['1H', '2H', 'ET', 'P', 'LIVE'].includes(status)) status = 'LIVE';
          else if (status === 'HT') status = 'HT';
          else if (['FT', 'AET', 'PEN', 'FINISHED'].includes(status)) status = 'WAITING_APPROVAL';

          updates.push({
            id: uniqueId,
            api_match_id: fixtureId,
            home_score: homeScore,
            away_score: awayScore,
            status,
            updated_by: 'MASTER_RADAR',
            updated_at: timeString,
            events: JSON.stringify(
              (fix.events || []).map((ev: any) => ({
                type: ev.type,
                detail: ev.detail,
                time: { elapsed: ev.time?.elapsed },
                team: { id: ev.team?.id, name: ev.team?.name },
                player: { name: ev.player?.name },
                assist: ev.assist?.name ? { name: ev.assist.name } : undefined
              }))
            ),
            elapsed: fix.fixture.status.elapsed
          });
        }
      }

      for (const bu of bulletinUpdates) {
        await supabase
          .from('matches_bulletin')
          .update({ api_match_id: bu.api_match_id })
          .eq('week_num', bu.week_num)
          .eq('match_index', bu.match_index);
      }

      if (updates.length > 0) {
        const { error } = await supabase.from('live_matches').upsert(updates, { onConflict: 'id' });
        if (error) {
          alert('❌ Güncelleme hatası: ' + error.message);
        } else {
          const nextMap: Record<string, any> = {};
          updates.forEach((u) => {
            nextMap[String(u.id)] = u;
          });
          setLiveMatchesData((prev) => ({ ...prev, ...nextMap }));
          setTimeout(() => checkMasterApiLimit(), 1200);
          alert(`✅ Ultra Ateşleme Başarılı! (${targetFetchDate}) ${updates.length} maç anında canlı ekrana işlendi.`);
        }
      } else {
        setTimeout(() => checkMasterApiLimit(), 1200);
        alert(`⚠️ Uydu tarandı ancak ${targetFetchDate} için güncellenecek aktif/bitmemiş maç bulunamadı.`);
      }
    } catch (e: any) {
      alert('❌ Uydu bağlantı hatası: ' + (e?.message || ''));
    } finally {
      setIsManualFetching(false);
    }
  };

  const toggleEvents = (uniqueId: string) => setOpenEventsMap((prev) => ({ ...prev, [uniqueId]: prev[uniqueId] === false ? true : false }));
  const toggleWinners = (uniqueId: string) => setOpenWinnersMap((prev) => ({ ...prev, [uniqueId]: !prev[uniqueId] }));
  const togglePossible = (uniqueId: string) => setOpenPossibleMap((prev) => ({ ...prev, [uniqueId]: !prev[uniqueId] }));
  const toggleEliminated = (uniqueId: string) => setOpenEliminatedMap((prev) => ({ ...prev, [uniqueId]: !prev[uniqueId] }));
  const toggleMatchExpansion = (uniqueId: string) => setExpandedMatches((prev) => ({ ...prev, [uniqueId]: !prev[uniqueId] }));
  const togglePlayerRank = (uniqueKey: string) => setOpenPlayerRanks((prev) => ({ ...prev, [uniqueKey]: !prev[uniqueKey] }));

  if (!isWeekLoaded) {
    return (
      <div className="w-full max-w-6xl mx-auto mb-8 flex justify-center py-10">
        <span className="text-sky-300 text-sm font-bold animate-pulse tracking-widest">📡 Radar Ayarlanıyor...</span>
      </div>
    );
  }

  const isCardActivelyPlayingNow = (match: any) => {
    const uniqueId = String(getUniqueMatchId(match.week_num, match.id));
    const dbMatch = liveMatchesData[uniqueId] || {};
    const offMatch = officialWeekMatchesMap[uniqueId];
    if (offMatch?.status === 'FINISHED' || offMatch?.status === 'POSTPONED') return false;
    if (['FINISHED', 'FT', 'AET', 'PEN', 'POSTPONED', 'PST'].includes(dbMatch.status)) return false;
    if (['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'WAITING_APPROVAL'].includes(dbMatch.status)) return true;
    const matchTimeMs = getMatchTimeMs(match.date, match.time);
    return matchTimeMs > 0 && now >= matchTimeMs && now < matchTimeMs + 8 * 60 * 60 * 1000;
  };

  const activeMatches = selectedDayMatches.filter((match) => {
    const uniqueId = String(getUniqueMatchId(match.week_num, match.id));
    const dbMatch = liveMatchesData[uniqueId] || {};
    const offMatch = officialWeekMatchesMap[uniqueId];
    return offMatch?.status !== 'FINISHED' && !['FINISHED', 'FT', 'AET', 'PEN'].includes(dbMatch.status);
  });

  const currentlyPlayingMatches = activeMatches.filter((match) => isCardActivelyPlayingNow(match));
  const displayedActiveMatches = onlyLiveCardsFilter ? currentlyPlayingMatches : activeMatches;

  const finishedMatches = selectedDayMatches.filter((match) => {
    const uniqueId = String(getUniqueMatchId(match.week_num, match.id));
    const dbMatch = liveMatchesData[uniqueId] || {};
    const offMatch = officialWeekMatchesMap[uniqueId];
    return offMatch?.status === 'FINISHED' || ['FINISHED', 'FT', 'AET', 'PEN'].includes(dbMatch.status);
  });

  const renderMatchCard = (match: any, isFinishedGroup: boolean = false) => {
    const homeTeamUpper = match.homeTeam?.toUpperCase() || match.home_team?.toUpperCase();
    const awayTeamUpper = match.awayTeam?.toUpperCase() || match.away_team?.toUpperCase();

    const uniqueId = String(getUniqueMatchId(match.week_num, match.id));
    const isEventsOpen = openEventsMap[uniqueId] !== false;
    const isWinnersOpen = openWinnersMap[uniqueId] !== false;
    const isPossibleOpen = openPossibleMap[uniqueId] || false;
    const isEliminatedOpen = openEliminatedMap[uniqueId] || false;
    const isExpanded = expandedMatches[uniqueId] !== undefined ? expandedMatches[uniqueId] : isFinishedGroup;

    const dbMatch = liveMatchesData[uniqueId] || {};
    const offMatch = officialWeekMatchesMap[uniqueId];
    const isGoalFlashing = goalFlashes[uniqueId];

    let safeEvents: any[] = [];
    if (Array.isArray(dbMatch.events)) {
      safeEvents = dbMatch.events;
    } else if (typeof dbMatch.events === 'string') {
      try {
        const parsed = JSON.parse(dbMatch.events);
        safeEvents = Array.isArray(parsed) ? parsed : [];
      } catch {
        safeEvents = [];
      }
    }

    let matchStatus = dbMatch.status || 'NOT_STARTED';
    let homeScore = dbMatch.home_score ?? '-';
    let awayScore = dbMatch.away_score ?? '-';

    const matchTimeMs = getMatchTimeMs(match.date, match.time);
    const liveDurationMs = 8 * 60 * 60 * 1000;
if (!['FINISHED', 'FT', 'AET', 'PEN', 'HT', '1H', '2H', 'ET', 'P', 'WAITING_APPROVAL', 'POSTPONED', 'PST'].includes(matchStatus)) {
      if (matchStatus === 'NOT_STARTED' || matchStatus === 'NS' || matchStatus === 'TBD') {
        if (now >= matchTimeMs && now < matchTimeMs + liveDurationMs) {
          matchStatus = 'LIVE';
        } else if (now >= matchTimeMs + liveDurationMs) {
          matchStatus = 'WAITING_APPROVAL';
        }
      }
    }

    const isFinishedStatus = offMatch?.status === 'FINISHED' || ['FINISHED', 'FT', 'AET', 'PEN'].includes(matchStatus);
    const isLiveStatus = !isFinishedStatus && ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'WAITING_APPROVAL'].includes(matchStatus);
    const isHT = !isFinishedStatus && matchStatus === 'HT';
    const isWaitingApproval = !isFinishedStatus && matchStatus === 'WAITING_APPROVAL';

    if (isFinishedStatus && offMatch?.status === 'FINISHED' && (homeScore === '-' || awayScore === '-')) {
      homeScore = offMatch.home_score ?? '0';
      awayScore = offMatch.away_score ?? '0';
    } else if (isLiveStatus || isFinishedStatus || isHT || isWaitingApproval) {
      if (homeScore === '-') homeScore = '0';
      if (awayScore === '-') awayScore = '0';
    }

    const rawElapsed = dbMatch.elapsed;
    const safeElapsed = typeof rawElapsed === 'object' && rawElapsed !== null ? rawElapsed.elapsed : rawElapsed;

    const systemTimeEvent = safeEvents.find((e: any) => e.type === 'SystemTime');
    const safeExtra = systemTimeEvent ? systemTimeEvent.detail : null;

    let displayMinute = '';
    if (isLiveStatus && !isWaitingApproval) {
      displayMinute = getDynamicElapsed(dbMatch);
    } else if (safeElapsed !== null && safeElapsed !== undefined && safeElapsed !== '') {
      if (safeExtra) displayMinute = `${safeElapsed}+${safeExtra}'`;
      else displayMinute = `${safeElapsed}'`;
    } else {
      displayMinute = `1'`;
    }

    const isChampionsLeague = match.category.toUpperCase().includes('ŞAMPİYONLAR LİGİ');

    const isTffMatch = offMatch?.pool_type
      ? offMatch.pool_type === 'TFF'
      : advancedTffCheck(match.category, homeTeamUpper, awayTeamUpper);

    const themeCategory =
      isTffMatch && !match.category.toUpperCase().includes('TÜRKİYE') && !match.category.toUpperCase().includes('TFF')
        ? `TÜRKİYE ${match.category}`
        : match.category;

    const theme = getEliteTheme(themeCategory, homeTeamUpper, awayTeamUpper);

    const hName = sanitizeStr(homeTeamUpper);
    const aName = sanitizeStr(awayTeamUpper);

    let homeTeamId: number | null = null;
    let awayTeamId: number | null = null;

    safeEvents.forEach((e: any) => {
      if (e.team && e.team.id) {
        const eName = sanitizeStr(e.team.name);
        if (eName === hName || hName.includes(eName) || eName.includes(hName)) {
          homeTeamId = e.team.id;
        } else if (eName === aName || aName.includes(eName) || eName.includes(aName)) {
          awayTeamId = e.team.id;
        }
      }
    });

    if (homeTeamId && !awayTeamId) {
      const otherEvent = safeEvents.find((e: any) => e.team?.id && e.team.id !== homeTeamId);
      if (otherEvent) awayTeamId = otherEvent.team.id;
    } else if (awayTeamId && !homeTeamId) {
      const otherEvent = safeEvents.find((e: any) => e.team?.id && e.team.id !== awayTeamId);
      if (otherEvent) homeTeamId = otherEvent.team.id;
    }

    const homeEvents = safeEvents.filter(
      (e: any) =>
        e.type !== 'SystemTime' &&
        (e.isHome === true || (homeTeamId && e.team?.id === homeTeamId) || (!homeTeamId && sanitizeStr(e.team?.name) === hName))
    );
    const awayEvents = safeEvents.filter(
      (e: any) =>
        e.type !== 'SystemTime' &&
        (e.isHome === false || (awayTeamId && e.team?.id === awayTeamId) || (!awayTeamId && sanitizeStr(e.team?.name) === aName))
    );

    const exactWinners: { id: string; name: string; score: string }[] = [];
    const possibleWinners: { name: string; score: string }[] = [];
    const eliminatedPlayers: { name: string; score: string }[] = [];

    if ((isLiveStatus || isFinishedStatus || isHT || isWaitingApproval) && homeScore !== '-' && awayScore !== '-') {
      const currentH = parseInt(String(homeScore), 10);
      const currentA = parseInt(String(awayScore), 10);

      const playerNameLookup: Record<string, string> = {};
      Object.keys(mergedAccounts).forEach((id) => {
        if (!EXCLUDED_IDS.has(id) && mergedAccounts[id]?.name) {
          playerNameLookup[id] = mergedAccounts[id].name;
        }
      });
      officialSummaryRows.forEach((r) => {
        const uid = String(r.user_id || '').trim();
        if (uid && !EXCLUDED_IDS.has(uid) && !playerNameLookup[uid] && r.oyuncu_adi) {
          playerNameLookup[uid] = r.oyuncu_adi;
        }
      });

      const seenExactIds = new Set<string>();

      Object.keys(playerNameLookup).forEach((id) => {
        const predStr = predictionsData[`${id}-${match.week_num}-${match.id}`];
        if (!predStr || predStr === '-' || predStr === 'PAS') return;
        const name = playerNameLookup[id];
        if (!name) return;

        const parts = predStr.split(/[-:]/);
        if (parts.length < 2) return;
        const pH = parseInt(parts[0], 10);
        const pA = parseInt(parts[1], 10);
        if (isNaN(pH) || isNaN(pA)) return;

        if (pH === currentH && pA === currentA) {
          seenExactIds.add(id);
          exactWinners.push({ id, name, score: `${currentH}-${currentA}` });
        } else if (pH >= currentH && pA >= currentA && !isFinishedStatus) {
          possibleWinners.push({ name, score: predStr });
        } else {
          eliminatedPlayers.push({ name, score: predStr });
        }
      });

      if (isFinishedStatus && offMatch?.status === 'FINISHED' && Array.isArray(offMatch.winner_ids)) {
        offMatch.winner_ids.forEach((wIdRaw: any) => {
          const wId = String(wIdRaw || '').trim();
          if (!wId || EXCLUDED_IDS.has(wId) || seenExactIds.has(wId)) return;
          const wName = playerNameLookup[wId] || wId;
          seenExactIds.add(wId);
          exactWinners.push({ id: wId, name: wName, score: `${currentH}-${currentA}` });
        });
      }

      exactWinners.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
      possibleWinners.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
      eliminatedPlayers.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    }

    const displayPoints =
      isFinishedStatus && offMatch?.status === 'FINISHED' && Number(offMatch.points_awarded) > 0
        ? Number(offMatch.points_awarded)
        : calcMatchPts(exactWinners.length);

    let countdownText = '';
    if (now < matchTimeMs && (matchStatus === 'NOT_STARTED' || matchStatus === 'NS' || matchStatus === 'TBD')) {
      const distance = matchTimeMs - now;
      if (distance > 0) {
        const totalHours = Math.floor(distance / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        countdownText = `${totalHours.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }
    }

    return (
      <div
        key={uniqueId}
        className={`w-full max-w-2xl mx-auto border rounded-xl overflow-hidden transition-all duration-300 flex flex-col relative ${
          isGoalFlashing
            ? 'police-siren'
            : isExpanded
            ? theme.containerBorder + ' ' + theme.containerShadow + ' ' + theme.containerBg
            : theme.containerBorder + ' shadow-md hover:shadow-[0_0_15px_currentColor] ' + theme.badgeText + ' ' + (theme.bgImg ? '' : 'bg-slate-950')
        }`}
      >
        {theme.bgImg && (
          <>
            <div
              className="absolute inset-0 z-0 opacity-100"
              style={{ backgroundImage: theme.bgImg, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
            />
            <div
              className={`absolute inset-0 z-0 transition-colors duration-300 ${
                isExpanded || isGoalFlashing ? 'bg-slate-900/60' : 'bg-slate-950/70 hover:bg-slate-900/60'
              }`}
            />
          </>
        )}

        {!isExpanded && (
          <div
            onClick={() => toggleMatchExpansion(uniqueId)}
            className="cursor-pointer px-2 sm:px-4 py-2 sm:py-2.5 flex flex-col border-b border-black/50 relative z-20 group transition-all duration-300"
          >
            <div className="w-full text-center mb-1">
              <span className="text-[8px] sm:text-[9px] font-black tracking-widest uppercase text-sky-200/80 bg-black/50 px-2 py-0.5 rounded-full border border-slate-700/60">
                {match.weekLabel}
              </span>
            </div>

            <div className="flex items-center justify-between w-full">
              <div className="flex-1 flex items-center justify-end overflow-hidden pr-1.5 sm:pr-3">
                <span className="text-[9px] sm:text-xs text-slate-200 font-bold uppercase tracking-wide truncate group-hover:text-white transition-colors text-right">
                  {homeTeamUpper}
                </span>
              </div>
              <div className="flex items-center justify-center shrink-0">
                <img src={theme.homeLogo} alt={homeTeamUpper} className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-md group-hover:scale-110 transition-transform z-10" />
                <div className="flex flex-col items-center justify-center mx-1 sm:mx-1.5 min-w-[40px] sm:min-w-[50px]">
                  <div className="mb-0.5 flex items-center justify-center">
                    {isWaitingApproval ? (
                      <span className="text-[9px] sm:text-[10px] font-black text-sky-400 drop-shadow-md tracking-wider animate-pulse">ONAY BEKLİYOR</span>
                    ) : isHT ? (
                      <span className="text-[10px] sm:text-[11px] font-black text-cyan-300 tracking-wider drop-shadow-md">İLK YARI</span>
                    ) : isLiveStatus ? (
                      <span className="text-[10px] sm:text-[11px] font-black text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)] animate-pulse tracking-wider">
                        {displayMinute}
                      </span>
                    ) : isFinishedStatus ? (
                      <span className="text-[8px] sm:text-[9px] font-black text-slate-400 tracking-wider">MS</span>
                    ) : (
                      <span className="text-[9px] sm:text-[10px] font-bold text-sky-300 tracking-wider">{match.time}</span>
                    )}
                  </div>
                  <div
                    className={`flex items-center justify-center px-1.5 py-0.5 sm:py-1 rounded border shadow-inner backdrop-blur-md transition-all w-full ${
                      isGoalFlashing
                        ? 'bg-blue-900/80 border-rose-500 shadow-[0_0_25px_rgba(225,29,72,0.9)] scale-110'
                        : isLiveStatus || isHT || isWaitingApproval
                        ? 'bg-emerald-950/60 border-emerald-500/40'
                        : 'bg-[#080d1a]/80 border-slate-700/60'
                    }`}
                  >
                    <span className="font-black text-[12px] sm:text-[14px] tracking-widest leading-none text-white">
                      {!isLiveStatus && !isFinishedStatus && !isHT && !isWaitingApproval ? 'v' : `${homeScore}-${awayScore}`}
                    </span>
                  </div>
                </div>
                <img src={theme.awayLogo} alt={awayTeamUpper} className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-md group-hover:scale-110 transition-transform z-10" />
              </div>
              <div className="flex-1 flex items-center justify-start overflow-hidden pl-1.5 sm:pl-3">
                <span className="text-[9px] sm:text-xs text-slate-200 font-bold uppercase tracking-wide truncate group-hover:text-white transition-colors text-left">
                  {awayTeamUpper}
                </span>
              </div>
            </div>
            <div className="absolute right-1 sm:right-2 bottom-2 opacity-30 text-[8px] text-white group-hover:opacity-100 transition-opacity">▼</div>
          </div>
        )}

        {isExpanded && (
          <div className="relative flex-grow overflow-hidden animate-fadeIn z-10">
            <button
              onClick={() => toggleMatchExpansion(uniqueId)}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 z-50 bg-slate-950/50 text-slate-300 hover:text-white border border-slate-700/50 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shadow-lg backdrop-blur-md transition-colors"
              title="Küçült"
            >
              ✕
            </button>
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-full text-center pt-3 pb-1">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 tracking-widest uppercase bg-slate-950/60 px-3 py-1 rounded-full shadow-inner">
                  {match.weekLabel} • {match.date}
                </span>
              </div>
              <div className="w-full text-center px-2 mt-2 relative z-30">
                <span
                  className={`inline-block w-[95%] sm:w-[85%] mx-auto px-3 py-1.5 rounded-lg border shadow-[0_0_15px_currentColor] text-[9px] sm:text-[10px] font-black uppercase tracking-widest leading-snug whitespace-nowrap ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
                >
                  {match.category}
                </span>
              </div>

              <div className="flex items-center justify-between px-2 sm:px-6 pt-3 pb-4">
                <div className="flex flex-col items-center justify-center flex-1 gap-3">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20">
                    <img src={theme.homeLogo} alt={homeTeamUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]" />
                  </div>
                  <span className="text-white font-extrabold text-[9px] sm:text-[11px] text-center uppercase tracking-wide drop-shadow-md">{homeTeamUpper}</span>
                </div>

                <div className="flex flex-col items-center justify-center gap-2 mx-1 sm:mx-4 w-36 sm:w-44 z-30 relative">
                  {theme.leagueLogo && (
                    <div className="w-10 h-10 sm:w-14 sm:h-14 mb-1 flex items-center justify-center z-40">
                      <img src={theme.leagueLogo} alt="League Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                  {!isLiveStatus && !isFinishedStatus && !isHT && !isWaitingApproval && (
                    <div className="bg-slate-900/80 border border-blue-500/40 px-3 py-0.5 rounded-full shadow-sm">
                      <span className="text-sky-300 text-[10px] sm:text-xs font-bold tracking-widest">⏱ {match.time}</span>
                    </div>
                  )}
                  {isWaitingApproval && (
                    <div className="flex flex-col items-center justify-center mb-1.5 z-40 relative animate-pulse">
                      <span className="text-sky-300 font-black text-[10px] sm:text-xs border border-sky-500/50 bg-blue-950/80 px-3 py-1 rounded-full tracking-widest">
                        ONAY BEKLİYOR
                      </span>
                    </div>
                  )}
                  {isHT && (
                    <div className="flex flex-col items-center justify-center mb-1.5 z-40 relative">
                      <span className="text-cyan-300 font-black text-2xl sm:text-3xl leading-none">İLK YARI</span>
                    </div>
                  )}
                  {isLiveStatus && !isWaitingApproval && (
                    <div className="flex flex-col items-center justify-center mb-1.5 z-40 relative animate-pulse">
                      <span className="text-emerald-400 font-black text-3xl sm:text-4xl leading-none">{displayMinute}</span>
                      <span className="text-emerald-300 text-[9px] sm:text-[10px] font-black tracking-widest mt-1 bg-emerald-950/80 px-3 py-0.5 rounded-full border border-emerald-500">
                        CANLI
                      </span>
                    </div>
                  )}
                  {isFinishedStatus && (
                    <div className="bg-slate-900/80 border border-slate-600/80 px-3 py-0.5 rounded-full">
                      <span className="text-slate-300 text-[10px] font-black tracking-widest">MS (BİTTİ)</span>
                    </div>
                  )}
                  <div
                    className={`w-full bg-[#080d1a]/80 border ${
                      isGoalFlashing ? 'border-rose-500 shadow-[0_0_40px_rgba(225,29,72,0.9)]' : theme.scoreBorder
                    } py-2 sm:py-3 rounded-xl flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-md`}
                  >
                    <span className="text-xl sm:text-3xl font-black text-white">{homeScore}</span>
                    <span className={`text-base sm:text-xl font-bold ${isChampionsLeague ? 'text-white/50' : 'text-blue-400/50'}`}>:</span>
                    <span className="text-xl sm:text-3xl font-black text-white">{awayScore}</span>
                  </div>
                  {!isLiveStatus && !isFinishedStatus && !isHT && !isWaitingApproval && countdownText && (
                    <div className="w-full bg-[#0c2a3b]/50 border border-[#164e63]/50 py-1 rounded-lg text-center mt-1">
                      <span className="text-[#38bdf8] text-[9px] sm:text-[10px] font-mono font-bold tracking-widest">{countdownText}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center flex-1 gap-3">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20">
                    <img src={theme.awayLogo} alt={awayTeamUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]" />
                  </div>
                  <span className="text-white font-extrabold text-[9px] sm:text-[11px] text-center uppercase tracking-wide drop-shadow-md">{awayTeamUpper}</span>
                </div>
              </div>

              {safeEvents.length > 0 && (
                <div className="w-full mb-3 flex flex-col gap-2 px-1.5 sm:px-6 relative z-30">
                  <button
                    onClick={() => toggleEvents(uniqueId)}
                    className="w-full flex justify-between items-center px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/50 rounded-lg"
                  >
                    <span className="text-slate-300 font-bold text-[9px] sm:text-[10px] tracking-widest">📊 MAÇ OLAYLARI</span>
                    <span className="text-slate-400 text-[10px]">{isEventsOpen ? '▲' : '▼'}</span>
                  </button>
                  {isEventsOpen && (
                    <div className="flex justify-between w-full text-xs text-slate-300 bg-slate-900/40 rounded-lg p-1.5 sm:p-3 border border-slate-800/80">
                      <div className="flex-1 flex flex-col gap-1 items-start pr-1 sm:pr-3 border-r border-slate-700/50 overflow-hidden">
                        {homeEvents.map((e: any, i: number) => {
                          let icon = '';
                          let text = '';
                          if (e.type === 'Goal') {
                            icon = e.detail === 'Penalty' ? '🎯' : e.detail === 'Own Goal' ? '🤦‍♂️' : '⚽';
                            text = String(e.player?.name || 'Oyuncu');
                          } else if (e.type === 'Card') {
                            icon = e.detail === 'Yellow Card' ? '🟨' : '🟥';
                            text = String(e.player?.name || 'Oyuncu');
                          } else if (e.type === 'subst') {
                            icon = '🔄';
                            text = `${String(e.assist?.name || 'Giren')} / ${String(e.player?.name || 'Çıkan')}`;
                          } else return null;
                          return (
                            <span key={`h-e-${i}`} className="flex items-center gap-1 bg-slate-800/40 px-1.5 py-0.5 rounded w-full">
                              <span className="text-[9px] sm:text-xs shrink-0">{icon}</span>
                              <span className="font-medium text-slate-200 flex-1 text-left text-[8.5px] sm:text-[10px] break-words">{text}</span>
                              <span className="text-emerald-400 font-bold text-[8px] sm:text-[9px] shrink-0">({String(e.time?.elapsed || 0)}&apos;)</span>
                            </span>
                          );
                        })}
                      </div>
                      <div className="flex-1 flex flex-col gap-1 items-end pl-1 sm:pl-3 overflow-hidden">
                        {awayEvents.map((e: any, i: number) => {
                          let icon = '';
                          let text = '';
                          if (e.type === 'Goal') {
                            icon = e.detail === 'Penalty' ? '🎯' : e.detail === 'Own Goal' ? '🤦‍♂️' : '⚽';
                            text = String(e.player?.name || 'Oyuncu');
                          } else if (e.type === 'Card') {
                            icon = e.detail === 'Yellow Card' ? '🟨' : '🟥';
                            text = String(e.player?.name || 'Oyuncu');
                          } else if (e.type === 'subst') {
                            icon = '🔄';
                            text = `${String(e.assist?.name || 'Giren')} / ${String(e.player?.name || 'Çıkan')}`;
                          } else return null;
                          return (
                            <span key={`a-e-${i}`} className="flex items-center gap-1 bg-slate-800/40 px-1.5 py-0.5 rounded w-full justify-end">
                              <span className="text-emerald-400 font-bold text-[8px] sm:text-[9px] shrink-0">({String(e.time?.elapsed || 0)}&apos;)</span>
                              <span className="font-medium text-slate-200 flex-1 text-right text-[8.5px] sm:text-[10px] break-words">{text}</span>
                              <span className="text-[9px] sm:text-xs shrink-0">{icon}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className={`${theme.bottomBar} border-t px-3 py-2.5 w-full backdrop-blur-md z-10 relative mt-auto`}>
                <div className="flex justify-between items-center w-full">
                  <div className="text-left flex-1">
                    {!isLiveStatus && !isFinishedStatus && !isHT && !isWaitingApproval ? (
                      <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 italic">Maç saatini bekliyor...</span>
                    ) : exactWinners.length === 0 ? (
                      !isFinishedStatus && possibleWinners.length > 0 ? (
                        <span className="text-[9px] sm:text-[10px] font-medium text-sky-300 italic">
                          Tam isabet yok, {possibleWinners.length} kişi pusuda!
                        </span>
                      ) : (
                        <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 italic">Skoru bilen kalmadı.</span>
                      )
                    ) : (
                      <span className="text-[9px] sm:text-[10px] font-medium text-emerald-300">
                        <strong className="text-emerald-400">{exactWinners.length} kişi</strong> tam isabetli
                      </span>
                    )}
                  </div>
                  <div className="flex-0 text-center px-1">
                    <span className={`text-[8px] font-black tracking-widest whitespace-nowrap px-2 py-0.5 rounded block border ${theme.tagText} ${theme.tagBg} ${theme.tagBorder}`}>
                      {isTffMatch ? 'TFF MAÇI' : 'DFO MAÇI'}
                    </span>
                  </div>
                  <div className="text-right flex-1">
                    {(exactWinners.length > 0 || possibleWinners.length > 0 || eliminatedPlayers.length > 0) &&
                      (isLiveStatus || isFinishedStatus || isHT || isWaitingApproval) && (
                        <button
                          onClick={() => toggleWinners(uniqueId)}
                          className="text-sky-400 hover:text-sky-300 font-medium text-[9px] sm:text-[10px] whitespace-nowrap"
                        >
                          {isWinnersOpen ? 'Radarı Gizle ▲' : 'Tüm Tahmin Radarı →'}
                        </button>
                      )}
                  </div>
                </div>

                {isWinnersOpen && (isLiveStatus || isFinishedStatus || isHT || isWaitingApproval) && (
                  <div className="w-full mt-2 flex flex-col gap-2 pb-1">
                    {exactWinners.length > 0 && (
                      <div className="w-full bg-slate-950/80 rounded-xl border border-emerald-500/50 overflow-hidden mt-1 mb-2">
                        <div className="bg-emerald-950/80 p-2 border-b border-emerald-500/50 flex justify-center items-center">
                          <span className="bg-emerald-500 text-slate-950 font-black px-4 py-1 rounded-full text-[10px] sm:text-xs border border-emerald-300 tracking-widest">
                            +{displayPoints} PUAN YAZILIYOR
                          </span>
                        </div>
                        <div className="block p-2 max-h-[350px] overflow-y-auto bg-slate-900/50">
                          {exactWinners.map((winner, idx) => {
                            const uniquePlayerKey = `${uniqueId}-${winner.id}`;
                            const isRankOpen = openPlayerRanks[uniquePlayerKey] || false;
                            const tffData = globalLiveRanks.TFF.find((x) => x.id === winner.id);
                            const dfoData = globalLiveRanks.DFO.find((x) => x.id === winner.id);
                            const masterData = globalLiveRanks.MASTER.find((x) => x.id === winner.id);
                            const skorData = globalLiveRanks.SKOR.find((x) => x.id === winner.id);
                            return (
                              <div key={idx} className="mb-2 bg-slate-950 border border-slate-700/80 rounded-lg overflow-hidden">
                                <button
                                  onClick={() => togglePlayerRank(uniquePlayerKey)}
                                  className="w-full flex items-center justify-center py-2.5 px-4 bg-slate-950 hover:bg-slate-900/50"
                                >
                                  <span className="text-slate-100 font-black text-xs sm:text-sm uppercase tracking-widest flex items-center gap-2">
                                    {renderLiveNameWithFlag(formatNameWithCups(winner.name))} <span className="text-slate-500 text-[10px]">{isRankOpen ? '▲' : '▼'}</span>
                                  </span>
                                </button>
                                {isRankOpen && (
                                  <div className="flex flex-wrap justify-center gap-1.5 w-full pb-2.5 pt-1 px-2 bg-slate-900/40 border-t border-slate-800/50">
                                    <span className="border px-2 py-0.5 rounded text-[9px] sm:text-[10px] bg-blue-950/60 text-sky-300 border-sky-500/40">
                                      MASTER #{masterData?.rank || '-'} / {masterData?.pts || 0} P
                                    </span>
                                    {isTffMatch ? (
                                      <span className="border px-2 py-0.5 rounded text-[9px] sm:text-[10px] bg-indigo-950/60 text-indigo-300 border-indigo-500/40">
                                        TFF #{tffData?.rank || '-'} / {tffData?.pts || 0} P
                                      </span>
                                    ) : (
                                      <span className="border px-2 py-0.5 rounded text-[9px] sm:text-[10px] bg-cyan-950/60 text-cyan-300 border-cyan-500/40">
                                        DFO #{dfoData?.rank || '-'} / {dfoData?.pts || 0} P
                                      </span>
                                    )}
                                    <span className="border px-2 py-0.5 rounded text-[9px] sm:text-[10px] bg-emerald-950/60 text-emerald-300 border-emerald-500/40">
                                      SKOR #{skorData?.rank || '-'} / {skorData?.pts || 0} İSABET
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {!isFinishedStatus && possibleWinners.length > 0 && (
                      <div className="w-full bg-blue-950/30 rounded-lg border border-blue-800/50 overflow-hidden">
                        <button
                          onClick={() => togglePossible(uniqueId)}
                          className="w-full flex justify-between items-center p-2.5 bg-blue-900/30 hover:bg-blue-800/40"
                        >
                          <span className="text-sky-300 font-bold text-[9px] sm:text-[10px]">⏳ ŞANSI DEVAM EDENLER ({possibleWinners.length})</span>
                          <span className="text-sky-300 text-[10px]">{isPossibleOpen ? '▲' : '▼'}</span>
            </button>
                        {isPossibleOpen && (
                          <div className="p-2.5 flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto border-t border-blue-900/50">
                            {possibleWinners.map((winner, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 border px-1.5 py-0.5 rounded text-[8.5px] sm:text-[9.5px] bg-blue-900/30 text-slate-200 border-blue-700/50 font-bold uppercase"
                              >
                                {renderLiveNameWithFlag(winner.name, undefined, 14)}
                                <strong className="text-cyan-300 shrink-0">[{winner.score}]</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {eliminatedPlayers.length > 0 && (
                      <div className="w-full bg-red-950/20 rounded-lg border border-red-900/30 overflow-hidden">
                        <button
                          onClick={() => toggleEliminated(uniqueId)}
                          className="w-full flex justify-between items-center p-2.5 bg-red-900/20 hover:bg-red-800/30"
                        >
                          <span className="text-red-400 font-bold text-[9px] sm:text-[10px]">❌ ŞANSI KALMAYANLAR ({eliminatedPlayers.length})</span>
                          <span className="text-red-400 text-[10px]">{isEliminatedOpen ? '▲' : '▼'}</span>
                        </button>
                        {isEliminatedOpen && (
                          <div className="p-2.5 flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto border-t border-red-900/30">
                            {eliminatedPlayers.map((winner, idx) => {
                              const elimLogo = getClubLogoUrl(LIVE_FAV_TEAMS[normLiveKey(winner.name)] || '');
                              return (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 border px-1.5 py-0.5 rounded text-[8.5px] sm:text-[9.5px] bg-red-950/40 text-slate-400 border-red-900/50 opacity-75 uppercase"
                                >
                                  {elimLogo && (
                                    <img
                                      src={elimLogo}
                                      alt=""
                                      width={13}
                                      height={13}
                                      style={{ width: '13px', height: '13px', minWidth: '13px', maxWidth: '13px' }}
                                      className="object-contain shrink-0"
                                      loading="lazy"
                                    />
                                  )}
                                  <span className="line-through">{formatNameWithCups(winner.name)}</span>
                                  <strong className="text-red-500 shrink-0">[{winner.score}]</strong>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto mb-8 px-2 sm:px-4 flex flex-col gap-2">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes siren { 0% { box-shadow: 0 0 15px #2563eb; border-color: #3b82f6; } 50% { box-shadow: 0 0 15px #e11d48; border-color: #f43f5e; } 100% { box-shadow: 0 0 15px #2563eb; border-color: #3b82f6; } }
        .police-siren { animation: siren 0.4s ease-in-out infinite; z-index: 50; transform: scale(1.02); }
      `
        }}
      />

      <div className="w-full flex flex-wrap items-center justify-center sm:justify-end gap-2 pt-3">
        {isMankoman && (
          <button
            onClick={handleLiveUltraFetch}
            disabled={isManualFetching}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-[10px] sm:text-xs font-black tracking-wider shadow-md border bg-gradient-to-r from-blue-700 to-indigo-700 text-white border-sky-400/70 disabled:opacity-50"
          >
            <span className={isManualFetching ? 'animate-spin' : ''}>📡</span>
            <span>{isManualFetching ? 'ÇEKİLİYOR...' : `ULTRA ATEŞLE (KOTA: ${apiLimitRemaining})`}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            const nextMode = !isLiveFocusMode;
            setIsLiveFocusMode(nextMode);
            setOnlyLiveCardsFilter(nextMode);
            if (nextMode) {
              setIsLiveStandingsOpen(false);
              setIsWeekLiveOpen(true);
              setIsLiveAccordionOpen(true);
            }
          }}
          className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-[10px] sm:text-xs font-black tracking-wider shadow-md border transition-all ${
            isLiveFocusMode
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'bg-[#071126] text-emerald-300 border-emerald-500/50 hover:border-emerald-400 hover:text-white'
          }`}
        >
          <span>⚡</span>
          <span>{isLiveFocusMode ? 'CANLI MODU: AKTİF' : 'CANLIYA GÖRE AYARLA'}</span>
        </button>

        <button
          onClick={toggleSound}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] sm:text-xs font-black tracking-widest shadow-md border ${
            soundEnabled ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60' : 'bg-[#071126] text-slate-300 border-blue-900/60'
          }`}
        >
          {soundEnabled ? '🔊 CANLI GOL SESİ: AÇIK' : '🔇 GOL SESİNİ AÇ'}
        </button>
      </div>

      {availableDateTabs.length > 0 && (
        <div className="bg-[#071126]/90 border border-blue-500/30 rounded-2xl p-2 sm:p-2.5 shadow-lg">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {availableDateTabs.map((dTab) => {
              const isSelected = dTab.dateStr === effectiveMatchDate;
              const hasLive = dTab.liveCount > 0;
              return (
                <button
                  key={dTab.dateStr}
                  onClick={() => {
                    setSelectedMatchDate(dTab.dateStr);
                    setIsLiveAccordionOpen(true);
                  }}
                  className={`shrink-0 flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider border ${
                    isSelected
                      ? hasLive
                        ? 'bg-emerald-600 text-white border-emerald-300'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-sky-300'
                      : hasLive
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60'
                      : 'bg-[#040917] text-slate-300 border-blue-900/60 hover:text-white'
                  }`}
                >
                  <span>{dTab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${isSelected ? 'bg-black/35 text-white' : 'bg-blue-950/80 text-sky-300'}`}>
                    {dTab.totalCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedDayMatches.length === 0 ? (
        <div className="w-full text-center py-10 bg-[#071126]/70 border border-blue-900/40 rounded-2xl">
          <p className="text-slate-300 text-sm font-bold tracking-widest uppercase">{selectedDayLabel} İÇİN PLANLANAN MAÇ BULUNMUYOR</p>
        </div>
      ) : (
        <>
          {finishedMatches.length > 0 && (
            <div className="bg-[#071126]/80 rounded-2xl border border-blue-900/50 shadow-xl overflow-hidden">
              <button
                onClick={() => setIsFinishedAccordionOpen(!isFinishedAccordionOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#040a18]/80 border-b border-blue-900/40"
              >
                <div className="flex-1" />
                <h2 className="text-[10px] sm:text-xs font-black text-sky-200 uppercase tracking-widest text-center">
                  📅 {isSelectedDayToday ? 'GÜNÜN BİTEN MAÇLARI' : `${selectedDayLabel} BİTEN MAÇLAR`} ({finishedMatches.length})
                </h2>
                <div className="flex-1 flex justify-end text-sky-300 text-xs">{isFinishedAccordionOpen ? '▲' : '▼'}</div>
              </button>
              {isFinishedAccordionOpen && (
                <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-start bg-[#050b18]/60">
                  {finishedMatches.map((match) => renderMatchCard(match, true))}
                </div>
              )}
            </div>
          )}

          {activeMatches.length > 0 && (
            <div className="bg-[#071126]/90 rounded-2xl border border-emerald-500/40 shadow-2xl overflow-hidden">
              <div className="w-full flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-3 bg-emerald-950/30 border-b border-emerald-500/30">
                <button
                  type="button"
                  onClick={() => setIsLiveAccordionOpen(!isLiveAccordionOpen)}
                  className="flex items-center gap-2 text-left"
                >
                  <h2 className="text-xs sm:text-sm font-black text-emerald-400 uppercase tracking-widest">
                    {onlyLiveCardsFilter
                      ? `🔴 SADECE CANLI OYNANANLAR (${currentlyPlayingMatches.length})`
                      : isSelectedDayToday
                      ? `GÜNÜN CANLI MAÇLARI (${activeMatches.length})`
                      : `${selectedDayLabel} MAÇLARI (${activeMatches.length})`}
                  </h2>
                  <span className="text-emerald-300 text-xs">{isLiveAccordionOpen ? '▲' : '▼'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOnlyLiveCardsFilter((prev) => {
                      const next = !prev;
                      if (!next) setIsLiveFocusMode(false);
                      return next;
                    });
                    setIsLiveAccordionOpen(true);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider border ${
                    onlyLiveCardsFilter
                      ? 'bg-rose-600 text-white border-rose-300'
                      : 'bg-[#040917] text-emerald-300 border-emerald-500/50 hover:text-white'
                  }`}
                >
                  {onlyLiveCardsFilter
                    ? `TÜMÜNÜ GÖSTER (${activeMatches.length})`
                    : `🔴 SADECE CANLILARI GÖSTER (${currentlyPlayingMatches.length})`}
                </button>
              </div>

              {isLiveAccordionOpen && (
                <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-start bg-[#050b18]/60">
                  {displayedActiveMatches.length === 0 ? (
                    <div className="col-span-full py-6 text-center text-xs font-black text-slate-300 uppercase">
                      ŞU AN OYNANAN AKTİF CANLI MAÇ YOK
                    </div>
                  ) : (
                    displayedActiveMatches.map((match) => renderMatchCard(match, false))
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* CANLI HAFTALIK BÜLTEN & GENEL PUAN DURUMU PANELİ */}
              <div className="sticky top-16 sm:top-20 z-30 bg-[#071126]/95 backdrop-blur-md rounded-t-2xl border-b border-slate-800 px-2 pt-2.5 pb-2 sm:px-6 sm:pt-3.5 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800 px-1">
            <button onClick={() => setIsLiveStandingsOpen(!isLiveStandingsOpen)} className="flex items-center gap-2 text-left">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`absolute inline-flex h-full w-full rounded-full ${totalActiveLiveMatches > 0 ? 'animate-ping bg-emerald-400 opacity-75' : ''}`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${totalActiveLiveMatches > 0 ? 'bg-emerald-500' : 'bg-sky-400'}`} />
              </span>
              <h2 className="text-xs sm:text-sm font-black text-sky-200 uppercase tracking-wider">
                CANLI GENEL PUAN DURUMU
              </h2>
              <span className="text-slate-400 text-xs">{isLiveStandingsOpen ? '▲' : '▼'}</span>
            </button>

            {isLiveStandingsOpen && (
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {activeBulletinWeeks.map((w) => {
                  const isSelectedWeekTab = liveTableTab === 'WEEK_LIVE' && effectiveBulletinWeek === w;
                  const wLiveCount = weeklyLiveTables[w]?.liveCount || 0;
                  return (
                    <button
                      key={`week-live-${w}`}
                      onClick={() => {
                        setLiveTableTab('WEEK_LIVE');
                        setSelectedBulletinWeek(w);
                      }}
                      className={`px-2 sm:px-2.5 py-1 rounded-lg text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider transition-colors border ${
                        isSelectedWeekTab
                          ? 'bg-emerald-700 text-white border-emerald-400/80'
                          : wLiveCount > 0
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70 hover:bg-emerald-900/60'
                          : 'bg-[#040917] text-emerald-300 border-slate-800 hover:border-emerald-600 hover:text-white'
                      }`}
                    >
                      {`CANLI ${w}. HAFTA${wLiveCount > 0 ? ` (${wLiveCount})` : ''}`}
                    </button>
                  );
                })}

                {(['MASTER', 'DFO', 'TFF', 'SKOR'] as const).map((tab) => {
                  const isTabActive = liveTableTab === tab;
                  let btnCls = 'bg-[#040917] text-slate-300 border-slate-800 hover:border-slate-600 hover:text-white';
                  if (isTabActive) {
                    if (tab === 'TFF') btnCls = 'bg-rose-700 text-white border-rose-400/80';
                    else if (tab === 'DFO') btnCls = 'bg-blue-700 text-white border-sky-400/80';
                    else if (tab === 'SKOR') btnCls = 'bg-orange-600 text-white border-orange-300/80';
                    else btnCls = 'bg-sky-700 text-white border-sky-300/80';
                  } else if (tab === 'TFF') {
                    btnCls = 'bg-[#040917] text-rose-400 border-slate-800 hover:border-rose-700';
                  } else if (tab === 'DFO') {
                    btnCls = 'bg-[#040917] text-sky-400 border-slate-800 hover:border-sky-700';
                  } else if (tab === 'SKOR') {
                    btnCls = 'bg-[#040917] text-orange-400 border-slate-800 hover:border-orange-700';
                  }
                  return (
                    <button
                      key={tab}
                      onClick={() => {
                        setLiveTableTab(tab);
                        if (tab === 'MASTER') setMasterSubTab('DETAYLI');
                        if (tab === 'SKOR') setSkorSubTab('DUZ');
                      }}
                      className={`px-2.5 sm:px-3 py-1 rounded-lg text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider transition-colors border ${btnCls}`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {isLiveStandingsOpen && liveTableTab === 'WEEK_LIVE' && currentWeekBucket && (
            <div className="pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-slate-800 px-1">
                <div className="text-[10px] sm:text-xs font-bold text-sky-200/90">
                  <span className="text-emerald-400 font-black">{effectiveBulletinWeek}. HAFTA BÜLTENİ:</span>{' '}
                  <span>
                    {currentWeekBucket.finishedCount} / {currentWeekBucket.totalMatches} maç tamamlandı
                  </span>
                  {currentWeekBucket.liveCount > 0 && (
                    <span className="ml-1.5 text-emerald-400 font-black">• {currentWeekBucket.liveCount} maç canlı</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  {(['MASTER', 'DFO', 'TFF', 'SKOR'] as const).map((wTab) => (
                    <button
                      key={`wsub-${wTab}`}
                      onClick={() => {
                        setWeekSubTab(wTab);
                        if (wTab === 'MASTER') setWeekMasterMode('DETAYLI');
                        if (wTab === 'SKOR') setWeekSkorMode('DUZ');
                      }}
                      className={`px-2 sm:px-2.5 py-0.5 rounded text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider border transition-colors ${
                        weekSubTab === wTab
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-400/80'
                          : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {wTab}
                    </button>
                  ))}
                </div>
              </div>

              {weekSubTab === 'MASTER' && (
                <div className="flex items-center justify-center gap-1.5 pt-1.5">
                  <button
                    onClick={() => setWeekMasterMode('DUZ')}
                    className={`px-2.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${
                      weekMasterMode === 'DUZ'
                        ? 'bg-sky-900/50 text-sky-200 border-sky-400/70'
                        : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    MASTER PUAN
                  </button>
                  <button
                    onClick={() => setWeekMasterMode('DETAYLI')}
                    className={`px-2.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${
                      weekMasterMode === 'DETAYLI'
                        ? 'bg-sky-900/50 text-white border-sky-300/70'
                        : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    DETAYLI MASTER
                  </button>
                </div>
              )}

              {weekSubTab === 'SKOR' && (
                <div className="flex flex-wrap items-center justify-center gap-1 pt-1.5">
                  {([
                    { key: 'DUZ', label: 'MASTER SKOR' },
                    { key: 'DETAYLI', label: 'DETAYLI' },
                    { key: 'DFO', label: 'DFO SKOR' },
                    { key: 'TFF', label: 'TFF SKOR' }
                  ] as const).map((sm) => (
                    <button
                      key={`wskor-${sm.key}`}
                      onClick={() => setWeekSkorMode(sm.key)}
                      className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${
                        weekSkorMode === sm.key
                          ? 'bg-orange-950/60 text-orange-300 border-orange-400/70'
                          : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {sm.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {isLiveStandingsOpen && liveTableTab !== 'WEEK_LIVE' && (
            <>
              {liveTableTab === 'MASTER' && (
                <div className="flex items-center justify-center gap-1.5 pt-2">
                  <button
                    onClick={() => setMasterSubTab('DUZ')}
                    className={`px-2.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${
                      masterSubTab === 'DUZ'
                        ? 'bg-sky-900/50 text-sky-200 border-sky-400/70'
                        : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    MASTER PUAN
                  </button>
                  <button
                    onClick={() => setMasterSubTab('DETAYLI')}
                    className={`px-2.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${
                      masterSubTab === 'DETAYLI'
                        ? 'bg-sky-900/50 text-white border-sky-300/70'
                        : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    DETAYLI MASTER
                  </button>
                </div>
              )}

              {liveTableTab === 'SKOR' && (
                <div className="flex flex-wrap items-center justify-center gap-1 pt-2">
                  {([
                    { key: 'DUZ', label: 'MASTER SKOR' },
                    { key: 'DETAYLI', label: 'DETAYLI' },
                    { key: 'DFO', label: 'DFO SKOR' },
                    { key: 'TFF', label: 'TFF SKOR' }
                  ] as const).map((st) => (
                    <button
                      key={st.key}
                      onClick={() => setSkorSubTab(st.key)}
                      className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${
                        skorSubTab === st.key
                          ? 'bg-orange-950/60 text-orange-300 border-orange-400/70'
                          : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* İKİ MÜSTAKİL PUAN BLOĞU SARMALAYICISI (SIKI ARALIK: gap-2) */}
      <div className="flex flex-col gap-2">
        {/* MÜSTAKİL BLOK 2 (ALTTA - AKTİF HAFTA BÜLTENİ & CANLI PUAN ALANLAR) */}
        {currentWeekBucket && (
          <div className="order-2 bg-gradient-to-b from-[#0a1838] via-[#071126] to-[#050b18] border border-emerald-500/40 rounded-2xl shadow-xl">
            <div
              className={`${
                isWeekLiveOpen
                  ? 'sticky top-16 sm:top-20 z-30 rounded-t-2xl border-b border-slate-800'
                  : 'rounded-2xl'
              } bg-[#071126]/95 backdrop-blur-md px-2.5 py-2.5 sm:px-5 shadow-md`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsWeekLiveOpen(!isWeekLiveOpen)}
                  className="flex flex-wrap items-center gap-1.5 text-left cursor-pointer"
                >
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span
                      className={`absolute inline-flex h-full w-full rounded-full ${
                        currentWeekBucket.liveCount > 0 ? 'animate-ping bg-emerald-400 opacity-75' : ''
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 ${
                        currentWeekBucket.liveCount > 0 ? 'bg-emerald-500' : 'bg-sky-400'
                      }`}
                    />
                  </span>
                  <span className="text-[10.5px] sm:text-xs font-bold text-sky-200/95">
                    <span className="text-emerald-400 font-black">{effectiveBulletinWeek}. HAFTA BÜLTENİ:</span>{' '}
                    <span>
                      {currentWeekBucket.finishedCount} / {currentWeekBucket.totalMatches} maç tamamlandı
                    </span>
                    {currentWeekBucket.liveCount > 0 && (
                      <span className="ml-1.5 text-emerald-400 font-black">• {currentWeekBucket.liveCount} maç canlı</span>
                    )}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#040917] border border-slate-700 text-[9px] font-black text-slate-300">
                    {isWeekLiveOpen ? '▲' : '▼'}
                  </span>
                </button>

                {isWeekLiveOpen && (
                  <div className="flex flex-wrap items-center gap-1">
                    {(['MASTER', 'DFO', 'TFF', 'SKOR'] as const).map((wTab) => (
                      <button
                        key={`wsub-${wTab}`}
                        type="button"
                        onClick={() => {
                          setWeekSubTab(wTab);
                          if (wTab === 'MASTER') setWeekMasterMode('DUZ');
                          if (wTab === 'SKOR') setWeekSkorMode('DUZ');
                        }}
                        className={`px-2 sm:px-2.5 py-0.5 rounded text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider border transition-colors ${
                          weekSubTab === wTab
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-400/80'
                            : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {wTab}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isWeekLiveOpen && weekSubTab === 'MASTER' && (
                <div className="flex items-center justify-center gap-1.5 pt-2 mt-1.5 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setWeekMasterMode('DUZ')}
                    className={`px-2.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${
                      weekMasterMode === 'DUZ'
                        ? 'bg-sky-900/50 text-sky-200 border-sky-400/70'
                        : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    MASTER PUAN
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeekMasterMode('DETAYLI')}
                    className={`px-2.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${
                      weekMasterMode === 'DETAYLI'
                        ? 'bg-sky-900/50 text-white border-sky-300/70'
                        : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    DETAYLI MASTER
                  </button>
                </div>
              )}

              {isWeekLiveOpen && weekSubTab === 'SKOR' && (
                <div className="flex flex-wrap items-center justify-center gap-1 pt-2 mt-1.5 border-t border-slate-800/80">
                  {([
                    { key: 'DUZ', label: 'MASTER SKOR' },
                    { key: 'DETAYLI', label: 'DETAYLI' },
                    { key: 'DFO', label: 'DFO SKOR' },
                    { key: 'TFF', label: 'TFF SKOR' }
                  ] as const).map((sm) => (
                    <button
                      key={`wskor-${sm.key}`}
                      type="button"
                      onClick={() => setWeekSkorMode(sm.key)}
                      className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${
                        weekSkorMode === sm.key
                          ? 'bg-orange-950/60 text-orange-300 border-orange-400/70'
                          : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {sm.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isWeekLiveOpen && (
              <div className="px-1 pb-3 sm:px-6 sm:pb-5 pt-1.5">
                <>
                {weekSubTab === 'MASTER' && weekMasterMode === 'DUZ' ? (
                  currentWeekBucket.MASTER.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-bold tracking-widest uppercase">
                      {effectiveBulletinWeek}. HAFTADA HENÜZ PUAN ALAN YARIŞMACI BULUNMUYOR
                    </div>
                  ) : (
                    <table className="w-full table-fixed text-left tabular-nums">
                      <thead>
                        <tr className="bg-[#040a18]/90 text-sky-200 border-b border-slate-800 text-[10px] sm:text-xs uppercase tracking-wider font-black">
                          <th className="py-2 px-1.5 sm:px-2 w-[28px] sm:w-14">#</th>
                          <th className="py-2 px-1.5 sm:px-2 text-white">Yarışmacı</th>
                          <th className="py-2 px-2 sm:px-3 w-[88px] sm:w-44 text-right text-sky-300">{effectiveBulletinWeek}.H Puan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70">
                        {currentWeekBucket.MASTER.map((row) => (
                          <tr key={row.id} className={row.canliMaster > 0 ? 'bg-emerald-950/30 hover:bg-emerald-950/45' : 'hover:bg-blue-900/20'}>
                            <td className="py-1.5 px-1.5 sm:px-2 font-black text-slate-400 text-[11px] sm:text-sm">{row.rank}</td>
                            <td className="py-1.5 px-1.5 sm:px-2 font-black text-white text-[11px] sm:text-sm">
                              <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                                {renderLiveNameWithFlag(row.name)}
                                {row.canliMaster > 0 && (
                                  <span className="shrink-0 bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[8.5px] font-black px-1 py-0.5 rounded leading-none">
                                    +{row.canliMaster}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-1.5 px-2 sm:px-3 text-right font-black text-xs sm:text-base text-sky-300">{row.toplamMaster}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                ) : weekSubTab === 'MASTER' && weekMasterMode === 'DETAYLI' ? (
                  currentWeekBucket.MASTER.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-bold tracking-widest uppercase">
                      {effectiveBulletinWeek}. HAFTADA HENÜZ PUAN ALAN YARIŞMACI BULUNMUYOR
                    </div>
                  ) : (
                    <table className="w-full table-fixed text-left tabular-nums">
                      <thead>
                        <tr className="bg-[#040a18]/90 text-slate-200 border-b border-slate-800 text-[9px] sm:text-xs uppercase tracking-tight sm:tracking-wider font-black">
                          <th className="py-2 px-1 sm:px-2 w-[22px] sm:w-10 align-bottom">#</th>
                          <th className="py-2 px-1 sm:px-2 text-white align-bottom">Yarışmacı</th>
                          <th className="py-1.5 px-0 w-[24px] sm:w-16 text-center text-sky-400 align-bottom">
                            <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">DFO</span>
                          </th>
                          <th className="py-1.5 px-0 w-[24px] sm:w-16 text-center text-rose-500 align-bottom">
                            <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">TFF</span>
                          </th>
                          <th className="py-1.5 px-0 w-[24px] sm:w-16 text-center text-orange-400 align-bottom">
                            <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">SKOR</span>
                          </th>
                          <th className="py-1.5 px-0 w-[26px] sm:w-20 text-center text-emerald-400 align-bottom">
                            <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">CANLI</span>
                          </th>
                          <th className="py-1.5 px-0.5 sm:px-2 w-[32px] sm:w-24 text-center text-sky-200 bg-sky-500/15 rounded-t align-bottom">
                            <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">MASTER</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70">
                        {currentWeekBucket.MASTER.map((row) => (
                          <tr key={row.id} className={row.canliMaster > 0 ? 'bg-emerald-950/30 hover:bg-emerald-950/45' : 'hover:bg-blue-900/20'}>
                            <td className="py-1.5 px-1 sm:px-2 font-black text-slate-400 text-[10.5px] sm:text-sm">{row.rank}</td>
                            <td className="py-1.5 px-1 sm:px-2 font-black text-white text-[10.5px] sm:text-sm" title={row.name}>
                              <div className="flex items-center min-w-0 overflow-hidden">
                                {renderLiveNameWithFlag(row.name)}
                              </div>
                            </td>
                            <td className="py-1.5 px-0 text-center text-sky-400 font-bold text-[10.5px] sm:text-sm">{row.toplamDfo}</td>
                            <td className="py-1.5 px-0 text-center text-rose-500 font-bold text-[10.5px] sm:text-sm">{row.toplamTff}</td>
                            <td className="py-1.5 px-0 text-center text-orange-400 font-black text-[10.5px] sm:text-sm">{row.toplamSkor}</td>
                            <td className="py-1.5 px-0 text-center font-black text-[9.5px] sm:text-xs">
                              {row.canliMaster > 0 ? (
                                <span className="bg-emerald-500/20 border border-emerald-400 text-emerald-300 px-1 py-0.5 rounded">
                                  +{row.canliMaster}
                                </span>
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>
                            <td className="py-1.5 px-0.5 sm:px-2 text-center text-sky-200 font-black text-[11.5px] sm:text-base bg-sky-500/10">
                              {row.toplamMaster}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                ) : weekSubTab === 'SKOR' && weekSkorMode === 'DETAYLI' ? (
                  currentWeekBucket.SKOR_MASTER.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-bold tracking-widest uppercase">
                      {effectiveBulletinWeek}. HAFTADA HENÜZ TAM İSABET YAPAN BULUNMUYOR
                    </div>
                  ) : (
                    <table className="w-full table-fixed text-left tabular-nums">
                      <thead>
                        <tr className="bg-[#040a18]/90 text-slate-200 border-b border-slate-800 text-[9px] sm:text-xs uppercase tracking-tight sm:tracking-wider font-black">
                          <th className="py-2 px-1 sm:px-2 w-[22px] sm:w-12 align-bottom">#</th>
                          <th className="py-2 px-1 sm:px-2 text-white align-bottom">Yarışmacı</th>
                          <th className="py-1.5 px-0 w-[25px] sm:w-20 text-center text-sky-400 align-bottom">
                            <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">DFO</span>
                          </th>
                          <th className="py-1.5 px-0 w-[25px] sm:w-20 text-center text-rose-500 align-bottom">
                            <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">TFF</span>
                          </th>
                          <th className="py-1.5 px-0 w-[26px] sm:w-20 text-center text-emerald-400 align-bottom">
                            <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">CANLI</span>
                          </th>
                          <th className="py-1.5 px-0.5 sm:px-2 w-[32px] sm:w-24 text-center text-orange-400 bg-orange-500/15 rounded-t align-bottom">
                            <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">SKOR</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70">
                        {currentWeekBucket.SKOR_MASTER.map((row) => (
                          <tr key={row.id} className={row.canliSkor > 0 ? 'bg-emerald-950/30 hover:bg-emerald-950/45' : 'hover:bg-blue-900/20'}>
                            <td className="py-1.5 px-1 sm:px-2 font-black text-slate-400 text-[10.5px] sm:text-sm">{row.rank}</td>
                            <td className="py-1.5 px-1 sm:px-2 font-black text-white text-[10.5px] sm:text-sm" title={row.name}>
                              <div className="flex items-center min-w-0 overflow-hidden">
                                {renderLiveNameWithFlag(row.name)}
                              </div>
                            </td>
                            <td className="py-1.5 px-0 text-center text-sky-400 font-bold text-[10.5px] sm:text-sm">{row.toplamDfoSkor}</td>
                            <td className="py-1.5 px-0 text-center text-rose-500 font-bold text-[10.5px] sm:text-sm">{row.toplamTffSkor}</td>
                            <td className="py-1.5 px-0 text-center font-black text-[9.5px] sm:text-xs">
                              {row.canliSkor > 0 ? (
                                <span className="bg-emerald-500/20 border border-emerald-400 text-emerald-300 px-1 py-0.5 rounded">
                                  +{row.canliSkor}
                                </span>
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>
                            <td className="py-1.5 px-0.5 sm:px-2 text-center text-orange-400 font-black text-[11.5px] sm:text-base bg-orange-500/10">
                              {row.toplamSkor}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                ) : (
                  (() => {
                    const list =
                      weekSubTab === 'DFO'
                        ? currentWeekBucket.DFO
                        : weekSubTab === 'TFF'
                        ? currentWeekBucket.TFF
                        : weekSkorMode === 'DFO'
                        ? currentWeekBucket.SKOR_DFO
                        : weekSkorMode === 'TFF'
                        ? currentWeekBucket.SKOR_TFF
                        : currentWeekBucket.SKOR_MASTER.map((r) => ({
                            id: r.id,
                            name: r.name,
                            rank: r.rank,
                            pts: r.toplamSkor,
                            liveAdd: r.canliSkor
                          }));

                    if (list.length === 0) {
                      return (
                        <div className="text-center py-8 text-slate-400 text-xs font-bold tracking-widest uppercase">
                          {effectiveBulletinWeek}. HAFTADA BU KATEGORİDE HENÜZ PUAN / İSABET BULUNMUYOR
                        </div>
                      );
                    }

                    return (
                      <table className="w-full table-fixed text-left tabular-nums">
                        <thead>
                          <tr className="bg-[#040a18]/90 text-slate-200 border-b border-slate-800 text-[10px] sm:text-xs uppercase tracking-wider font-black">
                            <th className="py-2 px-1.5 sm:px-2 w-[28px] sm:w-14">#</th>
                            <th className="py-2 px-1.5 sm:px-2 text-white">Yarışmacı</th>
                            <th className="py-2 px-2 sm:px-3 w-[88px] sm:w-44 text-right">
                              {weekSubTab === 'DFO' && <span className="text-sky-400">DFO Puan</span>}
                              {weekSubTab === 'TFF' && <span className="text-rose-500">TFF Puan</span>}
                              {weekSubTab === 'SKOR' && weekSkorMode === 'DUZ' && <span className="text-orange-400">Skor</span>}
                              {weekSubTab === 'SKOR' && weekSkorMode === 'DFO' && <span className="text-sky-400">DFO Skor</span>}
                              {weekSubTab === 'SKOR' && weekSkorMode === 'TFF' && <span className="text-rose-500">TFF Skor</span>}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/70">
                          {list.map((row) => (
                            <tr key={row.id} className={row.liveAdd > 0 ? 'bg-emerald-950/30 hover:bg-emerald-950/45' : 'hover:bg-blue-900/20'}>
                              <td className="py-1.5 px-1.5 sm:px-2 font-black text-slate-400 text-[11px] sm:text-sm">{row.rank}</td>
                              <td className="py-1.5 px-1.5 sm:px-2 font-black text-white text-[11px] sm:text-sm">
                                <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                                  {renderLiveNameWithFlag(row.name)}
                                  {row.liveAdd > 0 && (
                                    <span className="shrink-0 bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[8.5px] font-black px-1 py-0.5 rounded leading-none">
                                      +{row.liveAdd}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-1.5 px-2 sm:px-3 text-right font-black text-xs sm:text-base">
                                {weekSubTab === 'DFO' && <span className="text-sky-400">{row.pts}</span>}
                                {weekSubTab === 'TFF' && <span className="text-rose-500">{row.pts}</span>}
                                {weekSubTab === 'SKOR' && weekSkorMode === 'DUZ' && <span className="text-orange-400">{row.pts}</span>}
                                {weekSubTab === 'SKOR' && weekSkorMode === 'DFO' && <span className="text-sky-400">{row.pts}</span>}
                                {weekSubTab === 'SKOR' && weekSkorMode === 'TFF' && <span className="text-rose-500">{row.pts}</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()
                )}
              </>
              </div>
            )}
          </div>
        )}

        {/* MÜSTAKİL BLOK 1 (ÜSTTE - SADECE MASTER / DFO / TFF / TURUNCU SKOR) */}
        <div className="order-1 bg-gradient-to-b from-[#0a1838] via-[#071126] to-[#050b18] border border-slate-800 rounded-2xl shadow-xl">
          <div
            className={`${
              isLiveStandingsOpen
                ? 'sticky top-16 sm:top-20 z-30 rounded-t-2xl border-b border-slate-800'
                : 'rounded-2xl'
            } bg-[#071126]/95 backdrop-blur-md px-2.5 py-2.5 sm:px-5 shadow-md`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsLiveStandingsOpen(!isLiveStandingsOpen)}
                className="flex items-center gap-2 text-left cursor-pointer"
              >
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span
                    className={`absolute inline-flex h-full w-full rounded-full ${
                      totalActiveLiveMatches > 0 ? 'animate-ping bg-emerald-400 opacity-75' : ''
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      totalActiveLiveMatches > 0 ? 'bg-emerald-500' : 'bg-sky-400'
                    }`}
                  />
                </span>
                <h2 className="text-xs sm:text-sm font-black text-sky-200 uppercase tracking-wider">
                  CANLI GENEL PUAN DURUMU
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#040917] border border-slate-700 text-[9px] font-black text-slate-300">
                  {isLiveStandingsOpen ? '▲' : '▼'}
                </span>
              </button>

              {isLiveStandingsOpen && (
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {(['MASTER', 'DFO', 'TFF', 'SKOR'] as const).map((tab) => {
                    const isTabActive = liveTableTab === tab;
                    let btnCls = 'bg-[#040917] text-slate-300 border-slate-800 hover:border-slate-600 hover:text-white';
                    if (isTabActive) {
                      if (tab === 'TFF') btnCls = 'bg-rose-700 text-white border-rose-400/80';
                      else if (tab === 'DFO') btnCls = 'bg-blue-700 text-white border-sky-400/80';
                      else if (tab === 'SKOR') btnCls = 'bg-orange-600 text-white border-orange-300/80';
                      else btnCls = 'bg-sky-700 text-white border-sky-300/80';
                    } else if (tab === 'TFF') {
                      btnCls = 'bg-[#040917] text-rose-400 border-slate-800 hover:border-rose-700';
                    } else if (tab === 'DFO') {
                      btnCls = 'bg-[#040917] text-sky-400 border-slate-800 hover:border-sky-700';
                    } else if (tab === 'SKOR') {
                      btnCls = 'bg-[#040917] text-orange-400 border-slate-800 hover:border-orange-700';
                    }
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => {
                          setLiveTableTab(tab);
                          if (tab === 'MASTER') setMasterSubTab('DETAYLI');
                          if (tab === 'SKOR') setSkorSubTab('DUZ');
                        }}
                        className={`px-2.5 sm:px-3 py-1 rounded-lg text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider transition-colors border ${btnCls}`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {isLiveStandingsOpen && liveTableTab === 'MASTER' && (
              <div className="flex items-center justify-center gap-1.5 pt-2 mt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setMasterSubTab('DUZ')}
                  className={`px-2.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${
                    masterSubTab === 'DUZ'
                      ? 'bg-sky-900/50 text-sky-200 border-sky-400/70'
                      : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  MASTER PUAN
                </button>
                <button
                  type="button"
                  onClick={() => setMasterSubTab('DETAYLI')}
                  className={`px-2.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${
                    masterSubTab === 'DETAYLI'
                      ? 'bg-sky-900/50 text-white border-sky-300/70'
                      : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  DETAYLI MASTER
                </button>
              </div>
            )}

            {isLiveStandingsOpen && liveTableTab === 'SKOR' && (
              <div className="flex flex-wrap items-center justify-center gap-1 pt-2 mt-2 border-t border-slate-800/80">
                {([
                  { key: 'DUZ', label: 'MASTER SKOR' },
                  { key: 'DETAYLI', label: 'DETAYLI' },
                  { key: 'DFO', label: 'DFO SKOR' },
                  { key: 'TFF', label: 'TFF SKOR' }
                ] as const).map((st) => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => setSkorSubTab(st.key)}
                    className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${
                      skorSubTab === st.key
                        ? 'bg-orange-950/60 text-orange-300 border-orange-400/70'
                        : 'bg-[#040917] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isLiveStandingsOpen && (
            <div className="px-1 pb-4 sm:px-6 sm:pb-6 pt-2">
              <>
                {liveTableTab === 'MASTER' && masterSubTab === 'DUZ' ? (
                  <table className="w-full table-fixed text-left tabular-nums">
                    <thead>
                      <tr className="bg-[#040a18]/90 text-sky-200 border-b border-slate-800 text-[10px] sm:text-xs uppercase tracking-wider font-black">
                        <th className="py-2 px-1.5 sm:px-2 w-[30px] sm:w-14">#</th>
                        <th className="py-2 px-1.5 sm:px-2 text-white">Yarışmacı</th>
                        <th className="py-2 px-2 sm:px-3 w-[88px] sm:w-40 text-right text-sky-300">Master</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {liveStandingsTable.MASTER.map((row) => {
                        const diff = row.kesinSira - row.rankMaster;
                        return (
                          <tr key={row.id} className={row.canliMaster > 0 ? 'bg-emerald-950/30 hover:bg-emerald-950/45' : 'hover:bg-blue-900/20'}>
                            <td className="py-1.5 px-1.5 sm:px-2 font-black text-slate-400 text-[11px] sm:text-sm">
                              <span>{row.rankMaster}</span>
                              {diff > 0 && <span className="ml-0.5 text-[8.5px] text-emerald-400">▲</span>}
                              {diff < 0 && <span className="ml-0.5 text-[8.5px] text-rose-400">▼</span>}
                            </td>
                            <td className="py-1.5 px-1.5 sm:px-2 font-black text-white text-[11px] sm:text-sm">
                              <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                                {renderLiveNameWithFlag(row.name)}
                                {row.canliMaster > 0 && (
                                  <span className="shrink-0 bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[8.5px] font-black px-1 py-0.5 rounded leading-none">
                                    +{row.canliMaster}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-1.5 px-2 sm:px-3 text-right font-black text-xs sm:text-base text-sky-300">{row.toplamMaster}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : liveTableTab === 'MASTER' && masterSubTab === 'DETAYLI' ? (
                  <table className="w-full table-fixed text-left tabular-nums">
                    <thead>
                      <tr className="bg-[#040a18]/90 text-slate-200 border-b border-slate-800 text-[9px] sm:text-xs uppercase tracking-tight sm:tracking-wider font-black">
                        <th className="py-2 px-0.5 sm:px-2 w-[24px] sm:w-10 align-bottom">#</th>
                        <th className="py-2 px-1 sm:px-2 text-white align-bottom">Yarışmacı</th>
                        <th className="py-1.5 px-0 w-[23px] sm:w-14 text-center text-sky-400 align-bottom">
                          <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">DFO</span>
                        </th>
                        <th className="py-1.5 px-0 w-[23px] sm:w-14 text-center text-rose-500 align-bottom">
                          <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">TFF</span>
                        </th>
                        <th className="py-1.5 px-0 w-[22px] sm:w-16 text-center text-emerald-400 align-bottom">
                          <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">BNS</span>
                        </th>
                        <th className="py-1.5 px-0 w-[23px] sm:w-16 text-center text-orange-400 align-bottom">
                          <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">SKOR</span>
                        </th>
                        <th className="py-1.5 px-0 w-[25px] sm:w-20 text-center text-emerald-300 align-bottom">
                          <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">CANLI</span>
                        </th>
                        <th className="py-1.5 px-0.5 sm:px-2 w-[32px] sm:w-24 text-center text-sky-200 bg-sky-500/15 rounded-t align-bottom">
                          <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">MASTER</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {liveStandingsTable.MASTER.map((row) => {
                        const diff = row.kesinSira - row.rankMaster;
                        return (
                          <tr key={row.id} className={row.canliMaster > 0 ? 'bg-emerald-950/30 hover:bg-emerald-950/45' : 'hover:bg-blue-900/20'}>
                            <td className="py-1.5 px-0.5 sm:px-2 font-black text-slate-400 text-[10px] sm:text-sm whitespace-nowrap">
                              <span>{row.rankMaster}</span>
                              {diff > 0 && <span className="text-[7.5px] text-emerald-400">▲</span>}
                              {diff < 0 && <span className="text-[7.5px] text-rose-400">▼</span>}
                            </td>
                            <td className="py-1.5 px-1 sm:px-2 font-black text-white text-[10.5px] sm:text-sm" title={row.name}>
                              <div className="flex items-center min-w-0 overflow-hidden">
                                {renderLiveNameWithFlag(row.name)}
                              </div>
                            </td>
                            <td className="py-1.5 px-0 text-center text-sky-400 font-bold text-[10.5px] sm:text-sm">{row.toplamDfo}</td>
                            <td className="py-1.5 px-0 text-center text-rose-500 font-bold text-[10.5px] sm:text-sm">{row.toplamTff}</td>
                            <td className="py-1.5 px-0 text-center text-emerald-400 font-bold text-[10.5px] sm:text-sm">
                              {row.bonus > 0 ? `+${row.bonus}` : '0'}
                            </td>
                            <td className="py-1.5 px-0 text-center text-orange-400 font-black text-[10.5px] sm:text-sm">{row.toplamSkor}</td>
                            <td className="py-1.5 px-0 text-center font-black text-[9.5px] sm:text-xs">
                              {row.canliMaster > 0 ? (
                                <span className="bg-emerald-500/20 border border-emerald-400 text-emerald-300 px-1 py-0.5 rounded">
                                  +{row.canliMaster}
                                </span>
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>
                            <td className="py-1.5 px-0.5 sm:px-2 text-center text-sky-200 font-black text-[11.5px] sm:text-base bg-sky-500/10">
                              {row.toplamMaster}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : liveTableTab === 'SKOR' && skorSubTab === 'DUZ' ? (
                  <table className="w-full table-fixed text-left tabular-nums">
                    <thead>
                      <tr className="bg-[#040a18]/90 text-slate-200 border-b border-slate-800 text-[10px] sm:text-xs uppercase tracking-wider font-black">
                        <th className="py-2 px-1.5 sm:px-2 w-[30px] sm:w-14">#</th>
                        <th className="py-2 px-1.5 sm:px-2 text-white">Yarışmacı</th>
                        <th className="py-2 px-2 sm:px-3 w-[88px] sm:w-40 text-right text-orange-400">Skor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {liveStandingsTable.SKOR_MASTER.map((row) => {
                        const diff = row.prevSkorRank - row.rankSkor;
                        return (
                          <tr key={row.id} className={row.canliSkor > 0 ? 'bg-emerald-950/30 hover:bg-emerald-950/45' : 'hover:bg-blue-900/20'}>
                            <td className="py-1.5 px-1.5 sm:px-2 font-black text-slate-400 text-[11px] sm:text-sm">
                              <span>{row.rankSkor}</span>
                              {diff > 0 && <span className="ml-0.5 text-[8.5px] text-emerald-400">▲</span>}
                              {diff < 0 && <span className="ml-0.5 text-[8.5px] text-rose-400">▼</span>}
                            </td>
                            <td className="py-1.5 px-1.5 sm:px-2 font-black text-white text-[11px] sm:text-sm">
                              <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                                {renderLiveNameWithFlag(row.name)}
                                {row.canliSkor > 0 && (
                                  <span className="shrink-0 bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[8.5px] font-black px-1 py-0.5 rounded leading-none">
                                    +{row.canliSkor}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-1.5 px-2 sm:px-3 text-right font-black text-xs sm:text-base text-orange-400">{row.toplamSkor}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : liveTableTab === 'SKOR' && skorSubTab === 'DETAYLI' ? (
                  <table className="w-full table-fixed text-left tabular-nums">
                    <thead>
                      <tr className="bg-[#040a18]/90 text-slate-200 border-b border-slate-800 text-[9px] sm:text-xs uppercase tracking-tight sm:tracking-wider font-black">
                        <th className="py-2 px-1 sm:px-2 w-[24px] sm:w-12 align-bottom">#</th>
                        <th className="py-2 px-1 sm:px-2 text-white align-bottom">Yarışmacı</th>
                        <th className="py-1.5 px-0 w-[25px] sm:w-20 text-center text-sky-400 align-bottom">
                          <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">DFO</span>
                        </th>
                        <th className="py-1.5 px-0 w-[25px] sm:w-20 text-center text-rose-500 align-bottom">
                          <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">TFF</span>
                        </th>
                        <th className="py-1.5 px-0 w-[26px] sm:w-20 text-center text-emerald-400 align-bottom">
                          <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">CANLI</span>
                        </th>
                        <th className="py-1.5 px-0.5 sm:px-2 w-[32px] sm:w-24 text-center text-orange-400 bg-orange-500/15 rounded-t align-bottom">
                          <span className="inline-block max-sm:[writing-mode:vertical-rl] max-sm:rotate-180 leading-none">SKOR</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {liveStandingsTable.SKOR_MASTER.map((row) => {
                        const diff = row.prevSkorRank - row.rankSkor;
                        return (
                          <tr key={row.id} className={row.canliSkor > 0 ? 'bg-emerald-950/30 hover:bg-emerald-950/45' : 'hover:bg-blue-900/20'}>
                            <td className="py-1.5 px-1 sm:px-2 font-black text-slate-400 text-[10px] sm:text-sm whitespace-nowrap">
                              <span>{row.rankSkor}</span>
                              {diff > 0 && <span className="text-[7.5px] text-emerald-400">▲</span>}
                              {diff < 0 && <span className="text-[7.5px] text-rose-400">▼</span>}
                            </td>
                            <td className="py-1.5 px-1 sm:px-2 font-black text-white text-[10.5px] sm:text-sm" title={row.name}>
                              <div className="flex items-center min-w-0 overflow-hidden">
                                {renderLiveNameWithFlag(row.name)}
                              </div>
                            </td>
                            <td className="py-1.5 px-0 text-center text-sky-400 font-bold text-[10.5px] sm:text-sm">{row.toplamDfoSkor}</td>
                            <td className="py-1.5 px-0 text-center text-rose-500 font-bold text-[10.5px] sm:text-sm">{row.toplamTffSkor}</td>
                            <td className="py-1.5 px-0 text-center font-black text-[9.5px] sm:text-xs">
                              {row.canliSkor > 0 ? (
                                <span className="bg-emerald-500/20 border border-emerald-400 text-emerald-300 px-1 py-0.5 rounded">
                                  +{row.canliSkor}
                                </span>
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>
                            <td className="py-1.5 px-0.5 sm:px-2 text-center text-orange-400 font-black text-[11.5px] sm:text-base bg-orange-500/10">
                              {row.toplamSkor}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full table-fixed text-left tabular-nums">
                    <thead>
                      <tr className="bg-[#040a18]/90 text-slate-200 border-b border-slate-800 text-[10px] sm:text-xs uppercase tracking-wider font-black">
                        <th className="py-2 px-1.5 sm:px-2 w-[30px] sm:w-14">#</th>
                        <th className="py-2 px-1.5 sm:px-2 text-white">Yarışmacı</th>
                        <th className="py-2 px-2 sm:px-3 w-[88px] sm:w-40 text-right">
                          {liveTableTab === 'DFO' && <span className="text-sky-400">DFO Puan</span>}
                          {liveTableTab === 'TFF' && <span className="text-rose-500">TFF Puan</span>}
                          {liveTableTab === 'SKOR' && skorSubTab === 'DFO' && <span className="text-sky-400">DFO Skor</span>}
                          {liveTableTab === 'SKOR' && skorSubTab === 'TFF' && <span className="text-rose-500">TFF Skor</span>}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {(liveTableTab === 'DFO'
                        ? liveStandingsTable.DFO
                        : liveTableTab === 'TFF'
                        ? liveStandingsTable.TFF
                        : skorSubTab === 'DFO'
                        ? liveStandingsTable.SKOR_DFO
                        : liveStandingsTable.SKOR_TFF
                      ).map((row) => {
                        const diff = row.prevRank - row.rank;
                        return (
                          <tr key={row.id} className={row.liveAdd > 0 ? 'bg-emerald-950/30 hover:bg-emerald-950/45' : 'hover:bg-blue-900/20'}>
                            <td className="py-1.5 px-1.5 sm:px-2 font-black text-slate-400 text-[11px] sm:text-sm">
                              <span>{row.rank}</span>
                              {diff > 0 && <span className="ml-0.5 text-[8.5px] text-emerald-400">▲</span>}
                              {diff < 0 && <span className="ml-0.5 text-[8.5px] text-rose-400">▼</span>}
                            </td>
                            <td className="py-1.5 px-1.5 sm:px-2 font-black text-white text-[11px] sm:text-sm">
                              <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                                {renderLiveNameWithFlag(row.name)}
                                {row.liveAdd > 0 || row.liveAdd > 0 ? (
                                  <span className="shrink-0 bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[8.5px] font-black px-1 py-0.5 rounded leading-none">
                                    +{row.liveAdd}
                                  </span>
                                ) : null}
                              </div>
                            </td>
                            <td className="py-1.5 px-2 sm:px-3 text-right font-black text-xs sm:text-base">
                              {liveTableTab === 'DFO' && <span className="text-sky-400">{row.pts}</span>}
                              {liveTableTab === 'TFF' && <span className="text-rose-500">{row.pts}</span>}
                              {liveTableTab === 'SKOR' && skorSubTab === 'DFO' && <span className="text-sky-400">{row.pts}</span>}
                              {liveTableTab === 'SKOR' && skorSubTab === 'TFF' && <span className="text-rose-500">{row.pts}</span>}
                            </td>
                          </tr>
                        );
                     })}
                    </tbody>
                  </table>
                )}
              </>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}