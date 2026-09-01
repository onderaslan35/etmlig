'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

// ALL 52 PLAYERS FULL REGISTRY
const allPlayersMasterList: Record<string, string> = {
  "262756": "EYÜP KARACAOĞLU", "262755": "DOĞAÇ ALKAN", "262816": "SEDAT SEDAT", "262736": "MEHMET ALİ KARA",
  "262786": "SEDAT DİŞLİ", "262733": "MUHSİN ASİLKAN", "262728": "ÖNDER ASLAN", "262726": "HUDAVER TOPARDIC",
  "262709": "SALİH KARACAOĞLU", "262719": "UĞUR VARDAR", "262754": "OSMAN ALİ AYDIN 🏆", "262771": "ULAŞ ADIGÜZEL",
  "262721": "MUSTAFA GÜMÜŞÇÜ", "262790": "CUMALİ SÖKER", "262717": "MURAT ALİ", "262732": "R. İLHAN KARACA 🏆🏆",
  "262711": "RIDVAN DOGER", "262731": "FATİH AYAN", "262772": "CEMAL SİVRİKAYA 🏆", "262763": "MUSTAFA ELMAS",
  "262707": "HAKAN AYAN", "262706": "GAZİ AYAN 🏆🏆", "262813": "KEMAL ERSOY", "262774": "ŞENOL CAN ÇAKICI",
  "262747": "SAVAŞ ÇAĞLAYAN", "262705": "AHMET BİRCAN 🏆", "262714": "İSMAİL EKER 🏆", "262740": "ABDULLAH DİK",
  "262702": "MURAT KARA", "262738": "MEVLÜT EVLER", "262753": "YUSUF KIZILTUĞ", "262716": "BİROL DEMİREL",
  "262750": "MAHMUT CBR", "262734": "LEVENT YILDIRIM", "262725": "İLYAS KAZDAL", "262737": "ŞAHİN GEZGİNCİ",
  "351925": "ALİOS GÖZTEPE", "262730": "ÖNDER IŞIK", "262782": "YUSUF ERBAY", "262723": "AYHAN LUŞOĞLU",
  "262749": "B.VEYSELOĞLU EROL", "262718": "BEKİR KARADAĞ", "262715": "ŞEMSETTİN DÜGER", "262739": "UĞUR GÜRBÜZ",
  "262703": "CEMALETTİN BELLİ", "262758": "MELİH PINAR", "262770": "OZKAYA MAZAKALI BAYRAM", "262708": "BAYRAM YILMAZ",
  "262787": "MUSTAFA TUCİ", "262744": "İLYAS UYGUN", "262712": "MURAT AYDEMİR", "262704": "YAPAY ZEKA"
};

// 1. HAFTA HAM VERİLERİ (DFO 1)
const masterWeek1Data: Record<string, { name: string; puan: number }> = {
  "262736": { name: "MEHMET ALİ KARA 🏔️ (+3 PUAN HAFTANIN ZİRVE BONUSU)", puan: 31 },
  "262719": { name: "UĞUR VARDAR", puan: 23 },
  "262755": { name: "DOĞAÇ ALKAN 🎯 (+3 PUAN HAFTANIN SKOR BONUSU)", puan: 21 },
  "262756": { name: "EYÜP KARACAOĞLU", puan: 17 },
  "262754": { name: "OSMAN ALİ AYDIN 🏆", puan: 14 },
  "262786": { name: "SEDAT DİŞLİ", puan: 12 },
  "262731": { name: "FATİH AYAN", puan: 11 },
  "262717": { name: "MURAT ALİ", puan: 11 },
  "262732": { name: "R. İLHAN KARACA 🏆🏆", puan: 10 },
  "262726": { name: "HUDAVER TOPARDIC", puan: 10 },
  "262750": { name: "MAHMUT CBR", puan: 9 },
  "262747": { name: "SAVAŞ ÇAĞLAYAN", puan: 8 },
  "262771": { name: "ULAŞ ADIGÜZEL", puan: 8 },
  "262728": { name: "ÖNDER ASLAN", puan: 8 },
  "262816": { name: "SEDAT SEDAT", puan: 7 },
  "262716": { name: "BİROL DEMİREL", puan: 7 },
  "262790": { name: "CUMALİ SÖKER", puan: 7 },
  "262733": { name: "MUHSİN ASİLKAN", puan: 7 },
  "262709": { name: "SALİH KARACAOĞLU", puan: 5 },
  "262753": { name: "YUSUF KIZILTUĞ", puan: 4 },
  "262813": { name: "KEMAL ERSOY", puan: 4 },
  "262740": { name: "ABDULLAH DİK", puan: 4 },
  "262718": { name: "BEKİR KARADAĞ", puan: 3 },
  "262707": { name: "HAKAN AYAN", puan: 1 },
  "262782": { name: "YUSUF ERBAY", puan: 1 },
  "262702": { name: "MURAT KARA", puan: 1 },
  "262714": { name: "İSMAİL EKER 🏆", puan: 1 },
  "262721": { name: "MUSTAFA GÜMÜŞÇÜ", puan: 1 },
  "262706": { name: "GAZİ AYAN 🏆🏆", puan: 1 },
  "262787": { name: "MUSTAFA TUCİ", puan: 1 },
  "262744": { name: "İLYAS UYGUN", puan: 1 },
  "262774": { name: "ŞENOL CAN ÇAKICI", puan: 1 },
  "262715": { name: "ŞEMSETTİN DÜGER", puan: 1 },
  "262723": { name: "AYHAN LUŞOĞLU", puan: 1 },
  "351925": { name: "ALİOS GÖZTEPE", puan: 0 },
  "262749": { name: "B.VEYSELOĞLU EROL", puan: 0 },
  "262705": { name: "AHMET BİRCAN 🏆", puan: 0 },
  "262708": { name: "BAYRAM YILMAZ", puan: 0 },
  "262711": { name: "RIDVAN DOGER", puan: 0 },
  "262712": { name: "MURAT AYDEMİR", puan: 0 },
  "262734": { name: "LEVENT YILDIRIM", puan: 0 },
  "262770": { name: "OZKAYA MAZAKALI BAYRAM", puan: 0 },
  "262704": { name: "YAPAY ZEKA", puan: 0 }
};

// 2. HAFTA HAM VERİLERİ (DFO 2)
const masterWeek2Data: Record<string, { name: string; puan: number }> = {
  "262756": { name: "EYÜP KARACAOĞLU 🏔️ (+3 PUAN HAFTANIN ZİRVE BONUSU)", puan: 16 },
  "262755": { name: "DOĞAÇ ALKAN", puan: 13 },
  "262709": { name: "SALİH KARACAOĞLU", puan: 13 },
  "262790": { name: "CUMALİ SÖKER", puan: 12 },
  "262772": { name: "CEMAL SİVRİKAYA 🏆", puan: 12 },
  "262728": { name: "ÖNDER ASLAN", puan: 11 },
  "262726": { name: "HUDAVER TOPARDIC", puan: 9 },
  "262711": { name: "RIDVAN DOGER", puan: 8 },
  "262717": { name: "MURAT ALİ", puan: 7 },
  "262737": { name: "ŞAHİN GEZGİNCİ", puan: 7 },
  "262705": { name: "AHMET BİRCAN 🏆", puan: 6 },
  "262816": { name: "SEDAT SEDAT", puan: 6 },
  "262774": { name: "ŞENOL CAN ÇAKICI", puan: 6 },
  "262732": { name: "R. İLHAN KARACA 🏆🏆", puan: 6 },
  "262786": { name: "SEDAT DİŞLİ", puan: 6 },
  "262721": { name: "MUSTAFA GÜMÜŞÇÜ", puan: 5 },
  "262738": { name: "MEVLÜT EVLER", puan: 5 },
  "262714": { name: "İSMAİL EKER 🏆", puan: 4 },
  "262763": { name: "MUSTAFA ELMAS", puan: 2 },
  "262736": { name: "MEHMET ALİ KARA", puan: 2 },
  "262740": { name: "ABDULLAH DİK", puan: 2 },
  "262702": { name: "MURAT KARA", puan: 2 },
  "262703": { name: "CEMALETTİN BELLİ", puan: 2 },
  "262730": { name: "ÖNDER IŞIK", puan: 2 },
  "262715": { name: "ŞEMSETTİN DÜGER", puan: 2 },
  "262749": { name: "B.VEYSELOĞLU EROL", puan: 2 },
  "262725": { name: "İLYAS KAZDAL", puan: 1 },
  "262758": { name: "MELİH PINAR", puan: 1 },
  "262771": { name: "ULAŞ ADIGÜZEL", puan: 1 },
  "262754": { name: "OSMAN ALİ AYDIN 🏆", puan: 1 },
  "262747": { name: "SAVAŞ ÇAĞLAYAN", puan: 1 },
  "262716": { name: "BİROL DEMİREL", puan: 1 },
  "262708": { name: "BAYRAM YILMAZ", puan: 1 },
  "262731": { name: "FATİH AYAN", puan: 1 },
  "262739": { name: "UĞUR GÜRBÜZ", puan: 1 },
  "262770": { name: "OZKAYA MAZAKALI BAYRAM", puan: 0 },
  "262712": { name: "MURAT AYDEMİR", puan: 0 },
  "262704": { name: "YAPAY ZEKA", puan: 0 }
};

// 3. HAFTA HAM VERİLERİ (DFO 3 + TFF 3)
const dfoWeek3: Record<string, number> = {
  "262816": 16, "262733": 12, "262721": 10, "262763": 7, "262786": 7, "262711": 7,
  "351925": 6, "262726": 6, "262725": 6, "262771": 6, "262813": 5, "262709": 5,
  "262706": 5, "262738": 5, "262753": 5, "262734": 4, "262756": 4, "262702": 4,
  "262730": 4, "262731": 2, "262755": 2, "262747": 2, "262732": 2, "262707": 1,
  "262754": 1, "262714": 1, "262782": 1, "262723": 1, "262772": 1, "262739": 1, "262716": 1
};

const tffWeek3: Record<string, number> = {
  "262707": 10, "262816": 9, "262733": 7, "262754": 6, "262728": 6, "262706": 6,
  "262771": 5, "262734": 5, "262705": 4, "262714": 4, "262763": 4, "262756": 4,
  "262774": 4, "262740": 4, "262702": 3, "262782": 3, "262813": 3, "262723": 2,
  "262749": 2, "262721": 1, "351925": 1, "262730": 1, "262772": 1, "262739": 1, "262770": 1
};

// ONAYLANAN HAFTALIK BONUS MAP
const masterBonusData: Record<string, { week1?: number; week2?: number; week3?: number }> = {
  "262736": { week1: 3 }, // Mehmet Ali Kara (+3 Hafta 1 Zirve Bonusu)
  "262755": { week1: 3 }, // Doğaç Alkan (+3 Hafta 1 Skor Bonusu)
  "262756": { week2: 3 }  // Eyüp Karacaoğlu (+3 Hafta 2 Zirve Bonusu)
};

export default function MasterPuanDurumuPage() {
  const [activeTab, setActiveTab] = useState<string>('total');
  const [isWeekMenuOpen, setIsWeekMenuOpen] = useState<boolean>(false);
  const [tableRows, setTableRows] = useState<any[]>([]);

  const totalWeeks = Array.from({ length: 48 }, (_, i) => i + 1);

  useEffect(() => {
    const fetchSupabaseData = async () => {
      // 1. TARİHİ ARŞİV: 4, 5 ve 6. Haftanın tarayıcıdaki kayıtlarını OKU!
      const liveLeaderboard = JSON.parse(localStorage.getItem('elitTahmin_Leaderboard') || '{}');

      // İlk 3 haftanın STATİK puanları + 4, 5 ve 6. haftanın LOKAL puanlarını topla
      const basePoints: Record<string, number> = {};
      Object.keys(allPlayersMasterList).forEach(id => {
        const w1 = masterWeek1Data[id]?.puan || 0;
        const w2 = masterWeek2Data[id]?.puan || 0;
        const w3DFO = dfoWeek3[id] || 0;
        const w3TFF = tffWeek3[id] || 0;
        const b1 = masterBonusData[id]?.week1 || 0;
        const b2 = masterBonusData[id]?.week2 || 0;
        const b3 = masterBonusData[id]?.week3 || 0;
        
        const historyLocalPoints = liveLeaderboard[id]?.master || 0; 

        basePoints[id] = w1 + w2 + w3DFO + w3TFF + b1 + b2 + b3 + historyLocalPoints;
      });

      if (activeTab === 'total') {
        // 2. YENİ SİSTEM: 7. Hafta itibariyle Admin panelinden kestiğimiz ÇİFT FİŞLERİ Uzaydan (Supabase) ÇEK
        const { data } = await supabase
          .from('standings')
          .select('user_id, points')
          .eq('league_type', 'MASTER');

        const dbPoints: Record<string, number> = {};
        if (data) {
          data.forEach(row => {
            dbPoints[row.user_id] = row.points;
          });
        }

        // TARİHİ ARŞİV İLE UZAY VERİSİNİ BİRLEŞTİR!
        const combinedList = Object.keys(allPlayersMasterList).map(id => {
          const historicalTotal = basePoints[id] || 0;
          const newSystemTotal = dbPoints[id] || 0;
          
          return {
            id,
            name: allPlayersMasterList[id],
            puan: historicalTotal + newSystemTotal
          };
        });

        setTableRows(combinedList.sort((a, b) => b.puan - a.puan));

      } else if (activeTab === 'week1') {
        const list = Object.keys(allPlayersMasterList).map(id => {
          const rawObj = masterWeek1Data[id];
          const displayName = rawObj ? rawObj.name : allPlayersMasterList[id];
          return { id, name: displayName, puan: (rawObj ? rawObj.puan : 0) + (masterBonusData[id]?.week1 || 0) };
        });
        setTableRows(list.sort((a, b) => b.puan - a.puan));
      } else if (activeTab === 'week2') {
        const list = Object.keys(allPlayersMasterList).map(id => {
          const rawObj = masterWeek2Data[id];
          const displayName = rawObj ? rawObj.name : allPlayersMasterList[id];
          return { id, name: displayName, puan: (rawObj ? rawObj.puan : 0) + (masterBonusData[id]?.week2 || 0) };
        });
        setTableRows(list.sort((a, b) => b.puan - a.puan));
      } else if (activeTab === 'week3') {
        const list = Object.keys(allPlayersMasterList).map(id => {
          return { id, name: allPlayersMasterList[id], puan: (dfoWeek3[id] || 0) + (tffWeek3[id] || 0) + (masterBonusData[id]?.week3 || 0) };
        });
        setTableRows(list.sort((a, b) => b.puan - a.puan));
      } else {
        // GELECEK HAFTALAR İÇİN DİREKT SUPABASE KONTROLÜ
        const weekNum = parseInt(activeTab.replace('week', ''));
        
        const { data } = await supabase
          .from('points')
          .select('username, puan')
          .eq('kategori', 'MASTER')
          .eq('hafta', weekNum);

        const weekPoints: Record<string, number> = {};
        Object.keys(allPlayersMasterList).forEach(id => weekPoints[id] = 0);

        if (data) {
          data.forEach(row => {
            if (weekPoints[row.username] !== undefined) {
              weekPoints[row.username] += row.puan;
            }
          });
        }

        const list = Object.keys(allPlayersMasterList).map(id => ({
          id,
          name: allPlayersMasterList[id],
          puan: weekPoints[id]
        }));
        
        setTableRows(list.sort((a, b) => b.puan - a.puan));
      }
    };

    fetchSupabaseData();

    // Canlı Güncellemeler İçin Abonelik
    const channel = supabase.channel('master_puan_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'standings' }, () => {
         fetchSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'points' }, () => {
         fetchSupabaseData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeTab]);

  const selectTab = (tabKey: string) => {
    setActiveTab(tabKey);
    setIsWeekMenuOpen(false);
  };

  const getActiveTabTitle = () => {
    if (activeTab === 'total') return 'MASTER TOPLAM PUAN DURUMU';
    const weekNum = activeTab.replace('week', '');
    return `MASTER ${weekNum}. HAFTA PUAN DURUMU`;
  };

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-8 mt-4">
        <h1 className="text-2xl md:text-3xl font-black text-center text-amber-500 tracking-widest uppercase drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
          ELİT TAHMİN MASTER LİGİ
        </h1>
      </div>

      <div className="max-w-xl flex flex-col items-center mb-8 space-y-3 w-full">
        <button
          onClick={() => selectTab('total')}
          className={`px-8 py-3.5 rounded-xl font-black text-sm md:text-base transition-all duration-200 border w-full text-center shadow-lg uppercase tracking-widest ${
            activeTab === 'total'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-[1.02]'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          MASTER TOPLAM PUAN DURUMU
        </button>

        <div className="w-full relative">
          <button
            onClick={() => setIsWeekMenuOpen(!isWeekMenuOpen)}
            className={`w-full py-3.5 px-6 rounded-xl font-extrabold text-xs md:text-sm border transition-all flex items-center justify-between shadow-lg ${
              activeTab !== 'total'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <span className="tracking-widest">📅 {getActiveTabTitle()}</span>
            <span className="text-xs transition-transform duration-200 font-black">
              {isWeekMenuOpen ? '▲ KAPAT' : '▼ HAFTALAR'}
            </span>
          </button>

          {isWeekMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-slate-900/95 border border-slate-700 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
              <div className="text-[11px] font-bold text-slate-400 mb-3 text-center uppercase tracking-widest border-b border-slate-800 pb-2">
                İncelemek İstediğiniz Haftayı Seçin
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {totalWeeks.map((weekNum) => {
                  const weekKey = `week${weekNum}`;
                  const isActive = activeTab === weekKey;
                  return (
                    <button
                      key={weekNum}
                      onClick={() => selectTab(weekKey)}
                      className={`py-2 text-xs font-black rounded-lg border transition-all text-center shadow-inner ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 border-amber-400 scale-105 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                          : 'bg-slate-950/90 text-slate-300 border-slate-800 hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/50'
                      }`}
                    >
                      {weekNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {tableRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 w-16 text-center font-black tracking-widest">SIRA</th>
                  <th className="px-6 py-4 font-black tracking-widest">YARIŞMACI</th>
                  <th className="px-6 py-4 text-right font-black tracking-widest">
                    {activeTab === 'total' ? 'TOPLAM PUAN' : 'HAFTALIK PUAN'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {tableRows.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-800/60 transition-colors">
                    <td className="px-6 py-4 text-center font-black text-slate-500">{idx + 1}</td>
                    <td className="px-6 py-4 font-black text-slate-200 tracking-wide">{row.name}</td>
                    <td className="px-6 py-4 text-right font-black text-amber-500 text-lg drop-shadow-md">
                      {row.puan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 font-bold text-sm tracking-widest uppercase">
            ⏳ {activeTab.replace('week', '')}. Haftanın verileri bulunamadı veya henüz hesaplanmadı.
          </div>
        )}
      </div>
    </div>
  );
}