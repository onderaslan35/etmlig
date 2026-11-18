'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { normalizeClubKey, refreshCustomClubsCache } from '@/components/FavoriteTeamSelector';

interface CustomClubRow {
  club_name: string;
  logo_url: string;
}

interface OfficialPlayerItem {
  user_id: string;
  full_name: string;
  favorite_team?: string;
}

export default function CustomClubFactory() {
  const [clubName, setClubName] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [assignUserId, setAssignUserId] = useState<string>('');
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  const [customClubs, setCustomClubs] = useState<CustomClubRow[]>([]);
  const [players, setPlayers] = useState<OfficialPlayerItem[]>([]);

  const loadData = async () => {
    const [clubs, playersRes] = await Promise.all([
      refreshCustomClubsCache(),
      supabase
        .from('etml_official_players')
        .select('user_id, full_name, favorite_team, is_active')
        .order('full_name', { ascending: true })
    ]);

    setCustomClubs([...clubs]);
    const activePlayers = (playersRes.data || [])
      .filter((p: any) => p.is_active !== false && String(p.user_id).toLowerCase() !== 'mankoman')
      .map((p: any) => ({
        user_id: String(p.user_id).trim(),
        full_name: String(p.full_name || p.user_id).trim(),
        favorite_team: String(p.favorite_team || '').trim()
      }));
    setPlayers(activePlayers);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Bilgisayar veya Telefondan Görsel Yükleme (Supabase Storage -> club-logos)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setStatusMsg('');
    try {
      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      const safeSlug =
        normalizeClubKey(clubName || file.name.replace(/\.[^.]+$/, ''))
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-') || 'kulup';
      const filePath = `${safeSlug}-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('club-logos')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (upErr) throw upErr;

      const { data: pubData } = supabase.storage.from('club-logos').getPublicUrl(filePath);
      if (pubData?.publicUrl) {
        setLogoUrl(pubData.publicUrl);
        setStatusMsg('✅ Görsel yüklendi! Önizlemeyi kontrol edip Kaydet butonuna basabilirsin.');
      }
    } catch (err: any) {
      setStatusMsg('❌ Dosya yükleme hatası: ' + (err?.message || 'Bilinmeyen hata'));
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSaveClub = async () => {
    const cleanClub = clubName.trim().toLocaleUpperCase('tr-TR');
    const cleanUrl = logoUrl.trim();

    if (!cleanClub || !cleanUrl) {
      setStatusMsg('⚠️ Lütfen hem kulüp adını (Örn: GAZİANTEP KALESPOR) hem de logo linkini/dosyasını girin.');
      return;
    }

    setSaving(true);
    setStatusMsg('');
    try {
      const { error } = await supabase.from('etml_custom_clubs').upsert(
        {
          club_name: cleanClub,
          logo_url: cleanUrl,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'club_name' }
      );
      if (error) throw error;

      // Eğer yarışmacı da seçildiyse o yarışmacıya armayı anında ata
      if (assignUserId) {
        await supabase
          .from('etml_official_players')
          .update({ favorite_team: cleanClub })
          .eq('user_id', assignUserId);
      }

      await loadData();
      setClubName('');
      setLogoUrl('');
      setAssignUserId('');
      setStatusMsg(
        assignUserId
          ? `✅ ${cleanClub} arması sisteme eklendi ve seçili yarışmacıya atandı!`
          : `✅ ${cleanClub} arması kulüp havuzuna başarıyla eklendi!`
      );
    } catch (err: any) {
      setStatusMsg('❌ Kayıt hatası: ' + (err?.message || 'Bilinmeyen hata'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClub = async (targetClub: string) => {
    if (!window.confirm(`${targetClub} kulübünü özel listeden silmek istediğine emin misin?`)) return;
    await supabase.from('etml_custom_clubs').delete().eq('club_name', targetClub);
    await loadData();
  };

  return (
    <div className="bg-[#071126] border border-sky-500/40 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-lg my-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div>
          <h2 className="text-xs sm:text-sm font-black text-sky-200 uppercase tracking-wider">
            🛡️ KULÜP VE ARMA FABRİKASI (ÖZEL TAKIM EKLE / ATA)
          </h2>
          <p className="text-[10.5px] text-slate-400 font-semibold mt-0.5">
            Amatör veya listede olmayan kulüpleri link ya da dosya yükleyerek ekleyin; tüm tablolarda otomatik görünür.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-sky-950 border border-sky-500/40 text-[10px] font-black text-sky-300">
          {customClubs.length} ÖZEL KULÜP
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 1. Kulüp Adı */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider">
            1. KULÜP ADI
          </label>
          <input
            type="text"
            placeholder="Örn: GAZİANTEP KALESPOR"
            value={clubName}
            onChange={(e) => setClubName(e.target.value.toLocaleUpperCase('tr-TR'))}
            className="bg-[#040917] border border-slate-700 focus:border-sky-400 rounded-xl px-3 py-2 text-xs font-black text-white outline-none uppercase"
          />
        </div>

        {/* 2. Direkt Link veya Dosya Yükle */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider">
            2. ARMA LİNKİ VEYA GÖRSEL YÜKLE (ŞEFFAF PNG ÖNERİLİR)
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="https://.../logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="flex-1 min-w-0 bg-[#040917] border border-slate-700 focus:border-sky-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
            <label className="shrink-0 cursor-pointer px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[10px] font-black text-amber-300 uppercase">
              {uploadingFile ? 'YÜKLENİYOR...' : 'DOSYA SEÇ'}
              <input
                type="file"
                accept="image/png,image/webp,image/svg+xml,image/jpeg"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* 3. İsteğe Bağlı Yarışmacıya Hemen Ata */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider">
            3. HEMEN BİR YARIŞMACIYA ATA (İSTEĞE BAĞLI)
          </label>
          <select
            value={assignUserId}
            onChange={(e) => setAssignUserId(e.target.value)}
            className="bg-[#040917] border border-slate-700 focus:border-sky-400 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
          >
            <option value="">-- Sadece Havuza Ekle (Atama Yapma) --</option>
            {players.map((p) => (
              <option key={p.user_id} value={p.user_id} className="bg-[#071126] text-white">
                {p.full_name} {p.favorite_team ? `(${p.favorite_team})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Koyu Tablo Zemini Canlı Önizleme + Kaydet Butonu */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 bg-[#060d1f] border border-slate-800 rounded-xl px-3 py-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">ÖNİZLEME:</span>
          {logoUrl ? (
            <img src={logoUrl} alt="Önizleme" className="w-6 h-6 object-contain shrink-0" />
          ) : (
            <span className="w-6 h-6 rounded-full bg-slate-800 inline-block" />
          )}
          <span className="text-xs font-black text-white uppercase">
            {clubName.trim() || 'GAZİANTEP KALESPOR'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleSaveClub}
          disabled={saving || uploadingFile}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 border border-emerald-400/70 text-white text-xs font-black uppercase tracking-wider shadow"
        >
          {saving ? 'KAYDEDİLİYOR...' : '✓ KULÜBÜ VE ARMAYI KAYDET'}
        </button>
      </div>

      {statusMsg && (
        <div className="text-xs font-bold text-amber-300 bg-[#040917] border border-slate-800 rounded-xl px-3 py-2">
          {statusMsg}
        </div>
      )}

      {/* Eklenmiş Özel Kulüpler Listesi */}
      {customClubs.length > 0 && (
        <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2">
          {customClubs.map((c) => (
            <div
              key={c.club_name}
              className="inline-flex items-center gap-2 bg-[#040917] border border-slate-800 rounded-xl px-2.5 py-1.5"
            >
              <img src={c.logo_url} alt={c.club_name} className="w-5 h-5 object-contain shrink-0" />
              <button
                type="button"
                onClick={() => {
                  setClubName(c.club_name);
                  setLogoUrl(c.logo_url);
                }}
                title="Düzenlemek veya başka yarışmacıya atamak için tıkla"
                className="text-[11px] font-black text-white hover:text-sky-300 uppercase"
              >
                {c.club_name}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteClub(c.club_name)}
                title="Kulübü Sil"
                className="text-[10px] font-black text-rose-400 hover:text-rose-300 ml-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}