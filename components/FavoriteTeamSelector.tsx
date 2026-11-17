'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { getEliteTheme } from '@/utils/themeEngine';

export const AVAILABLE_FAVORITE_CLUBS = [
  // Türkiye Kulüpleri
  'GÖZTEPE',
  'GALATASARAY',
  'FENERBAHÇE',
  'BEŞIKTAŞ',
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

export const getClubLogoUrl = (teamName?: string | null) => {
  if (!teamName || !teamName.trim()) return '';
  return getEliteTheme('', teamName.trim().toUpperCase(), '').homeLogo || '';
};

interface FavoriteTeamSelectorProps {
  userId: string;
  playerName?: string;
}

export default function FavoriteTeamSelector({ userId, playerName }: FavoriteTeamSelectorProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    const loadCurrentTeam = async () => {
      const { data } = await supabase
        .from('etml_official_players')
        .select('favorite_team')
        .eq('user_id', String(userId).trim())
        .maybeSingle();
      if (active && data?.favorite_team) {
        setSelectedTeam(String(data.favorite_team).trim());
      }
    };
    loadCurrentTeam();
    return () => {
      active = false;
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
        value={selectedTeam}
        onChange={(e) => handleTeamChange(e.target.value)}
        disabled={saving}
        className="bg-[#071126] border border-slate-700 hover:border-sky-400 text-white text-[10.5px] sm:text-xs font-black rounded-lg px-2 py-1 outline-none cursor-pointer"
      >
        <option value="">-- Kulüp Seçiniz --</option>
        {AVAILABLE_FAVORITE_CLUBS.map((club) => (
          <option key={club} value={club} className="bg-[#071126] text-white">
            {club}
          </option>
        ))}
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