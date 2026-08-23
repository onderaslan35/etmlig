'use client';

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { supabase } from '@/utils/supabase';

// 🔴 SABİT LİSTE
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
  "SPARTA PRAG": "https://tr.wikipedia.org/wiki/Special:FilePath/AC-Sparta-LOGO2021.svg",
  "OLIMPIYAKOS": "https://tr.wikipedia.org/wiki/Special:FilePath/Olympiacos_F.C_Emblem.svg",
  "KOCAELİSPOR": "https://de.wikipedia.org/wiki/Special:FilePath/Kocaelispor.svg",
  "EYÜPSPOR": "https://tr.wikipedia.org/wiki/Special:FilePath/Ey%C3%BCpspor_Logosu.png",
  "HRADEC KRALOVE": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Hradec_Kralove.png",
  "PARIS SG": "https://en.wikipedia.org/wiki/Special:FilePath/Paris_Saint-Germain_F.C..svg",
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
  "FK KAUNO ZALGIRIS": "https://images.fotmob.com/image_resources/logo/teamlogo/439132.png",
  "ÇORUM FK": "/logos/corum-fk.png", "ESENLER EROKSPOR": "/logos/erokspor.png", "EROKSPOR": "/logos/erokspor.png",
  "SARIYER": "/logos/sariyer.png", "PENDİKSPOR": "/logos/pendikspor.png", "BOLUSPOR": "/logos/boluspor.png", 
  "İSTANBULSPOR": "/logos/istanbulspor.png", "BODRUMSPOR": "/logos/bodrumspor.png", "ERZURUMSPOR": "/logos/erzurumspor.png",
  "MUĞLASPOR": "/logos/muglaspor.png", "BANDIRMASPOR": "/logos/bandirmaspor.png", 
  "VOJVODINA": "/logos/vojvodina.png", "FERENCVAROS": "/logos/ferencvaros.png",
  "HAMMARBY": "/logos/hammarby.png", 
  "GENT": "/logos/gent.png", "AJAX": "/logos/ajax.png", 
  "BRAGA": "/logos/braga.png", "PAOK": "/logos/paok.png", "ANDERLECHT": "/logos/anderlecht.png", 
  "TWENTE": "/logos/twente.png", "BENFICA": "/logos/benfica.png", "ARSENAL": "/logos/arsenal.png",
  "BAYERN MÜNİH": "https://images.fotmob.com/image_resources/logo/teamlogo/9823.png",
  "BORUSSIA DORTMUND": "https://images.fotmob.com/image_resources/logo/teamlogo/9789.png",
  "BAYER LEVERKUSEN": "https://images.fotmob.com/image_resources/logo/teamlogo/9788.png",
  "RB LEIPZIG": "https://images.fotmob.com/image_resources/logo/teamlogo/178475.png",
  "STUTTGART": "https://images.fotmob.com/image_resources/logo/teamlogo/10269.png",
  "EINTRACHT FRANKFURT": "https://images.fotmob.com/image_resources/logo/teamlogo/9810.png",
  "FREIBURG": "https://images.fotmob.com/image_resources/logo/teamlogo/9784.png",
  "MÖNCHENGLADBACH": "https://images.fotmob.com/image_resources/logo/teamlogo/9786.png",
  "WERDER BREMEN": "https://images.fotmob.com/image_resources/logo/teamlogo/9799.png",
  "WOLFSBURG": "https://images.fotmob.com/image_resources/logo/teamlogo/9721.png",
  "MAINZ 05": "https://images.fotmob.com/image_resources/logo/teamlogo/9781.png",
  "HOFFENHEIM": "https://images.fotmob.com/image_resources/logo/teamlogo/10223.png",
  "AUGSBURG": "https://images.fotmob.com/image_resources/logo/teamlogo/8406.png",
  "UNION BERLIN": "https://images.fotmob.com/image_resources/logo/teamlogo/9795.png",
  "BOCHUM": "https://images.fotmob.com/image_resources/logo/teamlogo/8322.png",
  "HEIDENHEIM": "https://images.fotmob.com/image_resources/logo/teamlogo/156973.png",
  "ST. PAULI": "https://images.fotmob.com/image_resources/logo/teamlogo/10202.png",
  "HOLSTEIN KIEL": "https://images.fotmob.com/image_resources/logo/teamlogo/8276.png",
  "OLİMPİC LYON": "https://upload.wikimedia.org/wikipedia/en/c/c6/Olympique_Lyonnais.svg",
  "OLYMPIC LYON": "https://www.etmlig.com.tr/logos/lyon.png",
  "MALAGA": "https://en.wikipedia.org/wiki/Special:FilePath/M%C3%A1laga_CF.svg",
  "LOSC LILLE": "https://images.fotmob.com/image_resources/logo/teamlogo/8639.png",
  "SPORTING CP": "https://images.fotmob.com/image_resources/logo/teamlogo/9768.png",
  "PORTO": "https://images.fotmob.com/image_resources/logo/teamlogo/9772.png",
  "BENFİCA": "https://images.fotmob.com/image_resources/logo/teamlogo/9773.png",
  "PSV": "https://images.fotmob.com/image_resources/logo/teamlogo/8640.png",
  "FEYENOORD": "https://images.fotmob.com/image_resources/logo/teamlogo/10235.png",
  "CLUB BRUGGE": "https://images.fotmob.com/image_resources/logo/teamlogo/8392.png",
  "GENK": "https://images.fotmob.com/image_resources/logo/teamlogo/9987.png",
  "UNION SG": "https://images.fotmob.com/image_resources/logo/teamlogo/6806.png",
  "ANTWERP": "https://images.fotmob.com/image_resources/logo/teamlogo/10141.png",
  "CELTIC": "https://images.fotmob.com/image_resources/logo/teamlogo/9827.png",
  "RANGERS": "https://images.fotmob.com/image_resources/logo/teamlogo/8548.png",
  "HEARTS": "https://images.fotmob.com/image_resources/logo/teamlogo/8274.png",
  "ABERDEEN": "https://images.fotmob.com/image_resources/logo/teamlogo/8485.png",
  "YOUNG BOYS": "https://en.wikipedia.org/wiki/Special:FilePath/BSC_Young_Boys_logo.svg",
  "BODO/GLIMT": "https://en.wikipedia.org/wiki/Special:FilePath/FK_Bodo_Glimt_logo.svg",
  "JUVENTUS": "https://images.fotmob.com/image_resources/logo/teamlogo/9885.png",
  "SLAVIA PRAG": "https://en.wikipedia.org/wiki/Special:FilePath/SK_Slavia_Praha_logo.svg",
  "DINAMO ZAGREP": "https://tr.wikipedia.org/wiki/Special:FilePath/Logo_GNK_Dinamo_Zagreb_(2019).svg",
  "LUGANO": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Lugano_logo.svg",
  "LENS": "https://en.wikipedia.org/wiki/Special:FilePath/RC_Lens_logo.svg",
  "FC HEIDENHEIM": "https://en.wikipedia.org/wiki/Special:FilePath/1._FC_Heidenheim_1846.svg",
  "HACKEN": "https://en.wikipedia.org/wiki/Special:FilePath/BK_H%C3%A4cken_logo.png"
};

const getLocalLogoUrl = (teamName: string) => {
  if (!teamName || teamName === '') return '/logos/default.png';
  const slug = teamName
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `/logos/${slug}.png`;
};

export default function MacArsiviPage() {
  const [selectedWeek, setSelectedWeek] = useState<number>(5);
  const [openWinnersMap, setOpenWinnersMap] = useState<{ [key: number]: boolean }>({});
  
  const [liveMatchesData, setLiveMatchesData] = useState<Record<number, any>>({});
  const [bulletinData, setBulletinData] = useState<Record<number, any>>({});
  const [predictionsDB, setPredictionsDB] = useState<Record<string, string[]>>({});
  const [dynamicPlayersList, setDynamicPlayersList] = useState<Record<string, string>>({}); 

  useEffect(() => {
    const fetchFromDB = async () => {
      try {
        const { data: dbPlayers } = await supabase.from('players').select('*');
        const mergedPlayersList: Record<string, string> = { ...allPlayersList };
        if (dbPlayers) {
           dbPlayers.forEach(p => { 
             mergedPlayersList[String(p.username)] = p.full_name || p.name; 
           });
        }
        
        const { data: liveData } = await supabase.from('live_matches').select('*');
        if (liveData) {
          const liveMap: Record<number, any> = {};
          liveData.forEach(row => liveMap[row.id] = row);
          setLiveMatchesData(liveMap);
        }

        const { data: bultenData } = await supabase.from('matches_bulletin').select('*');
        if (bultenData) {
           const bultenMap: Record<number, any[]> = {};
           bultenData.forEach(row => {
              if(!bultenMap[row.week_num]) bultenMap[row.week_num] = [];
              bultenMap[row.week_num].push({
                 id: row.match_index,
                 weekLabel: `${row.week_num}. Hafta - ${row.match_index}. MAÇ`,
                 category: row.category,
                 date: row.match_date,
                 time: row.match_time,
                 homeTeam: row.home_team,
                 awayTeam: row.away_team,
                 score: "- : -" 
              });
           });
           Object.keys(bultenMap).forEach(week => { bultenMap[Number(week)].sort((a,b) => a.id - b.id); });
           setBulletinData(bultenMap);
        }

        // 🔴 EKMEL DEVRİMİ: .ORDER SİLİNDİ
        let allPredictions: any[] = [];
        let fetchMore = true;
        let from = 0;
        const step = 1000;

        while (fetchMore) {
          const { data: pDataChunk, error } = await supabase.from('player_predictions').select('*').eq('week_num', selectedWeek).range(from, from + step - 1);
          if (!error && pDataChunk && pDataChunk.length > 0) {
             allPredictions = [...allPredictions, ...pDataChunk];
             if (pDataChunk.length < step) fetchMore = false; else from += step; 
          } else { fetchMore = false; }
        }

        if (allPredictions.length > 0) {
           const pMap: Record<string, string[]> = {};
           allPredictions.forEach(row => {
              const rowUserId = String(row.user_id);
              if (!mergedPlayersList[rowUserId]) {
                 mergedPlayersList[rowUserId] = `MİSAFİR ASKER (${rowUserId})`;
              }
              if(!pMap[rowUserId]) pMap[rowUserId] = Array(24).fill('-');
              pMap[rowUserId][row.match_index - 1] = row.predicted_score;
           });
           setPredictionsDB(pMap);
        }
        
        setDynamicPlayersList(mergedPlayersList);

      } catch (e) {
        console.log("Supabase baglantisi bekleniyor...");
      }
    };
    fetchFromDB(); 
    const interval = setInterval(fetchFromDB, 5000); 
    return () => clearInterval(interval);
  }, [selectedWeek]); 

  const currentMatches = bulletinData[selectedWeek] || [];

  const toggleWinners = (matchId: number) => {
    setOpenWinnersMap((prev) => ({ ...prev, [matchId]: !prev[matchId] }));
  };

  const isTffMatchCheck = (category: string) => {
    if(!category) return false;
    const uppercaseCat = category.toUpperCase();
    return (uppercaseCat.includes("TÜRKİYE") || uppercaseCat.includes("TFF") || uppercaseCat.includes("AMATÖR") || uppercaseCat.includes("PTT") || uppercaseCat.includes("2.LİG") || uppercaseCat.includes("3.LİG"));
  };

  const getEliteTheme = (category: string, homeTeam: string, awayTeam: string) => {
    const upCat = category ? category.toUpperCase() : '';
    const homeLogoUrl = localTeamLogos[homeTeam] || getLocalLogoUrl(homeTeam);
    const awayLogoUrl = localTeamLogos[awayTeam] || getLocalLogoUrl(awayTeam);
    let leagueLogoUrl = null;
    let theme = { bgImg: null as string | null, containerBorder: "border-slate-500", containerShadow: "shadow-none", containerBg: "bg-slate-900", badgeBg: "", badgeText: "text-slate-300", badgeBorder: "", catText: "text-slate-400", scoreBorder: "border-slate-700", colonText: "text-slate-500", tagText: "text-slate-400", tagBg: "bg-slate-800", tagBorder: "border-slate-600", bottomBar: "bg-slate-900", homeLogo: homeLogoUrl, awayLogo: awayLogoUrl, leagueLogo: leagueLogoUrl };
    
    if (upCat.includes("ŞAMPİYONLAR LİGİ") || upCat.includes("Ş.L.")) theme = { ...theme, bgImg: "url('/cl-bg.png')", containerBorder: "border-indigo-500/50", containerShadow: "shadow-[0_0_40px_rgba(79,70,229,0.4)]", containerBg: "bg-[#050b14]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-indigo-300", badgeBorder: "border-indigo-400/80 shadow-[0_0_10px_currentColor]", catText: "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]", scoreBorder: "border-white/30", colonText: "text-white/50", tagText: "text-cyan-300", tagBg: "bg-cyan-950/90", tagBorder: "border-cyan-400/80", bottomBar: "bg-[#050b14]/90 border-blue-900/30" };
    else if (isTffMatchCheck(upCat)) theme = { ...theme, bgImg: "url('/tff-bg.png')", containerBorder: "border-red-500/50", containerShadow: "shadow-[0_0_40px_rgba(239,68,68,0.4)]", containerBg: "bg-[#140505]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-red-400", badgeBorder: "border-red-500/80 shadow-[0_0_10px_currentColor]", catText: "text-red-300 drop-shadow-[0_0_8px_rgba(252,165,165,0.5)]", scoreBorder: "border-red-600/40", colonText: "text-red-400/50", tagText: "text-red-400", tagBg: "bg-red-950/90", tagBorder: "border-red-500/80", bottomBar: "bg-[#140505]/90 border-red-900/30" };
    else theme = { ...theme, bgImg: null, containerBorder: "border-blue-500/30", containerShadow: "shadow-[0_0_30px_rgba(30,58,138,0.5)]", containerBg: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/60 via-[#0a1120] to-[#050b14]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-cyan-400", badgeBorder: "border-cyan-500/80 shadow-[0_0_10px_currentColor]", catText: "text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]", scoreBorder: "border-blue-600/40", colonText: "text-blue-400/50", tagText: "text-cyan-300", tagBg: "bg-cyan-950/90", tagBorder: "border-cyan-400/80", bottomBar: "bg-[#050b14]/90 border-blue-900/30" };
    return theme;
  };

  const getUniqueMatchId = (week: number, index: number) => {
    if (week === 4) return index; 
    return (week * 100) + index;
  };

  const getWeekDateRange = (weekNum: number) => {
    const startDate = new Date(2026, 7, 11 + (weekNum - 4) * 7); 
    const endDate = new Date(2026, 7, 17 + (weekNum - 4) * 7);
    return `${startDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} - ${endDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 font-sans relative">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors font-bold text-xs bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-lg shadow-sm">
            <span className="text-base leading-none">←</span> Ana Sayfaya Dön
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3 border-b border-slate-800 pb-4">
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight flex items-center justify-center sm:justify-start gap-2">
              📂 MAÇ ARŞİVİ & FİKSTÜR
            </h1>
            <p className="text-slate-400 text-xs mt-1 bg-slate-900 inline-block px-3 py-1 rounded-md border border-slate-800">
              <strong className="text-amber-500 mr-1">{selectedWeek}. HAFTA BÜLTENİ:</strong> 
              {getWeekDateRange(selectedWeek)}
            </p>
          </div>
          <div>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-lg cursor-pointer outline-none transition-all shadow text-sm"
            >
              {[4, 5, 6, 7, 8, 9].map(week => (
                  <option key={week} value={week}>{week}. HAFTA BÜLTENİ</option>
              ))}
            </select>
          </div>
        </div>

        {currentMatches.length === 0 ? (
           <div className="w-full py-20 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
              <span className="text-5xl mb-4 block opacity-50">🏟️</span>
              <h2 className="text-xl font-bold text-slate-400 mb-2 tracking-widest">{selectedWeek}. HAFTA BÜLTENİ HAZIRLANIYOR</h2>
              <p className="text-slate-500 text-sm">Bu haftanın maç programı yönetici tarafından henüz yayınlanmadı.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {currentMatches.map((match: any) => {
              const isWinnersOpen = !!openWinnersMap[match.id];
              const isTffMatch = isTffMatchCheck(match.category);
              
              const homeUpper = match.homeTeam?.toUpperCase() || match.home_team?.toUpperCase();
              const awayUpper = match.awayTeam?.toUpperCase() || match.away_team?.toUpperCase();
              
              const theme = getEliteTheme(match.category, homeUpper, awayUpper);

              let homeScore = "-";
              let awayScore = "-";
              let matchStatus = "NOT_STARTED";
              let currentWinners: string[] = [];
              let winnersCount = 0;
              let displayPoints = 0;
              let isFinished = false;

              if (selectedWeek >= 4) {
                const uniqueId = getUniqueMatchId(selectedWeek, match.id);
                const dbMatch = liveMatchesData[uniqueId];
                if (dbMatch && dbMatch.status !== 'NOT_STARTED') {
                  matchStatus = dbMatch.status;
                  homeScore = dbMatch.home_score;
                  awayScore = dbMatch.away_score;
                  isFinished = (matchStatus === 'FINISHED' || matchStatus === 'HT' || matchStatus === 'LIVE' || matchStatus === 'WAITING_APPROVAL');
                  
                  if (isFinished && homeScore !== '-' && awayScore !== '-') {
                    const targetScore = `${homeScore}-${awayScore}`;
                    const predictionsToUse = predictionsDB;
                    
                    // 🔴 KOPYA KLON SİLİCİ KALDIRILDI! ADMİN PANELİ GİBİ 9 KİŞİYİ DE GÖSTERECEK!
                    currentWinners = Object.keys(predictionsToUse)
                      .filter(id => {
                         const pScore = predictionsToUse[id] ? predictionsToUse[id][match.id - 1] : null;
                         return pScore === targetScore;
                      })
                      .map(id => dynamicPlayersList[id] || `MİSAFİR ASKER (${id})`)
                      .sort((a, b) => a.localeCompare(b, 'tr'));

                    winnersCount = currentWinners.length;
                    if(winnersCount === 1) displayPoints = 12; else if(winnersCount === 2) displayPoints = 6; else if(winnersCount === 3) displayPoints = 5; else if(winnersCount === 4) displayPoints = 4; else if(winnersCount === 5) displayPoints = 3; else if(winnersCount === 6) displayPoints = 2; else if(winnersCount >= 7) displayPoints = 1; else displayPoints = 0;
                  }
                }
              }

              return (
                <div key={match.id} className={`w-full mx-auto border rounded-2xl overflow-hidden transition-all duration-500 flex flex-col relative ${theme.containerBorder} ${theme.containerShadow} ${theme.containerBg}`}>
                  <div className="p-4 sm:p-6 relative flex-grow overflow-hidden flex flex-col justify-center">
                    {theme.bgImg && (
                      <>
                        <div className="absolute inset-0 z-0 opacity-100" style={{ backgroundImage: theme.bgImg, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}></div>
                        <div className="absolute inset-0 bg-slate-900/40 z-0"></div>
                      </>
                    )}
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="flex flex-col items-center justify-center mb-2 sm:mb-4 gap-1.5 sm:gap-2">
                        <span className="text-[9px] sm:text-[10px] font-extrabold text-white bg-black/80 border border-white/30 px-3 py-0.5 rounded-full uppercase tracking-widest shadow-md backdrop-blur-sm">
                          {match.weekLabel}
                        </span>
                        <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border text-center flex items-center gap-1.5 ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                          🏆 {match.category}
                        </span>
                        <span className={`${theme.catText} text-[10px] sm:text-[11px] font-semibold tracking-widest mt-0.5 opacity-90`}>
                          {match.date} <span className="opacity-50 mx-1">|</span> {match.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-0 sm:px-4">
                        <div className="flex flex-col items-center justify-center flex-1 gap-1.5 sm:gap-3">
                          <div className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center relative z-20">
                            <img src={theme.homeLogo} alt={homeUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
                          </div>
                          <span className="text-white font-extrabold text-[10px] sm:text-[13px] text-center uppercase tracking-wide drop-shadow-lg leading-tight px-1">{homeUpper}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center mx-1.5 sm:mx-4 w-20 sm:w-32 z-30 relative">
                          <div className={`w-full bg-[#080d1a]/80 border ${theme.scoreBorder} py-2.5 sm:py-4 rounded-xl flex items-center justify-center gap-1.5 sm:gap-3 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
                            <span className="text-xl sm:text-4xl font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{homeScore}</span>
                            <span className={`text-base sm:text-2xl font-bold ${theme.colonText}`}>:</span>
                            <span className="text-xl sm:text-4xl font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{awayScore}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center flex-1 gap-1.5 sm:gap-3">
                          <div className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center relative z-20">
                            <img src={theme.awayLogo} alt={awayUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
                          </div>
                          <span className="text-white font-extrabold text-[10px] sm:text-[13px] text-center uppercase tracking-wide drop-shadow-lg leading-tight px-1">{awayUpper}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`${theme.bottomBar} border-t px-4 py-3 w-full backdrop-blur-md z-10 relative`}>
                    <div className="flex justify-between items-center w-full">
                      <div className="text-left flex-1">
                        {!isFinished ? (
                          <span className="text-[10px] sm:text-xs font-medium text-slate-400 italic drop-shadow-sm">Henüz oynanmadı</span>
                        ) : winnersCount === 0 ? (
                          <span className="text-[10px] sm:text-xs font-medium text-slate-400 italic drop-shadow-sm">Bu skoru bilen yok</span>
                        ) : (
                          <span className="text-[10px] sm:text-xs font-medium text-blue-200">
                            <strong className="text-amber-400">{winnersCount} kişi</strong> tam isabetli
                          </span>
                        )}
                      </div>
                      <div className="flex-0 text-center px-1">
                        <span className={`text-[9px] font-black tracking-widest whitespace-nowrap px-2.5 py-0.5 rounded block shadow-[0_0_10px_currentColor] border ${theme.tagText} ${theme.tagBg} ${theme.tagBorder}`}>
                          {isTffMatch ? "TFF MAÇI" : "DFO MAÇI"}
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
                      <div className="w-full mt-3 p-3 bg-slate-950/40 rounded-lg border border-slate-800/40 text-xs animate-fadeIn shadow-inner">
                        <div className="text-slate-300/80 font-semibold mb-2 border-b border-slate-800/50 pb-1.5 flex justify-between items-center text-[10px] sm:text-[11px]">
                          <span>BİLEN YARIŞMACILAR (A-Z)</span>
                          <span className="text-amber-400 font-bold bg-amber-900/20 px-2 py-0.5 rounded border border-amber-700/30">Kişi Başı: {displayPoints} Puan</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                          {currentWinners.map((winner: string, idx: number) => (
                            <span key={idx} className="border px-2 py-1 rounded text-[9px] sm:text-[10px] font-medium transition-all duration-500 bg-slate-900/60 text-white border-slate-600/50 shadow-[0_0_10px_rgba(0,0,0,0.4)]">
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
        )}
      </div>
    </div>
  );
}