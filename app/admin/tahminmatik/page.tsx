'use client';

import React, { useState, useEffect } from 'react';

export default function AdminTahminmatikPage() {
  const [approvedMatches, setApprovedMatches] = useState<Record<string, any>>({});
  const [matchInputs, setMatchInputs] = useState<Record<string, { home: string; away: string }>>({});

  useEffect(() => {
    const store = JSON.parse(localStorage.getItem('elitTahmin_ApprovedMatches') || '{}');
    setApprovedMatches(store);
  }, []);

  const handleScoreChange = (matchId: string, team: 'home' | 'away', value: string) => {
    setMatchInputs(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value
      }
    }));
  };

  // MAÇI ONAYLAMA FONKSİYONU
  const handleApproveMatch = (matchId: string) => {
    const scores = matchInputs[matchId];
    if (!scores || scores.home === '' || scores.away === '') {
      alert('Lütfen geçerli bir skor giriniz!');
      return;
    }

    const newApproval = {
      matchId,
      homeScore: scores.home,
      awayScore: scores.away,
      approvedAt: new Date().toISOString(),
      // Örnek dağıtım verisi (Sistemdeki mevcut yapınıza uyumlu)
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
    alert(`Maç #${matchId} puanları başarıyla onaylandı ve işlendi!`);
  };

  // 🔄 SADECE BU TEKİL MAÇI SIFIRLAMA / İPTAL ETME FONKSİYONU
  const handleResetSingleMatch = (matchId: string) => {
    const isConfirmed = window.confirm(`Maç #${matchId} için verilmiş puanları iptal etmek ve SADECE bu maçı sıfırlamak istediğinize emin misiniz?\n(Diğer maçların puanları etkilenmeyecektir.)`);
    
    if (!isConfirmed) return;

    const updatedStore = { ...approvedMatches };
    delete updatedStore[matchId]; // Sadece seçili maçı siler

    localStorage.setItem('elitTahmin_ApprovedMatches', JSON.stringify(updatedStore));
    setApprovedMatches(updatedStore);

    // Skor giriş kutusunu da temizleyelim
    setMatchInputs(prev => {
      const updatedInputs = { ...prev };
      delete updatedInputs[matchId];
      return updatedInputs;
    });

    alert(`Maç #${matchId} puanları başarıyla iptal edildi ve tekil olarak sıfırlandı!`);
  };

  // Örnek Maç Kartı Listesi (Sisteminizdeki maçlar)
  const matchesList = [
    { id: '24', home: 'PENDİKSPOR', away: 'BATMAN PETROL SPOR', league: 'TFF 1. LİG' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 text-slate-100">
      <h1 className="text-2xl font-black text-amber-400 mb-6 text-center uppercase tracking-wider">
        TAHMİNMATİK - MAÇ ONAY VE TEKİL SIFIRLAMA PANELİ
      </h1>

      <div className="grid gap-4">
        {matchesList.map((m) => {
          const isApproved = !!approvedMatches[m.id];
          const currentInput = matchInputs[m.id] || { home: '', away: '' };

          return (
            <div
              key={m.id}
              className={`p-4 rounded-2xl border transition-all ${
                isApproved
                  ? 'bg-slate-900/90 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black text-amber-400">{m.league}</span>
                <span className="text-xs font-bold text-slate-400">MAÇ #{m.id}</span>
              </div>

              <div className="flex items-center justify-between gap-2 my-2">
                <span className="font-extrabold text-sm sm:text-base text-slate-200 w-1/3 text-right truncate">
                  {m.home}
                </span>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={currentInput.home}
                    onChange={(e) => handleScoreChange(m.id, 'home', e.target.value)}
                    placeholder="0"
                    className="w-12 h-10 text-center bg-slate-950 border border-slate-700 rounded-lg font-black text-amber-400 text-base focus:border-amber-400 outline-none"
                  />
                  <span className="font-bold text-slate-500">-</span>
                  <input
                    type="number"
                    value={currentInput.away}
                    onChange={(e) => handleScoreChange(m.id, 'away', e.target.value)}
                    placeholder="0"
                    className="w-12 h-10 text-center bg-slate-950 border border-slate-700 rounded-lg font-black text-amber-400 text-base focus:border-amber-400 outline-none"
                  />
                </div>

                <span className="font-extrabold text-sm sm:text-base text-slate-200 w-1/3 text-left truncate">
                  {m.away}
                </span>
              </div>

              {/* BUTONLAR ALANI */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleApproveMatch(m.id)}
                  className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-all uppercase tracking-wider"
                >
                  {isApproved ? '✓ GÜNCELLE VE ONAYLA' : 'MAÇI VE PUANLARI ONAYLA'}
                </button>

                {/* TEKİL SIFIRLAMA BUTONU */}
                {isApproved && (
                  <button
                    onClick={() => handleResetSingleMatch(m.id)}
                    className="py-2 px-4 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/40 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md"
                  >
                    <span>🔄</span>
                    <span>BU MAÇI SIFIRLA</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}