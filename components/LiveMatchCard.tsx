'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface MatchDetails {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: string;
  awayScore: string;
  category: string;
  status: string;
  time: string;
  date: string;
  weekLabel?: string;
  winners?: string[];
  pointsDistributed?: number;
}

const getEliteTheme = (category: string, homeTeam: string, awayTeam: string, isExpanded: boolean) => {
  const upCat = category ? category.toUpperCase() : '';

  let theme = { 
    bgImg: null as string | null, 
    containerBorder: "border-slate-500", 
    containerShadow: "shadow-none", 
    containerBg: "bg-slate-900", 
    badgeBg: "", 
    badgeText: "text-slate-300", 
    badgeBorder: "", 
    catText: "text-slate-400", 
    scoreBorder: "border-slate-700", 
    colonText: "text-slate-500", 
    tagText: "text-slate-400", 
    tagBg: "bg-slate-800", 
    tagBorder: "border-slate-600", 
    bottomBar: "bg-slate-900",
    gradientOverlay: "from-slate-900/60 via-[#0a1120] to-[#050b14]" 
  };
  
  if (upCat.includes("ŞAMPİYONLAR LİGİ") || upCat.includes("Ş.L.")) {
     theme = { 
       ...theme, 
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
       bottomBar: "bg-[#050b14]/90 border-blue-900/30",
       gradientOverlay: "from-indigo-900/60 via-[#050b14] to-[#050b14]"
     };
  } else if (upCat.includes("AVRUPA LİGİ") || upCat.includes("A.L.")) {
     theme = { 
       ...theme, 
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
       bottomBar: "bg-[#140805]/90 border-orange-900/30",
       gradientOverlay: "from-orange-900/60 via-[#140805] to-[#140805]"
     };
  } else if (upCat.includes("KONFERANS LİGİ") || upCat.includes("K.L.")) {
     theme = { 
       ...theme, 
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
       bottomBar: "bg-[#05140b]/90 border-emerald-900/30",
       gradientOverlay: "from-emerald-900/60 via-[#05140b] to-[#05140b]"
     };
  } else if (upCat.includes("TÜRKİYE") || upCat.includes("TFF") || upCat.includes("AMATÖR")) {
     theme = { 
       ...theme, 
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
       bottomBar: "bg-[#140505]/90 border-red-900/30",
       gradientOverlay: "from-red-900/60 via-[#140505] to-[#140505]"
     };
  } else {
     theme = { 
       ...theme, 
       bgImg: null, 
       containerBorder: "border-blue-500/30", 
       containerShadow: "shadow-[0_0_30px_rgba(30,58,138,0.5)]", 
       containerBg: "bg-[#0a1120]", 
       badgeBg: "bg-transparent backdrop-blur-sm", 
       badgeText: "text-cyan-400", 
       badgeBorder: "border-cyan-500/80 shadow-[0_0_10px_currentColor]", 
       catText: "text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]", 
       scoreBorder: "border-blue-600/40", 
       colonText: "text-blue-400/50", 
       tagText: "text-cyan-300", 
       tagBg: "bg-cyan-950/90", 
       tagBorder: "border-cyan-400/80", 
       bottomBar: "bg-[#050b14]/90 border-blue-900/30",
       gradientOverlay: "from-blue-900/60 via-[#0a1120] to-[#050b14]"
     };
  }
  
  if (!isExpanded) {
      theme.containerBorder = theme.containerBorder.replace('500/50', '500/30').replace('500/80', '500/40');
      theme.containerShadow = theme.containerShadow.replace('0.4)', '0.1)').replace('0.5)', '0.1)');
  }
  
  return theme;
};

// 🔴 YEREL & BULUT LOGO BANKASI (Tüm Sayfalarla Senkronize) 🔴
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

  // Local/Custom Logos
  "ÇORUM FK": "/logos/corum-fk.png", "ESENLER EROKSPOR": "/logos/erokspor.png", "EROKSPOR": "/logos/erokspor.png",
  "SARIYER": "/logos/sariyer.png", "PENDİKSPOR": "/logos/pendikspor.png", "BOLUSPOR": "/logos/boluspor.png", 
  "İSTANBULSPOR": "/logos/istanbulspor.png", "BODRUMSPOR": "/logos/bodrumspor.png", "ERZURUMSPOR": "/logos/erzurumspor.png",
  "MUĞLASPOR": "/logos/muglaspor.png", "BANDIRMASPOR": "/logos/bandirmaspor.png", 
  "VOJVODINA": "/logos/vojvodina.png", "FERENCVAROS": "/logos/ferencvaros.png",
  "HAMMARBY": "/logos/hammarby.png", 
  "GENT": "/logos/gent.png", "AJAX": "/logos/ajax.png", 
  "BRAGA": "/logos/braga.png", "PAOK": "/logos/paok.png", "ANDERLECHT": "/logos/anderlecht.png", 
  "TWENTE": "/logos/twente.png", "BENFICA": "/logos/benfica.png", "ARSENAL": "/logos/arsenal.png",
  "OLYMPIC LYON": "/logos/lyon.png", "OLYMPIQUE LYON": "/logos/lyon.png", "OLYMPIQUE LYONNAIS": "/logos/lyon.png", "LYON": "/logos/lyon.png"
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

const isTffMatchCheck = (category: string) => {
    if(!category) return false;
    const uppercaseCat = category.toUpperCase();
    return ( uppercaseCat.includes("TÜRKİYE") || uppercaseCat.includes("TFF") || uppercaseCat.includes("AMATÖR") );
};

export default function LiveMatchCard({ match, initiallyExpanded = false }: { match: MatchDetails, initiallyExpanded?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';
  
  const scoreDisplay = isFinished || isLive
    ? `${match.homeScore} : ${match.awayScore}`
    : (match.homeScore !== '-' && match.awayScore !== '-' ? `${match.homeScore} : ${match.awayScore}` : "-");

  const homeTeamUpper = match.homeTeam.toUpperCase();
  const awayTeamUpper = match.awayTeam.toUpperCase();
  
  const theme = getEliteTheme(match.category, homeTeamUpper, awayTeamUpper, isExpanded);
  
  const homeLogoUrl = localTeamLogos[homeTeamUpper] || getLocalLogoUrl(homeTeamUpper);
  const awayLogoUrl = localTeamLogos[awayTeamUpper] || getLocalLogoUrl(awayTeamUpper);
  
  const isTffMatch = isTffMatchCheck(match.category);
  const tffOrDfoText = isTffMatch ? "TFF MAÇI" : "MASTER & DFO MAÇI";

  if (!isExpanded) {
    return (
      <div 
        onClick={() => setIsExpanded(true)}
        className={`w-full mx-auto border rounded-xl overflow-hidden cursor-pointer hover:scale-[1.01] transition-all duration-300 flex items-center justify-between p-3 relative ${theme.containerBorder} ${theme.containerShadow} ${theme.containerBg}`}
      >
        <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none"></div>
        
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex-shrink-0">
            <Image src={homeLogoUrl} alt={homeTeamUpper} fill className="object-contain drop-shadow-md" unoptimized />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-white truncate max-w-[80px] sm:max-w-[120px] tracking-wider">{homeTeamUpper}</span>
        </div>

        <div className="flex flex-col items-center justify-center mx-2 sm:mx-4 flex-shrink-0 relative z-10">
          <div className={`px-3 py-1.5 rounded-lg border flex flex-col items-center justify-center gap-0.5 shadow-inner ${theme.tagBg} ${theme.tagBorder}`}>
             <span className={`text-[9px] sm:text-[10px] font-black ${isLive ? 'text-rose-500 animate-pulse' : (isFinished ? 'text-slate-400' : 'text-slate-500')}`}>
                {isLive ? 'CANLI' : (isFinished ? 'BİTTİ' : match.time)}
             </span>
             <span className="text-white font-black text-sm tracking-widest">{scoreDisplay}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end min-w-0">
          <span className="text-[10px] sm:text-xs font-bold text-white truncate max-w-[80px] sm:max-w-[120px] tracking-wider text-right">{awayTeamUpper}</span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex-shrink-0">
            <Image src={awayLogoUrl} alt={awayTeamUpper} fill className="object-contain drop-shadow-md" unoptimized />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-2xl mx-auto border rounded-2xl overflow-hidden transition-all duration-500 flex flex-col relative shadow-2xl ${theme.containerBorder} ${theme.containerShadow} ${theme.containerBg}`}>
      
      <button 
        onClick={() => setIsExpanded(false)}
        className="absolute top-2 sm:top-3 right-2 sm:right-3 z-50 w-7 h-7 sm:w-8 sm:h-8 bg-black/50 hover:bg-black/80 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all backdrop-blur-sm"
      >
        <span className="text-sm font-black mb-0.5">×</span>
      </button>

      <div className="p-4 sm:p-6 relative flex-grow overflow-hidden flex flex-col justify-center min-h-[220px] sm:min-h-[260px]">
        
        {theme.bgImg && (
          <>
            <div className="absolute inset-0 z-0 opacity-100 mix-blend-screen" style={{ backgroundImage: theme.bgImg, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}></div>
            <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradientOverlay} z-0`}></div>
          </>
        )}
        
        <div className="relative z-10 flex flex-col h-full justify-between">
          
          <div className="flex flex-col items-center justify-center mb-3 sm:mb-6 gap-2">
            {match.weekLabel && (
              <span className="text-[9px] sm:text-[10px] font-extrabold text-white bg-black/80 border border-white/30 px-3 py-0.5 rounded-full uppercase tracking-widest shadow-md backdrop-blur-sm">
                {match.weekLabel}
              </span>
            )}
            <div className={`w-full max-w-md text-center flex items-center justify-center px-4 py-1.5 sm:py-2 rounded-xl border backdrop-blur-md shadow-lg ${theme.badgeBg} ${theme.badgeBorder}`}>
              <span className={`text-[10px] sm:text-[12px] font-black uppercase tracking-wider leading-tight drop-shadow-sm ${theme.badgeText}`}>
                🏆 {match.category}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between px-0 sm:px-6 w-full">
            <div className="flex flex-col items-center justify-center flex-1 gap-2 sm:gap-4">
              <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20">
                 <img src={homeLogoUrl} alt={homeTeamUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
              </div>
              <span className="text-white font-black text-[10px] sm:text-[13px] text-center uppercase tracking-wider drop-shadow-lg leading-tight px-1">{homeTeamUpper}</span>
            </div>

            <div className="flex flex-col items-center justify-center mx-2 sm:mx-6 w-28 sm:w-36 z-30">
               <span className={`text-[9px] sm:text-[11px] font-black mb-1.5 sm:mb-2 px-3 py-1 rounded border shadow-sm tracking-widest uppercase backdrop-blur-sm ${isLive ? 'bg-rose-950/90 text-rose-400 border-rose-500/50 animate-pulse shadow-[0_0_10px_rgba(225,29,72,0.6)]' : (isFinished ? 'bg-slate-900/80 text-slate-400 border-slate-700/50' : `${theme.tagBg} ${theme.tagText} ${theme.tagBorder}`)}`}>
                  {isLive ? 'CANLI' : (isFinished ? 'MS (BİTTİ)' : match.time)}
               </span>
               <div className={`w-full bg-[#080d1a]/80 border ${theme.scoreBorder} py-3 sm:py-4 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.6)] backdrop-blur-md`}>
                  <span className="text-2xl sm:text-4xl font-black text-white tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                     {scoreDisplay}
                  </span>
               </div>
            </div>

            <div className="flex flex-col items-center justify-center flex-1 gap-2 sm:gap-4">
               <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20">
                 <img src={awayLogoUrl} alt={awayTeamUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
               </div>
              <span className="text-white font-black text-[10px] sm:text-[13px] text-center uppercase tracking-wider drop-shadow-lg leading-tight px-1">{awayTeamUpper}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`${theme.bottomBar} border-t px-4 py-3 sm:py-4 w-full backdrop-blur-md z-10 relative`}>
        <div className="flex items-center justify-between w-full">
           <span className="text-blue-400 font-black text-[10px] sm:text-xs tracking-widest uppercase">
               {match.winners && match.winners.length > 0 ? `${match.winners.length} kişi tam isabetli` : "BU SKORU BİLEN YOK"}
           </span>
           <span className={`text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded shadow-[0_0_10px_currentColor] border ${theme.tagText} ${theme.tagBg} ${theme.tagBorder}`}>
              {tffOrDfoText}
           </span>
           <button onClick={() => setIsExpanded(false)} className="text-slate-400 hover:text-slate-300 transition-colors font-medium text-[10px] sm:text-xs outline-none">
              Gizle ▲
           </button>
        </div>
        
        {match.winners && match.winners.length > 0 && (
           <div className="mt-3 sm:mt-4 border-t border-slate-700/50 pt-3 sm:pt-4">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-slate-500 text-[9px] sm:text-[10px] uppercase font-bold tracking-widest">BİLEN YARIŞMACILAR (A-Z)</span>
                 <span className="text-amber-400 text-[9px] sm:text-[10px] uppercase font-bold tracking-widest bg-amber-950/50 px-2 py-0.5 rounded border border-amber-900/50">Kişi Başı: {match.pointsDistributed || 0} Puan</span>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                 {match.winners.map((winner, idx) => (
                     <span key={idx} className="bg-[#080d1a]/80 border px-2 sm:px-2.5 py-1 rounded text-[9px] sm:text-[10px] font-bold text-slate-300 shadow-sm uppercase tracking-wider border-blue-900/40 whitespace-nowrap hover:border-blue-500/50 transition-colors">
                        {winner}
                     </span>
                 ))}
              </div>
           </div>
        )}
      </div>

    </div>
  );
}