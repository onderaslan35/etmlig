'use client';

import React, { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from '@/utils/supabase';

// 🔴 ANA YARIŞMACI LİSTESİ 🔴
const staticPlayersList: Record<string, string> = {
  "262701": "MUHAMMET OKUMUŞ", "262702": "MURAT KARA", "262703": "CEMALETTİN BELLİ", "262704": "YAPAY ZEKA", "262705": "AHMET BİRCAN 🏆",
  "262706": "GAZİ AYAN 🏆🏆", "262707": "HAKAN AYAN", "262708": "BAYRAM YILMAZ", "262709": "SALİH KARACAOĞLU", "262710": "MUZAFFER ERTUĞRUL",
  "262711": "RIDVAN DOGER", "262712": "MURAT AYDEMİR", "262713": "VAHİT KÜLCÜ", "262714": "İSMAİL EKER 🏆", "262715": "ŞEMSETTIN DÜGER",
  "262716": "BİROL DEMİREL", "262717": "MURAT ALİ", "262718": "BEKİR KARADAĞ", "262719": "UĞUR VARDAR", "262720": "HASAN ASLAN",
  "262721": "MUSTAFA GÜMÜŞÇÜ", "262722": "MUSTAFA ERKAN", "262723": "AYHAN LUŞOĞLU", "262724": "YÜCEL TOMAK", "262725": "İLYAS KAZDAL",
  "262726": "HUDAVER TOPARDIC", "262727": "YAHŞİ ERKAN🏆", "262728": "ÖNDER ASLAN", "262729": "HAKAN GÜN", "262730": "ÖNDER IŞIK",
  "262731": "FATİH AYAN", "262732": "R. İLHAN KARACA 🏆🏆", "262733": "MUHSİN ASİLKAN", "262734": "LEVENT YILDIRIM", "262735": "AYGÜN AKKEÇELİ",
  "262736": "MEHMET ALİ KARA", "262737": "ŞAHİN GEZGİNCİ", "262738": "MEVLÜT EVLER", "262739": "UĞUR GÜRBÜZ", "262740": "ABDULLAH DİK",
  "262741": "SABAHATTİN ÇAYLAK", "262742": "ZEKERiYYA TOPKAYYA", "262743": "MEHMET ALİ ŞAHİN", "262744": "İLYAS UYGUN", "262745": "OĞUZ YILDIRIMKAYA",
  "262746": "MEHMET BAYIR", "262747": "SAVAŞ ÇAĞLAYAN", "262748": "YASİN ŞAHİN", "262749": "B.VEYSELOĞLU EROL", "262750": "MAHMUT CBR",
  "262751": "HÜSEYİN ERBAŞ", "262810": "ADEM BULUT ERTÜRK", "262753": "YUSUF KIZILTUĞ", "262754": "OSMAN ALİ AYDIN 🏆", "262755": "DOĞAÇ ALKAN",
  "262756": "EYÜP KARACAOĞLU", "262813": "KEMAL ERSOY", "262758": "MELİH PINAR", "262762": "İLHAN DANIŞ", "262763": "MUSTAFA ELMAS",
  "262770": "OZKAYA MAZAKALI BAYRAM", "262771": "ULAŞ ADIGÜZEL", "262772": "CEMAL SİVRİKAYA 🏆", "262760": "UĞUR NES", "262774": "ŞENOL CAN ÇAKICI",
  "262776": "CUMA OKUR", "262777": "MİRAÇ TOPAL", "262778": "CENGİZ SAYAN", "262780": "YUSUF KILIÇ", "262781": "KADİR SOLMAZ",
  "262782": "YUSUF ERBAY", "262783": "YASİN AYAN", "262784": "MEHMET AVCI", "262785": "METE BÜYÜKGÖL 🏆", "262786": "SEDAT DİŞLİ",
  "262787": "MUSTAFA TUCİ", "262788": "HAKAN ÇİFTÇİ", "262789": "ALİ ABUKAN", "262790": "CUMALİ SÖKER", "351925": "ALİOS GÖZTEPE",
  "350909": "DİNÇER ÖZER", "262815": "MURAT KAYA", "262816": "SEDAT SEDAT", "262795": "SEFA İÇA", "262796": "D. SERGEN TAŞYÜREK",
  "262797": "ÖMER DOGER"
};

const week4Matches = [
  { id: 1, weekLabel: "4. Hafta - 1. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR RÖVANŞ MAÇI", date: "11.08.2026", time: "21:30", homeTeam: "STURM GRAZ", awayTeam: "FENERBAHÇE" },
  { id: 2, weekLabel: "4. Hafta - 2. MAÇ", category: "UEFA SÜPER KUPA", date: "12.08.2026", time: "22:00", homeTeam: "PARIS SG", awayTeam: "ASTON VILLA" },
  { id: 3, weekLabel: "4. Hafta - 3. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR RÖVANŞ", date: "13.08.2026", time: "19:00", homeTeam: "KARABAĞ FK", awayTeam: "DINAMO KIEV" },
  { id: 4, weekLabel: "4. Hafta - 4. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR RÖVANŞ", date: "13.08.2026", time: "20:00", homeTeam: "BEŞİKTAŞ", awayTeam: "HRADEC KRALOVE" },
  { id: 5, weekLabel: "4. Hafta - 5. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "14.08.2026", time: "21:30", homeTeam: "GALATASARAY", awayTeam: "ÇORUM FK" },
  { id: 6, weekLabel: "4. Hafta - 6. MAÇ", category: "TÜRKİYE 1.LİG", date: "14.08.2026", time: "21:30", homeTeam: "EROKSPOR", awayTeam: "SARIYER" },
  { id: 7, weekLabel: "4. Hafta - 7. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "19:00", homeTeam: "KASIMPAŞA", awayTeam: "TRABZONSPOR" },
  { id: 8, weekLabel: "4. Hafta - 8. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "19:00", homeTeam: "KONYASPOR", awayTeam: "ÇAYKUR RİZE" },
  { id: 9, weekLabel: "4. Hafta - 9. MAÇ", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "19:00", homeTeam: "FATİH KARAGÜMRÜK", awayTeam: "ÜMRANİYESPOR" },
  { id: 10, weekLabel: "4. Hafta - 10. MAÇ", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "19:00", homeTeam: "İSTANBULSPOR", awayTeam: "BODRUMSPOR" },
  { id: 11, weekLabel: "4. Hafta - 11. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "21:30", homeTeam: "GAZİANTEP FK", awayTeam: "ALANYASPOR" },
  { id: 12, weekLabel: "4. Hafta - 12. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "21:30", homeTeam: "GENÇLERBİRLİĞİ", awayTeam: "FENERBAHÇE" },
  { id: 13, weekLabel: "4. Hafta - 13. MAÇ", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "21:30", homeTeam: "BURSASPOR", awayTeam: "IĞDIR FK" },
  { id: 14, weekLabel: "4. Hafta - 14. MAÇ", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "21:30", homeTeam: "MANİSA FK", awayTeam: "VANSPOR FK" },
  { id: 15, weekLabel: "4. Hafta - 15. MAÇ", category: "İNGİLTERE SÜPER KUPA", date: "16.08.2026", time: "17:00", homeTeam: "ARSENAL", awayTeam: "MANCHESTER CITY" },
  { id: 16, weekLabel: "4. Hafta - 16. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "16.08.2026", time: "19:00", homeTeam: "BAŞAKŞEHİR", awayTeam: "KOCAELİSPOR" },
  { id: 17, weekLabel: "4. Hafta - 17. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "19:00", homeTeam: "KAYSERİSPOR", awayTeam: "SİVASSPOR" },
  { id: 18, weekLabel: "4. Hafta - 18. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "16.08.2026", time: "21:30", homeTeam: "AMED SPOR", awayTeam: "ERZURUMSPOR" },
  { id: 19, weekLabel: "4. Hafta - 19. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "16.08.2026", time: "21:30", homeTeam: "BEŞİKTAŞ", awayTeam: "EYÜPSPOR" },
  { id: 20, weekLabel: "4. Hafta - 20. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "19:00", homeTeam: "KEÇİÖRENGÜCÜ", awayTeam: "PENDİKSPOR" },
  { id: 21, weekLabel: "4. Hafta - 21. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "21:30", homeTeam: "MARDİN 1969", awayTeam: "ANTALYASPOR" },
  { id: 22, weekLabel: "4. Hafta - 22. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "21:30", homeTeam: "MUĞLASPOR", awayTeam: "BANDIRMASPOR" },
  { id: 23, weekLabel: "4. Hafta - 23. MAÇ", category: "TÜRKİYE SÜPER KUPA", date: "17.08.2026", time: "21:30", homeTeam: "SAMSUNSPOR", awayTeam: "GÖZTEPE" },
  { id: 24, weekLabel: "4. Hafta - 24. MAÇ", category: "TÜRKİYE 1.LİG", date: "17.08.2026", time: "21:30", homeTeam: "BATMAN PETROL SPOR", awayTeam: "BOLUSPOR" }
];

const week4PredictionsData: Record<string, string[]> = {
  "262731": ["1-1", "3-1", "1-1", "2-0", "3-0", "2-2", "1-3", "1-1", "2-1", "1-2", "1-0", "1-3", "2-1", "1-2", "2-2", "2-1", "2-1", "1-1", "3-1", "1-1", "1-1", "1-1", "1-1", "2-1"], "262758": ["1-2", "3-0", "2-0", "3-0", "4-1", "1-1", "1-3", "1-1", "1-1", "0-2", "2-1", "0-3", "3-0", "1-1", "2-1", "2-1", "3-0", "3-0", "3-0", "1-1", "0-3", "1-1", "1-2", "3-0"], "262763": ["1-1", "1-1", "1-1", "2-0", "4-0", "1-1", "0-2", "1-0", "1-0", "1-1", "1-1", "1-1", "1-1", "2-0", "1-1", "1-1", "1-1", "1-0", "3-0", "1-1", "1-1", "1-1", "1-1", "1-0"], "262744": ["1-2", "3-1", "1-1", "2-0", "4-0", "2-0", "1-2", "1-1", "1-0", "0-0", "2-2", "0-4", "2-0", "2-0", "1-2", "2-1", "0-1", "0-2", "2-0", "0-1", "0-2", "0-2", "1-1", "0-1"], "262813": ["1-2", "4-1", "1-0", "3-2", "2-0", "2-0", "1-3", "1-1", "3-0", "2-2", "1-2", "0-4", "1-1", "2-2", "2-0", "1-0", "2-0", "1-2", "2-0", "1-2", "1-3", "0-0", "0-1", "1-2"], "351925": ["0-2", "0-0", "2-1", "1-0", "3-0", "0-0", "0-2", "0-0", "0-0", "0-0", "0-0", "0-3", "2-1", "0-0", "2-0", "2-1", "0-0", "0-2", "2-0", "0-0", "0-2", "0-0", "0-2", "0-0"], "262732": ["2-1", "2-1", "1-0", "1-1", "2-0", "3-1", "2-2", "2-1", "2-0", "1-1", "1-1", "0-3", "2-0", "1-1", "2-1", "0-1", "1-1", "1-1", "2-1", "1-2", "0-2", "0-2", "2-1", "1-0"], "262754": ["1-1", "1-0", "1-0", "2-0", "3-0", "1-0", "0-2", "1-0", "1-0", "0-2", "1-0", "0-3", "2-0", "1-0", "1-2", "1-0", "1-0", "1-1", "2-0", "1-0", "0-1", "0-1", "1-0", "1-0"], "262733": ["2-1", "3-1", "0-0", "3-0", "2-0", "0-1", "1-4", "2-0", "0-0", "1-0", "1-1", "0-3", "2-0", "2-1", "2-1", "2-0", "1-1", "1-0", "3-0", "1-1", "0-1", "1-1", "3-1", "1-0"], "262774": ["0-1", "2-0", "1-0", "2-0", "3-1", "1-1", "0-2", "1-1", "1-2", "1-2", "1-1", "0-2", "1-0", "0-0", "2-0", "0-0", "1-2", "2-1", "2-0", "1-1", "0-2", "0-0", "3-1", "0-2"], "262771": ["2-2", "3-1", "2-1", "4-0", "5-0", "1-1", "1-3", "1-1", "2-2", "1-1", "2-1", "1-4", "3-1", "3-0", "2-1", "1-0", "1-1", "3-1", "3-1", "1-3", "1-1", "1-1", "1-1", "2-1"], "262730": ["0-3", "3-0", "1-0", "3-1", "2-0", "1-1", "0-2", "0-1", "0-0", "0-1", "0-2", "0-3", "2-0", "2-1", "0-2", "2-0", "1-1", "1-2", "3-0", "0-1", "0-2", "0-0", "1-1", "2-1"], "262707": ["0-4", "3-0", "2-1", "1-1", "1-0", "0-0", "0-2", "0-0", "2-1", "0-2", "0-0", "0-4", "1-0", "0-0", "0-0", "0-0", "0-0", "0-0", "2-0", "1-0", "0-2", "0-0", "0-0", "0-2"], "262816": ["0-1", "3-1", "0-2", "1-0", "2-0", "0-0", "0-3", "1-1", "3-0", "0-2", "0-0", "0-2", "3-0", "0-2", "2-0", "1-1", "2-1", "1-3", "3-0", "0-0", "0-2", "0-3", "2-0", "0-1"], "262719": ["2-1", "2-1", "2-0", "2-1", "3-0", "2-1", "0-2", "3-1", "2-1", "1-1", "1-2", "0-2", "3-0", "2-1", "2-1", "1-1", "1-2", "2-1", "3-0", "2-1", "1-1", "2-1", "1-2", "2-0"], "262725": ["0-2", "2-0", "1-1", "3-0", "3-0", "1-0", "0-2", "1-1", "2-0", "2-1", "2-1", "0-2", "2-0", "0-0", "1-1", "1-0", "2-0", "1-0", "2-0", "0-1", "0-2", "1-0", "1-0", "0-1"], "262711": ["0-1", "3-1", "1-0", "3-0", "3-0", "2-1", "0-4", "0-0", "1-1", "1-3", "1-1", "1-2", "2-2", "1-0", "1-1", "2-1", "0-0", "2-1", "3-0", "0-0", "1-1", "1-2", "2-2", "2-0"], "262718": ["1-2", "4-1", "3-1", "3-0", "4-1", "1-1", "1-3", "2-2", "2-1", "1-1", "1-2", "1-3", "2-0", "2-1", "2-2", "2-1", "2-2", "1-1", "3-1", "2-2", "1-2", "1-3", "2-2", "1-2"], "262721": ["0-1", "2-0", "1-0", "3-1", "2-1", "0-2", "0-3", "2-1", "2-0", "1-2", "1-1", "0-3", "3-1", "1-1", "0-1", "0-2", "0-1", "0-2", "2-0", "0-2", "0-3", "0-1", "2-2", "0-1"], "262726": ["1-3", "2-2", "2-2", "3-0", "4-0", "1-1", "1-2", "2-1", "1-1", "1-1", "1-2", "0-3", "1-1", "2-1", "0-2", "0-2", "2-0", "1-1", "2-0", "3-1", "2-2", "0-2", "1-0", "2-1"], "262702": ["0-2", "1-0", "1-1", "3-1", "2-0", "1-0", "0-2", "0-1", "0-0", "0-1", "1-0", "0-3", "2-0", "1-0", "0-1", "1-0", "1-0", "2-0", "3-0", "1-1", "0-0", "0-1", "0-0", "2-0"], "262738": ["1-1", "2-1", "1-1", "1-0", "3-0", "2-1", "1-3", "2-1", "2-1", "1-1", "2-1", "1-3", "2-0", "1-1", "2-2", "2-1", "2-1", "1-1", "2-0", "2-1", "1-1", "1-1", "2-1", "1-1"], "262750": ["1-1", "3-1", "2-2", "3-1", "3-0", "1-1", "1-3", "2-1", "0-0", "1-2", "2-2", "0-3", "3-1", "2-0", "2-2", "0-0", "1-1", "0-2", "3-1", "0-2", "0-3", "1-2", "1-3", "2-0"], "262705": ["1-3", "3-1", "2-1", "3-1", "3-1", "3-0", "1-3", "1-2", "3-1", "1-2", "1-2", "0-3", "2-0", "3-0", "2-1", "2-1", "2-0", "2-0", "4-0", "3-1", "0-1", "0-2", "1-2", "1-1"], "262706": ["0-2", "4-1", "1-0", "3-0", "2-0", "0-2", "0-2", "0-0", "0-0", "0-1", "0-0", "0-2", "0-2", "0-0", "0-1", "0-0", "0-0", "0-1", "2-0", "2-1", "0-2", "0-2", "0-0", "2-0"], "262716": ["1-1", "3-2", "1-0", "3-1", "3-0", "3-1", "0-3", "0-0", "3-1", "0-2", "1-1", "0-4", "2-0", "3-1", "1-1", "3-0", "2-1", "1-1", "4-0", "2-1", "0-2", "0-2", "1-1", "1-2"], "262736": ["1-2", "2-1", "1-2", "3-0", "4-0", "2-1", "2-4", "3-1", "2-2", "2-2", "3-2", "1-1", "3-1", "3-0", "1-1", "4-1", "2-1", "2-1", "1-0", "2-1", "1-1", "1-1", "1-1", "3-0"], "262714": ["1-3", "2-0", "0-2", "0-0", "2-0", "0-1", "1-1", "0-0", "2-0", "0-1", "2-0", "0-3", "1-1", "0-1", "1-1", "0-0", "0-0", "1-0", "1-0", "0-0", "1-0", "1-1", "0-1", "0-1"], "262749": ["2-1", "3-1", "2-0", "3-0", "3-1", "2-2", "1-2", "2-1", "2-0", "2-0", "2-2", "1-3", "2-1", "2-1", "2-1", "1-1", "2-1", "1-1", "2-1", "2-1", "0-2", "1-2", "2-2", "1-1"], "262753": ["1-1", "2-1", "2-0", "3-0", "1-1", "1-0", "3-2", "1-1", "1-0", "2-2", "2-2", "0-3", "2-0", "1-2", "1-1", "1-1", "1-1", "0-1", "2-0", "1-1", "1-2", "1-1", "0-2", "1-1"], "262740": ["1-2", "1-1", "2-1", "2-0", "3-0", "1-2", "1-3", "1-1", "2-2", "1-1", "2-1", "1-3", "3-0", "1-1", "2-2", "2-1", "1-1", "1-2", "3-1", "2-1", "1-2", "2-1", "2-2", "1-1"], "262790": ["0-2", "3-1", "0-2", "0-2", "4-0", "0-2", "0-3", "3-1", "1-1", "2-0", "1-1", "0-3", "3-1", "2-1", "0-3", "2-1", "1-1", "2-0", "2-1", "1-0", "2-1", "1-1", "0-2", "0-2"], "262786": ["1-2", "3-1", "3-1", "3-0", "2-1", "1-1", "1-2", "1-1", "1-2", "2-0", "2-1", "1-1", "3-1", "2-0", "1-1", "1-2", "1-1", "1-1", "3-1", "2-1", "2-0", "1-2", "1-2", "1-1"], "262734": ["3-0", "4-1", "2-1", "3-1", "4-1", "2-1", "1-2", "3-2", "2-1", "3-2", "3-1", "2-1", "3-0", "2-3", "1-2", "3-1", "2-1", "3-2", "4-1", "3-1", "2-1", "3-1", "2-1", "3-1"], "262756": ["2-2", "3-2", "2-0", "4-2", "1-2", "1-2", "1-3", "1-2", "0-0", "0-0", "2-1", "1-3", "2-2", "1-2", "1-2", "1-2", "0-0", "0-0", "2-0", "0-0", "2-2", "0-1", "1-1", "1-3"], "262703": ["2-2", "1-1", "1-1", "2-1", "1-0", "1-1", "1-3", "2-2", "0-1", "0-0", "1-1", "0-2", "0-0", "0-0", "2-2", "1-1", "1-1", "0-0", "2-1", "1-1", "0-1", "1-1", "2-2", "0-0"], "262772": ["0-2", "2-0", "1-1", "1-1", "1-0", "0-0", "0-1", "0-0", "1-0", "1-2", "2-3", "0-3", "2-0", "1-1", "1-1", "1-0", "0-1", "1-0", "2-1", "1-1", "0-0", "0-1", "0-0", "0-1"], "262717": ["1-2", "0-1", "1-1", "2-2", "2-2", "2-0", "0-2", "1-2", "0-0", "0-2", "0-1", "0-2", "2-0", "1-2", "1-1", "1-0", "1-2", "0-0", "2-1", "1-0", "1-1", "3-2", "1-2", "0-0"], "262728": ["0-0", "0-0", "1-0", "2-1", "4-1", "0-1", "0-2", "1-1", "0-1", "0-0", "1-0", "0-5", "4-0", "2-0", "2-3", "1-2", "0-0", "0-0", "3-0", "0-0", "0-2", "0-1", "0-2", "0-0"], "262770": ["3-1", "3-1", "2-2", "2-0", "2-1", "1-1", "1-3", "0-2", "2-0", "0-3", "0-1", "0-4", "2-1", "1-1", "2-1", "2-0", "1-1", "1-0", "3-0", "2-3", "0-2", "1-2", "0-2", "3-1"], "262755": ["1-2", "4-1", "3-2", "2-1", "3-2", "1-1", "3-3", "2-1", "1-0", "0-1", "1-1", "0-2", "1-1", "3-0", "1-2", "4-2", "3-1", "2-2", "1-0", "2-2", "1-0", "3-2", "1-0", "3-1"], "262704": ["1-1", "2-1", "1-1", "2-0", "3-0", "0-1", "1-2", "2-1", "1-0", "0-1", "1-1", "1-3", "1-0", "2-0", "2-1", "2-0", "1-1", "1-1", "2-1", "1-1", "1-2", "0-2", "2-1", "1-1"], "262747": ["1-1", "2-0", "1-0", "2-0", "2-0", "1-1", "1-2", "1-1", "1-1", "1-1", "1-1", "1-3", "1-1", "1-1", "1-1", "1-1", "1-1", "1-1", "2-0", "1-1", "1-1", "1-1", "1-1", "1-1"], "262723": ["1-1", "3-1", "2-1", "2-0", "3-0", "1-2", "1-2", "2-1", "2-0", "1-2", "1-1", "2-1", "3-1", "3-0", "2-1", "1-1", "2-1", "1-1", "2-1", "1-1", "0-2", "0-2", "1-1", "2-0"], "262709": ["1-1", "2-1", "2-1", "2-0", "3-0", "1-1", "1-2", "1-1", "1-0", "1-0", "2-1", "0-2", "2-1", "2-0", "1-1", "1-0", "1-1", "2-1", "2-1", "1-1", "0-3", "0-2", "1-2", "1-0"],
  "262782": ["0-2", "0-0", "0-1", "1-0", "1-0", "0-0", "0-4", "1-0", "0-1", "0-0", "0-1", "0-3", "0-0", "0-0", "0-1", "0-0", "0-0", "0-0", "3-1", "0-0", "0-1", "0-0", "0-0", "0-0"],
  "262739": ["1-0", "3-1", "1-1", "3-0", "3-1", "0-1", "1-2", "3-1", "2-0", "2-0", "2-1", "1-2", "3-0", "2-0", "2-1", "3-2", "1-0", "1-0", "2-0", "1-1", "0-1", "1-1", "1-2", "1-0"]
};

// 🚀 BUGÜNÜN TARİHİNİ ALAN YARDIMCI FONKSİYON (GÜNLÜK KARANTİNA İÇİN)
const getTodayDateString = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

const generateTimeOptions = () => {
  const times = ["00:00"];
  for (let h = 23; h >= 12; h--) {
      for (let m = 45; m >= 0; m -= 15) {
          times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
  }
  return times;
};
const timeOptionsArr = generateTimeOptions();

const generateWeekDates = (weekNum: number) => {
  const baseDate = new Date(2026, 7, 18);
  const diffDays = (weekNum - 5) * 7;
  baseDate.setDate(baseDate.getDate() + diffDays);
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      dates.push(`${day}.${month}.${year}`);
  }
  return dates;
};

const getUniqueMatchId = (week: number, index: number) => {
    if (week === 4) return index; 
    return (week * 100) + index;
};

export default function AdminRadarPortal() {
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'master' | 'skorcum01' | 'skorcum06' | 'skorcum34' | null>(null);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'live' | 'bulletin' | 'predictions' | 'players' | 'teams'>('live');
  const [mergedPlayers, setMergedPlayers] = useState<Record<string, string>>(staticPlayersList);

  const [dbPlayersList, setDbPlayersList] = useState<any[]>([]);
  const [newPlayerId, setNewPlayerId] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPass, setNewPlayerPass] = useState('');
  const [isPlayerLoading, setIsPlayerLoading] = useState(false);

  const [dbTeamsList, setDbTeamsList] = useState<any[]>([]);
  const [teamLogosMap, setTeamLogosMap] = useState<Record<string, string>>({});
  const [leagueTeamsMap, setLeagueTeamsMap] = useState<Record<string, string[]>>({});
  
  const [dynamicCategoriesList, setDynamicCategoriesList] = useState<string[]>([]);
  
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamLeague, setNewTeamLeague] = useState('');
  const [newTeamLogo, setNewTeamLogo] = useState('');
  const [isTeamLoading, setIsTeamLoading] = useState(false);

  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const previousScoresRef = useRef<Record<string, number>>({});

  // 🚀 SKORCU DİSİPLİN KONTROL STATE'LERİ
  const [skorcuStatusMap, setSkorcuStatusMap] = useState<Record<string, boolean>>({
     'skorcum01': true,
     'skorcum06': true,
     'skorcum34': true
  });

  // 🚀 MANKOMAN AKILLI FİLTRE STATE'İ
  const [showOnlyToday, setShowOnlyToday] = useState<boolean>(false);

  const defaultCategoriesList = [
    "TÜRKİYE SÜPER LİG", "TÜRKİYE 1.LİG", "TÜRKİYE 2.LİG", "TÜRKİYE 3.LİG", "TÜRKİYE KUPASI", "TÜRKİYE SÜPER KUPA", "TÜRKİYE KADINLAR SÜPER LİG", "AMATÖR LİG",
    "İNGİLTERE PREMIER LİG", "ALMANYA BUNDESLIGA", "FRANSA LIGUE 1", "İTALYA SERIE A", "İSPANYA LA LIGA",
    "UEFA ŞAMPİYONLAR LİGİ GURUP AŞAMASI", "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR İLK MAÇ", "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    "UEFA Ş.L. ÖN ELEME 3.TUR İLK MAÇ", "UEFA Ş.L. ÖN ELEME 3.TUR RÖVANŞ", "UEFA Ş.L. PLAY OFF İLK MAÇ", "UEFA Ş.L. PLAY OFF RÖVANŞ",
    "UEFA AVRUPA LİGİ GURUP AŞAMASI", "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR İLK MAÇ", "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    "UEFA A.L. ÖN ELEME 3.TUR İLK MAÇ", "UEFA A.L. ÖN ELEME 3.TUR RÖVANŞ", "UEFA A.L. PLAY OFF İLK MAÇ", "UEFA A.L. PLAY OFF RÖVANŞ",
    "UEFA KONFERANS LİGİ GURUP AŞAMASI", "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ", "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    "UEFA K.L. ÖN ELEME 3.TUR İLK MAÇ", "UEFA K.L. ÖN ELEME 3.TUR RÖVANŞ", "UEFA K.L. PLAY OFF İLK MAÇ", "UEFA K.L. PLAY OFF RÖVANŞ",
    "UEFA AVRUPA ULUSLAR LİGİ", "UEFA KADINLAR ŞAMPİYONLAR LİGİ",
    "İNGİLTERE SÜPER KUPA", "UEFA SÜPER KUPA",
    "COPA DEL REY", "COPPA ITALIA", "COUPE DE FRANCE", "DFB POKAL", "EREDIVISIE", "FA CUP", "SCOTTISH PREMIER LEAGUE", "PORTEKİZ LİGİ",
    "FIFA DÜNYA KUPASI", "MİLLİ TAKIM MAÇI"
  ];

  const teamLeagueOptions = [
    "TÜRKİYE SÜPER LİG", "TÜRKİYE 1.LİG", "TÜRKİYE 2.LİG", "TÜRKİYE 3.LİG",
    "TÜRKİYE KUPASI", "TÜRKİYE SÜPER KUPA", "TÜRKİYE KADINLAR SÜPER LİG", "AMATÖR LİG",
    "İNGİLTERE PREMIER LİG", "ALMANYA BUNDESLIGA", "FRANSA LIGUE 1", "İTALYA SERIE A", "İSPANYA LA LIGA", 
    "MİLLİ TAKIMLAR", "ÇEŞİTLİ AVRUPA TAKIMLARI", "DİĞER"
  ];

  const [selectedLiveWeek, setSelectedLiveWeek] = useState<number>(4);
  const [liveMatchesDB, setLiveMatchesDB] = useState<any[]>([]);
  const [adminScores, setAdminScores] = useState<Record<number, { home: string, away: string }>>({});
  const [openWinnersMap, setOpenWinnersMap] = useState<{ [key: number]: boolean }>({});
  const [distributedMatches, setDistributedMatches] = useState<{ [key: number]: boolean }>({});
  const [predictionsDB, setPredictionsDB] = useState<Record<string, Record<number, string>>>({}); 
  const [liveInfoStateMap, setLiveInfoStateMap] = useState<Record<number, any>>({}); 

  const [bulletinWeek, setBulletinWeek] = useState<number>(5);
  const [currentWeekDates, setCurrentWeekDates] = useState<string[]>(generateWeekDates(5));
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);

  const [selectedPredictionWeek, setSelectedPredictionWeek] = useState<number>(5);
  const [submittedPlayers, setSubmittedPlayers] = useState<string[]>([]);
  const [missingPlayers, setMissingPlayers] = useState<string[]>([]);
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [playerPredictionsMap, setPlayerPredictionsMap] = useState<Record<string, string[]>>({});
  const [predictionBulletinData, setPredictionBulletinData] = useState<any[]>([]);

  const [bulletinMatches, setBulletinMatches] = useState(
    Array.from({ length: 24 }, (_, i) => ({
      match_index: i + 1,
      category: 'TÜRKİYE SÜPER LİG',
      match_date: generateWeekDates(5)[0],
      match_time: '21:00',
      home_team: '',
      away_team: ''
    }))
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
       const auth = sessionStorage.getItem('admin_auth');
       const role = sessionStorage.getItem('admin_role') as any;
       
       if (auth === 'true' && role) {
          setIsAuthenticated(true);
          setUserRole(role);
       }
    }
  }, []);

  const fetchSkorcuStatus = async () => {
     try {
       const { data, error } = await supabase.from('skorcu_auth').select('*');
       if (data) {
          const newMap: Record<string, boolean> = {};
          data.forEach(row => { newMap[row.username] = row.is_active; });
          setSkorcuStatusMap(prev => ({...prev, ...newMap}));
       }
     } catch (e) {}
  };

  useEffect(() => {
    if (isAuthenticated && userRole === 'master') {
       fetchSkorcuStatus();
    }
  }, [isAuthenticated, userRole]);

  const fetchAllSystemPlayers = async () => {
    const { data } = await supabase.from('players').select('*').order('full_name');
    if (data) {
       setDbPlayersList(data);
       const newMergedMap = { ...staticPlayersList };
       data.forEach((p: any) => {
          newMergedMap[String(p.user_id)] = p.full_name; // 🚀 CERRAHİ MÜDAHALE: Veritabanı ID'si kesin olarak String'e çevrildi
       });
       setMergedPlayers(newMergedMap);
    }
  };

  const fetchAllTeamsFromDB = async () => {
    const { data } = await supabase.from('teams').select('*').order('team_name');
    if (data) {
       setDbTeamsList(data);
       const logos: Record<string, string> = {};
       const leagues: Record<string, string[]> = {};

       data.forEach((team: any) => {
           logos[team.team_name] = team.logo_url;
           if (!leagues[team.league]) leagues[team.league] = [];
           leagues[team.league].push(team.team_name);
       });

       setTeamLogosMap(logos);
       setLeagueTeamsMap(leagues);
       
       const combinedCategories = Array.from(new Set([...defaultCategoriesList, ...Object.keys(leagues)])).sort((a, b) => a.localeCompare(b, 'tr'));
       setDynamicCategoriesList(combinedCategories);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
        fetchAllSystemPlayers();
        fetchAllTeamsFromDB();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput === 'mankoman' && passwordInput === '24351324Yurt.') {
       setIsAuthenticated(true);
       setUserRole('master');
       sessionStorage.setItem('admin_auth', 'true');
       sessionStorage.setItem('admin_role', 'master');
       return;
    } 
    
    // 🛡️ SKORCU GİRİŞ SİSTEMİ (ÖZEL KÜNYELER)
    const validSkorcular: Record<string, string> = {
       'skorcum01': '150101',
       'skorcum06': '191006',
       'skorcum34': '192306'
    };

    if (validSkorcular[usernameInput]) {
       if (passwordInput === validSkorcular[usernameInput]) {
          
          try {
             const { data, error } = await supabase.from('skorcu_auth').select('is_active').eq('username', usernameInput).single();
             if (data && data.is_active === false) {
                 alert("❌ YETKİLERİNİZ DONDURULDU!\nSistemden uzaklaştırıldınız. Lütfen Genelkurmay (Mankoman) ile iletişime geçin.");
                 return;
             }
          } catch(err) {
             console.log("Tablo bulunamadı, giriş yapılıyor...");
          }

          setIsAuthenticated(true);
          setUserRole(usernameInput as any);
          sessionStorage.setItem('admin_auth', 'true');
          sessionStorage.setItem('admin_role', usernameInput);
          setActiveTab('live');
          return;
       }
    }
    
    alert("❌ Erişim Reddedildi! Hatalı Kullanıcı Adı veya Şifre.");
    setPasswordInput('');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    sessionStorage.removeItem('admin_role');
    setIsAuthenticated(false);
    setUserRole(null);
    setUsernameInput('');
    setPasswordInput('');
  };

  const toggleSkorcuAccess = async (skorcuName: string, currentStatus: boolean) => {
     const newStatus = !currentStatus;
     setSkorcuStatusMap(prev => ({...prev, [skorcuName]: newStatus}));
     try {
        await supabase.from('skorcu_auth').upsert({ username: skorcuName, is_active: newStatus }, { onConflict: 'username' });
        if (!newStatus) alert(`🚨 ${skorcuName.toUpperCase()} başarıyla ETKİSİZLEŞTİRİLDİ!\nŞu an içerideyken bile bir şey yapamayacak ve tekrar giriş yapamayacak.`);
        else alert(`✅ ${skorcuName.toUpperCase()} yetkileri geri verildi. Sisteme girebilir.`);
     } catch (e) {
        alert("SQL Tablosu ('skorcu_auth') henüz kurulmadığı için bu ayar sadece ekranda değişti. Kalıcı olması için tabloyu oluşturmalısın.");
     }
  };

  const getPlayerIdByName = (name: string) => {
    return Object.keys(mergedPlayers).find(key => mergedPlayers[key] === name) || null;
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchLiveAdminData = async () => {
      
      if (userRole && userRole.startsWith('skorcum')) {
         try {
           const { data } = await supabase.from('skorcu_auth').select('is_active').eq('username', userRole).single();
           if (data && data.is_active === false) {
              alert("🚨 YETKİLERİNİZ DONDURULDU!\nSistemden uzaklaştırılıyorsunuz.");
              handleLogout();
              return;
           }
         } catch(e) {}
      }

      const { data: bultenData } = await supabase.from('matches_bulletin').select('*').eq('week_num', selectedLiveWeek).order('match_index', { ascending: true });
      const { data: liveData } = await supabase.from('live_matches').select('*');
      const { data: pData } = await supabase.from('player_predictions').select('*').eq('week_num', selectedLiveWeek);

      let currentBulten = bultenData || [];

      if (selectedLiveWeek === 4 && currentBulten.length === 0) {
         currentBulten = week4Matches.map(m => ({
            match_index: m.id, week_num: 4, category: m.category, match_date: m.date, match_time: m.time, home_team: m.homeTeam, away_team: m.awayTeam
         }));
      }

      // Veritabanından gelen tüm bülten state'e atılır. Süzgeçleme işi render'da yapılacak.
      setLiveMatchesDB(currentBulten);

      const initialScores: Record<number, { home: string, away: string }> = {};
      const lockedMatches: Record<number, boolean> = {};
      const infoMap: Record<number, any> = {}; 
      let goalHappened = false;

      currentBulten.forEach(m => {
         const uniqueId = getUniqueMatchId(selectedLiveWeek, m.match_index);
         const liveInfo = liveData?.find(l => l.id === uniqueId);
         
         if (liveInfo) {
           initialScores[m.match_index] = { home: liveInfo.home_score, away: liveInfo.away_score };
           infoMap[m.match_index] = liveInfo; 
           
           if (liveInfo.status === 'FINISHED') {
              lockedMatches[m.match_index] = true;
           }

           if (liveInfo.home_score !== '-' && liveInfo.away_score !== '-') {
             const newTotal = parseInt(liveInfo.home_score) + parseInt(liveInfo.away_score);
             const prevTotal = previousScoresRef.current[uniqueId];
             
             if (prevTotal !== undefined && newTotal > prevTotal) {
               goalHappened = true;
             }
             previousScoresRef.current[uniqueId] = newTotal;
           }
         } else {
           initialScores[m.match_index] = { home: "-", away: "-" };
         }
      });
      
      setAdminScores(initialScores);
      setDistributedMatches(lockedMatches);
      setLiveInfoStateMap(infoMap);

      if (goalHappened && isSoundEnabled) {
         const audio = new Audio('/sounds/goal.mp3');
         audio.play().catch(e => console.log("Ses çalınamadı:", e));
      }

      if (pData) {
         const pMap: Record<string, Record<number, string>> = {};
         pData.forEach(row => {
            const rowUserId = String(row.user_id); // 🚀 CERRAHİ MÜDAHALE: Veritabanı ID'si kesin olarak String'e çevrildi
            if(!pMap[rowUserId]) pMap[rowUserId] = {};
            pMap[rowUserId][row.match_index] = row.predicted_score;
         });
         setPredictionsDB(pMap);
      }
    };
    
    if (activeTab === 'live') {
        fetchLiveAdminData();
        
        const channel = supabase.channel('public:live_matches')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'live_matches' }, payload => {
                fetchLiveAdminData();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }
  }, [activeTab, selectedLiveWeek, isAuthenticated, isSoundEnabled, userRole]);


  useEffect(() => {
    if (!isAuthenticated || userRole !== 'master') return;
    const loadBulletinData = async () => {
      const newDates = generateWeekDates(bulletinWeek);
      setCurrentWeekDates(newDates);

      if (activeTab === 'bulletin') {
        const { data } = await supabase.from('matches_bulletin')
          .select('*')
          .eq('week_num', bulletinWeek)
          .order('match_index', { ascending: true });

        if (data && data.length > 0) {
          const mapped = Array.from({ length: 24 }, (_, i) => {
            const existing = data.find(m => m.match_index === i + 1);
            return {
              match_index: i + 1,
              category: existing?.category || 'TÜRKİYE SÜPER LİG',
              match_date: existing?.match_date || newDates[0],
              match_time: existing?.match_time || '21:00',
              home_team: existing?.home_team || '',
              away_team: existing?.away_team || ''
            };
          });
          setBulletinMatches(mapped as any);
        } else {
          setBulletinMatches(Array.from({ length: 24 }, (_, i) => ({
            match_index: i + 1, category: 'TÜRKİYE SÜPER LİG', match_date: newDates[0], match_time: '21:00', home_team: '', away_team: ''
          })));
        }
      }
    };

    loadBulletinData();
  }, [bulletinWeek, activeTab, isAuthenticated, userRole]);

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'master') return;
    if (activeTab !== 'predictions') return;

    const fetchPredictionData = async () => {
      const { data: bultenData } = await supabase.from('matches_bulletin').select('*').eq('week_num', selectedPredictionWeek).order('match_index', { ascending: true });
      let currentBultenForPreds = bultenData || [];
      if (selectedPredictionWeek === 4 && currentBultenForPreds.length === 0) {
         currentBultenForPreds = week4Matches.map(m => ({ match_index: m.id, home_team: m.homeTeam, away_team: m.awayTeam }));
      }
      setPredictionBulletinData(currentBultenForPreds);

      const { data: pData } = await supabase.from('player_predictions').select('*').eq('week_num', selectedPredictionWeek);
      
      const pMap: Record<string, string[]> = {};
      const allUserIds = Object.keys(mergedPlayers);

      if (selectedPredictionWeek === 4) {
         allUserIds.forEach(id => {
            if (week4PredictionsData[id] && week4PredictionsData[id].length > 0) {
               pMap[id] = week4PredictionsData[id];
            }
         });
      } else if (pData) {
         pData.forEach(row => {
            const rowUserId = String(row.user_id); // 🚀 CERRAHİ MÜDAHALE: Veritabanı ID'si kesin olarak String'e çevrildi
            if (!pMap[rowUserId]) pMap[rowUserId] = Array(24).fill('-');
            pMap[rowUserId][row.match_index - 1] = row.predicted_score;
         });
      }

      const submitted: string[] = [];
      const missing: string[] = [];

      allUserIds.forEach(id => {
         if (pMap[id]) submitted.push(id);
         else missing.push(id);
      });

      submitted.sort((a, b) => (mergedPlayers[a] || '').localeCompare(mergedPlayers[b] || '', 'tr'));
      missing.sort((a, b) => (mergedPlayers[a] || '').localeCompare(mergedPlayers[b] || '', 'tr'));

      setPlayerPredictionsMap(pMap);
      setSubmittedPlayers(submitted);
      setMissingPlayers(missing);
    };

    fetchPredictionData();
  }, [activeTab, selectedPredictionWeek, isAuthenticated, userRole, mergedPlayers]);

  const handleAddNewPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerId || !newPlayerName || !newPlayerPass) {
       alert("Lütfen ID, İsim ve Şifre alanlarının tümünü doldurun.");
       return;
    }
    setIsPlayerLoading(true);
    try {
       const { error } = await supabase.from('players').insert({
          user_id: newPlayerId.trim(),
          full_name: newPlayerName.trim().toUpperCase(),
          password: newPlayerPass.trim()
       });

       if (error) {
          if (error.code === '23505') alert("❌ HATA: Bu ID'ye sahip bir yarışmacı zaten var!");
          else throw error;
       } else {
          alert(`✅ BAŞARILI! ${newPlayerName.toUpperCase()} karargaha katıldı!`);
          setNewPlayerId(''); setNewPlayerName(''); setNewPlayerPass('');
          fetchAllSystemPlayers(); 
       }
    } catch (err: any) {
       alert("❌ Beklenmeyen bir hata oluştu: " + err.message);
    }
    setIsPlayerLoading(false);
  };

  const handleBanishPlayer = async (userId: string, userName: string) => {
    const confirmDelete = window.confirm(`DİKKAT: ${userName} (ID: ${userId}) isimli yarışmacıyı Karargah'tan tamamen İHRAÇ etmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz!`);
    if (!confirmDelete) return;

    try {
       const { error } = await supabase.from('players').delete().eq('user_id', userId);
       if (error) throw error;
       alert(`✅ ${userName} isimli askerin Karargah ile ilişiği kesildi!`);
       fetchAllSystemPlayers(); 
    } catch (err: any) {
       alert("❌ İhraç işlemi sırasında hata oluştu: " + err.message);
    }
  };

  const handleAddNewTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName || !newTeamLeague || !newTeamLogo) {
       alert("Lütfen Takım Adı, Lig ve Logo alanlarının tümünü doldurun.");
       return;
    }
    setIsTeamLoading(true);
    try {
       const { error } = await supabase.from('teams').insert({
          team_name: newTeamName.trim().toUpperCase(),
          league: newTeamLeague.trim().toUpperCase(),
          logo_url: newTeamLogo.trim()
       });

       if (error) {
          if (error.code === '23505') alert("❌ HATA: Bu isimde bir takım zaten sistemde var!");
          else throw error;
       } else {
          alert(`✅ BAŞARILI! ${newTeamName.toUpperCase()} takımı ${newTeamLeague.toUpperCase()} ligine eklendi!`);
          setNewTeamName(''); setNewTeamLogo(''); setNewTeamLeague('');
          fetchAllTeamsFromDB(); 
       }
    } catch (err: any) {
       alert("❌ Beklenmeyen bir hata oluştu: " + err.message);
    }
    setIsTeamLoading(false);
  };

  const handleDeleteTeam = async (teamName: string) => {
    const confirmDelete = window.confirm(`DİKKAT: ${teamName} takımını veritabanından SİLMEK istediğinize emin misiniz?`);
    if (!confirmDelete) return;

    try {
       const { error } = await supabase.from('teams').delete().eq('team_name', teamName);
       if (error) throw error;
       alert(`✅ ${teamName} başarıyla silindi!`);
       fetchAllTeamsFromDB(); 
    } catch (err: any) {
       alert("❌ Silme işlemi sırasında hata oluştu: " + err.message);
    }
  };

  const toggleWinners = (matchId: number) => setOpenWinnersMap((prev) => ({ ...prev, [matchId]: !prev[matchId] }));
  
  const handleScoreChange = (matchId: number, team: 'home' | 'away', score: string) => {
    setAdminScores(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || { home: "-", away: "-" }), [team]: score } }));
  };
  
  const scoreOptions = ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];
  
  const isTffMatchCheck = (category: string) => {
    if(!category) return false;
    const uppercaseCat = category.toUpperCase();
    return ( uppercaseCat.includes("TÜRKİYE") || uppercaseCat.includes("TFF") || uppercaseCat.includes("AMATÖR") );
  };

  // 🚀 CANLI BONUS MOTORU HESAPLAMASI (SADECE O HAFTAYA ÖZEL)
  const weeklyStats = useMemo(() => {
     const stats: Record<string, { points: number, exactScores: number }> = {};
     Object.keys(mergedPlayers).forEach(uid => {
         stats[uid] = { points: 0, exactScores: 0 };
     });

     // Sadece aktif haftanın maçlarını (liveMatchesDB) döngüye sokuyoruz. (İzolasyon Kuralı)
     liveMatchesDB.forEach(match => {
         const hScore = adminScores[match.match_index]?.home || "-";
         const aScore = adminScores[match.match_index]?.away || "-";
         
         if (hScore !== "-" && aScore !== "-") {
             const targetScore = `${hScore}-${aScore}`;
             const predsSource = selectedLiveWeek === 4 ? (week4PredictionsData as any) : predictionsDB;
             
             const winners = Object.keys(predsSource).filter(uid => {
                 const idx = selectedLiveWeek === 4 ? match.match_index - 1 : match.match_index;
                 return predsSource[uid] && predsSource[uid][idx] === targetScore;
             });

             const wCount = winners.length;
             let pts = 0;
             if (wCount === 1) pts = 12;
             else if (wCount === 2) pts = 6;
             else if (wCount === 3) pts = 5;
             else if (wCount === 4) pts = 4;
             else if (wCount === 5) pts = 3;
             else if (wCount === 6) pts = 2;
             else if (wCount >= 7) pts = 1;

             winners.forEach(uid => {
                 if (stats[uid]) {
                     stats[uid].points += pts;
                     stats[uid].exactScores += 1;
                 }
             });
         }
     });

     let maxPts = 0;
     let maxScores = 0;
     Object.values(stats).forEach(s => {
         if (s.points > maxPts) maxPts = s.points;
         if (s.exactScores > maxScores) maxScores = s.exactScores;
     });

     let pointsLeader = null;
     let scoreLeader = null;

     // Müstakillik Şartı (Sadece 1 kişi o skorda/puanda ise)
     if (maxPts > 0) {
         const pLeaders = Object.keys(stats).filter(uid => stats[uid].points === maxPts);
         if (pLeaders.length === 1) pointsLeader = pLeaders[0];
     }
     if (maxScores > 0) {
         const sLeaders = Object.keys(stats).filter(uid => stats[uid].exactScores === maxScores);
         if (sLeaders.length === 1) scoreLeader = sLeaders[0];
     }

     return { pointsLeader, scoreLeader, stats, maxPts, maxScores };
  }, [adminScores, predictionsDB, liveMatchesDB, mergedPlayers, selectedLiveWeek]);


  const handleAction = async (action: string, matchId: number, matchData: any, currentWinners: string[], displayPoints: number) => {
    const homeScore = adminScores[matchId]?.home || "-";
    const awayScore = adminScores[matchId]?.away || "-";
    const uniqueId = getUniqueMatchId(selectedLiveWeek, matchId);
    
    // 🚀 LOG BİLGİSİ (SAAT:DAKİKA:SANİYE)
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    if (action === 'Skoru Güncelle') {
      const { error: liveError } = await supabase.from('live_matches').upsert({ 
         id: uniqueId, home_score: homeScore, away_score: awayScore, status: 'LIVE',
         updated_by: userRole, updated_at: timeString 
      }, { onConflict: 'id' });
      if (liveError) alert("Canlı skor tablosu güncellenirken hata: " + liveError.message);
      else alert(`✅ ${matchId}. Maçın skoru "live_matches" tablosuna işlendi! Artık canlı ekranda görünecek.`);
      return;
    }

    if (action === 'Maçı Onayla (Puan Dağıt)') {
      if (homeScore === "-" || awayScore === "-") {
        alert("Lütfen önce takımların skorunu girin!");
        return;
      }

      const isTff = isTffMatchCheck(matchData.category);
      const leagueName = isTff ? 'TFF' : 'DFO';
      
      let confirmMsg = "";
      if (matchId === 24) {
          confirmMsg = `FİNAL MAÇI ONAYI VE BONUS DAĞITIMI (24. MAÇ) 🚨\n\n`;
          confirmMsg += `Bu maçı ${currentWinners.length} kişi bildi (${displayPoints} Puan)\n\n`;
          if (weeklyStats.pointsLeader) confirmMsg += `🏆 Puan Lideri (+3 Puan): ${mergedPlayers[weeklyStats.pointsLeader]}\n`;
          else confirmMsg += `🏆 Puan Lideri: MÜSTAKİL LİDER YOK (Bonus İptal)\n`;
          
          if (weeklyStats.scoreLeader) confirmMsg += `🔥 Skor Kralı (+3 Master Puan): ${mergedPlayers[weeklyStats.scoreLeader]}\n`;
          else confirmMsg += `🔥 Skor Kralı: MÜSTAKİL KRAL YOK (Bonus İptal)\n`;
          
          confirmMsg += `\nİşlemi onaylıyor musun Kumandanım?`;
      } else {
          confirmMsg = currentWinners.length === 0
            ? `Bu skoru bilen aslan parçası çıkmadı.\n\nPuan dağıtılmayacak ama maç "BİTTİ" olarak işaretlenip kilitlenecek.\n\nOnaylıyor musun Kumandanım?`
            : `${currentWinners.length} kişiye ${displayPoints} puan dağıtılacak.\n\nMotor 1: 'points' tablosuna fiş kesilecek.\nMotor 2: 'standings' tablosundaki (MASTER ve ${leagueName}) bakiyesi güncellenecek.\n\nOnaylıyor musun Kumandanım?`;
      }
      
      if (!window.confirm(confirmMsg)) return;

      try {
        await supabase.from('live_matches').upsert({ 
           id: uniqueId, home_score: homeScore, away_score: awayScore, status: 'FINISHED',
           updated_by: userRole, updated_at: timeString 
        }, { onConflict: 'id' });

        if (currentWinners.length > 0) {
          const inserts = currentWinners.map(winnerName => {
            const userId = getPlayerIdByName(winnerName);
            return {
              hafta: selectedLiveWeek, user_name: winnerName, username: userId, kategori: leagueName, ev_sahibi: matchData.home_team, deplasman: matchData.away_team,
              gercek_ev: parseInt(homeScore, 10), gercek_dep: parseInt(awayScore, 10), tahmin_ev: homeScore, tahmin_dep: awayScore, puan: displayPoints
            };
          });

          const { error: insertError } = await supabase.from('points').insert(inserts);
          if (insertError) { alert(`❌ HATA! Fişler eklenemedi.\nMesaj: ${insertError.message}`); return; }

          let standingsUpdateSuccess = 0;
          for (const winnerName of currentWinners) {
            const userId = getPlayerIdByName(winnerName);
            if (!userId) continue;
            const { data: stData } = await supabase.from('standings').select('*').eq('user_id', userId);
            if (stData) {
              const lRow = stData.find(r => r.league_type === leagueName);
              if (lRow) await supabase.from('standings').update({ points: lRow.points + displayPoints }).eq('id', lRow.id);
              else await supabase.from('standings').insert({ user_id: userId, user_name: winnerName, league_type: leagueName, points: displayPoints });

              const mRow = stData.find(r => r.league_type === 'MASTER');
              if (mRow) await supabase.from('standings').update({ points: mRow.points + displayPoints }).eq('id', mRow.id);
              else await supabase.from('standings').insert({ user_id: userId, user_name: winnerName, league_type: 'MASTER', points: displayPoints });
              standingsUpdateSuccess++;
            }
          }
        }

        // 🚀 BONUS MOTORU VERİTABANI İŞLEMLERİ (SADECE 24. MAÇ ONAYLANDIĞINDA)
        if (matchId === 24) {
            let bonusInserts = [];
            let pLeaderId = weeklyStats.pointsLeader;
            let sLeaderId = weeklyStats.scoreLeader;

            if (pLeaderId) {
                bonusInserts.push({
                    hafta: selectedLiveWeek, user_name: mergedPlayers[pLeaderId], username: pLeaderId, kategori: 'MASTER', ev_sahibi: 'HAFTANIN', deplasman: 'LİDERİ',
                    gercek_ev: 0, gercek_dep: 0, tahmin_ev: '-', tahmin_dep: '-', puan: 3
                });
            }
            if (sLeaderId) {
                bonusInserts.push({
                    hafta: selectedLiveWeek, user_name: mergedPlayers[sLeaderId], username: sLeaderId, kategori: 'MASTER', ev_sahibi: 'SKOR', deplasman: 'KRALI',
                    gercek_ev: 0, gercek_dep: 0, tahmin_ev: '-', tahmin_dep: '-', puan: 3
                });
            }

            if (bonusInserts.length > 0) {
                const { error: bInsertError } = await supabase.from('points').insert(bonusInserts);
                if (!bInsertError) {
                    if (pLeaderId) {
                        const { data: stData } = await supabase.from('standings').select('*').eq('user_id', pLeaderId);
                        if (stData) {
                            const mRow = stData.find(r => r.league_type === 'MASTER');
                            if (mRow) await supabase.from('standings').update({ points: mRow.points + 3 }).eq('id', mRow.id);
                            
                            const tffRow = stData.find(r => r.league_type === 'TFF');
                            if (tffRow) await supabase.from('standings').update({ points: tffRow.points + 3 }).eq('id', tffRow.id);
                            
                            const dfoRow = stData.find(r => r.league_type === 'DFO');
                            if (dfoRow) await supabase.from('standings').update({ points: dfoRow.points + 3 }).eq('id', dfoRow.id);
                        }
                    }
                    if (sLeaderId) {
                        const { data: stData } = await supabase.from('standings').select('*').eq('user_id', sLeaderId);
                        if (stData) {
                            const mRow = stData.find(r => r.league_type === 'MASTER');
                            if (mRow) await supabase.from('standings').update({ points: mRow.points + 3 }).eq('id', mRow.id);
                        }
                    }
                    alert(`🎁 HAFTANIN BONUSLARI BAŞARIYLA DAĞITILDI!\n\n🏆 Puan Lideri: ${pLeaderId ? mergedPlayers[pLeaderId] : 'Müstakil Lider Yok'}\n🔥 Skor Kralı: ${sLeaderId ? mergedPlayers[sLeaderId] : 'Müstakil Kral Yok'}`);
                } else {
                    console.error("Bonus insert error:", bInsertError);
                }
            }
        }

        if (currentWinners.length > 0) alert(`✅ NORMAL MAÇ İŞLEMİ BAŞARILI! (Kasaya Eklendi)`);
        else alert("✅ Maç başarıyla BİTİRİLDİ. Normal skoru bilen çıkmadığı için kasa kapalı.");
        
        setDistributedMatches(prev => ({...prev, [matchId]: true})); 

      } catch (error: any) { alert("❌ BEKLENMEYEN HATA: " + error.message); }
      return;
    }

    if (action === 'Geri Al' || action === 'Resetle') {
      const isLocked = distributedMatches[matchId];
      if (isLocked) {
        const confirmUndo = window.confirm(`DİKKAT: Bu maçın puanları daha önce dağıtılmıştı!\n\nEğer onaylarsan; bu maçtan kazanılan puanlar 'standings' (kasa) tablosundan DÜŞÜLECEK, 'points' tablosundaki fişler SİLİNECEK ve maç tekrar MÜDAHALEYE AÇILACAK.\n\nBunu yapmak istediğine emin misin?`);
        if (!confirmUndo) return;

        try {
          const isTff = isTffMatchCheck(matchData.category);
          const leagueName = isTff ? 'TFF' : 'DFO';
          
          // 🚀 24. MAÇ İPTAL EDİLİYORSA BONUSLARI DA GERİ ÇEK!
          if (matchId === 24) {
               const { data: bonusPoints } = await supabase.from('points').select('*').eq('hafta', selectedLiveWeek).in('ev_sahibi', ['HAFTANIN', 'SKOR']);
               if (bonusPoints && bonusPoints.length > 0) {
                   for (const row of bonusPoints) {
                       const pts = row.puan; const uid = row.username;
                       const { data: stData } = await supabase.from('standings').select('*').eq('user_id', uid);
                       if (stData) {
                           const mRow = stData.find(r => r.league_type === 'MASTER');
                           if (mRow) await supabase.from('standings').update({ points: Math.max(0, mRow.points - pts) }).eq('id', mRow.id);
                           if (row.ev_sahibi === 'HAFTANIN') {
                               const lRowTFF = stData.find(r => r.league_type === 'TFF');
                               if (lRowTFF) await supabase.from('standings').update({ points: Math.max(0, lRowTFF.points - pts) }).eq('id', lRowTFF.id);
                               const lRowDFO = stData.find(r => r.league_type === 'DFO');
                               if (lRowDFO) await supabase.from('standings').update({ points: Math.max(0, lRowDFO.points - pts) }).eq('id', lRowDFO.id);
                           }
                       }
                   }
                   await supabase.from('points').delete().eq('hafta', selectedLiveWeek).in('ev_sahibi', ['HAFTANIN', 'SKOR']);
               }
          }

          // Normal maç geri çekme işlemleri
          const { data: existingPoints } = await supabase.from('points').select('*').eq('hafta', selectedLiveWeek).eq('ev_sahibi', matchData.home_team).eq('deplasman', matchData.away_team);
          if (existingPoints && existingPoints.length > 0) {
            for (const row of existingPoints) {
              const pts = row.puan; const uid = row.username;
              const { data: stData } = await supabase.from('standings').select('*').eq('user_id', uid);
              if (stData) {
                const lRow = stData.find(r => r.league_type === leagueName);
                if (lRow) await supabase.from('standings').update({ points: Math.max(0, lRow.points - pts) }).eq('id', lRow.id);
                const mRow = stData.find(r => r.league_type === 'MASTER');
                if (mRow) await supabase.from('standings').update({ points: Math.max(0, mRow.points - pts) }).eq('id', mRow.id);
              }
            }
            await supabase.from('points').delete().eq('hafta', selectedLiveWeek).eq('ev_sahibi', matchData.home_team).eq('deplasman', matchData.away_team);
          }
          alert("✅ GERİ ALMA BAŞARILI! Puanlar ve varsa Bonuslar kasadan düşüldü, fişler silindi.");
        } catch (error: any) { alert("❌ HATA: " + error.message); return; }
      }
      
      await supabase.from('live_matches').upsert({ 
         id: uniqueId, home_score: '-', away_score: '-', status: 'NOT_STARTED',
         updated_by: userRole, updated_at: timeString 
      }, { onConflict: 'id' });
      setAdminScores(prev => ({ ...prev, [matchId]: { home: "-", away: "-" } }));
      setOpenWinnersMap(prev => ({ ...prev, [matchId]: false })); 
      setDistributedMatches(prev => ({ ...prev, [matchId]: false })); 
      if(!isLocked) alert("✅ Skor başarıyla sıfırlandı.");
    }
  };

  const getEliteTheme = (category: string) => {
    if(!category) return { bgImg: null, containerBorder: "border-slate-500", containerShadow: "shadow-none", containerBg: "bg-slate-900", badgeBg: "", badgeText: "text-slate-300", badgeBorder: "", catText: "text-slate-400", scoreBorder: "border-slate-700", colonText: "text-slate-500", tagText: "text-slate-400", tagBg: "bg-slate-800", tagBorder: "border-slate-600", bottomBar: "bg-slate-900" };
    
    const upCat = category.toUpperCase();
    if (upCat.includes("ŞAMPİYONLAR LİGİ") || upCat.includes("Ş.L.")) return { bgImg: "url('/cl-bg.png')", containerBorder: "border-indigo-500/50", containerShadow: "shadow-[0_0_40px_rgba(79,70,229,0.4)]", containerBg: "bg-[#050b14]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-indigo-300", badgeBorder: "border-indigo-400/80 shadow-[0_0_10px_currentColor]", catText: "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]", scoreBorder: "border-white/30", colonText: "text-white/50", tagText: "text-cyan-300", tagBg: "bg-cyan-950/90", tagBorder: "border-cyan-400/80", bottomBar: "bg-[#050b14]/90 border-blue-900/30" };
    else if (upCat.includes("AVRUPA LİGİ") || upCat.includes("A.L.")) return { bgImg: "url('/el-bg.png')", containerBorder: "border-orange-500/50", containerShadow: "shadow-[0_0_40px_rgba(249,115,22,0.4)]", containerBg: "bg-[#140805]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-orange-400", badgeBorder: "border-orange-500/80 shadow-[0_0_10px_currentColor]", catText: "text-orange-300 drop-shadow-[0_0_8px_rgba(253,186,116,0.5)]", scoreBorder: "border-orange-600/40", colonText: "text-orange-400/50", tagText: "text-orange-300", tagBg: "bg-orange-950/90", tagBorder: "border-orange-400/80", bottomBar: "bg-[#140805]/90 border-orange-900/30" };
    else if (upCat.includes("KONFERANS LİGİ") || upCat.includes("K.L.")) return { bgImg: "url('/uecl-bg.png')", containerBorder: "border-emerald-500/50", containerShadow: "shadow-[0_0_40px_rgba(16,185,129,0.4)]", containerBg: "bg-[#05140b]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-emerald-400", badgeBorder: "border-emerald-500/80 shadow-[0_0_10px_currentColor]", catText: "text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.5)]", scoreBorder: "border-emerald-600/40", colonText: "text-emerald-400/50", tagText: "text-emerald-300", tagBg: "bg-emerald-950/90", tagBorder: "border-emerald-400/80", bottomBar: "bg-[#05140b]/90 border-emerald-900/30" };
    else if (isTffMatchCheck(category)) return { bgImg: "url('/tff-bg.png')", containerBorder: "border-red-500/50", containerShadow: "shadow-[0_0_40px_rgba(239,68,68,0.4)]", containerBg: "bg-[#140505]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-red-400", badgeBorder: "border-red-500/80 shadow-[0_0_10px_currentColor]", catText: "text-red-300 drop-shadow-[0_0_8px_rgba(252,165,165,0.5)]", scoreBorder: "border-red-600/40", colonText: "text-red-400/50", tagText: "text-red-400", tagBg: "bg-red-950/90", tagBorder: "border-red-500/80", bottomBar: "bg-[#140505]/90 border-red-900/30" };
    return { bgImg: null, containerBorder: "border-blue-500/30", containerShadow: "shadow-[0_0_30px_rgba(30,58,138,0.5)]", containerBg: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/60 via-[#0a1120] to-[#050b14]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-cyan-400", badgeBorder: "border-cyan-500/80 shadow-[0_0_10px_currentColor]", catText: "text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]", scoreBorder: "border-blue-600/40", colonText: "text-blue-400/50", tagText: "text-cyan-300", tagBg: "bg-cyan-950/90", tagBorder: "border-cyan-400/80", bottomBar: "bg-[#050b14]/90 border-blue-900/30" };
  };

  const getLeagueKey = (category: string) => {
    if (!category) return "ÇEŞİTLİ AVRUPA TAKIMLARI";
    const upCat = category.toUpperCase();
    if (upCat.includes("TÜRKİYE SÜPER LİG")) return "TÜRKİYE SÜPER LİG";
    if (upCat.includes("TÜRKİYE 1.LİG")) return "TÜRKİYE 1.LİG";
    if (upCat.includes("İNGİLTERE PREMIER LİG")) return "İNGİLTERE PREMIER LİG";
    if (upCat.includes("ALMANYA BUNDESLIGA")) return "ALMANYA BUNDESLIGA";
    if (upCat.includes("FRANSA LIGUE 1")) return "FRANSA LIGUE 1";
    if (upCat.includes("İTALYA SERIE A")) return "İTALYA SERIE A";
    if (upCat.includes("İSPANYA LA LIGA")) return "İSPANYA LA LIGA";
    if (upCat.includes("MİLLİ TAKIM")) return "MİLLİ TAKIMLAR";
    if (upCat.includes("TÜRKİYE 2.LİG")) return "TÜRKİYE 2.LİG";
    if (upCat.includes("TÜRKİYE 3.LİG")) return "TÜRKİYE 3.LİG";
    if (upCat.includes("KADINLAR")) return "TÜRKİYE KADINLAR SÜPER LİG";
    if (upCat.includes("KUPASI") || upCat.includes("KUPA")) return "TÜRKİYE KUPASI";
    if (upCat.includes("AMATÖR")) return "AMATÖR LİG";
    if (leagueTeamsMap[upCat]) return upCat;
    if (upCat.includes("DİĞER") || upCat === "DİĞER") return "DİĞER";
    return "ÇEŞİTLİ AVRUPA TAKIMLARI"; 
  };

  const getAvailableTeams = (currentIndex: number, isHome: boolean) => {
    const currentMatch = bulletinMatches[currentIndex];
    const leagueKey = getLeagueKey(currentMatch.category);

    if (leagueKey === "ÇEŞİTLİ AVRUPA TAKIMLARI" || leagueKey === "DİĞER" || !leagueTeamsMap[leagueKey]) {
        const opponent = isHome ? currentMatch.away_team : currentMatch.home_team;
        const allTeamsInSystem = dbTeamsList.map(t => t.team_name).sort((a, b) => a.localeCompare(b, 'tr'));
        return allTeamsInSystem.filter(t => t !== opponent);
    }

    const baseTeams = leagueTeamsMap[leagueKey] || [];
    const usedTeamsInThisLeague = new Set<string>();
    
    bulletinMatches.forEach((m, idx) => {
        if (idx !== currentIndex && getLeagueKey(m.category) === leagueKey) {
            if (m.home_team) usedTeamsInThisLeague.add(m.home_team);
            if (m.away_team) usedTeamsInThisLeague.add(m.away_team);
        }
    });

    return baseTeams.filter(team => {
        if (usedTeamsInThisLeague.has(team)) return false;
        const opponent = isHome ? currentMatch.away_team : currentMatch.home_team;
        if (team === opponent) return false;
        return true; 
    });
  };

  const handleBulletinChange = (index: number, field: string, value: string) => {
    const newMatches = [...bulletinMatches];
    (newMatches[index] as any)[field] = value;
    
    if (field === 'category') {
        newMatches[index].home_team = '';
        newMatches[index].away_team = '';
    }
    setBulletinMatches(newMatches);
  };

  const copyDateTimeToAll = () => {
    const firstDate = bulletinMatches[0].match_date;
    const firstTime = bulletinMatches[0].match_time;
    if(!firstDate || !firstTime) return alert("Önce 1. maçın tarih ve saatini doldurun!");
    const updated = bulletinMatches.map(m => ({ ...m, match_date: firstDate, match_time: firstTime }));
    setBulletinMatches(updated);
  };

  const saveBulletinToDB = async () => {
    const hasEmpty = bulletinMatches.some(m => !m.home_team.trim() || !m.away_team.trim());
    if (hasEmpty) {
       if(!window.confirm("Bazı takımlar seçilmemiş (Boş bırakılmış). Yine de bülteni kaydedip yayınlamak istiyor musun? (Boş olanlar Maç Arşivinde eksik görünür)")) return;
    }

    setIsPublishing(true);
    try {
      const payload = bulletinMatches.map(m => ({
         week_num: bulletinWeek,
         match_index: m.match_index,
         category: m.category,
         match_date: m.match_date,
         match_time: m.match_time,
         home_team: m.home_team.trim().toUpperCase(),
         away_team: m.away_team.trim().toUpperCase()
      }));

      const { error } = await supabase.from('matches_bulletin').upsert(payload, { onConflict: 'week_num,match_index' });
      if (error) throw error;
      
      alert(`✅ BAŞARILI! ${bulletinWeek}. Hafta Bülteni füzeyle fırlatıldı ve veritabanına mühürlendi!\n\nArtık "Maç Arşivi" ve "Tahminmatik" sayfalarında otomatik olarak boş (- : -) formatında canlı yayındadır.`);
    } catch (e: any) {
      alert("❌ HATA: Bülten kaydedilemedi! Detay: " + e.message);
    }
    setIsPublishing(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"></div>
          <span className="text-5xl mb-4 block drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">🛡️</span>
          <h1 className="text-2xl font-black text-white mb-2 tracking-widest uppercase drop-shadow-md">Karargah Girişi</h1>
          <p className="text-slate-400 text-xs mb-8 font-medium">Sadece yetkili komuta kademesi erişebilir.</p>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="text" 
              value={usernameInput} 
              onChange={e => setUsernameInput(e.target.value)} 
              className="bg-slate-950 border border-slate-700 text-slate-300 px-4 py-3.5 rounded-xl outline-none focus:border-amber-500 text-center tracking-widest font-bold text-sm shadow-inner placeholder:text-slate-600 lowercase" 
              placeholder="KULLANICI ADI" 
              autoComplete="off"
            />
            <input 
              type="password" 
              value={passwordInput} 
              onChange={e => setPasswordInput(e.target.value)} 
              className="bg-slate-950 border border-slate-700 text-amber-400 px-4 py-3.5 rounded-xl outline-none focus:border-amber-500 text-center tracking-[0.3em] font-black text-lg shadow-inner placeholder:text-slate-600" 
              placeholder="••••••••" 
              autoComplete="new-password"
            />
            <button 
              type="submit" 
              className="bg-amber-600 hover:bg-amber-500 text-white font-black tracking-widest py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_20px_rgba(245,158,11,0.6)] mt-2"
            >
              KAPIYI AÇ
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 🚀 FİLTRELENMİŞ EKRAN ÇIKTISI
  const displayedMatches = liveMatchesDB.filter(match => {
      if (userRole === 'master') {
          return showOnlyToday ? match.match_date === getTodayDateString() : true;
      }
      if (userRole && userRole.startsWith('skorcum')) {
          return match.match_date === getTodayDateString();
      }
      return false;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 font-sans pb-24 relative">
      <div className="max-w-7xl mx-auto pt-6">
        
        {/* 🔴 ÜST TAB MENÜSÜ 🔴 */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8 bg-slate-900/50 p-3 rounded-2xl border border-slate-800 shadow-xl overflow-x-auto custom-scrollbar flex-wrap">

           <button 
             onClick={() => setActiveTab('live')}
             className={`flex-1 min-w-[160px] py-3 lg:py-4 rounded-xl font-black text-xs lg:text-sm tracking-widest transition-all ${activeTab === 'live' ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-[1.02]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
           >
             🔴 CANLI YÖNETİM
           </button>
           
           {userRole === 'master' && (
             <>
               <button 
                 onClick={() => setActiveTab('bulletin')}
                 className={`flex-1 min-w-[160px] py-3 lg:py-4 rounded-xl font-black text-xs lg:text-sm tracking-widest transition-all ${activeTab === 'bulletin' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] scale-[1.02]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
               >
                 🛠️ BÜLTEN
               </button>

               <button 
                 onClick={() => setActiveTab('predictions')}
                 className={`flex-1 min-w-[160px] py-3 lg:py-4 rounded-xl font-black text-xs lg:text-sm tracking-widest transition-all ${activeTab === 'predictions' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-[1.02]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
               >
                 📊 TAHMİNLER
               </button>

               <button 
                 onClick={() => setActiveTab('players')}
                 className={`flex-1 min-w-[160px] py-3 lg:py-4 rounded-xl font-black text-xs lg:text-sm tracking-widest transition-all ${activeTab === 'players' ? 'bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(192,38,211,0.5)] scale-[1.02]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
               >
                 👥 YARIŞMACILAR
               </button>

               <button 
                 onClick={() => setActiveTab('teams')}
                 className={`flex-1 min-w-[160px] py-3 lg:py-4 rounded-xl font-black text-xs lg:text-sm tracking-widest transition-all ${activeTab === 'teams' ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.5)] scale-[1.02]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
               >
                 🛡️ TAKIM YÖNETİMİ
               </button>
             </>
           )}
        </div>

        {/* ========================================================================================= */}
        {/* 🚀🚀 1. CEPHE: CANLI MAÇ OPERASYONU (YENİLENMİŞ MAÇ ARŞİVİ EFEKTLERİYLE) 🚀🚀 */}
        {/* ========================================================================================= */}
        {activeTab === 'live' && (
          <div className="animate-fade-in">
            
            {/* 🔴 MANKOMAN İÇİN SKORCU DİSİPLİN KONTROL PANELİ 🔴 */}
            {userRole === 'master' && (
               <div className="mb-6 bg-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                     <div className="flex items-center gap-2">
                        <span className="text-2xl drop-shadow-md">⚔️</span>
                        <div>
                           <h2 className="text-white font-black tracking-widest uppercase text-sm">SKORCU DİSİPLİN PANELİ</h2>
                           <p className="text-slate-400 text-[10px]">Aktif Skorcuları anında sistemden atabilir veya yetki verebilirsin.</p>
                        </div>
                     </div>
                     <div className="flex gap-3 flex-wrap justify-center">
                        {['skorcum01', 'skorcum06', 'skorcum34'].map(sk => {
                           const isActive = skorcuStatusMap[sk] !== false; // Varsayılan true
                           return (
                              <button 
                                 key={sk}
                                 onClick={() => toggleSkorcuAccess(sk, isActive)}
                                 className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-xs transition-all shadow-md ${
                                    isActive 
                                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400 hover:bg-emerald-900' 
                                    : 'bg-rose-950/80 border-rose-500/50 text-rose-400 hover:bg-rose-900'
                                 }`}
                              >
                                 <span className="uppercase tracking-widest">{sk}</span>
                                 <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.8)]'}`}></div>
                              </button>
                           )
                        })}
                     </div>
                  </div>
               </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-800 pb-4">
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight flex items-center justify-center sm:justify-start gap-2">
                  🔴 KÖK KOMUTA MERKEZİ / CANLI RADAR
                </h1>
                <p className="text-slate-400 text-xs mt-1 flex items-center justify-center sm:justify-start gap-2">
                  Veritabanındaki maçların skorunu gir ve puanları dağıt.
                </p>
              </div>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
                 
                 <button 
                   onClick={handleLogout} 
                   className="px-4 py-2 bg-rose-950 hover:bg-rose-900 text-rose-400 text-xs font-bold rounded-xl shadow-md border border-rose-900/50 flex items-center gap-2 transition-all"
                 >
                   🔒 KİLİTLE ÇIK
                 </button>

                 <button 
                    onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                        isSoundEnabled 
                        ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500' 
                        : 'bg-slate-800/50 text-slate-500 border border-slate-700 hover:bg-slate-800'
                    }`}
                 >
                    {isSoundEnabled ? '🔊 GOL SESİ AÇIK' : '🔇 GOL SESİ KAPALI'}
                 </button>

                 <div className="flex items-center gap-2 ml-0 sm:ml-2">
                    
                    {userRole === 'master' && (
                       <button 
                          onClick={() => setShowOnlyToday(!showOnlyToday)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                              showOnlyToday 
                              ? 'bg-indigo-900/80 text-indigo-300 border border-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.3)]' 
                              : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-800'
                          }`}
                       >
                          {showOnlyToday ? '📅 SADECE BUGÜN' : '📋 TÜM LİSTE'}
                       </button>
                    )}

                    <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2">
                       <span className="text-slate-400 font-bold text-xs tracking-wider">AKTİF HAFTA:</span>
                       {userRole === 'master' ? (
                          <div className="bg-amber-500 border border-amber-600 text-slate-950 font-black text-sm px-3 py-1 rounded shadow-[0_0_10px_rgba(245,158,11,0.3)] select-none">
                             {selectedLiveWeek}. HAFTA
                          </div>
                       ) : (
                          <div className="bg-amber-500 border border-amber-600 text-slate-950 font-black text-sm px-3 py-1 rounded shadow-[0_0_10px_rgba(245,158,11,0.3)] select-none">
                             {selectedLiveWeek}. HAFTA
                          </div>
                       )}
                    </div>
                 </div>
              </div>
            </div>

            {displayedMatches.length === 0 ? (
                 <div className="w-full py-20 text-center bg-slate-900/50 border border-slate-800 rounded-2xl shadow-inner">
                    <span className="text-5xl mb-4 block opacity-50">{userRole && userRole.startsWith('skorcum') || showOnlyToday ? '🛡️' : '📡'}</span>
                    <h2 className={`text-xl font-bold mb-2 tracking-widest uppercase ${userRole && userRole.startsWith('skorcum') || showOnlyToday ? 'text-amber-500' : 'text-slate-400'}`}>
                       {userRole && userRole.startsWith('skorcum') || showOnlyToday ? `BUGÜN İÇİN (${getTodayDateString()}) OYNANACAK MAÇ BULUNAMADI` : `${selectedLiveWeek}. HAFTA BÜLTENİ BULUNAMADI`}
                    </h2>
                    <p className="text-slate-500 text-sm">
                       {userRole && userRole.startsWith('skorcum') 
                          ? 'Sadece bugün oynanan maçlara müdahale edebilirsiniz. Düne veya yarına ait maçlar otomatik olarak gizlenmiştir.' 
                          : showOnlyToday 
                          ? 'Bugün için planlanmış bir maç yok. Tüm listeyi görmek için sağ üstteki butona tıklayın.'
                          : 'Önce "Yeni Bülten Oluştur" sekmesinden bu haftayı yayınlayın.'}
                    </p>
                 </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {displayedMatches.map((match) => {
                const isWinnersOpen = !!openWinnersMap[match.match_index];
                const isTffMatch = isTffMatchCheck(match.category);
                const isMatch24 = match.match_index === 24; // 🚀 FİNAL MAÇI KONTROLÜ
                
                const homeTeamUpper = match.home_team?.toUpperCase() || match.homeTeam?.toUpperCase();
                const awayTeamUpper = match.away_team?.toUpperCase() || match.awayTeam?.toUpperCase();

                const homeLogoUrl = teamLogosMap[homeTeamUpper] || "/logos/default.png";
                const awayLogoUrl = teamLogosMap[awayTeamUpper] || "/logos/default.png";

                const homeScore = adminScores[match.match_index]?.home || "-";
                const awayScore = adminScores[match.match_index]?.away || "-";
                
                let currentWinners: string[] = [];
                let winnersCount = 0;
                let displayPoints = 0;

                if (homeScore !== "-" && awayScore !== "-") {
                  const targetScore = `${homeScore}-${awayScore}`;
                  
                  let predictionsSource = predictionsDB;
                  
                  if (selectedLiveWeek === 4) {
                      predictionsSource = week4PredictionsData as any;
                  }

                  currentWinners = Object.keys(predictionsSource)
                    .filter(uid => {
                        if (selectedLiveWeek === 4) {
                            return predictionsSource[uid] && predictionsSource[uid][match.match_index - 1] === targetScore;
                        } else {
                            return predictionsSource[uid] && predictionsSource[uid][match.match_index] === targetScore;
                        }
                    })
                    .map(uid => mergedPlayers[uid] || "Bilinmeyen")
                    .sort((a, b) => a.localeCompare(b, 'tr'));
                    
                  winnersCount = currentWinners.length;
                  
                  if(winnersCount === 1) displayPoints = 12;
                  else if(winnersCount === 2) displayPoints = 6;
                  else if(winnersCount === 3) displayPoints = 5;
                  else if(winnersCount === 4) displayPoints = 4;
                  else if(winnersCount === 5) displayPoints = 3;
                  else if(winnersCount === 6) displayPoints = 2;
                  else if(winnersCount >= 7) displayPoints = 1;
                  else displayPoints = 0;
                }

                const theme = getEliteTheme(match.category);
                const isLocked = distributedMatches[match.match_index];
                const logInfo = liveInfoStateMap[match.match_index];

                return (
                  <div key={match.match_index} className={`w-full mx-auto border rounded-2xl overflow-hidden transition-all duration-500 flex flex-col relative ${theme.containerBorder} ${theme.containerShadow} ${theme.containerBg}`}>
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
                            {match.week_num}. Hafta - {match.match_index}. MAÇ
                          </span>
                          <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border text-center flex items-center gap-1.5 ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                            🏆 {match.category}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between px-0 sm:px-4">
                          
                          <div className="flex flex-col items-center justify-center flex-1 gap-1.5 sm:gap-3">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20">
                              <img src={homeLogoUrl} alt={homeTeamUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
                            </div>
                            <span className="text-white font-extrabold text-[9px] sm:text-[12px] text-center uppercase tracking-wide drop-shadow-lg leading-tight px-1">{homeTeamUpper}</span>
                          </div>

                          <div className="flex flex-col items-center justify-center mx-1.5 sm:mx-4 w-24 sm:w-36 z-30">
                            <div className={`w-full bg-[#080d1a]/80 border ${theme.scoreBorder} py-2.5 sm:py-3.5 rounded-xl flex items-center justify-center gap-1 sm:gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
                              <select disabled={isLocked} value={homeScore} onChange={e => handleScoreChange(match.match_index, 'home', e.target.value)} className="bg-transparent text-xl sm:text-3xl font-black text-amber-400 outline-none appearance-none text-center cursor-pointer drop-shadow-md disabled:opacity-80" style={{textAlignLast: 'center'}}>
                                {scoreOptions.map(opt => <option key={`h-${opt}`} value={opt} className="bg-slate-900 text-base">{opt}</option>)}
                              </select>
                              <span className={`text-base sm:text-xl font-bold ${theme.colonText}`}>:</span>
                              <select disabled={isLocked} value={awayScore} onChange={e => handleScoreChange(match.match_index, 'away', e.target.value)} className="bg-transparent text-xl sm:text-3xl font-black text-amber-400 outline-none appearance-none text-center cursor-pointer drop-shadow-md disabled:opacity-80" style={{textAlignLast: 'center'}}>
                                {scoreOptions.map(opt => <option key={`a-${opt}`} value={opt} className="bg-slate-900 text-base">{opt}</option>)}
                              </select>
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center flex-1 gap-1.5 sm:gap-3">
                             <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20">
                              <img src={awayLogoUrl} alt={awayTeamUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
                            </div>
                            <span className="text-white font-extrabold text-[9px] sm:text-[12px] text-center uppercase tracking-wide drop-shadow-lg leading-tight px-1">{awayTeamUpper}</span>
                          </div>

                        </div>

                        {/* 🚀 CANLI İSTİHBARAT FİŞİ (LOG) */}
                        {logInfo?.updated_by && (
                           <div className="mt-4 flex justify-center">
                              <div className="bg-slate-950/80 border border-slate-700/50 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-inner">
                                 <span className="text-[10px] sm:text-xs drop-shadow-md">📝</span>
                                 <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">
                                    Son İşlem: <strong className="text-amber-400 uppercase tracking-widest">{logInfo.updated_by}</strong> tarafından <span className="text-slate-300 font-bold">{logInfo.updated_at}</span> itibarıyla.
                                 </span>
                              </div>
                           </div>
                        )}

                        {/* 🚀 CANLI BONUS MOTORU EKRANI (SADECE 24. MAÇ İÇİN) */}
                        {isMatch24 && (homeScore !== '-' || awayScore !== '-') && (
                            <div className="mt-4 p-3 bg-fuchsia-950/30 border border-fuchsia-500/50 rounded-xl shadow-[0_0_15px_rgba(192,38,211,0.2)]">
                                <h3 className="text-center font-black text-fuchsia-400 text-[11px] uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                                    <span>🔥</span> CANLI BONUS RADARI (FİNAL) <span>🔥</span>
                                </h3>
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center bg-slate-950/80 px-3 py-2 rounded border border-slate-700/50 shadow-inner">
                                        <span className="text-[9px] text-slate-300 font-bold tracking-widest">🎯 Puan Lideri (+3 Puan):</span>
                                        <span className={`text-[10px] font-black tracking-widest ${weeklyStats.pointsLeader ? 'text-emerald-400' : 'text-rose-500'}`}>
                                            {weeklyStats.pointsLeader ? `${mergedPlayers[weeklyStats.pointsLeader]} (${weeklyStats.maxPts}P)` : 'MÜSTAKİL LİDER YOK'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-950/80 px-3 py-2 rounded border border-slate-700/50 shadow-inner">
                                        <span className="text-[9px] text-slate-300 font-bold tracking-widest">⚽ Skor Kralı (+3 Master):</span>
                                        <span className={`text-[10px] font-black tracking-widest ${weeklyStats.scoreLeader ? 'text-amber-400' : 'text-rose-500'}`}>
                                            {weeklyStats.scoreLeader ? `${mergedPlayers[weeklyStats.scoreLeader]} (${weeklyStats.maxScores} Maç)` : 'MÜSTAKİL KRAL YOK'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center gap-2 mt-5 min-h-[32px] items-center">
                          {isLocked ? (
                            <div className="w-full text-center">
                              <div className="bg-emerald-950/80 text-emerald-400 text-[10px] sm:text-[11px] font-black px-6 py-2 rounded-lg border border-emerald-500/30 uppercase tracking-widest shadow-inner inline-block w-full">
                                ✅ BU MAÇIN PUANLARI DAĞITILDI
                              </div>
                              <button onClick={() => handleAction('Geri Al', match.match_index, match, currentWinners, displayPoints)} className="bg-red-900/80 hover:bg-red-700 text-red-200 text-[9px] font-bold px-3 py-1.5 rounded uppercase border border-red-500/50 transition-all shadow-[0_0_10px_rgba(220,38,38,0.3)] mt-2 w-3/4 mx-auto block">
                                İPTAL ET & PUANLARI GERİ AL
                              </button>
                            </div>
                          ) : (
                            <>
                              <button onClick={() => handleAction('Skoru Güncelle', match.match_index, match, currentWinners, displayPoints)} className="bg-blue-600/80 hover:bg-blue-500 text-white text-[9px] sm:text-[10px] font-bold px-3 py-1.5 rounded uppercase border border-blue-400 transition-all shadow-md">
                                1. ADIM: CANLIYA YANSIT
                              </button>
                              <button onClick={() => handleAction('Maçı Onayla (Puan Dağıt)', match.match_index, match, currentWinners, displayPoints)} className="bg-emerald-600/80 hover:bg-emerald-500 text-white text-[9px] sm:text-[10px] font-bold px-3 py-1.5 rounded uppercase border border-emerald-400 transition-all shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                                2. ADIM: MAÇI BİTİR (DAĞIT)
                              </button>
                              <button onClick={() => handleAction('Resetle', match.match_index, match, currentWinners, displayPoints)} className="bg-red-600/80 hover:bg-red-500 text-white text-[9px] sm:text-[10px] font-bold px-3 py-1.5 rounded uppercase border border-red-400 transition-all shadow-md">
                                SIFIRLA
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={`${theme.bottomBar} border-t px-4 py-4 w-full backdrop-blur-md z-10 relative min-h-[90px]`}>
                      <div className="flex items-center justify-between mb-3 w-full">
                         <div className="flex items-center gap-2">
                             <span className="text-red-500 text-sm drop-shadow-md">🎯</span> 
                             <span className="text-amber-500 font-bold text-[10px] sm:text-xs tracking-widest uppercase">
                                 {winnersCount > 0 ? `${winnersCount} KİŞİ BİLDİ (Kişi Başı: ${displayPoints} Puan)` : "BU SKORU BİLEN YOK"}
                             </span>
                         </div>
                         <span className={`text-[9px] font-black tracking-widest whitespace-nowrap px-2.5 py-0.5 rounded block shadow-[0_0_10px_currentColor] border ${theme.tagText} ${theme.tagBg} ${theme.tagBorder}`}>
                            {isTffMatch ? "TFF MAÇI" : "DFO MAÇI"}
                         </span>
                         {winnersCount > 0 && (
                            <button onClick={() => toggleWinners(match.match_index)} className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-[10px] sm:text-xs outline-none whitespace-nowrap drop-shadow-sm">
                              {isWinnersOpen ? "Gizle ▲" : "Bilenleri gör →"}
                            </button>
                         )}
                      </div>
                      
                      {isWinnersOpen && winnersCount > 0 && (
                         <div className="flex items-center justify-center border-t border-slate-700/50 pt-3 animate-fadeIn">
                            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                               {currentWinners.map((p, i) => (
                                   <span key={i} className="bg-slate-950/80 border px-2 py-1 rounded text-[9px] sm:text-[10px] font-bold text-white shadow-sm uppercase tracking-wider border-slate-600/50">
                                      {p}
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
        )}

        {/* ========================================================================================= */}
        {/* 2. CEPHE: YENİ BÜLTEN ÜRETİM FABRİKASI */}
        {/* ========================================================================================= */}
        {activeTab === 'bulletin' && userRole === 'master' && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-800 pb-4">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-black text-indigo-400 tracking-tight flex items-center justify-center sm:justify-start gap-3 uppercase">
                  <span className="text-3xl">🏭</span> BÜLTEN ÜRETİM FABRİKASI
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Seçilen liglerde (Örn: Süper Lig) bir takım yalnızca 1 kez seçilebilir. Liste otomatik eksilir.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                 <span className="text-slate-400 font-bold text-sm">HEDEF HAFTA:</span>
                 <select 
                   value={bulletinWeek} 
                   onChange={e => setBulletinWeek(Number(e.target.value))}
                   className="bg-indigo-950 border border-indigo-500/50 text-indigo-300 font-black text-xl px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] outline-none cursor-pointer"
                 >
                    <option value={4}>4. HAFTA</option>
                    <option value={5}>5. HAFTA</option>
                    <option value={6}>6. HAFTA</option>
                    <option value={7}>7. HAFTA</option>
                    <option value={8}>8. HAFTA</option>
                    <option value={9}>9. HAFTA</option>
                    <option value={10}>10. HAFTA</option>
                 </select>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-2xl">
               
               <div className="flex justify-end mb-4">
                  <button 
                    onClick={copyDateTimeToAll} 
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                  >
                    👇 1. Maçın Tarih/Saatini Tümüne Kopyala
                  </button>
               </div>

               <div className="overflow-x-auto custom-scrollbar pb-6">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                     <thead>
                        <tr className="bg-slate-950 border-y border-slate-700">
                           <th className="p-3 text-amber-500 font-black text-sm w-12 text-center">NO</th>
                           <th className="p-3 text-slate-400 font-bold text-xs uppercase tracking-widest w-48">Kategori / LİG</th>
                           <th className="p-3 text-slate-400 font-bold text-xs uppercase tracking-widest w-36">Tarih</th>
                           <th className="p-3 text-slate-400 font-bold text-xs uppercase tracking-widest w-28">Saat</th>
                           <th className="p-3 text-emerald-400 font-bold text-xs uppercase tracking-widest">Ev Sahibi (Akıllı Liste)</th>
                           <th className="p-3 text-red-400 font-bold text-xs uppercase tracking-widest">Deplasman (Akıllı Liste)</th>
                        </tr>
                     </thead>
                     <tbody>
                        {bulletinMatches.map((m, idx) => {
                          const isFocused = focusedRowIndex === idx;
                          const isFilled = m.home_team.trim() !== "" && m.away_team.trim() !== "";
                          
                          return (
                           <tr 
                             key={m.match_index} 
                             className={`transition-all duration-300 border-b ${
                               isFocused 
                                ? 'bg-indigo-950/40 border-indigo-500 shadow-[inset_0_0_20px_rgba(79,70,229,0.3)]' 
                                : isFilled
                                ? 'bg-emerald-950/10 border-emerald-500/30 shadow-[inset_0_0_10px_rgba(16,185,129,0.05)]'
                                : 'border-slate-800/50 hover:bg-slate-800/30'
                             }`}
                           >
                              <td className={`p-2 text-center font-black transition-colors ${
                                isFocused ? 'text-indigo-400' : isFilled ? 'text-emerald-500' : 'text-slate-500'
                              }`}>
                                {m.match_index}
                              </td>
                              
                              <td className="p-2">
                                 <select 
                                   value={m.category} 
                                   onChange={e => handleBulletinChange(idx, 'category', e.target.value)}
                                   onFocus={() => setFocusedRowIndex(idx)}
                                   className={`w-full text-[11px] font-bold px-2 py-2.5 rounded outline-none cursor-pointer transition-all ${
                                     isFocused 
                                      ? 'bg-slate-900 border border-indigo-400 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]' 
                                      : 'bg-slate-950 border border-slate-700 text-slate-300'
                                   }`}
                                 >
                                    {dynamicCategoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                 </select>
                              </td>

                              <td className="p-2">
                                 <select 
                                   value={m.match_date} 
                                   onChange={e => handleBulletinChange(idx, 'match_date', e.target.value)}
                                   onFocus={() => setFocusedRowIndex(idx)}
                                   className={`w-full font-bold text-xs px-2 py-2.5 rounded outline-none text-center cursor-pointer transition-all ${
                                     isFocused 
                                      ? 'bg-slate-900 border border-indigo-400 text-emerald-300 shadow-[0_0_10px_rgba(79,70,229,0.5)]' 
                                      : 'bg-slate-950 border border-slate-700 text-emerald-400'
                                   }`}
                                 >
                                    {currentWeekDates.map(d => <option key={d} value={d}>{d}</option>)}
                                 </select>
                              </td>

                              <td className="p-2">
                                 <select 
                                   value={m.match_time} 
                                   onChange={e => handleBulletinChange(idx, 'match_time', e.target.value)}
                                   onFocus={() => setFocusedRowIndex(idx)}
                                   className={`w-full font-black text-xs px-2 py-2.5 rounded outline-none text-center cursor-pointer transition-all ${
                                     isFocused 
                                      ? 'bg-slate-900 border border-indigo-400 text-amber-300 shadow-[0_0_10px_rgba(79,70,229,0.5)]' 
                                      : 'bg-slate-950 border border-slate-700 text-amber-400'
                                   }`}
                                 >
                                    {timeOptionsArr.map(t => <option key={t} value={t}>{t}</option>)}
                                 </select>
                              </td>

                              <td className="p-2">
                                 <select 
                                   value={m.home_team} 
                                   onChange={e => handleBulletinChange(idx, 'home_team', e.target.value)}
                                   onFocus={() => setFocusedRowIndex(idx)}
                                   className={`w-full text-white font-bold text-[11px] px-2 py-2.5 rounded outline-none cursor-pointer uppercase transition-all ${
                                     isFocused 
                                      ? 'bg-slate-900 border border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]' 
                                      : isFilled 
                                      ? 'bg-emerald-950/40 border border-emerald-500/50 text-emerald-100 shadow-inner'
                                      : 'bg-slate-950 border border-emerald-900/50 shadow-inner'
                                   }`}
                                 >
                                    <option value="" className="text-slate-500">-- TAKIM SEÇİNİZ --</option>
                                    {getAvailableTeams(idx, true).map(t => <option key={`h-${t}`} value={t}>{t}</option>)}
                                 </select>
                              </td>

                              <td className="p-2">
                                 <select 
                                   value={m.away_team} 
                                   onChange={e => handleBulletinChange(idx, 'away_team', e.target.value)}
                                   onFocus={() => setFocusedRowIndex(idx)}
                                   className={`w-full text-white font-bold text-[11px] px-2 py-2.5 rounded outline-none cursor-pointer uppercase transition-all ${
                                     isFocused 
                                      ? 'bg-slate-900 border border-red-400 shadow-[0_0_15px_rgba(248,113,113,0.4)]' 
                                      : isFilled 
                                      ? 'bg-red-950/40 border border-red-500/50 text-red-100 shadow-inner'
                                      : 'bg-slate-950 border border-red-900/50 shadow-inner'
                                   }`}
                                 >
                                    <option value="" className="text-slate-500">-- TAKIM SEÇİNİZ --</option>
                                    {getAvailableTeams(idx, false).map(t => <option key={`a-${t}`} value={t}>{t}</option>)}
                                 </select>
                              </td>
                           </tr>
                          )
                        })}
                     </tbody>
                  </table>
               </div>

               <div className="mt-8 flex justify-center pb-4">
                  <button 
                    onClick={saveBulletinToDB}
                    disabled={isPublishing}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-black text-lg md:text-xl px-12 py-5 rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all hover:scale-105 border border-indigo-400/50 flex items-center gap-3"
                  >
                     {isPublishing ? '📡 VERİLER SUNUCUYA İLETİLİYOR...' : `🚀 ${bulletinWeek}. HAFTA BÜLTENİNİ MÜHÜRLE VE YAYINLA`}
                  </button>
               </div>

            </div>
          </div>
        )}

        {/* ========================================================================================= */}
        {/* 3. CEPHE: TAHMİN YÖNETİMİ ODASI */}
        {/* ========================================================================================= */}
        {activeTab === 'predictions' && userRole === 'master' && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-800 pb-4">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-black text-emerald-400 tracking-tight flex items-center justify-center sm:justify-start gap-3 uppercase">
                  <span className="text-3xl">📊</span> TAHMİN DURUM PANELİ
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Görev kağıtlarını dolduranları ve eksik kalanları buradan takip edebilirsiniz.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                 <span className="text-slate-400 font-bold text-sm">İNCELENECEK HAFTA:</span>
                 <select 
                   value={selectedPredictionWeek} 
                   onChange={e => setSelectedPredictionWeek(Number(e.target.value))}
                   className="bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-black text-xl px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] outline-none cursor-pointer"
                 >
                    <option value={4}>4. HAFTA</option>
                    <option value={5}>5. HAFTA</option>
                    <option value={6}>6. HAFTA</option>
                    <option value={7}>7. HAFTA</option>
                    <option value={8}>8. HAFTA</option>
                    <option value={9}>9. HAFTA</option>
                    <option value={10}>10. HAFTA</option>
                 </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* SOL SÜTUN: EKSİKLER (KIRMIZI LİSTE) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                 <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-black text-rose-400 flex items-center gap-2">
                       <span className="text-xl">⏳</span> TAHMİN GİRMEYENLER
                    </h2>
                    <span className="bg-rose-950 text-rose-400 px-3 py-1 rounded-lg text-sm font-bold border border-rose-900/50">
                       {missingPlayers.length} KİŞİ
                    </span>
                 </div>
                 
                 <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                    {missingPlayers.length === 0 ? (
                       <div className="text-center py-8 text-slate-500 italic">Eksik tahmin yok, herkes görevi tamamlamış!</div>
                    ) : (
                       missingPlayers.map(id => (
                         <div key={id} className="bg-slate-950/50 border border-rose-900/30 p-3 rounded-xl flex justify-between items-center group hover:bg-slate-900 transition-colors">
                            <span className="font-bold text-slate-300 text-sm">{mergedPlayers[id]}</span>
                            <span className="text-[10px] font-black tracking-widest text-rose-500 bg-rose-950/50 px-2 py-1 rounded border border-rose-900/50">BEKLENİYOR</span>
                         </div>
                       ))
                    )}
                 </div>
              </div>

              {/* SAĞ SÜTUN: TAMAMLAYANLAR (YEŞİL LİSTE) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                 <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-black text-emerald-400 flex items-center gap-2">
                       <span className="text-xl">✅</span> GÖREVİ TAMAMLAYANLAR
                    </h2>
                    <span className="bg-emerald-950 text-emerald-400 px-3 py-1 rounded-lg text-sm font-bold border border-emerald-900/50">
                       {submittedPlayers.length} KİŞİ
                    </span>
                 </div>
                 
                 <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                    {submittedPlayers.length === 0 ? (
                       <div className="text-center py-8 text-slate-500 italic">Henüz bu hafta için tahmin giren kimse yok.</div>
                    ) : (
                       submittedPlayers.map(id => {
                          const isExpanded = expandedPlayer === id;
                          const preds = playerPredictionsMap[id] || [];

                          return (
                            <div key={id} className={`border rounded-xl transition-all duration-300 overflow-hidden ${isExpanded ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-slate-950/50 border-emerald-900/30 hover:bg-slate-900'}`}>
                               <div 
                                 className="p-3 flex justify-between items-center cursor-pointer"
                                 onClick={() => setExpandedPlayer(isExpanded ? null : id)}
                               >
                                  <span className="font-bold text-emerald-100 text-sm">{mergedPlayers[id]}</span>
                                  <div className="flex items-center gap-3">
                                     <span className="text-[10px] font-black tracking-widest text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded border border-emerald-900/50">TAMAM</span>
                                     <span className="text-slate-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                                  </div>
                               </div>
                               
                               {isExpanded && (
                                  <div className="p-3 bg-slate-950 border-t border-emerald-900/30">
                                     <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                        {preds.map((score, index) => {
                                           const matchInfo = predictionBulletinData[index] || {};
                                           const hTeam = matchInfo.home_team || "EV";
                                           const aTeam = matchInfo.away_team || "DEP";
                                           
                                           const hLogo = teamLogosMap[hTeam] || "/logos/default.png";
                                           const aLogo = teamLogosMap[aTeam] || "/logos/default.png";
                                           
                                           const hShort = hTeam.substring(0, 3);
                                           const aShort = aTeam.substring(0, 3);

                                           return (
                                              <div key={index} className="relative flex flex-col items-center justify-center bg-slate-900 border border-slate-700/50 pt-4 pb-2 px-1 rounded-xl shadow-sm hover:border-emerald-500/50 transition-colors">
                                                 <div className="absolute -top-2 bg-slate-800 border border-slate-600 px-2 py-0.5 rounded text-[8px] font-black tracking-widest text-slate-400 shadow-sm">
                                                    M{index + 1}
                                                 </div>
                                                 
                                                 <div className="flex items-center justify-between w-full mt-1">
                                                    <div className="flex flex-col items-center justify-center w-1/3">
                                                       <img src={hLogo} alt={hShort} className="w-6 h-6 object-contain drop-shadow-md mb-0.5" />
                                                       <span className="text-[8px] font-bold text-slate-400 uppercase">{hShort}</span>
                                                    </div>
                                                    <div className="bg-slate-950 px-2 py-1 rounded border border-slate-800 flex justify-center items-center shadow-inner">
                                                       <span className="text-xs font-black text-amber-400 tracking-wider">{score}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center justify-center w-1/3">
                                                       <img src={aLogo} alt={aShort} className="w-6 h-6 object-contain drop-shadow-md mb-0.5" />
                                                       <span className="text-[8px] font-bold text-slate-400 uppercase">{aShort}</span>
                                                    </div>
                                                 </div>
                                              </div>
                                           );
                                        })}
                                     </div>
                                  </div>
                               )}
                            </div>
                          )
                       })
                    )}
                 </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================================= */}
        {/* 4. CEPHE: YARIŞMACI YÖNETİMİ ODASI */}
        {/* ========================================================================================= */}
        {activeTab === 'players' && userRole === 'master' && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-800 pb-4">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-black text-fuchsia-400 tracking-tight flex items-center justify-center sm:justify-start gap-3 uppercase">
                  <span className="text-3xl">👥</span> YARIŞMACI YÖNETİMİ
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Sisteme yeni yarışmacı dahil edebilir veya disiplinsizlik yapanları ihraç edebilirsiniz.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* SOL SÜTUN: YENİ ASKER ALMA MERKEZİ (EKLEME FORMU) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
                 <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-black text-fuchsia-400 flex items-center gap-2">
                       <span className="text-xl">➕</span> YENİ ASLAN PARÇASI EKLE
                    </h2>
                 </div>
                 
                 <form onSubmit={handleAddNewPlayer} className="flex flex-col gap-5">
                    <div>
                       <label className="block text-xs font-bold text-slate-400 tracking-widest mb-1.5 ml-1">6 HANELİ YARIŞMACI ID</label>
                       <input 
                         type="text" 
                         value={newPlayerId} 
                         onChange={e => setNewPlayerId(e.target.value)} 
                         placeholder="Örn: 262888"
                         maxLength={6}
                         className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-4 py-3 rounded-xl outline-none focus:border-fuchsia-500 font-black tracking-widest shadow-inner placeholder:text-slate-600"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-400 tracking-widest mb-1.5 ml-1">İSİM SOYİSİM</label>
                       <input 
                         type="text" 
                         value={newPlayerName} 
                         onChange={e => setNewPlayerName(e.target.value)} 
                         placeholder="Örn: SİNAN ENGİN"
                         className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-4 py-3 rounded-xl outline-none focus:border-fuchsia-500 font-black tracking-widest uppercase shadow-inner placeholder:text-slate-600"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-400 tracking-widest mb-1.5 ml-1">GİRİŞ ŞİFRESİ</label>
                       <input 
                         type="text" 
                         value={newPlayerPass} 
                         onChange={e => setNewPlayerPass(e.target.value)} 
                         placeholder="Örn: 19030"
                         className="w-full bg-slate-950 border border-slate-700 text-amber-400 px-4 py-3 rounded-xl outline-none focus:border-fuchsia-500 font-black tracking-widest shadow-inner placeholder:text-slate-600"
                       />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isPlayerLoading}
                      className="mt-4 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-slate-700 text-white font-black tracking-widest py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(192,38,211,0.4)] flex justify-center items-center gap-2"
                    >
                      {isPlayerLoading ? 'KAYDEDİLİYOR...' : 'SİSTEME KAYDET VE GÖNDER'}
                    </button>
                 </form>
              </div>

              {/* SAĞ SÜTUN: DİSİPLİN KURULU (LİSTE VE SİLME) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                 <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-black text-rose-500 flex items-center gap-2">
                       <span className="text-xl">⚖️</span> DİSİPLİN KURULU (TÜM LİSTE)
                    </h2>
                    <span className="bg-slate-950 text-slate-400 px-3 py-1 rounded-lg text-xs font-bold border border-slate-800">
                       Veritabanındaki Liste
                    </span>
                 </div>
                 
                 <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                    {dbPlayersList.length === 0 ? (
                       <div className="text-center py-8 text-slate-500 italic">Veritabanında kayıtlı kimse yok.</div>
                    ) : (
                       dbPlayersList.map(p => (
                         <div key={p.id} className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex justify-between items-center group hover:border-slate-600 transition-colors">
                            <div className="flex flex-col">
                               <span className="font-black text-slate-200 text-sm uppercase tracking-wide">{p.full_name}</span>
                               <span className="text-[10px] font-bold text-slate-500 tracking-widest mt-0.5">ID: {p.user_id} | ŞİFRE: {p.password}</span>
                            </div>
                            <button 
                              onClick={() => handleBanishPlayer(p.user_id, p.full_name)}
                              className="bg-rose-950/80 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-900/50 hover:border-rose-500 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all shadow-[0_0_10px_rgba(225,29,72,0.1)] hover:shadow-[0_0_15px_rgba(225,29,72,0.4)]"
                            >
                               ❌ İHRAÇ ET
                            </button>
                         </div>
                       ))
                    )}
                 </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================================= */}
        {/* 🚀🚀 5. CEPHE: TAKIM YÖNETİMİ ODASI (DİNAMİK COMBOBOX İLE) 🚀🚀 */}
        {/* ========================================================================================= */}
        {activeTab === 'teams' && userRole === 'master' && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-800 pb-4">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-black text-cyan-400 tracking-tight flex items-center justify-center sm:justify-start gap-3 uppercase">
                  <span className="text-3xl">🛡️</span> TAKIM CEPHANELİĞİ
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Bültenlerde görünecek yeni takımları ve logolarını buradan ekleyebilir veya silebilirsiniz.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* SOL SÜTUN: YENİ TAKIM EKLEME MERKEZİ */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
                 <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-black text-cyan-400 flex items-center gap-2">
                       <span className="text-xl">➕</span> YENİ TAKIM EKLE
                    </h2>
                 </div>
                 
                 <form onSubmit={handleAddNewTeam} className="flex flex-col gap-5">
                    <div>
                       <label className="block text-xs font-bold text-slate-400 tracking-widest mb-1.5 ml-1">TAKIM ADI</label>
                       <input 
                         type="text" 
                         value={newTeamName} 
                         onChange={e => setNewTeamName(e.target.value)} 
                         placeholder="Örn: BALÇOVA YAŞAM SPOR"
                         className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-4 py-3 rounded-xl outline-none focus:border-cyan-500 font-black tracking-widest uppercase shadow-inner placeholder:text-slate-600"
                       />
                    </div>
                    
                    {/* 🚀 AKILLI COMBOBOX (İSTER SEÇ, İSTER YAZ) */}
                    <div>
                       <label className="block text-xs font-bold text-slate-400 tracking-widest mb-1.5 ml-1">BAĞLI OLDUĞU LİG (İSTER SEÇ, İSTER YAZ)</label>
                       <input 
                         list="leagueOptions"
                         value={newTeamLeague} 
                         onChange={e => setNewTeamLeague(e.target.value.toUpperCase())} 
                         placeholder="Örn: TFF 2.LİG veya listeden seçin..."
                         className="w-full bg-slate-950 border border-slate-700 text-slate-300 px-4 py-3 rounded-xl outline-none focus:border-cyan-500 font-bold tracking-widest shadow-inner uppercase placeholder:text-slate-600"
                       />
                       <datalist id="leagueOptions">
                          {teamLeagueOptions.map(l => <option key={l} value={l} />)}
                       </datalist>
                    </div>

                    <div>
                       <label className="block text-xs font-bold text-slate-400 tracking-widest mb-1.5 ml-1">LOGO LİNKİ (VİKİPEDİ / URL)</label>
                       <input 
                         type="text" 
                         value={newTeamLogo} 
                         onChange={e => setNewTeamLogo(e.target.value)} 
                         placeholder="Örn: https://upload.wikimedia.org/.../logo.svg"
                         className="w-full bg-slate-950 border border-slate-700 text-amber-400 px-4 py-3 rounded-xl outline-none focus:border-cyan-500 font-mono text-sm tracking-tight shadow-inner placeholder:text-slate-600"
                       />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isTeamLoading}
                      className="mt-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-black tracking-widest py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(8,145,178,0.4)] flex justify-center items-center gap-2"
                    >
                      {isTeamLoading ? 'KAYDEDİLİYOR...' : 'TAKIMI SİSTEME KAYDET'}
                    </button>
                 </form>
              </div>

              {/* SAĞ SÜTUN: KAYITLI TAKIMLAR (LİSTE VE SİLME) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                 <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-black text-rose-500 flex items-center gap-2">
                       <span className="text-xl">📋</span> VERİTABANINDAKİ TAKIMLAR
                    </h2>
                    <span className="bg-slate-950 text-slate-400 px-3 py-1 rounded-lg text-xs font-bold border border-slate-800">
                       {dbTeamsList.length} Takım Kayıtlı
                    </span>
                 </div>
                 
                 <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                    {dbTeamsList.length === 0 ? (
                       <div className="text-center py-8 text-slate-500 italic">Veritabanında kayıtlı takım yok.</div>
                    ) : (
                       dbTeamsList.map(t => (
                         <div key={t.id} className="bg-slate-950/80 border border-slate-800 p-2 sm:p-3 rounded-xl flex justify-between items-center group hover:border-cyan-900/50 transition-colors gap-2">
                            <div className="flex items-center gap-3 overflow-hidden">
                               <div className="w-10 h-10 bg-slate-900 rounded border border-slate-700 flex items-center justify-center flex-shrink-0 p-1">
                                  <img src={t.logo_url} alt={t.team_name} className="max-w-full max-h-full object-contain drop-shadow-md" />
                               </div>
                               <div className="flex flex-col overflow-hidden">
                                  <span className="font-black text-slate-200 text-[11px] sm:text-xs uppercase tracking-wide truncate">{t.team_name}</span>
                                  <span className="text-[9px] sm:text-[10px] font-bold text-cyan-500/70 tracking-widest mt-0.5 truncate">{t.league}</span>
                               </div>
                            </div>
                            <button 
                              onClick={() => handleDeleteTeam(t.team_name)}
                              className="flex-shrink-0 bg-rose-950/80 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-900/50 hover:border-rose-500 px-2 py-1.5 rounded-lg text-[9px] font-black tracking-widest transition-all shadow-[0_0_10px_rgba(225,29,72,0.1)] hover:shadow-[0_0_15px_rgba(225,29,72,0.4)]"
                            >
                               ❌ SİL
                            </button>
                         </div>
                       ))
                    )}
                 </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}