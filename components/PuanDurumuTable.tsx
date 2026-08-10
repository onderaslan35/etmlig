'use client';

import React, { useEffect, useState } from 'react';

interface PuanDurumuTableProps {
  data: any[];
  leagueTitle: string;
}

export default function PuanDurumuTable({ data, leagueTitle }: PuanDurumuTableProps) {
  const [tableRows, setTableRows] = useState<any[]>([]);

  useEffect(() => {
    // Admin panelinden gelen onaylanmış canlı maç puanlarını yükle
    const approvedMatches = JSON.parse(localStorage.getItem('elitTahmin_ApprovedMatches') || '{}');

    // Her yarışmacı için ek puan haritası oluştur
    const extraPointsMap: Record<string, number> = {};

    Object.values(approvedMatches).forEach((matchObj: any) => {
      if (matchObj && matchObj.allocations) {
        matchObj.allocations.forEach((alloc: any) => {
          const isMaster = leagueTitle.toUpperCase().includes('MASTER');
          const isTff = leagueTitle.toUpperCase().includes('TFF') && alloc.cat === 'TFF';
          const isDfo = leagueTitle.toUpperCase().includes('DFO') && alloc.cat === 'DFO';

          if (isMaster || isTff || isDfo) {
            extraPointsMap[alloc.id] = (extraPointsMap[alloc.id] || 0) + alloc.points;
            // İsim eşleşmesine göre ek puan tanımı
            extraPointsMap[alloc.name] = (extraPointsMap[alloc.name] || 0) + alloc.points;
          }
        });
      }
    });

    // Orijinal JSON verilerini canlı puanlarla birleştir
    const updated = (data || []).map((row: any) => {
      const currentPuan = row.puan ?? row.points ?? row.totalPoints ?? 0;
      const idAdd = extraPointsMap[row.id] || 0;
      const nameAdd = extraPointsMap[row.name] || 0;
      const totalAdd = Math.max(idAdd, nameAdd);

      return {
        ...row,
        calculatedPoints: currentPuan + totalAdd
      };
    });

    // Puan durumuna göre büyükten küçüğe sırala
    updated.sort((a, b) => (b.calculatedPoints || 0) - (a.calculatedPoints || 0));
    setTableRows(updated);
  }, [data, leagueTitle]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <h2 className="text-xs font-black text-amber-400 uppercase tracking-wider">
          📊 {leagueTitle}
        </h2>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
          CANLI GÜNCEL
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/60 text-slate-400 text-[11px] font-black uppercase border-b border-slate-800">
              <th className="p-4 w-16 text-center">SIRA</th>
              <th className="p-4">YARIŞMACI</th>
              <th className="p-4 text-right">TOPLAM PUAN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs font-bold">
            {tableRows.map((row, idx) => (
              <tr key={row.id || idx} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4 text-center font-black text-amber-400">#{idx + 1}</td>
                <td className="p-4 text-slate-100 font-black">{row.name || row.player || row.username}</td>
                <td className="p-4 text-right font-black text-amber-400 text-sm">
                  {row.calculatedPoints}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}