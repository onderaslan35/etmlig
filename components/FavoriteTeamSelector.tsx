'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { getEliteTheme } from '@/utils/themeEngine';

export const AVAILABLE_FAVORITE_CLUBS = [
  // Türkiye Kulüpleri
  'GÖZTEPE',
  'GALATASARAY',
  'FENERBAHÇE',
  'BEŞİKTAŞ',
  'TRABZONSPOR',
  'KARŞIYAKA',
  'ALTAY',
  'ANKARAGÜCÜ',
  'BURSASPOR',
  'ESKİŞEHİRSPOR',
  'SAMSUNSPOR',
  'KONYASPOR',
  'ANTALYASPOR',
  'ALANYASPOR',
  'GAZİANTEP FK',
  'BAŞAKŞEHİR',
  'KAYSERİSPOR',
  'SİVASSPOR',
  'ÇAYKUR RİZESPOR',
  'KASIMPAŞA',
  'GENÇLERBİRLİĞİ',
  'KOCAELİSPOR',
  'SAKARYASPOR',
  'AMED',
  'ERZURUMSPOR FK',
  'BODRUM FK',
  'EYÜPSPOR',
  'PENDİKSPOR',
  'BANDIRMASPOR',
  'BOLUSPOR',
  'ÇORUM FK',
  'MANİSA F.K.',
  'IĞDIR FK',
  'ÜMRANİYESPOR',
  'VANSPOR FK',
  // Avrupa Kulüpleri
  'REAL MADRID',
  'BARCELONA',
  'ATLETICO MADRID',
  'LIVERPOOL',
  'MANCHESTER CITY',
  'MANCHESTER UNITED',
  'ARSENAL',
  'CHELSEA',
  'TOTTENHAM',
  'ASTON VILLA',
  'NEWCASTLE',
  'BAYERN MÜNCHEN',
  'BORUSSIA DORTMUND',
  'BAYER LEVERKUSEN',
  'RB LEIPZIG',
  'EINTRACHT FRANKFURT',
  'INTER',
  'AC MILAN',
  'JUVENTUS',
  'NAPOLI',
  'AS ROMA',
  'ATALANTA',
  'LAZIO',
  'FIORENTINA',
  'PARIS SAINT GERMAIN',
  'MARSEILLE',
  'LYON',
  'MONACO',
  'LILLE',
  'AJAX',
  'PSV EINDHOVEN',
  'FEYENOORD',
  'BENFICA',
  'FC PORTO',
  'SPORTING CP',
  'CELTIC',
  'RANGERS'
];

export const normalizeClubKey = (s?: string | null) =>
  String(s || '')
    .trim()
    .toLocaleUpperCase('tr-TR')
    .replace(/İ/g, 'I')
    .replace(/Ş/g, 'S')
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ö/g, 'O')
    .replace(/Ç/g, 'C')
    .replace(/\s+/g, ' ');

// KESİN KARA LİSTE: Hiçbir Milli Takım / Ülke adı favori kulüp olarak seçilemez ve gösterilemez!
const NATIONAL_TEAMS_BLACKLIST = new Set<string>([
  'TURKIYE', 'TURKEY', 'ALMANYA', 'GERMANY', 'INGILTERE', 'ENGLAND', 'FRANSA', 'FRANCE',
  'ISPANYA', 'SPAIN', 'ITALYA', 'ITALY', 'HOLLANDA', 'NETHERLANDS', 'PORTEKIZ', 'PORTUGAL',
  'BELCIKA', 'BELGIUM', 'HIRVATISTAN', 'CROATIA', 'ISVICRE', 'SWITZERLAND', 'DANIMARKA', 'DENMARK',
  'AVUSTURYA', 'AUSTRIA', 'MACARISTAN', 'HUNGARY', 'SIRBISTAN', 'SERBIA', 'POLONYA', 'POLAND',
  'UKRAYNA', 'UKRAINE', 'CEKYA', 'CEK CUMHURIYETI', 'CZECHIA', 'CZECH REPUBLIC',
  'ISKOCYA', 'SCOTLAND', 'GALLER', 'WALES', 'IRLANDA', 'IRLANDA CUMHURIYETI', 'IRELAND', 'REPUBLIC OF IRELAND',
  'KUZEY IRLANDA', 'NORTHERN IRELAND', 'ISVEC', 'SWEDEN', 'NORVEC', 'NORWAY', 'FINLANDIYA', 'FINLAND',
  'IZLANDA', 'ICELAND', 'ROMANYA', 'ROMANIA', 'YUNANISTAN', 'GREECE', 'SLOVAKYA', 'SLOVAKIA',
  'SLOVENYA', 'SLOVENIA', 'GURCISTAN', 'GEORGIA', 'ARNAVUTLUK', 'ALBANIA',
  'KUZEY MAKEDONYA', 'MAKEDONYA', 'NORTH MACEDONIA', 'KARADAG', 'MONTENEGRO',
  'BOSNA HERSEK', 'BOSNA-HERSEK', 'BOSNIA', 'BOSNIA AND HERZEGOVINA', 'BOSNIA & HERZEGOVINA',
  'KOSOVA', 'KOSOVO', 'BULGARISTAN', 'BULGARIA', 'KAZAKISTAN', 'KAZAKHSTAN',
  'AZERBAYCAN', 'AZERBAIJAN', 'ERMENISTAN', 'ARMENIA', 'BELARUS', 'BEYAZ RUSYA',
  'RUSYA', 'RUSSIA', 'ISRAIL', 'ISRAEL', 'KIBRIS', 'GUNEY KIBRIS', 'KKTC', 'CYPRUS',
  'ESTONYA', 'ESTONIA', 'LETONYA', 'LATVIA', 'LITVANYA', 'LITHUANIA',
  'LUKSEMBURG', 'LUXEMBOURG', 'FAROE ADALARI', 'FAROE ISLANDS', 'MOLDOVA', 'MALTA',
  'ANDORRA', 'SAN MARINO', 'LIHTENSTAYN', 'LIECHTENSTEIN', 'CEBELITARIK', 'GIBRALTAR',
  'BREZILYA', 'BRAZIL', 'ARJANTIN', 'ARGENTINA', 'URUGUAY', 'KOLOMBIYA', 'COLOMBIA',
  'SILI', 'CHILE', 'PERU', 'EKVADOR', 'ECUADOR', 'PARAGUAY', 'VENEZUELA', 'BOLIVYA', 'BOLIVIA',
  'MEKSIKA', 'MEXICO', 'ABD', 'AMERIKA', 'USA', 'UNITED STATES', 'KANADA', 'CANADA',
  'KOSTA RIKA', 'COSTA RICA', 'PANAMA', 'JAMAIKA', 'JAMAICA', 'HONDURAS',
  'FAS', 'MOROCCO', 'SENEGAL', 'MISIR', 'EGYPT', 'NIJERYA', 'NIGERIA', 'CEZAYIR', 'ALGERIA',
  'TUNUS', 'TUNISIA', 'KAMERUN', 'CAMEROON', 'GANA', 'GHANA', 'FILDISI SAHILI', 'IVORY COAST',
  'MALI', 'GUNEY AFRIKA', 'SOUTH AFRICA', 'KONGO', 'JAPONYA', 'JAPAN',
  'GUNEY KORE', 'KORE', 'SOUTH KOREA', 'IRAN', 'SUUDI ARABISTAN', 'SAUDI ARABIA',
  'KATAR', 'QATAR', 'IRAK', 'IRAQ', 'OZBEKISTAN', 'UZBEKISTAN', 'URDUN', 'JORDAN',
  'CIN', 'CHINA', 'AVUSTRALYA', 'AUSTRALIA', 'YENI ZELANDA', 'NEW ZEALAND'
]);

export const isNationalTeamName = (name?: string | null): boolean => {
  if (!name || !name.trim()) return false;
  const norm = normalizeClubKey(name).replace(/[^A-Z0-9\s&-]/g, '').trim();
  if (!norm) return false;
  if (NATIONAL_TEAMS_BLACKLIST.has(norm)) return true;
  if (/\b(MILLI|NATIONAL|U21|U20|U19|U17)\b/.test(norm)) return true;
  return false;
};

type CustomClubRow = { club_name: string; logo_url: string; is_selectable?: boolean };

const STORAGE_CACHE_KEY = 'etml_custom_clubs_cache_v1';
const STORAGE_CACHE_TS_KEY = 'etml_custom_clubs_ts_v1';
const CACHE_TTL_MS = 60 * 60 * 1000;

const customClubLogoMap: Record<string, string> = {};
let customClubListCache: CustomClubRow[] = [];
let initializedCustomClubs = false;
let lastMemorySyncTs = 0;
let inFlightRefresh: Promise<CustomClubRow[]> | null = null;

const applyCustomClubsToMemory = (rows: CustomClubRow[], persistToStorage = true) => {
  customClubListCache = rows || [];
  Object.keys(customClubLogoMap).forEach((k) => delete customClubLogoMap[k]);

  (rows || []).forEach((r) => {
    const raw = String(r.club_name || '').trim().toLocaleUpperCase('tr-TR');
    const url = String(r.logo_url || '').trim();
    if (!raw || !url) return;
    customClubLogoMap[raw] = url;
    customClubLogoMap[normalizeClubKey(raw)] = url;
  });

  if (typeof window !== 'undefined') {
    if (persistToStorage) {
      try {
        window.localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(rows || []));
        window.localStorage.setItem(STORAGE_CACHE_TS_KEY, String(Date.now()));
      } catch {
        // Base64 boyutu localStorage sınırını aşarsa bellek içi önbellekle devam et
      }
    }
    window.dispatchEvent(new CustomEvent('etml-custom-clubs-updated'));
  }
};

export const refreshCustomClubsCache = async (force = false): Promise<CustomClubRow[]> => {
  const isAdminPage =
    typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

  const now = Date.now();
  let cachedTs = lastMemorySyncTs;
  if (typeof window !== 'undefined' && !cachedTs) {
    cachedTs = Number(window.localStorage.getItem(STORAGE_CACHE_TS_KEY) || '0');
  }

  if (!force && !isAdminPage && customClubListCache.length > 0 && now - cachedTs < CACHE_TTL_MS) {
    return customClubListCache;
  }

  if (inFlightRefresh) return inFlightRefresh;

  inFlightRefresh = (async () => {
    try {
      const { data, error } = await supabase
        .from('etml_custom_clubs')
        .select('*')
        .order('club_name', { ascending: true });

      if (!error && data) {
        lastMemorySyncTs = Date.now();
        applyCustomClubsToMemory(data as CustomClubRow[], true);
      }
    } finally {
      inFlightRefresh = null;
    }
    return customClubListCache;
  })();

  return inFlightRefresh;
};

if (typeof window !== 'undefined' && !initializedCustomClubs) {
  initializedCustomClubs = true;
  try {
    const cached = window.localStorage.getItem(STORAGE_CACHE_KEY);
    const cachedTs = Number(window.localStorage.getItem(STORAGE_CACHE_TS_KEY) || '0');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        lastMemorySyncTs = cachedTs;
        applyCustomClubsToMemory(parsed, false);
      }
    }
  } catch {
    // ignore
  }
  refreshCustomClubsCache(false);
}

export const getClubLogoUrl = (teamName?: string | null) => {
  if (!teamName || !teamName.trim()) return '';
  // Yarışmacı rozeti olarak milli takım bayrağı kesinlikle gösterilmez
  if (isNationalTeamName(teamName)) return '';

  const upperTr = teamName.trim().toLocaleUpperCase('tr-TR');
  const norm = normalizeClubKey(upperTr);

  if (customClubLogoMap[upperTr]) return customClubLogoMap[upperTr];
  if (customClubLogoMap[norm]) return customClubLogoMap[norm];

  return getEliteTheme('', upperTr, '').homeLogo || getEliteTheme('', norm, '').homeLogo || '';
};

interface FavoriteTeamSelectorProps {
  userId: string;
  playerName?: string;
}

export default function FavoriteTeamSelector({ userId, playerName }: FavoriteTeamSelectorProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [customClubs, setCustomClubs] = useState<CustomClubRow[]>(customClubListCache);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    refreshCustomClubsCache(false).then((rows) => {
      if (active) setCustomClubs([...rows]);
    });

    const onUpdated = () => {
      if (active) setCustomClubs([...customClubListCache]);
    };
    window.addEventListener('etml-custom-clubs-updated', onUpdated);

    if (userId) {
      supabase
        .from('etml_official_players')
        .select('favorite_team')
        .eq('user_id', String(userId).trim())
        .maybeSingle()
        .then(({ data }) => {
          if (active && data?.favorite_team) {
            const fav = String(data.favorite_team).trim();
            if (!isNationalTeamName(fav)) {
              setSelectedTeam(fav);
            }
          }
        });
    }

    return () => {
      active = false;
      window.removeEventListener('etml-custom-clubs-updated', onUpdated);
    };
  }, [userId]);

  const handleTeamChange = async (newTeam: string) => {
    if (isNationalTeamName(newTeam)) return;
    setSelectedTeam(newTeam);
    setSaving(true);
    setSavedNotice(false);

    const cleanUid = String(userId).trim();
    const { error } = await supabase
      .from('etml_official_players')
      .upsert(
        {
          user_id: cleanUid,
          ...(playerName ? { full_name: playerName.replace(/(🏆|🇹🇷)+/g, '').trim() } : {}),
          favorite_team: newTeam
        },
        { onConflict: 'user_id' }
      );

    setSaving(false);
    if (!error) {
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    }
  };

  if (!userId || userId === 'mankoman') return null;

  // SADECE KULÜP TAKIMLARI: Milli takımlar kesin olarak filtrelenir!
  const extraClubNames = customClubs
    .filter((c: any) => c.is_selectable !== false && !isNationalTeamName(c.club_name))
    .map((c) => c.club_name)
    .filter(
      (cn) => !AVAILABLE_FAVORITE_CLUBS.some((base) => normalizeClubKey(base) === normalizeClubKey(cn))
    );

  const safeSelectedTeam = isNationalTeamName(selectedTeam) ? '' : selectedTeam;

  const matchedOptionValue =
    [...extraClubNames, ...AVAILABLE_FAVORITE_CLUBS].find(
      (c) => normalizeClubKey(c) === normalizeClubKey(safeSelectedTeam)
    ) || safeSelectedTeam;

  const logoUrl = getClubLogoUrl(safeSelectedTeam);

  return (
    <div className="inline-flex flex-wrap items-center gap-2 bg-[#040a18] border border-sky-500/40 rounded-xl px-2.5 py-1.5 shadow-sm">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={safeSelectedTeam}
          className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0"
        />
      ) : (
        <span className="text-xs sm:text-sm">🛡️</span>
      )}

      <span className="text-[10px] sm:text-[11px] font-black text-sky-300 uppercase tracking-wider">
        KULÜP ARMAM:
      </span>

      <select
        value={matchedOptionValue}
        onChange={(e) => handleTeamChange(e.target.value)}
        disabled={saving}
        className="bg-[#071126] border border-slate-700 hover:border-sky-400 text-white text-[10.5px] sm:text-xs font-black rounded-lg px-2 py-1 outline-none cursor-pointer"
      >
        <option value="">-- Kulüp Seçiniz --</option>

        {extraClubNames.length > 0 && (
          <optgroup label="ÖZEL EKLENEN KULÜPLER" className="bg-[#071126] text-amber-300">
            {extraClubNames.map((club) => (
              <option key={club} value={club} className="bg-[#071126] text-white">
                {club}
              </option>
            ))}
          </optgroup>
        )}

        <optgroup label="TÜRKİYE VE AVRUPA KULÜPLERİ" className="bg-[#071126] text-sky-300">
          {AVAILABLE_FAVORITE_CLUBS.map((club) => (
            <option key={club} value={club} className="bg-[#071126] text-white">
              {club}
            </option>
          ))}
        </optgroup>
      </select>

      {saving && (
        <span className="text-[9.5px] font-bold text-amber-300 animate-pulse">Kaydediliyor...</span>
      )}
      {savedNotice && (
        <span className="text-[9.5px] font-black text-emerald-400">✓ Kaydedildi</span>
      )}
    </div>
  );
}