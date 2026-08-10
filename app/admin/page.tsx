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
    setScores(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: val
      }
    }));
  };

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
        { id: "262728", points: 3, cat: "TFF" }
      ]
    };

    const updatedStore = {
      ...approvedMatches,
      [matchId]: newApproval
    };

    localStorage.setItem('elitTahmin_ApprovedMatches', JSON.stringify(updatedStore));
    setApprovedMatches(updatedStore);
  };

  // 🔄 TEKİL MAÇ SIFIRLAMA
  const handleResetSingleMatch = (matchId: string) => {
    const isConfirmed = window.confirm(`Maç #${matchId} skor ve puanlarını sıfırlamak istediğinize emin misiniz?`);
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
  };

  const handleResetAll = () => {
    const isConfirmed = window.confirm("TÜM SİSTEMİ VE PUANLARI SIFIRLAMAK İSTEDİĞİNİZE EMİN MİSİNİZ?");
    if (isConfirmed) {
      localStorage.removeItem('elitTahmin_ApprovedMatches');
      setApprovedMatches({});
      setScores({});
      alert("Tüm canlı maç puanları sıfırlandı.");
    }
  };

  const adminMatches = [
    { id: '1', name: '3. HAFTA - 1. MAÇ (DFO) ★ [MASTER / DFO]', home: 'OLIMPIYAKOS', away: 'NEC NIJMEGEN', league: 'UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ' },
    { id: '2', name: '3. HAFTA - 2. MAÇ (DFO) ★ [MASTER / DFO]', home: 'SPARTA PRAG', away: 'OLIMPIC LYON', league: 'UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ' },
    { id: '3', name: '3. HAFTA - 3. MAÇ (DFO) ★ [MASTER / DFO]', home: 'USG', away: 'BODO-GLIMT', league: 'UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ' },
    { id: '4', name: '3. HAFTA - 4. MAÇ (DFO) ★ [MASTER / DFO]', home: 'FENERBAHÇE', away: 'STURM GRAZ', league: 'UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ' },
    { id: '5', name: '3. HAFTA - 5. MAÇ (DFO) ★ [MASTER / DFO]', home: 'PANATHINAIKOS', away: 'CSKA 1948', league: 'UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ' },
    { id: '6', name: '3. HAFTA - 6. MAÇ (DFO) ★ [MASTER / DFO]', home: 'PAIDE LINNAMEESKO...', away: 'RAPID WIEN', league: 'UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 text-slate-100">
      {/* ORIJINAL BAŞLIK BANNERI */}
      <div className="w-full bg-[#0d1527]/90 border border-slate-800/90 rounded-2xl p-6 mb-6 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
        <div className="text-center md:text-left z-10">
          <h1 className="text-2xl md:text-3xl font-black text-amber-400 uppercase tracking-wider flex items-center justify-center md:justify-start gap-2">
            <span>⚡</span> ADMIN TAHMİNMATİK (3. HAFTA)
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-bold mt-1">
            Skorları seçin, puanları hatasız dağıtın.
          </p>
        </div>

        <button
          onClick={handleResetAll}
          className="mt-4 md:mt-0 z-10 px-4 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-black text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg"
        >
          <span>📌</span> SİSTEMİ & PUANLARI SIFIRLA
        </button>
      </div>

      {/* ORIJINAL KART IZGARASI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {adminMatches.map((m) => {
          const isApproved = !!approvedMatches[m.id];
          const curScore = scores[m.id] || { home: '', away: '' };

          return (
            <div
              key={m.id}
              className="bg-[#0b1329]/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-4 gap-2">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wide truncate">{m.name}</span>
                  <span className="text-[9px] font-black text-slate-300 bg-slate-950 px-2 py-1 rounded-md border border-slate-800/80 whitespace-nowrap">
                    {m.league}
                  </span>
                </div>

                <div className="flex items-center justify-between my-4">
                  <span className="font-extrabold text-sm sm:text-base text-slate-100 uppercase w-2/5 text-left truncate">
                    {m.home}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <select
                      value={curScore.home}
                      onChange={(e) => handleScoreChange(m.id, 'home', e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-amber-400 font-bold text-xs px-2 py-1.5 rounded-lg outline-none cursor-pointer"
                    >
                      <option value="">-</option>
                      {[0,1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <span className="text-slate-600 font-bold text-xs">-</span>
                    <select
                      value={curScore.away}
                      onChange={(e) => handleScoreChange(m.id, 'away', e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-amber-400 font-bold text-xs px-2 py-1.5 rounded-lg outline-none cursor-pointer"
                    >
                      <option value="">-</option>
                      {[0,1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>

                  <span className="font-extrabold text-sm sm:text-base text-slate-100 uppercase w-2/5 text-right truncate">
                    {m.away}
                  </span>
                </div>

                <div className="my-4 p-3 bg-slate-950/80 border border-slate-800/60 rounded-xl">
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    TAM SKORU BİLENLER (0 KİŞİ)
                  </div>
                  <div className="text-[10px] text-slate-500 italic pl-3.5">
                    Skorları seçtiğinizde bilenler burada listelenir...
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-500">
                  Durum: <span className={isApproved ? "text-emerald-400 font-black" : "text-amber-500"}>{isApproved ? 'Tamamlandı' : 'Bekliyor'}</span>
                </span>

                <div className="flex items-center gap-2">
                  {/* SADECE MAÇ ONAYLANDIĞINDA ÇIKAN TEKİL SIFIRLAMA BUTONU */}
                  {isApproved && (
                    <button
                      onClick={() => handleResetSingleMatch(m.id)}
                      className="py-1.5 px-3 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1 shadow-md"
                    >
                      <span>🔄</span> SIFIRLA
                    </button>
                  )}

                  <button
                    onClick={() => handleApprove(m.id)}
                    className="py-1.5 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all uppercase tracking-wider"
                  >
                    ONAYLA & DAĞIT
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