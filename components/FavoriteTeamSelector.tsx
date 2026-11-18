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
  // Avrupa Devleri
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

const STORAGE_CACHE_KEY = 'etml_custom_clubs_cache_v1';
const customClubLogoMap: Record<string, string> = {};
let customClubListCache: { club_name: string; logo_url: string }[] = [];
let initializedCustomClubs = false;

const applyCustomClubsToMemory = (rows: { club_name: string; logo_url: string }[]) => {
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
    try {
      window.localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(rows || []));
      window.dispatchEvent(new CustomEvent('etml-custom-clubs-updated'));
    } catch {
      // localStorage kapalıysa sessiz geç
    }
  }
};

export const refreshCustomClubsCache = async () => {
  const { data, error } = await supabase
    .from('etml_custom_clubs')
    .select('club_name, logo_url, is_selectable')
    .order('club_name', { ascending: true });

  if (!error && data) {
    applyCustomClubsToMemory(data as { club_name: string; logo_url: string }[]);
  }
  return customClubListCache;
};

// Tarayıcı açılır açılmaz önbelleği ve Supabase'deki özel kulüpleri yükle
if (typeof window !== 'undefined' && !initializedCustomClubs) {
  initializedCustomClubs = true;
  try {
    const cached = window.localStorage.getItem(STORAGE_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) applyCustomClubsToMemory(parsed);
    }
  } catch {
    // ignore
  }
  refreshCustomClubsCache();
}

export const getClubLogoUrl = (teamName?: string | null) => {
  if (!teamName || !teamName.trim()) return '';
  const upperTr = teamName.trim().toLocaleUpperCase('tr-TR');
  const norm = normalizeClubKey(upperTr);

  // 1. Öncelik: Admin'den eklenen özel kulüp arması (Örn: GAZİANTEP KALESPOR)
  if (customClubLogoMap[upperTr]) return customClubLogoMap[upperTr];
  if (customClubLogoMap[norm]) return customClubLogoMap[norm];

  // 2. Öncelik: Sistemin yerleşik themeEngine arması
  return getEliteTheme('', upperTr, '').homeLogo || getEliteTheme('', norm, '').homeLogo || '';
};

interface FavoriteTeamSelectorProps {
  userId: string;
  playerName?: string;
}

export default function FavoriteTeamSelector({ userId, playerName }: FavoriteTeamSelectorProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [customClubs, setCustomClubs] = useState<{ club_name: string; logo_url: string }[]>(
    customClubListCache
  );
  const [saving, setSaving] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    refreshCustomClubsCache().then((rows) => {
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
            setSelectedTeam(String(data.favorite_team).trim());
          }
        });
    }

    return () => {
      active = false;
      window.removeEventListener('etml-custom-clubs-updated', onUpdated);
    };
  }, [userId]);

  const handleTeamChange = async (newTeam: string) => {
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

  const extraClubNames = customClubs
    .filter((c: any) => c.is_selectable !== false)
    .map((c) => c.club_name)
    .filter(
      (cn) => !AVAILABLE_FAVORITE_CLUBS.some((base) => normalizeClubKey(base) === normalizeClubKey(cn))
    );

  // Kullanıcının veritabanındaki mevcut seçimi (örn. BESIKTAS) listedeki Türkçe yazımla eşleşsin
  const matchedOptionValue =
    [...extraClubNames, ...AVAILABLE_FAVORITE_CLUBS].find(
      (c) => normalizeClubKey(c) === normalizeClubKey(selectedTeam)
    ) || selectedTeam;

  const logoUrl = getClubLogoUrl(selectedTeam);

  return (
    <div className="inline-flex flex-wrap items-center gap-2 bg-[#040a18] border border-sky-500/40 rounded-xl px-2.5 py-1.5 shadow-sm">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={selectedTeam}
          className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0"
        />
      ) : (
        <span className="text-xs sm:text-sm">🛡️</span>
      )}

      <span className="text-[10px] sm:text-[11px] font-black text-sky-300 uppercase tracking-wider">
        TAKIM ARMAM:
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