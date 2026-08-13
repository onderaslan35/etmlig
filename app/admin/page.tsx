'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

const week4Matches = [
  { id: 1, category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME", homeTeam: "STURM GRAZ", awayTeam: "FENERBAHÇE" },
  { id: 2, category: "UEFA SÜPER KUPA", homeTeam: "PARIS SG", awayTeam: "ASTON VILLA" },
  { id: 3, category: "UEFA KONFERANS LİGİ", homeTeam: "KARABAĞ FK", awayTeam: "DINAMO KIEV" },
  { id: 4, category: "UEFA AVRUPA LİGİ", homeTeam: "BEŞİKTAŞ", awayTeam: "HRADEC KRALOVE" },
  { id: 5, category: "TÜRKİYE SÜPER LİG", homeTeam: "GALATASARAY", awayTeam: "ÇORUM FK" },
  { id: 6, category: "TÜRKİYE 1.LİG", homeTeam: "EROKSPOR", awayTeam: "SARIYER" },
  { id: 7, category: "TÜRKİYE SÜPER LİG", homeTeam: "KASIMPAŞA", awayTeam: "TRABZONSPOR" },
  { id: 8, category: "TÜRKİYE SÜPER LİG", homeTeam: "KONYASPOR", awayTeam: "ÇAYKUR RİZE" },
  { id: 9, category: "TÜRKİYE 1.LİG", homeTeam: "FATİH KARAGÜMRÜK", awayTeam: "ÜMRANİYESPOR" },
  { id: 10, category: "TÜRKİYE 1.LİG", homeTeam: "İSTANBULSPOR", awayTeam: "BODRUMSPOR" },
  { id: 11, category: "TÜRKİYE SÜPER LİG", homeTeam: "GAZİANTEP FK", awayTeam: "ALANYASPOR" },
  { id: 12, category: "TÜRKİYE SÜPER LİG", homeTeam: "GENÇLERBİRLİĞİ", awayTeam: "FENERBAHÇE" },
  { id: 13, category: "TÜRKİYE 1.LİG", homeTeam: "BURSASPOR", awayTeam: "IĞDIR FK" },
  { id: 14, category: "TÜRKİYE 1.LİG", homeTeam: "MANİSA FK", awayTeam: "VANSPOR FK" },
  { id: 15, category: "İNGİLTERE SÜPER KUPA", homeTeam: "ARSENAL", awayTeam: "MANCHESTER CITY" },
  { id: 16, category: "TÜRKİYE SÜPER LİG", homeTeam: "BAŞAKŞEHİR", awayTeam: "KOCAELİSPOR" },
  { id: 17, category: "TÜRKİYE 1.LİG", homeTeam: "KAYSERİSPOR", awayTeam: "SİVASSPOR" },
  { id: 18, category: "TÜRKİYE SÜPER LİG", homeTeam: "AMED SPOR", awayTeam: "ERZURUMSPOR" },
  { id: 19, category: "TÜRKİYE SÜPER LİG", homeTeam: "BEŞİKTAŞ", awayTeam: "EYÜPSPOR" },
  { id: 20, category: "TÜRKİYE 1.LİG", homeTeam: "KEÇİÖRENGÜCÜ", awayTeam: "PENDİKSPOR" },
  { id: 21, category: "TÜRKİYE 1.LİG", homeTeam: "MARDİN 1969", awayTeam: "ANTALYASPOR" },
  { id: 22, category: "TÜRKİYE 1.LİG", homeTeam: "MUĞLASPOR", awayTeam: "BANDIRMASPOR" },
  { id: 23, category: "TÜRKİYE SÜPER KUPA", homeTeam: "SAMSUNSPOR", awayTeam: "GÖZTEPE" },
  { id: 24, category: "TÜRKİYE 1.LİG", homeTeam: "BATMAN PETROL SPOR", awayTeam: "BOLUSPOR" }
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [dbMatches, setDbMatches] = useState<Record<number, any>>({});
  const [localScores, setLocalScores] = useState<Record<number, { home: string, away: string }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeMessage, setActiveMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'mankoman' && password === '123456') {
      setIsAuthenticated(true);
      fetchMatches();
    } else {
      setLoginError('Hatalı yetki bilgileri!');
    }
  };

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase.from('live_matches').select('*').order('id', { ascending: true });
      if (data) {
        const map: Record<number, any> = {};
        const scores: Record<number, { home: string, away: string }> = {};
        data.forEach(match => {
          map[match.id] = match;
          scores[match.id] = { 
            home: match.home_score === '-' ? '0' : match.home_score, 
            away: match.away_score === '-' ? '0' : match.away_score 
          };
        });
        setDbMatches(map);
        setLocalScores(scores);
      }
    } catch (e) {
      console.log('Veri çekme hatası');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreChange = (id: number, type: 'home' | 'away', value: string) => {
    setLocalScores(prev => ({
      ...prev,
      [id]: { ...prev[id], [type]: value }
    }));
  };

  const updateMatchScoreOnly = async (id: number) => {
    setActiveMessage(`Maç ${id} skoru güncelleniyor...`);
    const hScore = localScores[id]?.home || '0';
    const aScore = localScores[id]?.away || '0';

    try {
      // 🔴 EKMEL MÜDAHALESİ: UPSERT KOMUTU (Veritabanında satır yoksa zorla var eder!)
      const { error } = await supabase.from('live_matches').upsert({ 
        id: id,
        home_score: hScore, 
        away_score: aScore,
        status: 'LIVE'
      });
      
      if (error) throw error;
      
      setActiveMessage(`✅ Maç ${id} skoru güncellendi!`);
      setTimeout(() => setActiveMessage(''), 2000);
      fetchMatches();
    } catch (e) {
      setActiveMessage(`❌ Güncelleme hatası`);
    }
  };

  const finalizeMatch = async (id: number, homeTeam: string, awayTeam: string) => {
    const hScore = localScores[id]?.home || '0';
    const aScore = localScores[id]?.away || '0';
    
    const isConfirmed = window.confirm(`DİKKAT: ${homeTeam} ${hScore} - ${aScore} ${awayTeam} maçını onaylıyor ve puanları dağıtıyorsunuz.\n\nEmin misiniz? Bu işlem geri alınamaz.`);
    
    if (isConfirmed) {
      setActiveMessage(`Maç ${id} onaylanıyor...`);
      try {
        // 🔴 EKMEL MÜDAHALESİ: UPSERT KOMUTU
        const { error } = await supabase.from('live_matches').upsert({ 
          id: id,
          home_score: hScore, 
          away_score: aScore,
          status: 'FINISHED' 
        });

        if (error) throw error;
        
        setActiveMessage(`✅ Maç ${id} tamamlandı ve puanlar mühürlendi!`);
        setTimeout(() => setActiveMessage(''), 3000);
        fetchMatches();
      } catch (e) {
        setActiveMessage(`❌ Onaylama hatası`);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full">
          <h1 className="text-2xl font-black text-amber-500 mb-6 text-center tracking-widest">ETML KUMANDA<br/><span className="text-sm text-slate-400 font-medium">GİZLİ KARARGAH GİRİŞİ</span></h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input type="text" placeholder="Kullanıcı Adı" value={username} onChange={e => setUsername(e.target.value)} className="bg-slate-950 border border-slate-700 px-4 py-3 rounded-xl text-white outline-none focus:border-amber-500" />
            <input type="password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)} className="bg-slate-950 border border-slate-700 px-4 py-3 rounded-xl text-white outline-none focus:border-amber-500" />
            {loginError && <span className="text-red-500 text-sm font-bold">{loginError}</span>}
            <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 rounded-xl transition-all shadow-lg mt-2 tracking-widest">SİSTEME GİRİŞ YAP</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div>
            <h1 className="text-2xl font-black text-amber-500 tracking-wider">🛠 ETML OPERASYON MERKEZİ</h1>
            <p className="text-slate-400 text-sm mt-1">Hoş geldin, <span className="text-white font-bold">{username}</span>! Otonom skor yönetimi devrede.</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            {activeMessage && <div className="text-sm font-bold text-emerald-400 animate-pulse bg-emerald-950/50 px-3 py-1.5 rounded-lg border border-emerald-800">{activeMessage}</div>}
            <button onClick={fetchMatches} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold border border-slate-600 transition-colors">🔄 Verileri Yenile</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {week4Matches.map(match => {
            const dbMatch = dbMatches[match.id];
            const status = dbMatch?.status || 'NOT_STARTED';
            const isFinished = status === 'FINISHED';

            return (
              <div key={match.id} className={`bg-slate-900 border rounded-2xl p-4 flex flex-col gap-4 shadow-lg transition-colors ${isFinished ? 'border-emerald-600/50 bg-emerald-950/10' : 'border-slate-800 hover:border-slate-600'}`}>
                
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                  <span className="text-[10px] font-black text-slate-500 bg-slate-950 px-2 py-1 rounded">MAÇ {match.id}</span>
                  {isFinished ? (
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-950/50 px-2 py-1 rounded border border-emerald-800/50">ONAYLANDI (BİTTİ)</span>
                  ) : (
                    <span className="text-[10px] font-black text-amber-500 bg-amber-950/50 px-2 py-1 rounded border border-amber-800/50">KONTROL BEKLİYOR</span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 text-right">
                    <span className="text-xs font-bold text-slate-300 block truncate">{match.homeTeam}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input type="number" min="0" max="15" value={localScores[match.id]?.home || '0'} onChange={e => handleScoreChange(match.id, 'home', e.target.value)} disabled={isFinished} className="w-12 h-10 text-center bg-slate-950 border border-slate-700 rounded-lg font-black text-lg text-white outline-none focus:border-amber-500 disabled:opacity-50" />
                    <span className="font-bold text-slate-500">-</span>
                    <input type="number" min="0" max="15" value={localScores[match.id]?.away || '0'} onChange={e => handleScoreChange(match.id, 'away', e.target.value)} disabled={isFinished} className="w-12 h-10 text-center bg-slate-950 border border-slate-700 rounded-lg font-black text-lg text-white outline-none focus:border-amber-500 disabled:opacity-50" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-xs font-bold text-slate-300 block truncate">{match.awayTeam}</span>
                  </div>
                </div>

                {!isFinished && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button onClick={() => updateMatchScoreOnly(match.id)} className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-xl border border-slate-700 transition-all shadow-md">
                      Skoru Güncelle
                    </button>
                    <button onClick={() => finalizeMatch(match.id, match.homeTeam, match.awayTeam)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-2.5 rounded-xl transition-all shadow-md">
                      Onayla ve Dağıt
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}