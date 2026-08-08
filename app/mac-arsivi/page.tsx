'use client';

import React, { useState, useEffect } from 'react';

const defaultWeek3Matches = [
  { id: 1, home: "OLİMPİYAKOS", away: "NEC NİJMEGEN", homeCode: "OLI", awayCode: "NEC", homeScore: 2, awayScore: 1, isFinished: true, type: "DFO", matchNo: 1, date: "5 Ağustos | 20:00", league: "UEFA ŞAMPİYONLAR LİGİ" },
  { id: 2, home: "SPARTA PRAG", away: "OLİMPİC LYON", homeCode: "SPA", awayCode: "LYO", homeScore: 1, awayScore: 2, isFinished: true, type: "DFO", matchNo: 2, date: "5 Ağustos | 21:00", league: "UEFA ŞAMPİYONLAR LİGİ" },
  { id: 3, home: "USG", away: "BODO-GLİMT", homeCode: "USG", awayCode: "BOD", homeScore: 0, awayScore: 0, isFinished: true, type: "DFO", matchNo: 3, date: "5 Ağustos | 21:30", league: "UEFA ŞAMPİYONLAR LİGİ" },
  { id: 4, home: "FENERBAHÇE", away: "STURM GRAZ", homeCode: "FB", awayCode: "STU", homeScore: 3, awayScore: 1, isFinished: true, type: "DFO", matchNo: 4, date: "5 Ağustos | 22:00", league: "UEFA ŞAMPİYONLAR LİGİ" },
  { id: 5, home: "PANATHİNAİKOS", away: "CSKA 1948", homeCode: "PAO", awayCode: "CSK", homeScore: 2, awayScore: 0, isFinished: true, type: "DFO", matchNo: 5, date: "6 Ağustos | 19:00", league: "UEFA KONFERANS LİGİ" },
  { id: 6, home: "PAİDE LİNNAMEESKOND", away: "RAPİD WİEN", homeCode: "PAI", awayCode: "RAP", homeScore: 0, awayScore: 4, isFinished: true, type: "DFO", matchNo: 6, date: "6 Ağustos | 19:30", league: "UEFA KONFERANS LİGİ" },
  { id: 7, home: "HRADEC KRALOVE", away: "BEŞİKTAŞ", homeCode: "HRA", awayCode: "BJK", homeScore: 1, awayScore: 3, isFinished: true, type: "DFO", matchNo: 7, date: "6 Ağustos | 20:00", league: "UEFA AVRUPA LİGİ" },
  { id: 8, home: "DEBRECEN", away: "KOPENHAG", homeCode: "DEB", awayCode: "KOP", homeScore: 0, awayScore: 2, isFinished: true, type: "DFO", matchNo: 8, date: "6 Ağustos | 20:30", league: "UEFA KONFERANS LİGİ" },
  { id: 9, home: "DİNAMO KİEV", away: "KARABAĞ FK", homeCode: "KIE", awayCode: "KAR", homeScore: 1, awayScore: 1, isFinished: true, type: "DFO", matchNo: 9, date: "6 Ağustos | 21:00", league: "UEFA AVRUPA LİGİ" },
  { id: 10, home: "GOTEBORG", away: "GENT", homeCode: "GOT", awayCode: "GNT", homeScore: 1, awayScore: 2, isFinished: true, type: "DFO", matchNo: 10, date: "6 Ağustos | 21:00", league: "UEFA KONFERANS LİGİ" },
  { id: 11, home: "PAOK", away: "ANDERLECHT", homeCode: "PAO", awayCode: "AND", homeScore: 0, awayScore: 1, isFinished: true, type: "DFO", matchNo: 11, date: "6 Ağustos | 21:30", league: "UEFA AVRUPA LİGİ" },
  { id: 12, home: "AJAX", away: "SHELBOURNE", homeCode: "AJA", awayCode: "SHE", homeScore: 3, awayScore: 1, isFinished: true, type: "DFO", matchNo: 12, date: "6 Ağustos | 21:30", league: "UEFA KONFERANS LİGİ" },
  { id: 13, home: "BRAGA", away: "DİNAMO MİNSK", homeCode: "BRA", awayCode: "DIN", homeScore: 1, awayScore: 0, isFinished: true, type: "DFO", matchNo: 13, date: "6 Ağustos | 21:30", league: "UEFA KONFERANS LİGİ" },
  { id: 14, home: "BENFİCA", away: "HEART", homeCode: "BEN", awayCode: "HEA", homeScore: 6, awayScore: 1, isFinished: true, type: "DFO", matchNo: 14, date: "6 Ağustos | 22:00", league: "UEFA AVRUPA LİGİ" },
  { id: 15, home: "BOLUSPOR", away: "MANİSA FK", homeCode: "BOL", awayCode: "MAN", homeScore: 1, awayScore: 2, isFinished: true, type: "TFF", matchNo: 15, date: "7 Ağustos | 21:30", league: "TÜRKİYE 1.LİG" },
  { id: 16, home: "SİVASSPOR", away: "EROKSPOR", homeCode: "SİV", awayCode: "ERO", homeScore: null, awayScore: null, isFinished: false, type: "TFF", matchNo: 16, date: "8 Ağustos | 19:00", league: "TÜRKİYE 1.LİG" },
  { id: 17, home: "ÜMRANİYESPOR", away: "MARDİN 1969", homeCode: "ÜMR", awayCode: "MAR", homeScore: null, awayScore: null, isFinished: false, type: "TFF", matchNo: 17, date: "8 Ağustos | 19:00", league: "TÜRKİYE 1.LİG" },
  { id: 18, home: "ANTALYASPOR", away: "KEÇİÖRENGÜCÜ", homeCode: "ANT", awayCode: "KEÇ", homeScore: null, awayScore: null, isFinished: false, type: "TFF", matchNo: 18, date: "8 Ağustos | 21:30", league: "TÜRKİYE 1.LİG" },
  { id: 19, home: "IĞDIR FK", away: "FATİH KARAGÜMRÜK", homeCode: "IĞD", awayCode: "KAR", homeScore: null, awayScore: null, isFinished: false, type: "TFF", matchNo: 19, date: "9 Ağustos | 19:00", league: "TÜRKİYE 1.LİG" },
  { id: 20, home: "SARIYER", away: "MUĞLASPOR", homeCode: "SAR", awayCode: "MUĞ", homeScore: null, awayScore: null, isFinished: false, type: "TFF", matchNo: 20, date: "9 Ağustos | 19:00", league: "TÜRKİYE 1.LİG" },
  { id: 21, home: "BODRUMSPOR", away: "BURSASPOR", homeCode: "BOD", awayCode: "BUR", homeScore: null, awayScore: null, isFinished: false, type: "TFF", matchNo: 21, date: "9 Ağustos | 21:30", league: "TÜRKİYE 1.LİG" },
  { id: 22, home: "VANSPOR FK", away: "KAYSERİSPOR", homeCode: "VAN", awayCode: "KAY", homeScore: null, awayScore: null, isFinished: false, type: "TFF", matchNo: 22, date: "10 Ağustos | 19:00", league: "TÜRKİYE 1.LİG" },
  { id: 23, home: "PENDİKSPOR", away: "BATMAN PETROL SPOR", homeCode: "PEN", awayCode: "BAT", homeScore: null, awayScore: null, isFinished: false, type: "TFF", matchNo: 23, date: "10 Ağustos | 21:30", league: "TÜRKİYE 1.LİG" },
  { id: 24, home: "BANDIRMASPOR", away: "İSTANBULSPOR", homeCode: "BAN", awayCode: "İST", homeScore: null, awayScore: null, isFinished: false, type: "TFF", matchNo: 24, date: "10 Ağustos | 21:30", league: "TÜRKİYE 1.LİG" }
];

export default function MacArsiviPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'DFO' | 'TFF'>('ALL');

  useEffect(() => {
    const saved = localStorage.getItem('week3_matches');
    if (saved) {
      setMatches(JSON.parse(saved));
    } else {
      localStorage.setItem('week3_matches', JSON.stringify(defaultWeek3Matches));
      setMatches(defaultWeek3Matches);
    }
  }, []);

  const filteredMatches = matches.filter((m) => {
    if (selectedFilter === 'ALL') return true;
    return m.type === selectedFilter;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 text-slate-100">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-amber-400 uppercase tracking-wider">
            📂 MAÇ ARŞİVİ & FİKSTÜR
          </h1>
          <p className="text-xs text-slate-400">3. Hafta Canlı ve Tamamlanan Karşılaşmalar</p>
        </div>

        <div className="flex gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedFilter === 'ALL' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            TÜMÜ (24)
          </button>
          <button
            onClick={() => setSelectedFilter('DFO')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedFilter === 'DFO' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            DFO (14)
          </button>
          <button
            onClick={() => setSelectedFilter('TFF')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedFilter === 'TFF' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            TFF (10)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMatches.map((match) => (
          <div
            key={match.id}
            className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/60">
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                match.type === 'TFF' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-slate-950 text-amber-400 border border-slate-800'
              }`}>
                {match.league || match.type}
              </span>
              <div className="text-[11px] font-bold text-slate-400">
                <span>{match.date}</span>
                <span className="ml-2 font-black text-amber-500">{match.type} - {match.matchNo || match.id}. MAÇ</span>
              </div>
            </div>

            <div className="flex items-center justify-between my-2 px-2">
              <div className="flex-1 text-center font-extrabold text-sm md:text-base text-slate-100">
                <div className="text-xs text-slate-400 mb-0.5">{match.homeCode}</div>
                <div>{match.home}</div>
              </div>

              <div className="mx-4">
                {match.isFinished ? (
                  <div className="bg-amber-500 text-slate-950 font-black px-4 py-2 rounded-xl text-lg md:text-xl shadow-lg border border-amber-400 tracking-widest">
                    {match.homeScore} - {match.awayScore}
                  </div>
                ) : (
                  <div className="bg-amber-500/90 text-slate-950 font-black px-4 py-2 rounded-xl text-lg md:text-xl shadow-lg border border-amber-400 tracking-widest">
                    ---
                  </div>
                )}
              </div>

              <div className="flex-1 text-center font-extrabold text-sm md:text-base text-slate-100">
                <div className="text-xs text-slate-400 mb-0.5">{match.awayCode}</div>
                <div>{match.away}</div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/50 flex items-center justify-center text-[11px] text-slate-400 font-medium">
              <span>🎯 0 kişi bildi • Puan alanları gör →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}