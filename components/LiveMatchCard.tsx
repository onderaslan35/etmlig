'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

const allPlayersList: Record<string, string> = {
  "262756": "EYÜP KARACAOĞLU", "262755": "DOĞAÇ ALKAN", "262816": "SEDAT SEDAT", "262736": "MEHMET ALİ KARA",
  "262786": "SEDAT DİŞLİ", "262733": "MUHSİN ASİLKAN", "262728": "ÖNDER ASLAN", "262726": "HUDAVER TOPARDIC",
  "262709": "SALİH KARACAOĞLU", "262719": "UĞUR VARDAR", "262754": "OSMAN ALİ AYDIN", "262771": "ULAŞ ADIGÜZEL",
  "262721": "MUSTAFA GÜMÜŞÇÜ", "262790": "CUMALİ SÖKER", "262717": "MURAT ALİ", "262732": "R. İLHAN KARACA",
  "262711": "RIDVAN DOGER", "262731": "FATİH AYAN", "262772": "CEMAL SİVRİKAYA", "262763": "MUSTAFA ELMAS",
  "262707": "HAKAN AYAN", "262706": "GAZİ AYAN", "262813": "KEMAL ERSOY", "262774": "ŞENOL CAN ÇAKICI",
  "262747": "SAVAŞ ÇAĞLAYAN", "262705": "AHMET BİRCAN", "262714": "İSMAİL EKER", "262740": "ABDULLAH DİK",
  "262702": "MURAT KARA", "262738": "MEVLÜT EVLER", "262753": "YUSUF KIZILTUĞ", "262716": "BİROL DEMİREL",
  "262750": "MAHMUT CBR", "262734": "LEVENT YILDIRIM", "262725": "İLYAS KAZDAL", "262737": "ŞAHİN GEZGİNCİ",
  "351925": "ALİOS GÖZTEPE", "262730": "ÖNDER IŞIK", "262782": "YUSUF ERBAY",
  "262749": "B.VEYSELOĞLU EROL", "262718": "BEKİR KARADAĞ", "262715": "ŞEMSETTİN DÜGER", "262739": "UĞUR GÜRBÜZ",
  "262703": "CEMALETTİN BELLİ", "262758": "MELİH PINAR", "262770": "OZKAYA MAZAKALI BAYRAM", "262708": "BAYRAM YILMAZ",
  "262787": "MUSTAFA TUCİ", "262744": "İLYAS UYGUN", "262712": "MURAT AYDEMİR", "262704": "YAPAY ZEKA"
};

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
  "262730": ["0-3", "3-0", "1-0", "3-1", "2-0", "1-1", "0-2", "0-1", "0-0", "0-1", "0-2", "0-3", "2-0", "2-1", "0-2", "2-0", "1-1", "1-2", "3-0", "0-1", "0-2", "0-0", "1-1", "2-1"],
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
  "262782": ["0-2", "0-0", "0-1", "1-0", "1-0", "0-0", "0-4", "1-0", "0-1", "0-0", "0-1", "0-3", "0-0", "0-0", "0-1", "0-0", "0-0", "0-0", "3-1", "0-0", "0-1", "0-0", "0-0", "0-0"],
  "262739": ["1-0", "3-1", "1-1", "3-0", "3-1", "0-1", "1-2", "3-1", "2-0", "2-0", "2-1", "1-2", "3-0", "2-0", "2-1", "3-2", "1-0", "1-0", "2-0", "1-1", "0-1", "1-1", "1-2", "1-0"]
};

const localTeamLogos: Record<string, string> = {
  "FENERBAHÇE": "/logos/fenerbahce.png", "STURM GRAZ": "/logos/sturm-graz.png"
};

const week4Matches = [
  { id: 1, weekLabel: "4. HAFTA 1. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR RÖVANŞ MAÇI", date: "11.08.2026", time: "21:30", homeTeam: "STURM GRAZ", awayTeam: "FENERBAHÇE" }
];

export default function LiveMatchCard() {
  const [todaysMatches, setTodaysMatches] = useState<any[]>([]);
  const [matchStatus, setMatchStatus] = useState<string>('NOT_STARTED');
  const [homeScore, setHomeScore] = useState<string>('-');
  const [awayScore, setAwayScore] = useState<string>('-');
  const [baseMinute, setBaseMinute] = useState<string>('');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(new Date().getTime());
  const [openWinnersMap, setOpenWinnersMap] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date().getTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setTodaysMatches(week4Matches);
    
    // 🔴 SEYİRCİ KARTI: DÜNYAYA AÇILAN KAPI (SUPABASE DİNLEYİCİSİ)
    const fetchFromDB = async () => {
      try {
        const { data, error } = await supabase.from('live_matches').select('*').eq('id', 1).single();
        
        if (data) {
          setMatchStatus(data.status);
          setHomeScore(data.home_score);
          setAwayScore(data.away_score);
          setBaseMinute(data.base_minute);
          setStartedAt(data.started_at);
          
          if (data.home_score !== '-' && data.away_score !== '-') {
            const targetScore = `${data.home_score}-${data.away_score}`;
            const winnerIds = Object.keys(week4PredictionsData).filter(id => week4PredictionsData[id][0] === targetScore);
            
            let points = 1;
            if(winnerIds.length === 1) points = 12;
            else if(winnerIds.length === 2) points = 6;
            else if(winnerIds.length === 3) points = 5;
            else if(winnerIds.length === 4) points = 4;
            else if(winnerIds.length === 5) points = 3;
            else if(winnerIds.length === 6) points = 2;

            const currentBoard = {}; 
            winnerIds.forEach(wId => {
              currentBoard[wId] = { dfo: points, master: points, skor: 1 };
            });
            
            localStorage.setItem('elitTahmin_Leaderboard', JSON.stringify(currentBoard));
            window.dispatchEvent(new Event('leaderboardUpdate')); 
          } else {
            localStorage.removeItem('elitTahmin_Leaderboard');
            window.dispatchEvent(new Event('leaderboardUpdate')); 
          }
        }
      } catch (e) {
        console.log("Supabase baglantisi bekleniyor...");
      }
    };

    fetchFromDB(); 
    const interval = setInterval(fetchFromDB, 5000); // Her 5 saniyede bir Supabase'i kontrol et!
    return () => clearInterval(interval);
  }, []);

  const toggleWinners = (matchId: number) => {
    setOpenWinnersMap((prev) => ({ ...prev, [matchId]: !prev[matchId] })); 
  };

  // 🔴 AKILLI DAKİKA HESAPLAMA MOTORU (Sen dokunmasan da saniye saniye sayar!)
  const getDisplayMinute = () => {
    if (!startedAt || !baseMinute || baseMinute === 'İY' || baseMinute === 'MS') return baseMinute;
    
    const elapsedMins = Math.floor((now - startedAt) / 60000);
    let base = 0;
    let extra = 0;

    if (baseMinute.includes('+')) {
      const parts = baseMinute.split('+');
      base = parseInt(parts[0]);
      extra = parseInt(parts[1]);
    } else {
      base = parseInt(baseMinute);
    }

    const total = base + extra + elapsedMins;

    if (base <= 45) {
      if (total > 45) return `45+${total - 45}`;
      return `${total}`;
    } else {
      if (total > 90) return `90+${total - 90}`;
      return `${total}`;
    }
  };

  if (todaysMatches.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto mb-8 flex flex-col gap-6">
      {todaysMatches.map((match) => {
        const homeLogoUrl = localTeamLogos[match.homeTeam] || "/logos/default.png";
        const awayLogoUrl = localTeamLogos[match.awayTeam] || "/logos/default.png";
        const isWinnersOpen = openWinnersMap[match.id] !== false;

        let currentWinners: string[] = [];
        if ((matchStatus === 'LIVE' || matchStatus === 'FINISHED' || matchStatus === 'HT') && homeScore !== '-' && awayScore !== '-') {
          const targetScore = `${homeScore}-${awayScore}`;
          currentWinners = Object.keys(week4PredictionsData)
            .filter(id => week4PredictionsData[id][match.id - 1] === targetScore)
            .map(id => allPlayersList[id])
            .sort((a, b) => a.localeCompare(b, 'tr'));
        }
        const winnersCount = currentWinners.length;

        let displayPoints = 1;
        if(winnersCount === 1) displayPoints = 12;
        else if(winnersCount === 2) displayPoints = 6;
        else if(winnersCount === 3) displayPoints = 5;
        else if(winnersCount === 4) displayPoints = 4;
        else if(winnersCount === 5) displayPoints = 3;
        else if(winnersCount === 6) displayPoints = 2;
        else if(winnersCount === 0) displayPoints = 0;

        let countdownText = "";
        if (matchStatus === 'NOT_STARTED') {
          const matchDateParts = match.date.split('.');
          const matchTimeParts = match.time.split(':');
          const matchTargetDate = new Date(parseInt(matchDateParts[2]), parseInt(matchDateParts[1]) - 1, parseInt(matchDateParts[0]), parseInt(matchTimeParts[0]), parseInt(matchTimeParts[1]), 0).getTime();
          const distance = matchTargetDate - now;
          if (distance > 0) {
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);
            countdownText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
          }
        }

        const currentDisplayMinute = getDisplayMinute();

        return (
          <div key={match.id} className="w-full max-w-lg mx-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/60 via-[#0a1120] to-[#050b14] border border-blue-500/30 rounded-2xl shadow-[0_0_30px_rgba(30,58,138,0.5)] overflow-hidden transition-all duration-500 flex flex-col relative">
            
            <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50 blur-sm"></div>

            <div className="p-4 sm:p-6 relative flex-grow z-10">
              <div className="absolute top-0 right-0 bg-blue-900/80 text-blue-200 font-black px-3 py-1 rounded-bl-xl text-[10px] border-b border-l border-blue-500/50 shadow-md backdrop-blur-sm">
                {match.weekLabel}
              </div>

              <div className="text-center mb-6 mt-3">
                <span className="text-blue-300 text-xs sm:text-sm font-bold uppercase tracking-wider flex justify-center items-center gap-2 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]">
                  🏆 {match.category}
                </span>
              </div>

              <div className="flex items-center justify-between px-2 sm:px-6">
                <div className="flex flex-col items-center justify-center flex-1 gap-3">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 border border-blue-400/30 rounded-full flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-sm relative">
                    <img src={homeLogoUrl} alt={match.homeTeam} className="w-full h-full object-cover scale-[1.02] drop-shadow-lg" />
                  </div>
                  <span className="text-white font-extrabold text-[10px] sm:text-xs text-center uppercase tracking-wide drop-shadow-md">{match.homeTeam}</span>
                </div>

                <div className="flex flex-col items-center justify-center gap-2.5 mx-2 sm:mx-4 w-28 sm:w-32 z-10">
                  
                  {matchStatus === 'NOT_STARTED' && (
                    <div className="bg-slate-900/80 border border-slate-600/80 px-4 py-1 rounded-full shadow-sm backdrop-blur-md">
                      <span className="text-amber-400 text-xs sm:text-sm font-bold tracking-widest drop-shadow-md">⏱ {match.time}</span>
                    </div>
                  )}

                  {matchStatus === 'LIVE' && (
                    <div className="bg-red-950/80 border border-red-700 px-4 py-1 rounded-full shadow-sm flex items-center gap-1.5 animate-pulse backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span className="text-red-500 text-xs font-black tracking-widest">CANLI {currentDisplayMinute}'</span>
                    </div>
                  )}

                  {matchStatus === 'HT' && (
                    <div className="bg-amber-950/80 border border-amber-700 px-4 py-1 rounded-full shadow-sm backdrop-blur-md">
                      <span className="text-amber-500 text-[10px] sm:text-xs font-black tracking-widest">İY (BİTTİ)</span>
                    </div>
                  )}

                  {matchStatus === 'FINISHED' && (
                    <div className="bg-slate-900/80 border border-slate-600/80 px-4 py-1 rounded-full shadow-sm backdrop-blur-md">
                      <span className="text-slate-400 text-xs font-black tracking-widest">MS (BİTTİ)</span>
                    </div>
                  )}

                  <div className="w-full bg-[#080d1a]/80 border border-blue-600/40 py-3 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 sm:gap-3 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md">
                    <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{homeScore}</span>
                    <span className="text-lg sm:text-xl font-bold text-blue-400/50">:</span>
                    <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{awayScore}</span>
                  </div>

                  {matchStatus === 'NOT_STARTED' && countdownText && (
                    <div className="w-full bg-[#0c2a3b]/50 border border-[#164e63]/50 py-1.5 rounded-lg text-center shadow-md">
                      <span className="text-[#38bdf8] text-[10px] sm:text-[11px] font-mono font-bold tracking-widest drop-shadow-sm">
                        {countdownText}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center flex-1 gap-3">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 border border-blue-400/30 rounded-full flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-sm relative">
                    <img src={awayLogoUrl} alt={match.awayTeam} className="w-full h-full object-cover scale-[1.02] drop-shadow-lg" />
                  </div>
                  <span className="text-white font-extrabold text-[10px] sm:text-xs text-center uppercase tracking-wide drop-shadow-md">{match.awayTeam}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#050b14]/90 border-t border-blue-900/30 px-4 py-3 w-full backdrop-blur-md z-10">
              <div className="flex justify-between items-center w-full">
                <div className="text-left flex-1">
                  {matchStatus === 'NOT_STARTED' ? (
                    <span className="text-[10px] sm:text-xs font-medium text-slate-400 italic">Maç saatini bekliyor...</span>
                  ) : winnersCount === 0 ? (
                    <span className="text-[10px] sm:text-xs font-medium text-slate-400 italic">Şu an skoru bilen yok</span>
                  ) : (
                    <span className="text-[10px] sm:text-xs font-medium text-blue-200">
                      <strong className="text-blue-400">{winnersCount} kişi</strong> tam isabetli
                    </span>
                  )}
                </div>

                <div className="flex-0 text-center px-1">
                  <span className="text-[9px] font-black tracking-widest whitespace-nowrap px-2.5 py-0.5 rounded block shadow-[0_0_10px_currentColor] border text-cyan-300 bg-cyan-950/90 border-cyan-400/80">
                    MASTER & DFO MAÇI
                  </span>
                </div>

                <div className="text-right flex-1">
                  {winnersCount > 0 && (
                    <button onClick={() => toggleWinners(match.id)} className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-[10px] sm:text-xs outline-none whitespace-nowrap drop-shadow-sm">
                      {isWinnersOpen ? "Gizle ▲" : "Bilenleri gör →"}
                    </button>
                  )}
                </div>
              </div>
              
              {isWinnersOpen && winnersCount > 0 && (
                <div className="w-full mt-3 p-3 bg-blue-950/20 rounded-lg border border-blue-800/40 text-xs animate-fadeIn shadow-inner">
                  <div className="text-blue-300/80 font-semibold mb-2 border-b border-blue-900/50 pb-1.5 flex justify-between items-center text-[10px] sm:text-[11px]">
                    <span>CANLI SKOR BİLENLER (A-Z)</span>
                    <span className="text-blue-300 font-bold bg-blue-900/40 px-2 py-0.5 rounded border border-blue-700/50">Kişi Başı: {displayPoints} Puan</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {currentWinners.map((winner: string, idx: number) => (
                      <span key={idx} className="border px-2 py-1 rounded text-[9px] sm:text-[10px] font-medium transition-all duration-500 bg-blue-900/60 text-white border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                        {winner}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}