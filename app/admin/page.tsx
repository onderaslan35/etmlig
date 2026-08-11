'use client';

import React, { useState } from 'react';

// TÜM YARIŞMACILAR LİSTESİ
const allPlayersList: Record<string, string> = {
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

// 🔴 EKMEL - 4. HAFTA TAHMİN MATRİSİ (ADMİN İÇİN EKLENDİ)
const week4PredictionsData: Record<string, string[]> = {
  "262731": ["1-1", "3-1", "1-1", "2-0", "3-0", "2-2", "1-3", "1-1", "2-1", "1-2", "1-0", "1-3", "2-1", "1-2", "2-2", "2-1", "2-1", "1-1", "3-1", "1-1", "1-1", "1-1", "1-1", "2-1"],
  "262758": ["1-2", "3-0", "2-0", "3-0", "4-1", "1-1", "1-3", "1-1", "1-1", "0-2", "2-1", "0-3", "3-0", "1-1", "2-1", "2-1", "3-0", "3-0", "3-0", "1-1", "0-3", "1-1", "1-2", "3-0"],
  "262763": ["1-1", "1-1", "1-1", "2-0", "4-0", "1-1", "0-2", "1-0", "1-0", "1-1", "1-1", "1-1", "1-1", "2-0", "1-1", "1-1", "1-1", "1-0", "3-0", "1-1", "1-1", "1-1", "1-1", "1-0"],
  "262744": ["1-2", "3-1", "1-1", "2-0", "4-0", "2-0", "1-2", "1-1", "1-0", "0-0", "2-2", "0-4", "2-0", "2-0", "1-2", "2-1", "0-1", "0-2", "2-0", "0-1", "0-2", "0-2", "1-1", "0-1"],
  "262813": ["1-2", "4-1", "1-0", "3-2", "2-0", "2-0", "1-3", "1-1", "3-0", "2-2", "1-2", "0-4", "1-1", "2-2", "2-0", "1-0", "2-0", "1-2", "2-0", "1-2", "1-3", "0-0", "0-1", "1-2"],
  "351925": ["0-2", "0-0", "2-1", "1-0", "3-0", "0-0", "0-2", "0-0", "0-0", "0-0", "0-0", "0-3", "2-1", "0-0", "2-0", "2-1", "0-0", "0-2", "2-0", "0-0", "0-2", "0-0", "0-2", "0-0"],
  "262732": ["2-1", "2-1", "1-0", "1-1", "2-0", "3-1", "2-2", "2-1", "2-0", "1-1", "1-1", "0-3", "2-0", "1-1", "2-1", "0-1", "1-1", "1-1", "2-1", "1-2", "0-2", "0-2", "2-1", "1-0"],
  "262754": ["1-1", "1-0", "1-0", "2-0", "3-0", "1-0", "0-2", "1-0", "1-0", "0-2", "1-0", "0-3", "2-0", "1-0", "1-2", "1-0", "1-0", "1-1", "2-0", "1-0", "0-1", "0-1", "1-0", "1-0"],
  "262733": ["2-1", "3-1", "0-0", "3-0", "2-0", "0-1", "1-4", "2-0", "0-0", "1-0", "1-1", "0-3", "2-0", "2-1", "2-1", "2-0", "1-1", "1-0", "3-0", "1-1", "0-1", "1-1", "3-1", "1-0"],
  "262774": ["0-1", "2-0", "1-0", "2-0", "3-1", "1-1", "0-2", "1-1", "1-2", "1-2", "1-1", "0-2", "1-0", "0-0", "2-0", "0-0", "1-2", "2-1", "2-0", "1-1", "0-2", "0-0", "3-1", "0-2"],
  "262771": ["2-2", "3-1", "2-1", "4-0", "5-0", "1-1", "1-3", "1-1", "2-2", "1-1", "2-1", "1-4", "3-1", "3-0", "2-1", "1-0", "1-1", "3-1", "3-1", "1-3", "1-1", "1-1", "1-1", "2-1"],
  "262730": ["0-2", "3-0", "1-0", "3-1", "2-0", "1-1", "0-2", "0-1", "0-0", "0-1", "0-2", "0-3", "2-0", "2-1", "0-2", "2-0", "1-1", "1-2", "3-0", "0-1", "0-2", "0-0", "1-1", "2-1"],
  "262707": ["0-4", "3-0", "2-1", "1-1", "1-0", "0-0", "0-2", "0-0", "2-1", "0-2", "0-0", "0-4", "1-0", "0-0", "0-0", "0-0", "0-0", "0-0", "2-0", "1-0", "0-2", "0-0", "0-0", "0-2"],
  "262816": ["0-1", "3-1", "0-2", "1-0", "2-0", "0-0", "0-3", "1-1", "3-0", "0-2", "0-0", "0-2", "3-0", "0-2", "2-0", "1-1", "2-1", "1-3", "3-0", "0-0", "0-2", "0-3", "2-0", "0-1"],
  "262719": ["2-1", "2-1", "2-0", "2-1", "3-0", "2-1", "0-2", "3-1", "2-1", "1-1", "1-2", "0-2", "3-0", "2-1", "2-1", "1-1", "1-2", "2-1", "3-0", "2-1", "1-1", "2-1", "1-2", "2-0"],
  "262725": ["0-2", "2-0", "1-1", "3-0", "3-0", "1-0", "0-2", "1-1", "2-0", "2-1", "2-1", "0-2", "2-0", "0-0", "1-1", "1-0", "2-0", "1-0", "2-0", "0-1", "0-2", "1-0", "1-0", "0-1"],
  "262711": ["0-1", "3-1", "1-0", "3-0", "3-0", "2-1", "0-4", "0-0", "1-1", "1-3", "1-1", "1-2", "2-2", "1-0", "1-1", "2-1", "0-0", "2-1", "3-0", "0-0", "1-1", "1-2", "2-2", "2-0"],
  "262718": ["1-2", "4-1", "3-1", "3-0", "4-1", "1-1", "1-3", "2-2", "2-1", "1-1", "1-2", "1-3", "2-0", "2-1", "2-2", "2-1", "2-2", "1-1", "3-1", "2-2", "1-2", "1-3", "2-2", "1-2"],
  "262721": ["0-1", "2-0", "1-0", "3-1", "2-1", "0-2", "0-3", "2-1", "2-0", "1-2", "1-1", "0-3", "3-1", "1-1", "0-1", "0-2", "0-1", "0-2", "2-0", "0-2", "0-3", "0-1", "2-2", "0-1"],
  "262726": ["1-3", "2-2", "2-2", "3-0", "4-0", "1-1", "1-2", "2-1", "1-1", "1-1", "1-2", "0-3", "1-1", "2-1", "0-2", "0-2", "2-0", "1-1", "2-0", "3-1", "2-2", "0-2", "1-0", "2-1"],
  "262702": ["0-2", "1-0", "1-1", "3-1", "2-0", "1-0", "0-2", "0-1", "0-0", "0-1", "1-0", "0-3", "2-0", "1-0", "0-1", "1-0", "1-0", "2-0", "3-0", "1-1", "0-0", "0-1", "0-0", "2-0"],
  "262738": ["1-1", "2-1", "1-1", "1-0", "3-0", "2-1", "1-3", "2-1", "2-1", "1-1", "2-1", "1-3", "2-0", "1-1", "2-2", "2-1", "2-1", "1-1", "2-0", "2-1", "1-1", "1-1", "2-1", "1-1"],
  "262750": ["1-1", "3-1", "2-2", "3-1", "3-0", "1-1", "1-3", "2-1", "0-0", "1-2", "2-2", "0-3", "3-1", "2-0", "2-2", "0-0", "1-1", "0-2", "3-1", "0-2", "0-3", "1-2", "1-3", "2-0"],
  "262705": ["1-3", "3-1", "2-1", "3-1", "3-1", "3-0", "1-3", "1-2", "3-1", "1-2", "1-2", "0-3", "2-0", "3-0", "2-1", "2-1", "2-0", "2-0", "4-0", "3-1", "0-1", "0-2", "1-2", "1-1"],
  "262706": ["0-2", "4-1", "1-0", "3-0", "2-0", "0-2", "0-2", "0-0", "0-0", "0-1", "0-0", "0-2", "0-2", "0-0", "0-1", "0-0", "0-0", "0-1", "2-0", "2-1", "0-2", "0-2", "0-0", "2-0"],
  "262716": ["1-1", "3-2", "1-0", "3-1", "3-0", "3-1", "0-3", "0-0", "3-1", "0-2", "1-1", "0-4", "2-0", "3-1", "1-1", "3-0", "2-1", "1-1", "4-0", "2-1", "0-2", "0-2", "1-1", "1-2"],
  "262736": ["1-2", "2-1", "1-2", "3-0", "4-0", "2-1", "2-4", "3-1", "2-2", "2-2", "3-2", "1-1", "3-1", "3-0", "1-1", "4-1", "2-1", "2-1", "1-0", "2-1", "1-1", "1-1", "1-1", "3-0"],
  "262714": ["1-3", "2-0", "0-2", "0-0", "2-0", "0-1", "1-1", "0-0", "2-0", "0-1", "2-0", "0-3", "1-1", "0-1", "1-1", "0-0", "0-0", "1-0", "1-0", "0-0", "1-0", "1-1", "0-1", "0-1"],
  "262749": ["2-1", "3-1", "2-0", "3-0", "3-1", "2-2", "1-2", "2-1", "2-0", "2-0", "2-2", "1-3", "2-1", "2-1", "2-1", "1-1", "2-1", "1-1", "2-1", "2-1", "0-2", "1-2", "2-2", "1-1"],
  "262753": ["1-1", "2-1", "2-0", "3-0", "1-1", "1-0", "3-2", "1-1", "1-0", "2-2", "2-2", "0-3", "2-0", "1-2", "1-1", "1-1", "1-1", "0-1", "2-0", "1-1", "1-2", "1-1", "0-2", "1-1"],
  "262740": ["1-2", "1-1", "2-1", "2-0", "3-0", "1-2", "1-3", "1-1", "2-2", "1-1", "2-1", "1-3", "3-0", "1-1", "2-2", "2-1", "1-1", "1-2", "3-1", "2-1", "1-2", "2-1", "2-2", "1-1"],
  "262790": ["0-2", "3-1", "0-2", "0-2", "4-0", "0-2", "0-3", "3-1", "1-1", "2-0", "1-1", "0-3", "3-1", "2-1", "0-3", "2-1", "1-1", "2-0", "2-1", "1-0", "2-1", "1-1", "0-2", "0-2"],
  "262786": ["1-2", "3-1", "3-1", "3-0", "2-1", "1-1", "1-2", "1-1", "1-2", "2-0", "2-1", "1-1", "3-1", "2-0", "1-1", "1-2", "1-1", "1-1", "3-1", "2-1", "2-0", "1-2", "1-2", "1-1"],
  "262734": ["3-0", "4-1", "2-1", "3-1", "4-1", "2-1", "1-2", "3-2", "2-1", "3-2", "3-1", "2-1", "3-0", "2-3", "1-2", "3-1", "2-1", "3-2", "4-1", "3-1", "2-1", "3-1", "2-1", "3-1"],
  "262756": ["2-2", "3-2", "2-0", "4-2", "1-2", "1-2", "1-3", "1-2", "0-0", "0-0", "2-1", "1-3", "2-2", "1-2", "1-2", "1-2", "0-0", "0-0", "2-0", "0-0", "2-2", "0-1", "1-1", "1-3"],
  "262703": ["2-2", "1-1", "1-1", "2-1", "1-0", "1-1", "1-3", "2-2", "0-1", "0-0", "1-1", "0-2", "0-0", "0-0", "2-2", "1-1", "1-1", "0-0", "2-1", "1-1", "0-1", "1-1", "2-2", "0-0"],
  "262772": ["0-2", "2-0", "1-1", "1-1", "1-0", "0-0", "0-1", "0-0", "1-0", "1-2", "2-3", "0-3", "2-0", "1-1", "1-1", "1-0", "0-1", "1-0", "2-1", "1-1", "0-0", "0-1", "0-0", "0-1"],
  "262717": ["1-2", "0-1", "1-1", "2-2", "2-2", "2-0", "0-2", "1-2", "0-0", "0-2", "0-1", "0-2", "2-0", "1-2", "1-1", "1-0", "1-2", "0-0", "2-1", "1-0", "1-1", "3-2", "1-2", "0-0"],
  "262728": ["0-0", "0-0", "1-0", "2-1", "4-1", "0-1", "0-2", "1-1", "0-1", "0-0", "1-0", "0-5", "4-0", "2-0", "2-3", "1-2", "0-0", "0-0", "3-0", "0-0", "0-2", "0-1", "0-2", "0-0"],
  "262770": ["3-1", "3-1", "2-2", "2-0", "2-1", "1-1", "1-3", "0-2", "2-0", "0-3", "0-1", "0-4", "2-1", "1-1", "2-1", "2-0", "1-1", "1-0", "3-0", "2-3", "0-2", "1-2", "0-2", "3-1"],
  "262755": ["1-2", "4-1", "3-2", "2-1", "3-2", "1-1", "3-3", "2-1", "1-0", "0-1", "1-1", "0-2", "1-1", "3-0", "1-2", "4-2", "3-1", "2-2", "1-0", "2-2", "1-0", "3-2", "1-0", "3-1"],
  "262704": ["1-1", "2-1", "1-1", "2-0", "3-0", "0-1", "1-2", "2-1", "1-0", "0-1", "1-1", "1-3", "1-0", "2-0", "2-1", "2-0", "1-1", "1-1", "2-1", "1-1", "1-2", "0-2", "2-1", "1-1"],
  "262747": ["1-1", "2-0", "1-0", "2-0", "2-0", "1-1", "1-2", "1-1", "1-1", "1-1", "1-1", "1-3", "1-1", "1-1", "1-1", "1-1", "1-1", "1-1", "2-0", "1-1", "1-1", "1-1", "1-1", "1-1"],
  "262723": ["1-1", "3-1", "2-1", "2-0", "3-0", "1-2", "1-2", "2-1", "2-0", "1-2", "1-1", "2-1", "3-1", "3-0", "2-1", "1-1", "2-1", "1-1", "2-1", "1-1", "0-2", "0-2", "1-1", "2-0"],
  "262709": ["1-1", "2-1", "2-1", "2-0", "3-0", "1-1", "1-2", "1-1", "1-0", "1-0", "2-1", "0-2", "2-1", "2-0", "1-1", "1-0", "1-1", "2-1", "2-1", "1-1", "0-3", "0-2", "1-2", "1-0"],
  "262739": ["1-0", "3-1", "1-1", "3-0", "3-1", "0-1", "1-2", "3-1", "2-0", "2-0", "2-1", "1-2", "3-0", "2-0", "2-1", "3-2", "1-0", "1-0", "2-0", "1-1", "0-1", "1-1", "1-2", "1-0"]
};

// 4. HAFTA MAÇLARI YAPI
const week4Matches = [
  { id: 1, title: "4. HAFTA - 1. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR RÖVANŞ MAÇI", homeTeam: "STURM GRAZ", awayTeam: "FENERBAHÇE" },
  { id: 2, title: "4. HAFTA - 2. MAÇ", category: "UEFA SÜPER KUPA", homeTeam: "PARIS SAINT-GERMAIN", awayTeam: "ASTON VILLA" },
  { id: 3, title: "4. HAFTA - 3. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR RÖVANŞ", homeTeam: "KARABAĞ FK", awayTeam: "DINAMO KIEV" },
  { id: 4, title: "4. HAFTA - 4. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR RÖVANŞ", homeTeam: "BEŞİKTAŞ", awayTeam: "HRADEC KRALOVE" },
  { id: 5, title: "4. HAFTA - 5. MAÇ", category: "TÜRKİYE SÜPER LİG", homeTeam: "GALATASARAY", awayTeam: "ÇORUM FK" },
  { id: 6, title: "4. HAFTA - 6. MAÇ", category: "TÜRKİYE 1.LİG", homeTeam: "EROKSPOR", awayTeam: "SARIYER" },
  { id: 7, title: "4. HAFTA - 7. MAÇ", category: "TÜRKİYE SÜPER LİG", homeTeam: "KASIMPAŞA", awayTeam: "TRABZONSPOR" },
  { id: 8, title: "4. HAFTA - 8. MAÇ", category: "TÜRKİYE SÜPER LİG", homeTeam: "KONYASPOR", awayTeam: "ÇAYKUR RİZE" }
];

export default function AdminTahminmatik() {
  const [selectedWeek, setSelectedWeek] = useState<number>(4);
  const [matchInputs, setMatchInputs] = useState<Record<number, { home: string, away: string }>>({});

  // 🔴 EKMEL - OTOMATİK PUAN HESAPLAYICI MOTOR
  // Sen 1 dedin 12 verdim, 2 dedin 6 verdim, 3 dedin 5 verdim...
  const calculatePoints = (winnersCount: number) => {
    if (winnersCount === 0) return 0;
    if (winnersCount === 1) return 12;
    if (winnersCount === 2) return 6;
    if (winnersCount === 3) return 5;
    if (winnersCount === 4) return 4;
    if (winnersCount === 5) return 3;
    if (winnersCount === 6) return 2;
    return 1; // 7 ve üzeri kişi bilirse 1 puan
  };

  const handleScoreChange = (matchId: number, type: 'home' | 'away', value: string) => {
    setMatchInputs(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [type]: value
      }
    }));
  };

  // 🔴 EKMEL - GİRİLEN SKORA GÖRE BİLENLERİ BULMA ALGORİTMASI
  const getWinnersForMatch = (matchIndex: number, home: string, away: string) => {
    if (!home || !away || home === "-" || away === "-") return [];
    
    // Veritabanındaki format "0-0" şeklinde. Dropdown'dan gelenlerle birleştiriyoruz.
    const targetScore = `${home}-${away}`;
    const winners: string[] = [];
    
    Object.keys(week4PredictionsData).forEach(playerId => {
      const preds = week4PredictionsData[playerId];
      if (preds && preds[matchIndex] && preds[matchIndex] === targetScore) {
        winners.push(allPlayersList[playerId] || "Bilinmeyen Oyuncu");
      }
    });
    
    // A'dan Z'ye sırala
    return winners.sort((a, b) => a.localeCompare(b, 'tr'));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 text-slate-100 min-h-screen">
      
      {/* BAŞLIK VE MENÜ */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-amber-400 tracking-tight uppercase flex items-center gap-3">
          ⚡ ADMIN TAHMİNMATİK
        </h1>
        <button className="mt-4 md:mt-0 bg-red-950/80 border border-red-800 text-red-400 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm hover:bg-red-900 hover:text-red-300 transition-colors shadow-lg">
          📌 SİSTEMİ & PUANLARI SIFIRLA
        </button>
      </div>

      {/* HAFTA SEKMELERİ */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center sm:justify-start">
        {[1, 2, 3, 4].map(week => (
          <button 
            key={week}
            onClick={() => setSelectedWeek(week)}
            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-md ${selectedWeek === week ? 'bg-amber-500 text-slate-950 border border-amber-400 scale-105' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}
          >
            {week}. HAFTA
          </button>
        ))}
      </div>

      {/* MAÇ KARTLARI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {selectedWeek === 4 ? (
          week4Matches.map((match, index) => {
            const currentInputs = matchInputs[match.id] || { home: "-", away: "-" };
            const winners = getWinnersForMatch(index, currentInputs.home, currentInputs.away);
            const earnedPoints = calculatePoints(winners.length);

            return (
              <div key={match.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between">
                
                {/* ÜST BİLGİ */}
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/80">
                  <span className="text-xs font-black text-slate-300 tracking-widest uppercase">{match.title}</span>
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-800 uppercase max-w-[150px] truncate">
                    {match.category}
                  </span>
                </div>

                {/* SKOR GİRİŞ ALANI */}
                <div className="flex items-center justify-between gap-2 sm:gap-4 mb-5">
                  <span className="flex-1 text-right text-xs sm:text-sm font-extrabold text-white uppercase">{match.homeTeam}</span>
                  
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-inner">
                    <select 
                      value={currentInputs.home} 
                      onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                      className="bg-slate-900 text-amber-400 font-bold text-base px-2 py-1 rounded outline-none border border-slate-700 focus:border-amber-500"
                    >
                      <option value="-">-</option>
                      {[0,1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <span className="text-slate-500 font-bold">-</span>
                    <select 
                      value={currentInputs.away} 
                      onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                      className="bg-slate-900 text-amber-400 font-bold text-base px-2 py-1 rounded outline-none border border-slate-700 focus:border-amber-500"
                    >
                      <option value="-">-</option>
                      {[0,1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  
                  <span className="flex-1 text-left text-xs sm:text-sm font-extrabold text-white uppercase">{match.awayTeam}</span>
                </div>

                {/* 🔴 CANLI BİLENLER VE PUAN HESAPLAMA EKRANI */}
                <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 mb-4 min-h-[70px]">
                  <div className="text-xs font-bold mb-2 flex justify-between items-center">
                    <span className="text-amber-500 flex items-center gap-1.5">
                      🎯 Skoru Bilenler [{winners.length} Kişi]:
                    </span>
                    {winners.length > 0 && (
                      <span className="text-[10px] bg-emerald-950/50 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/50">
                        Kişi Başı: {earnedPoints} Puan
                      </span>
                    )}
                  </div>
                  
                  {winners.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {winners.map((winner, idx) => (
                        <span key={idx} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-700">
                          {winner}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 italic">
                      {currentInputs.home === "-" || currentInputs.away === "-" ? "Skor girilmesini bekliyor..." : "Tam skoru bilen bulunamadı."}
                    </div>
                  )}
                </div>

                {/* ALT ONAY BÖLÜMÜ */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-800/80">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    Durum: <span className="text-amber-500">Bekliyor</span>
                  </span>
                  <button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-1.5 rounded-lg text-xs transition-colors shadow-md">
                    ONAYLA & DAĞIT
                  </button>
                </div>
                
              </div>
            );
          })
        ) : (
          <div className="col-span-1 lg:col-span-2 py-12 text-center text-slate-500">
            Seçili haftanın verileri henüz panele yüklenmedi. Lütfen 4. Haftayı seçin.
          </div>
        )}
      </div>
    </div>
  );
}