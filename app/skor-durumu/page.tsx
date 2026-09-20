'use client';
import React, { useState } from 'react';

// 🔥 ÖNDER KOMUTAN'IN MÜHÜRLÜ SKOR (TAM İSABET) LİSTELERİ 🔥
// Not: Ok altyapısı hazır. Şu an herkes 'same' (yatay tire). Haftaya 'up' veya 'down' ve 'trendDiff' ekleyebilirsin.
const masterSkor = [
  { name: 'DOĞAÇ ALKAN', score: 32 }, { name: 'OSMAN ALİ AYDIN 🏆', score: 30 }, { name: 'R. İLHAN KARACA 🏆🏆', score: 29 },
  { name: 'SALİH KARACAOĞLU', score: 29 }, { name: 'B.VEYSELOĞLU EROL', score: 28 }, { name: 'EYÜP KARACAOĞLU', score: 28 },
  { name: 'MUSTAFA GÜMÜŞÇÜ', score: 27 }, { name: 'ÖNDER IŞIK', score: 27 }, { name: 'ŞENOL CAN ÇAKICI', score: 27 },
  { name: 'MURAT KARA', score: 26 }, { name: 'FATİH AYAN', score: 25 }, { name: 'HAKAN AYAN', score: 25 },
  { name: 'ÖNDER ASLAN', score: 25 }, { name: 'SEDAT SEDAT', score: 25 }, { name: 'YUSUF KIZILTUĞ', score: 25 },
  { name: 'MEHMET ALİ KARA', score: 24 }, { name: 'MELİH PINAR', score: 24 }, { name: 'MUHSİN ASİLKAN', score: 24 },
  { name: 'ULAŞ ADIGÜZEL', score: 24 }, { name: 'YAPAY ZEKA', score: 24 }, { name: 'YUSUF ERBAY', score: 24 },
  { name: 'İSMAİL EKER 🏆', score: 23 }, { name: 'SABAHATTİN ÇAYLAK', score: 23 }, { name: 'HUDAVER TOPARDIC', score: 22 },
  { name: 'MUSTAFA ELMAS', score: 22 }, { name: 'SAVAŞ ÇAĞLAYAN', score: 22 }, { name: 'OZKAYA MAZAKALI BAYRAM', score: 20 },
  { name: 'UĞUR VARDAR', score: 20 }, { name: 'ALİOS GÖZTEPE', score: 19 }, { name: 'ABDULLAH DİK', score: 18 },
  { name: 'BİROL DEMİREL', score: 18 }, { name: 'CUMALİ SÖKER', score: 18 }, { name: 'İLYAS UYGUN', score: 18 },
  { name: 'SEDAT DİŞLİ', score: 18 }, { name: 'AHMET BİRCAN 🏆', score: 17 }, { name: 'MAHMUT CBR', score: 17 },
  { name: 'MEVLÜT EVLER', score: 17 }, { name: 'AYHAN LUŞOĞLU', score: 16 }, { name: 'CEMAL SİVRİKAYA 🏆', score: 16 },
  { name: 'LEVENT YILDIRIM', score: 16 }, { name: 'RIDVAN DOGER', score: 16 }, { name: 'UĞUR GÜRBÜZ', score: 16 },
  { name: 'GAZİ AYAN 🏆🏆', score: 15 }, { name: 'İLYAS KAZDAL', score: 15 }, { name: 'BEKİR KARADAĞ', score: 14 },
  { name: 'KEMAL ERSOY', score: 14 }, { name: 'MURAT ALİ', score: 14 }, { name: 'AYGÜN AKKEÇELİ', score: 9 },
  { name: 'BAYRAM YILMAZ', score: 8 }, { name: 'CEMALETTİN BELLİ', score: 7 }, { name: 'ŞEMSETTIN DÜGER', score: 5 },
  { name: 'YAHŞİ ERKAN 🏆', score: 3 }, { name: 'MUHAMMED M.ASLANOĞLU', score: 2 }, { name: 'ŞAHİN GEZGİNCİ', score: 2 },
  { name: 'MUSTAFA TUCİ', score: 1 }, { name: 'İSMAİL YILDIRIM', score: 0 }, { name: 'MUZAFFER KESKİN', score: 0 }
];

const dfoSkor = [
  { name: 'DOĞAÇ ALKAN', score: 26 }, { name: 'SALİH KARACAOĞLU', score: 23 }, { name: 'B.VEYSELOĞLU EROL', score: 21 },
  { name: 'EYÜP KARACAOĞLU', score: 20 }, { name: 'ŞENOL CAN ÇAKICI', score: 19 }, { name: 'OSMAN ALİ AYDIN 🏆', score: 18 },
  { name: 'ULAŞ ADIGÜZEL', score: 18 }, { name: 'YUSUF KIZILTUĞ', score: 18 }, { name: 'FATİH AYAN', score: 17 },
  { name: 'MUHSİN ASİLKAN', score: 17 }, { name: 'MUSTAFA GÜMÜŞÇÜ', score: 17 }, { name: 'ÖNDER ASLAN', score: 17 },
  { name: 'R. İLHAN KARACA 🏆🏆', score: 17 }, { name: 'YUSUF ERBAY', score: 17 }, { name: 'SEDAT SEDAT', score: 16 },
  { name: 'MELİH PINAR', score: 15 }, { name: 'MURAT KARA', score: 15 }, { name: 'UĞUR VARDAR', score: 15 },
  { name: 'HUDAVER TOPARDIC', score: 14 }, { name: 'İSMAİL EKER 🏆', score: 14 }, { name: 'MEHMET ALİ KARA', score: 14 },
  { name: 'SAVAŞ ÇAĞLAYAN', score: 14 }, { name: 'YAPAY ZEKA', score: 14 }, { name: 'CUMALİ SÖKER', score: 13 },
  { name: 'HAKAN AYAN', score: 13 }, { name: 'MUSTAFA ELMAS', score: 13 }, { name: 'OZKAYA MAZAKALI BAYRAM', score: 13 },
  { name: 'SEDAT DİŞLİ', score: 13 }, { name: 'İLYAS UYGUN', score: 12 }, { name: 'MEVLÜT EVLER', score: 12 },
  { name: 'ÖNDER IŞIK', score: 12 }, { name: 'SABAHATTİN ÇAYLAK', score: 12 }, { name: 'UĞUR GÜRBÜZ', score: 12 },
  { name: 'ABDULLAH DİK', score: 11 }, { name: 'ALİOS GÖZTEPE', score: 11 }, { name: 'BİROL DEMİREL', score: 11 },
  { name: 'RIDVAN DOGER', score: 11 }, { name: 'AHMET BİRCAN 🏆', score: 10 }, { name: 'LEVENT YILDIRIM', score: 10 },
  { name: 'MAHMUT CBR', score: 10 }, { name: 'MURAT ALİ', score: 10 }, { name: 'BEKİR KARADAĞ', score: 9 },
  { name: 'İLYAS KAZDAL', score: 9 }, { name: 'AYHAN LUŞOĞLU', score: 8 }, { name: 'CEMAL SİVRİKAYA 🏆', score: 8 },
  { name: 'AYGÜN AKKEÇELİ', score: 7 }, { name: 'BAYRAM YILMAZ', score: 7 }, { name: 'GAZİ AYAN 🏆🏆', score: 7 },
  { name: 'KEMAL ERSOY', score: 6 }, { name: 'CEMALETTİN BELLİ', score: 4 }, { name: 'ŞEMSETTIN DÜGER', score: 3 },
  { name: 'MUHAMMED M.ASLANOĞLU', score: 2 }, { name: 'ŞAHİN GEZGİNCİ', score: 2 }, { name: 'YAHŞİ ERKAN 🏆', score: 2 },
  { name: 'MUSTAFA TUCİ', score: 1 }, { name: 'İSMAİL YILDIRIM', score: 0 }, { name: 'MUZAFFER KESKİN', score: 0 }
];

const tffSkor = [
  { name: 'ÖNDER IŞIK', score: 15 }, { name: 'HAKAN AYAN', score: 12 }, { name: 'OSMAN ALİ AYDIN 🏆', score: 12 },
  { name: 'R. İLHAN KARACA 🏆🏆', score: 12 }, { name: 'MURAT KARA', score: 11 }, { name: 'SABAHATTİN ÇAYLAK', score: 11 },
  { name: 'MEHMET ALİ KARA', score: 10 }, { name: 'MUSTAFA GÜMÜŞÇÜ', score: 10 }, { name: 'YAPAY ZEKA', score: 10 },
  { name: 'İSMAİL EKER 🏆', score: 9 }, { name: 'MELİH PINAR', score: 9 }, { name: 'MUSTAFA ELMAS', score: 9 },
  { name: 'SEDAT SEDAT', score: 9 }, { name: 'ALİOS GÖZTEPE', score: 8 }, { name: 'AYHAN LUŞOĞLU', score: 8 },
  { name: 'CEMAL SİVRİKAYA 🏆', score: 8 }, { name: 'EYÜP KARACAOĞLU', score: 8 }, { name: 'FATİH AYAN', score: 8 },
  { name: 'GAZİ AYAN 🏆🏆', score: 8 }, { name: 'HUDAVER TOPARDIC', score: 8 }, { name: 'KEMAL ERSOY', score: 8 },
  { name: 'ÖNDER ASLAN', score: 8 }, { name: 'SAVAŞ ÇAĞLAYAN', score: 8 }, { name: 'ŞENOL CAN ÇAKICI', score: 8 },
  { name: 'ABDULLAH DİK', score: 7 }, { name: 'AHMET BİRCAN 🏆', score: 7 }, { name: 'B.VEYSELOĞLU EROL', score: 7 },
  { name: 'BİROL DEMİREL', score: 7 }, { name: 'MAHMUT CBR', score: 7 }, { name: 'MUHSİN ASİLKAN', score: 7 },
  { name: 'OZKAYA MAZAKALI BAYRAM', score: 7 }, { name: 'YUSUF ERBAY', score: 7 }, { name: 'YUSUF KIZILTUĞ', score: 7 },
  { name: 'DOĞAÇ ALKAN', score: 6 }, { name: 'İLYAS KAZDAL', score: 6 }, { name: 'İLYAS UYGUN', score: 6 },
  { name: 'LEVENT YILDIRIM', score: 6 }, { name: 'SALİH KARACAOĞLU', score: 6 }, { name: 'ULAŞ ADIGÜZEL', score: 6 },
  { name: 'BEKİR KARADAĞ', score: 5 }, { name: 'CUMALİ SÖKER', score: 5 }, { name: 'MEVLÜT EVLER', score: 5 },
  { name: 'RIDVAN DOGER', score: 5 }, { name: 'SEDAT DİŞLİ', score: 5 }, { name: 'UĞUR VARDAR', score: 5 },
  { name: 'MURAT ALİ', score: 4 }, { name: 'UĞUR GÜRBÜZ', score: 4 }, { name: 'CEMALETTİN BELLİ', score: 3 },
  { name: 'AYGÜN AKKEÇELİ', score: 2 }, { name: 'ŞEMSETTIN DÜGER', score: 2 }, { name: 'BAYRAM YILMAZ', score: 1 },
  { name: 'YAHŞİ ERKAN 🏆', score: 1 }, { name: 'İSMAİL YILDIRIM', score: 0 }, { name: 'MUHAMMED M.ASLANOĞLU', score: 0 },
  { name: 'MUSTAFA TUCİ', score: 0 }, { name: 'MUZAFFER KESKİN', score: 0 }, { name: 'ŞAHİN GEZGİNCİ', score: 0 }
];

export default function SkorDurumuPage() {
  const [activeTab, setActiveTab] = useState<'MASTER' | 'DFO' | 'TFF'>('MASTER');

  const getActiveList = () => {
    if (activeTab === 'DFO') return dfoSkor;
    if (activeTab === 'TFF') return tffSkor;
    return masterSkor; 
  };

  const currentList = getActiveList();

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center min-h-screen">
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-amber-500 tracking-wider uppercase drop-shadow-md px-2">
          ELİT TAHMİN SKOR TAM İSABET BARAJ MERKEZİ
        </h1>
      </div>

      <div className="w-full max-w-3xl mx-auto mt-2">
        <div className="flex justify-center gap-2 mb-6">
          <button onClick={() => setActiveTab('MASTER')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 shadow-md border ${activeTab === 'MASTER' ? 'bg-amber-600 text-white border-amber-400 scale-105 shadow-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'}`}>🏆 MASTER</button>
          <button onClick={() => setActiveTab('DFO')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 shadow-md border ${activeTab === 'DFO' ? 'bg-blue-600 text-white border-blue-400 scale-105 shadow-blue-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'}`}>🌍 DFO</button>
          <button onClick={() => setActiveTab('TFF')} className={`px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 shadow-md border ${activeTab === 'TFF' ? 'bg-red-600 text-white border-red-400 scale-105 shadow-red-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'}`}>🇹🇷 TFF</button>
        </div>

        <div className="w-full bg-[#0a0f1c] rounded-xl overflow-hidden mb-6 border border-[#1e293b]">
          <div className="w-full flex items-center justify-between px-4 py-3 bg-[#0f172a] border-b border-[#1e293b]">
            <div className="flex items-center gap-2 text-slate-300 font-bold text-[11px] uppercase tracking-wider">
              <span>🎯</span>
              <span>{activeTab === 'MASTER' ? 'MASTER' : activeTab === 'DFO' ? 'DFO' : 'TFF'} TAM İSABET SAYISI</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="text-[#64748b] uppercase text-[10px] bg-[#0f172a]">
                <tr>
                  <th className="pl-2 md:pl-4 pr-1 py-3 w-12 md:w-16 text-left">SIRA</th>
                  <th className="px-1 md:px-2 py-3 text-left">YARIŞMACI</th>
                  <th className="pr-2 md:pr-4 pl-1 py-3 text-center whitespace-nowrap">TAM İSABET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {currentList.map((row: any, idx) => {
                  const trend = row.trend || 'same';
                  const trendDiff = row.trendDiff || 0;
                  return (
                  <tr key={idx} className="hover:bg-[#0f172a]/40 transition-colors animate-fadeIn">
                    <td className="pl-2 md:pl-4 pr-1 py-3 text-[#94a3b8] font-medium align-middle">
                      <div className="flex items-center gap-1">
                        <span className="w-4 text-left">{idx + 1}</span>
                        <span className="text-[#475569]">-</span>
                        <div className="w-5 flex justify-center">
                          {trend === 'up' && <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-0.5 animate-bounce">▲ <span className="text-[8px]">{trendDiff}</span></span>}
                          {trend === 'down' && <span className="text-red-500 text-[10px] font-bold flex items-center gap-0.5">▼ <span className="text-[8px]">{trendDiff}</span></span>}
                          {trend === 'same' && <span className="text-transparent text-[8px]">-</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-1 md:px-2 py-3 align-middle"><div className="flex flex-wrap items-center gap-2 text-white font-semibold"><span className="whitespace-nowrap">{row.name}</span></div></td>
                    <td className={`pr-2 md:pr-4 pl-1 py-3 text-center font-bold text-sm align-middle ${activeTab === 'MASTER' ? 'text-amber-500' : activeTab === 'DFO' ? 'text-blue-400' : 'text-red-500'}`}>{row.score}</td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}