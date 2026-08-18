'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/utils/supabase';

// 🔴 ANA YARIŞMACI LİSTESİ 🔴
const TEST_ACCOUNTS: Record<string, { pass: string, name: string }> = {
  "mankoman": { pass: "123456", name: "MANKOMAN (ADMİN)" },
  "262701": { pass: "00000", name: "MUHAMMET OKUMUŞ" }, "262702": { pass: "00000", name: "MURAT KARA" },
  "262703": { pass: "00000", name: "CEMALETTİN BELLİ" }, "262704": { pass: "00000", name: "YAPAY ZEKA" },
  "262705": { pass: "00000", name: "AHMET BİRCAN 🏆" }, "262706": { pass: "00000", name: "GAZİ AYAN 🏆🏆" },
  "262707": { pass: "00000", name: "HAKAN AYAN" }, "262708": { pass: "00000", name: "BAYRAM YILMAZ" },
  "262709": { pass: "00000", name: "SALİH KARACAOĞLU" }, "262710": { pass: "00000", name: "MUZAFFER ERTUĞRUL" },
  "262711": { pass: "00000", name: "RIDVAN DOGER" }, "262712": { pass: "00000", name: "MURAT AYDEMİR" },
  "262713": { pass: "00000", name: "VAHİT KÜLCÜ" }, "262714": { pass: "00000", name: "İSMAİL EKER 🏆" },
  "262715": { pass: "00000", name: "ŞEMSETTIN DÜGER" }, "262716": { pass: "00000", name: "BİROL DEMİREL" },
  "262717": { pass: "00000", name: "MURAT ALİ" }, "262718": { pass: "00000", name: "BEKİR KARADAĞ" },
  "262719": { pass: "00000", name: "UĞUR VARDAR" }, "262720": { pass: "00000", name: "HASAN ASLAN" },
  "262721": { pass: "00000", name: "MUSTAFA GÜMÜŞÇÜ" }, "262722": { pass: "00000", name: "MUSTAFA ERKAN" },
  "262723": { pass: "00000", name: "AYHAN LUŞOĞLU" }, "262724": { pass: "00000", name: "YÜCEL TOMAK" },
  "262725": { pass: "00000", name: "İLYAS KAZDAL" }, "262726": { pass: "00000", name: "HUDAVER TOPARDIC" },
  "262727": { pass: "00000", name: "YAHŞİ ERKAN🏆" }, "262728": { pass: "00000", name: "ÖNDER ASLAN" },
  "262729": { pass: "00000", name: "HAKAN GÜN" }, "262730": { pass: "00000", name: "ÖNDER IŞIK" },
  "262731": { pass: "00000", name: "FATİH AYAN" }, "262732": { pass: "00000", name: "R. İLHAN KARACA 🏆🏆" },
  "262733": { pass: "00000", name: "MUHSİN ASİLKAN" }, "262734": { pass: "00000", name: "LEVENT YILDIRIM" },
  "262735": { pass: "00000", name: "AYGÜN AKKEÇELİ" }, "262736": { pass: "00000", name: "MEHMET ALİ KARA" },
  "262737": { pass: "00000", name: "ŞAHİN GEZGİNCİ" }, "262738": { pass: "00000", name: "MEVLÜT EVLER" },
  "262739": { pass: "00000", name: "UĞUR GÜRBÜZ" }, "262740": { pass: "00000", name: "ABDULLAH DİK" },
  "262741": { pass: "00000", name: "SABAHATTİN ÇAYLAK" }, "262742": { pass: "00000", name: "ZEKERiYYA TOPKAYYA" },
  "262743": { pass: "00000", name: "MEHMET ALİ ŞAHİN" }, "262744": { pass: "00000", name: "İLYAS UYGUN" },
  "262745": { pass: "00000", name: "OĞUZ YILDIRIMKAYA" }, "262746": { pass: "00000", name: "MEHMET BAYIR" },
  "262747": { pass: "00000", name: "SAVAŞ ÇAĞLAYAN" }, "262748": { pass: "00000", name: "YASİN ŞAHİN" },
  "262749": { pass: "00000", name: "B.VEYSELOĞLU EROL" }, "262750": { pass: "00000", name: "MAHMUT CBR" },
  "262751": { pass: "00000", name: "HÜSEYİN ERBAŞ" }, "262810": { pass: "00000", name: "ADEM BULUT ERTÜRK" },
  "262753": { pass: "00000", name: "YUSUF KIZILTUĞ" }, "262754": { pass: "00000", name: "OSMAN ALİ AYDIN 🏆" },
  "262755": { pass: "00000", name: "DOĞAÇ ALKAN" }, "262756": { pass: "00000", name: "EYÜP KARACAOĞLU" },
  "262813": { pass: "00000", name: "KEMAL ERSOY" }, "262758": { pass: "00000", name: "MELİH PINAR" },
  "262762": { pass: "00000", name: "İLHAN DANIŞ" }, "262763": { pass: "00000", name: "MUSTAFA ELMAS" },
  "262770": { pass: "00000", name: "OZKAYA MAZAKALI BAYRAM" }, "262771": { pass: "00000", name: "ULAŞ ADIGÜZEL" },
  "262772": { pass: "00000", name: "CEMAL SİVRİKAYA 🏆" }, "262760": { pass: "00000", name: "UĞUR NES" },
  "262774": { pass: "00000", name: "ŞENOL CAN ÇAKICI" }, "262776": { pass: "00000", name: "CUMA OKUR" },
  "262777": { pass: "00000", name: "MİRAÇ TOPAL" }, "262778": { pass: "00000", name: "CENGİZ SAYAN" },
  "262780": { pass: "00000", name: "YUSUF KILIÇ" }, "262781": { pass: "00000", name: "KADİR SOLMAZ" },
  "262782": { pass: "00000", name: "YUSUF ERBAY" }, "262783": { pass: "00000", name: "YASİN AYAN" },
  "262784": { pass: "00000", name: "MEHMET AVCI" }, "262785": { pass: "00000", name: "METE BÜYÜKGÖL 🏆" },
  "262786": { pass: "00000", name: "SEDAT DİŞLİ" }, "262787": { pass: "00000", name: "MUSTAFA TUCİ" },
  "262788": { pass: "00000", name: "HAKAN ÇİFTÇİ" }, "262789": { pass: "00000", name: "ALİ ABUKAN" },
  "262790": { pass: "00000", name: "CUMALİ SÖKER" }, "351925": { pass: "00000", name: "ALİOS GÖZTEPE" },
  "350909": { pass: "00000", name: "DİNÇER ÖZER" }, "262815": { pass: "00000", name: "MURAT KAYA" },
  "262816": { pass: "00000", name: "SEDAT SEDAT" }, "262795": { pass: "00000", name: "SEFA İÇA" },
  "262796": { pass: "00000", name: "D. SERGEN TAŞYÜREK" }, "262797": { pass: "00000", name: "ÖMER DOGER" }
};

// 🔴 YEREL & BULUT LOGO BANKASI (ADMİN PANELİYLE BİREBİR AYNI) 🔴
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

  "ESPANYOL": "https://upload.wikimedia.org/wikipedia/de/a/a7/RCD_Espanyol_De_Barcelona.svg",
  "REAL MADRID": "https://upload.wikimedia.org/wikipedia/sco/5/56/Real_Madrid_CF.svg",
  "FROSINONE": "https://upload.wikimedia.org/wikipedia/de/2/2b/Frosinone_Calcio.svg",
  "JUVENTUS": "https://upload.wikimedia.org/wikipedia/commons/e/ef/Juventus_FC_-_pictogram_white_%28Italy%2C_2017%29.svg",
  
  "MALAGA": "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/M%C3%A1laga_CF.svg/200px-M%C3%A1laga_CF.svg.png",
  "DEPORTIVO LA CORUÑA": "https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/RC_Deportivo_La_Coru%C3%B1a_logo.svg/200px-RC_Deportivo_La_Coru%C3%B1a_logo.svg.png",
  "MONACO": "https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/AS_Monaco_FC.svg/200px-AS_Monaco_FC.svg.png",
  "LILLE": "https://upload.wikimedia.org/wikipedia/en/thumb/3/3f/Lille_OSC_2018_logo.svg/200px-Lille_OSC_2018_logo.svg.png",
  "NOTTINGHAM FOREST": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/Nottingham_Forest_F.C._logo.svg/200px-Nottingham_Forest_F.C._logo.svg.png",
  "LIVERPOOL": "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/200px-Liverpool_FC.svg.png",
  "FULHAM": "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Fulham_FC_%28shield%29.svg/200px-Fulham_FC_%28shield%29.svg.png",
  "EVERTON": "https://upload.wikimedia.org/wikipedia/en/thumb/f/fc/Everton_FC_logo.svg/200px-Everton_FC_logo.svg.png",
  "FK KAUNO ZALGIRIS": "https://images.fotmob.com/image_resources/logo/teamlogo/439132.png",

  // Yerel Logolar
  "ÇORUM FK": "/logos/corum-fk.png", "ESENLER EROKSPOR": "/logos/erokspor.png", "EROKSPOR": "/logos/erokspor.png",
  "SARIYER": "/logos/sariyer.png", "PENDİKSPOR": "/logos/pendikspor.png", "BOLUSPOR": "/logos/boluspor.png", 
  "İSTANBULSPOR": "/logos/istanbulspor.png", "BODRUMSPOR": "/logos/bodrumspor.png", "ERZURUMSPOR": "/logos/erzurumspor.png",
  "MUĞLASPOR": "/logos/muglaspor.png", "BANDIRMASPOR": "/logos/bandirmaspor.png", 
  "VOJVODINA": "/logos/vojvodina.png", "FERENCVAROS": "/logos/ferencvaros.png",
  "HAMMARBY": "/logos/hammarby.png", 
  "GENT": "/logos/gent.png", "AJAX": "/logos/ajax.png", 
  "BRAGA": "/logos/braga.png", "PAOK": "/logos/paok.png", "ANDERLECHT": "/logos/anderlecht.png", 
  "TWENTE": "/logos/twente.png", "BENFICA": "/logos/benfica.png", "ARSENAL": "/logos/arsenal.png",
  
  "OLYMPIC LYON": "/logos/lyon.png",
  "OLYMPIQUE LYON": "/logos/lyon.png",
  "OLYMPIQUE LYONNAIS": "/logos/lyon.png",
  "LYON": "/logos/lyon.png"
};

const normalizeTurkish = (text: string) => {
  if (!text) return '';
  return text.replace(/İ/g, 'i').replace(/I/g, 'ı').replace(/Ş/g, 'ş').replace(/Ğ/g, 'ğ').replace(/Ü/g, 'ü').replace(/Ö/g, 'ö').replace(/Ç/g, 'ç').toLowerCase().trim();
};

// 🚀 SADECE YEREL LOGO KLASÖRÜNE BAĞLI OTOMATİK MANTIK 🚀
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
  const uppercaseCat = category?.toUpperCase() || '';
  return ["TÜRKİYE 1.LİG", "TÜRKİYE KADINLAR SÜPER LİG", "TÜRKİYE KUPASI", "TÜRKİYE SÜPER KUPA", "TÜRKİYE SÜPER LİG", "TFF 1. LİG", "AMATÖR", "TÜRKİYE 2.LİG", "TÜRKİYE 3.LİG"].some(cat => uppercaseCat.includes(cat));
};

const getEliteTheme = (category: string, homeTeam: string, awayTeam: string) => {
    const upCat = category ? category.toUpperCase() : '';
    
    // 🚀 LOKAL LOGO MOTORU BURADA ÇALIŞIYOR 🚀
    const homeLogoUrl = localTeamLogos[homeTeam] || getLocalLogoUrl(homeTeam);
    const awayLogoUrl = localTeamLogos[awayTeam] || getLocalLogoUrl(awayTeam);

    let theme = { bgImg: null as string | null, containerBorder: "border-slate-500", containerShadow: "shadow-none", containerBg: "bg-slate-900", badgeBg: "", badgeText: "text-slate-300", badgeBorder: "", catText: "text-slate-400", scoreBorder: "border-slate-700", colonText: "text-slate-500", tagText: "text-slate-400", tagBg: "bg-slate-800", tagBorder: "border-slate-600", bottomBar: "bg-slate-900", homeLogo: homeLogoUrl, awayLogo: awayLogoUrl };

    if (upCat.includes("ŞAMPİYONLAR LİGİ") || upCat.includes("Ş.L.")) theme = { ...theme, bgImg: "url('/cl-bg.png')", containerBorder: "border-indigo-500/50", containerShadow: "shadow-[0_0_40px_rgba(79,70,229,0.4)]", containerBg: "bg-[#050b14]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-indigo-300", badgeBorder: "border-indigo-400/80 shadow-[0_0_10px_currentColor]", catText: "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]", scoreBorder: "border-white/30", colonText: "text-white/50", tagText: "text-cyan-300", tagBg: "bg-cyan-950/90", tagBorder: "border-cyan-400/80", bottomBar: "bg-[#050b14]/90 border-blue-900/30" };
    else if (upCat.includes("AVRUPA LİGİ") || upCat.includes("A.L.")) theme = { ...theme, bgImg: "url('/el-bg.png')", containerBorder: "border-orange-500/50", containerShadow: "shadow-[0_0_40px_rgba(249,115,22,0.4)]", containerBg: "bg-[#140805]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-orange-400", badgeBorder: "border-orange-500/80 shadow-[0_0_10px_currentColor]", catText: "text-orange-300 drop-shadow-[0_0_8px_rgba(253,186,116,0.5)]", scoreBorder: "border-orange-600/40", colonText: "text-orange-400/50", tagText: "text-orange-300", tagBg: "bg-orange-950/90", tagBorder: "border-orange-400/80", bottomBar: "bg-[#140805]/90 border-orange-900/30" };
    else if (upCat.includes("KONFERANS LİGİ") || upCat.includes("K.L.")) theme = { ...theme, bgImg: "url('/uecl-bg.png')", containerBorder: "border-emerald-500/50", containerShadow: "shadow-[0_0_40px_rgba(16,185,129,0.4)]", containerBg: "bg-[#05140b]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-emerald-400", badgeBorder: "border-emerald-500/80 shadow-[0_0_10px_currentColor]", catText: "text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.5)]", scoreBorder: "border-emerald-600/40", colonText: "text-emerald-400/50", tagText: "text-emerald-300", tagBg: "bg-emerald-950/90", tagBorder: "border-emerald-400/80", bottomBar: "bg-[#05140b]/90 border-emerald-900/30" };
    else if (isTffMatchCheck(upCat)) theme = { ...theme, bgImg: "url('/tff-bg.png')", containerBorder: "border-red-500/50", containerShadow: "shadow-[0_0_40px_rgba(239,68,68,0.4)]", containerBg: "bg-[#140505]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-red-400", badgeBorder: "border-red-500/80 shadow-[0_0_10px_currentColor]", catText: "text-red-300 drop-shadow-[0_0_8px_rgba(252,165,165,0.5)]", scoreBorder: "border-red-600/40", colonText: "text-red-400/50", tagText: "text-red-400", tagBg: "bg-red-950/90", tagBorder: "border-red-500/80", bottomBar: "bg-[#140505]/90 border-red-900/30" };
    else theme = { ...theme, bgImg: null, containerBorder: "border-blue-500/30", containerShadow: "shadow-[0_0_30px_rgba(30,58,138,0.5)]", containerBg: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/60 via-[#0a1120] to-[#050b14]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-cyan-400", badgeBorder: "border-cyan-500/80 shadow-[0_0_10px_currentColor]", catText: "text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]", scoreBorder: "border-blue-600/40", colonText: "text-blue-400/50", tagText: "text-cyan-300", tagBg: "bg-cyan-950/90", tagBorder: "border-cyan-400/80", bottomBar: "bg-[#050b14]/90 border-blue-900/30" };
    
    return theme;
};

const cleanTeamName = (name: string) => {
    if(!name) return "";
    return name.trim().toUpperCase();
};

export default function TahminlerPortal() {
  const [view, setView] = useState<'lobby' | 'declaration' | 'entry' | 'tahminmatik'>('lobby');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(''); 
  const [loginError, setLoginError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sortOrder, setSortOrder] = useState<'A-Z' | 'Z-A' | 'ZAMAN'>('A-Z'); 

  const [bulletinMap, setBulletinMap] = useState<Record<number, any[]>>({}); 
  const [predictions, setPredictions] = useState<Record<number, { home: string, away: string }>>({});
  const [oldPredictions, setOldPredictions] = useState<Record<number, { home: string, away: string }>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [tahminmatikScores, setTahminmatikScores] = useState<Record<number, { home: string, away: string }>>({});

  const [selectedEntryWeek, setSelectedEntryWeek] = useState<number>(5); 
  const [selectedTahminWeek, setSelectedTahminWeek] = useState<number>(5);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: bultenData } = await supabase.from('matches_bulletin').select('*').limit(1000);
      if (bultenData) {
         const newMap: Record<number, any[]> = {};
         bultenData.forEach(row => {
            if(!newMap[row.week_num]) newMap[row.week_num] = [];
            newMap[row.week_num].push({
               id: row.match_index,
               weekLabel: `${row.week_num}. Hafta - ${row.match_index}. MAÇ`,
               category: row.category,
               date: row.match_date,
               time: row.match_time,
               homeTeam: row.home_team,
               awayTeam: row.away_team
            });
         });
         Object.keys(newMap).forEach(week => { newMap[Number(week)].sort((a,b) => a.id - b.id); });
         setBulletinMap(newMap);
      }
    };
    fetchInitialData();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoginError('');
    const userKey = username.trim(); const passKey = password.trim(); 
    const account = TEST_ACCOUNTS[userKey];
    if (account && passKey === account.pass) { 
      setDisplayName(account.name); await fetchBulletinAndPredictions(userKey); setView('entry');
    } else { setLoginError('Sistem şu an yapılandırma ve test aşamasındadır. Yalnızca kayıtlı yetkili girişine izin verilmektedir.'); }
  };

  const fetchBulletinAndPredictions = async (currentUsername: string) => {
    const bData = bulletinMap[selectedEntryWeek] || [];
    const { data: pData } = await supabase.from('player_predictions').select('*').eq('week_num', selectedEntryWeek).eq('user_id', currentUsername);
    if (bData && bData.length > 0) {
      const initialPreds: Record<number, { home: string, away: string }> = {};
      bData.forEach((m:any) => {
        const existingPred = pData?.find(p => p.match_index === m.id);
        if (existingPred && existingPred.predicted_score) {
          const [h, a] = existingPred.predicted_score.split('-');
          initialPreds[m.id] = { home: h || '-', away: a || '-' };
        } else { initialPreds[m.id] = { home: '-', away: '-' }; }
      });
      setPredictions(initialPreds); setOldPredictions(JSON.parse(JSON.stringify(initialPreds))); 
    }
  };

  const handleScoreChange = (matchIndex: number, team: 'home' | 'away', score: string) => { setPredictions(prev => ({ ...prev, [matchIndex]: { ...prev[matchIndex], [team]: score } })); };
  const handleTahminmatikChange = (matchId: number, type: 'home' | 'away', val: string) => { setTahminmatikScores(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || { home: '-', away: '-' }), [type]: val } })); };
  
  const handleTahminMatikRastgele = () => {
    const newPreds = { ...predictions };
    Object.keys(newPreds).forEach(matchIndex => {
      if (newPreds[Number(matchIndex)].home === '-' || newPreds[Number(matchIndex)].away === '-') {
        newPreds[Number(matchIndex)] = { home: Math.floor(Math.random() * 4).toString(), away: Math.floor(Math.random() * 4).toString() };
      }
    });
    setPredictions(newPreds);
  };

  const savePredictions = async () => {
    const missing = Object.values(predictions).some(p => p.home === '-' || p.away === '-');
    if (missing) { alert('Lütfen tüm maçların skorlarını doldurun veya RASTGELE DOLDUR kullanın!'); return; }
    setIsSaving(true);
    try {
      const payload = Object.keys(predictions).map(matchIndex => ({
        user_id: username.trim(), week_num: selectedEntryWeek, match_index: Number(matchIndex),
        predicted_score: `${predictions[Number(matchIndex)].home}-${predictions[Number(matchIndex)].away}`
      }));
      const { error } = await supabase.from('player_predictions').upsert(payload, { onConflict: 'user_id,week_num,match_index' });
      if(error) throw error;
      try {
        await fetch('/api/log-tahmin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kullanici_id: username.trim(), kullanici_adi: displayName, hafta: selectedEntryWeek, eski_tahminler: oldPredictions, yeni_tahminler: predictions }) });
      } catch (logErr) {}
      setShowSuccessModal(true);
    } catch (e) { alert('❌ Kayıt sırasında bir hata oluştu!'); }
    setIsSaving(false);
  };

  const scoreOptionsArr = ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];
  const toggleSortOrder = () => { if (sortOrder === 'A-Z') setSortOrder('Z-A'); else if (sortOrder === 'Z-A') setSortOrder('ZAMAN'); else setSortOrder('A-Z'); };

  const [livePredictionsData, setLivePredictionsData] = useState<Record<number, Record<string, string[]>>>({});

  useEffect(() => {
     const fetchLivePreds = async () => {
        let allData: any[] = []; let from = 0; let step = 999; let keepFetching = true;
        while(keepFetching) {
            const { data } = await supabase.from('player_predictions').select('*').eq('week_num', selectedTahminWeek).range(from, from + step);
            if (data && data.length > 0) { allData = [...allData, ...data]; if (data.length <= step) keepFetching = false; else from += step + 1; } else { keepFetching = false; }
        }
        if (allData.length > 0) {
            const newData: Record<number, Record<string, string[]>> = {};
            allData.forEach(row => {
                const wk = row.week_num; const uid = String(row.user_id);
                if(!newData[wk]) newData[wk] = {};
                if(!newData[wk][uid]) newData[wk][uid] = Array(24).fill('PAS');
                newData[wk][uid][row.match_index - 1] = row.predicted_score;
            });
            setLivePredictionsData(newData);
        } else { setLivePredictionsData({}); }
     };
     fetchLivePreds();
  }, [selectedTahminWeek, view]);

  const finalPlayersList = useMemo(() => {
    let allIds = Object.keys(TEST_ACCOUNTS).filter(id => id !== 'mankoman');
    const selectedWeekData = livePredictionsData[selectedTahminWeek] || {};
    if (searchTerm) {
      const normalizedSearch = normalizeTurkish(searchTerm);
      allIds = allIds.filter(id => { const pName = normalizeTurkish(TEST_ACCOUNTS[id]?.name || ""); return pName.includes(normalizedSearch); });
    }
    const submittedIds = allIds.filter(id => selectedWeekData[id] && selectedWeekData[id].some(s => s !== 'PAS'));
    if (sortOrder === 'A-Z') { submittedIds.sort((a, b) => TEST_ACCOUNTS[a].name.localeCompare(TEST_ACCOUNTS[b].name, 'tr')); } else if (sortOrder === 'Z-A') { submittedIds.sort((a, b) => TEST_ACCOUNTS[b].name.localeCompare(TEST_ACCOUNTS[a].name, 'tr')); }
    return submittedIds; 
  }, [searchTerm, sortOrder, selectedTahminWeek, livePredictionsData]);

  const ghostColumns = Array.from({ length: 10 });

  const downloadJPEG = async () => {
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); 
      const htmlToImage = await import('html-to-image');
      const element = document.getElementById('jpeg-export-container');
      if (!element) throw new Error("Stüdyo elementi bulunamadı");
      const dataUrl = await htmlToImage.toJpeg(element, { quality: 0.95, backgroundColor: '#050b14', pixelRatio: 1.5 });
      const link = document.createElement("a"); link.download = `ETM_Lig_${selectedTahminWeek}_Hafta_Tahminler.jpg`; link.href = dataUrl;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch (error: any) { alert("HATA: Fotoğraf motoru bir engele takıldı. Detay: " + error.message); }
    setIsDownloading(false);
  };

  const activePlayersForJPEG = useMemo(() => {
    const selectedWeekData = livePredictionsData[selectedTahminWeek] || {};
    return Object.keys(TEST_ACCOUNTS).filter(id => id !== 'mankoman' && selectedWeekData[id] && selectedWeekData[id].some(s => s !== 'PAS')).sort((a, b) => TEST_ACCOUNTS[a].name.localeCompare(TEST_ACCOUNTS[b].name, 'tr'));
  }, [selectedTahminWeek, livePredictionsData]);

  const availableWeeks = Object.keys(bulletinMap).map(Number).sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 p-4 font-sans pb-24 transition-opacity duration-500">
      
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050b14]/90 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(16,185,129,0.3)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div><div className="text-6xl mb-6 mt-2 drop-shadow-lg">🏆</div>
            <h3 className="text-3xl font-black text-emerald-400 mb-3 tracking-widest">TEBRİKLER!</h3>
            <p className="text-slate-300 font-medium mb-8 text-sm leading-relaxed">Tahminleriniz {selectedEntryWeek}. Hafta için sisteme kaydedilmiştir.</p>
            <button onClick={() => { setShowSuccessModal(false); setView('lobby'); setUsername(''); setPassword(''); }} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] uppercase">TAMAM</button>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto pt-10">
        
        {view === 'lobby' && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-12"><h1 className="text-4xl md:text-5xl font-black text-amber-500 tracking-widest drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">ETM LİGİ MERKEZ PORTALI</h1><p className="text-slate-400 mt-4 text-lg font-medium">Lütfen yapmak istediğiniz işlemi seçin.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
              
              <div onClick={() => setView('declaration')} className="bg-slate-900/50 border-2 border-indigo-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-900/20 hover:border-indigo-500 transition-all group shadow-[0_0_30px_rgba(79,70,229,0.1)]">
                <div className="w-20 h-20 bg-indigo-950 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><span className="text-4xl">📜</span></div>
                <h2 className="text-xl font-black text-indigo-400 tracking-widest mb-3">RESMİ DEKLARASYON</h2>
                <p className="text-slate-400 text-xs">Geçmiş haftaların tahmin arşivini ve resmi oyuncu listelerini inceleyin.</p>
                <div className="mt-8 px-6 py-2 bg-indigo-600/20 text-indigo-300 border border-indigo-500/50 rounded-full font-bold text-xs uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white transition-colors">Arşive Giriş Yap</div>
              </div>

              <div onClick={() => setView('tahminmatik')} className="bg-slate-900/50 border-2 border-emerald-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-emerald-900/20 hover:border-emerald-500 transition-all group shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <div className="w-20 h-20 bg-emerald-950 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_currentColor]"><span className="text-4xl drop-shadow-md">⚡</span></div>
                <h2 className="text-xl font-black text-emerald-400 tracking-widest mb-3">TAHMİNMATİK</h2>
                <p className="text-slate-400 text-xs">İstediğiniz skoru seçin, kimlerin o skoru tahmin ettiğini anında bulun.</p>
                <div className="mt-8 px-6 py-2 bg-emerald-600/20 text-emerald-300 border border-emerald-500/50 rounded-full font-bold text-xs uppercase tracking-widest group-hover:bg-emerald-600 group-hover:text-white transition-colors">Tahminmatik'i Aç</div>
              </div>

              <div className="bg-slate-900/80 border-2 border-amber-500/30 rounded-3xl p-8 flex flex-col relative shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#050b14] px-4 w-full text-center"><span className="text-amber-500 font-black tracking-widest text-[11px] sm:text-xs bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)] whitespace-nowrap">MERKEZ GİRİŞ SİSTEMİ (AÇIK)</span></div>
                <div className="mt-6 mb-4">
                   <label className="block text-center text-xs font-bold text-slate-400 tracking-widest mb-2">GİRİŞ YAPILACAK HAFTA</label>
                   <select value={selectedEntryWeek} onChange={(e) => setSelectedEntryWeek(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 text-amber-400 font-black text-lg px-4 py-3 rounded-xl outline-none text-center cursor-pointer shadow-inner">
                     {availableWeeks.filter(w => w >= 4).map(week => ( <option key={`entry-${week}`} value={week}>{week}. HAFTA BÜLTENİ</option> ))}
                   </select>
                </div>
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-5"></div>
                <form onSubmit={handleLogin} className="flex flex-col gap-3">
                  <input type="text" placeholder="Yarışmacı ID" value={username} onChange={e => setUsername(e.target.value)} className="bg-slate-950 border border-slate-700 px-4 py-2.5 rounded-xl text-white outline-none text-center font-black tracking-widest text-sm" />
                  <input type="password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)} className="bg-slate-950 border border-slate-700 px-4 py-2.5 rounded-xl text-white outline-none text-center tracking-widest text-sm" />
                  {loginError && <p className="text-[10px] text-red-400 font-bold text-center bg-red-950/50 py-1.5 rounded-lg border border-red-500/30">{loginError}</p>}
                  <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] mt-1 tracking-widest flex items-center justify-center gap-2 text-sm">GİRİŞ YAP VE DOLDUR</button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* ===================== TAHMİNMATİK (ARŞİV) ===================== */}
        {view === 'tahminmatik' && (
          <div className="animate-fade-in-up w-full">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-slate-900/50 p-6 rounded-2xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] relative z-50">
              <button onClick={() => setView('lobby')} className="flex items-center gap-2 text-slate-400 hover:text-white font-bold bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 transition-colors"><span>⬅</span> Lobiye Dön</button>
              <div className="text-center"><h2 className="text-2xl md:text-3xl font-black text-emerald-500 tracking-widest drop-shadow-[0_0_10px_rgba(16,185,129,0.4)] uppercase flex items-center justify-center gap-3"><span className="text-3xl md:text-4xl">⚡</span> TAHMİNMATİK</h2></div>
              <div><select value={selectedTahminWeek} onChange={(e) => setSelectedTahminWeek(Number(e.target.value))} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer outline-none transition-all shadow text-xs sm:text-sm">{availableWeeks.filter(w => w >= 4).map(week => ( <option key={`tahminmatik-${week}`} value={week}>{week}. HAFTA</option> ))}</select></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {bulletinMap[selectedTahminWeek] ? bulletinMap[selectedTahminWeek].map((match: any) => {
                const hName = cleanTeamName(match.homeTeam || match.home_team);
                const aName = cleanTeamName(match.awayTeam || match.away_team);

                // 🚀 LOKAL LOGO MANTIĞI BURAYA EKLENDİ 🚀
                const theme = getEliteTheme(match.category, hName, aName);
                
                const tScore = tahminmatikScores[match.id] || { home: '-', away: '-' };
                const isComplete = tScore.home !== '-' && tScore.away !== '-';
                const targetScore = `${tScore.home}-${tScore.away}`;
                  
                const selectedWeekData = livePredictionsData[selectedTahminWeek] || {};
                const predictors = isComplete ? Object.keys(selectedWeekData).filter(uid => selectedWeekData[uid][match.id - 1] === targetScore && TEST_ACCOUNTS[uid]).map(uid => TEST_ACCOUNTS[uid]?.name || "Bilinmeyen").sort((a,b) => a.localeCompare(b, 'tr')) : [];

                return (
                  <div key={`tm-${match.id}`} className={`w-full mx-auto border rounded-2xl overflow-hidden transition-all duration-500 flex flex-col relative ${theme.containerBorder} ${theme.containerShadow} ${theme.containerBg}`}>
                    <div className="p-4 sm:p-6 relative flex-grow overflow-hidden flex flex-col justify-center">
                      {theme.bgImg && ( <><div className="absolute inset-0 z-0 opacity-100" style={{ backgroundImage: theme.bgImg, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}></div><div className="absolute inset-0 bg-slate-900/40 z-0"></div></> )}
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex flex-col items-center justify-center mb-2 sm:mb-4 gap-1.5 sm:gap-2"><span className="text-[9px] sm:text-[10px] font-extrabold text-white bg-black/80 border border-white/30 px-3 py-0.5 rounded-full uppercase tracking-widest">{match.weekLabel}</span><span className={`text-[10px] sm:text-[11px] font-black uppercase px-3 py-1 rounded-lg border text-center flex items-center gap-1.5 ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>🏆 {match.category}</span></div>
                        <div className="flex items-center justify-between px-0 sm:px-4 mt-2">
                          <div className="flex flex-col items-center justify-center flex-1 gap-1.5 sm:gap-3">
                            {/* LOGO ÇEKİMİ TEMADAN GELİYOR */}
                            <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20"><img src={theme.homeLogo} alt={hName} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]" /></div>
                            <span className="text-white font-extrabold text-[9px] sm:text-[12px] text-center uppercase tracking-wide drop-shadow-lg leading-tight px-1">{hName}</span>
                          </div>
                          <div className="flex flex-col items-center justify-center mx-1.5 sm:mx-4 w-24 sm:w-36 z-30">
                            <div className={`w-full bg-[#080d1a]/80 border ${theme.scoreBorder} py-2.5 sm:py-3.5 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
                              <select value={tScore.home} onChange={e => handleTahminmatikChange(match.id, 'home', e.target.value)} className="bg-slate-950 border border-slate-700 text-amber-400 font-black text-lg sm:text-2xl px-1 sm:px-2 py-1 rounded-lg outline-none text-center w-10 sm:w-12 appearance-none cursor-pointer" style={{textAlignLast: 'center'}}>{scoreOptionsArr.map(o => <option key={o} value={o}>{o}</option>)}</select><span className={`text-base sm:text-xl font-bold ${theme.colonText}`}>:</span><select value={tScore.away} onChange={e => handleTahminmatikChange(match.id, 'away', e.target.value)} className="bg-slate-950 border border-slate-700 text-amber-400 font-black text-lg sm:text-2xl px-1 sm:px-2 py-1 rounded-lg outline-none text-center w-10 sm:w-12 appearance-none cursor-pointer" style={{textAlignLast: 'center'}}>{scoreOptionsArr.map(o => <option key={o} value={o}>{o}</option>)}</select>
                            </div>
                          </div>
                          <div className="flex flex-col items-center justify-center flex-1 gap-1.5 sm:gap-3">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20"><img src={theme.awayLogo} alt={aName} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]" /></div>
                            <span className="text-white font-extrabold text-[9px] sm:text-[12px] text-center uppercase tracking-wide drop-shadow-lg leading-tight px-1">{aName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`${theme.bottomBar} border-t px-4 py-4 w-full backdrop-blur-md z-10 relative min-h-[90px]`}>
                       <div className="flex items-center gap-2 mb-3"><span className="text-red-500 text-sm drop-shadow-md">🎯</span> <span className="text-amber-500 font-bold text-[10px] sm:text-xs tracking-widest">SKORU BİLENLER [{predictors.length} KİŞİ]</span></div>
                       <div className="flex items-center justify-center border-t border-slate-700/50 pt-3">
                           {!isComplete ? ( <span className="text-slate-500 text-[10px] sm:text-xs italic tracking-wide">Lütfen yukarıdan skoru seçin...</span> ) : predictors.length === 0 ? ( <span className="text-slate-400 text-[10px] sm:text-xs font-medium tracking-wide">Bu skoru tahmin eden yarışmacı bulunamadı.</span> ) : ( <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2"> {predictors.map((p, i) => ( <span key={i} className="bg-slate-950/80 border px-2 py-1 rounded text-[9px] sm:text-[10px] font-bold text-white shadow-sm uppercase border-slate-600/50">{p}</span> ))} </div> )}
                       </div>
                    </div>
                  </div>
                );
              }) : ( <div className="col-span-1 md:col-span-2 py-20 text-center bg-slate-900/50 border border-slate-800 rounded-2xl"><span className="text-5xl mb-4 block opacity-50">⏳</span><h2 className="text-xl font-bold text-slate-400 mb-2 tracking-widest">{selectedTahminWeek}. HAFTA TAHMİNLERİ BULUNAMADI</h2></div> )}
            </div>
          </div>
        )}

        {/* ===================== RESMİ DEKLARASYON (ARŞİV) ===================== */}
        {view === 'declaration' && (
          <div className="animate-fade-in-up w-full">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-slate-900/50 p-6 rounded-2xl border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.4)] relative z-50">
              <button onClick={() => setView('lobby')} className="flex items-center gap-2 text-slate-400 hover:text-white font-bold bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 transition-colors"><span>⬅</span> Lobiye Dön</button>
              <div className="text-center"><h2 className="text-3xl font-black text-amber-500 tracking-widest drop-shadow-[0_0_10px_rgba(245,158,11,0.4)] uppercase">RESMİ DEKLARASYON</h2></div>
              <div className="flex flex-wrap md:flex-nowrap gap-3 items-center w-full md:w-auto relative">
                <button onClick={downloadJPEG} disabled={isDownloading || !bulletinMap[selectedTahminWeek]} className="bg-emerald-600/20 border border-emerald-500/50 hover:bg-emerald-600 text-emerald-400 hover:text-white font-black px-4 py-2 rounded-lg flex items-center shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50"><span className="text-lg">📸</span> {isDownloading ? 'HAZIRLANIYOR...' : 'İNDİR'}</button>
                <div className="relative flex-1 md:min-w-[200px]">
                  <input type="text" placeholder="Yarışmacı ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} className="w-full bg-slate-950 border border-slate-700 px-4 py-2 rounded-lg text-white text-sm outline-none focus:border-amber-500" />
                  {isSearchFocused && ( <div className="absolute top-full left-0 w-full bg-slate-900 border border-slate-700 mt-1 rounded-lg shadow-2xl z-[100] max-h-48 overflow-y-auto custom-scrollbar"> {finalPlayersList.map(id => ( <div key={`drop-${id}`} className="px-4 py-2 hover:bg-slate-800 cursor-pointer text-xs font-bold text-slate-300 border-b border-slate-800/50" onClick={() => { setSearchTerm(TEST_ACCOUNTS[id].name); setIsSearchFocused(false); }}>{TEST_ACCOUNTS[id].name}</div> ))} </div> )}
                </div>
                <select value={selectedTahminWeek} onChange={(e) => setSelectedTahminWeek(Number(e.target.value))} className="bg-amber-500 text-slate-950 font-black px-4 py-2 rounded-lg outline-none cursor-pointer shadow-md">{availableWeeks.filter(w => w >= 4).map(week => ( <option key={`dec-${week}`} value={week}>{week}. HAFTA BÜLTENİ</option> ))}</select>
              </div>
            </div>

            {bulletinMap[selectedTahminWeek] ? (
              <div className="bg-[#050b14] border border-slate-800 rounded-2xl p-4 md:p-6 shadow-2xl relative z-10">
                <div className="overflow-auto custom-scrollbar max-h-[70vh] border border-slate-800/50 rounded-lg">
                  <table className="w-full text-xs text-center border-separate border-spacing-0 whitespace-nowrap">
                    <thead className="sticky top-0 z-40 bg-slate-950 shadow-md">
                      <tr>
                        <th className="sticky left-0 z-50 bg-slate-950 border-b border-r border-slate-800 p-3 min-w-[200px] text-left"><span className="text-amber-500 font-black tracking-widest">{selectedTahminWeek}. HAFTA</span></th>
                        {bulletinMap[selectedTahminWeek].map((m: any) => ( <th key={m.id} className="p-2 border-b border-r border-slate-800 bg-slate-900 text-slate-400 font-bold min-w-[50px]">{m.id}</th> ))}
                        {ghostColumns.map((_, i) => ( <th key={`g1-${i}`} className="min-w-[60px] opacity-0 border-none"></th> ))}
                      </tr>
                      <tr>
                        <th className="sticky left-0 z-50 bg-slate-950 border-b border-r border-slate-800 p-3 text-left"><span className="text-white font-black tracking-widest text-sm uppercase">OYUNCU İSMİ</span></th>
                        {bulletinMap[selectedTahminWeek].map((m: any) => {
                          const hName = cleanTeamName(m.homeTeam || m.home_team);
                          const aName = cleanTeamName(m.awayTeam || m.away_team);
                          // LOKAL LOGO TEMASI
                          const theme = getEliteTheme(m.category, hName, aName);
                          return ( <th key={`home-${m.id}`} className="p-1 border-b border-r border-slate-800 bg-slate-900/50"><div className="w-6 h-6 mx-auto flex items-center justify-center"><img src={theme.homeLogo} alt={hName} className="w-full h-full object-contain drop-shadow-md" title={hName} /></div></th> )})}
                        {ghostColumns.map((_, i) => ( <th key={`g2-${i}`} className="min-w-[60px] opacity-0 border-none"></th> ))}
                      </tr>
                      <tr>
                        <th onClick={toggleSortOrder} className="sticky left-0 z-50 bg-slate-950 border-b border-r border-slate-800 p-3 text-right cursor-pointer hover:bg-slate-900 transition-colors group"><div className="flex justify-end items-center gap-2"><span className="text-slate-500 text-[8px] uppercase group-hover:text-amber-300">Sırala: {sortOrder}</span><span className="text-amber-500 font-bold text-[9px] uppercase border border-amber-500/50 px-2 py-1 rounded bg-amber-950/30">SIRA / LİSTE</span></div></th>
                        {bulletinMap[selectedTahminWeek].map((m: any) => {
                          const hName = cleanTeamName(m.homeTeam || m.home_team);
                          const aName = cleanTeamName(m.awayTeam || m.away_team);
                          // LOKAL LOGO TEMASI
                          const theme = getEliteTheme(m.category, hName, aName);
                          return ( <th key={`away-${m.id}`} className="p-1 border-b border-r border-slate-800 bg-slate-900/50"><div className="w-6 h-6 mx-auto flex items-center justify-center"><img src={theme.awayLogo} alt={aName} className="w-full h-full object-contain drop-shadow-md" title={aName} /></div></th> )})}
                        {ghostColumns.map((_, i) => ( <th key={`g3-${i}`} className="min-w-[60px] opacity-0 border-none"></th> ))}
                      </tr>
                    </thead>
                    <tbody>
                      {finalPlayersList.map(id => {
                        const playerName = TEST_ACCOUNTS[id]?.name || "Bilinmeyen Oyuncu";
                        const selectedWeekData = livePredictionsData[selectedTahminWeek] || {};
                        const preds = selectedWeekData[id] || Array(24).fill('PAS');
                        return ( <tr key={id} className="hover:bg-slate-800/50 transition-colors group"><td className="sticky left-0 z-30 bg-slate-950 border-b border-r border-slate-800 p-3 text-left font-bold tracking-wide group-hover:bg-slate-900"><span className="text-slate-300">{playerName}</span></td>{preds.map((score: string, idx: number) => ( <td key={idx} className="border-b border-r border-slate-800 p-2 font-black bg-[#0a1120] text-amber-500">{score}</td> ))}{ghostColumns.map((_, i) => ( <td key={`gd-${i}`} className="min-w-[60px] opacity-0 border-none"></td> ))}</tr> );
                      })}
                      {finalPlayersList.length === 0 && ( <tr><td colSpan={35} className="py-8 border-b border-slate-800 text-slate-500 italic bg-[#0a1120]">Sistemde henüz kayıtlı tahmin bulunmuyor.</td></tr> )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : ( <div className="col-span-1 md:col-span-2 py-20 text-center bg-slate-900/50 border border-slate-800 rounded-2xl"><span className="text-5xl mb-4 block opacity-50">⏳</span><h2 className="text-xl font-bold text-slate-400 mb-2 tracking-widest">{selectedTahminWeek}. HAFTA TAHMİNLERİ BULUNAMADI</h2></div> )}

            <div style={{ position: 'fixed', top: 0, left: 0, zIndex: -9999, opacity: 0, pointerEvents: 'none' }}>
              <div id="jpeg-export-container" className="bg-[#050b14] p-8 inline-block w-max">
                <div className="text-center mb-6 border-b border-slate-800 pb-4"><h2 className="text-3xl font-black text-amber-500 tracking-widest uppercase">ETM LİGİ - {selectedTahminWeek}. HAFTA TAHMİNLERİ</h2></div>
                {bulletinMap[selectedTahminWeek] && (
                  <table className="w-full text-xs text-center border-separate border-spacing-0 whitespace-nowrap">
                    <thead className="bg-slate-950">
                      <tr><th className="bg-slate-950 border-b border-r border-slate-800 p-3 min-w-[200px] text-left"><span className="text-amber-500 font-black tracking-widest text-lg">YARIŞMACI / MAÇ NO</span></th>{bulletinMap[selectedTahminWeek].map((m: any) => ( <th key={`exp-m1-${m.id}`} className="p-2 border-b border-r border-slate-800 bg-slate-900 text-slate-400 font-bold min-w-[50px] text-lg">{m.id}</th> ))}</tr>
                      <tr><th className="bg-slate-950 border-b border-r border-slate-800 p-3 text-left"><span className="text-white font-black tracking-widest text-sm uppercase">EV SAHİBİ TAKIM</span></th>{bulletinMap[selectedTahminWeek].map((m: any) => ( <th key={`exp-home-${m.id}`} className="p-2 border-b border-r border-slate-800 bg-slate-900/50 text-slate-300 font-bold uppercase text-[9px] whitespace-nowrap">{cleanTeamName(m.homeTeam || m.home_team)}</th> ))}</tr>
                      <tr><th className="bg-slate-950 border-b border-r border-slate-800 p-3 text-left"><span className="text-white font-black tracking-widest text-sm uppercase">DEPLASMAN TAKIM</span></th>{bulletinMap[selectedTahminWeek].map((m: any) => ( <th key={`exp-away-${m.id}`} className="p-2 border-b border-r border-slate-800 bg-slate-900/50 text-slate-300 font-bold uppercase text-[9px] whitespace-nowrap">{cleanTeamName(m.awayTeam || m.away_team)}</th> ))}</tr>
                    </thead>
                    <tbody>
                      {activePlayersForJPEG.map(id => {
                        const playerName = TEST_ACCOUNTS[id]?.name || "Bilinmeyen Oyuncu"; const preds = (livePredictionsData[selectedTahminWeek] || {})[id]; if(!preds) return null;
                        return ( <tr key={`exp-${id}`}><td className="bg-slate-950 border-b border-r border-slate-800 p-3 text-left font-bold text-slate-300 tracking-wide">{playerName}</td>{preds.map((score: string, idx: number) => ( <td key={`exp-sc-${idx}`} className="border-b border-r border-slate-800 p-2 font-black text-amber-500 bg-[#0a1120] text-base">{score}</td> ))}</tr> );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ===================== ELİT TAHMİN GİRİŞ PORTALI (AKTİF HAFTA GİRİŞİ) ===================== */}
        {view === 'entry' && (
          <div className="w-full animate-fade-in-up">
            <div className="flex justify-between items-center mb-8 bg-slate-900/50 p-6 rounded-2xl border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <div><h2 className="text-2xl font-black text-amber-500 tracking-widest">{selectedEntryWeek}. HAFTA GÖREV KAĞIDI</h2><p className="text-slate-400 text-sm mt-1">Yarışmacı: <span className="text-white font-bold">{displayName}</span></p></div>
              <button onClick={() => { setView('lobby'); setUsername(''); setPassword(''); }} className="text-red-400 hover:text-red-300 font-bold bg-red-950/30 px-4 py-2 rounded-lg border border-red-900/50">Oturumu Kapat</button>
            </div>

            {(!bulletinMap[selectedEntryWeek] || bulletinMap[selectedEntryWeek].length === 0) ? (
               <div className="py-20 text-center bg-slate-900/50 border border-slate-800 rounded-2xl max-w-2xl mx-auto"><span className="text-5xl mb-4 block opacity-50">🛡️</span><h2 className="text-xl font-bold text-slate-400 mb-2 tracking-widest">{selectedEntryWeek}. HAFTA BÜLTENİ BEKLENİYOR</h2></div>
            ) : (
              <div className="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                {bulletinMap[selectedEntryWeek].map((match) => {
                  const hName = cleanTeamName(match.homeTeam || match.home_team);
                  const aName = cleanTeamName(match.awayTeam || match.away_team);
                  
                  // 🚀 LOKAL LOGO TEMASI
                  const theme = getEliteTheme(match.category, hName, aName);
                  
                  const hScore = predictions[match.id]?.home || '-'; const aScore = predictions[match.id]?.away || '-';

                  return (
                    <div key={match.id} className={`w-full mx-auto border rounded-xl overflow-hidden transition-all duration-300 flex flex-col relative ${theme.containerBorder} ${theme.containerShadow} ${theme.containerBg}`}>
                      {theme.bgImg && ( <><div className="absolute inset-0 z-0 opacity-100" style={{ backgroundImage: theme.bgImg, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}></div><div className="absolute inset-0 bg-slate-900/70 z-0"></div></> )}
                      <div className="relative z-10 flex flex-col h-full py-2">
                        <div className="w-full flex justify-between items-center px-4 pt-3 pb-1"><span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase bg-slate-950/50 px-3 py-1 rounded-full">{selectedEntryWeek}. HAFTA {match.id}. MAÇ</span><span className="text-[10px] font-bold text-slate-300 bg-slate-900/50 px-2 py-1 rounded">{match.date} - {match.time}</span></div>
                        <div className="w-full text-center px-2 mt-1 mb-2"><span className={`inline-block px-3 py-1.5 rounded-lg border shadow-[0_0_15px_currentColor] text-[9px] font-black uppercase tracking-widest ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>{match.category}</span></div>
                        <div className="flex items-center justify-between px-4 pb-4 mt-2">
                          <div className="flex flex-col items-center justify-center flex-1 gap-2">
                            {/* LOGO ÇEKİMİ TEMADAN GELİYOR */}
                            <div className="w-16 h-16 flex items-center justify-center relative z-20"><img src={theme.homeLogo} alt={hName} className="w-full h-full object-contain drop-shadow-lg" /></div>
                            <span className="text-white font-extrabold text-[10px] text-center uppercase drop-shadow-md">{hName}</span>
                          </div>
                          <div className="flex flex-col items-center justify-center gap-2 mx-2 w-40 z-30">
                            <div className={`w-full bg-[#080d1a]/80 border ${theme.scoreBorder} py-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
                              <select value={hScore} onChange={e => handleScoreChange(match.id, 'home', e.target.value)} className="w-12 h-10 bg-slate-950 border border-slate-700 rounded-lg font-black text-xl text-amber-400 outline-none text-center cursor-pointer">{scoreOptionsArr.map(opt => (<option key={`h-${opt}`} value={opt}>{opt}</option>))}</select><span className="text-xl font-bold text-slate-500">:</span><select value={aScore} onChange={e => handleScoreChange(match.id, 'away', e.target.value)} className="w-12 h-10 bg-slate-950 border border-slate-700 rounded-lg font-black text-xl text-amber-400 outline-none text-center cursor-pointer">{scoreOptionsArr.map(opt => (<option key={`a-${opt}`} value={opt}>{opt}</option>))}</select>
                            </div>
                          </div>
                          <div className="flex flex-col items-center justify-center flex-1 gap-2">
                            <div className="w-16 h-16 flex items-center justify-center relative z-20"><img src={theme.awayLogo} alt={aName} className="w-full h-full object-contain drop-shadow-lg" /></div>
                            <span className="text-white font-extrabold text-[10px] text-center uppercase drop-shadow-md">{aName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {bulletinMap[selectedEntryWeek] && bulletinMap[selectedEntryWeek].length > 0 && (
              <div className="mt-12 flex flex-col md:flex-row justify-center items-center gap-4 sticky bottom-6 z-50">
                <button onClick={handleTahminMatikRastgele} className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm md:text-lg px-6 py-4 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.5)] flex items-center gap-2">🎲 RASTGELE DOLDUR</button>
                <button onClick={savePredictions} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 text-white font-black text-sm md:text-lg px-6 py-4 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.5)]">{isSaving ? 'ŞİFRELENİYOR...' : '🚀 TAHMİNLERİMİ MÜHÜRLE'}</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}