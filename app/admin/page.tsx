'use client';

import React, { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from '@/utils/supabase';


const staticPlayersList: Record<string, string> = {
  "262702": "MURAT KARA",
  "262703": "CEMALETTİN BELLİ",
  "262704": "YAPAY ZEKA",
  "262705": "AHMET BİRCAN 🏆",
  "262706": "GAZİ AYAN 🏆🏆",
  "262707": "HAKAN AYAN",
  "262708": "BAYRAM YILMAZ",
  "262709": "SALİH KARACAOĞLU",
  "262711": "RIDVAN DOGER",
  "262712": "MURAT AYDEMİR",
  "262714": "İSMAİL EKER 🏆",
  "262715": "ŞEMSETTIN DÜGER",
  "262716": "BİROL DEMİREL",
  "262717": "MURAT ALİ",
  "262718": "BEKİR KARADAĞ",
  "262719": "UĞUR VARDAR",
  "262721": "MUSTAFA GÜMÜŞÇÜ",
  "262723": "AYHAN LUŞOĞLU",
  "262725": "İLYAS KAZDAL",
  "262726": "HUDAVER TOPARDIC",
  "262728": "ÖNDER ASLAN",
  "262730": "ÖNDER IŞIK",
  "262731": "FATİH AYAN",
  "262732": "R. İLHAN KARACA 🏆🏆",
  "262733": "MUHSİN ASİLKAN",
  "262734": "LEVENT YILDIRIM",
  "262735": "AYGÜN AKKEÇELİ",
  "262736": "MEHMET ALİ KARA",
  "262737": "ŞAHİN GEZGİNCİ",
  "262738": "MEVLÜT EVLER",
  "262739": "UĞUR GÜRBÜZ",
  "262740": "ABDULLAH DİK",
  "262741": "SABAHATTİN ÇAYLAK",
  "262744": "İLYAS UYGUN",
  "262747": "SAVAŞ ÇAĞLAYAN",
  "262749": "B.VEYSELOĞLU EROL",
  "262750": "MAHMUT CBR",
  "262753": "YUSUF KIZILTUĞ",
  "262754": "OSMAN ALİ AYDIN 🏆",
  "262755": "DOĞAÇ ALKAN",
  "262756": "EYÜP KARACAOĞLU",
  "262758": "MELİH PINAR",
  "262763": "MUSTAFA ELMAS",
  "262770": "OZKAYA MAZAKALI BAYRAM",
  "262771": "ULAŞ ADIGÜZEL",
  "262772": "CEMAL SİVRİKAYA 🏆",
  "262774": "ŞENOL CAN ÇAKICI",
  "262782": "YUSUF ERBAY",
  "262786": "SEDAT DİŞLİ",
  "262787": "MUSTAFA TUCİ",
  "262790": "CUMALİ SÖKER",
  "262813": "KEMAL ERSOY",
  "262816": "SEDAT SEDAT",
  "351925": "ALİOS GÖZTEPE"
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

// 🔴 KARARGAH ANA LİG HAVUZU 🔴
const LIG_HAVUZU: Record<string, string[]> = {
  "TÜRKİYE SÜPER LİG": [
    "ALANYASPOR", "AMED SPOR", "BAŞAKŞEHİR", "BEŞİKTAŞ", "ÇAYKUR RİZE", "ÇORUM FK", 
    "ERZURUMSPOR", "EYÜPSPOR", "FENERBAHÇE", "GALATASARAY", "GAZİANTEP FK", "GENÇLERBİRLİĞİ", 
    "GÖZTEPE", "KASIMPAŞA", "KOCAELİSPOR", "KONYASPOR", "SAMSUNSPOR", "TRABZONSPOR"
  ],
  "TÜRKİYE 1. LİG": [
    "ANTALYASPOR", "BANDIRMASPOR", "BATMAN PETROL SPOR", "BODRUMSPOR", "BOLUSPOR", "BURSASPOR", 
    "EROKSPOR", "FATİH KARAGÜMRÜK", "IĞDIR FK", "İSTANBULSPOR", "KAYSERİSPOR", "KEÇİÖRENGÜCÜ", 
    "MANİSA FK", "MARDİN 1969", "MUĞLASPOR", "PENDİKSPOR", "SARIYER", "SİVASSPOR", "ÜMRANİYE SPOR", "VANSPOR FK"
  ],
  "İNGİLTERE PREMIER LİG": [
    "ARSENAL", "ASTON VILLA", "BOURNEMOUTH", "BRENTFORD", "BRIGHTON", "CHELSEA", "COVENTRY CITY", 
    "CRYSTAL PALACE", "EVERTON", "FULHAM", "HULL CITY", "IPSWICH TOWN", "LEEDS UNITED", "LIVERPOOL", 
    "MANCHESTER CITY", "MANCHESTER UNITED", "NEWCASTLE UNITED", "NOTTINGHAM FOREST", "SUNDERLAND", "TOTTENHAM HOTSPUR"
  ],
  "ALMANYA BUNDESLIGA": [
    "AUGSBURG", "BAYER LEVERKUSEN", "BAYERN MÜNİH", "BORUSSIA DORTMUND", "MÖNCHENGLADBACH", "EINTRACHT FRANKFURT", 
    "ELVERSBERG", "FREIBURG", "HAMBURG", "HOFFENHEIM", "KÖLN", "MAINZ 05", "RB LEIPZIG", "SCHALKE 04", "STUTTGART", "UNION BERLIN", "WERDER BREMEN", "WOLFSBURG", "BOCHUM", "ST. PAULI", "HEIDENHEIM", "HOLSTEIN KIEL"
  ],
  "FRANSA LIGUE 1": [
    "ANGERS", "BREST", "LE MANS", "LENS", "LILLE", "LORIENT", "LYON", "MARSİLYA", "MONACO", "PARIS FC", "PARIS SAINT-GERMAIN", 
    "RENNES", "STRASBOURG", "TOULOUSE", "TROYES", "NICE", "LE HAVRE", "AUXERRE", "NANTES", "REIMS"
  ],
  "İTALYA SERIE A": [
    "ATALANTA", "BOLOGNA", "CAGLIARI", "COMO", "FIORENTINA", "FROSINONE", "GENOA", "INTER", "JUVENTUS", "LAZIO", 
    "LECCE", "MILAN", "NAPOLI", "PARMA", "ROMA", "SASSUOLO", "TORINO", "UDINESE", "VENEZIA", "MONZA", "HELLAS VERONA", "EMPOLI"
  ],
  "İSPANYA LA LIGA": [
    "ALAVÉS", "ATLÉTICO MADRID", "ATHLETIC BILBAO", "BARCELONA", "CELTA VIGO", "DEPORTIVO LA CORUÑA", "ELCHE", "ESPANYOL", 
    "GETAFE", "LEVANTE", "OSASUNA", "RACING SANTANDER", "RAYO VALLECANO", "REAL BETIS", "REAL MADRID", "REAL SOCIEDAD", "SEVILLA", "VALENCIA", "VILLARREAL", "MALAGA", "GIRONA", "MALLORCA", "LAS PALMAS", "LEGANES"
  ],
  "HOLLANDA EREDIVISIE": [
    "AJAX", "PSV", "FEYENOORD", "AZ ALKMAAR", "TWENTE", "NEC NIJMEGEN"
  ],
  "PORTEKİZ PRIMEIRA LIGA": [
    "BENFICA", "PORTO", "SPORTING CP", "BRAGA"
  ],
  "BELÇİKA PRO LEAGUE": [
    "CLUB BRUGGE", "ANDERLECHT", "USG", "GENK", "GENT", "ROYAL ANTWERP"
  ],
  "MİLLİ TAKIMLAR": [
    "ALMANYA", "ARJANTİN", "BELÇİKA", "BREZİLYA", "FRANSA", "HOLLANDA", "İNGİLTERE", "İSPANYA", "İTALYA", "PORTEKİZ", "TÜRKİYE", "URUGUAY", "HIRVATİSTAN"
  ],
  "ÇEŞİTLİ AVRUPA TAKIMLARI": [
    "KARABAĞ FK", "DINAMO KIEV", "SLOVAN BRATISLAVA", "KIZILYILDIZ", "FCSB", "RAPID WIEN", "PANATHINAIKOS", "HAJDUK SPLIT", "SPARTA PRAG", "OLIMPIYAKOS"
  ]
};

// 🔴 KARARGAHIN EN GÜNCEL FOTMOB VE WIKIPEDIA LOGO CEPHANELİĞİ 🔴
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

  // YEREL KLASÖRLER
  "ÇORUM FK": "/logos/corum-fk.png", "ESENLER EROKSPOR": "/logos/erokspor.png", "EROKSPOR": "/logos/erokspor.png",
  "SARIYER": "/logos/sariyer.png", "PENDİKSPOR": "/logos/pendikspor.png", "BOLUSPOR": "/logos/boluspor.png", 
  "İSTANBULSPOR": "/logos/istanbulspor.png", "BODRUMSPOR": "/logos/bodrumspor.png", "ERZURUMSPOR": "/logos/erzurumspor.png",
  "MUĞLASPOR": "/logos/muglaspor.png", "BANDIRMASPOR": "/logos/bandirmaspor.png", 
  "VOJVODINA": "/logos/vojvodina.png", "FERENCVAROS": "/logos/ferencvaros.png",
  "HAMMARBY": "/logos/hammarby.png", 
  "GENT": "/logos/gent.png", "AJAX": "/logos/ajax.png", 
  "BRAGA": "/logos/braga.png", "PAOK": "/logos/paok.png", "ANDERLECHT": "/logos/anderlecht.png", 
  "TWENTE": "/logos/twente.png", "BENFICA": "/logos/benfica.png",
  "OLYMPIC LYON": "/logos/lyon.png", "OLYMPIQUE LYON": "/logos/lyon.png", "OLYMPIQUE LYONNAIS": "/logos/lyon.png", "LYON": "/logos/lyon.png",

  // 🔴 İNGİLTERE (PREMIER LİG) - FOTMOB
  "ARSENAL": "https://images.fotmob.com/image_resources/logo/teamlogo/9825.png",
  "ASTON VILLA": "https://images.fotmob.com/image_resources/logo/teamlogo/8622.png",
  "BOURNEMOUTH": "https://images.fotmob.com/image_resources/logo/teamlogo/8678.png",
  "BRENTFORD": "https://images.fotmob.com/image_resources/logo/teamlogo/9937.png",
  "BRIGHTON": "https://images.fotmob.com/image_resources/logo/teamlogo/8659.png",
  "CHELSEA": "https://images.fotmob.com/image_resources/logo/teamlogo/8455.png",
  "COVENTRY CITY": "https://images.fotmob.com/image_resources/logo/teamlogo/8288.png",
  "CRYSTAL PALACE": "https://images.fotmob.com/image_resources/logo/teamlogo/9826.png",
  "EVERTON": "https://images.fotmob.com/image_resources/logo/teamlogo/8668.png",
  "FULHAM": "https://images.fotmob.com/image_resources/logo/teamlogo/8701.png",
  "HULL CITY": "https://images.fotmob.com/image_resources/logo/teamlogo/8667.png",
  "IPSWICH TOWN": "https://images.fotmob.com/image_resources/logo/teamlogo/8677.png",
  "LEEDS UNITED": "https://images.fotmob.com/image_resources/logo/teamlogo/8463.png",
  "LIVERPOOL": "https://images.fotmob.com/image_resources/logo/teamlogo/8650.png",
  "MANCHESTER CITY": "https://images.fotmob.com/image_resources/logo/teamlogo/8456.png",
  "MANCHESTER UNITED": "https://images.fotmob.com/image_resources/logo/teamlogo/10260.png",
  "NEWCASTLE UNITED": "https://images.fotmob.com/image_resources/logo/teamlogo/8618.png",
  "NOTTINGHAM FOREST": "https://images.fotmob.com/image_resources/logo/teamlogo/10203.png",
  "SUNDERLAND": "https://images.fotmob.com/image_resources/logo/teamlogo/8472.png",
  "TOTTENHAM HOTSPUR": "https://images.fotmob.com/image_resources/logo/teamlogo/8586.png",

  // 🔴 ALMANYA (BUNDESLIGA) - FOTMOB
  "BAYERN MÜNİH": "https://images.fotmob.com/image_resources/logo/teamlogo/9823.png",
  "BAYERN MUNCHEN": "https://images.fotmob.com/image_resources/logo/teamlogo/9823.png",
  "BORUSSIA DORTMUND": "https://images.fotmob.com/image_resources/logo/teamlogo/9789.png",
  "BAYER LEVERKUSEN": "https://images.fotmob.com/image_resources/logo/teamlogo/8178.png",
  "RB LEIPZIG": "https://images.fotmob.com/image_resources/logo/teamlogo/178475.png",
  "EINTRACHT FRANKFURT": "https://images.fotmob.com/image_resources/logo/teamlogo/9810.png",
  "MÖNCHENGLADBACH": "https://images.fotmob.com/image_resources/logo/teamlogo/9788.png",
  "UNION BERLIN": "https://images.fotmob.com/image_resources/logo/teamlogo/8149.png",
  "STUTTGART": "https://images.fotmob.com/image_resources/logo/teamlogo/10269.png",
  "FREIBURG": "https://images.fotmob.com/image_resources/logo/teamlogo/8358.png",
  "HOFFENHEIM": "https://images.fotmob.com/image_resources/logo/teamlogo/8226.png",
  "MAINZ 05": "https://images.fotmob.com/image_resources/logo/teamlogo/9905.png",
  "WERDER BREMEN": "https://images.fotmob.com/image_resources/logo/teamlogo/8697.png",
  "AUGSBURG": "https://images.fotmob.com/image_resources/logo/teamlogo/8406.png",
  "WOLFSBURG": "https://images.fotmob.com/image_resources/logo/teamlogo/8721.png",
  "BOCHUM": "https://images.fotmob.com/image_resources/logo/teamlogo/9911.png",
  "ST. PAULI": "https://images.fotmob.com/image_resources/logo/teamlogo/9819.png",
  "HEIDENHEIM": "https://images.fotmob.com/image_resources/logo/teamlogo/8295.png",
  "HOLSTEIN KIEL": "https://images.fotmob.com/image_resources/logo/teamlogo/8276.png",
  "SCHALKE 04": "https://images.fotmob.com/image_resources/logo/teamlogo/10189.png",
  "HAMBURG": "https://images.fotmob.com/image_resources/logo/teamlogo/9790.png",
  "ELVERSBERG": "https://images.fotmob.com/image_resources/logo/teamlogo/8251.png",

  // 🔴 İSPANYA (LA LIGA) - FOTMOB
  "REAL MADRID": "https://images.fotmob.com/image_resources/logo/teamlogo/8633.png",
  "BARCELONA": "https://images.fotmob.com/image_resources/logo/teamlogo/8634.png",
  "ATLÉTICO MADRID": "https://images.fotmob.com/image_resources/logo/teamlogo/8302.png",
  "ATLETICO MADRID": "https://images.fotmob.com/image_resources/logo/teamlogo/8302.png",
  "ATHLETIC BILBAO": "https://images.fotmob.com/image_resources/logo/teamlogo/8315.png",
  "REAL SOCIEDAD": "https://images.fotmob.com/image_resources/logo/teamlogo/8560.png",
  "REAL BETIS": "https://images.fotmob.com/image_resources/logo/teamlogo/8603.png",
  "SEVILLA": "https://images.fotmob.com/image_resources/logo/teamlogo/8301.png",
  "VILLARREAL": "https://images.fotmob.com/image_resources/logo/teamlogo/10205.png",
  "VALENCIA": "https://images.fotmob.com/image_resources/logo/teamlogo/10267.png",
  "GIRONA": "https://images.fotmob.com/image_resources/logo/teamlogo/9869.png",
  "CELTA VIGO": "https://images.fotmob.com/image_resources/logo/teamlogo/8581.png",
  "OSASUNA": "https://images.fotmob.com/image_resources/logo/teamlogo/8371.png",
  "RAYO VALLECANO": "https://images.fotmob.com/image_resources/logo/teamlogo/8370.png",
  "GETAFE": "https://images.fotmob.com/image_resources/logo/teamlogo/8305.png",
  "MALLORCA": "https://images.fotmob.com/image_resources/logo/teamlogo/8661.png",
  "ALAVÉS": "https://images.fotmob.com/image_resources/logo/teamlogo/8388.png",
  "ALAVES": "https://images.fotmob.com/image_resources/logo/teamlogo/8388.png",
  "ESPANYOL": "https://images.fotmob.com/image_resources/logo/teamlogo/8558.png",
  "LAS PALMAS": "https://images.fotmob.com/image_resources/logo/teamlogo/8306.png",
  "LEGANES": "https://images.fotmob.com/image_resources/logo/teamlogo/8354.png",

  // 🔴 İTALYA (SERIE A) - FOTMOB
  "INTER": "https://images.fotmob.com/image_resources/logo/teamlogo/8636.png",
  "İNTER": "https://images.fotmob.com/image_resources/logo/teamlogo/8636.png",
  "MILAN": "https://images.fotmob.com/image_resources/logo/teamlogo/8564.png",
  "AC MILAN": "https://images.fotmob.com/image_resources/logo/teamlogo/8564.png",
  "JUVENTUS": "https://images.fotmob.com/image_resources/logo/teamlogo/9885.png",
  "NAPOLI": "https://images.fotmob.com/image_resources/logo/teamlogo/9875.png",
  "ROMA": "https://images.fotmob.com/image_resources/logo/teamlogo/8686.png",
  "AS ROMA": "https://images.fotmob.com/image_resources/logo/teamlogo/8686.png",
  "LAZIO": "https://images.fotmob.com/image_resources/logo/teamlogo/8543.png",
  "ATALANTA": "https://images.fotmob.com/image_resources/logo/teamlogo/8524.png",
  "FIORENTINA": "https://images.fotmob.com/image_resources/logo/teamlogo/8535.png",
  "BOLOGNA": "https://images.fotmob.com/image_resources/logo/teamlogo/9857.png",
  "TORINO": "https://images.fotmob.com/image_resources/logo/teamlogo/9804.png",
  "GENOA": "https://images.fotmob.com/image_resources/logo/teamlogo/10233.png",
  "HELLAS VERONA": "https://images.fotmob.com/image_resources/logo/teamlogo/9876.png",
  "LECCE": "https://images.fotmob.com/image_resources/logo/teamlogo/9888.png",
  "UDINESE": "https://images.fotmob.com/image_resources/logo/teamlogo/8600.png",
  "MONZA": "https://images.fotmob.com/image_resources/logo/teamlogo/6504.png",
  "CAGLIARI": "https://images.fotmob.com/image_resources/logo/teamlogo/8529.png",
  "EMPOLI": "https://images.fotmob.com/image_resources/logo/teamlogo/8534.png",
  "PARMA": "https://images.fotmob.com/image_resources/logo/teamlogo/10167.png",
  "COMO": "https://images.fotmob.com/image_resources/logo/teamlogo/8530.png",
  "VENEZIA": "https://images.fotmob.com/image_resources/logo/teamlogo/7881.png",
  "SASSUOLO": "https://images.fotmob.com/image_resources/logo/teamlogo/7943.png",
  "FROSINONE": "https://images.fotmob.com/image_resources/logo/teamlogo/7303.png",

  // 🔴 FRANSA (LIGUE 1) - FOTMOB
  "PARIS SAINT-GERMAIN": "https://images.fotmob.com/image_resources/logo/teamlogo/9847.png",
  "PARIS SG": "https://images.fotmob.com/image_resources/logo/teamlogo/9847.png",
  "PSG": "https://images.fotmob.com/image_resources/logo/teamlogo/9847.png",
  "MARSEILLE": "https://images.fotmob.com/image_resources/logo/teamlogo/8592.png",
  "MARSİLYA": "https://images.fotmob.com/image_resources/logo/teamlogo/8592.png",
  "MONACO": "https://images.fotmob.com/image_resources/logo/teamlogo/9829.png",
  "LILLE": "https://images.fotmob.com/image_resources/logo/teamlogo/8639.png",
  "NICE": "https://images.fotmob.com/image_resources/logo/teamlogo/9831.png",
  "LENS": "https://images.fotmob.com/image_resources/logo/teamlogo/8588.png",
  "RENNES": "https://images.fotmob.com/image_resources/logo/teamlogo/9850.png",
  "STRASBOURG": "https://images.fotmob.com/image_resources/logo/teamlogo/9848.png",
  "TOULOUSE": "https://images.fotmob.com/image_resources/logo/teamlogo/9941.png",
  "BREST": "https://images.fotmob.com/image_resources/logo/teamlogo/8521.png",
  "LE HAVRE": "https://images.fotmob.com/image_resources/logo/teamlogo/9747.png",
  "AUXERRE": "https://images.fotmob.com/image_resources/logo/teamlogo/8583.png",
  "ANGERS": "https://images.fotmob.com/image_resources/logo/teamlogo/8121.png",
  "NANTES": "https://images.fotmob.com/image_resources/logo/teamlogo/9830.png",
  "REIMS": "https://images.fotmob.com/image_resources/logo/teamlogo/9837.png",

  // 🔴 HOLLANDA (EREDIVISIE) - FOTMOB
  "PSV": "https://images.fotmob.com/image_resources/logo/teamlogo/8614.png",
  "PSV EINDHOVEN": "https://images.fotmob.com/image_resources/logo/teamlogo/8614.png",
  "FEYENOORD": "https://images.fotmob.com/image_resources/logo/teamlogo/8656.png",
  "AZ ALKMAAR": "https://images.fotmob.com/image_resources/logo/teamlogo/8611.png",
  
  
  // 🔴 PORTEKİZ (PRIMEIRA LIGA) - FOTMOB
  "PORTO": "https://images.fotmob.com/image_resources/logo/teamlogo/9772.png",
  "SPORTING CP": "https://images.fotmob.com/image_resources/logo/teamlogo/9768.png",
  "SPORTING LİZBON": "https://images.fotmob.com/image_resources/logo/teamlogo/9768.png",

  // 🔴 BELÇİKA (PRO LEAGUE) - FOTMOB
  "CLUB BRUGGE": "https://images.fotmob.com/image_resources/logo/teamlogo/8570.png",
  
  "GENK": "https://images.fotmob.com/image_resources/logo/teamlogo/9987.png",
  "ROYAL ANTWERP": "https://images.fotmob.com/image_resources/logo/teamlogo/9982.png"
};

const defaultCategoriesList = [
  "TÜRKİYE 2.LİG", "TÜRKİYE 3.LİG", "TÜRKİYE KUPASI", "TÜRKİYE SÜPER KUPA", "TÜRKİYE KADINLAR SÜPER LİG", "AMATÖR LİG",
  "UEFA ŞAMPİYONLAR LİGİ GURUP AŞAMASI", "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR İLK MAÇ", "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ",
  "UEFA Ş.L. ÖN ELEME 3.TUR İLK MAÇ", "UEFA Ş.L. ÖN ELEME 3.TUR RÖVANŞ", "UEFA Ş.L. PLAY OFF İLK MAÇ", "UEFA Ş.L. PLAY OFF RÖVANŞ",
  "UEFA AVRUPA LİGİ GURUP AŞAMASI", "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR İLK MAÇ", "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ",
  "UEFA A.L. ÖN ELEME 3.TUR İLK MAÇ", "UEFA A.L. ÖN ELEME 3.TUR RÖVANŞ", "UEFA A.L. PLAY OFF İLK MAÇ", "UEFA A.L. PLAY OFF RÖVANŞ",
  "UEFA KONFERANS LİGİ GURUP AŞAMASI", "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ", "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ",
  "UEFA K.L. ÖN ELEME 3.TUR İLK MAÇ", "UEFA K.L. ÖN ELEME 3.TUR RÖVANŞ", "UEFA K.L. PLAY OFF İLK MAÇ", "UEFA K.L. PLAY OFF RÖVANŞ",
  "UEFA AVRUPA ULUSLAR LİGİ", "UEFA KADINLAR ŞAMPİYONLAR LİGİ",
  "İNGİLTERE SÜPER KUPA", "UEFA SÜPER KUPA",
  "COPA DEL REY", "COPPA ITALIA", "COUPE DE FRANCE", "DFB POKAL", "EREDIVISIE", "FA CUP", "SCOTTISH PREMIER LEAGUE", "PORTEKİZ LİGİ",
  "FIFA DÜNYA KUPASI"
];

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

// 🔴 AKILLI YEREL LOGO BULUCU
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

  const [dynamicLigHavuzu, setDynamicLigHavuzu] = useState<Record<string, string[]>>(LIG_HAVUZU);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamLeague, setNewTeamLeague] = useState('');
  
  const [editTeamName, setEditTeamName] = useState('');
  const [editTargetLeague, setEditTargetLeague] = useState('');

  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const previousScoresRef = useRef<Record<string, number>>({});

  const [skorcuStatusMap, setSkorcuStatusMap] = useState<Record<string, boolean>>({
     'skorcum01': true,
     'skorcum06': true,
     'skorcum34': true
  });

  const [showOnlyToday, setShowOnlyToday] = useState<boolean>(false);

  const [selectedLiveWeek, setSelectedLiveWeek] = useState<number>(5); 
  const [liveMatchesDB, setLiveMatchesDB] = useState<any[]>([]);
  const [adminScores, setAdminScores] = useState<Record<number, { home: string, away: string }>>({});
  const [openWinnersMap, setOpenWinnersMap] = useState<{ [key: number]: boolean }>({});
  const [distributedMatches, setDistributedMatches] = useState<{ [key: number]: boolean }>({});
  const [predictionsDB, setPredictionsDB] = useState<Record<string, string[]>>({}); 
  const [liveInfoStateMap, setLiveInfoStateMap] = useState<Record<number, any>>({}); 

  const [bulletinWeek, setBulletinWeek] = useState<number>(6); 
  const [currentWeekDates, setCurrentWeekDates] = useState<string[]>(generateWeekDates(6));
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  const [selectedPredictionWeek, setSelectedPredictionWeek] = useState<number>(6);
  const [submittedPlayers, setSubmittedPlayers] = useState<string[]>([]);
  const [missingPlayers, setMissingPlayers] = useState<string[]>([]);
  const [playerPredictionsMap, setPlayerPredictionsMap] = useState<Record<string, string[]>>({});

  const [bulletinMatches, setBulletinMatches] = useState(
    Array.from({ length: 24 }, (_, i) => ({
      match_index: i + 1,
      category: '',
      match_date: generateWeekDates(6)[0],
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

       const savedHavuz = localStorage.getItem('ekmel_lig_havuzu');
       if (savedHavuz) {
           setDynamicLigHavuzu(JSON.parse(savedHavuz));
       } else {
           setDynamicLigHavuzu(LIG_HAVUZU);
       }
    }
  }, []);

  const updateLigHavuzu = (newHavuz: Record<string, string[]>) => {
    setDynamicLigHavuzu(newHavuz);
    localStorage.setItem('ekmel_lig_havuzu', JSON.stringify(newHavuz));
  };

  const getDynamicCategories = () => {
    const base = Object.keys(dynamicLigHavuzu);
    return Array.from(new Set([...base, ...defaultCategoriesList])).sort((a,b) => a.localeCompare(b, 'tr'));
  };

  const getAllTeamsFlatList = () => {
     let all: string[] = [];
     Object.values(dynamicLigHavuzu).forEach(teams => {
         all = [...all, ...teams];
     });
     return Array.from(new Set(all)).sort((a,b) => a.localeCompare(b, 'tr'));
  };

  const fetchSkorcuStatus = async () => {
     try {
       const { data } = await supabase.from('skorcu_auth').select('*');
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
          newMergedMap[String(p.username)] = p.full_name; 
       });
       setMergedPlayers(newMergedMap); 
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
        fetchAllSystemPlayers();
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
    
    const validSkorcular: Record<string, string> = {
       'skorcum01': '150101',
       'skorcum06': '191006',
       'skorcum34': '192306'
    };

    if (validSkorcular[usernameInput]) {
       if (passwordInput === validSkorcular[usernameInput]) {
          try {
             const { data } = await supabase.from('skorcu_auth').select('is_active').eq('username', usernameInput).single();
             if (data && data.is_active === false) {
                 alert("❌ YETKİLERİNİZ DONDURULDU!\nSistemden uzaklaştırıldınız. Lütfen Genelkurmay ile iletişime geçin.");
                 return;
             }
          } catch(err) {}

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
     } catch (e) {}
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
              handleLogout();
              return;
           }
         } catch(e) {}
      }

      const { data: bultenData } = await supabase.from('matches_bulletin').select('*').eq('week_num', selectedLiveWeek).order('match_index', { ascending: true });
      const { data: liveData } = await supabase.from('live_matches').select('*');
      
      let allPredictions: any[] = [];
      let fetchMore = true;
      let from = 0;
      const step = 1000;

      while (fetchMore) {
        const { data: pDataChunk, error } = await supabase
          .from('player_predictions')
          .select('*')
          .eq('week_num', selectedLiveWeek)
          .range(from, from + step - 1);
          
        if (error) {
           break;
        }

        if (pDataChunk && pDataChunk.length > 0) {
           allPredictions = [...allPredictions, ...pDataChunk];
           if (pDataChunk.length < step) {
              fetchMore = false; 
           } else {
              from += step; 
           }
        } else {
           fetchMore = false; 
        }
      }

      let currentBulten = bultenData || [];
      if (selectedLiveWeek === 4 && currentBulten.length === 0) {
         currentBulten = week4Matches.map(m => ({
            match_index: m.id, week_num: 4, category: m.category, match_date: m.date, match_time: m.time, home_team: m.homeTeam, away_team: m.awayTeam
         }));
      }

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
             if (prevTotal !== undefined && newTotal > prevTotal) goalHappened = true;
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

      if (allPredictions.length > 0) {
         const pMap: Record<string, string[]> = {};
         allPredictions.forEach(row => {
            const rowUserId = String(row.user_id);
            if(!pMap[rowUserId]) pMap[rowUserId] = Array(24).fill('-');
            pMap[rowUserId][row.match_index - 1] = row.predicted_score;
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
        const { data } = await supabase.from('matches_bulletin').select('*').eq('week_num', bulletinWeek).order('match_index', { ascending: true });

        if (data && data.length > 0) {
          const mapped = Array.from({ length: 24 }, (_, i) => {
            const existing = data.find(m => m.match_index === i + 1);
            return {
              match_index: i + 1, category: existing?.category || '', match_date: existing?.match_date || newDates[0],
              match_time: existing?.match_time || '21:00', home_team: existing?.home_team || '', away_team: existing?.away_team || ''
            };
          });
          setBulletinMatches(mapped as any);
        } else {
          setBulletinMatches(Array.from({ length: 24 }, (_, i) => ({
            match_index: i + 1, category: '', match_date: newDates[0], match_time: '21:00', home_team: '', away_team: ''
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
      let allPredictions: any[] = [];
      let fetchMore = true;
      let from = 0;
      const step = 1000;

      while (fetchMore) {
        const { data: pDataChunk, error } = await supabase
          .from('player_predictions')
          .select('*')
          .eq('week_num', selectedPredictionWeek)
          .range(from, from + step - 1);
          
        if (!error && pDataChunk && pDataChunk.length > 0) {
           allPredictions = [...allPredictions, ...pDataChunk];
           if (pDataChunk.length < step) fetchMore = false; 
           else from += step; 
        } else {
           fetchMore = false; 
        }
      }

      const pMap: Record<string, string[]> = {};
      const allUserIds = Object.keys(mergedPlayers); 

      if (selectedPredictionWeek === 4) {
         allUserIds.forEach(id => {
            if (week4PredictionsData[id] && week4PredictionsData[id].length > 0) {
               pMap[id] = week4PredictionsData[id];
            }
         });
      } else if (allPredictions.length > 0) {
         allPredictions.forEach(row => {
            const rowUserId = String(row.user_id);
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
    if (!newPlayerId || !newPlayerName || !newPlayerPass) return;
    setIsPlayerLoading(true);
    try {
       const { error } = await supabase.from('players').insert({ username: newPlayerId.trim(), full_name: newPlayerName.trim().toUpperCase(), password: newPlayerPass.trim() });
       if (error) throw error;
       alert(`✅ BAŞARILI! ${newPlayerName.toUpperCase()} karargaha katıldı!\n(Not: Listelerde hemen görünmesi için sistem otomatik yenilenecek.)`);
       setNewPlayerId(''); setNewPlayerName(''); setNewPlayerPass('');
       fetchAllSystemPlayers(); 
    } catch (err: any) { alert("❌ HATA: " + err.message); }
    setIsPlayerLoading(false);
  };

  const handleBanishPlayer = async (userId: string, userName: string) => {
    const confirmDelete = window.confirm(`DİKKAT: ${userName} (ID: ${userId}) ihraç edilecek.\n\nEğer bu kişiyi silerseniz Karargah sisteminden çıkacaktır. Emin misiniz?`);
    if (!confirmDelete) return;
    try {
       const { error } = await supabase.from('players').delete().eq('username', userId);
       if (error) throw error;
       alert(`✅ İhraç başarılı. ${userName} sistemden atıldı.`);
       fetchAllSystemPlayers(); 
    } catch (err: any) { alert("❌ Hata: " + err.message); }
  };

  const handleAddLocalTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newTeamName.trim() || !newTeamLeague.trim()) {
      alert("Lütfen takım adını ve ligini boş bırakmayın Komutanım!");
      return;
    }
    const tName = newTeamName.trim().toUpperCase();
    const tLeague = newTeamLeague.trim().toUpperCase();

    const updatedHavuz = { ...dynamicLigHavuzu };

    if (!updatedHavuz[tLeague]) {
      updatedHavuz[tLeague] = [];
    }

    let exists = false;
    Object.keys(updatedHavuz).forEach(lg => {
        if (updatedHavuz[lg].includes(tName)) exists = true;
    });

    if (exists) {
        alert(`Bu takım zaten sistemde var! İsterseniz aşağıdaki "Birlik Kaydırma" panelinden ligini değiştirebilirsiniz.`);
        return;
    }

    updatedHavuz[tLeague].push(tName);
    updatedHavuz[tLeague].sort((a,b) => a.localeCompare(b, 'tr'));

    updateLigHavuzu(updatedHavuz);
    setNewTeamName('');
    setNewTeamLeague('');
    alert(`✅ MÜKEMMEL! ${tName} takımı, ${tLeague} ligini kurarak Karargaha giriş yaptı!`);
  };

  const handleMoveTeam = (e: React.FormEvent) => {
      e.preventDefault();
      if(!editTeamName.trim() || !editTargetLeague.trim()) {
          alert("Lütfen taşınacak takımı ve hedef ligi seçin!");
          return;
      }
      const tName = editTeamName.trim().toUpperCase();
      const targetLg = editTargetLeague.trim().toUpperCase();

      const updatedHavuz = { ...dynamicLigHavuzu };

      let oldLeague = "";
      Object.keys(updatedHavuz).forEach(lg => {
          if (updatedHavuz[lg].includes(tName)) {
              oldLeague = lg;
              updatedHavuz[lg] = updatedHavuz[lg].filter(t => t !== tName);
          }
      });

      if (!oldLeague) {
          alert("Takım Karargahta bulunamadı!");
          return;
      }

      if (!updatedHavuz[targetLg]) {
          updatedHavuz[targetLg] = [];
      }

      updatedHavuz[targetLg].push(tName);
      updatedHavuz[targetLg].sort((a,b) => a.localeCompare(b, 'tr'));

      updateLigHavuzu(updatedHavuz);
      setEditTeamName('');
      setEditTargetLeague('');
      alert(`🔄 TRANSFER BAŞARILI! ${tName} takımı, ${oldLeague} liginden alındı ve ${targetLg} ligine aktarıldı!`);
  };

  const toggleWinners = (matchId: number) => setOpenWinnersMap((prev) => ({ ...prev, [matchId]: !prev[matchId] }));
  
  const handleScoreChange = (matchId: number, team: 'home' | 'away', score: string) => {
    setAdminScores(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || { home: "-", away: "-" }), [team]: score } }));
  };
  
  const scoreOptions = ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];
  
  const isTffMatchCheck = (category: string) => {
    if(!category) return false;
    const uppercaseCat = category.toUpperCase();
    return ( uppercaseCat.includes("TÜRKİYE") || uppercaseCat.includes("TFF") || uppercaseCat.includes("AMATÖR") || uppercaseCat.includes("PTT") || uppercaseCat.includes("2.LİG") || uppercaseCat.includes("3.LİG") );
  };

  const weeklyStats = useMemo(() => {
     const stats: Record<string, { points: number, exactScores: number }> = {};
     Object.keys(mergedPlayers).forEach(uid => {
         stats[uid] = { points: 0, exactScores: 0 };
     });

     liveMatchesDB.forEach(match => {
         const hScore = adminScores[match.match_index]?.home || "-";
         const aScore = adminScores[match.match_index]?.away || "-";
         
         if (hScore !== "-" && aScore !== "-") {
             const targetScore = `${hScore}-${aScore}`;
             const predsSource = selectedLiveWeek === 4 ? (week4PredictionsData as any) : predictionsDB;
             
             const winners = Object.keys(predsSource).filter(uid => {
                 const targetIndex = match.match_index - 1;
                 return predsSource[uid] && predsSource[uid][targetIndex] === targetScore;
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
            }
          }
        }

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
                    alert(`🎁 HAFTANIN BONUSLARI BAŞARIYLA DAĞITILDI!`);
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

  // 🔴 EKMEL ZIRHI: ADMİN PANELİNDEKİ DEV LOGOLAR VE TEMALAR GERİ GELDİ!
  const getEliteTheme = (category: string) => {
    const upCat = category ? category.toUpperCase() : '';
    
    let theme = { bgImg: null as string | null, containerBorder: "border-slate-500", containerShadow: "shadow-none", containerBg: "bg-slate-900", badgeBg: "", badgeText: "text-slate-300", badgeBorder: "", catText: "text-slate-400", scoreBorder: "border-slate-700", colonText: "text-slate-500", tagText: "text-slate-400", tagBg: "bg-slate-800", tagBorder: "border-slate-600", bottomBar: "bg-slate-900" };
    
    if (upCat.includes("ŞAMPİYONLAR LİGİ") || upCat.includes("Ş.L.")) {
      theme = { ...theme, bgImg: "url('/cl-bg.png')", containerBorder: "border-indigo-500/50", containerShadow: "shadow-[0_0_40px_rgba(79,70,229,0.4)]", containerBg: "bg-[#050b14]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-indigo-300", badgeBorder: "border-indigo-400/80 shadow-[0_0_10px_currentColor]", catText: "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]", scoreBorder: "border-white/30", colonText: "text-white/50", tagText: "text-cyan-300", tagBg: "bg-cyan-950/90", tagBorder: "border-cyan-400/80", bottomBar: "bg-[#050b14]/90 border-blue-900/30" };
    } else if (upCat.includes("AVRUPA LİGİ") || upCat.includes("A.L.")) {
      theme = { ...theme, bgImg: "url('/el-bg.png')", containerBorder: "border-orange-500/50", containerShadow: "shadow-[0_0_40px_rgba(249,115,22,0.4)]", containerBg: "bg-[#140805]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-orange-400", badgeBorder: "border-orange-500/80 shadow-[0_0_10px_currentColor]", catText: "text-orange-300 drop-shadow-[0_0_8px_rgba(253,186,116,0.5)]", scoreBorder: "border-orange-600/40", colonText: "text-orange-400/50", tagText: "text-orange-300", tagBg: "bg-orange-950/90", tagBorder: "border-orange-400/80", bottomBar: "bg-[#140805]/90 border-orange-900/30" };
    } else if (upCat.includes("KONFERANS LİGİ") || upCat.includes("K.L.")) {
      theme = { ...theme, bgImg: "url('/uecl-bg.png')", containerBorder: "border-emerald-500/50", containerShadow: "shadow-[0_0_40px_rgba(16,185,129,0.4)]", containerBg: "bg-[#05140b]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-emerald-400", badgeBorder: "border-emerald-500/80 shadow-[0_0_10px_currentColor]", catText: "text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.5)]", scoreBorder: "border-emerald-600/40", colonText: "text-emerald-400/50", tagText: "text-emerald-300", tagBg: "bg-emerald-950/90", tagBorder: "border-emerald-400/80", bottomBar: "bg-[#05140b]/90 border-emerald-900/30" };
    } else if (upCat.includes("İTALYA") || upCat.includes("SERIE A") || upCat.includes("SERİE A")) {
      theme = { ...theme, bgImg: "url('/seriea-bg.png')", containerBorder: "border-blue-500/50", containerShadow: "shadow-[0_0_40px_rgba(59,130,246,0.4)]", containerBg: "bg-[#05101f]", badgeBg: "bg-blue-950/80 backdrop-blur-sm", badgeText: "text-blue-300", badgeBorder: "border-blue-500/80 shadow-[0_0_10px_currentColor]", catText: "text-blue-200 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]", scoreBorder: "border-blue-600/40", colonText: "text-blue-400/50", tagText: "text-blue-300", tagBg: "bg-blue-950/90", tagBorder: "border-blue-400/80", bottomBar: "bg-[#05101f]/90 border-blue-900/30" };
    } else if (upCat.includes("İNGİLTERE") || upCat.includes("PREMIER")) {
      theme = { ...theme, bgImg: "url('/premier-bg.png')", containerBorder: "border-fuchsia-500/50", containerShadow: "shadow-[0_0_40px_rgba(217,70,239,0.4)]", containerBg: "bg-[#17051f]", badgeBg: "bg-fuchsia-950/80 backdrop-blur-sm", badgeText: "text-fuchsia-300", badgeBorder: "border-fuchsia-500/80 shadow-[0_0_10px_currentColor]", catText: "text-fuchsia-200 drop-shadow-[0_0_8px_rgba(240,171,252,0.5)]", scoreBorder: "border-fuchsia-600/40", colonText: "text-fuchsia-400/50", tagText: "text-fuchsia-300", tagBg: "bg-fuchsia-950/90", tagBorder: "border-fuchsia-400/80", bottomBar: "bg-[#17051f]/90 border-fuchsia-900/30" };
    } else if (upCat.includes("İSPANYA") || upCat.includes("LA LIGA") || upCat.includes("LA LİGA")) {
      theme = { ...theme, bgImg: "url('/laliga-bg.png')", containerBorder: "border-rose-500/50", containerShadow: "shadow-[0_0_40px_rgba(225,29,72,0.4)]", containerBg: "bg-[#1f050a]", badgeBg: "bg-rose-950/80 backdrop-blur-sm", badgeText: "text-rose-300", badgeBorder: "border-rose-500/80 shadow-[0_0_10px_currentColor]", catText: "text-rose-200 drop-shadow-[0_0_8px_rgba(253,164,175,0.5)]", scoreBorder: "border-rose-600/40", colonText: "text-rose-400/50", tagText: "text-rose-300", tagBg: "bg-rose-950/90", tagBorder: "border-rose-400/80", bottomBar: "bg-[#1f050a]/90 border-rose-900/30" };
    } else if (isTffMatchCheck(upCat)) {
      theme = { ...theme, bgImg: "url('/tff-bg.png')", containerBorder: "border-red-500/50", containerShadow: "shadow-[0_0_40px_rgba(239,68,68,0.4)]", containerBg: "bg-[#140505]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-red-400", badgeBorder: "border-red-500/80 shadow-[0_0_10px_currentColor]", catText: "text-red-300 drop-shadow-[0_0_8px_rgba(252,165,165,0.5)]", scoreBorder: "border-red-600/40", colonText: "text-red-400/50", tagText: "text-red-400", tagBg: "bg-red-950/90", tagBorder: "border-red-500/80", bottomBar: "bg-[#140505]/90 border-red-900/30" };
    } else {
      theme = { ...theme, bgImg: null, containerBorder: "border-blue-500/30", containerShadow: "shadow-[0_0_30px_rgba(30,58,138,0.5)]", containerBg: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/60 via-[#0a1120] to-[#050b14]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-cyan-400", badgeBorder: "border-cyan-500/80 shadow-[0_0_10px_currentColor]", catText: "text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]", scoreBorder: "border-blue-600/40", colonText: "text-blue-400/50", tagText: "text-cyan-300", tagBg: "bg-cyan-950/90", tagBorder: "border-cyan-400/80", bottomBar: "bg-[#050b14]/90 border-blue-900/30" };
    }

    return theme;
  };

  const getAvailableTeams = (currentIndex: number, isHome: boolean) => {
    const currentMatch = bulletinMatches[currentIndex];
    const currentCat = currentMatch.category ? currentMatch.category.toUpperCase() : '';
    const opponent = isHome ? currentMatch.away_team : currentMatch.home_team;
    
    if (!currentCat) return [];

    let havuz = dynamicLigHavuzu[currentCat];

    if (!havuz || currentCat.includes("UEFA") || currentCat.includes("KUPA") || currentCat.includes("CUP") || currentCat.includes("Ş.L.") || currentCat.includes("A.L.") || currentCat.includes("K.L.")) {
       havuz = Object.values(dynamicLigHavuzu).flat();
    }

    const fullHavuz = Array.from(new Set([...havuz]));
    const usedTeams = new Set<string>();

    bulletinMatches.forEach((m, idx) => {
       if (idx === currentIndex) return; 
       
       const mCat = m.category ? m.category.toUpperCase() : '';
       
       if (currentCat === mCat) {
           if (m.home_team) usedTeams.add(m.home_team);
           if (m.away_team) usedTeams.add(m.away_team);
       }
    });

    return fullHavuz.filter(t => t !== opponent && !usedTeams.has(t)).sort((a,b) => a.localeCompare(b, 'tr'));
  };

  const handleBulletinChange = (index: number, field: string, value: string) => {
    const newMatches = [...bulletinMatches];
    (newMatches[index] as any)[field] = value;
    if (field === 'category') {
        newMatches[index].home_team = ''; newMatches[index].away_team = '';
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
    const hasEmpty = bulletinMatches.some(m => !m.home_team.trim() || !m.away_team.trim() || !m.category.trim());
    if (hasEmpty) {
       if(!window.confirm("Bazı takımlar veya kategoriler seçilmemiş. Bülteni yinede MÜHÜRLEMEK istiyor musun?")) return;
    }

    setIsPublishing(true);
    try {
      const payload = bulletinMatches.map(m => ({
         week_num: bulletinWeek, match_index: m.match_index, category: m.category,
         match_date: m.match_date, match_time: m.match_time,
         home_team: m.home_team.trim().toUpperCase(), away_team: m.away_team.trim().toUpperCase()
      }));

      const { error } = await supabase.from('matches_bulletin').upsert(payload, { onConflict: 'week_num,match_index' });
      if (error) throw error;
      alert(`✅ MÜKEMMEL! ${bulletinWeek}. Hafta Bülteni veritabanına mühürlendi!\n\nŞu an:\n1. Maç Arşivi'nde ${bulletinWeek}. Hafta otomatik olarak oluştu.\n2. Lobi ekranı kapılarını açmak için Cuma 21:00'ı bekliyor.`);
    } catch (e: any) { alert("❌ HATA: Bülten kaydedilemedi! Detay: " + e.message); }
    setIsPublishing(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"></div>
          <span className="text-5xl mb-4 block drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">🛡️</span>
          <h1 className="text-2xl font-black text-white mb-2 tracking-widest uppercase drop-shadow-md">Karargah Girişi</h1>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-6">
            <input 
              type="text" 
              value={usernameInput} 
              onChange={e => setUsernameInput(e.target.value)} 
              className="bg-slate-950 border border-slate-700 text-slate-300 px-4 py-3.5 rounded-xl outline-none focus:border-amber-500 text-center tracking-widest font-bold text-sm shadow-inner placeholder:text-slate-600 lowercase" 
              placeholder="KULLANICI ADI" 
            />
            <input 
              type="password" 
              value={passwordInput} 
              onChange={e => setPasswordInput(e.target.value)} 
              className="bg-slate-950 border border-slate-700 text-amber-400 px-4 py-3.5 rounded-xl outline-none focus:border-amber-500 text-center tracking-[0.3em] font-black text-lg shadow-inner placeholder:text-slate-600" 
              placeholder="••••••••" 
            />
            <button 
              type="submit" 
              className="bg-amber-600 hover:bg-amber-500 text-white font-black tracking-widest py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] mt-2"
            >
              KAPIYI AÇ
            </button>
          </form>
        </div>
      </div>
    );
  }

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
                 🛡️ LOJİSTİK / TRANSFER
               </button>
             </>
           )}
        </div>

        {activeTab === 'live' && (
          <div className="animate-fade-in">
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
                           const isActive = skorcuStatusMap[sk] !== false; 
                           return (
                              <button 
                                 key={sk}
                                 onClick={() => toggleSkorcuAccess(sk, isActive)}
                                 className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-xs transition-all shadow-md ${
                                    isActive ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400 hover:bg-emerald-900' : 'bg-rose-950/80 border-rose-500/50 text-rose-400 hover:bg-rose-900'
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

            {userRole === 'master' && (
            <div className="mb-8 p-5 bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 rounded-2xl shadow-[0_0_30px_rgba(30,58,138,0.3)]">
                <h2 className="text-center font-black text-blue-400 text-sm tracking-widest uppercase mb-4 flex items-center justify-center gap-2">
                    <span className="text-xl">🏆</span> {selectedLiveWeek}. HAFTA CANLI LİDERLİK RADARI
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <div className="bg-slate-950/80 border border-emerald-500/50 rounded-xl p-3 w-full max-w-xs shadow-inner flex flex-col items-center">
                        <span className="text-emerald-400 text-[10px] font-bold tracking-widest mb-1">🔥 HAFTANIN PUAN LİDERİ</span>
                        <span className="text-white font-black text-sm uppercase">
                            {weeklyStats.pointsLeader ? `${mergedPlayers[weeklyStats.pointsLeader]}` : 'MÜSTAKİL LİDER YOK'}
                        </span>
                        <span className="text-emerald-500 font-bold text-xs mt-1 bg-emerald-950/50 px-2 rounded">
                            {weeklyStats.pointsLeader ? `${weeklyStats.maxPts} PUAN TOPLADI` : '---'}
                        </span>
                    </div>

                    <div className="bg-slate-950/80 border border-amber-500/50 rounded-xl p-3 w-full max-w-xs shadow-inner flex flex-col items-center">
                        <span className="text-amber-400 text-[10px] font-bold tracking-widest mb-1">⚽ HAFTANIN SKOR KRALI</span>
                        <span className="text-white font-black text-sm uppercase">
                            {weeklyStats.scoreLeader ? `${mergedPlayers[weeklyStats.scoreLeader]}` : 'MÜSTAKİL KRAL YOK'}
                        </span>
                        <span className="text-amber-500 font-bold text-xs mt-1 bg-amber-950/50 px-2 rounded">
                            {weeklyStats.scoreLeader ? `${weeklyStats.maxScores} MAÇ BİLDİ` : '---'}
                        </span>
                    </div>
                </div>
                <p className="text-center text-slate-500 text-[10px] mt-4 italic">
                    Not: Bu radar sizin girdiğiniz skorlara göre anlık güncellenir.
                </p>
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
                        isSoundEnabled ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500' : 'bg-slate-800/50 text-slate-500 border border-slate-700 hover:bg-slate-800'
                    }`}
                 >
                    {isSoundEnabled ? '🔊 GOL SESİ AÇIK' : '🔇 GOL SESİ KAPALI'}
                 </button>

                 <div className="flex items-center gap-2 ml-0 sm:ml-2">
                    {userRole === 'master' && (
                       <button 
                          onClick={() => setShowOnlyToday(!showOnlyToday)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                              showOnlyToday ? 'bg-indigo-900/80 text-indigo-300 border border-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.3)]' : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-800'
                          }`}
                       >
                          {showOnlyToday ? '📅 SADECE BUGÜN' : '📋 TÜM LİSTE'}
                       </button>
                    )}

                    <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2">
                       <span className="text-slate-400 font-bold text-xs tracking-wider">AKTİF HAFTA:</span>
                       {userRole === 'master' ? (
                          <select 
                            value={selectedLiveWeek}
                            onChange={(e) => setSelectedLiveWeek(Number(e.target.value))}
                            className="bg-amber-500 border border-amber-600 text-slate-950 font-black text-sm px-2 py-0.5 rounded shadow-[0_0_10px_rgba(245,158,11,0.3)] outline-none cursor-pointer"
                          >
                             <option value={4}>4. HAFTA</option>
                             <option value={5}>5. HAFTA</option>
                             <option value={6}>6. HAFTA</option>
                             <option value={7}>7. HAFTA</option>
                             <option value={8}>8. HAFTA</option>
                             <option value={9}>9. HAFTA</option>
                          </select>
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
                 </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {displayedMatches.map((match) => {
                const isWinnersOpen = !!openWinnersMap[match.match_index];
                const isTffMatch = isTffMatchCheck(match.category);
                
                const homeTeamUpper = match.home_team?.toUpperCase() || match.homeTeam?.toUpperCase();
                const awayTeamUpper = match.away_team?.toUpperCase() || match.awayTeam?.toUpperCase();

                // 🔴 LOGOLAR GERİ DÖNDÜ! (FOTMOB/WİKİ YADA PUBLIC KLASÖR) 🔴
                const homeLogoUrl = localTeamLogos[homeTeamUpper] || getLocalLogoUrl(homeTeamUpper);
                const awayLogoUrl = localTeamLogos[awayTeamUpper] || getLocalLogoUrl(awayTeamUpper);

                const theme = getEliteTheme(match.category);

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
                        return predictionsSource[uid] && predictionsSource[uid][match.match_index - 1] === targetScore;
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
                        
                        {/* 🔴 RESİMLİ (LOGOLU) VE GÖSTERİŞLİ KART BLOĞU GERİ GELDİ 🔴 */}
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

                        {logInfo?.updated_by && (
                           <div className="mt-4 flex justify-center">
                              <div className="bg-slate-950/80 border border-slate-700/50 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-inner">
                                 <span className="text-[10px] sm:text-xs drop-shadow-md">📝</span>
                                 <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">
                                    Son İşlem: <strong className="text-amber-400 uppercase tracking-widest">{logInfo.updated_by}</strong> tarafından <span className="text-slate-300 font-bold">{logInfo.updated_at}</span>.
                                 </span>
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

        {/* 🚀 2. CEPHE: BÜLTEN ÜRETİM FABRİKASI 🚀 */}
        {activeTab === 'bulletin' && userRole === 'master' && (
          <div className="animate-fade-in">
             <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                <h2 className="text-xl font-black text-indigo-400">🏭 BÜLTEN FABRİKASI</h2>
                <div className="flex items-center gap-3">
                   <select value={bulletinWeek} onChange={e => setBulletinWeek(Number(e.target.value))} className="bg-indigo-950 text-indigo-300 font-bold px-3 py-1 rounded outline-none border border-indigo-700/50 cursor-pointer">
                      <option value={5}>5. HAFTA</option><option value={6}>6. HAFTA</option><option value={7}>7. HAFTA</option><option value={8}>8. HAFTA</option><option value={9}>9. HAFTA</option><option value={10}>10. HAFTA</option>
                   </select>
                </div>
             </div>
             
             <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl">
                <button onClick={copyDateTimeToAll} className="mb-4 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition-colors shadow-sm">
                    📅 1. Maçın Tarihini Alta Kopyala
                </button>
                
                <div className="overflow-x-auto custom-scrollbar pb-4">
                   <table className="w-full text-left text-xs min-w-[800px]">
                      <tbody>
                         {bulletinMatches.map((m, idx) => {
                            const isReady = m.category && m.match_date && m.match_time && m.home_team && m.away_team;
                            
                            return (
                              <tr key={m.match_index} className={`border-b border-slate-800 transition-colors ${isReady ? 'bg-emerald-950/20' : 'hover:bg-slate-800/30'}`}>
                                 <td className="p-2 w-10 text-center">
                                    <div className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full font-black text-[13px] transition-all duration-500 ${isReady ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.8)] scale-110' : 'bg-slate-800 text-slate-500'}`}>
                                       {isReady ? '✓' : m.match_index}
                                    </div>
                                 </td>
                                 
                                 <td className="p-2 w-[22%]">
                                    <select value={m.category} onChange={e=>handleBulletinChange(idx,'category',e.target.value)} className={`w-full bg-slate-950 border ${isReady ? 'border-emerald-500/50 text-emerald-400' : 'border-slate-700/50 text-slate-300'} px-2 py-2 rounded outline-none focus:border-indigo-500 cursor-pointer font-bold`}>
                                       <option value="">-- KATEGORİ SEÇİN --</option>
                                       {getDynamicCategories().map(c => <option key={`cat-${m.match_index}-${c}`} value={c}>{c}</option>)}
                                    </select>
                                 </td>
                                 
                                 <td className="p-2 w-[15%]">
                                    <select value={m.match_date} onChange={e=>handleBulletinChange(idx,'match_date',e.target.value)} className="w-full bg-slate-950 border border-slate-700/50 text-slate-300 px-2 py-2 rounded outline-none focus:border-indigo-500 cursor-pointer font-bold">
                                       {currentWeekDates.map(d => <option key={`date-${m.match_index}-${d}`} value={d}>{d}</option>)}
                                    </select>
                                 </td>
                                 
                                 <td className="p-2 w-[12%]">
                                    <select value={m.match_time} onChange={e=>handleBulletinChange(idx,'match_time',e.target.value)} className="w-full bg-slate-950 border border-slate-700/50 text-slate-300 px-2 py-2 rounded outline-none focus:border-indigo-500 cursor-pointer font-bold text-center">
                                       {timeOptionsArr.map(t => <option key={`time-${m.match_index}-${t}`} value={t}>{t}</option>)}
                                    </select>
                                 </td>
                                 
                                 <td className="p-2 w-[22%]">
                                    <select value={m.home_team} onChange={e=>handleBulletinChange(idx,'home_team',e.target.value)} className={`w-full bg-slate-950 border ${isReady ? 'border-emerald-500/50 text-emerald-400' : 'border-slate-700/50 text-slate-300'} px-2 py-2 rounded outline-none focus:border-indigo-500 font-bold uppercase cursor-pointer`}>
                                       <option value="">-- EV SAHİBİ SEÇ --</option>
                                       {getAvailableTeams(idx, true).map(t => <option key={`home-${m.match_index}-${t}`} value={t}>{t}</option>)}
                                    </select>
                                 </td>
                                 
                                 <td className="p-2 w-[22%]">
                                    <select value={m.away_team} onChange={e=>handleBulletinChange(idx,'away_team',e.target.value)} className={`w-full bg-slate-950 border ${isReady ? 'border-emerald-500/50 text-emerald-400' : 'border-slate-700/50 text-slate-300'} px-2 py-2 rounded outline-none focus:border-indigo-500 font-bold uppercase cursor-pointer`}>
                                       <option value="">-- DEPLASMAN SEÇ --</option>
                                       {getAvailableTeams(idx, false).map(t => <option key={`away-${m.match_index}-${t}`} value={t}>{t}</option>)}
                                    </select>
                                 </td>
                              </tr>
                            );
                         })}
                      </tbody>
                   </table>
                </div>
                
                <button 
                  onClick={saveBulletinToDB} 
                  disabled={isPublishing} 
                  className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-black tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.5)] flex justify-center items-center gap-2 text-lg"
                >
                   {isPublishing ? 'MÜHÜRLENİYOR...' : '🚀 BÜLTENİ ONAYLA VE YAYINLA'}
                </button>
             </div>
          </div>
        )}

        {/* 🚀 3. CEPHE: TAHMİNLER DURUM PANELİ 🚀 */}
        {activeTab === 'predictions' && userRole === 'master' && (
           <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                 <h2 className="text-xl font-black text-emerald-400">📊 TAHMİNLER (CANLI DURUM)</h2>
                 <select value={selectedPredictionWeek} onChange={e => setSelectedPredictionWeek(Number(e.target.value))} className="bg-emerald-950 text-emerald-400 font-bold px-3 py-1 rounded outline-none border border-emerald-700/50 cursor-pointer">
                    <option value={4}>4. HAFTA</option><option value={5}>5. HAFTA</option><option value={6}>6. HAFTA</option><option value={7}>7. HAFTA</option>
                 </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg">
                    <h3 className="text-rose-400 font-black mb-3 pb-2 border-b border-rose-900/50 tracking-widest flex items-center justify-between">
                       <span>EKSİKLER</span>
                       <span className="bg-rose-950 px-2 py-0.5 rounded text-xs">{missingPlayers.length} KİŞİ</span>
                    </h3>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                       {missingPlayers.map(id => <div key={id} className="text-[11px] font-bold text-slate-400 py-1.5 border-b border-slate-800/50 uppercase">{mergedPlayers[id]}</div>)}
                    </div>
                 </div>
                 <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg">
                    <h3 className="text-emerald-400 font-black mb-3 pb-2 border-b border-emerald-900/50 tracking-widest flex items-center justify-between">
                       <span>GİRENLER</span>
                       <span className="bg-emerald-950 px-2 py-0.5 rounded text-xs">{submittedPlayers.length} KİŞİ</span>
                    </h3>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                       {submittedPlayers.map(id => <div key={id} className="text-[11px] font-bold text-emerald-500/70 py-1.5 border-b border-slate-800/50 uppercase">{mergedPlayers[id]}</div>)}
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* 🚀 4. CEPHE: YARIŞMACI YÖNETİMİ ODASI 🚀 */}
        {activeTab === 'players' && userRole === 'master' && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-800 pb-4">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-black text-fuchsia-400 tracking-tight flex items-center justify-center sm:justify-start gap-3 uppercase">
                  <span className="text-3xl">👥</span> YARIŞMACI YÖNETİMİ
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Buradan eklediğiniz veya sildiğiniz yarışmacılar listelere anında yansır.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
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
                      {isPlayerLoading ? 'KAYDEDİLİYOR...' : 'SİSTEME KAYDET VE DAHİL ET'}
                    </button>
                 </form>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                 <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-black text-rose-500 flex items-center gap-2">
                       <span className="text-xl">⚖️</span> DİSİPLİN KURULU (TÜM LİSTE)
                    </h2>
                    <span className="bg-slate-950 text-slate-400 px-3 py-1 rounded-lg text-xs font-bold border border-slate-800">
                       {dbPlayersList.length + Object.keys(staticPlayersList).length} Toplam Aktif
                    </span>
                 </div>
                 
                 <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                    {dbPlayersList.map(p => (
                      <div key={`dyn-${p.id}`} className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex justify-between items-center group hover:border-slate-600 transition-colors">
                         <div className="flex flex-col">
                            <span className="font-black text-fuchsia-400 text-sm uppercase tracking-wide flex items-center gap-2">
                               {p.full_name} <span className="text-[8px] bg-fuchsia-950/50 border border-fuchsia-500/30 px-1.5 py-0.5 rounded text-fuchsia-300">YENİ</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 tracking-widest mt-0.5">ID: {p.username} | ŞİFRE: {p.password}</span>
                         </div>
                         <button 
                           onClick={() => handleBanishPlayer(p.username, p.full_name)}
                           className="bg-rose-950/80 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-900/50 hover:border-rose-500 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all shadow-[0_0_10px_rgba(225,29,72,0.1)] hover:shadow-[0_0_15px_rgba(225,29,72,0.4)]"
                         >
                           ❌ İHRAÇ ET
                         </button>
                      </div>
                    ))}
                    
                    {Object.keys(staticPlayersList).map(id => (
                      <div key={`static-${id}`} className="bg-slate-950/50 border border-slate-800 p-3 rounded-xl flex justify-between items-center group hover:border-slate-600 transition-colors">
                         <div className="flex flex-col">
                            <span className="font-black text-slate-300 text-sm uppercase tracking-wide">{staticPlayersList[id]}</span>
                            <span className="text-[10px] font-bold text-slate-500 tracking-widest mt-0.5">ID: {id}</span>
                         </div>
                         <button 
                           onClick={() => handleBanishPlayer(id, staticPlayersList[id])}
                           className="bg-rose-950/80 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-900/50 hover:border-rose-500 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all shadow-[0_0_10px_rgba(225,29,72,0.1)] hover:shadow-[0_0_15px_rgba(225,29,72,0.4)] opacity-80 hover:opacity-100"
                         >
                           ❌ İHRAÇ ET
                         </button>
                      </div>
                    ))}
                 </div>
              </div>

            </div>
          </div>
        )}

        {/* 🚀 5. CEPHE: TAKIM LOJİSTİK VE TRANSFER MERKEZİ 🚀 */}
        {activeTab === 'teams' && userRole === 'master' && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-800 pb-4">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-black text-cyan-400 tracking-tight flex items-center justify-center sm:justify-start gap-3 uppercase">
                  <span className="text-3xl">🛡️</span> LOJİSTİK VE TRANSFER MERKEZİ
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Karargaha yepyeni bir lig veya takım ekleyebilir, mevcut takımları ait oldukları lige kaydırabilirsiniz.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 bg-cyan-600 text-white text-[9px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-widest">YENİ KAYIT</div>
                 <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-black text-cyan-400 flex items-center gap-2">
                       <span className="text-xl">➕</span> YENİ TAKIM VE LİG OLUŞTUR
                    </h2>
                 </div>
                 
                 <form onSubmit={handleAddLocalTeam} className="flex flex-col gap-5">
                    <div>
                       <label className="block text-xs font-bold text-slate-400 tracking-widest mb-1.5 ml-1">TAKIMIN TAM ADI</label>
                       <input 
                         type="text" 
                         value={newTeamName} 
                         onChange={e => setNewTeamName(e.target.value)} 
                         placeholder="Örn: RIVER PLATE"
                         className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-4 py-3 rounded-xl outline-none focus:border-cyan-500 font-black tracking-widest uppercase shadow-inner placeholder:text-slate-600"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-400 tracking-widest mb-1.5 ml-1">LİGİ / KATEGORİSİ</label>
                       <input 
                         type="text" 
                         list="leagueOptions"
                         value={newTeamLeague} 
                         onChange={e => setNewTeamLeague(e.target.value)} 
                         placeholder="Örn: ARJANTİN LİGİ"
                         className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-4 py-3 rounded-xl outline-none focus:border-cyan-500 font-black tracking-widest uppercase shadow-inner placeholder:text-slate-600"
                       />
                       <p className="text-[10px] text-slate-500 mt-2 ml-1 leading-relaxed">
                          Yazdığınız ligin adında <strong className="text-red-400">Türkiye, TFF, PTT, Amatör, 2.Lig</strong> vs. geçiyorsa maçın puanları otomatik <strong className="text-red-400">TFF</strong> kasasına gider. Geçmiyorsa otomatik <strong className="text-blue-400">DFO</strong> kasasına gider!
                       </p>
                    </div>

                    <button 
                      type="submit" 
                      className="mt-2 bg-cyan-600 hover:bg-cyan-500 text-white font-black tracking-widest py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(8,145,178,0.4)] flex justify-center items-center gap-2"
                    >
                      BÜLTENLERE KAYDET
                    </button>
                 </form>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-widest">EDİTLEME</div>
                 <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-black text-emerald-400 flex items-center gap-2">
                       <span className="text-xl">🔄</span> BİRLİK KAYDIRMA (TRANSFER)
                    </h2>
                 </div>
                 
                 <form onSubmit={handleMoveTeam} className="flex flex-col gap-5">
                    <div>
                       <label className="block text-xs font-bold text-slate-400 tracking-widest mb-1.5 ml-1">TAŞINACAK TAKIM (MEVCUT)</label>
                       <select 
                         value={editTeamName} 
                         onChange={e => setEditTeamName(e.target.value)} 
                         className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-4 py-3 rounded-xl outline-none focus:border-emerald-500 font-bold uppercase shadow-inner"
                       >
                         <option value="">-- BİR TAKIM SEÇİN --</option>
                         {getAllTeamsFlatList().map(t => <option key={`move-${t}`} value={t}>{t}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-400 tracking-widest mb-1.5 ml-1">GİDECEĞİ YENİ LİG (HEDEF)</label>
                       <input 
                         type="text" 
                         list="leagueOptions"
                         value={editTargetLeague} 
                         onChange={e => setEditTargetLeague(e.target.value)} 
                         placeholder="Örn: HOLLANDA EREDIVISIE"
                         className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-4 py-3 rounded-xl outline-none focus:border-emerald-500 font-black tracking-widest uppercase shadow-inner placeholder:text-slate-600"
                       />
                       <p className="text-[10px] text-slate-500 mt-2 ml-1 leading-relaxed">
                          Takımı eski liginden siler ve yazdığınız yeni lige kalıcı olarak taşır. Çeşitli Avrupa klasörünü boşaltmak için kullanabilirsiniz.
                       </p>
                    </div>

                    <button 
                      type="submit" 
                      className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] flex justify-center items-center gap-2"
                    >
                      TAKIMI TRANSFER ET (TAŞI)
                    </button>
                 </form>
              </div>

            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
               <h2 className="text-lg font-black text-slate-400 mb-4 border-b border-slate-800 pb-4 flex items-center gap-2">
                  <span className="text-xl">📋</span> KARARGAH LİG VE TAKIM ENVANTERİ
               </h2>
               <div className="max-h-[600px] overflow-y-auto custom-scrollbar flex flex-col gap-6 pr-2">
                  {Object.keys(dynamicLigHavuzu).sort((a,b) => a.localeCompare(b, 'tr')).map(ligAdi => (
                     <div key={ligAdi} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
                        <div className="flex items-center justify-between mb-3 border-b border-slate-800/50 pb-2">
                           <h3 className="text-sm font-black text-amber-500 tracking-widest uppercase">{ligAdi}</h3>
                           <span className="bg-amber-950 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded">{dynamicLigHavuzu[ligAdi].length} Takım</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {dynamicLigHavuzu[ligAdi].length === 0 ? (
                              <span className="text-slate-600 text-xs italic">Bu birlikte şu an asker yok.</span>
                           ) : (
                              dynamicLigHavuzu[ligAdi].map(takim => (
                                 <span key={`${ligAdi}-${takim}`} className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[10px] font-bold text-slate-300 uppercase shadow-sm">
                                    {takim}
                                 </span>
                              ))
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <datalist id="leagueOptions">
               {Object.keys(dynamicLigHavuzu).sort((a,b) => a.localeCompare(b, 'tr')).map(lg => <option key={`dl-${lg}`} value={lg} />)}
            </datalist>

          </div>
        )}

      </div>
    </div>
  );
}