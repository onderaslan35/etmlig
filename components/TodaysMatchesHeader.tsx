'use client';

import React, { useState, useEffect } from 'react';
import week4Matches from '@/app/data/week4_matches.json';

export default function TodaysMatchesHeader() {
  const [matches, setMatches] = useState<any[]>([]);
  const [dateLabel, setDateLabel] = useState<string>('');

  useEffect(() => {
    // Bugünün Tarihini Formatlama (Örn: "09.08.2026")
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedToday = `${day}.${month}.${year}`;

    // Bugüne ait maçları filtrele
    const todays = week4Matches.filter((m) => m.date === formattedToday);

    if (todays.length > 0) {
      setMatches(todays);
      setDateLabel(todays[0].dateLabel);
    } else {
      // Eğer bugün maç yoksa (örneğin 9-10 Ağustos aralığında), en yakın gelecek maç gününü getir
      const upcoming = week4Matches.filter((m) => m.date >= formattedToday);
      if (upcoming.length > 0) {
        const nextDate = upcoming[0].date;
        const nextMatches = week4Matches.filter((m) => m.date === nextDate);
        setMatches(nextMatches);
        setDateLabel(nextMatches[0].dateLabel + " (YAKLAŞAN)");
      } else {
        // Yedek durum
        setMatches(week4Matches.slice(0, 4));
        setDateLabel("BÜLTEN MÜSABAKALARI");
      }
    }
  }, []);

  if (matches.length === 0) return null;

  return (
    <div className="w-full mb-6 bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3 px-1 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <h2 className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-wider">
            BUGÜNÜN MÜSABAKALARI ({matches.length} MAÇ)
          </h2>
        </div>
        <span className="text-[10px] sm:text-xs font-bold text-slate-300 bg-slate-950 border border-slate-800 px-2.5 py-0.5 rounded-full">
          📅 {dateLabel}
        </span>
      </div>

      {/* YATAY KAYDIRMALI KARUSEL BANT */}
      <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-slate-950">
        {matches.map((m) => (
          <div
            key={m.id}
            className="min-w-[220px] sm:min-w-[240px] flex-shrink-0 bg-slate-950/90 border border-slate-800 hover:border-amber-500/50 transition-all duration-200 rounded-xl p-3 flex flex-col justify-between shadow-md"
          >
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1.5">
              <span className="text-amber-400/90 truncate">{m.league}</span>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded text-[9px] font-black">
                ⏰ {m.time}
              </span>
            </div>

            <div className="flex items-center justify-between my-1">
              <span className="font-extrabold text-xs text-slate-100 uppercase truncate w-2/5 text-left">
                {m.home}
              </span>
              <span className="text-[9px] font-black text-slate-500 bg-slate-900 px-1 py-0.5 rounded border border-slate-800">
                VS
              </span>
              <span className="font-extrabold text-xs text-slate-100 uppercase truncate w-2/5 text-right">
                {m.away}
              </span>
            </div>

            <div className="mt-1.5 text-center text-[9px] font-bold text-slate-500 uppercase tracking-widest border-t border-slate-800/80 pt-1">
              MAÇ #{m.id}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}