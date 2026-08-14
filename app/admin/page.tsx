'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

// YARIŞMACI İSİM SÖZLÜĞÜ (ID'leri İsimlere Çevirmek İçin)
const TEST_ACCOUNTS: Record<string, string> = {
  "mankoman": "MANKOMAN (ADMİN)", "353535": "ADAM KRAL", "262740": "ABDULLAH DİK",
  "262705": "AHMET BİRCAN 🏆", "351925": "ALİOS GÖZTEPE", "262735": "AYGÜN AKKEÇELİ",
  "262723": "AYHAN LUŞOĞLU", "262749": "B.VEYSELOĞLU EROL", "262708": "BAYRAM YILMAZ",
  "262718": "BEKİR KARADAĞ", "262716": "BİROL DEMİREL", "262772": "CEMAL SİVRİKAYA 🏆",
  "262703": "CEMALETTİN BELLİ", "262790": "CUMALİ SÖKER", "350909": "DİNÇER ÖZER",
  "262755": "DOĞAÇ ALKAN", "262756": "EYÜP KARACAOĞLU", "262731": "FATİH AYAN",
  "262706": "GAZİ AYAN 🏆🏆", "262707": "HAKAN AYAN", "262726": "HUDAVER TOPARDIC",
  "262762": "İLHAN DANIŞ", "262725": "İLYAS KAZDAL", "262744": "İLYAS UYGUN",
  "262714": "İSMAİL EKER 🏆", "262813": "KEMAL ERSOY", "262734": "LEVENT YILDIRIM",
  "262750": "MAHMUT CBR", "262736": "MEHMET ALİ KARA", "262758": "MELİH PINAR",
  "262738": "MEVLÜT EVLER", "262701": "MUHAMMET OKUMUŞ", "262733": "MUHSİN ASİLKAN",
  "262717": "MURAT ALİ", "262712": "MURAT AYDEMİR", "262702": "MURAT KARA",
  "262763": "MUSTAFA ELMAS", "262721": "MUSTAFA GÜMÜŞÇÜ", "262787": "MUSTAFA TUCİ",
  "262745": "OĞUZ YILDIRIMKAYA", "262754": "OSMAN ALİ AYDIN 🏆", "262770": "OZKAYA MAZAKALI BAYRAM",
  "262728": "ÖNDER ASLAN", "262730": "ÖNDER IŞIK", "262732": "R. İLHAN KARACA 🏆🏆",
  "262711": "RIDVAN DOGER", "262741": "SABAHATTİN ÇAYLAK", "262709": "SALİH KARACAOĞLU",
  "262747": "SAVAŞ ÇAĞLAYAN", "262786": "SEDAT DİŞLİ", "262816": "SEDAT SEDAT",
  "262737": "ŞAHİN GEZGİNCİ", "262715": "ŞEMSETTIN DÜGER", "262774": "ŞENOL CAN ÇAKICI",
  "262739": "UĞUR GÜRBÜZ", "262719": "UĞUR VARDAR", "262771": "ULAŞ ADIGÜZEL",
  "262704": "YAPAY ZEKA", "262782": "YUSUF ERBAY", "262753": "YUSUF KIZILTUĞ"
};

export default function AdminRadarPortal() {
  const [bulletin, setBulletin] = useState<any[]>([]);
  const [allPredictions, setAllPredictions] = useState<any[]>([]);
  const [liveScores, setLiveScores] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // 1. Maçları çek
    const { data: bData } = await supabase.from('matches_bulletin').select('*').eq('week_num', 5).order('match_index', { ascending: true });
    
    // 2. Herkesin tahminlerini çek (ARŞİVİN KULLANDIĞI ANA KAYNAK BURASI)
    const { data: pData } = await supabase.from('player_predictions').select('*').eq('week_num', 5);

    if (bData) setBulletin(bData);
    if (pData) setAllPredictions(pData);
  };

  const handleScoreInput = (matchIndex: number, value: string) => {
    setLiveScores(prev => ({
      ...prev,
      [matchIndex]: value
    }));
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black text-amber-500 mb-8 text-center tracking-widest">
          🔴 CANLI YÖNETİM RADARI (5. HAFTA)
        </h1>

        <div className="flex flex-col gap-6">
          {bulletin.map((match) => {
            const currentInput = liveScores[match.match_index] || "";
            
            // SENİN VERDİĞİN TAKTİK: Veritabanından herkesin tahminini filtrele (sadece .find değil, .filter kullanıyoruz)
            const winners = allPredictions.filter(p => 
              p.match_index === match.match_index && 
              p.predicted_score === currentInput &&
              currentInput !== "" // Boşken herkesi getirmemesi için
            );

            return (
              <div key={match.match_index} className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                
                {/* MAÇ BAŞLIĞI VE SKOR GİRİŞİ */}
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                  <div className="text-xl font-bold flex-1 text-right">{match.home_team}</div>
                  
                  <div className="px-6 flex flex-col items-center gap-2">
                    <span className="text-xs text-slate-500">SKOR GİRİN (Örn: 2-0)</span>
                    <input 
                      type="text" 
                      placeholder="Skor"
                      value={currentInput}
                      onChange={(e) => handleScoreInput(match.match_index, e.target.value)}
                      className="w-24 text-center bg-slate-950 border border-amber-500/50 text-amber-400 font-black text-xl py-2 rounded outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="text-xl font-bold flex-1 text-left">{match.away_team}</div>
                </div>

                {/* BİLENLER LİSTESİ (RADAR) */}
                <div className="bg-slate-950 rounded-lg p-4 min-h-[80px]">
                  <h3 className="text-sm font-bold text-emerald-500 mb-3 border-b border-emerald-900/50 pb-2">
                    🎯 BU SKORU BİLEN ASLAN PARÇALARI ({winners.length} KİŞİ)
                  </h3>
                  
                  {winners.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {winners.map((winner, idx) => (
                        <span key={idx} className="bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded text-xs font-bold uppercase">
                          {TEST_ACCOUNTS[winner.user_id] || winner.user_id}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-600 text-xs italic">
                      {currentInput ? "Bu skoru bilen yarışmacı bulunmuyor." : "Listeyi görmek için yukarıya skor giriniz."}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}