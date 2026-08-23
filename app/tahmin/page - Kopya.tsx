'use client';

import React, { useState } from 'react';

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
  "262787": "MUSTAFA TUCİ", "262744": "İLYAS UYGUN", "262712": "MURAT AYDEMİR", "262704": "YAPAY ZEKA"
};

const sortedPlayers = Object.entries(allPlayersList).sort((a, b) => a[1].localeCompare(b[1], 'tr'));

const week4MatchesList = [
  { id: 1, title: "STURM GRAZ VS FENERBAHÇE", cat: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR RÖVANŞ", date: "11 AĞUSTOS SALI | 21:30" },
  { id: 2, title: "PARIS SAINT-GERMAIN VS ASTON VILLA", cat: "UEFA SÜPER KUPA", date: "12 AĞUSTOS ÇARŞAMBA | 22:00" },
  { id: 3, title: "KARABAĞ FK VS DINAMO KIEV", cat: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR RÖVANŞ", date: "13 AĞUSTOS PERŞEMBE | 19:00" },
  { id: 4, title: "BEŞİKTAŞ VS HRADEC KRALOVE", cat: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR RÖVANŞ", date: "13 AĞUSTOS PERŞEMBE | 20:00" },
  { id: 5, title: "GALATASARAY VS ÇORUM FK", cat: "TÜRKİYE SÜPER LİG", date: "14 AĞUSTOS CUMA | 21:30" },
  { id: 6, title: "EROKSPOR VS SARIYER", cat: "TÜRKİYE 1.LİG", date: "14 AĞUSTOS CUMA | 21:30" },
  { id: 7, title: "KASIMPAŞA VS TRABZONSPOR", cat: "TÜRKİYE SÜPER LİG", date: "15 AĞUSTOS CUMARTESİ | 19:00" },
  { id: 8, title: "KONYASPOR VS ÇAYKUR RİZE", cat: "TÜRKİYE SÜPER LİG", date: "15 AĞUSTOS CUMARTESİ | 19:00" },
  { id: 9, title: "FATİH KARAGÜMRÜK VS ÜMRANİYESPOR", cat: "TÜRKİYE 1.LİG", date: "15 AĞUSTOS CUMARTESİ | 19:00" },
  { id: 10, title: "İSTANBULSPOR VS BODRUMSPOR", cat: "TÜRKİYE 1.LİG", date: "15 AĞUSTOS CUMARTESİ | 19:00" },
  { id: 11, title: "GAZİANTEP FK VS ALANYASPOR", cat: "TÜRKİYE SÜPER LİG", date: "15 AĞUSTOS CUMARTESİ | 21:30" },
  { id: 12, title: "GENÇLERBİRLİĞİ VS FENERBAHÇE", cat: "TÜRKİYE SÜPER LİG", date: "15 AĞUSTOS CUMARTESİ | 21:30" },
  { id: 13, title: "BURSASPOR VS IĞDIR FK", cat: "TÜRKİYE 1.LİG", date: "15 AĞUSTOS CUMARTESİ | 21:30" },
  { id: 14, title: "MANİSA FK VS VANSPOR FK", cat: "TÜRKİYE 1.LİG", date: "15 AĞUSTOS CUMARTESİ | 21:30" },
  { id: 15, title: "ARSENAL VS MANCHESTER CITY", cat: "İNGİLTERE SÜPER KUPA", date: "16 AĞUSTOS PAZAR | 17:00" },
  { id: 16, title: "BAŞAKŞEHİR VS KOCAELİSPOR", cat: "TÜRKİYE SÜPER LİG", date: "16 AĞUSTOS PAZAR | 19:00" },
  { id: 17, title: "KAYSERİSPOR VS SİVASSPOR", cat: "TÜRKİYE 1.LİG", date: "16 AĞUSTOS PAZAR | 19:00" },
  { id: 18, title: "AMED SPOR VS ERZURUMSPOR", cat: "TÜRKİYE SÜPER LİG", date: "16 AĞUSTOS PAZAR | 21:30" },
  { id: 19, title: "BEŞİKTAŞ VS EYÜPSPOR", cat: "TÜRKİYE SÜPER LİG", date: "16 AĞUSTOS PAZAR | 21:30" },
  { id: 20, title: "KEÇİÖRENGÜCÜ VS PENDİKSPOR", cat: "TÜRKİYE 1.LİG", date: "16 AĞUSTOS PAZAR | 19:00" },
  { id: 21, title: "MARDİN 1969 VS ANTALYASPOR", cat: "TÜRKİYE 1.LİG", date: "16 AĞUSTOS PAZAR | 21:30" },
  { id: 22, title: "MUĞLASPOR VS BANDIRMASPOR", cat: "TÜRKİYE 1.LİG", date: "16 AĞUSTOS PAZAR | 21:30" },
  { id: 23, title: "SAMSUNSPOR VS GÖZTEPE", cat: "TÜRKİYE SÜPER KUPA", date: "17 AĞUSTOS PAZARTESİ | 21:30" },
  { id: 24, title: "BATMAN PETROL SPOR VS BOLUSPOR", cat: "TÜRKİYE 1.LİG", date: "17 AĞUSTOS PAZARTESİ | 21:30" }
];

// 🔴 EKMEL - EKSİKSİZ 47 KİŞİLİK 4. HAFTA TAHMİN MATRİSİ (YUSUF ERBAY DAHİL)
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

export default function TahminlerPage() {
  const [selectedWeek, setSelectedWeek] = useState<number>(4);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("262728"); // Önder Aslan Default

  const getMatchPrediction = (matchIndex: number) => {
    if (selectedWeek !== 4) return "-";
    const preds = week4PredictionsData[selectedPlayer];
    if (!preds || !preds[matchIndex]) return "-";
    return preds[matchIndex];
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 text-slate-100 min-h-screen">
      
      <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-xl mb-8">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-black text-amber-400 tracking-tight uppercase">KATILIMCI TAHMİNLERİ</h1>
          <p className="text-slate-400 text-sm mt-1">{selectedWeek}. Hafta maç bülteni ve oyuncu tahmin matrisi</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <label className="text-[10px] text-amber-500 font-bold mb-1 ml-1 uppercase">HAFTA SEÇİN</label>
            <select 
              value={selectedWeek} 
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 transition-colors shadow-inner"
            >
              <option value={1}>1. HAFTA</option>
              <option value={2}>2. HAFTA</option>
              <option value={3}>3. HAFTA</option>
              <option value={4}>4. HAFTA</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] text-amber-500 font-bold mb-1 ml-1 uppercase">YARIŞMACI SEÇİN</label>
            <select 
              value={selectedPlayer} 
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 transition-colors shadow-inner w-48 sm:w-64"
            >
              {sortedPlayers.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        
        <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-extrabold text-white tracking-wide uppercase">
            {allPlayersList[selectedPlayer]} - MAÇ TAHMİNLERİ
          </h2>
          <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700">
            {selectedWeek}. HAFTA
          </span>
        </div>

        <div className="p-4 flex flex-col gap-3">
          {selectedWeek === 4 ? (
            week4MatchesList.map((match, idx) => (
              <div key={match.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-950/50 hover:bg-slate-800/40 rounded-xl border border-slate-800/80 transition-colors gap-4">
                <div className="flex-1">
                  <div className="text-[10px] sm:text-xs text-slate-400 font-semibold mb-1">
                    MAÇ #{match.id} • {match.cat} • {match.date}
                  </div>
                  <div className="text-sm sm:text-base font-black text-slate-200 tracking-wide">
                    {match.title.split('VS')[0]} <span className="text-amber-500 mx-1">VS</span> {match.title.split('VS')[1]}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 flex items-center justify-center min-w-[120px] shadow-inner">
                  <span className="text-slate-400 text-xs font-semibold mr-2">Tahmin:</span>
                  <span className="text-amber-400 font-black text-lg">{getMatchPrediction(idx)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-500 font-medium">⏳ {selectedWeek}. Haftanın detaylı tahminleri arşivde bulunamadı. Lütfen 4. Haftayı seçin.</div>
          )}
        </div>
      </div>
    </div>
  );
}