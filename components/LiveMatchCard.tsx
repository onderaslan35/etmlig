'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

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
  "IBERIA 1999": "https://de.wikipedia.org/wiki/Special:FilePath/Iberia_1999_Tiflis.svg",
  "SLOVAN BRATISLAVA": "https://commons.wikimedia.org/wiki/Special:FilePath/SK_Slovan_Bratislava_logo.svg",
  "KUPS": "https://en.wikipedia.org/wiki/Special:FilePath/KuPS_logo.svg",
  "SABAH FK": "https://en.wikipedia.org/wiki/Special:FilePath/Sabah_FC_(Azerbaijan).png",
  "GORNİK ZABRZE": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Gornik_Zabrze.svg",
  "THUN": "https://tr.wikipedia.org/wiki/Special:FilePath/FC_Thun_Logo_2011.svg",
  "DINAMO ZAGREB": "https://tr.wikipedia.org/wiki/Special:FilePath/Logo_GNK_Dinamo_Zagreb_(2019).svg",
  "HEART": "https://it.wikipedia.org/wiki/Special:FilePath/Hearts_FC.svg",
  "LARNE FC": "https://fr.wikipedia.org/wiki/Special:FilePath/Larne_FC_(logo).svg",
  "KIZILYILDIZ": "https://en.wikipedia.org/wiki/Special:FilePath/Red_Star_Belgrade_crest.svg",
  "LEVADIA FC": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Levadia_Tallinnin.png",
  "LEVSKI SOFYA": "https://en.wikipedia.org/wiki/Special:FilePath/Levski_Sofia_crest_(2026).svg",
  "UNIVERSITATEA CRAIOVA": "https://ro.wikipedia.org/wiki/Special:FilePath/CS_Universitatea_Craiova.svg",
  "POLISSYA": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Polissya_Zhytomyr.png",
  "KOPENAG": "https://tr.wikipedia.org/wiki/Special:FilePath/FC_K%C3%B8benhavn.png",
  "KOPENHAG": "https://tr.wikipedia.org/wiki/Special:FilePath/FC_K%C3%B8benhavn.png",
  "SANTA COLOMA FC": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Santa_Coloma_logo.svg",
  "RAPID WIEN": "https://en.wikipedia.org/wiki/Special:FilePath/SK_Rapid_Wien_Logo.svg",
  "FCSB": "https://tr.wikipedia.org/wiki/Special:FilePath/Fcsb-logo.svg",
  "AUDA RIGA": "https://en.wikipedia.org/wiki/Special:FilePath/FK_Auda_logo.png",
  "BRANN": "https://en.wikipedia.org/wiki/Special:FilePath/Brann_logo.svg",
  "PAKSI FC": "https://tr.wikipedia.org/wiki/Special:FilePath/Paksi_FC_(Logo).svg",
  "PANATHINAIKOS": "https://tr.wikipedia.org/wiki/Special:FilePath/Panathinaikos.svg",
  "ZELEZNICAR PANCEVO": "https://en.wikipedia.org/wiki/Special:FilePath/FK_%C5%BDelezni%C4%8Dar_Pan%C4%8Devo_logo.png",
  "MIDTJYLLAND": "https://tr.wikipedia.org/wiki/Special:FilePath/FC_Midtjylland.png",
  "HAJDUK SPLIT": "https://tr.wikipedia.org/wiki/Special:FilePath/Hajduk_Split.png",
  "PATOS": "https://en.wikipedia.org/wiki/Special:FilePath/Pafos_FC_crest.svg",
  "CSKA SOFYA": "https://tr.wikipedia.org/wiki/Special:FilePath/CSKA_Sofia_logo.svg",
  "ST GALLEN": "https://tr.wikipedia.org/wiki/Special:FilePath/FC_St._Gallen_logo.svg",
  "SPARTAK TRNAVA": "https://tr.wikipedia.org/wiki/Special:FilePath/Spartak_Trnava_current_logo.png",
  "CSKA 1948": "https://tr.wikipedia.org/wiki/Special:FilePath/CSKA_1948_logo.png",
  "INTER TURKU": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Inter_Turku_logo.svg",
  "GOTEBORG": "https://en.wikipedia.org/wiki/Special:FilePath/IFK_Goteborg_logo.svg",
  "UNIVERSITATEA CLUJ": "https://ro.wikipedia.org/wiki/Special:FilePath/U_Cluj.svg",
  "BODO-GLIMT": "https://en.wikipedia.org/wiki/Special:FilePath/FK_Bodo_Glimt_logo.svg",
  "NEC NIJMEGEN": "https://en.wikipedia.org/wiki/Special:FilePath/NEC_Nijmegen_logo.svg",
  "USG": "https://en.wikipedia.org/wiki/Special:FilePath/Royale_Union_Saint-Gilloise_logo.svg",
  "PAIDE LINNAMEESKOND": "https://en.wikipedia.org/wiki/Special:FilePath/Paide_Linnameeskond_logo.png",
  "DEBRECEN": "https://fr.wikipedia.org/wiki/Special:FilePath/Debreceni_VSC_(logo).svg",
  "SHELBOURNE": "https://tr.wikipedia.org/wiki/Special:FilePath/Shelbourne_logo.png",
  "DINAMO MINSK": "https://tr.wikipedia.org/wiki/Special:FilePath/Dinamo-Minsk.png",

  // Yerel Logolar
  "ÇORUM FK": "/logos/corum-fk.png", "ESENLER EROKSPOR": "/logos/erokspor.png", "EROKSPOR": "/logos/erokspor.png",
  "SARIYER": "/logos/sariyer.png", "PENDİKSPOR": "/logos/pendikspor.png", "BOLUSPOR": "/logos/boluspor.png", 
  "İSTANBULSPOR": "/logos/istanbulspor.png", "BODRUMSPOR": "/logos/bodrumspor.png", "ERZURUMSPOR": "/logos/erzurumspor.png",
  "MUĞLASPOR": "/logos/muglaspor.png", "BANDIRMASPOR": "/logos/bandirmaspor.png", 
  "VOJVODINA": "/logos/vojvodina.png", "FERENCVAROS": "/logos/ferencvaros.png",
  "HAMMARBY": "/logos/hammarby.png", 
  "OLYMPIC LYON": "https://upload.wikimedia.org/wikipedia/en/c/c6/Olympique_Lyonnais.svg", 
  "OLYMPIQUE LYON": "https://upload.wikimedia.org/wikipedia/en/c/c6/Olympique_Lyonnais.svg", 
  "LYON": "https://upload.wikimedia.org/wikipedia/en/c/c6/Olympique_Lyonnais.svg", 
  "GENT": "/logos/gent.png", "AJAX": "/logos/ajax.png", 
  "BRAGA": "/logos/braga.png", "PAOK": "/logos/paok.png", "ANDERLECHT": "/logos/anderlecht.png", 
  "TWENTE": "/logos/twente.png", "BENFICA": "/logos/benfica.png", "ARSENAL": "/logos/arsenal.png",
  
  // YENİ EKLENEN LOGOLAR
  "YOUNG BOYS": "https://en.wikipedia.org/wiki/Special:FilePath/BSC_Young_Boys_logo.svg",
  "BODO/GLIMT": "https://en.wikipedia.org/wiki/Special:FilePath/FK_Bodo_Glimt_logo.svg",
  "LILLE": "https://en.wikipedia.org/wiki/Special:FilePath/LOSC_Lille_logo.svg",
  "SLAVIA PRAG": "https://en.wikipedia.org/wiki/Special:FilePath/SK_Slavia_Praha_logo.svg",
  "DINAMO ZAGREP": "https://tr.wikipedia.org/wiki/Special:FilePath/Logo_GNK_Dinamo_Zagreb_(2019).svg",
  "LUGANO": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Lugano_logo.svg",
  "LENS": "https://en.wikipedia.org/wiki/Special:FilePath/RC_Lens_logo.svg",
  "FC HEIDENHEIM": "https://en.wikipedia.org/wiki/Special:FilePath/1._FC_Heidenheim_1846.svg",
  "HACKEN": "https://en.wikipedia.org/wiki/Special:FilePath/BK_H%C3%A4cken_logo.png"
};

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
  "351925": "ALİOS GÖZTEPE", "262730": "ÖNDER IŞIK", "262782": "YUSUF ERBAY",
  "262749": "B.VEYSELOĞLU EROL", "262718": "BEKİR KARADAĞ", "262715": "ŞEMSETTİN DÜGER", "262739": "UĞUR GÜRBÜZ",
  "262703": "CEMALETTİN BELLİ", "262758": "MELİH PINAR", "262770": "OZKAYA MAZAKALI BAYRAM", "262708": "BAYRAM YILMAZ",
  "262787": "MUSTAFA TUCİ", "262744": "İLYAS UYGUN", "262712": "MURAT AYDEMİR", "262704": "YAPAY ZEKA",
  "262723": "AYHAN LUŞOĞLU"
};

// 🚀 OTOMATİK ZAMAN MOTORU (TÜRKİYE SAATİ DESTEKLİ)
const getActiveWeekByDate = () => {
  const nowUTC = new Date();
  const nowTurkey = new Date(nowUTC.getTime() + (3 * 60 * 60 * 1000));
  const baseDate = new Date(Date.UTC(2026, 7, 18, 0, 0, 0)).getTime(); // 18 Ağustos 2026 UTC
  
  const diffTime = nowTurkey.getTime() - baseDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 4; 
  return 5 + Math.floor(diffDays / 7);
};

export default function LiveMatchCard() {
  const [activeWeek, setActiveWeek] = useState(getActiveWeekByDate());
  const [todaysMatchesList, setTodaysMatchesList] = useState<any[]>([]);
  const [liveMatchesData, setLiveMatchesData] = useState<Record<number, any>>({});
  const [predictionsData, setPredictionsData] = useState<Record<string, string[]>>({});
  const [now, setNow] = useState<number>(new Date().getTime());
  
  const [isLiveAccordionOpen, setIsLiveAccordionOpen] = useState<boolean>(true); 
  const [isFinishedAccordionOpen, setIsFinishedAccordionOpen] = useState<boolean>(false);
  const [openWinnersMap, setOpenWinnersMap] = useState<{ [key: number]: boolean }>({});
  const [expandedMatches, setExpandedMatches] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => {
        const nowUTC = new Date();
        const turkeyTimeMs = nowUTC.getTime() + (3 * 60 * 60 * 1000);
        setNow(turkeyTimeMs);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isTffMatchCheck = (category: string) => {
    const uppercaseCat = category.toUpperCase();
    return (uppercaseCat.includes("TÜRKİYE SÜPER LİG") || uppercaseCat.includes("TÜRKİYE 1.LİG") || uppercaseCat.includes("TÜRKİYE SÜPER KUPA"));
  };

  const getEliteTheme = (category: string) => {
    const upCat = category.toUpperCase();
    if (upCat.includes("ŞAMPİYONLAR LİGİ")) {
      return {
        bgImg: "url('/cl-bg.png')",
        containerBorder: "border-indigo-500/50",
        containerShadow: "shadow-[0_0_40px_rgba(79,70,229,0.4)]",
        containerBg: "bg-[#050b14]",
        badgeBg: "bg-transparent backdrop-blur-sm",
        badgeText: "text-indigo-300",
        badgeBorder: "border-indigo-400/80 shadow-[0_0_10px_currentColor]",
        catText: "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]",
        scoreBorder: "border-white/30",
        colonText: "text-white/50",
        tagText: "text-cyan-300",
        tagBg: "bg-cyan-950/90",
        tagBorder: "border-cyan-400/80",
        bottomBar: "bg-[#050b14]/90 border-blue-900/30"
      };
    } else if (upCat.includes("AVRUPA LİGİ")) {
      return {
        bgImg: "url('/el-bg.png')", 
        containerBorder: "border-orange-500/50",
        containerShadow: "shadow-[0_0_40px_rgba(249,115,22,0.4)]",
        containerBg: "bg-[#140805]",
        badgeBg: "bg-transparent backdrop-blur-sm",
        badgeText: "text-orange-400",
        badgeBorder: "border-orange-500/80 shadow-[0_0_10px_currentColor]",
        catText: "text-orange-300 drop-shadow-[0_0_8px_rgba(253,186,116,0.5)]",
        scoreBorder: "border-orange-600/40",
        colonText: "text-orange-400/50",
        tagText: "text-orange-300",
        tagBg: "bg-orange-950/90",
        tagBorder: "border-orange-400/80",
        bottomBar: "bg-[#140805]/90 border-orange-900/30"
      };
    } else if (upCat.includes("KONFERANS LİGİ")) {
      return {
        bgImg: "url('/uecl-bg.png')",
        containerBorder: "border-emerald-500/50",
        containerShadow: "shadow-[0_0_40px_rgba(16,185,129,0.4)]",
        containerBg: "bg-[#05140b]",
        badgeBg: "bg-transparent backdrop-blur-sm",
        badgeText: "text-emerald-400",
        badgeBorder: "border-emerald-500/80 shadow-[0_0_10px_currentColor]",
        catText: "text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.5)]",
        scoreBorder: "border-emerald-600/40",
        colonText: "text-emerald-400/50",
        tagText: "text-emerald-300",
        tagBg: "bg-emerald-950/90",
        tagBorder: "border-emerald-400/80",
        bottomBar: "bg-[#05140b]/90 border-emerald-900/30"
      };
    } else if (isTffMatchCheck(category)) {
      return {
        bgImg: "url('/tff-bg.png')",
        containerBorder: "border-red-500/50",
        containerShadow: "shadow-[0_0_40px_rgba(239,68,68,0.4)]",
        containerBg: "bg-[#140505]",
        badgeBg: "bg-transparent backdrop-blur-sm",
        badgeText: "text-red-400",
        badgeBorder: "border-red-500/80 shadow-[0_0_10px_currentColor]",
        catText: "text-red-300 drop-shadow-[0_0_8px_rgba(252,165,165,0.5)]",
        scoreBorder: "border-red-600/40",
        colonText: "text-red-400/50",
        tagText: "text-red-400",
        tagBg: "bg-red-950/90",
        tagBorder: "border-red-500/80",
        bottomBar: "bg-[#140505]/90 border-red-900/30"
      };
    }
    return {
        bgImg: null,
        containerBorder: "border-blue-500/30",
        containerShadow: "shadow-[0_0_30px_rgba(30,58,138,0.5)]",
        containerBg: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/60 via-[#0a1120] to-[#050b14]",
        badgeBg: "bg-transparent backdrop-blur-sm",
        badgeText: "text-cyan-400",
        badgeBorder: "border-cyan-500/80 shadow-[0_0_10px_currentColor]",
        catText: "text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]",
        scoreBorder: "border-blue-600/40",
        colonText: "text-blue-400/50",
        tagText: "text-cyan-300",
        tagBg: "bg-cyan-950/90",
        tagBorder: "border-cyan-400/80",
        bottomBar: "bg-[#050b14]/90 border-blue-900/30"
    };
  };

  useEffect(() => {
    const fetchMatchesAndPredictions = async () => {
      // 🌟 DİKKAT: Artık bülteni "matches_bulletin" tablosundan okuyoruz!
      const { data: dbBulletinMatches } = await supabase
        .from('matches_bulletin')
        .select('*')
        .eq('week_num', activeWeek)
        .order('match_index', { ascending: true });

      // Skorları ve statüleri ise "live_matches" tablosundan alacağız
      const { data: dbLiveMatches } = await supabase
        .from('live_matches')
        .select('*');

      const { data: dbPredictions } = await supabase
        .from('player_predictions')
        .select('*')
        .eq('week_num', activeWeek);

      const predDict: Record<string, string[]> = {};
      if (dbPredictions) {
        dbPredictions.forEach(pred => {
          if (!predDict[pred.user_id]) {
            predDict[pred.user_id] = Array(24).fill('');
          }
          predDict[pred.user_id][pred.match_index - 1] = pred.predicted_score;
        });
      }
      setPredictionsData(predDict);

      if (dbBulletinMatches) {
        // BUGÜNÜN TARİHİNİ TÜRKİYE SAATİNE (UTC+3) GÖRE HESAPLA
        const nowUTC = new Date();
        const todayTurkey = new Date(nowUTC.getTime() + (3 * 60 * 60 * 1000));
        
        const dd = String(todayTurkey.getUTCDate()).padStart(2, '0');
        const mm = String(todayTurkey.getUTCMonth() + 1).padStart(2, '0');
        const yyyy = todayTurkey.getUTCFullYear();
        const todayFormatted = `${dd}.${mm}.${yyyy}`;

        // Maçların temel bilgilerini bültenden alıyoruz
        const currentWeekMatches = dbBulletinMatches.map((m, idx) => ({
          id: m.match_index,
          weekLabel: `${activeWeek}. HAFTA ${m.match_index}. MAÇ`,
          category: m.category,
          date: m.match_date,
          time: m.match_time,
          homeTeam: m.home_team,
          awayTeam: m.away_team
        }));

        const todaysMatches = currentWeekMatches.filter(m => m.date === todayFormatted);
        setTodaysMatchesList(todaysMatches);
        
        // Skor bilgilerini "live_matches" tablosundan mapliyoruz
        const liveMap: Record<number, any> = {};
        if (dbLiveMatches) {
          dbLiveMatches.forEach(row => liveMap[row.id] = row); 
        }
        setLiveMatchesData(liveMap);

        let currentBoard: Record<string, any> = {}; 
        let hasLiveScores = false;

        todaysMatches.forEach(match => {
          const dbMatch = liveMap[match.id];
          if (dbMatch && dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-') {
            hasLiveScores = true;
            const isTff = isTffMatchCheck(match.category);
            const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`;
            const winnerIds = Object.keys(predDict).filter(id => predDict[id][match.id - 1] === targetScore);
            
            let points = 1;
            if(winnerIds.length === 1) points = 12;
            else if(winnerIds.length === 2) points = 6;
            else if(winnerIds.length === 3) points = 5;
            else if(winnerIds.length === 4) points = 4;
            else if(winnerIds.length === 5) points = 3;
            else if(winnerIds.length === 6) points = 2;
            else points = 1;

            winnerIds.forEach(wId => {
              if(!currentBoard[wId]) currentBoard[wId] = { dfo: 0, tff: 0, master: 0, skor: 0 };
              if (isTff) currentBoard[wId].tff += points;
              else currentBoard[wId].dfo += points;
              currentBoard[wId].master += points;
              currentBoard[wId].skor += 1;
            });
          }
        });

        if (hasLiveScores) {
          localStorage.setItem('elitTahmin_Leaderboard', JSON.stringify(currentBoard));
        } else {
          localStorage.removeItem('elitTahmin_Leaderboard');
        }
        window.dispatchEvent(new Event('leaderboardUpdate')); 
      }
    };

    fetchMatchesAndPredictions(); 
    const interval = setInterval(fetchMatchesAndPredictions, 5000); 
    return () => clearInterval(interval);
  }, [activeWeek]);

  const toggleWinners = (matchId: number) => {
    setOpenWinnersMap((prev) => ({ ...prev, [matchId]: !prev[matchId] })); 
  };

  const toggleMatchExpansion = (matchId: number) => {
    setExpandedMatches(prev => ({ ...prev, [matchId]: !prev[matchId] }));
  };

  const getMatchTimeMs = (dateStr: string, timeStr: string) => {
    const [d, m, y] = dateStr.split('.');
    const [hr, min] = timeStr.split(':');
    const matchTime = new Date(Date.UTC(parseInt(y), parseInt(m) - 1, parseInt(d), parseInt(hr) - 3, parseInt(min), 0));
    return matchTime.getTime();
  };

  if (todaysMatchesList.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto mb-8 flex flex-col gap-5">
        <div className="w-full text-center py-10 bg-slate-900/30 border border-slate-800/50 rounded-2xl">
          <span className="text-3xl mb-2 block opacity-50">🗓️</span>
          <p className="text-slate-400 text-sm font-medium tracking-widest">BUGÜN PLANLANAN BİR MAÇ BULUNMUYOR</p>
        </div>
      </div>
    );
  }

  const activeMatches = todaysMatchesList.filter(match => {
     const dbMatch = liveMatchesData[match.id] || {};
     return dbMatch.status !== 'FINISHED';
  });

  const finishedMatches = todaysMatchesList.filter(match => {
     const dbMatch = liveMatchesData[match.id] || {};
     return dbMatch.status === 'FINISHED';
  });

  const renderMatchCard = (match: any, isFinishedGroup: boolean = false) => {
      const homeTeamUpper = match.homeTeam?.toUpperCase() || match.home_team?.toUpperCase();
      const awayTeamUpper = match.awayTeam?.toUpperCase() || match.away_team?.toUpperCase();

      const homeLogoUrl = localTeamLogos[homeTeamUpper] || "/logos/default.png";
      const awayLogoUrl = localTeamLogos[awayTeamUpper] || "/logos/default.png";
      const isWinnersOpen = openWinnersMap[match.id] !== false;
      
      const isExpanded = expandedMatches[match.id] !== undefined ? expandedMatches[match.id] : isFinishedGroup;

      const dbMatch = liveMatchesData[match.id] || {};
      let matchStatus = dbMatch.status || 'NOT_STARTED';
      let homeScore = dbMatch.home_score || '-';
      let awayScore = dbMatch.away_score || '-';

      const matchTimeMs = getMatchTimeMs(match.date, match.time);
      const twoHoursMs = 2 * 60 * 60 * 1000;
      
      if (matchStatus !== 'FINISHED') {
        if (now >= matchTimeMs && now < matchTimeMs + twoHoursMs) {
          matchStatus = 'LIVE';
        } else if (now >= matchTimeMs + twoHoursMs) {
          matchStatus = 'WAITING_APPROVAL'; 
        }
      }

      if (matchStatus === 'LIVE' || matchStatus === 'WAITING_APPROVAL') {
         if (homeScore === '-') homeScore = '0';
         if (awayScore === '-') awayScore = '0';
      }

      const isChampionsLeague = match.category.toUpperCase().includes('ŞAMPİYONLAR LİGİ');
      const isTffMatch = isTffMatchCheck(match.category);
      const theme = getEliteTheme(match.category);
      const isFinished = matchStatus === 'FINISHED'; 

      let currentWinners: string[] = [];
      if ((matchStatus === 'LIVE' || matchStatus === 'FINISHED' || matchStatus === 'WAITING_APPROVAL') && homeScore !== '-' && awayScore !== '-') {
        const targetScore = `${homeScore}-${awayScore}`;
        currentWinners = Object.keys(predictionsData)
          .filter(id => predictionsData[id] && predictionsData[id][match.id - 1] === targetScore)
          .map(id => allPlayersList[id])
          .filter(name => name)
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
      else if(winnersCount >= 7) displayPoints = 1;
      else displayPoints = 0;

      let countdownText = "";
      if (now < matchTimeMs && matchStatus === 'NOT_STARTED') {
        const distance = matchTimeMs - now;
        if (distance > 0) {
          const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((distance % (1000 * 60)) / 1000);
          countdownText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
      }

      return (
        <div 
          key={match.id} 
          className={`w-full max-w-lg mx-auto border rounded-xl overflow-hidden transition-all duration-300 flex flex-col relative ${
            isExpanded 
              ? theme.containerBorder + ' ' + theme.containerShadow + ' ' + theme.containerBg 
              : theme.containerBorder + ' shadow-md hover:shadow-[0_0_15px_currentColor] ' + theme.badgeText + ' ' + (theme.bgImg ? '' : 'bg-slate-950')
          }`}
        >
          {theme.bgImg && (
            <>
              <div 
                className="absolute inset-0 z-0 opacity-100"
                style={{ backgroundImage: theme.bgImg, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
              ></div>
              <div className={`absolute inset-0 z-0 transition-colors duration-300 ${isExpanded ? 'bg-slate-900/60' : 'bg-slate-950/70 hover:bg-slate-900/60'}`}></div>
            </>
          )}

          {!isExpanded && (
            <div
              onClick={() => toggleMatchExpansion(match.id)}
              className="cursor-pointer px-3 sm:px-5 flex items-center justify-between border-b border-black/50 relative z-20 group transition-all duration-300 py-3 sm:py-4"
            >
              <div className="flex-1 flex items-center gap-2 justify-end text-right">
                <span className="text-[10px] sm:text-xs text-slate-200 font-bold uppercase tracking-wide truncate group-hover:text-white transition-colors">{homeTeamUpper}</span>
                <img src={homeLogoUrl} alt={homeTeamUpper} className="w-5 h-5 sm:w-7 sm:h-7 object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
              </div>
              
              <div className="px-3 sm:px-5 flex flex-col items-center justify-center">
                <div className={`flex items-center justify-center min-w-[60px] px-3 rounded-lg border shadow-inner backdrop-blur-md transition-all ${
                  matchStatus === 'LIVE' ? 'py-1.5 bg-red-950/50 border-red-500/50 animate-pulse' : 'py-1.5 bg-[#080d1a]/80 border-slate-700/50 group-hover:border-slate-500/80'
                }`}>
                  <span className={`font-black whitespace-nowrap tracking-widest ${
                    matchStatus === 'LIVE' ? 'text-xs sm:text-sm text-red-500' : 'text-xs sm:text-sm text-slate-200 group-hover:text-white'
                  }`}>
                    {matchStatus === 'NOT_STARTED' ? match.time : `${homeScore} - ${awayScore}`}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 flex items-center gap-2 justify-start text-left">
                <img src={awayLogoUrl} alt={awayTeamUpper} className="w-5 h-5 sm:w-7 sm:h-7 object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
                <span className="text-[10px] sm:text-xs text-slate-200 font-bold uppercase tracking-wide truncate group-hover:text-white transition-colors">{awayTeamUpper}</span>
              </div>
              
              <div className="ml-2 opacity-50 text-[10px] text-white group-hover:opacity-100 transition-opacity">▼</div>
            </div>
          )}

          {isExpanded && (
            <div className="relative flex-grow overflow-hidden animate-fadeIn z-10">
              <button 
                onClick={() => toggleMatchExpansion(match.id)}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 z-50 bg-slate-950/50 text-slate-300 hover:text-white border border-slate-700/50 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shadow-lg backdrop-blur-md transition-colors"
                title="Küçült"
              >
                ✕
              </button>
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-full text-center pt-3 pb-1">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 tracking-widest uppercase bg-slate-950/50 px-3 py-1 rounded-full shadow-inner">
                    {match.weekLabel}
                  </span>
                </div>
                <div className="w-full text-center px-2 mt-2 relative z-30">
                  <span className={`inline-block w-[95%] sm:w-[85%] mx-auto px-3 py-1.5 rounded-lg border shadow-[0_0_15px_currentColor] text-[9px] sm:text-[10px] font-black uppercase tracking-widest leading-snug whitespace-nowrap ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                    {match.category}
                  </span>
                </div>

                <div className="flex items-center justify-between px-2 sm:px-6 pt-3 pb-4">
                  <div className="flex flex-col items-center justify-center flex-1 gap-3">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20">
                      <img src={homeLogoUrl} alt={homeTeamUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
                    </div>
                    <span className="text-white font-extrabold text-[9px] sm:text-[11px] text-center uppercase tracking-wide drop-shadow-md">{homeTeamUpper}</span>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-2 mx-1 sm:mx-4 w-36 sm:w-44 z-30">
                    {matchStatus === 'NOT_STARTED' && (
                      <div className="bg-slate-900/80 border border-slate-600/80 px-3 py-0.5 rounded-full shadow-sm backdrop-blur-md">
                        <span className="text-amber-400 text-[10px] sm:text-xs font-bold tracking-widest drop-shadow-md">⏱ {match.time}</span>
                      </div>
                    )}
                    {matchStatus === 'LIVE' && (
                      <div className="bg-red-950/80 border border-red-700 px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1.5 animate-pulse backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        <span className="text-red-500 text-[10px] font-black tracking-widest">CANLI</span>
                      </div>
                    )}
                    {matchStatus === 'WAITING_APPROVAL' && (
                      <div className="bg-amber-950/80 border border-amber-700 px-3 py-0.5 rounded-full shadow-sm backdrop-blur-md">
                        <span className="text-amber-500 text-[9px] sm:text-[10px] font-black tracking-widest">ONAY BEKLİYOR</span>
                      </div>
                    )}
                    {isFinished && (
                      <div className="bg-slate-900/80 border border-slate-600/80 px-3 py-0.5 rounded-full shadow-sm backdrop-blur-md">
                        <span className="text-slate-400 text-[10px] font-black tracking-widest">MS (BİTTİ)</span>
                      </div>
                    )}

                    <div className={`w-full bg-[#080d1a]/80 border ${theme.scoreBorder} py-2 sm:py-3 rounded-xl flex items-center justify-center gap-2 sm:gap-3 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
                      <span className="text-xl sm:text-3xl font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{homeScore}</span>
                      <span className={`text-base sm:text-xl font-bold ${isChampionsLeague ? 'text-white/50' : 'text-blue-400/50'}`}>:</span>
                      <span className="text-xl sm:text-3xl font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{awayScore}</span>
                    </div>

                    {matchStatus === 'NOT_STARTED' && countdownText && (
                      <div className="w-full bg-[#0c2a3b]/50 border border-[#164e63]/50 py-1 rounded-lg text-center shadow-md mt-1">
                        <span className="text-[#38bdf8] text-[9px] sm:text-[10px] font-mono font-bold tracking-widest drop-shadow-sm">
                          {countdownText}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center flex-1 gap-3">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20">
                      <img src={awayLogoUrl} alt={awayTeamUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
                    </div>
                    <span className="text-white font-extrabold text-[9px] sm:text-[11px] text-center uppercase tracking-wide drop-shadow-md">{awayTeamUpper}</span>
                  </div>
                </div>
              
                <div className={`${theme.bottomBar} border-t px-3 py-2.5 w-full backdrop-blur-md z-10 relative mt-auto`}>
                  <div className="flex justify-between items-center w-full">
                    <div className="text-left flex-1">
                      {matchStatus === 'NOT_STARTED' ? (
                        <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 italic">Maç saatini bekliyor...</span>
                      ) : winnersCount === 0 ? (
                        <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 italic">Şu an skoru bilen yok</span>
                      ) : (
                        <span className="text-[9px] sm:text-[10px] font-medium text-blue-200">
                          <strong className="text-blue-400">{winnersCount} kişi</strong> tam isabetli
                        </span>
                      )}
                    </div>
                    <div className="flex-0 text-center px-1">
                      <span className={`text-[8px] font-black tracking-widest whitespace-nowrap px-2 py-0.5 rounded block shadow-[0_0_10px_currentColor] border ${theme.tagText} ${theme.tagBg} ${theme.tagBorder}`}>
                        {isTffMatch ? "TFF MAÇI" : "MASTER & DFO MAÇI"}
                      </span>
                    </div>
                    <div className="text-right flex-1">
                      {winnersCount > 0 && (
                        <button onClick={() => toggleWinners(match.id)} className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-[9px] sm:text-[10px] outline-none whitespace-nowrap drop-shadow-sm">
                          {isWinnersOpen ? "Gizle ▲" : "Bilenleri gör →"}
                        </button>
                      )}
                    </div>
                  </div>
                
                  {isWinnersOpen && winnersCount > 0 && (
                    <div className="w-full mt-2 p-2.5 bg-blue-950/20 rounded-lg border border-blue-800/40 text-xs animate-fadeIn shadow-inner">
                      <div className="text-blue-300/80 font-semibold mb-2 border-b border-blue-900/50 pb-1.5 flex justify-between items-center text-[9px] sm:text-[10px]">
                        <span>BİLEN YARIŞMACILAR (A-Z)</span>
                        <span className="text-blue-300 font-bold bg-blue-900/40 px-2 py-0.5 rounded border border-blue-700/50">Kişi Başı: {displayPoints} Puan</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                        {currentWinners.map((winner: string, idx: number) => (
                          <span key={idx} className="border px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-medium transition-all duration-500 bg-blue-900/60 text-white border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                            {winner}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
  };

  return (
    <div className="w-full max-w-6xl mx-auto mb-8 flex flex-col gap-5">
      
      {finishedMatches.length > 0 && (
        <div className="bg-slate-950/40 rounded-2xl border border-slate-800/50 shadow-xl backdrop-blur-xl overflow-hidden">
          <button 
            onClick={() => setIsFinishedAccordionOpen(!isFinishedAccordionOpen)}
            className="w-full flex items-center justify-between px-4 py-2 sm:py-3 bg-slate-900/50 hover:bg-slate-800/60 transition-colors border-b border-slate-800/50 group"
          >
            <div className="flex-1"></div> 
            <h2 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest text-center flex items-center gap-2">
              📅 GÜNÜN BİTEN MAÇLARI ({finishedMatches.length})
            </h2>
            <div className="flex-1 flex justify-end">
              <div className={`p-1 transition-transform duration-300 ${isFinishedAccordionOpen ? 'rotate-180' : ''}`}>
                <span className="text-slate-500 text-[10px] sm:text-xs">▼</span>
              </div>
            </div>
          </button>
          
          {isFinishedAccordionOpen && (
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-start bg-slate-900/20">
              {finishedMatches.map(match => renderMatchCard(match, true))}
            </div>
          )}
        </div>
      )}

      {activeMatches.length > 0 && (
        <div className="bg-slate-950/60 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-xl overflow-hidden">
          <button 
            onClick={() => setIsLiveAccordionOpen(!isLiveAccordionOpen)}
            className="w-full flex items-center justify-between px-4 py-3 sm:py-4 bg-slate-900/80 hover:bg-slate-800/80 transition-colors border-b border-slate-800/80 group"
          >
            <div className="flex-1 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            </div> 
            <h2 className="text-xs sm:text-sm font-black text-amber-500 uppercase tracking-widest drop-shadow-md text-center">
              GÜNÜN CANLI MAÇLARI ({activeMatches.length})
            </h2>
            <div className="flex-1 flex justify-end">
              <div className={`p-1 transition-transform duration-300 ${isLiveAccordionOpen ? 'rotate-180' : ''}`}>
                <span className="text-slate-400 text-[10px] sm:text-xs">▼</span>
              </div>
            </div>
          </button>
          
          {isLiveAccordionOpen && (
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-start bg-slate-900/30">
              {activeMatches.map(match => renderMatchCard(match, false))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}