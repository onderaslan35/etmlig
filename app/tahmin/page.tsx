'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/utils/supabase';

// ----------------------------------------------------
// TEMA VE LOGO MOTORU 
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

const isTffMatchCheck = (category: string) => {
  const uppercaseCat = category?.toUpperCase() || '';
  return ["TÜRKİYE 1.LİG", "TÜRKİYE KADINLAR SÜPER LİG", "TÜRKİYE KUPASI", "TÜRKİYE SÜPER KUPA", "TÜRKİYE SÜPER LİG", "TFF 1. LİG"].some(cat => uppercaseCat.includes(cat));
};

const getEliteTheme = (category: string) => {
  const upCat = category?.toUpperCase() || '';
  if (upCat.includes("ŞAMPİYONLAR LİGİ") || upCat.includes("Ş.L.")) {
    return { bgImg: "url('/cl-bg.png')", containerBorder: "border-indigo-500/50", containerShadow: "shadow-[0_0_40px_rgba(79,70,229,0.4)]", containerBg: "bg-[#050b14]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-indigo-300", badgeBorder: "border-indigo-400/80 shadow-[0_0_10px_currentColor]", scoreBorder: "border-white/30" };
  } else if (upCat.includes("AVRUPA LİGİ") || upCat.includes("A.L.")) {
    return { bgImg: "url('/el-bg.png')", containerBorder: "border-orange-500/50", containerShadow: "shadow-[0_0_40px_rgba(249,115,22,0.4)]", containerBg: "bg-[#140805]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-orange-400", badgeBorder: "border-orange-500/80 shadow-[0_0_10px_currentColor]", scoreBorder: "border-orange-600/40" };
  } else if (upCat.includes("KONFERANS LİGİ") || upCat.includes("K.L.")) {
    return { bgImg: "url('/uecl-bg.png')", containerBorder: "border-emerald-500/50", containerShadow: "shadow-[0_0_40px_rgba(16,185,129,0.4)]", containerBg: "bg-[#05140b]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-emerald-400", badgeBorder: "border-emerald-500/80 shadow-[0_0_10px_currentColor]", scoreBorder: "border-emerald-600/40" };
  } else if (isTffMatchCheck(upCat)) {
    return { bgImg: "url('/tff-bg.png')", containerBorder: "border-red-500/50", containerShadow: "shadow-[0_0_40px_rgba(239,68,68,0.4)]", containerBg: "bg-[#140505]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-red-400", badgeBorder: "border-red-500/80 shadow-[0_0_10px_currentColor]", scoreBorder: "border-red-600/40" };
  }
  return { bgImg: null, containerBorder: "border-blue-500/30", containerShadow: "shadow-[0_0_30px_rgba(30,58,138,0.5)]", containerBg: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/60 via-[#0a1120] to-[#050b14]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-cyan-400", badgeBorder: "border-cyan-500/80 shadow-[0_0_10px_currentColor]", scoreBorder: "border-blue-600/40" };
};

// 🔴 58 YARIŞMACI + MANKOMAN + ADAM KRAL 🔴
const TEST_ACCOUNTS: Record<string, { pass: string, name: string }> = {
  "mankoman": { pass: "123456", name: "MANKOMAN (ADMİN)" },
  "353535": { pass: "19250", name: "ADAM KRAL" },
  "262740": { pass: "49400", name: "ABDULLAH DİK" },
  "262705": { pass: "14050", name: "AHMET BİRCAN 🏆" },
  "351925": { pass: "19250", name: "ALİOS GÖZTEPE" },
  "262735": { pass: "19250", name: "AYGÜN AKKEÇELİ" },
  "262723": { pass: "32230", name: "AYHAN LUŞOĞLU" },
  "262749": { pass: "58490", name: "B.VEYSELOĞLU EROL" },
  "262708": { pass: "17080", name: "BAYRAM YILMAZ" },
  "262718": { pass: "27180", name: "BEKİR KARADAĞ" },
  "262716": { pass: "25160", name: "BİROL DEMİREL" },
  "262772": { pass: "81720", name: "CEMAL SİVRİKAYA 🏆" },
  "262703": { pass: "12030", name: "CEMALETTİN BELLİ" },
  "262790": { pass: "99880", name: "CUMALİ SÖKER" },
  "350909": { pass: "19070", name: "DİNÇER ÖZER" },
  "262755": { pass: "64550", name: "DOĞAÇ ALKAN" },
  "262756": { pass: "65560", name: "EYÜP KARACAOĞLU" },
  "262731": { pass: "40310", name: "FATİH AYAN" },
  "262706": { pass: "15060", name: "GAZİ AYAN 🏆🏆" },
  "262707": { pass: "16070", name: "HAKAN AYAN" },
  "262726": { pass: "35260", name: "HUDAVER TOPARDIC" },
  "262762": { pass: "71620", name: "İLHAN DANIŞ" },
  "262725": { pass: "34250", name: "İLYAS KAZDAL" },
  "262744": { pass: "53440", name: "İLYAS UYGUN" },
  "262714": { pass: "23140", name: "İSMAİL EKER 🏆" },
  "262813": { pass: "28620", name: "KEMAL ERSOY" },
  "262734": { pass: "43340", name: "LEVENT YILDIRIM" },
  "262750": { pass: "59500", name: "MAHMUT CBR" },
  "262736": { pass: "45360", name: "MEHMET ALİ KARA" },
  "262758": { pass: "67580", name: "MELİH PINAR" },
  "262738": { pass: "47380", name: "MEVLÜT EVLER" },
  "262701": { pass: "10010", name: "MUHAMMET OKUMUŞ" },
  "262733": { pass: "42330", name: "MUHSİN ASİLKAN" },
  "262717": { pass: "26170", name: "MURAT ALİ" },
  "262712": { pass: "21120", name: "MURAT AYDEMİR" },
  "262702": { pass: "11020", name: "MURAT KARA" },
  "262763": { pass: "72630", name: "MUSTAFA ELMAS" },
  "262721": { pass: "30210", name: "MUSTAFA GÜMÜŞÇÜ" },
  "262787": { pass: "96870", name: "MUSTAFA TUCİ" },
  "262745": { pass: "54450", name: "OĞUZ YILDIRIMKAYA" },
  "262754": { pass: "63540", name: "OSMAN ALİ AYDIN 🏆" },
  "262770": { pass: "79700", name: "OZKAYA MAZAKALI BAYRAM" },
  "262728": { pass: "35280", name: "ÖNDER ASLAN" },
  "262730": { pass: "39300", name: "ÖNDER IŞIK" },
  "262732": { pass: "41320", name: "R. İLHAN KARACA 🏆🏆" },
  "262711": { pass: "20110", name: "RIDVAN DOGER" },
  "262741": { pass: "50410", name: "SABAHATTİN ÇAYLAK" },
  "262709": { pass: "18090", name: "SALİH KARACAOĞLU" },
  "262747": { pass: "56470", name: "SAVAŞ ÇAĞLAYAN" },
  "262786": { pass: "95860", name: "SEDAT DİŞLİ" },
  "262816": { pass: "61820", name: "SEDAT SEDAT" },
  "262737": { pass: "46370", name: "ŞAHİN GEZGİNCİ" },
  "262715": { pass: "24150", name: "ŞEMSETTIN DÜGER" },
  "262774": { pass: "83740", name: "ŞENOL CAN ÇAKICI" },
  "262739": { pass: "48390", name: "UĞUR GÜRBÜZ" },
  "262719": { pass: "28190", name: "UĞUR VARDAR" },
  "262771": { pass: "80710", name: "ULAŞ ADIGÜZEL" },
  "262704": { pass: "13040", name: "YAPAY ZEKA" },
  "262782": { pass: "91820", name: "YUSUF ERBAY" },
  "262753": { pass: "62530", name: "YUSUF KIZILTUĞ" }
};

const week4Matches = [
  { id: 1, weekLabel: "4. Hafta - 1. MAÇ", homeTeam: "STURM GRAZ", awayTeam: "FENERBAHÇE", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR RÖVANŞ MAÇI", date: "11.08.2026", time: "21:30" },
  { id: 2, weekLabel: "4. Hafta - 2. MAÇ", homeTeam: "PARIS SG", awayTeam: "ASTON VILLA", category: "UEFA SÜPER KUPA", date: "12.08.2026", time: "22:00" },
  { id: 3, weekLabel: "4. Hafta - 3. MAÇ", homeTeam: "KARABAĞ FK", awayTeam: "DINAMO KIEV", category: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR RÖVANŞ", date: "13.08.2026", time: "19:00" },
  { id: 4, weekLabel: "4. Hafta - 4. MAÇ", homeTeam: "BEŞİKTAŞ", awayTeam: "HRADEC KRALOVE", category: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR RÖVANŞ", date: "13.08.2026", time: "20:00" },
  { id: 5, weekLabel: "4. Hafta - 5. MAÇ", homeTeam: "GALATASARAY", awayTeam: "ÇORUM FK", category: "TÜRKİYE SÜPER LİG", date: "14.08.2026", time: "21:30" },
  { id: 6, weekLabel: "4. Hafta - 6. MAÇ", homeTeam: "EROKSPOR", awayTeam: "SARIYER", category: "TÜRKİYE 1.LİG", date: "14.08.2026", time: "21:30" },
  { id: 7, weekLabel: "4. Hafta - 7. MAÇ", homeTeam: "KASIMPAŞA", awayTeam: "TRABZONSPOR", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "19:00" },
  { id: 8, weekLabel: "4. Hafta - 8. MAÇ", homeTeam: "KONYASPOR", awayTeam: "ÇAYKUR RİZE", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "19:00" },
  { id: 9, weekLabel: "4. Hafta - 9. MAÇ", homeTeam: "FATİH KARAGÜMRÜK", awayTeam: "ÜMRANİYESPOR", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "19:00" },
  { id: 10, weekLabel: "4. Hafta - 10. MAÇ", homeTeam: "İSTANBULSPOR", awayTeam: "BODRUMSPOR", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "19:00" },
  { id: 11, weekLabel: "4. Hafta - 11. MAÇ", homeTeam: "GAZİANTEP FK", awayTeam: "ALANYASPOR", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "21:30" },
  { id: 12, weekLabel: "4. Hafta - 12. MAÇ", homeTeam: "GENÇLERBİRLİĞİ", awayTeam: "FENERBAHÇE", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "21:30" },
  { id: 13, weekLabel: "4. Hafta - 13. MAÇ", homeTeam: "BURSASPOR", awayTeam: "IĞDIR FK", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "21:30" },
  { id: 14, weekLabel: "4. Hafta - 14. MAÇ", homeTeam: "MANİSA FK", awayTeam: "VANSPOR FK", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "21:30" },
  { id: 15, weekLabel: "4. Hafta - 15. MAÇ", homeTeam: "ARSENAL", awayTeam: "MANCHESTER CITY", category: "İNGİLTERE SÜPER KUPA", date: "16.08.2026", time: "17:00" },
  { id: 16, weekLabel: "4. Hafta - 16. MAÇ", homeTeam: "BAŞAKŞEHİR", awayTeam: "KOCAELİSPOR", category: "TÜRKİYE SÜPER LİG", date: "16.08.2026", time: "19:00" },
  { id: 17, weekLabel: "4. Hafta - 17. MAÇ", homeTeam: "KAYSERİSPOR", awayTeam: "SİVASSPOR", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "19:00" },
  { id: 18, weekLabel: "4. Hafta - 18. MAÇ", homeTeam: "AMED SPOR", awayTeam: "ERZURUMSPOR", category: "TÜRKİYE SÜPER LİG", date: "16.08.2026", time: "21:30" },
  { id: 19, weekLabel: "4. Hafta - 19. MAÇ", homeTeam: "BEŞİKTAŞ", awayTeam: "EYÜPSPOR", category: "TÜRKİYE SÜPER LİG", date: "16.08.2026", time: "21:30" },
  { id: 20, weekLabel: "4. Hafta - 20. MAÇ", homeTeam: "KEÇİÖRENGÜCÜ", awayTeam: "PENDİKSPOR", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "19:00" },
  { id: 21, weekLabel: "4. Hafta - 21. MAÇ", homeTeam: "MARDİN 1969", awayTeam: "ANTALYASPOR", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "21:30" },
  { id: 22, weekLabel: "4. Hafta - 22. MAÇ", homeTeam: "MUĞLASPOR", awayTeam: "BANDIRMASPOR", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "21:30" },
  { id: 23, weekLabel: "4. Hafta - 23. MAÇ", homeTeam: "SAMSUNSPOR", awayTeam: "GÖZTEPE", category: "TÜRKİYE SÜPER KUPA", date: "17.08.2026", time: "21:30" },
  { id: 24, weekLabel: "4. Hafta - 24. MAÇ", homeTeam: "BATMAN PETROL SPOR", awayTeam: "BOLUSPOR", category: "TÜRKİYE 1.LİG", date: "17.08.2026", time: "21:30" }
];

const week4PredictionsData: Record<string, string[]> = {
  "262731": ["1-1", "3-1", "1-1", "2-0", "3-0", "2-2", "1-3", "1-1", "2-1", "1-2", "1-0", "1-3", "2-1", "1-2", "2-2", "2-1", "2-1", "1-1", "3-1", "1-1", "1-1", "1-1", "1-1", "2-1"], "262758": ["1-2", "3-0", "2-0", "3-0", "4-1", "1-1", "1-3", "1-1", "1-1", "0-2", "2-1", "0-3", "3-0", "1-1", "2-1", "2-1", "3-0", "3-0", "3-0", "1-1", "0-3", "1-1", "1-2", "3-0"], "262763": ["1-1", "1-1", "1-1", "2-0", "4-0", "1-1", "0-2", "1-0", "1-0", "1-1", "1-1", "1-1", "1-1", "2-0", "1-1", "1-1", "1-1", "1-0", "3-0", "1-1", "1-1", "1-1", "1-1", "1-0"], "262744": ["1-2", "3-1", "1-1", "2-0", "4-0", "2-0", "1-2", "1-1", "1-0", "0-0", "2-2", "0-4", "2-0", "2-0", "1-2", "2-1", "0-1", "0-2", "2-0", "0-1", "0-2", "0-2", "1-1", "0-1"], "262813": ["1-2", "4-1", "1-0", "3-2", "2-0", "2-0", "1-3", "1-1", "3-0", "2-2", "1-2", "0-4", "1-1", "2-2", "2-0", "1-0", "2-0", "1-2", "2-0", "1-2", "1-3", "0-0", "0-1", "1-2"], "351925": ["0-2", "0-0", "2-1", "1-0", "3-0", "0-0", "0-2", "0-0", "0-0", "0-0", "0-0", "0-3", "2-1", "0-0", "2-0", "2-1", "0-0", "0-2", "2-0", "0-0", "0-2", "0-0", "0-2", "0-0"], "262732": ["2-1", "2-1", "1-0", "1-1", "2-0", "3-1", "2-2", "2-1", "2-0", "1-1", "1-1", "0-3", "2-0", "1-1", "2-1", "0-1", "1-1", "1-1", "2-1", "1-2", "0-2", "0-2", "2-1", "1-0"], "262754": ["1-1", "1-0", "1-0", "2-0", "3-0", "1-0", "0-2", "1-0", "1-0", "0-2", "1-0", "0-3", "2-0", "1-0", "1-2", "1-0", "1-0", "1-1", "2-0", "1-0", "0-1", "0-1", "1-0", "1-0"], "262733": ["2-1", "3-1", "0-0", "3-0", "2-0", "0-1", "1-4", "2-0", "0-0", "1-0", "1-1", "0-3", "2-0", "2-1", "2-1", "2-0", "1-1", "1-0", "3-0", "1-1", "0-1", "1-1", "3-1", "1-0"], "262774": ["0-1", "2-0", "1-0", "2-0", "3-1", "1-1", "0-2", "1-1", "1-2", "1-2", "1-1", "0-2", "1-0", "0-0", "2-0", "0-0", "1-2", "2-1", "2-0", "1-1", "0-2", "0-0", "3-1", "0-2"], "262771": ["2-2", "3-1", "2-1", "4-0", "5-0", "1-1", "1-3", "1-1", "2-2", "1-1", "2-1", "1-4", "3-1", "3-0", "2-1", "1-0", "1-1", "3-1", "3-1", "1-3", "1-1", "1-1", "1-1", "2-1"], "262730": ["0-3", "3-0", "1-0", "3-1", "2-0", "1-1", "0-2", "0-1", "0-0", "0-1", "0-2", "0-3", "2-0", "2-1", "0-2", "2-0", "1-1", "1-2", "3-0", "0-1", "0-2", "0-0", "1-1", "2-1"], "262707": ["0-4", "3-0", "2-1", "1-1", "1-0", "0-0", "0-2", "0-0", "2-1", "0-2", "0-0", "0-4", "1-0", "0-0", "0-0", "0-0", "0-0", "0-0", "2-0", "1-0", "0-2", "0-0", "0-0", "0-2"], "262816": ["0-1", "3-1", "0-2", "1-0", "2-0", "0-0", "0-3", "1-1", "3-0", "0-2", "0-0", "0-2", "3-0", "0-2", "2-0", "1-1", "2-1", "1-3", "3-0", "0-0", "0-2", "0-3", "2-0", "0-1"], "262719": ["2-1", "2-1", "2-0", "2-1", "3-0", "2-1", "0-2", "3-1", "2-1", "1-1", "1-2", "0-2", "3-0", "2-1", "2-1", "1-1", "1-2", "2-1", "3-0", "2-1", "1-1", "2-1", "1-2", "2-0"], "262725": ["0-2", "2-0", "1-1", "3-0", "3-0", "1-0", "0-2", "1-1", "2-0", "2-1", "2-1", "0-2", "2-0", "0-0", "1-1", "1-0", "2-0", "1-0", "2-0", "0-1", "0-2", "1-0", "1-0", "0-1"], "262711": ["0-1", "3-1", "1-0", "3-0", "3-0", "2-1", "0-4", "0-0", "1-1", "1-3", "1-1", "1-2", "2-2", "1-0", "1-1", "2-1", "0-0", "2-1", "3-0", "0-0", "1-1", "1-2", "2-2", "2-0"], "262718": ["1-2", "4-1", "3-1", "3-0", "4-1", "1-1", "1-3", "2-2", "2-1", "1-1", "1-2", "1-3", "2-0", "2-1", "2-2", "2-1", "2-2", "1-1", "3-1", "2-2", "1-2", "1-3", "2-2", "1-2"], "262721": ["0-1", "2-0", "1-0", "3-1", "2-1", "0-2", "0-3", "2-1", "2-0", "1-2", "1-1", "0-3", "3-1", "1-1", "0-1", "0-2", "0-1", "0-2", "2-0", "0-2", "0-3", "0-1", "2-2", "0-1"], "262726": ["1-3", "2-2", "2-2", "3-0", "4-0", "1-1", "1-2", "2-1", "1-1", "1-1", "1-2", "0-3", "1-1", "2-1", "0-2", "0-2", "2-0", "1-1", "2-0", "3-1", "2-2", "0-2", "1-0", "2-1"], "262702": ["0-2", "1-0", "1-1", "3-1", "2-0", "1-0", "0-2", "0-1", "0-0", "0-1", "1-0", "0-3", "2-0", "1-0", "0-1", "1-0", "1-0", "2-0", "3-0", "1-1", "0-0", "0-1", "0-0", "2-0"], "262738": ["1-1", "2-1", "1-1", "1-0", "3-0", "2-1", "1-3", "2-1", "2-1", "1-1", "2-1", "1-3", "2-0", "1-1", "2-2", "2-1", "2-1", "1-1", "2-0", "2-1", "1-1", "1-1", "2-1", "1-1"], "262750": ["1-1", "3-1", "2-2", "3-1", "3-0", "1-1", "1-3", "2-1", "0-0", "1-2", "2-2", "0-3", "3-1", "2-0", "2-2", "0-0", "1-1", "0-2", "3-1", "0-2", "0-3", "1-2", "1-3", "2-0"], "262705": ["1-3", "3-1", "2-1", "3-1", "3-1", "3-0", "1-3", "1-2", "3-1", "1-2", "1-2", "0-3", "2-0", "3-0", "2-1", "2-1", "2-0", "2-0", "4-0", "3-1", "0-1", "0-2", "1-2", "1-1"], "262706": ["0-2", "4-1", "1-0", "3-0", "2-0", "0-2", "0-2", "0-0", "0-0", "0-1", "0-0", "0-2", "0-2", "0-0", "0-1", "0-0", "0-0", "0-1", "2-0", "2-1", "0-2", "0-2", "0-0", "2-0"], "262716": ["1-1", "3-2", "1-0", "3-1", "3-0", "3-1", "0-3", "0-0", "3-1", "0-2", "1-1", "0-4", "2-0", "3-1", "1-1", "3-0", "2-1", "1-1", "4-0", "2-1", "0-2", "0-2", "1-1", "1-2"], "262736": ["1-2", "2-1", "1-2", "3-0", "4-0", "2-1", "2-4", "3-1", "2-2", "2-2", "3-2", "1-1", "3-1", "3-0", "1-1", "4-1", "2-1", "2-1", "1-0", "2-1", "1-1", "1-1", "1-1", "3-0"], "262714": ["1-3", "2-0", "0-2", "0-0", "2-0", "0-1", "1-1", "0-0", "2-0", "0-1", "2-0", "0-3", "1-1", "0-1", "1-1", "0-0", "0-0", "1-0", "1-0", "0-0", "1-0", "1-1", "0-1", "0-1"], "262749": ["2-1", "3-1", "2-0", "3-0", "3-1", "2-2", "1-2", "2-1", "2-0", "2-0", "2-2", "1-3", "2-1", "2-1", "2-1", "1-1", "2-1", "1-1", "2-1", "2-1", "0-2", "1-2", "2-2", "1-1"], "262753": ["1-1", "2-1", "2-0", "3-0", "1-1", "1-0", "3-2", "1-1", "1-0", "2-2", "2-2", "0-3", "2-0", "1-2", "1-1", "1-1", "1-1", "0-1", "2-0", "1-1", "1-2", "1-1", "0-2", "1-1"], "262740": ["1-2", "1-1", "2-1", "2-0", "3-0", "1-2", "1-3", "1-1", "2-2", "1-1", "2-1", "1-3", "3-0", "1-1", "2-2", "2-1", "1-1", "1-2", "3-1", "2-1", "1-2", "2-1", "2-2", "1-1"], "262790": ["0-2", "3-1", "0-2", "0-2", "4-0", "0-2", "0-3", "3-1", "1-1", "2-0", "1-1", "0-3", "3-1", "2-1", "0-3", "2-1", "1-1", "2-0", "2-1", "1-0", "2-1", "1-1", "0-2", "0-2"], "262786": ["1-2", "3-1", "3-1", "3-0", "2-1", "1-1", "1-2", "1-1", "1-2", "2-0", "2-1", "1-1", "3-1", "2-0", "1-1", "1-2", "1-1", "1-1", "3-1", "2-1", "2-0", "1-2", "1-2", "1-1"], "262734": ["3-0", "4-1", "2-1", "3-1", "4-1", "2-1", "1-2", "3-2", "2-1", "3-2", "3-1", "2-1", "3-0", "2-3", "1-2", "3-1", "2-1", "3-2", "4-1", "3-1", "2-1", "3-1", "2-1", "3-1"], "262756": ["2-2", "3-2", "2-0", "4-2", "1-2", "1-2", "1-3", "1-2", "0-0", "0-0", "2-1", "1-3", "2-2", "1-2", "1-2", "1-2", "0-0", "0-0", "2-0", "0-0", "2-2", "0-1", "1-1", "1-3"], "262703": ["2-2", "1-1", "1-1", "2-1", "1-0", "1-1", "1-3", "2-2", "0-1", "0-0", "1-1", "0-2", "0-0", "0-0", "2-2", "1-1", "1-1", "0-0", "2-1", "1-1", "0-1", "1-1", "2-2", "0-0"], "262772": ["0-2", "2-0", "1-1", "1-1", "1-0", "0-0", "0-1", "0-0", "1-0", "1-2", "2-3", "0-3", "2-0", "1-1", "1-1", "1-0", "0-1", "1-0", "2-1", "1-1", "0-0", "0-1", "0-0", "0-1"], "262717": ["1-2", "0-1", "1-1", "2-2", "2-2", "2-0", "0-2", "1-2", "0-0", "0-2", "0-1", "0-2", "2-0", "1-2", "1-1", "1-0", "1-2", "0-0", "2-1", "1-0", "1-1", "3-2", "1-2", "0-0"], "262728": ["0-0", "0-0", "1-0", "2-1", "4-1", "0-1", "0-2", "1-1", "0-1", "0-0", "1-0", "0-5", "4-0", "2-0", "2-3", "1-2", "0-0", "0-0", "3-0", "0-0", "0-2", "0-1", "0-2", "0-0"], "262770": ["3-1", "3-1", "2-2", "2-0", "2-1", "1-1", "1-3", "0-2", "2-0", "0-3", "0-1", "0-4", "2-1", "1-1", "2-1", "2-0", "1-1", "1-0", "3-0", "2-3", "0-2", "1-2", "0-2", "3-1"], "262755": ["1-2", "4-1", "3-2", "2-1", "3-2", "1-1", "3-3", "2-1", "1-0", "0-1", "1-1", "0-2", "1-1", "3-0", "1-2", "4-2", "3-1", "2-2", "1-0", "2-2", "1-0", "3-2", "1-0", "3-1"], "262704": ["1-1", "2-1", "1-1", "2-0", "3-0", "0-1", "1-2", "2-1", "1-0", "0-1", "1-1", "1-3", "1-0", "2-0", "2-1", "2-0", "1-1", "1-1", "2-1", "1-1", "1-2", "0-2", "2-1", "1-1"], "262747": ["1-1", "2-0", "1-0", "2-0", "2-0", "1-1", "1-2", "1-1", "1-1", "1-1", "1-1", "1-3", "1-1", "1-1", "1-1", "1-1", "1-1", "1-1", "2-0", "1-1", "1-1", "1-1", "1-1", "1-1"], "262723": ["1-1", "3-1", "2-1", "2-0", "3-0", "1-2", "1-2", "2-1", "2-0", "1-2", "1-1", "2-1", "3-1", "3-0", "2-1", "1-1", "2-1", "1-1", "2-1", "1-1", "0-2", "0-2", "1-1", "2-0"], "262709": ["1-1", "2-1", "2-1", "2-0", "3-0", "1-1", "1-2", "1-1", "1-0", "1-0", "2-1", "0-2", "2-1", "2-0", "1-1", "1-0", "1-1", "2-1", "2-1", "1-1", "0-3", "0-2", "1-2", "1-0"],
  "262782": ["0-2", "0-0", "0-1", "1-0", "1-0", "0-0", "0-4", "1-0", "0-1", "0-0", "0-1", "0-3", "0-0", "0-0", "0-1", "0-0", "0-0", "0-0", "3-1", "0-0", "0-1", "0-0", "0-0", "0-0"],
  "262739": ["1-0", "3-1", "1-1", "3-0", "3-1", "0-1", "1-2", "3-1", "2-0", "2-0", "2-1", "1-2", "3-0", "2-0", "2-1", "3-2", "1-0", "1-0", "2-0", "1-1", "0-1", "1-1", "1-2", "1-0"]
};

// 🔴 TÜRKÇE KARAKTER ZEKA MOTORU 🔴
const normalizeTurkish = (text: string) => {
  if (!text) return '';
  return text.replace(/İ/g, 'i')
             .replace(/I/g, 'ı')
             .replace(/Ş/g, 'ş')
             .replace(/Ğ/g, 'ğ')
             .replace(/Ü/g, 'ü')
             .replace(/Ö/g, 'ö')
             .replace(/Ç/g, 'ç')
             .toLowerCase()
             .trim();
};

export default function TahminlerPortal() {
  const [view, setView] = useState<'lobby' | 'declaration' | 'entry' | 'tahminmatik'>('lobby');
  
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isTimeUp, setIsTimeUp] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(''); 
  const [loginError, setLoginError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sortOrder, setSortOrder] = useState<'A-Z' | 'Z-A' | 'ZAMAN'>('A-Z'); 

  const [bulletin, setBulletin] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<Record<number, { home: string, away: string }>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  const [isDownloading, setIsDownloading] = useState(false);

  const [tahminmatikScores, setTahminmatikScores] = useState<Record<number, { home: string, away: string }>>({});
  // 🔴 TAHMİNMATİK VE ARŞİV 4. HAFTAYA MÜHÜRLENDİ (5, 6, 7 görünmez) 🔴
  const [selectedTahminWeek, setSelectedTahminWeek] = useState<number>(4);

  useEffect(() => {
    const targetDate = new Date('2026-08-17T21:00:00+03:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setIsTimeUp(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setIsTimeUp(false);
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const userKey = username.trim();
    const passKey = password.trim(); 
    
    const account = TEST_ACCOUNTS[userKey];

    if (account && passKey === account.pass) { 
      setDisplayName(account.name);
      await fetchBulletinAndPredictions(userKey);
      setView('entry');
    } else {
      setLoginError('Sistem şu an yapılandırma ve test aşamasındadır. Yalnızca kayıtlı yetkili girişine izin verilmektedir.');
    }
  };

  const fetchBulletinAndPredictions = async (currentUsername: string) => {
    const { data: bData } = await supabase.from('matches_bulletin').select('*').eq('week_num', 5).order('match_index', { ascending: true });
    const { data: pData } = await supabase.from('player_predictions').select('*').eq('week_num', 5).eq('user_id', currentUsername);

    if (bData) {
      setBulletin(bData);
      const initialPreds: Record<number, { home: string, away: string }> = {};
      
      bData.forEach(m => {
        const existingPred = pData?.find(p => p.match_index === m.match_index);
        if (existingPred && existingPred.predicted_score) {
          const [h, a] = existingPred.predicted_score.split('-');
          initialPreds[m.match_index] = { home: h || '-', away: a || '-' };
        } else {
          initialPreds[m.match_index] = { home: '-', away: '-' };
        }
      });
      
      setPredictions(initialPreds);
    }
  };

  const handleScoreChange = (matchIndex: number, team: 'home' | 'away', score: string) => {
    setPredictions(prev => ({
      ...prev,
      [matchIndex]: { ...prev[matchIndex], [team]: score }
    }));
  };

  const handleTahminmatikChange = (matchId: number, type: 'home' | 'away', val: string) => {
    setTahminmatikScores(prev => ({
      ...prev,
      [matchId]: { ...(prev[matchId] || { home: '-', away: '-' }), [type]: val }
    }));
  };

  const handleTahminMatikRastgele = () => {
    const newPreds = { ...predictions };
    Object.keys(newPreds).forEach(matchIndex => {
      if (newPreds[Number(matchIndex)].home === '-' || newPreds[Number(matchIndex)].away === '-') {
        const randomHome = Math.floor(Math.random() * 4).toString();
        const randomAway = Math.floor(Math.random() * 4).toString();
        newPreds[Number(matchIndex)] = { home: randomHome, away: randomAway };
      }
    });
    setPredictions(newPreds);
  };

  const savePredictions = async () => {
    const missing = Object.values(predictions).some(p => p.home === '-' || p.away === '-');
    if (missing) {
      alert('Lütfen tüm maçların skorlarını doldurun veya RASTGELE DOLDUR kullanın!');
      return;
    }

    setIsSaving(true);

    try {
      const payload = Object.keys(predictions).map(matchIndex => ({
        user_id: username.trim(), 
        week_num: 5,
        match_index: Number(matchIndex),
        predicted_score: `${predictions[Number(matchIndex)].home}-${predictions[Number(matchIndex)].away}`
      }));

      const { error } = await supabase.from('player_predictions').upsert(payload, { onConflict: 'user_id,week_num,match_index' });
      
      if(error) throw error;

      setShowSuccessModal(true);

    } catch (e) {
      alert('❌ Kayıt sırasında bir hata oluştu!');
    }
    setIsSaving(false);
  };

  const scoreOptionsArr = ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];

  const toggleSortOrder = () => {
    if (sortOrder === 'A-Z') setSortOrder('Z-A');
    else if (sortOrder === 'Z-A') setSortOrder('ZAMAN');
    else setSortOrder('A-Z');
  };

  const finalPlayersList = useMemo(() => {
    let allIds = Object.keys(TEST_ACCOUNTS).filter(id => id !== 'mankoman');

    if (searchTerm) {
      const normalizedSearch = normalizeTurkish(searchTerm);
      allIds = allIds.filter(id => {
        const pName = normalizeTurkish(TEST_ACCOUNTS[id]?.name || "");
        return pName.includes(normalizedSearch);
      });
    }

    const submittedIds = allIds.filter(id => week4PredictionsData[id]);
    const missingIds = allIds.filter(id => !week4PredictionsData[id]);

    if (sortOrder === 'A-Z') {
      submittedIds.sort((a, b) => TEST_ACCOUNTS[a].name.localeCompare(TEST_ACCOUNTS[b].name, 'tr'));
    } else if (sortOrder === 'Z-A') {
      submittedIds.sort((a, b) => TEST_ACCOUNTS[b].name.localeCompare(TEST_ACCOUNTS[a].name, 'tr'));
    }
    
    missingIds.sort((a, b) => TEST_ACCOUNTS[a].name.localeCompare(TEST_ACCOUNTS[b].name, 'tr'));

    return [...submittedIds, ...missingIds];
  }, [searchTerm, sortOrder]);

  const ghostColumns = Array.from({ length: 10 });

  const downloadJPEG = async () => {
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); 
      const htmlToImage = await import('html-to-image');
      const element = document.getElementById('jpeg-export-container');
      if (!element) throw new Error("Stüdyo elementi bulunamadı");

      const dataUrl = await htmlToImage.toJpeg(element, { 
        quality: 0.95, 
        backgroundColor: '#050b14',
        pixelRatio: 1.5 
      });

      const link = document.createElement("a");
      link.download = "ETM_Lig_4_Hafta_Tahminler.jpg";
      link.href = dataUrl;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error: any) {
      console.error("Fotoğraf oluşturulamadı:", error);
      alert("HATA: Fotoğraf motoru bir engele takıldı. Detay: " + error.message);
    }
    setIsDownloading(false);
  };

  const activePlayersForJPEG = useMemo(() => {
    return Object.keys(TEST_ACCOUNTS)
      .filter(id => id !== 'mankoman' && week4PredictionsData[id])
      .sort((a, b) => TEST_ACCOUNTS[a].name.localeCompare(TEST_ACCOUNTS[b].name, 'tr'));
  }, []);

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 p-4 font-sans pb-24 transition-opacity duration-500">
      
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050b14]/90 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(16,185,129,0.3)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
            <div className="text-6xl mb-6 mt-2 drop-shadow-lg">🏆</div>
            <h3 className="text-3xl font-black text-emerald-400 mb-3 tracking-widest">TEBRİKLER!</h3>
            <p className="text-slate-300 font-medium mb-8 text-sm leading-relaxed">
              Tahminleriniz sisteme kaydedilmiştir. Başarılar dileriz. Süre bitene kadar sisteme tekrar girerek skorlarınızı güncelleyebilirsiniz.
            </p>
            <button 
              onClick={() => { 
                setShowSuccessModal(false); 
                setView('lobby'); 
                setUsername(''); 
                setPassword(''); 
              }} 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] uppercase tracking-widest transition-all hover:scale-105"
            >
              TAMAM
            </button>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto pt-10">
        
        {view === 'lobby' && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-black text-amber-500 tracking-widest drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                ETM LİGİ MERKEZ PORTALI
              </h1>
              <p className="text-slate-400 mt-4 text-lg font-medium">Lütfen yapmak istediğiniz işlemi seçin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
              
              <div 
                onClick={() => setView('declaration')}
                className="bg-slate-900/50 border-2 border-indigo-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-900/20 hover:border-indigo-500 transition-all duration-300 group shadow-[0_0_30px_rgba(79,70,229,0.1)] hover:shadow-[0_0_40px_rgba(79,70,229,0.4)]"
              >
                <div className="w-20 h-20 bg-indigo-950 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-4xl">📜</span>
                </div>
                <h2 className="text-xl font-black text-indigo-400 tracking-widest mb-3">RESMİ DEKLARASYON</h2>
                <p className="text-slate-400 text-xs">Geçmiş haftaların tahmin arşivini ve resmi oyuncu listelerini inceleyin.</p>
                <div className="mt-8 px-6 py-2 bg-indigo-600/20 text-indigo-300 border border-indigo-500/50 rounded-full font-bold text-xs uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  Arşive Giriş Yap
                </div>
              </div>

              <div 
                onClick={() => setView('tahminmatik')}
                className="bg-slate-900/50 border-2 border-emerald-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-emerald-900/20 hover:border-emerald-500 transition-all duration-300 group shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]"
              >
                <div className="w-20 h-20 bg-emerald-950 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_currentColor]">
                  <span className="text-4xl drop-shadow-md">⚡</span>
                </div>
                <h2 className="text-xl font-black text-emerald-400 tracking-widest mb-3">TAHMİNMATİK</h2>
                <p className="text-slate-400 text-xs">İstediğiniz skoru seçin, kimlerin o skoru tahmin ettiğini anında bulun.</p>
                <div className="mt-8 px-6 py-2 bg-emerald-600/20 text-emerald-300 border border-emerald-500/50 rounded-full font-bold text-xs uppercase tracking-widest group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  Tahminmatik'i Aç
                </div>
              </div>

              <div className="bg-slate-900/80 border-2 border-amber-500/30 rounded-3xl p-8 flex flex-col relative shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#050b14] px-4 w-full text-center">
                  <span className="text-amber-500 font-black tracking-widest text-[11px] sm:text-xs bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)] whitespace-nowrap">
                    5. HAFTA GİRİŞLERİ
                  </span>
                </div>

                <div className="text-center mb-5 mt-4">
                  <p className="text-[10px] text-slate-400 font-bold tracking-widest mb-1">AÇILIŞ: <span className="text-slate-200">14.08.2026 - 21:00</span></p>
                  <p className="text-[10px] text-red-400 font-bold tracking-widest">KAPANIŞ: <span className="text-red-300">17.08.2026 - 21:00</span></p>
                </div>

                <div className="flex justify-center gap-2 mb-6">
                  <div className="flex flex-col items-center">
                    <div className="bg-slate-950 border border-slate-700 w-12 h-14 rounded-xl flex items-center justify-center shadow-inner">
                      <span className="text-xl font-black text-white">{String(timeLeft.days).padStart(2, '0')}</span>
                    </div>
                    <span className="text-[8px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Gün</span>
                  </div>
                  <span className="text-xl font-black text-slate-600 mt-3">:</span>
                  <div className="flex flex-col items-center">
                    <div className="bg-slate-950 border border-slate-700 w-12 h-14 rounded-xl flex items-center justify-center shadow-inner">
                      <span className="text-xl font-black text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                    </div>
                    <span className="text-[8px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Saat</span>
                  </div>
                  <span className="text-xl font-black text-slate-600 mt-3">:</span>
                  <div className="flex flex-col items-center">
                    <div className="bg-slate-950 border border-slate-700 w-12 h-14 rounded-xl flex items-center justify-center shadow-inner">
                      <span className="text-xl font-black text-amber-400">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    </div>
                    <span className="text-[8px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Dk</span>
                  </div>
                  <span className="text-xl font-black text-slate-600 mt-3">:</span>
                  <div className="flex flex-col items-center">
                    <div className="bg-slate-950 border border-slate-700 w-12 h-14 rounded-xl flex items-center justify-center shadow-inner">
                      <span className="text-xl font-black text-red-400 animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    </div>
                    <span className="text-[8px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Sn</span>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-5"></div>

                <form onSubmit={handleLogin} className="flex flex-col gap-3">
                  <input 
                    type="text" 
                    placeholder="Yarışmacı ID" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    disabled={isTimeUp}
                    className="bg-slate-950 border border-slate-700 px-4 py-2.5 rounded-xl text-white outline-none focus:border-amber-500 text-center font-black tracking-widest text-sm disabled:opacity-50" 
                  />
                  <input 
                    type="password" 
                    placeholder="Şifre" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    disabled={isTimeUp}
                    className="bg-slate-950 border border-slate-700 px-4 py-2.5 rounded-xl text-white outline-none focus:border-amber-500 text-center tracking-widest text-sm disabled:opacity-50" 
                  />
                  {loginError && <p className="text-[10px] text-red-400 font-bold text-center bg-red-950/50 py-1.5 rounded-lg border border-red-500/30">{loginError}</p>}
                  
                  <button 
                    type="submit" 
                    disabled={isTimeUp}
                    className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] mt-1 tracking-widest flex items-center justify-center gap-2 text-sm"
                  >
                    {isTimeUp ? 'KAPALI' : 'GİRİŞ YAP'}
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* ===================== TAHMİNMATİK (4. HAFTAYA MÜHÜRLÜ) ===================== */}
        {view === 'tahminmatik' && (
          <div className="animate-fade-in-up w-full">
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-slate-900/50 p-6 rounded-2xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] relative z-50">
              <button onClick={() => setView('lobby')} className="flex items-center gap-2 text-slate-400 hover:text-white font-bold bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 transition-colors">
                <span>⬅</span> Lobiye Dön
              </button>
              
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-black text-emerald-500 tracking-widest drop-shadow-[0_0_10px_rgba(16,185,129,0.4)] uppercase flex items-center justify-center gap-3">
                  <span className="text-3xl md:text-4xl">⚡</span> TAHMİNMATİK
                </h2>
                <p className="text-slate-400 text-xs md:text-sm mt-2">İstediğiniz skoru seçin, kimlerin o skoru tahmin ettiğini anında bulun.</p>
              </div>
              
              <div>
                <select
                  value={selectedTahminWeek}
                  onChange={(e) => setSelectedTahminWeek(Number(e.target.value))}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer outline-none transition-all shadow text-xs sm:text-sm"
                >
                  {/* 🔴 SADECE 4. HAFTA GÖRÜNÜR 🔴 */}
                  <option value={4}>4. HAFTA TAHMİNMATİK</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {selectedTahminWeek === 4 ? week4Matches.map(match => {
                const theme = getEliteTheme(match.category);
                const homeLogoUrl = localTeamLogos[match.homeTeam] || "/logos/default.png";
                const awayLogoUrl = localTeamLogos[match.awayTeam] || "/logos/default.png";
                
                const tScore = tahminmatikScores[match.id] || { home: '-', away: '-' };
                const isComplete = tScore.home !== '-' && tScore.away !== '-';
                const targetScore = `${tScore.home}-${tScore.away}`;
                 
                const predictors = isComplete 
                   ? Object.keys(week4PredictionsData)
                       .filter(uid => week4PredictionsData[uid][match.id - 1] === targetScore)
                       .map(uid => TEST_ACCOUNTS[uid]?.name || "Bilinmeyen")
                       .sort((a,b) => a.localeCompare(b, 'tr'))
                   : [];

                return (
                  <div 
                    key={`tm-${match.id}`} 
                    className={`w-full mx-auto border rounded-2xl overflow-hidden transition-all duration-500 flex flex-col relative ${theme.containerBorder} ${theme.containerShadow} ${theme.containerBg}`}
                  >
                    <div className="p-4 sm:p-6 relative flex-grow overflow-hidden flex flex-col justify-center">
                      
                      {theme.bgImg && (
                        <>
                          <div 
                            className="absolute inset-0 z-0 opacity-100"
                            style={{ 
                              backgroundImage: theme.bgImg,
                              backgroundSize: 'cover', 
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat'
                            }}
                          ></div>
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
                        </div>

                        <div className="flex items-center justify-between px-0 sm:px-4 mt-2">
                          
                          <div className="flex flex-col items-center justify-center flex-1 gap-1.5 sm:gap-3">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20">
                              <img src={homeLogoUrl} alt={match.homeTeam} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
                            </div>
                            <span className="text-white font-extrabold text-[9px] sm:text-[12px] text-center uppercase tracking-wide drop-shadow-lg leading-tight px-1">{match.homeTeam}</span>
                          </div>

                          <div className="flex flex-col items-center justify-center mx-1.5 sm:mx-4 w-24 sm:w-36 z-30">
                            <div className={`w-full bg-[#080d1a]/80 border ${theme.scoreBorder} py-2.5 sm:py-3.5 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
                              <select value={tScore.home} onChange={e => handleTahminmatikChange(match.id, 'home', e.target.value)} className="bg-slate-950 border border-slate-700 text-amber-400 font-black text-lg sm:text-2xl px-1 sm:px-2 py-1 rounded-lg outline-none focus:border-amber-500 text-center w-10 sm:w-12 appearance-none shadow-inner cursor-pointer" style={{textAlignLast: 'center'}}>
                                 {scoreOptionsArr.map(o => <option key={o} value={o}>{o}</option>)}
                              </select>
                              <span className={`text-base sm:text-xl font-bold ${theme.colonText}`}>:</span>
                              <select value={tScore.away} onChange={e => handleTahminmatikChange(match.id, 'away', e.target.value)} className="bg-slate-950 border border-slate-700 text-amber-400 font-black text-lg sm:text-2xl px-1 sm:px-2 py-1 rounded-lg outline-none focus:border-amber-500 text-center w-10 sm:w-12 appearance-none shadow-inner cursor-pointer" style={{textAlignLast: 'center'}}>
                                 {scoreOptionsArr.map(o => <option key={o} value={o}>{o}</option>)}
                              </select>
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center flex-1 gap-1.5 sm:gap-3">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20">
                              <img src={awayLogoUrl} alt={match.awayTeam} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
                            </div>
                            <span className="text-white font-extrabold text-[9px] sm:text-[12px] text-center uppercase tracking-wide drop-shadow-lg leading-tight px-1">{match.awayTeam}</span>
                          </div>

                        </div>
                      </div>
                    </div>

                    <div className={`${theme.bottomBar} border-t px-4 py-4 w-full backdrop-blur-md z-10 relative min-h-[90px]`}>
                       <div className="flex items-center gap-2 mb-3">
                           <span className="text-red-500 text-sm drop-shadow-md">🎯</span> 
                           <span className="text-amber-500 font-bold text-[10px] sm:text-xs tracking-widest">SKORU BİLENLER [{predictors.length} KİŞİ]</span>
                       </div>
                       <div className="flex items-center justify-center border-t border-slate-700/50 pt-3">
                           {!isComplete ? (
                               <span className="text-slate-500 text-[10px] sm:text-xs italic tracking-wide">Lütfen yukarıdan skoru seçin...</span>
                           ) : predictors.length === 0 ? (
                               <span className="text-slate-400 text-[10px] sm:text-xs font-medium tracking-wide">Bu skoru tahmin eden yarışmacı bulunamadı.</span>
                           ) : (
                               <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                                   {predictors.map((p, i) => (
                                       <span key={i} className="bg-slate-950/80 border px-2 py-1 rounded text-[9px] sm:text-[10px] font-bold text-white shadow-sm uppercase tracking-wider border-slate-600/50">
                                          {p}
                                       </span>
                                   ))}
                               </div>
                           )}
                       </div>
                    </div>
                  </div>
                );
              }) : (
                 <div className="col-span-1 md:col-span-2 py-20 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <span className="text-5xl mb-4 block opacity-50">⏳</span>
                    <h2 className="text-xl font-bold text-slate-400 mb-2 tracking-widest">{selectedTahminWeek}. HAFTA TAHMİNLERİ BEKLENİYOR</h2>
                    <p className="text-slate-500 text-sm">Bu haftanın tahminleri sisteme henüz yüklenmedi.</p>
                 </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== RESMİ DEKLARASYON ===================== */}
        {view === 'declaration' && (
          <div className="animate-fade-in-up w-full">
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-slate-900/50 p-6 rounded-2xl border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)] relative z-50">
              <button onClick={() => setView('lobby')} className="flex items-center gap-2 text-slate-400 hover:text-white font-bold bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 transition-colors">
                <span>⬅</span> Lobiye Dön
              </button>
              
              <div className="text-center">
                <h2 className="text-3xl font-black text-amber-500 tracking-widest drop-shadow-[0_0_10px_rgba(245,158,11,0.4)] uppercase">RESMİ DEKLARASYON</h2>
              </div>
              
              <div className="flex flex-wrap md:flex-nowrap gap-3 items-center w-full md:w-auto relative">
                
                <button 
                  onClick={downloadJPEG}
                  disabled={isDownloading}
                  title="Tahmin tablosunu fotoğraf (JPEG) olarak cihazınıza indirin"
                  className="bg-emerald-600/20 border border-emerald-500/50 hover:bg-emerald-600 text-emerald-400 hover:text-white font-black px-4 py-2 rounded-lg flex items-center shadow-[0_0_15px_rgba(16,185,129,0.2)] whitespace-nowrap transition-all gap-2 text-sm disabled:opacity-50"
                >
                  <span className="text-lg">📸</span> {isDownloading ? 'FOTOĞRAF HAZIRLANIYOR...' : 'TAHMİNLERİ İNDİR'}
                </button>

                <div className="relative flex-1 md:min-w-[250px]">
                  <input 
                    type="text" 
                    placeholder="Yarışmacı ara (Örn: Rıdvan)" 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    className="w-full bg-slate-950 border border-slate-700 px-4 py-2 rounded-lg text-white text-sm outline-none focus:border-amber-500"
                  />
                  {isSearchFocused && (
                    <div className="absolute top-full left-0 w-full bg-slate-900 border border-slate-700 mt-1 rounded-lg shadow-2xl z-[100] max-h-48 overflow-y-auto custom-scrollbar">
                      {finalPlayersList.map(id => (
                        <div 
                          key={`drop-${id}`} 
                          className="px-4 py-2 hover:bg-slate-800 cursor-pointer text-xs font-bold text-slate-300 border-b border-slate-800/50 last:border-0"
                          onClick={() => {
                            setSearchTerm(TEST_ACCOUNTS[id].name);
                            setIsSearchFocused(false);
                          }}
                        >
                          {TEST_ACCOUNTS[id].name}
                        </div>
                      ))}
                      {finalPlayersList.length === 0 && (
                        <div className="px-4 py-3 text-xs text-slate-500 italic text-center">Sonuç bulunamadı.</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-amber-500 text-slate-950 font-black px-4 py-2 rounded-lg flex items-center shadow-md whitespace-nowrap">
                  4. HAFTA BÜLTENİ ▼
                </div>
              </div>
            </div>

            <div className="bg-[#050b14] border border-slate-800 rounded-2xl p-4 md:p-6 shadow-2xl relative z-10">
              <div className="overflow-auto custom-scrollbar max-h-[70vh] border border-slate-800/50 rounded-lg">
                <table className="w-full text-xs text-center border-separate border-spacing-0 whitespace-nowrap">
                  
                  <thead className="sticky top-0 z-40 bg-slate-950 shadow-md">
                    <tr>
                      <th className="sticky left-0 z-50 bg-slate-950 border-b border-r border-slate-800 p-3 min-w-[200px] text-left">
                        <span className="text-amber-500 font-black tracking-widest">4. HAFTA</span>
                      </th>
                      {week4Matches.map(m => (
                        <th key={m.id} className="p-2 border-b border-r border-slate-800 bg-slate-900 text-slate-400 font-bold min-w-[50px]">{m.id}</th>
                      ))}
                      {ghostColumns.map((_, i) => (
                        <th key={`g1-${i}`} className="min-w-[60px] opacity-0 border-none"></th>
                      ))}
                    </tr>
                    
                    <tr>
                      <th className="sticky left-0 z-50 bg-slate-950 border-b border-r border-slate-800 p-3 text-left">
                        <span className="text-white font-black tracking-widest text-sm uppercase">OYUNCU İSMİ</span>
                      </th>
                      {week4Matches.map(m => (
                        <th key={`home-${m.id}`} className="p-1 border-b border-r border-slate-800 bg-slate-900/50">
                          <div className="w-6 h-6 mx-auto flex items-center justify-center">
                            <img src={localTeamLogos[m.homeTeam] || "/logos/default.png"} alt={m.homeTeam} className="w-full h-full object-contain drop-shadow-md" title={m.homeTeam} />
                          </div>
                        </th>
                      ))}
                      {ghostColumns.map((_, i) => (
                        <th key={`g2-${i}`} className="min-w-[60px] opacity-0 border-none"></th>
                      ))}
                    </tr>

                    <tr>
                      <th 
                        onClick={toggleSortOrder}
                        className="sticky left-0 z-50 bg-slate-950 border-b border-r border-slate-800 p-3 text-right cursor-pointer hover:bg-slate-900 transition-colors group"
                        title="Sıralamayı Değiştirmek İçin Tıkla"
                      >
                        <div className="flex justify-end items-center gap-2">
                           <span className="text-slate-500 text-[8px] uppercase group-hover:text-amber-300">Sırala: {sortOrder}</span>
                           <span className="text-amber-500 font-bold text-[9px] uppercase tracking-widest border border-amber-500/50 px-2 py-1 rounded bg-amber-950/30 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                             SIRA / LİSTE
                           </span>
                        </div>
                      </th>
                      {week4Matches.map(m => (
                        <th key={`away-${m.id}`} className="p-1 border-b border-r border-slate-800 bg-slate-900/50">
                          <div className="w-6 h-6 mx-auto flex items-center justify-center">
                            <img src={localTeamLogos[m.awayTeam] || "/logos/default.png"} alt={m.awayTeam} className="w-full h-full object-contain drop-shadow-md" title={m.awayTeam} />
                          </div>
                        </th>
                      ))}
                      {ghostColumns.map((_, i) => (
                        <th key={`g3-${i}`} className="min-w-[60px] opacity-0 border-none"></th>
                      ))}
                    </tr>
                  </thead>
                  
                  <tbody>
                    {finalPlayersList.map(id => {
                      const playerName = TEST_ACCOUNTS[id]?.name || "Bilinmeyen Oyuncu";
                      const preds = week4PredictionsData[id] || Array(24).fill('PAS');
                      const isMissing = preds[0] === 'PAS'; 

                      return (
                        <tr key={id} className={`hover:bg-slate-800/50 transition-colors group ${isMissing ? 'opacity-70' : ''}`}>
                          <td className="sticky left-0 z-30 bg-slate-950 border-b border-r border-slate-800 p-3 text-left font-bold tracking-wide group-hover:bg-slate-900 transition-colors">
                            <span className={isMissing ? 'text-red-400 line-through' : 'text-slate-300'}>{playerName}</span>
                          </td>
                          {preds.map((score, idx) => (
                            <td key={idx} className={`border-b border-r border-slate-800 p-2 font-black bg-[#0a1120] group-hover:bg-slate-800/80 ${isMissing ? 'text-red-500 text-[10px]' : 'text-amber-500'}`}>
                              {score}
                            </td>
                          ))}
                          {ghostColumns.map((_, i) => (
                            <td key={`gd-${i}`} className="min-w-[60px] opacity-0 border-none"></td>
                          ))}
                        </tr>
                      );
                    })}
                    
                    {finalPlayersList.length === 0 && (
                      <tr>
                        <td colSpan={35} className="py-8 border-b border-slate-800 text-slate-500 italic bg-[#0a1120]">Aradığınız kriterlere uygun yarışmacı bulunamadı.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ position: 'fixed', top: 0, left: 0, zIndex: -9999, opacity: 0, pointerEvents: 'none' }}>
              <div id="jpeg-export-container" className="bg-[#050b14] p-8 inline-block w-max">
                <div className="text-center mb-6 border-b border-slate-800 pb-4">
                  <h2 className="text-3xl font-black text-amber-500 tracking-widest uppercase">ETM LİGİ - 4. HAFTA TAHMİNLERİ</h2>
                  <p className="text-slate-400 mt-2 text-sm font-medium">* Sadece tahmin gönderen yarışmacılar A'dan Z'ye sıralanmıştır.</p>
                </div>
                <table className="w-full text-xs text-center border-separate border-spacing-0 whitespace-nowrap">
                  <thead className="bg-slate-950">
                    <tr>
                      <th className="bg-slate-950 border-b border-r border-slate-800 p-3 min-w-[200px] text-left">
                        <span className="text-amber-500 font-black tracking-widest text-lg">YARIŞMACI / MAÇ NO</span>
                      </th>
                      {week4Matches.map(m => (
                        <th key={`exp-m1-${m.id}`} className="p-2 border-b border-r border-slate-800 bg-slate-900 text-slate-400 font-bold min-w-[50px] text-lg">{m.id}</th>
                      ))}
                    </tr>
                    <tr>
                      <th className="bg-slate-950 border-b border-r border-slate-800 p-3 text-left">
                        <span className="text-white font-black tracking-widest text-sm uppercase">EV SAHİBİ TAKIM</span>
                      </th>
                      {week4Matches.map(m => (
                        <th key={`exp-home-${m.id}`} className="p-2 border-b border-r border-slate-800 bg-slate-900/50 text-slate-300 font-bold uppercase text-[9px] whitespace-nowrap">
                           {m.homeTeam}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      <th className="bg-slate-950 border-b border-r border-slate-800 p-3 text-left">
                        <span className="text-white font-black tracking-widest text-sm uppercase">DEPLASMAN TAKIM</span>
                      </th>
                      {week4Matches.map(m => (
                        <th key={`exp-away-${m.id}`} className="p-2 border-b border-r border-slate-800 bg-slate-900/50 text-slate-300 font-bold uppercase text-[9px] whitespace-nowrap">
                           {m.awayTeam}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  
                  <tbody>
                    {activePlayersForJPEG.map(id => {
                      const playerName = TEST_ACCOUNTS[id]?.name || "Bilinmeyen Oyuncu";
                      const preds = week4PredictionsData[id];
                      return (
                        <tr key={`exp-${id}`}>
                          <td className="bg-slate-950 border-b border-r border-slate-800 p-3 text-left font-bold text-slate-300 tracking-wide">
                            {playerName}
                          </td>
                          {preds.map((score, idx) => (
                            <td key={`exp-sc-${idx}`} className="border-b border-r border-slate-800 p-2 font-black text-amber-500 bg-[#0a1120] text-base">
                              {score}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ===================== ELİT TAHMİN GİRİŞ PORTALI ===================== */}
        {view === 'entry' && (
          <div className="w-full animate-fade-in-up">
            <div className="flex justify-between items-center mb-8 bg-slate-900/50 p-6 rounded-2xl border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <div>
                <h2 className="text-2xl font-black text-amber-500 tracking-widest">5. HAFTA GÖREV KAĞIDI</h2>
                <p className="text-slate-400 text-sm mt-1">Yarışmacı: <span className="text-white font-bold">{displayName}</span></p>
              </div>
              <button onClick={() => { setView('lobby'); setUsername(''); setPassword(''); }} className="text-red-400 hover:text-red-300 font-bold bg-red-950/30 px-4 py-2 rounded-lg border border-red-900/50">
                Oturumu Kapat
              </button>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
              {bulletin.map((match) => {
                const theme = getEliteTheme(match.category);
                const homeLogoUrl = localTeamLogos[match.home_team] || "/logos/default.png";
                const awayLogoUrl = localTeamLogos[match.away_team] || "/logos/default.png";
                const hScore = predictions[match.match_index]?.home || '-';
                const aScore = predictions[match.match_index]?.away || '-';

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

                      <div className="flex items-center justify-between px-4 pb-4 mt-2">
                        <div className="flex flex-col items-center justify-center flex-1 gap-2">
                          <div className="w-16 h-16 flex items-center justify-center relative z-20"><img src={homeLogoUrl} alt={match.home_team} className="w-full h-full object-contain drop-shadow-lg" /></div>
                          <span className="text-white font-extrabold text-[10px] text-center uppercase tracking-wide drop-shadow-md">{match.home_team}</span>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-2 mx-2 w-40 z-30">
                          <div className={`w-full bg-[#080d1a]/80 border ${theme.scoreBorder} py-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
                            <select value={hScore} onChange={e => handleScoreChange(match.match_index, 'home', e.target.value)} className="w-12 h-10 bg-slate-950 border border-slate-700 rounded-lg font-black text-xl text-amber-400 outline-none focus:border-amber-500 cursor-pointer appearance-none shadow-inner text-center" style={{ textAlignLast: 'center' }}>
                              {scoreOptionsArr.map(opt => (<option key={`h-${opt}`} value={opt}>{opt}</option>))}
                            </select>
                            <span className="text-xl font-bold text-slate-500">:</span>
                            <select value={aScore} onChange={e => handleScoreChange(match.match_index, 'away', e.target.value)} className="w-12 h-10 bg-slate-950 border border-slate-700 rounded-lg font-black text-xl text-amber-400 outline-none focus:border-amber-500 cursor-pointer appearance-none shadow-inner text-center" style={{ textAlignLast: 'center' }}>
                              {scoreOptionsArr.map(opt => (<option key={`a-${opt}`} value={opt}>{opt}</option>))}
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-center flex-1 gap-2">
                          <div className="w-16 h-16 flex items-center justify-center relative z-20"><img src={awayLogoUrl} alt={match.away_team} className="w-full h-full object-contain drop-shadow-lg" /></div>
                          <span className="text-white font-extrabold text-[10px] text-center uppercase tracking-wide drop-shadow-md">{match.away_team}</span>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 flex flex-col md:flex-row justify-center items-center gap-4 sticky bottom-6 z-50">
              <button 
                onClick={handleTahminMatikRastgele}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm md:text-lg px-6 py-4 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all hover:scale-105 border border-indigo-400/50 flex items-center gap-2"
              >
                🎲 RASTGELE DOLDUR
              </button>
              
              <button 
                onClick={savePredictions}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 text-white font-black text-sm md:text-lg px-6 py-4 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all hover:scale-105 border border-emerald-400/50"
              >
                {isSaving ? 'ŞİFRELENİYOR...' : '🚀 TAHMİNLERİMİ MÜHÜRLE'}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}