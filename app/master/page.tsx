'use client';

import React, { useState, useEffect } from 'react';

const masterUsersData = [
  { rank: 1, name: "EYÜP KARACAOĞLU", masterP: 18, masterAcc: "%62", dfoP: 14, dfoAcc: "%55", tffP: 12, tffAcc: "%50", trophies: "🏆" },
  { rank: 2, name: "DOĞAÇ ALKAN", masterP: 17, masterAcc: "%58", dfoP: 15, dfoAcc: "%52", tffP: 11, tffAcc: "%48", trophies: "" },
  { rank: 3, name: "SEDAT SEDAT", masterP: 16, masterAcc: "%55", dfoP: 12, dfoAcc: "%48", tffP: 14, tffAcc: "%52", trophies: "" },
  { rank: 4, name: "OSMAN ALİ AYDIN", masterP: 16, masterAcc: "%54", dfoP: 13, dfoAcc: "%50", tffP: 10, tffAcc: "%45", trophies: "🏆" },
  { rank: 5, name: "HUDAVER TOPARDIC", masterP: 15, masterAcc: "%52", dfoP: 11, dfoAcc: "%45", tffP: 13, tffAcc: "%49", trophies: "" },
  { rank: 6, name: "ÖNDER ASLAN", masterP: 15, masterAcc: "%51", dfoP: 16, dfoAcc: "%58", tffP: 15, tffAcc: "%55", trophies: "👑" },
  { rank: 7, name: "MEHMET ALİ KARA", masterP: 14, masterAcc: "%50", dfoP: 10, dfoAcc: "%42", tffP: 12, tffAcc: "%46", trophies: "" },
  { rank: 8, name: "SEDAT DİŞLİ", masterP: 14, masterAcc: "%49", dfoP: 12, dfoAcc: "%46", tffP: 11, tffAcc: "%44", trophies: "" },
  { rank: 9, name: "CUMALİ SÖKER", masterP: 13, masterAcc: "%48", dfoP: 9, dfoAcc: "%40", tffP: 10, tffAcc: "%42", trophies: "" },
  { rank: 10, name: "R. İLHAN KARACA", masterP: 13, masterAcc: "%47", dfoP: 14, dfoAcc: "%51", tffP: 13, tffAcc: "%48", trophies: "🏆🏆" },
];

export default function MasterPuanDurumuPage() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [exactScores, setExactScores] = useState<Record<string, number>>({});

  useEffect(() => {
    // Admin panelinden girilen haftalık skor verilerini çek
    const savedWeekly = localStorage.getItem('skorWeeklyData');
    if (savedWeekly) {
      try {
        const weeklyData = JSON.parse(savedWeekly);
        const scoreTotals: Record<string, number> = {};

        Object.keys(weeklyData).forEach((weekKey) => {
          const weekObj = weeklyData[weekKey];
          Object.keys(weekObj).forEach((userId) => {
            scoreTotals[userId] = (scoreTotals[userId] || 0) + (weekObj[userId] || 0);
          });
        });
        setExactScores(scoreTotals);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleUserCard = (userName: string) => {
    if (selectedUser === userName) {
      setSelectedUser(null);
    } else {
      setSelectedUser(userName);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 font-sans">
      {/* BAŞLIK */}
      <div className="text-center mb-6">
        <h1 className="text-xl md:text-2xl font-extrabold text-amber-400 uppercase tracking-wider">
          🏆 ELİT TAHMİN MASTER LİGİ PUAN DURUMU
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Yarışmacı kartını ve tüm lig performansını incelemek için ismin üzerine tıklayın.
        </p>
      </div>

      {/* PUAN TABLOSU */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-16">SIRA</th>
                <th className="py-3.5 px-4">YARIŞMACI (KARNE İÇİN TIKLAYIN)</th>
                <th className="py-3.5 px-4 text-right text-amber-400">MASTER PUAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm font-semibold">
              {masterUsersData.map((user) => {
                const isExpanded = selectedUser === user.name;
                return (
                  <React.Fragment key={user.name}>
                    {/* YARIŞMACI SATIRI */}
                    <tr
                      onClick={() => toggleUserCard(user.name)}
                      className={`cursor-pointer transition-colors duration-150 ${
                        isExpanded
                          ? 'bg-amber-500/10 border-l-4 border-l-amber-400'
                          : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center text-slate-400 font-bold">
                        {user.rank}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-100 flex items-center justify-between">
                        <span>
                          {user.name} {user.trophies}
                        </span>
                        <span className="text-[10px] text-amber-400/80 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase">
                          {isExpanded ? '▲ Kapat' : '▼ Detay Göster'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-amber-400 text-base">
                        {user.masterP}
                      </td>
                    </tr>

                    {/* AÇILIR BİLGİ KARTININ YER ALDIĞI SATIR */}
                    {isExpanded && (
                      <tr className="bg-slate-950/90">
                        <td colSpan={3} className="p-4">
                          <div className="bg-slate-900 border border-amber-500/40 p-4 rounded-xl shadow-inner space-y-4">
                            
                            {/* KART BAŞLIĞI */}
                            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                              <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                                📊 {user.name} — GENEL PERFORMANS KARNESİ
                              </span>
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                                RESMİ TAHMİNCİ
                              </span>
                            </div>

                            {/* LİG PERFORMANS IZGARASI */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {/* MASTER LİG */}
                              <div className="bg-slate-950 border border-amber-500/30 p-3 rounded-lg text-center">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">
                                  🏆 MASTER LİG
                                </span>
                                <span className="text-base font-black text-amber-400 mt-0.5 block">
                                  {user.masterP} Puan
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500 block">
                                  İsabet: {user.masterAcc}
                                </span>
                              </div>

                              {/* DFO LİGİ */}
                              <div className="bg-slate-950 border border-blue-500/30 p-3 rounded-lg text-center">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">
                                  ⚽ DFO LİGİ
                                </span>
                                <span className="text-base font-black text-blue-400 mt-0.5 block">
                                  {user.dfoP} Puan
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500 block">
                                  İsabet: {user.dfoAcc}
                                </span>
                              </div>

                              {/* TFF LİGİ */}
                              <div className="bg-slate-950 border border-red-500/30 p-3 rounded-lg text-center">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">
                                  🇹🇷 TFF LİGİ
                                </span>
                                <span className="text-base font-black text-red-400 mt-0.5 block">
                                  {user.tffP} Puan
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500 block">
                                  İsabet: {user.tffAcc}
                                </span>
                              </div>

                              {/* TAM SKOR */}
                              <div className="bg-slate-950 border border-emerald-500/30 p-3 rounded-lg text-center">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">
                                  🎯 TAM SKOR
                                </span>
                                <span className="text-base font-black text-emerald-400 mt-0.5 block">
                                  {exactScores[user.name] || 8} Tam İsabet
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500 block">
                                  Skor Başarısı
                                </span>
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}