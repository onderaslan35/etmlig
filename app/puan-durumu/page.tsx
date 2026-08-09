'use client';

import React, { useState } from 'react';

// Skor isabet verileri
const skorData = [
  { id: 1, name: "EYÜP KARACAOĞLU", isabet: 9 },
  { id: 2, name: "DOĞAÇ ALKAN", isabet: 8 },
  { id: 3, name: "MEHMET ALİ KARA", isabet: 6 },
  { id: 4, name: "CUMALİ SÖKER", isabet: 6 },
  { id: 5, name: "HUDAVER TOPARDIC", isabet: 6 },
  { id: 6, name: "ÖNDER ASLAN", isabet: 6 },
  { id: 7, name: "MURAT ALİ", isabet: 5 },
  { id: 8, name: "R. İLHAN KARACA 🏆🏆", isabet: 5 },
  { id: 9, name: "OSMAN ALİ AYDIN 🏆", isabet: 5 },
  { id: 10, name: "UĞUR VARDAR", isabet: 4 },
  { id: 11, name: "SEDAT DİŞLİ", isabet: 4 },
  { id: 12, name: "SEDAT SEDAT", isabet: 4 },
  { id: 13, name: "FATİH AYAN", isabet: 4 },
  { id: 14, name: "SAVAŞ ÇAĞLAYAN", isabet: 4 },
  { id: 15, name: "İSMAİL EKER 🏆", isabet: 4 },
  { id: 16, name: "SALİH KARACAOĞLU", isabet: 3 },
  { id: 17, name: "ULAŞ ADIGÜZEL", isabet: 3 },
  { id: 18, name: "BİROL DEMİREL", isabet: 3 },
  { id: 19, name: "BEKİR KARADAĞ", isabet: 3 },
  { id: 20, name: "MAHMUT CBR", isabet: 2 },
  { id: 21, name: "RIDVAN DOGER", isabet: 2 },
  { id: 22, name: "MUHSİN ASİLKAN", isabet: 2 },
  { id: 23, name: "ŞAHİN GEZGİNCİ", isabet: 2 }
];

export default function SkorDurumuPage() {
  const [tableRows] = useState(skorData.sort((a, b) => b.isabet - a.isabet));

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 text-slate-100">
      
      {/* BAŞLIK: HAFTA SEÇİMİ KADAR BÜYÜTÜLDÜ */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-amber-400 uppercase tracking-widest drop-shadow-md">
          GENEL İSABET DURUMU
        </h1>
      </div>

      {/* İSABET TABLOSU */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 text-center">
          <span className="text-xs font-black text-amber-500 uppercase tracking-widest">
            SIRALAMA LİSTESİ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-xs border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 w-16 text-center">SIRA</th>
                <th className="px-6 py-4">YARIŞMACI</th>
                <th className="px-6 py-4 text-right">İSABET</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tableRows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 text-center font-medium text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-200">
                    {row.name}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-emerald-400 text-base">
                    {row.isabet}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}