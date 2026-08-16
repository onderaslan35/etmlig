'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Sabit Oyuncu Listesi (Sadece isimleri göstermek için)
const allPlayersList: Record<string, string> = {
  "262701": "MUHAMMET OKUMUŞ", "262702": "MURAT KARA", "262703": "CEMALETTİN BELLİ", "262704": "YAPAY ZEKA", "262705": "AHMET BİRCAN",
  "262706": "GAZİ AYAN", "262707": "HAKAN AYAN", "262708": "BAYRAM YILMAZ", "262709": "SALİH KARACAOĞLU", "262710": "MUZAFFER ERTUĞRUL",
  "262711": "RIDVAN DOGER", "262712": "MURAT AYDEMİR", "262713": "VAHİT KÜLCÜ", "262714": "İSMAİL EKER", "262715": "ŞEMSETTIN DÜGER",
  "262716": "BİROL DEMİREL", "262717": "MURAT ALİ", "262718": "BEKİR KARADAĞ", "262719": "UĞUR VARDAR", "262720": "HASAN ASLAN",
  "262721": "MUSTAFA GÜMÜŞÇÜ", "262722": "MUSTAFA ERKAN", "262723": "AYHAN LUŞOĞLU", "262724": "YÜCEL TOMAK", "262725": "İLYAS KAZDAL",
  "262726": "HUDAVER TOPARDIC", "262727": "YAHŞİ ERKAN", "262728": "ÖNDER ASLAN", "262729": "HAKAN GÜN", "262730": "ÖNDER IŞIK",
  "262731": "FATİH AYAN", "262732": "R. İLHAN KARACA", "262733": "MUHSİN ASİLKAN", "262734": "LEVENT YILDIRIM", "262735": "AYGÜN AKKEÇELİ",
  "262736": "MEHMET ALİ KARA", "262737": "ŞAHİN GEZGİNCİ", "262738": "MEVLÜT EVLER", "262739": "UĞUR GÜRBÜZ", "262740": "ABDULLAH DİK",
  "262741": "SABAHATTİN ÇAYLAK", "262742": "ZEKERiYYA TOPKAYYA", "262743": "MEHMET ALİ ŞAHİN", "262744": "İLYAS UYGUN", "262745": "OĞUZ YILDIRIMKAYA",
  "262746": "MEHMET BAYIR", "262747": "SAVAŞ ÇAĞLAYAN", "262748": "YASİN ŞAHİN", "262749": "B.VEYSELOĞLU EROL", "262750": "MAHMUT CBR",
  "262751": "HÜSEYİN ERBAŞ", "262810": "ADEM BULUT ERTÜRK", "262753": "YUSUF KIZILTUĞ", "262754": "OSMAN ALİ AYDIN", "262755": "DOĞAÇ ALKAN",
  "262756": "EYÜP KARACAOĞLU", "262813": "KEMAL ERSOY", "262758": "MELİH PINAR", "262762": "İLHAN DANIŞ", "262763": "MUSTAFA ELMAS",
  "262770": "OZKAYA MAZAKALI BAYRAM", "262771": "ULAŞ ADIGÜZEL", "262772": "CEMAL SİVRİKAYA", "262760": "UĞUR NES", "262774": "ŞENOL CAN ÇAKICI",
  "262776": "CUMA OKUR", "262777": "MİRAÇ TOPAL", "262778": "CENGİZ SAYAN", "262780": "YUSUF KILIÇ", "262781": "KADİR SOLMAZ",
  "262782": "YUSUF ERBAY", "262783": "YASİN AYAN", "262784": "MEHMET AVCI", "262785": "METE BÜYÜKGÖL", "262786": "SEDAT DİŞLİ",
  "262787": "MUSTAFA TUCİ", "262788": "HAKAN ÇİFTÇİ", "262789": "ALİ ABUKAN", "262790": "CUMALİ SÖKER", "351925": "ALİOS GÖZTEPE",
  "350909": "DİNÇER ÖZER", "262815": "MURAT KAYA", "262816": "SEDAT SEDAT", "262795": "SEFA İÇA", "262796": "D. SERGEN TAŞYÜREK",
  "262797": "ÖMER DOGER"
};

// 🔴 HAFTALIK STATİK SKOR BİLME SAYILARI (PUAN DEĞİL, ADET) 🔴
const historicalScoresData: Record<number, Record<string, number>> = {
  1: { "262705": 6, "262732": 5, "262714": 4, "262785": 4, "262772": 4, "262727": 4, "262706": 4, "262754": 4, "350909": 4 },
  2: { "262705": 7, "262732": 5, "262714": 4, "262785": 3, "262772": 3, "262727": 5, "262706": 3, "262754": 3, "350909": 3 },
  3: { "262705": 6, "262732": 4, "262714": 5, "262785": 5, "262772": 4, "262727": 2, "262706": 3, "262754": 3, "350909": 2 }
};

interface PlayerData {
  id: string;
  name: string;
  totalScore: number;
}

export default function SkorDurumuPage() {
  const [activeTab, setActiveTab] = useState<'MASTER' | 'DFO' | 'TFF'>('MASTER');
  const [selectedWeek, setSelectedWeek] = useState<string>('total');
  const [leaderboardData, setLeaderboardData] = useState<PlayerData[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // 1) Temel skorları hesapla (Seçilen haftaya göre veya toplama göre)
    const baseScores: Record<string, number> = {};

    Object.keys(allPlayersList).forEach(id => {
      let total = 0;
      if (selectedWeek === 'total') {
        Object.keys(historicalScoresData).forEach(week => {
          total += (historicalScoresData[Number(week)][id] || 0);
        });
      } else {
        total = historicalScoresData[Number(selectedWeek)]?.[id] || 0;
      }
      baseScores[id] = total;
    });

    // 2) Eğer TFF seçiliyse, geçmiş haftalarda TFF maçı olmadığı için (1, 2 ve 3. hafta) TFF skorlarını 0 yapalım (Eğer toplam veya o haftalardaysak)
    // Sadece 4. hafta ve sonrasında TFF canlı verisi geldiğinde artacak.
    const finalData: PlayerData[] = [];
    Object.keys(baseScores).forEach(id => {
      let score = baseScores[id];
      if (activeTab === 'TFF' && (selectedWeek === 'total' || Number(selectedWeek) <= 3)) {
         score = 0; 
      }
      // DFO için hepsi geçerli, Master için hepsi geçerli
      if (score > 0 || selectedWeek === 'total') {
         finalData.push({ id, name: allPlayersList[id] || "Bilinmeyen", totalScore: score });
      }
    });

    // 3) Sırala
    finalData.sort((a, b) => b.totalScore - a.totalScore || a.name.localeCompare(b.name, 'tr'));
    
    // Eğer tüm skorlar 0 ise ve total değilsek boş liste gösterelim
    const isAllZero = finalData.every(p => p.totalScore === 0);
    if (isAllZero && selectedWeek !== 'total') {
       setLeaderboardData([]);
    } else {
       setLeaderboardData(finalData);
    }
  }, [activeTab, selectedWeek]);

  return (
    <div className="min-h-screen bg-[#050b14] font-sans text-slate-200 pb-20 selection:bg-amber-500/30">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6 sm:py-10">

        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-5xl font-black text-amber-500 tracking-widest drop-shadow-[0_0_15px_rgba(245,158,11,0.4)] uppercase">MASTER SKOR ANALİZ MERKEZİ</h1>
        </div>

        <div className="flex flex-col gap-4 mb-8">
            <div className="flex justify-center mb-4">
              <Link href="/admin">
                <button className="bg-slate-900/50 hover:bg-slate-800 text-slate-300 font-bold px-6 py-3 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-all flex items-center gap-3">
                  <span className="text-amber-500">🔴</span> GÜNÜN CANLI MAÇLARI
                </button>
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-3xl mx-auto">
              <button onClick={() => setActiveTab('MASTER')} className={`flex-1 py-4 px-4 rounded-2xl font-black text-sm sm:text-lg tracking-widest uppercase transition-all duration-300 ${activeTab === 'MASTER' ? 'bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-[1.02] border-none' : 'bg-slate-900/50 text-slate-500 border border-slate-800 hover:bg-slate-800'}`}>MASTER SKOR</button>
              <div className="flex gap-3 w-full sm:flex-1">
                <button onClick={() => setActiveTab('DFO')} className={`flex-1 py-3 px-2 rounded-2xl font-black text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 ${activeTab === 'DFO' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-[1.02] border-none' : 'bg-slate-900/50 text-slate-500 border border-slate-800 hover:bg-slate-800'}`}>DFO SKOR</button>
                <button onClick={() => setActiveTab('TFF')} className={`flex-1 py-3 px-2 rounded-2xl font-black text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 ${activeTab === 'TFF' ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] scale-[1.02] border-none' : 'bg-slate-900/50 text-slate-500 border border-slate-800 hover:bg-slate-800'}`}>TFF SKOR</button>
              </div>
            </div>
        </div>

        <div className="bg-[#0a1120] rounded-3xl p-4 sm:p-8 shadow-2xl border border-slate-800/50 relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4 bg-slate-900/40 p-4 rounded-2xl">
             <div className="flex items-center gap-3">
                 <span className="text-xl">📅</span>
                 <h2 className="text-lg sm:text-xl font-black text-white tracking-widest uppercase">
                    {selectedWeek === 'total' ? 'TOPLAM SKOR DURUMU' : `${selectedWeek}. HAFTA SKOR DURUMU`}
                 </h2>
             </div>
             <select 
                value={selectedWeek} 
                onChange={(e) => setSelectedWeek(e.target.value)} 
                className="bg-slate-950 border border-slate-700 text-slate-300 px-4 py-2 rounded-xl outline-none focus:border-amber-500 font-bold text-sm cursor-pointer w-full sm:w-auto"
             >
                <option value="total">🔻 HAFTALAR (TÜMÜ)</option>
                <option value="1">1. HAFTA</option>
                <option value="2">2. HAFTA</option>
                <option value="3">3. HAFTA</option>
                <option value="4">4. HAFTA</option>
             </select>
          </div>

          {leaderboardData.length === 0 ? (
             <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800">
                <span className="text-4xl opacity-50 block mb-4">⏳</span>
                <p className="text-slate-500 font-medium">Veriler bulunamadı.</p>
             </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-800/50">
               <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-700/50">
                      <th className="p-4 sm:p-5 text-center text-slate-400 font-black text-xs sm:text-sm w-16">SIRA</th>
                      <th className="p-4 sm:p-5 text-slate-300 font-black text-xs sm:text-sm tracking-widest">YARIŞMACI</th>
                      <th className="p-4 sm:p-5 text-center text-amber-500 font-black text-xs sm:text-sm tracking-widest">SKOR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((player, index) => {
                      const isTop3 = index < 3;
                      const isTop1 = index === 0;

                      let nameColor = "text-slate-200";
                      let rowBg = "hover:bg-slate-800/30";
                      let rankDisplay = <span className="text-slate-500 font-bold">{index + 1}</span>;
                      let badge = null;

                      if (isTop1) {
                        nameColor = "text-amber-400 font-black";
                        rowBg = "bg-amber-950/20 border-l-4 border-amber-500 hover:bg-amber-900/30";
                        rankDisplay = <span className="text-2xl drop-shadow-md">🥇</span>;
                      } else if (index === 1) {
                        nameColor = "text-slate-300 font-bold";
                        rowBg = "bg-slate-800/40 border-l-4 border-slate-400 hover:bg-slate-700/50";
                        rankDisplay = <span className="text-2xl drop-shadow-md">🥈</span>;
                      } else if (index === 2) {
                        nameColor = "text-orange-300 font-bold";
                        rowBg = "bg-orange-950/20 border-l-4 border-orange-500 hover:bg-orange-900/30";
                        rankDisplay = <span className="text-2xl drop-shadow-md">🥉</span>;
                      } else {
                        rowBg = "border-l-4 border-transparent hover:bg-slate-800/30";
                      }

                      // Mobil görünümde madalyaları koruma (emoji kırpılmasını engeller)
                      const displayName = isMobile ? player.name.split(' 🏆')[0] : player.name;

                      return (
                        <tr key={player.id} className={`border-b border-slate-800/30 transition-all ${rowBg}`}>
                          <td className="p-4 sm:p-5 text-center align-middle">{rankDisplay}</td>
                          <td className="p-4 sm:p-5">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs sm:text-sm uppercase tracking-wide truncate ${nameColor}`}>
                                {displayName}
                              </span>
                              {badge && <span className="hidden sm:inline-block">{badge}</span>}
                            </div>
                          </td>
                          <td className="p-4 sm:p-5 text-center">
                            <span className={`inline-flex items-center justify-center font-black ${isTop3 ? 'text-lg sm:text-2xl drop-shadow-[0_0_8px_currentColor]' : 'text-base sm:text-xl'} ${isTop1 ? 'text-amber-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-400' : 'text-slate-400'}`}>
                              {player.totalScore}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
               </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}