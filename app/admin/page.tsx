'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

// ----------------------------------------------------
// TEMA VE LOGO MOTORU (SENİN EFSANE TASARIMIN)
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
  const [liveScores, setLiveScores] = useState<Record<number, { home: string, away: string }>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: bData } = await supabase.from('matches_bulletin').select('*').eq('week_num', 5).order('match_index', { ascending: true });
    // ARŞİVİN BESLENDİĞİ ANA KAYNAK:
    const { data: pData } = await supabase.from('player_predictions').select('*').eq('week_num', 5);

    if (bData) {
      setBulletin(bData);
      const initialPreds: Record<number, { home: string, away: string }> = {};
      bData.forEach(m => initialPreds[m.match_index] = { home: '-', away: '-' });
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

  const scoreOptions = ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 p-4 font-sans pb-24">
      <div className="max-w-[1400px] mx-auto pt-10">
        
        <div className="flex justify-center items-center mb-10">
          <h2 className="text-4xl font-black text-amber-500 tracking-widest drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            🔴 CANLI YÖNETİM RADARI (5. HAFTA)
          </h2>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
          {bulletin.map((match) => {
            const theme = getEliteTheme(match.category);
            const homeLogoUrl = localTeamLogos[match.home_team] || "/logos/default.png";
            const awayLogoUrl = localTeamLogos[match.away_team] || "/logos/default.png";
            const hScore = liveScores[match.match_index]?.home || '-';
            const aScore = liveScores[match.match_index]?.away || '-';
            
            // RADAR FİLTRELEME MOTORU: Adminin kutulara girdiği skoru birleştir
            const currentInput = `${hScore}-${aScore}`;
            
            // Veritabanından bu skoru bilen HERKESİ getir (.filter mucizesi)
            const winners = allPredictions.filter(p => 
              p.match_index === match.match_index && 
              p.predicted_score === currentInput &&
              hScore !== '-' && aScore !== '-'
            );

            return (
              <div key={match.match_index} className={`w-full mx-auto border rounded-xl overflow-hidden transition-all duration-300 flex flex-col relative ${theme.containerBorder} ${theme.containerShadow} ${theme.containerBg}`}>
                {theme.bgImg && (
                  <>
                    <div className="absolute inset-0 z-0 opacity-100" style={{ backgroundImage: theme.bgImg, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}></div>
                    <div className="absolute inset-0 bg-slate-900/70 z-0"></div>
                  </>
                )}
                
                <div className="relative z-10 flex flex-col h-full py-2">
                  <div className="w-full flex justify-between items-center px-4 pt-3 pb-1">
                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase bg-slate-950/50 px-3 py-1 rounded-full shadow-inner">5. HAFTA {match.match_index}. MAÇ</span>
                    <span className="text-[10px] font-bold text-slate-300 bg-slate-900/50 px-2 py-1 rounded">{match.match_date} - {match.match_time}</span>
                  </div>

                  <div className="w-full text-center px-2 mt-1 mb-2">
                    <span className={`inline-block px-3 py-1.5 rounded-lg border shadow-[0_0_15px_currentColor] text-[9px] font-black uppercase tracking-widest ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>{match.category}</span>
                  </div>

                  <div className="flex items-center justify-between px-4 pb-2 mt-2">
                    {/* EV SAHİBİ */}
                    <div className="flex flex-col items-center justify-center flex-1 gap-2">
                      <div className="w-16 h-16 flex items-center justify-center relative z-20"><img src={homeLogoUrl} alt={match.home_team} className="w-full h-full object-contain drop-shadow-lg" /></div>
                      <span className="text-white font-extrabold text-[10px] text-center uppercase tracking-wide drop-shadow-md">{match.home_team}</span>
                    </div>

                    {/* SKOR KUTULARI (ADMİN) */}
                    <div className="flex flex-col items-center justify-center gap-2 mx-2 w-40 z-30">
                      <div className={`w-full bg-[#080d1a]/80 border ${theme.scoreBorder} py-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
                        <select value={hScore} onChange={e => handleScoreChange(match.match_index, 'home', e.target.value)} className="w-12 h-10 bg-slate-950 border border-slate-700 rounded-lg font-black text-xl text-amber-400 outline-none focus:border-amber-500 cursor-pointer appearance-none shadow-inner text-center" style={{ textAlignLast: 'center' }}>
                          {scoreOptions.map(opt => (<option key={`h-${opt}`} value={opt}>{opt}</option>))}
                        </select>
                        <span className="text-xl font-bold text-slate-500">:</span>
                        <select value={aScore} onChange={e => handleScoreChange(match.match_index, 'away', e.target.value)} className="w-12 h-10 bg-slate-950 border border-slate-700 rounded-lg font-black text-xl text-amber-400 outline-none focus:border-amber-500 cursor-pointer appearance-none shadow-inner text-center" style={{ textAlignLast: 'center' }}>
                          {scoreOptions.map(opt => (<option key={`a-${opt}`} value={opt}>{opt}</option>))}
                        </select>
                      </div>
                    </div>

                    {/* DEPLASMAN */}
                    <div className="flex flex-col items-center justify-center flex-1 gap-2">
                      <div className="w-16 h-16 flex items-center justify-center relative z-20"><img src={awayLogoUrl} alt={match.away_team} className="w-full h-full object-contain drop-shadow-lg" /></div>
                      <span className="text-white font-extrabold text-[10px] text-center uppercase tracking-wide drop-shadow-md">{match.away_team}</span>
                    </div>
                  </div>

                  {/* ===== RADAR (BİLENLER) KISMI ===== */}
                  <div className="mx-4 mt-2 mb-2 p-3 bg-slate-950/80 rounded-lg border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    <h3 className="text-[10px] font-black text-emerald-400 mb-2 uppercase tracking-widest border-b border-emerald-900/50 pb-1">
                      🎯 BU SKORU BİLEN ASLAN PARÇALARI ({winners.length} KİŞİ)
                    </h3>
                    
                    {winners.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {winners.map((winner, idx) => (
                          <span key={idx} className="bg-emerald-900/40 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded text-[9px] font-bold uppercase shadow-sm">
                            {TEST_ACCOUNTS[winner.user_id] || winner.user_id}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-500 text-[10px] italic">
                        {hScore !== '-' && aScore !== '-' ? "Bu skoru bilen aslan parçası bulunamadı." : "Listeyi görmek için skoru girin."}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}