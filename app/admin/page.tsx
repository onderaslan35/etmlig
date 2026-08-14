'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

// ----------------------------------------------------
// TEMA VE LOGO MOTORU (ARŞİV TASARIMI)
// ----------------------------------------------------
const localTeamLogos: Record<string, string> = {
  "BEŞİKTAŞ": "https://tr.wikipedia.org/wiki/Special:FilePath/BesiktasJK-Logo.svg",
  "KARABAĞ FK": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Qaraba%C4%9F_FK_2024.svg",
  "GALATASARAY": "https://de.wikipedia.org/wiki/Special:FilePath/Galatasaray_S.K._Logo_2026_5-stars.svg",
  "KASIMPAŞA": "https://de.wikipedia.org/wiki/Special:FilePath/Kasimpasa_Logo.svg",
  "TRABZONSPOR": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Trabzonspor_2022.svg",
  "KONYASPOR": "https://fr.wikipedia.org/wiki/Special:FilePath/Konyaspor_(logo).svg",
  "ÇAYKUR RİZE": "https://fr.wikipedia.org/wiki/Special:FilePath/Caykur_Rizespor_(logo).svg",
  "FATİH KARAGÜMRÜK": "https://fr.wikipedia.org/wiki/Special:FilePath/Fatih_Karag%C3%BCmr%C3%BCk_SK_(logo).svg",
  "ÜMRANİYESPOR": "https://el.wikipedia.org/wiki/Special:FilePath/%C3%9Cmraniyespor_(logo).svg",
  "GAZİANTEP FK": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Gaziantep_FK.svg",
  "FENERBAHÇE": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Fenerbah%C3%A7e_SK_-_120_Yil_(1907-2027).svg",
  "ALANYASPOR": "https://fr.wikipedia.org/wiki/Special:FilePath/Alanyaspor_(logo).svg",
  "GENÇLERBİRLİĞİ": "https://fr.wikipedia.org/wiki/Special:FilePath/Gen%C3%A7lerbirli%C4%9Fi_S.K._(logo).svg",
  "IĞDIR FK": "https://ar.wikipedia.org/wiki/Special:FilePath/I%C4%9Fd%C4%B1r_FK.svg",
  "VANSPOR FK": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Vanspor_FK_(2019).svg",
  "MANİSA FK": "https://tr.wikipedia.org/wiki/Special:FilePath/Manisa_FK.png",
  "BAŞAKŞEHİR": "https://de.wikipedia.org/wiki/Special:FilePath/Istanbul_Basaksehir_FK_Logo.svg",
  "KAYSERİSPOR": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Kayserispor.svg",
  "SİVASSPOR": "https://fr.wikipedia.org/wiki/Special:FilePath/Sivasspor_-_Logo.svg",
  "AMED SPOR": "https://tr.wikipedia.org/wiki/Special:FilePath/Amed_SK.png",
  "MARDİN 1969": "https://tr.wikipedia.org/wiki/Special:FilePath/Mardin_1969_SK.png",
  "ANTALYASPOR": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Antalyaspor.svg",
  "BATMAN PETROL SPOR": "https://tr.wikipedia.org/wiki/Special:FilePath/Batman_Petrolspor.png",
  "KEÇİÖRENGÜCÜ": "https://tr.wikipedia.org/wiki/Special:FilePath/Ankara_Ke%C3%A7i%C3%B6reng%C3%BCc%C3%BC_SK.png",
  "BURSASPOR": "https://de.wikipedia.org/wiki/Special:FilePath/Bursaspor_Logo.svg",
  "SAMSUNSPOR": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Samsunspor_2020.svg",
  "GÖZTEPE": "https://de.wikipedia.org/wiki/Special:FilePath/G%C3%B6ztepe.svg",
  "MANCHESTER CITY": "https://sco.wikipedia.org/wiki/Special:FilePath/Manchester_City_FC_badge.svg",
  "SPARTA PRAG": "https://tr.wikipedia.org/wiki/Special:FilePath/AC-Sparta-LOGO2021.svg",
  "OLIMPIYAKOS": "https://tr.wikipedia.org/wiki/Special:FilePath/Olympiacos_F.C_Emblem.svg",
  "KOCAELİSPOR": "https://de.wikipedia.org/wiki/Special:FilePath/Kocaelispor.svg",
  "EYÜPSPOR": "https://tr.wikipedia.org/wiki/Special:FilePath/Ey%C3%BCpspor_Logosu.png",
  "HRADEC KRALOVE": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Hradec_Kralove.png",
  "PARIS SG": "https://en.wikipedia.org/wiki/Special:FilePath/Paris_Saint-Germain_F.C..svg",
  "ASTON VILLA": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Aston_Villa_FC_2024.svg",
  "STURM GRAZ": "https://en.wikipedia.org/wiki/Special:FilePath/SK_Sturm_Graz_logo.svg",
  "DINAMO KIEV": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Dynamo_Kyiv_logo.svg",
  "OLIMPIC LYON": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/Olympique_Lyonnais.svg/200px-Olympique_Lyonnais.svg.png",
  "FERENCVAROS": "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Ferencv%C3%A1rosi_TC_logo.svg/200px-Ferencv%C3%A1rosi_TC_logo.svg.png",
  "ESPANYOL": "https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/RCD_Espanyol_logo.svg/200px-RCD_Espanyol_logo.svg.png",
  "REAL MADRID": "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/200px-Real_Madrid_CF.svg.png",
  "FROSINONE": "https://upload.wikimedia.org/wikipedia/en/thumb/3/30/Frosinone_Calcio_logo.svg/200px-Frosinone_Calcio_logo.svg.png",
  "JUVENTUS": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Juventus_FC_-_Logo_2017.svg/200px-Juventus_FC_-_Logo_2017.svg.png",
  "MALAGA": "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/M%C3%A1laga_CF.svg/200px-M%C3%A1laga_CF.svg.png",
  "DEPORTIVO LA CORUÑA": "https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/RC_Deportivo_La_Coru%C3%B1a_logo.svg/200px-RC_Deportivo_La_Coru%C3%B1a_logo.svg.png",
  "MONACO": "https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/AS_Monaco_FC.svg/200px-AS_Monaco_FC.svg.png",
  "LILLE": "https://upload.wikimedia.org/wikipedia/en/thumb/3/3f/Lille_OSC_2018_logo.svg/200px-Lille_OSC_2018_logo.svg.png",
  "BELÇİKA": "https://upload.wikimedia.org/wikipedia/en/thumb/c/c9/Royal_Belgian_FA_logo_2019.svg/200px-Royal_Belgian_FA_logo_2019.svg.png",
  "BOSNA HERSEK": "https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Football_Association_of_Bosnia_and_Herzegovina_logo.svg/200px-Football_Association_of_Bosnia_and_Herzegovina_logo.svg.png",
  "NOTTINGHAM FOREST": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/Nottingham_Forest_F.C._logo.svg/200px-Nottingham_Forest_F.C._logo.svg.png",
  "LIVERPOOL": "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/200px-Liverpool_FC.svg.png",
  "FULHAM": "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Fulham_FC_%28shield%29.svg/200px-Fulham_FC_%28shield%29.svg.png",
  "EVERTON": "https://upload.wikimedia.org/wikipedia/en/thumb/f/fc/Everton_FC_logo.svg/200px-Everton_FC_logo.svg.png",
  "BREZİLYA": "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Flag_of_Brazil.svg/200px-Flag_of_Brazil.svg.png",
  "AMERİKA": "https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/200px-Flag_of_the_United_States.svg.png",
  "FK KAUNO ZALGIRIS": "https://images.fotmob.com/image_resources/logo/teamlogo/439132.png",
  "ÇORUM FK": "/logos/corum-fk.png", "EROKSPOR": "/logos/erokspor.png", "SARIYER": "/logos/sariyer.png", "PENDİKSPOR": "/logos/pendikspor.png", 
  "BOLUSPOR": "/logos/boluspor.png", "İSTANBULSPOR": "/logos/istanbulspor.png", "BODRUMSPOR": "/logos/bodrumspor.png", "ERZURUMSPOR": "/logos/erzurumspor.png",
  "MUĞLASPOR": "/logos/muglaspor.png", "BANDIRMASPOR": "/logos/bandirmaspor.png", "ARSENAL": "/logos/arsenal.png"
};

const isTffMatchCheck = (category: string) => ["TÜRKİYE 1.LİG", "TÜRKİYE KADINLAR SÜPER LİG", "TÜRKİYE KUPASI", "TÜRKİYE SÜPER KUPA", "TÜRKİYE SÜPER LİG"].includes(category?.trim().toUpperCase() || '');

const getEliteTheme = (category: string) => {
  const upCat = category?.toUpperCase() || '';
  if (upCat.includes("ŞAMPİYONLAR LİGİ") || upCat.includes("Ş.L.")) {
    return { bgImg: "url('/cl-bg.png')", containerBorder: "border-indigo-500/50", containerShadow: "shadow-[0_0_40px_rgba(79,70,229,0.4)]", containerBg: "bg-[#050b14]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-indigo-300", badgeBorder: "border-indigo-400/80 shadow-[0_0_10px_currentColor]", scoreBorder: "border-white/30" };
  } else if (upCat.includes("AVRUPA LİGİ") || upCat.includes("A.L.")) {
    return { bgImg: "url('/el-bg.png')", containerBorder: "border-orange-500/50", containerShadow: "shadow-[0_0_40px_rgba(249,115,22,0.4)]", containerBg: "bg-[#140805]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-orange-400", badgeBorder: "border-orange-500/80 shadow-[0_0_10px_currentColor]", scoreBorder: "border-orange-600/40" };
  } else if (upCat.includes("KONFERANS") || upCat.includes("K.L.")) {
    return { bgImg: "url('/uecl-bg.png')", containerBorder: "border-emerald-500/50", containerShadow: "shadow-[0_0_40px_rgba(16,185,129,0.4)]", containerBg: "bg-[#05140b]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-emerald-400", badgeBorder: "border-emerald-500/80 shadow-[0_0_10px_currentColor]", scoreBorder: "border-emerald-600/40" };
  } else if (isTffMatchCheck(upCat)) {
    return { bgImg: "url('/tff-bg.png')", containerBorder: "border-red-500/50", containerShadow: "shadow-[0_0_40px_rgba(239,68,68,0.4)]", containerBg: "bg-[#140505]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-red-400", badgeBorder: "border-red-500/80 shadow-[0_0_10px_currentColor]", scoreBorder: "border-red-600/40" };
  }
  return { bgImg: null, containerBorder: "border-blue-500/30", containerShadow: "shadow-[0_0_30px_rgba(30,58,138,0.5)]", containerBg: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/60 via-[#0a1120] to-[#050b14]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-cyan-400", badgeBorder: "border-cyan-500/80 shadow-[0_0_10px_currentColor]", scoreBorder: "border-blue-600/40" };
};

// KULLANICI SÖZLÜĞÜ (ID -> İSİM EŞLEŞTİRMESİ)
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
  const [liveScores, setLiveScores] = useState<Record<number, { home: string, away: string }>>({});
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // 4. HAFTA VERİLERİNİ ÇEK (İSTEDİĞİN GİBİ)
    const TARGET_WEEK = 4;
    const { data: bData } = await supabase.from('matches_bulletin').select('*').eq('week_num', TARGET_WEEK).order('match_index', { ascending: true });
    const { data: pData } = await supabase.from('player_predictions').select('*').eq('week_num', TARGET_WEEK);

    if (bData) {
      setBulletin(bData);
      const initialPreds: Record<number, { home: string, away: string }> = {};
      // Veritabanında daha önceden kaydedilmiş skor varsa onu getir, yoksa '-' yap
      bData.forEach(m => {
        initialPreds[m.match_index] = { home: '-', away: '-' };
      });
      setLiveScores(initialPreds);
    }
    if (pData) setAllPredictions(pData);
  };

  const handleScoreChange = (matchIndex: number, team: 'home' | 'away', score: string) => {
    setLiveScores(prev => ({
      ...prev,
      [matchIndex]: { ...prev[matchIndex], [team]: score }
    }));
  };

  const toggleAccordion = (matchIndex: number) => {
    setExpanded(prev => ({ ...prev, [matchIndex]: !prev[matchIndex] }));
  };

  const handleAction = (actionName: string, matchIndex: number) => {
    alert(`İşlem: ${actionName} \nMaç No: ${matchIndex} \nGirilen Skor: ${liveScores[matchIndex]?.home} - ${liveScores[matchIndex]?.away}`);
    // Buraya supabase kayıt güncelleme fonksiyonları eklenebilir.
  };

  const scoreOptions = ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 p-4 font-sans pb-24">
      <div className="max-w-[1400px] mx-auto pt-10">
        
        {/* ÜST BAŞLIK */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-amber-500 text-3xl">📁</span>
            <h2 className="text-3xl font-black text-slate-100 tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              KÖK KOMUTA MERKEZİ / ADMİN RADARI
            </h2>
          </div>
          <p className="text-slate-400 text-sm">4. Hafta Müsabakaları ve Programı - Manuel Yönetim Paneli</p>
          <div className="mt-4 bg-amber-500 text-slate-900 font-bold px-4 py-1.5 rounded-lg text-sm">
            4. HAFTA BÜLTENİ ▼
          </div>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-6xl mx-auto">
          {bulletin.map((match) => {
            const theme = getEliteTheme(match.category);
            const homeLogoUrl = localTeamLogos[match.home_team] || "/logos/default.png";
            const awayLogoUrl = localTeamLogos[match.away_team] || "/logos/default.png";
            
            const hScore = liveScores[match.match_index]?.home || '-';
            const aScore = liveScores[match.match_index]?.away || '-';
            const currentInput = `${hScore}-${aScore}`;
            const isScoreEntered = hScore !== '-' && aScore !== '-';
            const isExpanded = expanded[match.match_index];
            
            // RADAR FİLTRESİ
            const winners = allPredictions.filter(p => 
              p.match_index === match.match_index && 
              p.predicted_score === currentInput &&
              isScoreEntered
            );

            // A-Z Sıralaması
            const sortedWinners = [...winners].sort((a, b) => {
              const nameA = TEST_ACCOUNTS[a.user_id] || a.user_id;
              const nameB = TEST_ACCOUNTS[b.user_id] || b.user_id;
              return nameA.localeCompare(nameB);
            });

            return (
              <div key={match.match_index} className={`w-full mx-auto border-2 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col relative ${theme.containerBorder} shadow-[0_0_40px_rgba(0,0,0,0.5)] ${theme.containerBg}`}>
                {theme.bgImg && (
                  <>
                    <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: theme.bgImg, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/80 to-[#050b14] z-0"></div>
                  </>
                )}
                
                <div className="relative z-10 flex flex-col h-full py-4">
                  {/* MAÇ BAŞLIĞI VE LİG */}
                  <div className="w-full text-center px-4 mb-4">
                    <span className="text-[11px] font-black text-slate-300 tracking-widest uppercase bg-slate-950/80 px-4 py-1.5 rounded-full shadow-inner border border-slate-700/50">4. HAFTA - {match.match_index}. MAÇ</span>
                    <div className="mt-3">
                      <span className={`inline-block px-4 py-1.5 rounded-full border shadow-[0_0_15px_currentColor] text-[10px] font-black uppercase tracking-widest ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>🏆 {match.category}</span>
                    </div>
                    <div className="mt-2 text-[11px] font-bold text-slate-400">
                      {match.match_date} | {match.match_time}
                    </div>
                  </div>

                  {/* TAKIMLAR VE MANUEL SKOR GİRİŞİ */}
                  <div className="flex items-center justify-between px-6 pb-6 mt-2">
                    <div className="flex flex-col items-center justify-center flex-1 gap-3">
                      <div className="w-20 h-20 flex items-center justify-center relative z-20"><img src={homeLogoUrl} alt={match.home_team} className="w-full h-full object-contain drop-shadow-2xl" /></div>
                      <span className="text-white font-black text-xs text-center uppercase tracking-wider drop-shadow-md">{match.home_team}</span>
                    </div>

                    {/* DİNAMİK KUTULAR */}
                    <div className="flex items-center justify-center gap-1 mx-2 z-30 bg-slate-950/60 p-2 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                      <select value={hScore} onChange={e => handleScoreChange(match.match_index, 'home', e.target.value)} className="w-14 h-16 bg-slate-950/90 border border-slate-600 rounded-xl font-black text-3xl text-white outline-none focus:border-amber-500 cursor-pointer appearance-none shadow-inner text-center" style={{ textAlignLast: 'center' }}>
                        {scoreOptions.map(opt => (<option key={`h-${opt}`} value={opt}>{opt}</option>))}
                      </select>
                      <span className="text-3xl font-black text-slate-500 mx-1">:</span>
                      <select value={aScore} onChange={e => handleScoreChange(match.match_index, 'away', e.target.value)} className="w-14 h-16 bg-slate-950/90 border border-slate-600 rounded-xl font-black text-3xl text-white outline-none focus:border-amber-500 cursor-pointer appearance-none shadow-inner text-center" style={{ textAlignLast: 'center' }}>
                        {scoreOptions.map(opt => (<option key={`a-${opt}`} value={opt}>{opt}</option>))}
                      </select>
                    </div>

                    <div className="flex flex-col items-center justify-center flex-1 gap-3">
                      <div className="w-20 h-20 flex items-center justify-center relative z-20"><img src={awayLogoUrl} alt={match.away_team} className="w-full h-full object-contain drop-shadow-2xl" /></div>
                      <span className="text-white font-black text-xs text-center uppercase tracking-wider drop-shadow-md">{match.away_team}</span>
                    </div>
                  </div>

                  {/* ADMİN KONTROL BUTONLARI (ORTA PANEL) */}
                  <div className="px-6 flex justify-center gap-3 mt-2 mb-4">
                     <button onClick={() => handleAction('Skoru Güncelle', match.match_index)} className="bg-blue-600/80 hover:bg-blue-500 text-white text-[10px] font-bold px-4 py-2 rounded-lg border border-blue-400 uppercase tracking-wider transition-all">Skoru Güncelle</button>
                     <button onClick={() => handleAction('Maçı Onayla (Puan Dağıt)', match.match_index)} className="bg-emerald-600/80 hover:bg-emerald-500 text-white text-[10px] font-bold px-4 py-2 rounded-lg border border-emerald-400 uppercase tracking-wider transition-all">Onayla & Bitir</button>
                     <button onClick={() => handleAction('Maçı Resetle', match.match_index)} className="bg-red-600/80 hover:bg-red-500 text-white text-[10px] font-bold px-4 py-2 rounded-lg border border-red-400 uppercase tracking-wider transition-all">Resetle</button>
                  </div>

                  {/* ALT BİLGİ VE AKORDİYON BUTONU (ARŞİVDEKİNİN AYNISI) */}
                  <div className="w-full flex justify-between items-center px-6 py-4 border-t border-slate-800/80 bg-slate-950/40">
                    <span className="text-amber-500 font-bold text-xs">{isScoreEntered ? `${winners.length} kişi tam isabetli` : "Skor bekleniyor"}</span>
                    <span className="text-[10px] text-emerald-400 border border-emerald-500/40 bg-emerald-950/50 px-3 py-1 rounded-full font-bold uppercase tracking-widest">DFO MAÇI</span>
                    <button onClick={() => toggleAccordion(match.match_index)} className="text-blue-400 hover:text-blue-300 font-bold text-xs flex items-center gap-1 transition-colors">
                      {isExpanded ? "Gizle ^" : "Bilenleri gör →"}
                    </button>
                  </div>

                  {/* AKORDİYON İÇERİĞİ (ARŞİVDEKİNİN AYNISI) */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 bg-slate-950/60 border-t border-slate-800/80 animate-fade-in">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">BİLEN YARIŞMACILAR (A-Z)</h4>
                        <span className="text-[10px] text-amber-400 font-black bg-amber-950/50 border border-amber-500/30 px-3 py-1 rounded-full">Kişi Başı: 4 Puan</span>
                      </div>
                      
                      {sortedWinners.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {sortedWinners.map((winner, idx) => (
                            <span key={idx} className="bg-slate-900 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase shadow-sm">
                              {TEST_ACCOUNTS[winner.user_id] || winner.user_id}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-500 text-xs italic text-center py-4">
                          {isScoreEntered ? "Bu skoru bilen yarışmacı bulunamadı." : "Listeyi görmek için yukarıdan skoru giriniz."}
                        </div>
                      )}
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