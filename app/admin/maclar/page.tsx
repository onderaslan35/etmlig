'use client';

import React, { useState, useEffect } from 'react';

export default function AdminMaclarPage() {
  const [selectedWeek, setSelectedWeek] = useState<number>(3);
  const [matchId, setMatchId] = useState<number>(16);
  const [homeScore, setHomeScore] = useState<string>('');
  const [awayScore, setAwayScore] = useState<string>('');
  const [matchType, setMatchType] = useState<string>('TFF');
  const [savedStatus, setSavedStatus] = useState<boolean>(false);
  const [allMatches, setAllMatches] = useState<any[]>([]);

  useEffect(() => {
    const localData = localStorage.getItem(`week${selectedWeek}_matches`);
    if (localData) {
      setAllMatches(JSON.parse(localData));
    }
  }, [selectedWeek]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeScore === '' || awayScore === '') return;

    const storageKey = `week${selectedWeek}_matches`;
    const currentData = localStorage.getItem(storageKey);
    let matchArray = currentData ? JSON.parse(currentData) : [];

    const updatedArray = matchArray.map((m: any) => {
      if (m.id === matchId || m.matchNo === matchId) {
        return {
          ...m,
          homeScore: Number(homeScore),
          awayScore: Number(awayScore),
          isFinished: true,
          type: matchType,
        };
      }
      return m;
    });

    localStorage.setItem(storageKey, JSON.stringify(updatedArray));
    setAllMatches(updatedArray);

    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 3000);
    setHomeScore('');
    setAwayScore('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-slate-100">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-amber-400 uppercase tracking-wider">
            ⚡ ANLIK MAÇ & SKOR YÖNETİMİ
          </h1>
          <p className="text-xs text-slate-400">Biten maçı girin, sitede anında canlı yayınlansın.</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold animate-pulse">
          ● CANLI SİSTEM AKTİF
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Hafta Seçimi</label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {Array.from({ length: 48 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  {w}. Hafta
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Maç Sırası (1-24)</label>
            <input
              type="number"
              min="1"
              max="24"
              value={matchId}
              onChange={(e) => setMatchId(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Kategori / Lig Tipi</label>
            <select
              value={matchType}
              onChange={(e) => setMatchType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="DFO">DFO (Dünya Futbol Org.)</option>
              <option value="TFF">TFF (Türkiye Futbol Org.)</option>
            </select>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ev Sahibi Skor</label>
            <input
              type="number"
              placeholder="0"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 focus:outline-none focus:border-amber-500 text-center text-xl font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Deplasman Skor</label>
            <input
              type="number"
              placeholder="0"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 focus:outline-none focus:border-amber-500 text-center text-xl font-bold"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl transition-all shadow-lg uppercase tracking-wider text-sm mt-4 cursor-pointer"
        >
          🚀 SKORU VE BİLGİLERİ ANINDA YAYINLA
        </button>

        {savedStatus && (
          <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-400 p-3 rounded-xl text-center text-xs font-bold animate-fade-in">
            ✅ {selectedWeek}. Hafta {matchId}. Maç skoru başarıyla güncellendi ve canlıya alındı!
          </div>
        )}
      </form>
    </div>
  );
}