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
  "262787": "MUSTAFA TUCİ", "262744": "İLYAS UYGUN", "262712": "MURAT AYDEMİR", "262704": "YAPAY ZEKA",
  "262723": "AYHAN LUŞOĞLU" // 🔴 EKMEL EKSİĞİ: Bu kişi listede yoktu, eklendi!
};

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

const week4Matches = [
  { id: 1, title: "4. HAFTA 1. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME", homeTeam: "STURM GRAZ", awayTeam: "FENERBAHÇE" },
  { id: 2, title: "4. HAFTA 2. MAÇ", category: "UEFA SÜPER KUPA", homeTeam: "PARIS SAINT-GERMAIN", awayTeam: "ASTON VILLA" },
  { id: 3, title: "4. HAFTA 3. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME", homeTeam: "KARABAĞ FK", awayTeam: "DINAMO KIEV" },
  { id: 4, title: "4. HAFTA 4. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME", homeTeam: "BEŞİKTAŞ", awayTeam: "HRADEC KRALOVE" },
  { id: 5, title: "4. HAFTA 5. MAÇ", category: "TÜRKİYE SÜPER LİG", homeTeam: "GALATASARAY", awayTeam: "ÇORUM FK" },
  { id: 6, title: "4. HAFTA 6. MAÇ", category: "TÜRKİYE 1.LİG", homeTeam: "EROKSPOR", awayTeam: "SARIYER" },
  { id: 7, title: "4. HAFTA 7. MAÇ", category: "TÜRKİYE SÜPER LİG", homeTeam: "KASIMPAŞA", awayTeam: "TRABZONSPOR" },
  { id: 8, title: "4. HAFTA 8. MAÇ", category: "TÜRKİYE SÜPER LİG", homeTeam: "KONYASPOR", awayTeam: "ÇAYKUR RİZE" },
  { id: 9, title: "4. HAFTA 9. MAÇ", category: "TÜRKİYE 1.LİG", homeTeam: "FATİH KARAGÜMRÜK", awayTeam: "ÜMRANİYESPOR" },
  { id: 10, title: "4. HAFTA 10. MAÇ", category: "TÜRKİYE 1.LİG", homeTeam: "İSTANBULSPOR", awayTeam: "BODRUMSPOR" },
  { id: 11, title: "4. HAFTA 11. MAÇ", category: "TÜRKİYE SÜPER LİG", homeTeam: "GAZİANTEP FK", awayTeam: "ALANYASPOR" },
  { id: 12, title: "4. HAFTA 12. MAÇ", category: "TÜRKİYE SÜPER LİG", homeTeam: "GENÇLERBİRLİĞİ", awayTeam: "FENERBAHÇE" },
  { id: 13, title: "4. HAFTA 13. MAÇ", category: "TÜRKİYE 1.LİG", homeTeam: "BURSASPOR", awayTeam: "IĞDIR FK" },
  { id: 14, title: "4. HAFTA 14. MAÇ", category: "TÜRKİYE 1.LİG", homeTeam: "MANİSA FK", awayTeam: "VANSPOR FK" },
  { id: 15, title: "4. HAFTA 15. MAÇ", category: "İNGİLTERE SÜPER KUPA", homeTeam: "ARSENAL", awayTeam: "MANCHESTER CITY" },
  { id: 16, title: "4. HAFTA 16. MAÇ", category: "TÜRKİYE SÜPER LİG", homeTeam: "BAŞAKŞEHİR", awayTeam: "KOCAELİSPOR" },
  { id: 17, title: "4. HAFTA 17. MAÇ", category: "TÜRKİYE 1.LİG", homeTeam: "KAYSERİSPOR", awayTeam: "SİVASSPOR" },
  { id: 18, title: "4. HAFTA 18. MAÇ", category: "TÜRKİYE SÜPER LİG", homeTeam: "AMED SPOR", awayTeam: "ERZURUMSPOR" },
  { id: 19, title: "4. HAFTA 19. MAÇ", category: "TÜRKİYE SÜPER LİG", homeTeam: "BEŞİKTAŞ", awayTeam: "EYÜPSPOR" },
  { id: 20, title: "4. HAFTA 20. MAÇ", category: "TÜRKİYE 1.LİG", homeTeam: "KEÇİÖRENGÜCÜ", awayTeam: "PENDİKSPOR" },
  { id: 21, title: "4. HAFTA 21. MAÇ", category: "TÜRKİYE 1.LİG", homeTeam: "MARDİN 1969", awayTeam: "ANTALYASPOR" },
  { id: 22, title: "4. HAFTA 22. MAÇ", category: "TÜRKİYE 1.LİG", homeTeam: "MUĞLASPOR", awayTeam: "BANDIRMASPOR" },
  { id: 23, title: "4. HAFTA 23. MAÇ", category: "TÜRKİYE SÜPER KUPA", homeTeam: "SAMSUNSPOR", awayTeam: "GÖZTEPE" },
  { id: 24, title: "4. HAFTA 24. MAÇ", category: "TÜRKİYE 1.LİG", homeTeam: "BATMAN PETROL SPOR", awayTeam: "BOLUSPOR" }
];

export default function TahminmatikPage() {
  const [selectedMatchId, setSelectedMatchId] = useState<number>(1);
  const selectedMatch = week4Matches.find(m => m.id === selectedMatchId) || week4Matches[0];

  const matchPredictions = Object.entries(week4PredictionsData).map(([id, preds]) => {
    return {
      // 🔴 EKMEL ÇELİK ZIRHI: Liste uyuşmazlığında çökmeyi sonsuza kadar önler
      name: allPlayersList[id] || `Bilinmeyen Oyuncu (${id})`,
      prediction: preds[selectedMatchId - 1] || "-"
    };
  }).sort((a, b) => a.name.localeCompare(b.name, 'tr'));

  const predictionCounts = matchPredictions.reduce((acc, curr) => {
    if (curr.prediction !== "-") {
      acc[curr.prediction] = (acc[curr.prediction] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedStats = Object.entries(predictionCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 text-slate-100 min-h-screen">
      
      <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-xl mb-8">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-black text-amber-400 tracking-tight uppercase flex items-center justify-center md:justify-start gap-2">
            ⚡ 4. HAFTA TAHMİNMATİK
          </h1>
          <p className="text-slate-400 text-sm mt-1">Yarışmacıların maç bazlı tahmin analizleri</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <label className="text-[10px] text-amber-500 font-bold mb-1 ml-1 uppercase">MAÇ SEÇİN</label>
            <select 
              value={selectedMatchId} 
              onChange={(e) => setSelectedMatchId(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 transition-colors shadow-inner w-64 sm:w-80 cursor-pointer"
            >
              {week4Matches.map(m => (
                <option key={m.id} value={m.id}>MAÇ {m.id} | {m.homeTeam} - {m.awayTeam}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-center items-center text-center">
           <h3 className="text-slate-400 text-xs font-bold tracking-widest mb-3 uppercase border-b border-slate-800 pb-2 w-full">SEÇİLİ MAÇ</h3>
           <div className="text-xl font-black text-white">{selectedMatch.homeTeam}</div>
           <div className="text-amber-500 font-black my-1">VS</div>
           <div className="text-xl font-black text-white">{selectedMatch.awayTeam}</div>
           <div className="mt-4 bg-slate-950 px-4 py-1.5 rounded-lg border border-slate-800 text-[10px] text-slate-400 uppercase tracking-widest">
             {selectedMatch.category}
           </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
           <h3 className="text-slate-400 text-xs font-bold tracking-widest mb-4 uppercase border-b border-slate-800 pb-2">📊 TAHMİN İSTATİSTİKLERİ (TÜM YARIŞMACILAR)</h3>
           <div className="flex flex-wrap gap-3">
             {sortedStats.length > 0 ? (
               sortedStats.map(([score, count], idx) => (
                 <div key={score} className={`flex items-center gap-3 px-4 py-2 rounded-xl border shadow-sm ${idx === 0 ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-950 border-slate-700'}`}>
                    <span className={`text-lg font-black ${idx === 0 ? 'text-amber-400' : 'text-slate-300'}`}>{score}</span>
                    <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded font-bold">{count} KİŞİ</span>
                 </div>
               ))
             ) : (
               <span className="text-slate-500 text-sm">Bu maç için henüz tahmin girilmemiş.</span>
             )}
           </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-sm font-extrabold text-white tracking-wide uppercase">
            YARIŞMACI TAHMİNLERİ
          </h2>
          <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700">
            {matchPredictions.length} KİŞİ
          </span>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {matchPredictions.map((mp, idx) => (
            <div key={idx} className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center hover:bg-slate-800/40 transition-colors">
               <span className="text-xs font-semibold text-slate-300 truncate pr-2" title={mp.name}>{mp.name}</span>
               <span className="bg-slate-900 border border-slate-700 text-amber-400 font-black text-sm px-3 py-1 rounded-lg shadow-inner min-w-[50px] text-center">
                 {mp.prediction}
               </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}