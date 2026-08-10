'use client';

import React, { useState, useEffect } from 'react';

export default function AdminPage() {
  const [approvedMatches, setApprovedMatches] = useState<Record<string, any>>({});
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({});

  useEffect(() => {
    const store = JSON.parse(localStorage.getItem('elitTahmin_ApprovedMatches') || '{}');
    setApprovedMatches(store);
  }, []);

  const handleScoreChange = (matchId: string, team: 'home' | 'away', val: string) => {
    setScores(prev => ({ ...prev, [matchId]: { ...prev[matchId], [team]: val } }));
  };

  const handleApprove = (matchId: string) => {
    const mScores = scores[matchId];
    if (!mScores || mScores.home === '' || mScores.away === '') return;
    
    const newApproval = { matchId, homeScore: mScores.home, awayScore: mScores.away, approvedAt: new Date().toISOString() };
    const updatedStore = { ...approvedMatches, [matchId]: newApproval };
    
    localStorage.setItem('elitTahmin_ApprovedMatches', JSON.stringify(updatedStore));
    setApprovedMatches(updatedStore);
  };

  const handleResetSingleMatch = (matchId: string) => {
    const updatedStore = { ...approvedMatches };
    delete updatedStore[matchId];
    localStorage.setItem('elitTahmin_ApprovedMatches', JSON.stringify(updatedStore));
    setApprovedMatches(updatedStore);
  };

  const handleResetAll = () => {
    const isConfirmed = window.confirm("TÜM SİSTEMİ VE PUANLARI SIFIRLAMAK İSTEDİĞİNİZE EMİN MİSİNİZ?");
    if (isConfirmed) {
      localStorage.removeItem('elitTahmin_ApprovedMatches');
      localStorage.removeItem('elitTahmin_Bonuses'); // Bonusları da siliyoruz
      window.location.reload();
    }
  };

  const adminMatches = [
    { id: '1', name: '3. HAFTA - 1. MAÇ (DFO) ★ [MASTER / DFO]', home: 'OLIMPIYAKOS', away: 'NEC NIJMEGEN', league: 'UEFA ŞAMPİYONLAR LİGİ' },
    { id: '2', name: '3. HAFTA - 2. MAÇ (DFO) ★ [MASTER / DFO]', home: 'SPARTA PRAG', away: 'OLIMPIC LYON', league: 'UEFA ŞAMPİYONLAR LİGİ' },
    { id: '3', name: '3. HAFTA - 3. MAÇ (DFO) ★ [MASTER / DFO]', home: 'USG', away: 'BODO-GLIMT', league: 'UEFA ŞAMPİYONLAR LİGİ' },
    { id: '4', name: '3. HAFTA - 4. MAÇ (DFO) ★ [MASTER / DFO]', home: 'FENERBAHÇE', away: 'STURM GRAZ', league: 'UEFA ŞAMPİYONLAR LİGİ' },
    { id: '5', name: '3. HAFTA - 5. MAÇ (DFO) ★ [MASTER / DFO]', home: 'PANATHINAIKOS', away: 'CSKA 1948', league: 'UEFA KONFERANS LİGİ' },
    { id: '6', name: '3. HAFTA - 6. MAÇ (DFO) ★ [MASTER / DFO]', home: 'PAIDE LINNAMEESKO...', away: 'RAPID WIEN', league: 'UEFA KONFERANS LİGİ' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 text-slate-100">
      <div className="w-full bg-[#0d1527]/90 border border-slate-800/90 rounded-2xl p-6 mb-6 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
        <div className="text-center md:text-left z-10">
          <h1 className="text-2xl md:text-3xl font-black text-amber-400 uppercase tracking-wider flex items-center justify-center md:justify-start gap-2">
            <span>⚡</span> ADMIN TAHMİNMATİK (3. HAFTA)
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-bold mt-1">Skorları seçin, puanları hatasız dağıtın.</p>
        </div>
        <button onClick={handleResetAll} className="mt-4 md:mt-0 z-10 px-4 py-2 bg-rose-950/60 border border-rose-800/80 text-rose-300 font-black text-xs rounded-xl shadow-lg">
          <span>📌</span> SİSTEMİ & PUANLARI SIFIRLA
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {adminMatches.map((m) => {
          const isApproved = !!approvedMatches[m.id];
          const curScore = scores[m.id] || { home: '', away: '' };
          return (
            <div key={m.id} className="bg-[#0b1329]/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col">
              <div className="flex justify-between items-center mb-4"><span className="text-xs font-black text-amber-400 uppercase tracking-wide truncate">{m.name}</span><span className="text-[9px] font-black text-slate-300 bg-slate-950 px-2 py-1 rounded-md border border-slate-800/80">{m.league}</span></div>
              <div className="flex items-center justify-between my-4"><span className="font-extrabold text-sm text-slate-100 uppercase w-2/5 truncate">{m.home}</span><div className="flex items-center gap-1.5"><select value={curScore.home} onChange={(e) => handleScoreChange(m.id, 'home', e.target.value)} className="bg-slate-950 border border-slate-800 text-amber-400 font-bold text-xs p-1.5 rounded-lg">{[0,1,2,3,4,5,6,7,8,9].map(n=><option key={n} value={n}>{n}</option>)}</select><span className="text-slate-600">-</span><select value={curScore.away} onChange={(e) => handleScoreChange(m.id, 'away', e.target.value)} className="bg-slate-950 border border-slate-800 text-amber-400 font-bold text-xs p-1.5 rounded-lg">{[0,1,2,3,4,5,6,7,8,9].map(n=><option key={n} value={n}>{n}</option>)}</select></div><span className="font-extrabold text-sm text-slate-100 uppercase w-2/5 text-right truncate">{m.away}</span></div>
              <div className="mt-auto pt-3 border-t border-slate-800/80 flex items-center justify-between"><span className="text-xs font-bold text-amber-500">Durum: <span className={isApproved ? "text-emerald-400" : "text-amber-500"}>{isApproved ? 'Tamamlandı' : 'Bekliyor'}</span></span><div className="flex items-center gap-2">{isApproved && <button onClick={() => handleResetSingleMatch(m.id)} className="py-1.5 px-3 bg-rose-950/80 text-rose-300 border border-rose-800/80 font-extrabold text-xs rounded-xl">🔄 SIFIRLA</button>}<button onClick={() => handleApprove(m.id)} className="py-1.5 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl uppercase">ONAYLA & DAĞIT</button></div></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}