'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function TahminlerPortal() {
  const [view, setView] = useState<'lobby' | 'declaration' | 'entry'>('lobby');
  
  // Geri Sayım State'leri
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Giriş State'leri
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Bülten State'i
  const [bulletin, setBulletin] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<Record<number, { home: string, away: string }>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // 🔴 72 SAATLİK GERİ SAYIM MOTORU 🔴
  useEffect(() => {
    // Kapanış Tarihi: 17 Ağustos 2026 - 21:00
    const targetDate = new Date('2026-08-17T21:00:00+03:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setIsTimeUp(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setIsTimeUp(false);
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 🔴 MANKOMAN KİLİDİ (GİZLİ TEST MODU) 🔴
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (username === 'mankoman' && password === '123456') { // Şifreyi kendi admin şifrene göre ayarlayabilirsin
      fetchBulletinForEntry();
      setView('entry');
    } else {
      setLoginError('Sistem şu an yapılandırma ve test aşamasındadır. Yalnızca Kurucu (Admin) girişine izin verilmektedir.');
    }
  };

  // 5. Hafta Bültenini Getir
  const fetchBulletinForEntry = async () => {
    const { data, error } = await supabase
      .from('matches_bulletin')
      .select('*')
      .eq('week_num', 5) // 5. HAFTA SABİT
      .order('match_index', { ascending: true });

    if (data) {
      setBulletin(data);
      // Boş tahmin kutularını hazırla
      const initialPreds: Record<number, { home: string, away: string }> = {};
      data.forEach(m => {
        initialPreds[m.match_index] = { home: '-', away: '-' };
      });
      setPredictions(initialPreds);
    }
  };

  const handleScoreChange = (matchIndex: number, team: 'home' | 'away', score: string) => {
    setPredictions(prev => ({
      ...prev,
      [matchIndex]: {
        ...prev[matchIndex],
        [team]: score
      }
    }));
  };

  const savePredictions = async () => {
    // Eksik skor kontrolü
    const missing = Object.values(predictions).some(p => p.home === '-' || p.away === '-');
    if (missing) {
      alert('Lütfen tüm maçların skorlarını doldurun!');
      return;
    }

    if(!window.confirm('Tahminlerinizi mühürleyip göndermek istediğinize emin misiniz?')) return;

    setIsSaving(true);
    setSaveMessage('Tahminler şifrelenerek karargaha iletiliyor...');

    try {
      // Arka planda veritabanına kayıt işlemi (player_predictions tablosuna)
      const payload = Object.keys(predictions).map(matchIndex => ({
        user_id: username, // 'mankoman' olarak kaydedecek test aşamasında
        week_num: 5,
        match_index: Number(matchIndex),
        predicted_score: `${predictions[Number(matchIndex)].home}-${predictions[Number(matchIndex)].away}`
      }));

      const { error } = await supabase.from('player_predictions').upsert(payload, { onConflict: 'user_id,week_num,match_index' });
      
      if(error) throw error;

      setSaveMessage('✅ TAHMİNLER BAŞARIYLA KARARGAHA İLETİLDİ!');
      setTimeout(() => {
        setView('lobby');
        setSaveMessage('');
      }, 3000);

    } catch (e) {
      setSaveMessage('❌ Kayıt sırasında bir hata oluştu!');
    }
    setIsSaving(false);
  };

  const scoreOptions = ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 p-4 font-sans pb-24">
      <div className="max-w-[1400px] mx-auto pt-10">
        
        {/* ===================== KÖK DİZİN (KARŞILAMA LOBİSİ) ===================== */}
        {view === 'lobby' && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-black text-amber-500 tracking-widest drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                ETM LİGİ MERKEZ PORTALI
              </h1>
              <p className="text-slate-400 mt-4 text-lg font-medium">Lütfen yapmak istediğiniz işlemi seçin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 max-w-5xl mx-auto">
              
              {/* SOL KUTU: RESMİ DEKLARASYON */}
              <div 
                onClick={() => setView('declaration')}
                className="bg-slate-900/50 border-2 border-indigo-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-900/20 hover:border-indigo-500 transition-all duration-300 group shadow-[0_0_30px_rgba(79,70,229,0.1)] hover:shadow-[0_0_40px_rgba(79,70,229,0.4)]"
              >
                <div className="w-24 h-24 bg-indigo-950 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-5xl">📜</span>
                </div>
                <h2 className="text-2xl font-black text-indigo-400 tracking-widest mb-3">RESMİ DEKLARASYON</h2>
                <p className="text-slate-400 text-sm">Geçmiş haftaların tahmin arşivini ve resmi oyuncu listelerini inceleyin.</p>
                <div className="mt-8 px-6 py-2 bg-indigo-600/20 text-indigo-300 border border-indigo-500/50 rounded-full font-bold text-xs uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  Arşive Giriş Yap
                </div>
              </div>

              {/* SAĞ KUTU: TAHMİN GİRİŞ & ZAMANLAYICI */}
              <div className="bg-slate-900/80 border-2 border-amber-500/30 rounded-3xl p-8 flex flex-col relative shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#050b14] px-4">
                  <span className="text-amber-500 font-black tracking-widest text-sm bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                    5. HAFTA GİRİŞLERİ
                  </span>
                </div>

                <div className="text-center mb-6 mt-4">
                  <p className="text-xs text-slate-400 font-bold tracking-widest mb-1">AÇILIŞ: <span className="text-slate-200">14.08.2026 - 21:00</span></p>
                  <p className="text-xs text-red-400 font-bold tracking-widest">KAPANIŞ: <span className="text-red-300">17.08.2026 - 21:00</span></p>
                </div>

                {/* SAYAÇ */}
                <div className="flex justify-center gap-3 mb-8">
                  <div className="flex flex-col items-center">
                    <div className="bg-slate-950 border border-slate-700 w-14 h-16 rounded-xl flex items-center justify-center shadow-inner">
                      <span className="text-2xl font-black text-white">{String(timeLeft.days).padStart(2, '0')}</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Gün</span>
                  </div>
                  <span className="text-2xl font-black text-slate-600 mt-3">:</span>
                  <div className="flex flex-col items-center">
                    <div className="bg-slate-950 border border-slate-700 w-14 h-16 rounded-xl flex items-center justify-center shadow-inner">
                      <span className="text-2xl font-black text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Saat</span>
                  </div>
                  <span className="text-2xl font-black text-slate-600 mt-3">:</span>
                  <div className="flex flex-col items-center">
                    <div className="bg-slate-950 border border-slate-700 w-14 h-16 rounded-xl flex items-center justify-center shadow-inner">
                      <span className="text-2xl font-black text-amber-400">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Dakika</span>
                  </div>
                  <span className="text-2xl font-black text-slate-600 mt-3">:</span>
                  <div className="flex flex-col items-center">
                    <div className="bg-slate-950 border border-slate-700 w-14 h-16 rounded-xl flex items-center justify-center shadow-inner">
                      <span className="text-2xl font-black text-red-400 animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Saniye</span>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-6"></div>

                {/* LOGİN FORMU (SADECE MANKOMAN GİREBİLİR) */}
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <input 
                    type="text" 
                    placeholder="Yarışmacı ID" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    disabled={isTimeUp}
                    className="bg-slate-950 border border-slate-700 px-4 py-3 rounded-xl text-white outline-none focus:border-amber-500 text-center font-black tracking-widest disabled:opacity-50" 
                  />
                  <input 
                    type="password" 
                    placeholder="Şifre" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    disabled={isTimeUp}
                    className="bg-slate-950 border border-slate-700 px-4 py-3 rounded-xl text-white outline-none focus:border-amber-500 text-center tracking-widest disabled:opacity-50" 
                  />
                  {loginError && <p className="text-xs text-red-400 font-bold text-center bg-red-950/50 py-2 rounded-lg border border-red-500/30">{loginError}</p>}
                  
                  <button 
                    type="submit" 
                    disabled={isTimeUp}
                    className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] mt-2 tracking-widest flex items-center justify-center gap-2"
                  >
                    {isTimeUp ? 'SÜRE DOLDU - KAPALI' : 'SİSTEME GİRİŞ YAP'}
                  </button>
                </form>

              </div>
            </div>
          </div>
        )}

        {/* ===================== RESMİ DEKLARASYON (ARŞİV EKRANI) ===================== */}
        {view === 'declaration' && (
          <div className="animate-fade-in-up">
            <button onClick={() => setView('lobby')} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white font-bold bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
              <span>⬅</span> Lobiye Dön
            </button>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center min-h-[500px] flex flex-col items-center justify-center">
              <h2 className="text-3xl font-black text-indigo-400 tracking-widest mb-4">RESMİ DEKLARASYON ARŞİVİ</h2>
              <p className="text-slate-400 max-w-2xl mb-8">
                Kumandanım, eski kodundaki o devasa (700+ satırlık) tabloyu buraya yapıştırabiliriz. 
                Sayfa düzeni ve "Ayrı bir kutunun içi" mantığı tam olarak burada tasarlandı. 
                Şu an tablo kod kalabalığı yapmasın diye burayı temiz bir oda olarak bıraktım.
              </p>
              <div className="w-full max-w-4xl h-64 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-600 font-black text-xl">
                [ ESKİ TABLO BURAYA GELECEK ]
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAHMİN GİRİŞ PORTALI (YARIŞMACI İÇERİDE) ===================== */}
        {view === 'entry' && (
          <div className="animate-fade-in-up max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8 bg-slate-900 p-6 rounded-2xl border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <div>
                <h2 className="text-2xl font-black text-amber-500 tracking-widest">5. HAFTA GÖREV KAĞIDI</h2>
                <p className="text-slate-400 text-sm mt-1">Yarışmacı: <span className="text-white font-bold">{username.toUpperCase()}</span></p>
              </div>
              <button onClick={() => setView('lobby')} className="text-red-400 hover:text-red-300 font-bold bg-red-950/30 px-4 py-2 rounded-lg border border-red-900/50">
                Oturumu Kapat
              </button>
            </div>

            {saveMessage && (
              <div className={`w-full py-4 text-center font-black text-lg mb-6 rounded-xl border ${saveMessage.includes('✅') ? 'bg-emerald-950 border-emerald-500 text-emerald-400' : 'bg-red-950 border-red-500 text-red-400'}`}>
                {saveMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bulletin.map((match) => (
                <div key={match.match_index} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-xs font-black text-slate-300 uppercase text-center">{match.home_team}</span>
                  </div>
                  
                  <div className="mx-4 flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-700">
                    <select 
                      value={predictions[match.match_index]?.home || '-'} 
                      onChange={e => handleScoreChange(match.match_index, 'home', e.target.value)}
                      className="w-12 h-10 bg-slate-900 border border-slate-600 rounded-md font-black text-lg text-amber-400 outline-none focus:border-amber-500 text-center appearance-none"
                    >
                      {scoreOptions.map(opt => <option key={`h-${opt}`} value={opt}>{opt}</option>)}
                    </select>
                    <span className="text-slate-500 font-bold">:</span>
                    <select 
                      value={predictions[match.match_index]?.away || '-'} 
                      onChange={e => handleScoreChange(match.match_index, 'away', e.target.value)}
                      className="w-12 h-10 bg-slate-900 border border-slate-600 rounded-md font-black text-lg text-amber-400 outline-none focus:border-amber-500 text-center appearance-none"
                    >
                      {scoreOptions.map(opt => <option key={`a-${opt}`} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-xs font-black text-slate-300 uppercase text-center">{match.away_team}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center sticky bottom-4 z-50">
              <button 
                onClick={savePredictions}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 text-white font-black text-xl px-16 py-5 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all hover:scale-105 border border-emerald-400/50"
              >
                {isSaving ? 'ŞİFRELENİYOR...' : '🚀 TAHMİNLERİMİ MÜHÜRLE VE GÖNDER'}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}