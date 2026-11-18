'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { normalizeClubKey, refreshCustomClubsCache } from '@/components/FavoriteTeamSelector';
import { syncThemeCustomClubs } from '@/utils/themeEngine';

interface CustomClubRow {
  club_name: string;
  logo_url: string;
  is_selectable?: boolean;
}

interface OfficialPlayerItem {
  user_id: string;
  full_name: string;
  favorite_team?: string;
}

export default function CustomClubFactory() {
  const [clubName, setClubName] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [isSelectable, setIsSelectable] = useState<boolean>(true);
  const [assignUserId, setAssignUserId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlySelectableFilter, setOnlySelectableFilter] = useState<boolean>(false);

  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  const [customClubs, setCustomClubs] = useState<CustomClubRow[]>([]);
  const [players, setPlayers] = useState<OfficialPlayerItem[]>([]);

  const loadData = async () => {
    const [clubsRes, playersRes] = await Promise.all([
      supabase
        .from('etml_custom_clubs')
        .select('club_name, logo_url, is_selectable')
        .order('club_name', { ascending: true }),
      supabase
        .from('etml_official_players')
        .select('user_id, full_name, favorite_team, is_active')
        .order('full_name', { ascending: true })
    ]);

    const clubRows = (clubsRes.data || []) as CustomClubRow[];
    setCustomClubs(clubRows);

    // Hem FavoriteTeamSelector hem themeEngine önbelleğini anında tazele
    await refreshCustomClubsCache();
    syncThemeCustomClubs(clubRows);

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

  // Türkçe/ASCII duyarsız hızlı arama ve filtreleme
  const filteredClubs = useMemo(() => {
    const qNorm = normalizeClubKey(searchQuery);
    return customClubs.filter((c) => {
      if (onlySelectableFilter && c.is_selectable === false) return false;
      if (!qNorm) return true;
      return normalizeClubKey(c.club_name).includes(qNorm);
    });
  }, [customClubs, searchQuery, onlySelectableFilter]);

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

  const handleSelectClubForEdit = (club: CustomClubRow) => {
    setClubName(club.club_name);
    setLogoUrl(club.logo_url);
    setIsSelectable(club.is_selectable !== false);
    setStatusMsg(`✏️ "${club.club_name}" düzenleme moduna alındı. Yeni linki yapıştırıp kaydedebilirsin.`);
  };

  const handleClearForm = () => {
    setClubName('');
    setLogoUrl('');
    setIsSelectable(true);
    setAssignUserId('');
    setStatusMsg('');
  };

  const handleSaveClub = async () => {
    const cleanClub = clubName.trim().toLocaleUpperCase('tr-TR');
    const cleanUrl = logoUrl.trim();

    if (!cleanClub || !cleanUrl) {
      setStatusMsg('⚠️ Lütfen hem kulüp adını hem de logo linkini/dosyasını girin.');
      return;
    }

    // Eğer bir yarışmacıya atanıyorsa seçilebilir olması mantıklıdır
    const finalSelectable = assignUserId ? true : isSelectable;

    setSaving(true);
    setStatusMsg('');
    try {
      const { error } = await supabase.from('etml_custom_clubs').upsert(
        {
          club_name: cleanClub,
          logo_url: cleanUrl,
          is_selectable: finalSelectable,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'club_name' }
      );
      if (error) throw error;

      if (assignUserId) {
        await supabase
          .from('etml_official_players')
          .update({ favorite_team: cleanClub })
          .eq('user_id', assignUserId);
      }

      await loadData();
      setClubName('');
      setLogoUrl('');
      setIsSelectable(true);
      setAssignUserId('');
      setStatusMsg(
        assignUserId
          ? `✅ ${cleanClub} arması kaydedildi ve seçili yarışmacıya atandı!`
          : `✅ ${cleanClub} arması başarıyla güncellendi / eklendi!`
      );
    } catch (err: any) {
      setStatusMsg('❌ Kayıt hatası: ' + (err?.message || 'Bilinmeyen hata'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClub = async (targetClub: string) => {
    if (!window.confirm(`${targetClub} kulübünü veritabanından silmek istediğine emin misin?`)) return;
    await supabase.from('etml_custom_clubs').delete().eq('club_name', targetClub);
    await loadData();
    setStatusMsg(`🗑️ ${targetClub} listeden silindi.`);
  };

  return (
    <div className="bg-[#071126] border border-sky-500/40 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-lg my-4">
      {/* ÜST BAŞLIK */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div>
          <h2 className="text-xs sm:text-sm font-black text-sky-200 uppercase tracking-wider">
            🛡️ KULÜP VE ARMA FABRİKASI (EKLE / KIRIK LOGO DÜZELT / ATA)
          </h2>
          <p className="text-[10.5px] text-slate-400 font-semibold mt-0.5">
            Aşağıdan kulüp aratıp kırık FotMob linkini güncelleyebilir veya yeni kulüp ekleyebilirsiniz (`git push` gerekmez).
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-sky-950 border border-sky-500/40 text-[10px] font-black text-sky-300">
          TOPLAM {customClubs.length} KULÜP KASADA
        </span>
      </div>

      {/* FORM ALANI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 1. Kulüp Adı */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider">
            1. KULÜP ADI (BÜLTENDEKİ / API-SPORTS İSMİ)
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
            2. FOTMOB / PNG LİNKİ VEYA DOSYA SEÇ
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="https://images.fotmob.com/..."
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

        {/* 3. Yarışmacıya Hemen Ata */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider">
            3. YARIŞMACIYA ATA (İSTEĞE BAĞLI)
          </label>
          <select
            value={assignUserId}
            onChange={(e) => setAssignUserId(e.target.value)}
            className="bg-[#040917] border border-slate-700 focus:border-sky-400 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
          >
            <option value="">-- Atama Yapma (Sadece Logoyu Kaydet) --</option>
            {players.map((p) => (
              <option key={p.user_id} value={p.user_id} className="bg-[#071126] text-white">
                {p.full_name} {p.favorite_team ? `(${p.favorite_team})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ÖNİZLEME + SEÇİLEBİLİRLİK AYARI + KAYDET BUTONU */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#060d1f] border border-slate-800 rounded-xl px-3 py-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">ÖNİZLEME:</span>
            {logoUrl ? (
              <img src={logoUrl} alt="Önizleme" className="w-7 h-7 object-contain shrink-0" />
            ) : (
              <span className="w-7 h-7 rounded-full bg-slate-800 inline-block" />
            )}
            <span className="text-xs font-black text-white uppercase">
              {clubName.trim() || 'KULÜP ADI'}
            </span>
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none bg-[#040917] border border-slate-800 rounded-xl px-3 py-2">
            <input
              type="checkbox"
              checked={assignUserId ? true : isSelectable}
              onChange={(e) => setIsSelectable(e.target.checked)}
              className="w-3.5 h-3.5 accent-sky-500 rounded cursor-pointer"
            />
            <span className="text-[10.5px] font-bold text-slate-300">
              Yarışmacı "Takım Armam" listesinde de görünsün
            </span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          {(clubName || logoUrl) && (
            <button
              type="button"
              onClick={handleClearForm}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-[11px] font-black uppercase"
            >
              TEMİZLE
            </button>
          )}
          <button
            type="button"
            onClick={handleSaveClub}
            disabled={saving || uploadingFile}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 border border-emerald-400/70 text-white text-xs font-black uppercase tracking-wider shadow"
          >
            {saving ? 'KAYDEDİLİYOR...' : '✓ KULÜBÜ / LOGOYU KAYDET'}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="text-xs font-bold text-amber-300 bg-[#040917] border border-slate-800 rounded-xl px-3 py-2">
          {statusMsg}
        </div>
      )}

      {/* ===================== HIZLI ARAMA VE KULÜP LİSTESİ ===================== */}
      <div className="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="🔍 350+ kulüp içinde ara (Örn: BİTLİS, KARŞIYAKA, BODO, GAZİANTEP...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#040917] border border-slate-700 focus:border-sky-400 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-white outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-black"
                title="Aramayı Temizle"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlySelectableFilter((prev) => !prev)}
              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-colors ${
                onlySelectableFilter
                  ? 'bg-amber-600/90 text-white border-amber-300'
                  : 'bg-[#040917] text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {onlySelectableFilter ? '★ SADECE ÖZEL KULÜPLER' : 'TÜMÜNÜ GÖSTER'}
            </button>
            <span className="text-[10.5px] font-black text-slate-400">
              {filteredClubs.length} sonuç
            </span>
          </div>
        </div>

        {/* Kaydırmalı Kompakt Kulüp Kutusu (Sayfayı uzatmaz) */}
        <div className="max-h-56 overflow-y-auto pr-1 flex flex-wrap gap-1.5 bg-[#040917]/70 border border-slate-800/90 rounded-xl p-2.5">
          {filteredClubs.length === 0 ? (
            <div className="w-full py-6 text-center text-[11px] font-bold text-slate-400">
              Aranan isme uygun kulüp bulunamadı. Yukarıdaki kutudan doğrudan yeni olarak ekleyebilirsin.
            </div>
          ) : (
            filteredClubs.map((c) => (
              <div
                key={c.club_name}
                className={`inline-flex items-center gap-2 rounded-xl px-2.5 py-1.5 border transition-colors ${
                  c.is_selectable !== false
                    ? 'bg-sky-950/40 border-sky-500/40'
                    : 'bg-[#071126] border-slate-800'
                }`}
              >
                <img
                  src={c.logo_url}
                  alt={c.club_name}
                  className="w-5 h-5 object-contain shrink-0"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => handleSelectClubForEdit(c)}
                  title="Logoyu düzenlemek veya yarışmacıya atamak için tıkla"
                  className="text-[10.5px] font-black text-white hover:text-amber-300 uppercase"
                >
                  {c.club_name}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteClub(c.club_name)}
                  title="Kulübü Sil"
                  className="text-[10px] font-black text-rose-400 hover:text-rose-300 ml-0.5"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}