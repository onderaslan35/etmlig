'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

// KOMUTANIN KESİN TFF LİSTESİ
const TFF_CATEGORIES = [
  "TÜRKİYE SÜPER LİG",
  "TÜRKİYE 1.LİG",
  "TÜRKİYE KUPASI",
  "TÜRKİYE SÜPER KUPA",
  "TÜRKİYE KADINLAR SÜPER LİG"
];

// KOMUTANIN VERDİĞİ TÜM KATEGORİLER (A-Z Sıralı)
const CATEGORIES = [
  ...TFF_CATEGORIES,
  "BUNDESLIGA", "COPA DEL REY", "COPPA ITALIA", "COUPE DE FRANCE", "DFB POKAL", 
  "EREDIVISIE", "FA CUP", "FIFA DÜNYA KUPASI", "LA LIGA", "LIGUE 1", "PORTEKİZ LİGİ", 
  "PREMIER LEAGUE", "SCOTTISH PREMIER LEAGUE", "SERIE A", 
  "UEFA AVRUPA LİGİ GURUP AŞAMASI", "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR İLK MAÇ", "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ", 
  "UEFA A.L. ÖN ELEME 3.TUR İLK MAÇ", "UEFA A.L. ÖN ELEME 3.TUR RÖVANŞ", "UEFA A.L. PLAY OFF İLK MAÇ", "UEFA A.L. PLAY OFF RÖVANŞ", 
  "UEFA AVRUPA ULUSLAR LİGİ", "UEFA KADINLAR ŞAMPİYONLAR LİGİ", 
  "UEFA KONFERANS LİGİ GURUP AŞAMASI", "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ", "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ", 
  "UEFA K.L. ÖN ELEME 3.TUR İLK MAÇ", "UEFA K.L. ÖN ELEME 3.TUR RÖVANŞ", "UEFA K.L. PLAY OFF İLK MAÇ", "UEFA K.L. PLAY OFF RÖVANŞ", 
  "UEFA ŞAMPİYONLAR LİGİ GURUP AŞAMASI", "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR İLK MAÇ", "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ", 
  "UEFA Ş.L. ÖN ELEME 3.TUR İLK MAÇ", "UEFA Ş.L. ÖN ELEME 3.TUR RÖVANŞ", "UEFA Ş.L. PLAY OFF İLK MAÇ", "UEFA Ş.L. PLAY OFF RÖVANŞ", 
  "İNGİLTERE SÜPER KUPA"
].sort((a, b) => a.localeCompare(b, 'tr'));

// OTOMATİK SAAT ÜRETİCİSİ (12:00'dan 23:45'e kadar 15dk aralıklarla)
const TIME_OPTIONS = [];
for (let h = 12; h <= 23; h++) {
  for (let m = 0; m < 60; m += 15) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

// DİNAMİK TARİH HESAPLAYICI (5. Hafta = 18 Ağustos Başlangıç)
const getDatesForWeek = (weekNum: number) => {
  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const baseDate = new Date(2026, 7, 18); // 18 Ağustos 2026
  const dayOffset = (weekNum - 5) * 7;
  baseDate.setDate(baseDate.getDate() + dayOffset);
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    dates.push(`${d.getDate()} ${monthNames[d.getMonth()]}`);
  }
  return dates;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'RADAR' | 'BULLETIN'>('BULLETIN');
  const [dbTeams, setDbTeams] = useState<any[]>([]);
  const [bulletinWeek, setBulletinWeek] = useState<number>(5);
  const [isSaving, setIsSaving] = useState(false);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);

  // Bülten Formu (24 Maçlık Dev Liste)
  const [bulletinForm, setBulletinForm] = useState(
    Array.from({ length: 24 }).map((_, i) => ({
      match_index: i + 1,
      category: '',
      match_date: '',
      match_time: '',
      home_team: '',
      away_team: ''
    }))
  );

  // Sayfa açıldığında takımları ve canlı maçları çek
  useEffect(() => {
    fetchTeams();
    fetchLiveMatches();
  }, []);

  // Hafta değiştiğinde o haftanın bültenini yükle
  useEffect(() => {
    loadBulletin();
  }, [bulletinWeek]);

  // SUPABASE'DEN TAKIMLARI ÇEKME
  const fetchTeams = async () => {
    const { data } = await supabase.from('teams').select('*').order('name');
    if (data) setDbTeams(data);
  };

  const fetchLiveMatches = async () => {
    const { data } = await supabase.from('live_matches').select('*').order('id');
    if (data) setLiveMatches(data);
  };

  const loadBulletin = async () => {
    const { data } = await supabase.from('matches_bulletin').select('*').eq('week_num', bulletinWeek);
    if (data && data.length > 0) {
      const newForm = [...bulletinForm];
      data.forEach(dbMatch => {
        const idx = dbMatch.match_index - 1;
        if (newForm[idx]) {
          newForm[idx].category = dbMatch.category || '';
          newForm[idx].match_date = dbMatch.match_date || '';
          newForm[idx].match_time = dbMatch.match_time || '';
          newForm[idx].home_team = dbMatch.home_team || '';
          newForm[idx].away_team = dbMatch.away_team || '';
        }
      });
      setBulletinForm(newForm);
    } else {
      // O haftaya ait veri yoksa formu sıfırla
      setBulletinForm(Array.from({ length: 24 }).map((_, i) => ({
        match_index: i + 1, category: '', match_date: '', match_time: '', home_team: '', away_team: ''
      })));
    }
  };

  const updateBulletinField = (index: number, field: string, value: string) => {
    const newForm = [...bulletinForm];
    newForm[index] = { ...newForm[index], [field]: value };
    setBulletinForm(newForm);
  };

  // BÜLTENİ SUPABASE'E KAYDETME MOTORU
  const saveBulletin = async () => {
    setIsSaving(true);
    try {
      const upsertData = bulletinForm.map(match => {
        // Seçilen takımların logolarını dbTeams içinden otomatik buluyoruz!
        const homeTeamObj = dbTeams.find(t => t.name === match.home_team);
        const awayTeamObj = dbTeams.find(t => t.name === match.away_team);
        
        return {
          week_num: bulletinWeek,
          match_index: match.match_index,
          category: match.category,
          match_date: match.match_date,
          match_time: match.match_time,
          home_team: match.home_team,
          away_team: match.away_team,
          home_logo: homeTeamObj ? homeTeamObj.logo_url : 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png',
          away_logo: awayTeamObj ? awayTeamObj.logo_url : 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png',
          is_tff: TFF_CATEGORIES.includes(match.category)
        };
      });

      const { error } = await supabase.from('matches_bulletin').upsert(upsertData, { onConflict: 'week_num,match_index' });
      if (error) throw error;
      alert(`✅ ${bulletinWeek}. Hafta Bülteni Başarıyla Kaydedildi Komutanım!`);
    } catch (err) {
      alert("Hata oluştu: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const updateLiveMatch = async (id: number, field: string, value: string) => {
    await supabase.from('live_matches').update({ [field]: value }).eq('id', id);
    fetchLiveMatches();
  };

  const currentDates = getDatesForWeek(bulletinWeek);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
            ETML KONTROL MERKEZİ
          </h1>
          <p className="text-slate-400 text-sm font-semibold tracking-widest uppercase">Admin Paneli V2.0 - Supabase Entegreli</p>
        </div>

        {/* SEKME MENÜSÜ */}
        <div className="flex justify-center gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('RADAR')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'RADAR' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-[#0f172a] text-slate-400 hover:bg-[#1e293b]'}`}
          >
            🔴 CANLI YAYIN & RADAR
          </button>
          <button 
            onClick={() => setActiveTab('BULLETIN')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'BULLETIN' ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-[#0f172a] text-slate-400 hover:bg-[#1e293b]'}`}
          >
            📝 BÜLTEN & ARŞİV MERKEZİ
          </button>
        </div>

        {/* BÜLTEN & ARŞİV SEKME İÇERİĞİ */}
        {activeTab === 'BULLETIN' && (
          <div className="bg-[#0a0f1c] p-6 rounded-2xl border border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h2 className="text-2xl font-bold text-emerald-400">Haftalık Maç Bülteni Oluşturucu</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-400">HAFTA SEÇ:</span>
                <select 
                  value={bulletinWeek} 
                  onChange={(e) => setBulletinWeek(Number(e.target.value))}
                  className="bg-[#0f172a] border border-emerald-700/50 text-emerald-400 font-bold py-2 px-4 rounded-lg focus:outline-none focus:border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                >
                  {[4, 5, 6, 7, 8, 9, 10].map(w => <option key={w} value={w}>{w}. Hafta</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {bulletinForm.map((match, i) => (
                <div key={i} className="bg-[#0f172a] p-4 rounded-xl border border-slate-700/50 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-slate-700 group-hover:bg-emerald-500 transition-colors"></div>
                  <h3 className="text-xs font-black text-slate-500 mb-3 ml-2">MAÇ {i + 1}</h3>
                  
                  <div className="space-y-3 pl-2">
                    
                    {/* KATEGORİ DROPDOWN */}
                    <select 
                      value={match.category} 
                      onChange={e => updateBulletinField(i, 'category', e.target.value)}
                      className="w-full bg-[#1e293b] border border-slate-600 rounded p-2 text-xs font-semibold text-slate-200 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Kategori Seç (Zorunlu Değil)</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <div className="flex gap-2">
                      {/* TARİH DROPDOWN (Dinamik) */}
                      <select 
                        value={match.match_date} 
                        onChange={e => updateBulletinField(i, 'match_date', e.target.value)}
                        className="flex-1 bg-[#1e293b] border border-slate-600 rounded p-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="">Tarih</option>
                        {currentDates.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      
                      {/* SAAT DROPDOWN (Dinamik) */}
                      <select 
                        value={match.match_time} 
                        onChange={e => updateBulletinField(i, 'match_time', e.target.value)}
                        className="w-24 bg-[#1e293b] border border-slate-600 rounded p-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="">Saat</option>
                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="flex gap-2">
                      {/* EV SAHİBİ (Supabase'den Geliyor) */}
                      <select 
                        value={match.home_team} 
                        onChange={e => updateBulletinField(i, 'home_team', e.target.value)}
                        className="flex-1 bg-[#1e293b] border border-slate-600 rounded p-2 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="">Ev Sahibi</option>
                        {dbTeams.map(t => <option key={`h-${i}-${t.id}`} value={t.name}>{t.name}</option>)}
                      </select>

                      <div className="flex items-center justify-center text-slate-500 font-black text-xs px-1">VS</div>

                      {/* DEPLASMAN (Supabase'den Geliyor) */}
                      <select 
                        value={match.away_team} 
                        onChange={e => updateBulletinField(i, 'away_team', e.target.value)}
                        className="flex-1 bg-[#1e293b] border border-slate-600 rounded p-2 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="">Deplasman</option>
                        {dbTeams.map(t => <option key={`a-${i}-${t.id}`} value={t.name}>{t.name}</option>)}
                      </select>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={saveBulletin}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg py-4 px-12 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? '⏳ KAYDEDİLİYOR...' : '🚀 BÜLTENİ SUPABASE\'E KAYDET'}
              </button>
            </div>
          </div>
        )}

        {/* CANLI YAYIN & RADAR SEKME İÇERİĞİ */}
        {activeTab === 'RADAR' && (
          <div className="bg-[#0a0f1c] p-6 rounded-2xl border border-slate-800">
            <h2 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-2">
              <span className="animate-pulse">🔴</span> Canlı Maç Yönetimi (ID 501-524)
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0f172a] text-slate-400 text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Ev Sahibi</th>
                    <th className="p-3 text-center">Skor</th>
                    <th className="p-3">Deplasman</th>
                    <th className="p-3">Statü</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {liveMatches.map(match => (
                    <tr key={match.id} className="hover:bg-[#0f172a]/50">
                      <td className="p-3 font-mono text-slate-500">{match.id}</td>
                      <td className="p-3 font-bold">{match.home_team}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1 bg-[#0f172a] rounded p-1 w-max mx-auto">
                          <input 
                            className="w-10 text-center bg-transparent text-white font-bold focus:outline-none focus:bg-slate-800 rounded" 
                            value={match.home_score}
                            onChange={(e) => updateLiveMatch(match.id, 'home_score', e.target.value)}
                          />
                          <span className="text-slate-500">-</span>
                          <input 
                            className="w-10 text-center bg-transparent text-white font-bold focus:outline-none focus:bg-slate-800 rounded" 
                            value={match.away_score}
                            onChange={(e) => updateLiveMatch(match.id, 'away_score', e.target.value)}
                          />
                        </div>
                      </td>
                      <td className="p-3 font-bold">{match.away_team}</td>
                      <td className="p-3">
                        <select 
                          className="bg-[#0f172a] border border-slate-700 rounded p-1 text-xs font-semibold focus:outline-none"
                          value={match.status}
                          onChange={(e) => updateLiveMatch(match.id, 'status', e.target.value)}
                        >
                          <option value="NOT_STARTED">BAŞLAMADI</option>
                          <option value="LIVE">🔴 CANLI</option>
                          <option value="WAITING_APPROVAL">ONAY BEKLİYOR</option>
                          <option value="FINISHED">BİTTİ</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}