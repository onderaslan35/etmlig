"use client";

import React, { useState } from "react";

// 🔴 EKREM - YEREL & BULUT LOGO BANKASI (Tüm Devler Wikipedia SVG Ağına Bağlandı!)
const localTeamLogos: Record<string, string> = {
  // 🌟 SÜPER LİG DEVLERİ (WIKIPEDIA SVG - Şeffaf ve Cillop Gibi)
  "FENERBAHÇE": "https://upload.wikimedia.org/wikipedia/en/3/39/Fenerbah%C3%A7e.svg",
  "GALATASARAY": "https://upload.wikimedia.org/wikipedia/commons/f/f6/Galatasaray_Sports_Club_Logo.svg",
  "BEŞİKTAŞ": "https://upload.wikimedia.org/wikipedia/commons/1/13/Besiktas_JK_logo.svg",
  "TRABZONSPOR": "https://upload.wikimedia.org/wikipedia/en/e/ee/Trabzonspor_club_logo.svg",
  "KASIMPAŞA": "https://upload.wikimedia.org/wikipedia/en/a/a2/Kasimpasaspor_logo.svg",
  "KONYASPOR": "https://upload.wikimedia.org/wikipedia/en/8/81/Konyaspor_club_logo.svg",
  "ÇAYKUR RİZE": "https://upload.wikimedia.org/wikipedia/en/4/4c/%C3%87aykur_Rizespor_logo.svg",
  "BAŞAKŞEHİR": "https://upload.wikimedia.org/wikipedia/en/b/b3/Medipol_Ba%C5%9Fak%C5%9Fehir_FK_logo.svg",
  "SİVASSPOR": "https://upload.wikimedia.org/wikipedia/en/5/52/Sivasspor_logo.svg",
  "ANTALYASPOR": "https://upload.wikimedia.org/wikipedia/en/b/b8/Antalyaspor_logo.svg",
  "KAYSERİSPOR": "https://upload.wikimedia.org/wikipedia/en/6/6b/Kayserispor_logo.svg",
  "ALANYASPOR": "https://upload.wikimedia.org/wikipedia/en/7/7c/Alanyaspor_logo.svg",
  "GAZİANTEP FK": "https://upload.wikimedia.org/wikipedia/en/2/25/Gaziantep_F.K._logo.svg",
  "SAMSUNSPOR": "https://upload.wikimedia.org/wikipedia/en/e/e9/Samsunspor_logo.svg",
  "GÖZTEPE": "https://upload.wikimedia.org/wikipedia/en/f/f6/G%C3%B6ztepe_SK_logo.svg",

  // 🌟 AVRUPA DEVLERİ (WIKIPEDIA SVG)
  "PARIS SG": "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
  "ASTON VILLA": "https://upload.wikimedia.org/wikipedia/fr/0/00/Logo_Aston_Villa_FC_2024.svg",
  "STURM GRAZ": "https://upload.wikimedia.org/wikipedia/en/1/15/SK_Sturm_Graz_logo.svg",
  "KARABAĞ FK": "https://upload.wikimedia.org/wikipedia/en/1/1c/Qarabag_FK_logo.svg",
  "DINAMO KIEV": "https://upload.wikimedia.org/wikipedia/commons/d/df/FC_Dynamo_Kyiv_logo.svg",
  "HRADEC KRALOVE": "https://upload.wikimedia.org/wikipedia/en/f/fa/FC_Hradec_Kr%C3%A1lov%C3%A9.svg",
  "SLOVAN BRATISLAVA": "https://upload.wikimedia.org/wikipedia/en/1/1a/SK_Slovan_Bratislava_logo.svg",
  "DINAMO ZAGREB": "https://upload.wikimedia.org/wikipedia/en/2/23/GNK_Dinamo_Zagreb_logo.svg",
  "KOPENAG": "https://upload.wikimedia.org/wikipedia/en/9/93/FC_Copenhagen_logo.svg",
  "KOPENHAG": "https://upload.wikimedia.org/wikipedia/en/9/93/FC_Copenhagen_logo.svg",
  "RAPID WIEN": "https://upload.wikimedia.org/wikipedia/en/0/00/SK_Rapid_Wien_logo.svg",
  "AJAX": "https://upload.wikimedia.org/wikipedia/en/7/79/Ajax_Amsterdam_logo.svg",
  "PANATHINAIKOS": "https://upload.wikimedia.org/wikipedia/en/1/1b/Panathinaikos_F.C._logo.svg",
  "BRAGA": "https://upload.wikimedia.org/wikipedia/en/f/f3/Sporting_Clube_de_Braga_logo.svg",
  "PAOK": "https://upload.wikimedia.org/wikipedia/en/1/1e/PAOK_FC_logo.svg",
  "ANDERLECHT": "https://upload.wikimedia.org/wikipedia/en/4/41/RSC_Anderlecht_logo.svg",
  "TWENTE": "https://upload.wikimedia.org/wikipedia/en/1/12/FC_Twente_logo.svg",
  "BENFICA": "https://upload.wikimedia.org/wikipedia/en/a/a2/SL_Benfica_logo.svg",
  "ARSENAL": "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
  "MANCHESTER CITY": "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
  "SPARTA PRAG": "https://upload.wikimedia.org/wikipedia/en/0/05/AC_Sparta_Prague_logo.svg",
  "OLIMPIC LYON": "https://upload.wikimedia.org/wikipedia/en/c/c6/Olympique_Lyonnais.svg",
  "OLIMPIYAKOS": "https://upload.wikimedia.org/wikipedia/en/f/f1/Olympiacos_FC_logo.svg",
  "BODO-GLIMT": "https://upload.wikimedia.org/wikipedia/en/0/04/FK_Bod%C3%B8-Glimt_logo.svg",
  "GENT": "https://upload.wikimedia.org/wikipedia/en/5/59/KAA_Gent_logo.svg",
  "MIDTJYLLAND": "https://upload.wikimedia.org/wikipedia/en/6/6b/FC_Midtjylland_logo.svg",
  "HAJDUK SPLIT": "https://upload.wikimedia.org/wikipedia/en/a/a0/Hajduk_Split_logo.svg",
  "CSKA SOFYA": "https://upload.wikimedia.org/wikipedia/en/7/77/CSKA_Sofia_logo.svg",
  "FERENCVAROS": "https://upload.wikimedia.org/wikipedia/en/7/72/Ferencv%C3%A1rosi_TC_logo.svg",
  "ST GALLEN": "https://upload.wikimedia.org/wikipedia/en/0/02/FC_St._Gallen_logo.svg",

  // 🔴 SENİN KALİTELİ ŞEFFAF YEREL PNG LOGOLARIN (Mükemmel Görünenler)
  "ÇORUM FK": "/logos/corum-fk.png", 
  "ESENLER EROKSPOR": "/logos/erokspor.png", "EROKSPOR": "/logos/erokspor.png",
  "SARIYER": "/logos/sariyer.png",
  "PENDİKSPOR": "/logos/pendikspor.png", "BATMAN PETROL SPOR": "/logos/batman.png",
  "GENÇLERBİRLİĞİ": "/logos/genclerbirligi.png", "IĞDIR FK": "/logos/igdir.png", 
  "BURSASPOR": "/logos/bursaspor.png", "MANİSA FK": "/logos/manisa.png",
  "VANSPOR FK": "/logos/vanspor.png", "KOCAELİSPOR": "/logos/kocaelispor.png", 
  "AMED SPOR": "/logos/amedspor.png", "ERZURUMSPOR": "/logos/erzurumspor.png",
  "EYÜPSPOR": "/logos/eyupspor.png", "KEÇİÖRENGÜCÜ": "/logos/keciorengucu.png", 
  "MARDİN 1969": "/logos/mardin.png", "MUĞLASPOR": "/logos/muglaspor.png", 
  "BANDIRMASPOR": "/logos/bandirmaspor.png", "BOLUSPOR": "/logos/boluspor.png", 
  "FATİH KARAGÜMRÜK": "/logos/karagumruk.png", "ÜMRANİYESPOR": "/logos/umraniyespor.png", 
  "İSTANBULSPOR": "/logos/istanbulspor.png", "BODRUMSPOR": "/logos/bodrumspor.png",
  
  // (Bulunmayan diğer Avrupa alt klasörleri için fallback)
  "IBERIA 1999": "/logos/iberia.png", "SABAH FK": "/logos/sabah.png", "KUPS": "/logos/kups.png", 
  "GORNİK ZABRZE": "/logos/gornik.png", "THUN": "/logos/thun.png", "HEART": "/logos/heart.png", 
  "LARNE FC": "/logos/larne.png", "KIZILYILDIZ": "/logos/kizilyildiz.png", "GOTEBORG": "/logos/goteborg.png", 
  "LEVADIA FC": "/logos/levadia.png", "LEVSKI SOFYA": "/logos/levski.png", "UNIVERSITATEA CRAIOVA": "/logos/craiova.png",
  "USG": "/logos/usg.png", "CSKA 1948": "/logos/cska-1948.png", "PAIDE LINNAMEESKOND": "/logos/paide.png",
  "DEBRECEN": "/logos/debrecen.png", "SHELBOURNE": "/logos/shelbourne.png", "DINAMO MINSK": "/logos/dinamo-minsk.png",
  "PATOS": "/logos/patos.png", "ZELEZNICAR PANCEVO": "/logos/zeleznicar.png", "PAKSI FC": "/logos/paksi.png",
  "UNIVERSITATEA CLUJ": "/logos/cluj.png", "BRANN": "/logos/brann.png", "AUDA RIGA": "/logos/auda.png",
  "SANTA COLOMA FC": "/logos/santa-coloma.png", "POLISSYA": "/logos/polissya.png", "INTER TURKU": "/logos/inter-turku.png",
  "FCSB": "/logos/fcsb.png", "VOJVODINA": "/logos/vojvodina.png", "NEC NIJMEGEN": "/logos/nec.png"
};

// 1. HAFTA MAÇ VERİLERİ
const week1Matches = [
  { id: 1, weekLabel: "1. Hafta - 1. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME", date: "21.07.2026", time: "20:00", homeTeam: "IBERIA 1999", awayTeam: "SLOVAN BRATISLAVA", score: "0 - 2", winnersCount: 13, earnedPoints: 1, winners: ["MUSTAFA GÜMÜŞÇÜ", "CUMALİ SÖKER", "SEDAT SEDAT", "ÖNDER ASLAN", "FATİH AYAN", "MEHMET ALİ KARA", "İSMAİL EKER", "HUDAVER TOPARDIC", "MURAT ALİ", "SAVAŞ ÇAĞLAYAN", "MUSTAFA ELMAS", "UĞUR GÜRBÜZ", "R. İLHAN KARACA"] },
  { id: 2, weekLabel: "1. Hafta - 2. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME", date: "21.07.2026", time: "21:00", homeTeam: "SABAH FK", awayTeam: "KUPS", score: "1 - 0", winnersCount: 2, earnedPoints: 6, winners: ["EYÜP KARACAOĞLU", "ÖNDER ASLAN"] },
  { id: 3, weekLabel: "1. Hafta - 3. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME", date: "22.07.2026", time: "20:30", homeTeam: "FENERBAHÇE", awayTeam: "GORNİK ZABRZE", score: "1 - 0", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 4, weekLabel: "1. Hafta - 4. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME", date: "22.07.2026", time: "21:45", homeTeam: "THUN", awayTeam: "DINAMO ZAGREB", score: "1 - 1", winnersCount: 9, earnedPoints: 1, winners: ["FATİH AYAN", "MEHMET ALİ KARA", "İSMAİL EKER", "ÖNDER ASLAN", "HUDAVER TOPARDIC", "MURAT ALİ", "SAVAŞ ÇAĞLAYAN", "MUSTAFA ELMAS", "UĞUR GÜRBÜZ"] },
  { id: 5, weekLabel: "1. Hafta - 5. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME", date: "23.07.2026", time: "19:00", homeTeam: "STURM GRAZ", awayTeam: "HEART", score: "4 - 0", winnersCount: 2, earnedPoints: 6, winners: ["CUMALİ SÖKER", "SEDAT SEDAT"] },
  { id: 6, weekLabel: "1. Hafta - 6. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME", date: "23.07.2026", time: "20:00", homeTeam: "LARNE FC", awayTeam: "KIZILYILDIZ", score: "0 - 4", winnersCount: 1, earnedPoints: 12, winners: ["DOĞAÇ ALKAN"] },
  { id: 7, weekLabel: "1. Hafta - 7. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME", date: "23.07.2026", time: "20:30", homeTeam: "GOTEBORG", awayTeam: "LEVADIA FC", score: "1 - 2", winnersCount: 2, earnedPoints: 6, winners: ["RIDVAN DOGER", "ÖNDER IŞIK"] },
  { id: 8, weekLabel: "1. Hafta - 8. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME", date: "23.07.2026", time: "21:00", homeTeam: "LEVSKI SOFYA", awayTeam: "UNIVERSITATEA CRAIOVA", score: "1 - 0", winnersCount: 4, earnedPoints: 4, winners: ["ABDULLAH DİK", "ŞAHİN GEZGİNCİ", "ÖNDER ASLAN", "HUDAVER TOPARDIC"] },
  { id: 9, weekLabel: "1. Hafta - 9. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME", date: "23.07.2026", time: "21:15", homeTeam: "POLISSYA", awayTeam: "KOPENAG", score: "0 - 3", winnersCount: 1, earnedPoints: 12, winners: ["SALİH KARACAOĞLU"] },
  { id: 10, weekLabel: "1. Hafta - 10. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME", date: "23.07.2026", time: "21:30", homeTeam: "SANTA COLOMA FC", awayTeam: "RAPID WIEN", score: "1 - 2", winnersCount: 3, earnedPoints: 5, winners: ["CUMALİ SÖKER", "MEHMET ALİ KARA", "ÖNDER ASLAN"] },
  { id: 11, weekLabel: "1. Hafta - 11. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME", date: "23.07.2026", time: "21:30", homeTeam: "FCSB", awayTeam: "AUDA RIGA", score: "2 - 1", winnersCount: 5, earnedPoints: 3, winners: ["MUSTAFA GÜMÜŞÇÜ", "İSMAİL EKER", "HUDAVER TOPARDIC", "SAVAŞ ÇAĞLAYAN", "MUSTAFA ELMAS"] },
  { id: 12, weekLabel: "1. Hafta - 12. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME", date: "23.07.2026", time: "21:45", homeTeam: "BAŞAKŞEHİR", awayTeam: "INTER TURKU", score: "1 - 1", winnersCount: 4, earnedPoints: 4, winners: ["FATİH AYAN", "MURAT ALİ", "UĞUR GÜRBÜZ", "R. İLHAN KARACA"] },
  { id: 13, weekLabel: "1. Hafta - 13. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME", date: "23.07.2026", time: "22:00", homeTeam: "UNIVERSITATEA CLUJ", awayTeam: "BRANN", score: "0 - 0", winnersCount: 2, earnedPoints: 6, winners: ["EYÜP KARACAOĞLU", "SEDAT SEDAT"] },
  { id: 14, weekLabel: "1. Hafta - 14. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME", date: "23.07.2026", time: "22:00", homeTeam: "VOJVODINA", awayTeam: "AJAX", score: "1 - 3", winnersCount: 2, earnedPoints: 6, winners: ["DOĞAÇ ALKAN", "ÖNDER ASLAN"] },
  { id: 15, weekLabel: "1. Hafta - 15. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME", date: "23.07.2026", time: "22:00", homeTeam: "PAKSI FC", awayTeam: "PANATHINAIKOS", score: "0 - 2", winnersCount: 3, earnedPoints: 5, winners: ["RIDVAN DOGER", "ÖNDER IŞIK", "ABDULLAH DİK"] },
  { id: 16, weekLabel: "1. Hafta - 16. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME", date: "23.07.2026", time: "22:00", homeTeam: "ZELEZNICAR PANCEVO", awayTeam: "BRAGA", score: "0 - 1", winnersCount: 1, earnedPoints: 12, winners: ["ŞAHİN GEZGİNCİ"] },
  { id: 17, weekLabel: "1. Hafta - 17. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME", date: "23.07.2026", time: "22:00", homeTeam: "BEŞİKTAŞ", awayTeam: "MIDTJYLLAND", score: "2 - 1", winnersCount: 6, earnedPoints: 2, winners: ["MUSTAFA GÜMÜŞÇÜ", "CUMALİ SÖKER", "SEDAT SEDAT", "FATİH AYAN", "MEHMET ALİ KARA", "İSMAİL EKER"] },
  { id: 18, weekLabel: "1. Hafta - 18. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME", date: "23.07.2026", time: "22:00", homeTeam: "HAJDUK SPLIT", awayTeam: "PATOS", score: "3 - 0", winnersCount: 2, earnedPoints: 6, winners: ["HUDAVER TOPARDIC", "MURAT ALİ"] },
  { id: 19, weekLabel: "1. Hafta - 19. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME", date: "23.07.2026", time: "22:00", homeTeam: "DINAMO KIEV", awayTeam: "PAOK", score: "1 - 1", winnersCount: 8, earnedPoints: 1, winners: ["SAVAŞ ÇAĞLAYAN", "MUSTAFA ELMAS", "UĞUR GÜRBÜZ", "R. İLHAN KARACA", "EYÜP KARACAOĞLU", "DOĞAÇ ALKAN", "RIDVAN DOGER", "ÖNDER IŞIK"] },
  { id: 20, weekLabel: "1. Hafta - 20. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME", date: "23.07.2026", time: "22:00", homeTeam: "KARABAĞ FK", awayTeam: "CSKA SOFYA", score: "2 - 0", winnersCount: 4, earnedPoints: 4, winners: ["ABDULLAH DİK", "ŞAHİN GEZGİNCİ", "SALİH KARACAOĞLU", "MUSTAFA GÜMÜŞÇÜ"] },
  { id: 21, weekLabel: "1. Hafta - 21. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME", date: "23.07.2026", time: "22:00", homeTeam: "HAMMARBY", awayTeam: "ANDERLECHT", score: "1 - 0", winnersCount: 1, earnedPoints: 12, winners: ["CUMALİ SÖKER"] },
  { id: 22, weekLabel: "1. Hafta - 22. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME", date: "23.07.2026", time: "22:00", homeTeam: "TWENTE", awayTeam: "FERENCVAROS", score: "1 - 2", winnersCount: 2, earnedPoints: 6, winners: ["SEDAT SEDAT", "ÖNDER ASLAN"] },
  { id: 23, weekLabel: "1. Hafta - 23. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME", date: "23.07.2026", time: "22:00", homeTeam: "ST GALLEN", awayTeam: "BENFICA", score: "0 - 4", winnersCount: 1, earnedPoints: 12, winners: ["FATİH AYAN"] },
  { id: 24, weekLabel: "1. Hafta - 24. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME", date: "23.07.2026", time: "22:00", homeTeam: "SPARTAK TRNAVA", awayTeam: "CSKA 1948", score: "2 - 0", winnersCount: 3, earnedPoints: 5, winners: ["MEHMET ALİ KARA", "İSMAİL EKER", "HUDAVER TOPARDIC"] }
];

// 2. HAFTA MAÇ VERİLERİ
const week2Matches = [
  { id: 1, weekLabel: "2. Hafta - 1. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "28.07.2026", time: "18:00", homeTeam: "KUPS", awayTeam: "SABAH FK", score: "0 - 2", winnersCount: 3, earnedPoints: 5, winners: ["MUSTAFA GÜMÜŞÇÜ", "CUMALİ SÖKER", "SEDAT SEDAT"] },
  { id: 2, weekLabel: "2. Hafta - 2. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "28.07.2026", time: "21:00", homeTeam: "DINAMO ZAGREB", awayTeam: "THUN", score: "3 - 2", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 3, weekLabel: "2. Hafta - 3. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "28.07.2026", time: "21:45", homeTeam: "HEART", awayTeam: "STURM GRAZ", score: "0 - 2", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 4, weekLabel: "2. Hafta - 4. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "28.07.2026", time: "20:30", homeTeam: "CSKA 1948", awayTeam: "SPARTAK TRNAVA", score: "0 - 0", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 5, weekLabel: "2. Hafta - 5. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "29.07.2026", time: "19:00", homeTeam: "UNIVERSITATEA CRAIOVA", awayTeam: "LEVSKI SOFYA", score: "2 - 2", winnersCount: 1, earnedPoints: 12, winners: ["DOĞAÇ ALKAN"] },
  { id: 6, weekLabel: "2. Hafta - 6. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "29.07.2026", time: "19:30", homeTeam: "KIZILYILDIZ", awayTeam: "LARNE FC", score: "5 - 0", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 7, weekLabel: "2. Hafta - 7. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "29.07.2026", time: "20:00", homeTeam: "GORNİK ZABRZE", awayTeam: "FENERBAHÇE", score: "1 - 1", winnersCount: 9, earnedPoints: 1, winners: ["FATİH AYAN", "MEHMET ALİ KARA", "İSMAİL EKER", "ÖNDER ASLAN", "HUDAVER TOPARDIC", "MURAT ALİ", "SAVAŞ ÇAĞLAYAN", "MUSTAFA ELMAS", "UĞUR GÜRBÜZ"] },
  { id: 8, weekLabel: "2. Hafta - 8. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "29.07.2026", time: "20:00", homeTeam: "SLOVAN BRATISLAVA", awayTeam: "IBERIA 1999", score: "1 - 1", winnersCount: 3, earnedPoints: 5, winners: ["CUMALİ SÖKER", "EYÜP KARACAOĞLU", "ŞAHİN GEZGİNCİ"] },
  { id: 9, weekLabel: "2. Hafta - 9. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "29.07.2026", time: "20:00", homeTeam: "KOPENAG", awayTeam: "POLISSYA", score: "2 - 1", winnersCount: 6, earnedPoints: 2, winners: ["B. VEYSELOĞLU EROL", "ABDULLAH DİK", "ŞAHİN GEZGİNCİ", "ÖNDER ASLAN", "HUDAVER TOPARDIC", "ŞEMSETTİN DÜGER"] },
  { id: 10, weekLabel: "2. Hafta - 10. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "29.07.2026", time: "20:00", homeTeam: "RAPID WIEN", awayTeam: "SANTA COLOMA FC", score: "6 - 2", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 11, weekLabel: "2. Hafta - 11. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "29.07.2026", time: "20:00", homeTeam: "AUDA RIGA", awayTeam: "FCSB", score: "4 - 1", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 12, weekLabel: "2. Hafta - 12. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "20:00", homeTeam: "INTER TURKU", awayTeam: "BAŞAKŞEHİR", score: "2 - 0", winnersCount: 2, earnedPoints: 6, winners: ["EYÜP KARACAOĞLU", "ÖNDER ASLAN"] },
  { id: 13, weekLabel: "2. Hafta - 13. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "21:00", homeTeam: "LEVADIA FC", awayTeam: "GOTEBORG", score: "0 - 1", winnersCount: 6, earnedPoints: 2, winners: ["RIDVAN DOGER", "ÖNDER IŞIK", "MURAT KARA", "CEMALETTİN BELLİ", "İSMAİL EKER", "ÖNDER ASLAN"] },
  { id: 14, weekLabel: "2. Hafta - 14. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "21:30", homeTeam: "BRANN", awayTeam: "UNIVERSITATEA CLUJ", score: "3 - 1", winnersCount: 1, earnedPoints: 12, winners: ["CEMAL SİVRİKAYA"] },
  { id: 15, weekLabel: "2. Hafta - 15. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "21:00", homeTeam: "AJAX", awayTeam: "VOJVODINA", score: "4 - 1", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 16, weekLabel: "2. Hafta - 16. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "20:00", homeTeam: "PANATHINAIKOS", awayTeam: "PAKSI FC", score: "2 - 2", winnersCount: 3, earnedPoints: 5, winners: ["AHMET BİRCAN", "MEVLÜT EVLER", "EYÜP KARACAOĞLU"] },
  { id: 17, weekLabel: "2. Hafta - 17. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "20:00", homeTeam: "BRAGA", awayTeam: "ZELEZNICAR PANCEVO", score: "4 - 0", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 18, weekLabel: "2. Hafta - 18. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "20:00", homeTeam: "MIDTJYLLAND", awayTeam: "BEŞİKTAŞ", score: "0 - 2", winnersCount: 2, earnedPoints: 6, winners: ["R. İLHAN KARACA", "HUDAVER TOPARDIC"] },
  { id: 19, weekLabel: "2. Hafta - 19. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "20:45", homeTeam: "PATOS", awayTeam: "HAJDUK SPLIT", score: "2 - 0", winnersCount: 2, earnedPoints: 6, winners: ["ŞENOL CAN ÇAKICI", "MURAT ALİ"] },
  { id: 20, weekLabel: "2. Hafta - 20. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "21:00", homeTeam: "PAOK", awayTeam: "DINAMO KIEV", score: "2 - 0", winnersCount: 8, earnedPoints: 1, winners: ["CUMALİ SÖKER", "MUSTAFA ELMAS", "SEDAT SEDAT", "OSMAN ALİ AYDIN", "DOĞAÇ ALKAN", "BİROL DEMİREL", "İSMAİL EKER", "BAYRAM YILMAZ"] },
  { id: 21, weekLabel: "2. Hafta - 21. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "21:30", homeTeam: "CSKA SOFYA", awayTeam: "KARABAĞ FK", score: "0 - 0", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 22, weekLabel: "2. Hafta - 22. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "22:00", homeTeam: "ANDERLECHT", awayTeam: "HAMMARBY", score: "3 - 1", winnersCount: 7, earnedPoints: 1, winners: ["ULAŞ ADIGÜZEL", "CUMALİ SÖKER", "MEHMET ALİ KARA", "İLYAS KAZDAL", "AHMET BİRCAN", "MELİH PINAR", "SALİH KARACAOĞLU"] },
  { id: 23, weekLabel: "2. Hafta - 23. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "22:00", homeTeam: "FERENCVAROS", awayTeam: "TWENTE", score: "2 - 2", winnersCount: 2, earnedPoints: 6, winners: ["RIDVAN DOGER", "SEDAT DİŞLİ"] },
  { id: 24, weekLabel: "2. Hafta - 24. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "22:30", homeTeam: "BENFICA", awayTeam: "ST GALLEN", score: "5 - 0", winnersCount: 1, earnedPoints: 12, winners: ["SALİH KARACAOĞLU"] }
];

// 3. HAFTA MAÇ VERİLERİ
const week3Matches = [
  { id: 1, weekLabel: "3. Hafta - 1. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "05.08.2026", time: "20:00", homeTeam: "OLIMPIYAKOS", awayTeam: "NEC NIJMEGEN", score: "0 - 0", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 2, weekLabel: "3. Hafta - 2. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "05.08.2026", time: "20:30", homeTeam: "SPARTA PRAG", awayTeam: "OLIMPIC LYON", score: "2 - 1", winnersCount: 3, earnedPoints: 5, winners: ["MUSTAFA ELMAS", "ALİOS GÖZTEPE", "MEVLÜT EVLER"] },
  { id: 3, weekLabel: "3. Hafta - 3. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "05.08.2026", time: "21:00", homeTeam: "USG", awayTeam: "BODO-GLIMT", score: "3 - 3", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 4, weekLabel: "3. Hafta - 4. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "05.08.2026", time: "21:45", homeTeam: "FENERBAHÇE", awayTeam: "STURM GRAZ", score: "2 - 0", winnersCount: 8, earnedPoints: 1, winners: ["HAKAN AYAN", "MUSTAFA GÜMÜŞÇÜ", "İLYAS KAZDAL", "ALİOS GÖZTEPE", "SEDAT DİŞLİ", "KEMAL ERSOY", "AYHAN LUŞOĞLU", "CEMAL SİVRİKAYA"] },
  { id: 5, weekLabel: "3. Hafta - 5. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "06.08.2026", time: "19:00", homeTeam: "PANATHINAIKOS", awayTeam: "CSKA 1948", score: "1 - 1", winnersCount: 6, earnedPoints: 2, winners: ["RIDVAN DOGER", "MUSTAFA ELMAS", "FATİH AYAN", "SAVAŞ ÇAĞLAYAN", "DOĞAÇ ALKAN", "R. İLHAN KARACA"] },
  { id: 6, weekLabel: "3. Hafta - 6. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "06.08.2026", time: "20:00", homeTeam: "PAIDE LINNAMEESKOND", awayTeam: "RAPID WIEN", score: "1 - 4", winnersCount: 2, earnedPoints: 6, winners: ["ULAŞ ADIGÜZEL", "SEDAT DİŞLİ"] },
  { id: 7, weekLabel: "3. Hafta - 7. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "06.08.2026", time: "20:30", homeTeam: "HRADEC KRALOVE", awayTeam: "BEŞİKTAŞ", score: "0 - 1", winnersCount: 7, earnedPoints: 1, winners: ["BİROL DEMİREL", "HUDAVER TOPARDIC", "OSMAN ALİ AYDIN", "İSMAİL EKER", "SALİH KARACAOĞLU", "YUSUF ERBAY", "UĞUR GÜRBÜZ"] },
  { id: 8, weekLabel: "3. Hafta - 8. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "06.08.2026", time: "20:00", homeTeam: "DEBRECEN", awayTeam: "KOPENHAG", score: "0 - 3", winnersCount: 4, earnedPoints: 3, winners: ["LEVENT YILDIRIM", "SEDAT SEDAT", "CUMALİ SÖKER", "SALİH KARACAOĞLU"] },
  { id: 9, weekLabel: "3. Hafta - 9. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "06.08.2026", time: "21:00", homeTeam: "DINAMO KIEV", awayTeam: "KARABAĞ FK", score: "1 - 0", winnersCount: 1, earnedPoints: 12, winners: ["MUHSİN ASİLKAN"] },
  { id: 10, weekLabel: "3. Hafta - 10. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "06.08.2026", time: "21:00", homeTeam: "GOTEBORG", awayTeam: "GENT", score: "0 - 1", winnersCount: 3, earnedPoints: 5, winners: ["HUDAVER TOPARDIC", "GAZİ AYAN", "YUSUF KIZILTUĞ"] },
  { id: 11, weekLabel: "3. Hafta - 11. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "06.08.2026", time: "21:00", homeTeam: "PAOK", awayTeam: "ANDERLECHT", score: "0 - 1", winnersCount: 3, earnedPoints: 5, winners: ["MUSTAFA GÜMÜŞÇÜ", "İLYAS KAZDAL", "RIDVAN DOĞER"] },
  { id: 12, weekLabel: "3. Hafta - 12. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "06.08.2026", time: "21:30", homeTeam: "AJAX", awayTeam: "SHELBOURNE", score: "2 - 0", winnersCount: 4, earnedPoints: 3, winners: ["MEHMET ALİ KARA", "RIDVAN DOGER", "MURAT KARA", "EYÜP KARACAOĞLU"] },
  { id: 13, weekLabel: "3. Hafta - 13. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "06.08.2026", time: "21:30", homeTeam: "BRAGA", awayTeam: "DINAMO MINSK", score: "1 - 0", winnersCount: 1, earnedPoints: 12, winners: ["SEDAT SEDAT"] },
  { id: 14, weekLabel: "3. Hafta - 14. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "06.08.2026", time: "21:45", homeTeam: "BENFICA", awayTeam: "HEART", score: "2 - 0", winnersCount: 6, earnedPoints: 2, winners: ["İLYAS KAZDAL", "ALİ ÖZKÖZTEPE", "SALİH KARACAOĞLU", "ÖNDER IŞIK", "RECEP İLHAN KARACA", "FATİH AYAN"] },
  { id: 15, weekLabel: "3. Hafta - 15. MAÇ", category: "TÜRKİYE 1.LİG", date: "07.08.2026", time: "20:00", homeTeam: "BOLUSPOR", awayTeam: "MANİSA FK", score: "1 - 2", winnersCount: 3, earnedPoints: 5, winners: ["ULAŞ ADIGÜZEL", "LEVENT YILDIRIM", "ÖNDER ASLAN"] },
  { id: 16, weekLabel: "3. Hafta - 16. MAÇ", category: "TÜRKİYE 1.LİG", date: "07.08.2026", time: "21:00", homeTeam: "BANDIRMASPOR", awayTeam: "İSTANBULSPOR", score: "3 - 0", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 17, weekLabel: "3. Hafta - 17. MAÇ", category: "TÜRKİYE 1.LİG", date: "08.08.2026", time: "19:15", homeTeam: "SİVASSPOR", awayTeam: "ESENLER EROKSPOR", score: "0 - 0", winnersCount: 2, earnedPoints: 6, winners: ["HAKAN AYAN", "GAZİ AYAN"] },
  { id: 18, weekLabel: "3. Hafta - 18. MAÇ", category: "TÜRKİYE 1.LİG", date: "08.08.2026", time: "21:45", homeTeam: "ÜMRANİYESPOR", awayTeam: "VANSPOR", score: "0 - 0", winnersCount: 4, earnedPoints: 3, winners: ["SEDAT SEDAT", "MUHSİN ASİLKAN", "HAKAN AYAN", "İSMAİL EKER"] },
  { id: 19, weekLabel: "3. Hafta - 19. MAÇ", category: "TÜRKİYE 1.LİG", date: "08.08.2026", time: "21:45", homeTeam: "ANTALYASPOR", awayTeam: "KEÇİÖRENGÜCÜ", score: "4 - 3", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 20, weekLabel: "3. Hafta - 20. MAÇ", category: "TÜRKİYE 1.LİG", date: "09.08.2026", time: "19:00", homeTeam: "IĞDIR FK", awayTeam: "FATİH KARAGÜMRÜK", score: "2 - 0", winnersCount: 4, earnedPoints: 4, winners: ["MUSTAFA ELMAS", "ŞENOL CAN ÇAKICI", "ABDULLAH DİK", "EYÜP KARACAOĞLU"] },
  { id: 21, weekLabel: "3. Hafta - 21. MAÇ", category: "TÜRKİYE 1.LİG", date: "09.08.2026", time: "19:00", homeTeam: "SARIYER", awayTeam: "MUĞLASPOR", score: "2 - 0", winnersCount: 5, earnedPoints: 3, winners: ["SEDAT SEDAT", "MUHSİN ASİLKAN", "KEMAL ERSOY", "OSMAN ALİ AYDIN", "AHMET BİRCAN"] },
  { id: 22, weekLabel: "3. Hafta - 22. MAÇ", category: "TÜRKİYE 1.LİG", date: "09.08.2026", time: "21:30", homeTeam: "BODRUMSPOR", awayTeam: "BURSASPOR", score: "0 - 2", winnersCount: 11, earnedPoints: 1, winners: ["MUSTAFA GÜMÜŞÇÜ", "MURAT KARA", "ALİOS GÖZTEPE", "ÖNDER ASLAN", "ÖNDER IŞIK", "CEMAL SİVRİKAYA", "AHMET BİRCAN", "OZKAYA MAZAKALI BAYRAM", "OSMAN ALİ AYDIN", "YUSUF ERBAY", "UĞUR GÜRBÜZ"] },
  { id: 23, weekLabel: "3. Hafta - 23. MAÇ", category: "TÜRKİYE 1.LİG", date: "09.08.2026", time: "21:30", homeTeam: "VANSPOR FK", awayTeam: "KAYSERİSPOR", score: "0 - 2", winnersCount: 6, earnedPoints: 2, winners: ["SEDAT SEDAT", "B.VEYSELOĞLU EROL", "MURAT KARA", "AYHAN LUŞOĞLU", "OSMAN ALİ AYDIN", "YUSUF ERBAY"] },
  { id: 24, weekLabel: "3. Hafta - 24. MAÇ", category: "TÜRKİYE 1.LİG", date: "10.08.2026", time: "21:30", homeTeam: "PENDİKSPOR", awayTeam: "BATMAN PETROL SPOR", score: "2 - 2", winnersCount: 2, earnedPoints: 6, winners: ["DOĞAÇ ALKAN", "MEHMET ALİ KARA"] }
];

// 4. HAFTA MAÇ VERİLERİ
const week4Matches = [
  { id: 1, weekLabel: "4. Hafta - 1. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR RÖVANŞ MAÇI", date: "11.08.2026", time: "21:30", homeTeam: "STURM GRAZ", awayTeam: "FENERBAHÇE", score: "0 - 1", winnersCount: 4, earnedPoints: 4, winners: ["MUSTAFA GÜMÜŞÇÜ", "RIDVAN DOGER", "SEDAT SEDAT", "ŞENOL CAN ÇAKICI"] },
  { id: 2, weekLabel: "4. Hafta - 2. MAÇ", category: "UEFA SÜPER KUPA", date: "12.08.2026", time: "22:00", homeTeam: "PARIS SG", awayTeam: "ASTON VILLA", score: "- : -" },
  { id: 3, weekLabel: "4. Hafta - 3. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR RÖVANŞ", date: "13.08.2026", time: "19:00", homeTeam: "KARABAĞ FK", awayTeam: "DINAMO KIEV", score: "- : -" },
  { id: 4, weekLabel: "4. Hafta - 4. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR RÖVANŞ", date: "13.08.2026", time: "20:00", homeTeam: "BEŞİKTAŞ", awayTeam: "HRADEC KRALOVE", score: "- : -" },
  { id: 5, weekLabel: "4. Hafta - 5. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "14.08.2026", time: "21:30", homeTeam: "GALATASARAY", awayTeam: "ÇORUM FK", score: "- : -" },
  { id: 6, weekLabel: "4. Hafta - 6. MAÇ", category: "TÜRKİYE 1.LİG", date: "14.08.2026", time: "21:30", homeTeam: "EROKSPOR", awayTeam: "SARIYER", score: "- : -" },
  { id: 7, weekLabel: "4. Hafta - 7. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "19:00", homeTeam: "KASIMPAŞA", awayTeam: "TRABZONSPOR", score: "- : -" },
  { id: 8, weekLabel: "4. Hafta - 8. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "19:00", homeTeam: "KONYASPOR", awayTeam: "ÇAYKUR RİZE", score: "- : -" },
  { id: 9, weekLabel: "4. Hafta - 9. MAÇ", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "19:00", homeTeam: "FATİH KARAGÜMRÜK", awayTeam: "ÜMRANİYESPOR", score: "- : -" },
  { id: 10, weekLabel: "4. Hafta - 10. MAÇ", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "19:00", homeTeam: "İSTANBULSPOR", awayTeam: "BODRUMSPOR", score: "- : -" },
  { id: 11, weekLabel: "4. Hafta - 11. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "21:30", homeTeam: "GAZİANTEP FK", awayTeam: "ALANYASPOR", score: "- : -" },
  { id: 12, weekLabel: "4. Hafta - 12. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "21:30", homeTeam: "GENÇLERBİRLİĞİ", awayTeam: "FENERBAHÇE", score: "- : -" },
  { id: 13, weekLabel: "4. Hafta - 13. MAÇ", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "21:30", homeTeam: "BURSASPOR", awayTeam: "IĞDIR FK", score: "- : -" },
  { id: 14, weekLabel: "4. Hafta - 14. MAÇ", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "21:30", homeTeam: "MANİSA FK", awayTeam: "VANSPOR FK", score: "- : -" },
  { id: 15, weekLabel: "4. Hafta - 15. MAÇ", category: "İNGİLTERE SÜPER KUPA", date: "16.08.2026", time: "17:00", homeTeam: "ARSENAL", awayTeam: "MANCHESTER CITY", score: "- : -" },
  { id: 16, weekLabel: "4. Hafta - 16. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "16.08.2026", time: "19:00", homeTeam: "BAŞAKŞEHİR", awayTeam: "KOCAELİSPOR", score: "- : -" },
  { id: 17, weekLabel: "4. Hafta - 17. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "19:00", homeTeam: "KAYSERİSPOR", awayTeam: "SİVASSPOR", score: "- : -" },
  { id: 18, weekLabel: "4. Hafta - 18. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "16.08.2026", time: "21:30", homeTeam: "AMED SPOR", awayTeam: "ERZURUMSPOR", score: "- : -" },
  { id: 19, weekLabel: "4. Hafta - 19. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "16.08.2026", time: "21:30", homeTeam: "BEŞİKTAŞ", awayTeam: "EYÜPSPOR", score: "- : -" },
  { id: 20, weekLabel: "4. Hafta - 20. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "19:00", homeTeam: "KEÇİÖRENGÜCÜ", awayTeam: "PENDİKSPOR", score: "- : -" },
  { id: 21, weekLabel: "4. Hafta - 21. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "21:30", homeTeam: "MARDİN 1969", awayTeam: "ANTALYASPOR", score: "- : -" },
  { id: 22, weekLabel: "4. Hafta - 22. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "21:30", homeTeam: "MUĞLASPOR", awayTeam: "BANDIRMASPOR", score: "- : -" },
  { id: 23, weekLabel: "4. Hafta - 23. MAÇ", category: "TÜRKİYE SÜPER KUPA", date: "17.08.2026", time: "21:30", homeTeam: "SAMSUNSPOR", awayTeam: "GÖZTEPE", score: "- : -" },
  { id: 24, weekLabel: "4. Hafta - 24. MAÇ", category: "TÜRKİYE 1.LİG", date: "17.08.2026", time: "21:30", homeTeam: "BATMAN PETROL SPOR", awayTeam: "BOLUSPOR", score: "- : -" }
];

export default function MacArsiviPage() {
  const [selectedWeek, setSelectedWeek] = useState<number>(4);
  const [openWinnersMap, setOpenWinnersMap] = useState<{ [key: number]: boolean }>({});

  const currentMatches =
    selectedWeek === 1 ? week1Matches :
    selectedWeek === 2 ? week2Matches :
    selectedWeek === 3 ? week3Matches : week4Matches;

  const toggleWinners = (matchId: number) => {
    setOpenWinnersMap((prev) => ({ ...prev, [matchId]: !prev[matchId] }));
  };

  const isTffMatchCheck = (category: string) => {
    const uppercaseCat = category.toUpperCase();
    return (
      uppercaseCat.includes("TÜRKİYE SÜPER LİG") ||
      uppercaseCat.includes("TÜRKİYE KUPASI") ||
      uppercaseCat.includes("TÜRKİYE 1.LİG") ||
      uppercaseCat.includes("TÜRKİYE SÜPER KUPA") ||
      uppercaseCat.includes("TÜRKİYE KADINLAR SÜPER LİG") ||
      uppercaseCat.includes("TFF 1. LİG")
    );
  };

  const getEliteTheme = (category: string) => {
    const upCat = category.toUpperCase();
    if (upCat.includes("ŞAMPİYONLAR LİGİ")) {
      return {
        bgImg: "url('/cl-bg.png')",
        containerBorder: "border-indigo-500/50",
        containerShadow: "shadow-[0_0_40px_rgba(79,70,229,0.4)]",
        containerBg: "bg-[#050b14]",
        badgeBg: "bg-indigo-900/80",
        badgeText: "text-indigo-200",
        badgeBorder: "border-indigo-500/50",
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
        badgeBg: "bg-orange-900/80",
        badgeText: "text-orange-200",
        badgeBorder: "border-orange-500/50",
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
        badgeBg: "bg-emerald-900/80",
        badgeText: "text-emerald-200",
        badgeBorder: "border-emerald-500/50",
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
        badgeBg: "bg-red-900/80",
        badgeText: "text-red-200",
        badgeBorder: "border-red-500/50",
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
        badgeBg: "bg-blue-900/80",
        badgeText: "text-blue-200",
        badgeBorder: "border-blue-500/50",
        catText: "text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]",
        scoreBorder: "border-blue-600/40",
        colonText: "text-blue-400/50",
        tagText: "text-cyan-300",
        tagBg: "bg-cyan-950/90",
        tagBorder: "border-cyan-400/80",
        bottomBar: "bg-[#050b14]/90 border-blue-900/30"
    };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3 border-b border-slate-800 pb-4">
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight flex items-center justify-center sm:justify-start gap-2">
              📂 MAÇ ARŞİVİ & FİKSTÜR
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              {selectedWeek}. Hafta Müsabakaları ve Programı
            </p>
          </div>
          <div>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg cursor-pointer outline-none transition-all shadow text-xs sm:text-sm"
            >
              <option value={1}>1. HAFTA BÜLTENİ</option>
              <option value={2}>2. HAFTA BÜLTENİ</option>
              <option value={3}>3. HAFTA BÜLTENİ</option>
              <option value={4}>4. HAFTA BÜLTENİ</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentMatches.map((match) => {
            const isWinnersOpen = !!openWinnersMap[match.id];
            const isTffMatch = isTffMatchCheck(match.category);
            const homeLogoUrl = localTeamLogos[match.homeTeam] || "/logos/default.png";
            const awayLogoUrl = localTeamLogos[match.awayTeam] || "/logos/default.png";

            const scoreText = match.score || "- : -";
            const isFinished = scoreText.includes("-") && !scoreText.includes("- : -") && !scoreText.includes("-:-");
            let homeScore = "-";
            let awayScore = "-";
            
            if (isFinished) {
              const parts = scoreText.split("-").map(s => s.trim());
              homeScore = parts[0] || "-";
              awayScore = parts[1] || "-";
            }

            const winnersCount = (match as any).winnersCount || 0;
            const displayPoints = (match as any).earnedPoints || 0;
            const currentWinners = (match as any).winners || [];

            const theme = getEliteTheme(match.category);

            return (
              <div 
                key={match.id} 
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
                      
                      <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded border text-center shadow-sm backdrop-blur-sm flex items-center gap-1.5 ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                        🏆 {match.category}
                      </span>
                      
                      <span className={`${theme.catText} text-[10px] sm:text-[11px] font-semibold tracking-widest mt-0.5 opacity-90`}>
                        {match.date} <span className="opacity-50 mx-1">|</span> {match.time}
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-0 sm:px-4">
                      
                      <div className="flex flex-col items-center justify-center flex-1 gap-1.5 sm:gap-3">
                        <div className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center relative z-20">
                          <img src={homeLogoUrl} alt={match.homeTeam} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
                        </div>
                        <span className="text-white font-extrabold text-[10px] sm:text-[13px] text-center uppercase tracking-wide drop-shadow-lg leading-tight px-1">{match.homeTeam}</span>
                      </div>

                      <div className="flex flex-col items-center justify-center mx-1.5 sm:mx-4 w-20 sm:w-32 z-30">
                        <div className={`w-full bg-[#080d1a]/80 border ${theme.scoreBorder} py-2.5 sm:py-4 rounded-xl flex items-center justify-center gap-1.5 sm:gap-3 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
                          <span className="text-xl sm:text-4xl font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{homeScore}</span>
                          <span className={`text-base sm:text-2xl font-bold ${theme.colonText}`}>:</span>
                          <span className="text-xl sm:text-4xl font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{awayScore}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center flex-1 gap-1.5 sm:gap-3">
                        <div className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center relative z-20">
                          <img src={awayLogoUrl} alt={match.awayTeam} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
                        </div>
                        <span className="text-white font-extrabold text-[10px] sm:text-[13px] text-center uppercase tracking-wide drop-shadow-lg leading-tight px-1">{match.awayTeam}</span>
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
                      <div className="flex flex-wrap gap-1.5 mt-2">
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
      </div>
    </div>
  );
}