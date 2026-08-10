'use client';

import React, { useState, useEffect } from 'react';

export default function AdminMainPage() {
  const [approvedMatches, setApprovedMatches] = useState<Record<string, any>>({});
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({});

  useEffect(() => {
    const store = JSON.parse(localStorage.getItem('elitTahmin_ApprovedMatches') || '{}');
    setApprovedMatches(store);
  }, []);

  const handleScoreChange = (matchId: string, team: 'home' | 'away', val: string) => {
    setScores(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: val
      }
    }));
  };

  // MAÇI ONAYLAMA FONKSİYONU
  const handleApprove = (matchId: string) => {
    const mScores = scores[matchId];
    if (!mScores || mScores.home === '' || mScores.away === '') {
      alert('Lütfen geçerli bir skor seçiniz!');
      return;
    }

    const newApproval = {
      matchId,
      homeScore: mScores.home,
      awayScore: mScores.away,
      approvedAt: new Date().toISOString(),
      allocations: [
        { id: "262728", points: 3, cat: "TFF" } // Örnek puan dağıtımı
      ]
    };

    const updatedStore = {
      ...approvedMatches,
      [matchId]: newApproval
    };

    localStorage.setItem('elitTahmin_ApprovedMatches', JSON.stringify(updatedStore));
    setApprovedMatches(updatedStore);
    alert(`Maç #${matchId} onaylandı ve puanlar işlendi!`);
  };

  // 🔄 TEKİL MAÇ SIFIRLAMA / İPTAL ETME FONKSİYONU
  const handleResetSingleMatch = (matchId: string) => {
    const isConfirmed = window.confirm(`Maç #${matchId} için verilmiş puanları iptal etmek ve SADECE bu maçı sıfırlamak istediğinize emin misiniz?`);
    if (!isConfirmed) return;

    const updatedStore = { ...approvedMatches };
    delete updatedStore[matchId];

    localStorage.setItem('elitTahmin_ApprovedMatches', JSON.stringify(updatedStore));
    setApprovedMatches(updatedStore);

    setScores(prev => {
      const updated = { ...prev };
      delete updated[matchId];
      return updated;
    });

    alert(`Maç #${matchId} puanları başarıyla iptal edildi ve tekil olarak sıfırlandı!`);
  };

  const adminMatches = [
    { id: '19', name: '3. HAFTA - 19. MAÇ (TFF) 📌 [TFF LİGİ]', home: 'ANTALYASPOR', away: 'KEÇİÖRENGÜCÜ', league: 'TÜRKİYE 1.LİG' },
    { id: '20', name: '3. HAFTA - 20. MAÇ (TFF) 📌 [TFF LİGİ]', home: 'IĞDIR FK', away: 'FATİH KARAGÜMRÜK', league: 'TÜRKİYE 1.LİG' },
    { id: '21', name: '3. HAFTA - 21. MAÇ (TFF) 📌 [TFF LİGİ]', home: 'SARIYER', away: 'MUĞLASPOR', league: 'TÜRKİYE 1.LİG' },
    { id: '22', name: '3. HAFTA - 22. MAÇ (TFF) 📌 [TFF LİGİ]', home: 'BODRUMSPOR', away: 'BURSASPOR', league: 'TÜRKİYE 1.LİG' },
    { id: '23', name: '3. HAFTA - 23. MAÇ (TFF) 📌 [TFF LİGİ]', home: 'VANSPOR FK', away: 'KAYSERİSPOR', league: 'TÜRKİYE 1.LİG' },
    { id: '24', name: '3. HAFTA - 24. MAÇ (TFF) 📌 [TFF LİGİ]', home: 'PENDİKSPOR', away: 'BATMAN PETROL SPOR', league: 'TÜRKİYE 1.LİG' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 text-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adminMatches.map((m) => {
          const isApproved = !!approvedMatches[m.id];
          const curScore = scores[m.id] || { home: '', away: '' };

          return (
            <div
              key={m.id}
              className={`p-4 rounded-2xl border transition-all ${
                isApproved
                  ? 'bg-slate-900/90 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black text-sky-400">{m.name}</span>
                <span className="text-[10px] font-bold text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {m.league}
                </span>
              </div>

              <div className="flex items-center justify-between my-3">
                <span className="font-extrabold text-sm sm:text-base text-slate-100 w-2/5 text-left truncate">
                  {m.home}
                </span>

                <div className="flex items-center gap-1">
                  <select
                    value={curScore.home}
                    onChange={(e) => handleScoreChange(m.id, 'home', e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-amber-400 font-bold text-xs p-1 rounded"
                  >
                    <option value="">-</option>
                    {[0,1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <span className="text-slate-500 font-bold text-xs">-</span>
                  <select
                    value={curScore.away}
                    onChange={(e) => handleScoreChange(m.id, 'away', e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-amber-400 font-bold text-xs p-1 rounded"
                  >
                    <option value="">-</option>
                    {[0,1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <span className="font-extrabold text-sm sm:text-base text-slate-100 w-2/5 text-right truncate">
                  {m.away}
                </span>
              </div>

              <div className="text-[11px] font-bold text-amber-500 my-2">
                ● TAM SKORU BİLENLER (0 KİŞİ)
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className={`text-xs font-bold ${isApproved ? 'text-emerald-400' : 'text-amber-500'}`}>
                  Durum: {isApproved ? 'Tamamlandı' : 'Bekliyor'}
                </span>

                <div className="flex items-center gap-2">
                  {isApproved && (
                    <button
                      onClick={() => handleResetSingleMatch(m.id)}
                      className="py-1.5 px-3 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/40 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1 shadow-md"
                    >
                      <span>🔄</span>
                      <span>SIFIRLA</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleApprove(m.id)}
                    className="py-1.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all uppercase tracking-wider"
                  >
                    {isApproved ? 'GÜNCELLE' : 'ONAYLA & DAĞIT'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}