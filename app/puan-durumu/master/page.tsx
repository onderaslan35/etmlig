'use client';

import React, { useState, useEffect } from 'react';
import LiveMatchCard from '@/components/LiveMatchCard';
import { supabase } from '@/utils/supabase'; 

const allPlayersMasterList: Record<string, string> = {
  "262701": "MUHAMMET OKUMUŞ", "262702": "MURAT KARA", "262703": "CEMALETTİN BELLİ", "262704": "YAPAY ZEKA", "262705": "AHMET BİRCAN 🏆",
  "262706": "GAZİ AYAN 🏆🏆", "262707": "HAKAN AYAN", "262708": "BAYRAM YILMAZ", "262709": "SALİH KARACAOĞLU", "262710": "MUZAFFER ERTUĞRUL",
  "262711": "RIDVAN DOGER", "262712": "MURAT AYDEMİR", "262713": "VAHİT KÜLCÜ", "262714": "İSMAİL EKER 🏆", "262715": "ŞEMSETTIN DÜGER",
  "262716": "BİROL DEMİREL", "262717": "MURAT ALİ", "262718": "BEKİR KARADAĞ", "262719": "UĞUR VARDAR", "262720": "HASAN ASLAN",
  "262721": "MUSTAFA GÜMÜŞÇÜ", "262722": "MUSTAFA ERKAN", "262723": "AYHAN LUŞOĞLU", "262724": "YÜCEL TOMAK", "262725": "İLYAS KAZDAL",
  "262726": "HUDAVER TOPARDIC", "262727": "YAHŞİ ERKAN🏆", "262728": "ÖNDER ASLAN", "262729": "HAKAN GÜN", "262730": "ÖNDER IŞIK",
  "262731": "FATİH AYAN", "262732": "R. İLHAN KARACA 🏆🏆", "262733": "MUHSİN ASİLKAN", "262734": "LEVENT YILDIRIM", "262735": "AYGÜN AKKEÇELİ",
  "262736": "MEHMET ALİ KARA", "262737": "ŞAHİN GEZGİNCİ", "262738": "MEVLÜT EVLER", "262739": "UĞUR GÜRBÜZ", "262740": "ABDULLAH DİK",
  "262741": "SABAHATTİN ÇAYLAK", "262742": "ZEKERiYYA TOPKAYYA", "262743": "MEHMET ALİ ŞAHİN", "262744": "İLYAS UYGUN", "262745": "OĞUZ YILDIRIMKAYA",
  "262746": "MEHMET BAYIR", "262747": "SAVAŞ ÇAĞLAYAN", "262748": "YASİN ŞAHİN", "262749": "B.VEYSELOĞLU EROL", "262750": "MAHMUT CBR",
  "262751": "HÜSEYİN ERBAŞ", "262810": "ADEM BULUT ERTÜRK", "262753": "YUSUF KIZILTUĞ", "262754": "OSMAN ALİ AYDIN 🏆", "262755": "DOĞAÇ ALKAN",
  "262756": "EYÜP KARACAOĞLU", "262813": "KEMAL ERSOY", "262758": "MELİH PINAR", "262762": "İLHAN DANIŞ", "262763": "MUSTAFA ELMAS",
  "262770": "OZKAYA MAZAKALI BAYRAM", "262771": "ULAŞ ADIGÜZEL", "262772": "CEMAL SİVRİKAYA 🏆", "262760": "UĞUR NES", "262774": "ŞENOL CAN ÇAKICI",
  "262776": "CUMA OKUR", "262777": "MİRAÇ TOPAL", "262778": "CENGİZ SAYAN", "262780": "YUSUF KILIÇ", "262781": "KADİR SOLMAZ",
  "262782": "YUSUF ERBAY", "262783": "YASİN AYAN", "262784": "MEHMET AVCI", "262785": "METE BÜYÜKGÖL 🏆", "262786": "SEDAT DİŞLİ",
  "262787": "MUSTAFA TUCİ", "262788": "HAKAN ÇİFTÇİ", "262789": "ALİ ABUKAN", "262790": "CUMALİ SÖKER", "351925": "ALİOS GÖZTEPE",
  "350909": "DİNÇER ÖZER", "262815": "MURAT KAYA", "262816": "SEDAT SEDAT", "262795": "SEFA İÇA", "262796": "D. SERGEN TAŞYÜREK",
  "262797": "ÖMER DOGER"
};

const masterWeek1Data: Record<string, { name: string; puan: number }> = {
  "262736": { name: "MEHMET ALİ KARA", puan: 34 }, "262755": { name: "DOĞAÇ ALKAN", puan: 24 },
  "262719": { name: "UĞUR VARDAR", puan: 23 }, "262756": { name: "EYÜP KARACAOĞLU", puan: 17 },
  "262754": { name: "OSMAN ALİ AYDIN 🏆", puan: 14 }, "262786": { name: "SEDAT DİŞLİ", puan: 12 },
  "262731": { name: "FATİH AYAN", puan: 11 }, "262717": { name: "MURAT ALİ", puan: 11 },
  "262732": { name: "R. İLHAN KARACA 🏆🏆", puan: 10 }, "262726": { name: "HUDAVER TOPARDIC", puan: 10 },
  "262750": { name: "MAHMUT CBR", puan: 9 }, "262747": { name: "SAVAŞ ÇAĞLAYAN", puan: 8 },
  "262771": { name: "ULAŞ ADIGÜZEL", puan: 8 }, "262728": { name: "ÖNDER ASLAN", puan: 8 },
  "262816": { name: "SEDAT SEDAT", puan: 7 }, "262716": { name: "BİROL DEMİREL", puan: 7 },
  "262790": { name: "CUMALİ SÖKER", puan: 7 }, "262733": { name: "MUHSİN ASİLKAN", puan: 7 },
  "262709": { name: "SALİH KARACAOĞLU", puan: 5 }, "262753": { name: "YUSUF KIZILTUĞ", puan: 4 },
  "262813": { name: "KEMAL ERSOY", puan: 4 }, "262740": { name: "ABDULLAH DİK", puan: 4 },
  "262718": { name: "BEKİR KARADAĞ", puan: 3 }, "262707": { name: "HAKAN AYAN", puan: 1 },
  "262782": { name: "YUSUF ERBAY", puan: 1 }, "262702": { name: "MURAT KARA", puan: 1 },
  "262714": { name: "İSMAİL EKER 🏆", puan: 1 }, "262721": { name: "MUSTAFA GÜMÜŞÇÜ", puan: 1 },
  "262706": { name: "GAZİ AYAN 🏆🏆", puan: 1 }, "262787": { name: "MUSTAFA TUCİ", puan: 1 },
  "262744": { name: "İLYAS UYGUN", puan: 1 }, "262774": { name: "ŞENOL CAN ÇAKICI", puan: 1 },
  "262715": { name: "ŞEMSETTIN DÜGER", puan: 1 }, "262723": { name: "AYHAN LUŞOĞLU", puan: 1 },
  "351925": { name: "ALİOS GÖZTEPE", puan: 0 }, "262749": { name: "B.VEYSELOĞLU EROL", puan: 0 },
  "262705": { name: "AHMET BİRCAN 🏆", puan: 0 }, "262708": { name: "BAYRAM YILMAZ", puan: 0 },
  "262711": { name: "RIDVAN DOGER", puan: 0 }, "262712": { name: "MURAT AYDEMİR", puan: 0 },
  "262734": { name: "LEVENT YILDIRIM", puan: 0 }
}; 

const masterWeek2Data: Record<string, { name: string; puan: number }> = {
  "262756": { name: "EYÜP KARACAOĞLU", puan: 19 }, "262755": { name: "DOĞAÇ ALKAN", puan: 13 },
  "262709": { name: "SALİH KARACAOĞLU", puan: 13 }, "262790": { name: "CUMALİ SÖKER", puan: 12 },
  "262772": { name: "CEMAL SİVRİKAYA 🏆", puan: 12 }, "262728": { name: "ÖNDER ASLAN", puan: 11 },
  "262726": { name: "HUDAVER TOPARDIC", puan: 9 }, "262711": { name: "RIDVAN DOGER", puan: 8 },
  "262717": { name: "MURAT ALİ", puan: 7 }, "262737": { name: "ŞAHİN GEZGİNCİ", puan: 7 },
  "262705": { name: "AHMET BİRCAN 🏆", puan: 6 }, "262816": { name: "SEDAT SEDAT", puan: 6 },
  "262774": { name: "ŞENOL CAN ÇAKICI", puan: 6 }, "262732": { name: "R. İLHAN KARACA 🏆🏆", puan: 6 },
  "262786": { name: "SEDAT DİŞLİ", puan: 6 }, "262721": { name: "MUSTAFA GÜMÜŞÇÜ", puan: 5 },
  "262738": { name: "MEVLÜT EVLER", puan: 5 }, "262714": { name: "İSMAİL EKER 🏆", puan: 4 },
  "262763": { name: "MUSTAFA ELMAS", puan: 2 }, "262736": { name: "MEHMET ALİ KARA", puan: 2 },
  "262740": { name: "ABDULLAH DİK", puan: 2 }, "262702": { name: "MURAT KARA", puan: 2 },
  "262703": { name: "CEMALETTİN BELLİ", puan: 2 }, "262730": { name: "ÖNDER IŞIK", puan: 2 },
  "262715": { name: "ŞEMSETTIN DÜGER", puan: 2 }, "262749": { name: "B.VEYSELOĞLU EROL", puan: 2 },
  "262725": { name: "İLYAS KAZDAL", puan: 1 }, "262758": { name: "MELİH PINAR", puan: 1 },
  "262771": { name: "ULAŞ ADIGÜZEL", puan: 1 }, "262754": { name: "OSMAN ALİ AYDIN 🏆", puan: 1 },
  "262747": { name: "SAVAŞ ÇAĞLAYAN", puan: 1 }, "262716": { name: "BİROL DEMİREL", puan: 1 },
  "262708": { name: "BAYRAM YILMAZ", puan: 1 }, "262731": { name: "FATİH AYAN", puan: 1 },
  "262739": { name: "UĞUR GÜRBÜZ", puan: 1 }, "262813": { name: "KEMAL ERSOY", puan: 0 },
  "262712": { name: "MURAT AYDEMİR", puan: 0 }, "262734": { name: "LEVENT YILDIRIM", puan: 0 },
  "351925": { name: "ALİOS GÖZTEPE", puan: 0 }, "262744": { name: "İLYAS UYGUN", puan: 0 },
  "262718": { name: "BEKİR KARADAĞ", puan: 0 }, "262704": { name: "YAPAY ZEKA", puan: 0 },
  "262733": { name: "MUHSİN ASİLKAN", puan: 0 }, "262707": { name: "HAKAN AYAN", puan: 0 },
  "262750": { name: "MAHMUT CBR", puan: 0 }, "262753": { name: "YUSUF KIZILTUĞ", puan: 0 },
  "262706": { name: "GAZİ AYAN 🏆🏆", puan: 0 }, "262723": { name: "AYHAN LUŞOĞLU", puan: 0 },
  "262719": { name: "UĞUR VARDAR", puan: 0 }, "262782": { name: "YUSUF ERBAY", puan: 0 },
  "262770": { name: "OZKAYA MAZAKALI BAYRAM", puan: 0 }
}; 

const masterWeek3Data: Record<string, { name: string; puan: number }> = {
  "262816": { name: "SEDAT SEDAT", puan: 31 }, "262733": { name: "MUHSİN ASİLKAN", puan: 19 },
  "262721": { name: "MUSTAFA GÜMÜŞÇÜ", puan: 11 }, "262707": { name: "HAKAN AYAN", puan: 11 },
  "262763": { name: "MUSTAFA ELMAS", puan: 11 }, "262771": { name: "ULAŞ ADIGÜZEL", puan: 11 },
  "262706": { name: "GAZİ AYAN 🏆🏆", puan: 11 }, "262734": { name: "LEVENT YILDIRIM", puan: 9 },
  "262813": { name: "KEMAL ERSOY", puan: 8 }, "262756": { name: "EYÜP KARACAOĞLU", puan: 8 },
  "262755": { name: "DOĞAÇ ALKAN", puan: 8 }, "262754": { name: "OSMAN ALİ AYDIN 🏆", puan: 7 },
  "351925": { name: "ALİOS GÖZTEPE", puan: 7 }, "262702": { name: "MURAT KARA", puan: 7 },
  "262786": { name: "SEDAT DİŞLİ", puan: 7 }, "262711": { name: "RIDVAN DOGER", puan: 7 },
  "262726": { name: "HUDAVER TOPARDIC", puan: 6 }, "262725": { name: "İLYAS KAZDAL", puan: 6 },
  "262728": { name: "ÖNDER ASLAN", puan: 6 }, "262736": { name: "MEHMET ALİ KARA", puan: 6 },
  "262709": { name: "SALİH KARACAOĞLU", puan: 5 }, "262714": { name: "İSMAİL EKER 🏆", puan: 5 },
  "262730": { name: "ÖNDER IŞIK", puan: 5 }, "262753": { name: "YUSUF KIZILTUĞ", puan: 5 },
  "262738": { name: "MEVLÜT EVLER", puan: 5 }, "262782": { name: "YUSUF ERBAY", puan: 4 }, 
  "262705": { name: "AHMET BİRCAN 🏆", puan: 4 }, "262774": { name: "ŞENOL CAN ÇAKICI", puan: 4 },
  "262740": { name: "ABDULLAH DİK", puan: 4 }, "262723": { name: "AYHAN LUŞOĞLU", puan: 3 },
  "262772": { name: "CEMAL SİVRİKAYA 🏆", puan: 2 }, "262739": { name: "UĞUR GÜRBÜZ", puan: 2 },
  "262731": { name: "FATİH AYAN", puan: 2 }, "262747": { name: "SAVAŞ ÇAĞLAYAN", puan: 2 },
  "262732": { name: "R. İLHAN KARACA 🏆🏆", puan: 2 }, "262749": { name: "B.VEYSELOĞLU EROL", puan: 2 },
  "262716": { name: "BİROL DEMİREL", puan: 1 }, "262770": { name: "OZKAYA MAZAKALI BAYRAM", puan: 1 },
  "262790": { name: "CUMALİ SÖKER", puan: 0 }, "262719": { name: "UĞUR VARDAR", puan: 0 },
  "262708": { name: "BAYRAM YILMAZ", puan: 0 }, "262744": { name: "İLYAS UYGUN", puan: 0 },
  "262758": { name: "MELİH PINAR", puan: 0 }, "262718": { name: "BEKİR KARADAĞ", puan: 0 },
  "262750": { name: "MAHMUT CBR", puan: 0 }, "262717": { name: "MURAT ALİ", puan: 0 },
  "262703": { name: "CEMALETTİN BELLİ", puan: 0 }
};

// 🌟 4. HAFTAYI ARTIK "SABİTLEDİK" (DONDURDUK) - ESKİ ETİKETLER ÇÖPE GİTTİ! 🌟
const masterWeek4Data: Record<string, { name: string; puan: number }> = {
  "262736": { name: "MEHMET ALİ KARA", puan: 11 }, "262755": { name: "DOĞAÇ ALKAN", puan: 7 },
  "262816": { name: "SEDAT SEDAT", puan: 8 }, "262756": { name: "EYÜP KARACAOĞLU", puan: 3 },
  "262786": { name: "SEDAT DİŞLİ", puan: 13 }, "262733": { name: "MUHSİN ASİLKAN", puan: 5 },
  "262728": { name: "ÖNDER ASLAN", puan: 0 }, "262726": { name: "HUDAVER TOPARDIC", puan: 5 },
  "262709": { name: "SALİH KARACAOĞLU", puan: 2 }, "262719": { name: "UĞUR VARDAR", puan: 8 },
  "262754": { name: "OSMAN ALİ AYDIN 🏆", puan: 0 }, "262771": { name: "ULAŞ ADIGÜZEL", puan: 1 },
  "262721": { name: "MUSTAFA GÜMÜŞÇÜ", puan: 5 }, "262790": { name: "CUMALİ SÖKER", puan: 1 },
  "262717": { name: "MURAT ALİ", puan: 12 }, "262732": { name: "R. İLHAN KARACA 🏆🏆", puan: 2 },
  "262711": { name: "RIDVAN DOGER", puan: 7 }, "262731": { name: "FATİH AYAN", puan: 13 },
  "262772": { name: "CEMAL SİVRİKAYA 🏆", puan: 0 }, "262763": { name: "MUSTAFA ELMAS", puan: 4 },
  "262707": { name: "HAKAN AYAN", puan: 9 }, "262706": { name: "GAZİ AYAN 🏆🏆", puan: 2 },
  "262813": { name: "KEMAL ERSOY", puan: 11 }, "262774": { name: "ŞENOL CAN ÇAKICI", puan: 16 }, // BONUSLAR TOPLANDI
  "262747": { name: "SAVAŞ ÇAĞLAYAN", puan: 0 }, "262705": { name: "AHMET BİRCAN 🏆", puan: 0 },
  "262714": { name: "İSMAİL EKER 🏆", puan: 17 }, // BONUS EKLENDİ
  "262740": { name: "ABDULLAH DİK", puan: 2 }, "262702": { name: "MURAT KARA", puan: 8 },
  "262738": { name: "MEVLÜT EVLER", puan: 5 }, "262753": { name: "YUSUF KIZILTUĞ", puan: 9 },
  "262716": { name: "BİROL DEMİREL", puan: 6 }, "262750": { name: "MAHMUT CBR", puan: 5 },
  "262734": { name: "LEVENT YILDIRIM", puan: 8 }, "262725": { name: "İLYAS KAZDAL", puan: 1 },
  "262737": { name: "ŞAHİN GEZGİNCİ", puan: 0 }, "351925": { name: "ALİOS GÖZTEPE", puan: 4 },
  "262730": { name: "ÖNDER IŞIK", puan: 13 }, "262782": { name: "YUSUF ERBAY", puan: 0 },
  "262749": { name: "B.VEYSELOĞLU EROL", puan: 13 }, "262718": { name: "BEKİR KARADAĞ", puan: 11 },
  "262715": { name: "ŞEMSETTİN DÜGER", puan: 0 }, "262739": { name: "UĞUR GÜRBÜZ", puan: 10 },
  "262703": { name: "CEMALETTİN BELLİ", puan: 3 }, "262758": { name: "MELİH PINAR", puan: 16 },
  "262770": { name: "OZKAYA MAZAKALI BAYRAM", puan: 6 }, "262708": { name: "BAYRAM YILMAZ", puan: 0 },
  "262787": { name: "MUSTAFA TUCİ", puan: 0 }, "262744": { name: "İLYAS UYGUN", puan: 2 },
  "262712": { name: "MURAT AYDEMİR", puan: 0 }, "262704": { name: "YAPAY ZEKA", puan: 6 },
  "262723": { name: "AYHAN LUŞOĞLU", puan: 5 }
};

export default function MasterPuanDurumuPage() {
  const [activeTab, setActiveTab] = useState<string>('total');
  const [isWeekMenuOpen, setIsWeekMenuOpen] = useState<boolean>(false);
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [adminStatus, setAdminStatus] = useState<string>('NOT_STARTED');
  const [predictionsDB, setPredictionsDB] = useState<Record<string, string[]>>({}); 
  
  const availableWeeks = [1, 2, 3, 4, 5]; // 🚀 5. HAFTA EKLENDİ

  const loadLeaderboard = async () => {
    try {
      const { data: dbMatches } = await supabase.from('live_matches').select('*');
      const { data: dbPredictions } = await supabase.from('player_predictions').select('*').eq('week_num', 5);

      // 🚀 5. HAFTA TAHMİNLERİNİ DB'DEN ÇEKİYORUZ
      const predDict: Record<string, string[]> = {};
      if (dbPredictions) {
        dbPredictions.forEach(pred => {
          const uid = String(pred.user_id);
          if (!predDict[uid]) predDict[uid] = Array(24).fill('-');
          predDict[uid][pred.match_index - 1] = pred.predicted_score;
        });
      }
      setPredictionsDB(predDict);
      
      let w5Base: Record<string, number> = {}; 
      let w5Live: Record<string, number> = {}; 
      let w5ExactHits: Record<string, number> = {}; 
      let w5LiveExactHits: Record<string, number> = {}; 
      let isAnyMatchLive = false;
      let finishedCount = 0; 

      Object.keys(allPlayersMasterList).forEach(id => {
        w5Base[id] = 0;
        w5Live[id] = 0;
        w5ExactHits[id] = 0;
        w5LiveExactHits[id] = 0;
      });

      if (dbMatches) {
        const uniqueMatches: Record<number, any> = {};
        dbMatches.forEach(row => {
          uniqueMatches[row.id] = row; 
        });

        Object.values(uniqueMatches).forEach(dbMatch => {
          // SADECE 5. HAFTA MAÇLARINI KONTROL EDİYORUZ (ID'si 500'den büyük olanlar)
          if (dbMatch.id > 500) {
              if (dbMatch.status === 'FINISHED') finishedCount++;

              if (dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-') {
                // 🚀 ARRAY KAYMASI ÇÖZÜLDÜ (501 id -> 0. index)
                const matchIndex = (dbMatch.id % 100) - 1; 
                const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`;
                
                const winnerIds = Object.keys(predDict).filter(id => predDict[id] && predDict[id][matchIndex] === targetScore);
                
                let points = 1;
                if(winnerIds.length === 1) points = 12;
                else if(winnerIds.length === 2) points = 6;
                else if(winnerIds.length === 3) points = 5;
                else if(winnerIds.length === 4) points = 4;
                else if(winnerIds.length === 5) points = 3;
                else if(winnerIds.length === 6) points = 2;
                else if(winnerIds.length >= 7) points = 1;
                else points = 0;

                winnerIds.forEach(wId => {
                  if (dbMatch.status === 'FINISHED') {
                    w5Base[wId] += points; 
                    w5ExactHits[wId] += 1; 
                  } else if (dbMatch.status === 'LIVE' || dbMatch.status === 'WAITING_APPROVAL') {
                    w5Live[wId] += points; 
                    w5LiveExactHits[wId] += 1; 
                    isAnyMatchLive = true;
                  }
                });
              }
          }
        });

        // 🏆 EKMEL BONUS MOTORU V3.1 (SADECE 5. HAFTA 24. MAÇ BİTİNCE) 🏆
        let puanKraliId: string | null = null;
        let skorKraliId: string | null = null;
        
        const match524 = uniqueMatches[524];
        const isEngineActive = match524 && (match524.status === 'LIVE' || match524.status === 'WAITING_APPROVAL' || match524.status === 'FINISHED');

        if (isEngineActive) {
          let maxPuan = -1; let maxPuanCount = 0; let tempPuanKrali: string | null = null;
          let maxSkor = -1; let maxSkorCount = 0; let tempSkorKrali: string | null = null;

          Object.keys(allPlayersMasterList).forEach(id => {
            const totalP = (w5Base[id] || 0) + (w5Live[id] || 0);
            if (totalP > maxPuan) {
              maxPuan = totalP; maxPuanCount = 1; tempPuanKrali = id;
            } else if (totalP === maxPuan) maxPuanCount++;

            const totalHits = (w5ExactHits[id] || 0) + (w5LiveExactHits[id] || 0);
            if (totalHits > maxSkor) {
              maxSkor = totalHits; maxSkorCount = 1; tempSkorKrali = id;
            } else if (totalHits === maxSkor) maxSkorCount++;
          });

          if (maxPuanCount === 1 && tempPuanKrali && maxPuan > 0) puanKraliId = tempPuanKrali;
          if (maxSkorCount === 1 && tempSkorKrali && maxSkor > 0) skorKraliId = tempSkorKrali;
        }

        setAdminStatus(isAnyMatchLive ? 'LIVE' : 'NOT_STARTED');

        if (activeTab === 'total') {
          // Önceki haftaların (1, 2, 3, 4) toplamı (TREND OKLARI İÇİN REFERANS)
          const referenceList = Object.keys(allPlayersMasterList).map(id => {
            const w1 = masterWeek1Data[id]?.puan || 0;
            const w2 = masterWeek2Data[id]?.puan || 0;
            const w3 = masterWeek3Data[id]?.puan || 0;
            const w4 = masterWeek4Data[id]?.puan || 0;
            const basePuan = w1 + w2 + w3 + w4;
            const finalName = allPlayersMasterList[id];
            return { id, name: finalName, basePuan };
          }).sort((a, b) => b.basePuan - a.basePuan || a.name.localeCompare(b.name, 'tr'));

          const prevRanks: Record<string, number> = {};
          referenceList.forEach((player, index) => { prevRanks[player.id] = index + 1; });

          const baseList = Object.keys(allPlayersMasterList).map(id => {
            const w1 = masterWeek1Data[id]?.puan || 0;
            const w2 = masterWeek2Data[id]?.puan || 0;
            const w3 = masterWeek3Data[id]?.puan || 0;
            const w4 = masterWeek4Data[id]?.puan || 0;
            let w5B = w5Base[id] || 0; 
            
            let pBonus = id === puanKraliId;
            let sBonus = id === skorKraliId;

            // Yeni 5. Hafta Bonusları
            if (pBonus) w5B += 3;
            if (sBonus) w5B += 3;

            // YEPYENİ 5. HAFTA CANLI PUANLARI (1 Puan vb.) BURADA TOPLANIYOR!
            const liveExtra = w5Live[id] || 0; 
            const basePuan = w1 + w2 + w3 + w4 + w5B;
            const finalName = allPlayersMasterList[id];

            return { 
              id, 
              name: finalName, 
              basePuan, 
              liveExtra, 
              puan: basePuan + liveExtra,
              hasPuanBonus: pBonus,
              hasSkorBonus: sBonus
            };
          }).sort((a, b) => b.puan - a.puan || a.name.localeCompare(b.name, 'tr'));

          const finalRows = baseList.map((player, index) => {
            const currentRank = index + 1;
            const prevRank = prevRanks[player.id];
            let trend = 'same';
            let trendDiff = 0; 
            
            if (currentRank < prevRank) {
              trend = 'up'; trendDiff = prevRank - currentRank; 
            } else if (currentRank > prevRank) {
              trend = 'down'; trendDiff = currentRank - prevRank; 
            }
            
            return { ...player, currentRank, prevRank, trend, trendDiff };
          });

          setTableRows(finalRows);
        } else {
          // SADECE 5. HAFTAYI GÖRMEK İSTEYENLER İÇİN
          if(activeTab === 'week5') {
            const list = Object.keys(allPlayersMasterList).map(id => {
              let basePuan = w5Base[id] || 0; 
              const liveExtra = w5Live[id] || 0; 
              
              let pBonus = id === puanKraliId;
              let sBonus = id === skorKraliId;

              if (pBonus) basePuan += 3;
              if (sBonus) basePuan += 3;

              return { 
                id, 
                name: allPlayersMasterList[id], 
                puan: basePuan + liveExtra, 
                liveExtra, 
                trend: 'none', 
                trendDiff: 0,
                hasPuanBonus: pBonus,
                hasSkorBonus: sBonus
              };
            });
            setTableRows(list.sort((a, b) => b.puan - a.puan || a.name.localeCompare(b.name, 'tr')));
          } else {
            let dataMap = masterWeek1Data;
            if(activeTab === 'week2') dataMap = masterWeek2Data;
            if(activeTab === 'week3') dataMap = masterWeek3Data;
            if(activeTab === 'week4') dataMap = masterWeek4Data;

            const list = Object.keys(allPlayersMasterList).map(id => {
              const rawObj = dataMap[id];
              const basePuan = rawObj ? rawObj.puan : 0;
              
              // GEÇMİŞ HAFTALARIN SABİTLENMİŞ BONUSLARI (4. Hafta rozetleri dahil, ama "Total" sekmesinde gözükmeyecekler)
              let pBonus = false;
              let sBonus = false;

              if (activeTab === 'week1') {
                if (id === "262736") pBonus = true; 
                if (id === "262755") sBonus = true; 
              } else if (activeTab === 'week2') {
                if (id === "262756") pBonus = true; 
              } else if (activeTab === 'week3') {
                if (id === "262816") { pBonus = true; sBonus = true; }
              } else if (activeTab === 'week4') {
                if (id === "262714") pBonus = true; // İSMAİL EKER LİDER
                if (id === "262774") sBonus = true; // ŞENOL CAN SKOR
              }

              return { 
                id, 
                name: rawObj ? rawObj.name : allPlayersMasterList[id], 
                puan: basePuan, 
                liveExtra: 0, 
                trend: 'none', 
                trendDiff: 0,
                hasPuanBonus: pBonus,
                hasSkorBonus: sBonus
              };
            });
            setTableRows(list.sort((a, b) => b.puan - a.puan || a.name.localeCompare(b.name, 'tr')));
          }
        }
      }
    } catch (error) {
      console.log("Supabase verileri okunurken hata oluştu");
    }
  };

  useEffect(() => {
    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 5000); 
    return () => clearInterval(interval);
  }, [activeTab]);

  const selectTab = (tabKey: string) => {
    setActiveTab(tabKey);
    setIsWeekMenuOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-amber-400 tracking-wider uppercase drop-shadow-md">
          ELİT TAHMİN MASTER LİGİ
        </h1>
      </div>

      <div className="w-full mb-6">
        <LiveMatchCard />
      </div>

      <div className="max-w-xl flex flex-col items-center mb-6 space-y-3 w-full">
        <button onClick={() => selectTab('total')} className={`px-8 py-2.5 rounded-xl font-black text-sm md:text-base transition-all duration-200 border w-full text-center shadow-md uppercase tracking-wider ${activeTab === 'total' ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20 scale-[1.02]' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'}`}>
          MASTER TOPLAM PUAN DURUMU
        </button>
        <div className="w-full relative">
          <button onClick={() => setIsWeekMenuOpen(!isWeekMenuOpen)} className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs md:text-sm border transition-all flex items-center justify-between shadow-md ${activeTab !== 'total' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'}`}>
            <span>📅 {activeTab === 'total' ? 'TOPLAM PUAN DURUMU' : `MASTER ${activeTab.replace('week', '')}. HAFTA PUAN DURUMU`}</span>
            <span className="text-xs transition-transform duration-200">{isWeekMenuOpen ? '▲ KAPAT' : '▼ HAFTALAR'}</span>
          </button>
          
          {isWeekMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-slate-900/95 border border-slate-700/80 p-3 rounded-2xl shadow-2xl backdrop-blur-md">
              <div className="flex flex-wrap justify-center gap-1.5 max-h-56 overflow-y-auto pr-1">
                {availableWeeks.map((weekNum) => {
                  const weekKey = `week${weekNum}`;
                  return (
                    <button 
                      key={weekNum} 
                      onClick={() => selectTab(weekKey)} 
                      className={`w-12 py-1.5 text-xs font-bold rounded-lg border transition-all text-center flex-shrink-0 ${activeTab === weekKey ? 'bg-amber-500 text-slate-950 border-amber-400 scale-105 shadow-sm' : 'bg-slate-950/90 text-slate-300 border-slate-800 hover:bg-amber-500/20 hover:text-amber-300'}`}
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
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] sm:text-xs border-b border-slate-800">
                <tr>
                  <th className="px-2 sm:px-6 py-3 sm:py-3.5 w-12 sm:w-24 text-center">SIRA</th>
                  <th className="px-2 sm:px-6 py-3 sm:py-3.5">YARIŞMACI</th>
                  <th className="px-2 sm:px-6 py-3 sm:py-3.5 text-right whitespace-nowrap">{activeTab === 'total' ? 'TOPLAM PUAN' : 'HAFTALIK PUAN'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tableRows.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-2 sm:px-6 py-3 sm:py-3.5 text-center align-middle">
                      <div className="flex items-center justify-center gap-0.5 sm:gap-2">
                        <span className="text-slate-300 font-medium text-xs sm:text-sm w-4 sm:w-5 text-center sm:text-right">{row.currentRank || idx + 1}</span>
                        
                        <div className="w-6 sm:w-10 flex items-center justify-start">
                          {activeTab === 'total' && row.trend === 'up' && (
                            <span className="text-emerald-400 text-[10px] sm:text-xs font-bold animate-bounce flex items-center gap-0.5">
                              ▲ <span className="text-[8px] sm:text-[10px]">{row.trendDiff}</span>
                            </span>
                          )}
                          {activeTab === 'total' && row.trend === 'down' && (
                            <span className="text-red-500 text-[10px] sm:text-xs font-bold flex items-center gap-0.5">
                              ▼ <span className="text-[8px] sm:text-[10px]">{row.trendDiff}</span>
                            </span>
                          )}
                          {activeTab === 'total' && row.trend === 'same' && (
                            <span className="text-slate-600 text-[8px] sm:text-[10px] ml-0.5 sm:ml-1">▶</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-3.5 w-full max-w-[120px] sm:max-w-none">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap overflow-hidden">
                        
                        {(() => {
                          const trophyCount = (row.name.match(/🏆/g) || []).length;
                          const cleanName = row.name.replace(/🏆/g, '').trim();
                          
                          return (
                            <>
                              <span className="text-slate-200 font-semibold truncate whitespace-nowrap flex-shrink-0" title={cleanName}>
                                {cleanName}
                              </span>
                              
                              {trophyCount > 0 && (
                                <span className="flex-shrink-0 text-amber-400 text-[10px] sm:text-xs tracking-widest whitespace-nowrap">
                                  {'🏆'.repeat(trophyCount)}
                                </span>
                              )}
                            </>
                          );
                        })()}

                        {/* 🌟 5. HAFTANIN YENİ ETİKET MOTORU 🌟 */}
                        {row.hasPuanBonus && (
                          <span className="bg-amber-900/80 text-amber-300 border border-amber-500/50 text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded shadow-sm flex-shrink-0 ml-1 whitespace-nowrap">
                            +3 LİDERLİK BONUSU
                          </span>
                        )}
                        {row.hasSkorBonus && (
                          <span className="bg-emerald-900/80 text-emerald-300 border border-emerald-500/50 text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded shadow-sm flex-shrink-0 ml-1 whitespace-nowrap">
                            +3 SKOR BONUSU
                          </span>
                        )}
                        
                        {/* 🌟 EFSANEVİ CANLI PUAN YANSITMASI (Örn: +1 CANLI) 🌟 */}
                        {row.liveExtra > 0 && activeTab === 'total' && adminStatus === 'LIVE' && (
                          <span className="bg-emerald-950/80 text-emerald-400 text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse flex-shrink-0">
                            +{row.liveExtra} CANLI
                          </span>
                        )}

                        {row.liveExtra > 0 && activeTab !== 'total' && (
                          <span className={`text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md border shadow-sm flex-shrink-0 ${adminStatus === 'LIVE' ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse' : 'bg-cyan-950/80 text-cyan-400 border-cyan-500/50'}`}>
                            +{row.liveExtra} {adminStatus === 'LIVE' ? 'CANLI' : '(MAÇ)'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`px-2 sm:px-6 py-3 sm:py-3.5 text-right font-bold text-sm sm:text-base whitespace-nowrap ${row.liveExtra > 0 && activeTab !== 'total' ? "text-emerald-400" : "text-amber-400"}`}>
                      {row.puan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 font-medium text-xs sm:text-sm">⏳ Veriler bulunamadı.</div>
        )}
      </div>
    </div>
  );
}