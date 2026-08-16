'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/utils/supabase';

// 🏆 Sabit Oyuncu Listesi
const allPlayersList: Record<string, string> = {
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

// 🔴 Sabit 4. Hafta Maçları
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

// 🔴 Sabit 4. Hafta Tahminleri
const week4PredictionsData: Record<string, string[]> = {
  "262731": ["1-1", "3-1", "1-1", "2-0", "3-0", "2-2", "1-3", "1-1", "2-1", "1-2", "1-0", "1-3", "2-1", "1-2", "2-2", "2-1", "2-1", "1-1", "3-1", "1-1", "1-1", "1-1", "1-1", "2-1"], "262758": ["1-2", "3-0", "2-0", "3-0", "4-1", "1-1", "1-3", "1-1", "1-1", "0-2", "2-1", "0-3", "3-0", "1-1", "2-1", "2-1", "3-0", "3-0", "3-0", "1-1", "0-3", "1-1", "1-2", "3-0"], "262763": ["1-1", "1-1", "1-1", "2-0", "4-0", "1-1", "0-2", "1-0", "1-0", "1-1", "1-1", "1-1", "1-1", "2-0", "1-1", "1-1", "1-1", "1-0", "3-0", "1-1", "1-1", "1-1", "1-1", "1-0"], "262744": ["1-2", "3-1", "1-1", "2-0", "4-0", "2-0", "1-2", "1-1", "1-0", "0-0", "2-2", "0-4", "2-0", "2-0", "1-2", "2-1", "0-1", "0-2", "2-0", "0-1", "0-2", "0-2", "1-1", "0-1"], "262813": ["1-2", "4-1", "1-0", "3-2", "2-0", "2-0", "1-3", "1-1", "3-0", "2-2", "1-2", "0-4", "1-1", "2-2", "2-0", "1-0", "2-0", "1-2", "2-0", "1-2", "1-3", "0-0", "0-1", "1-2"], "351925": ["0-2", "0-0", "2-1", "1-0", "3-0", "0-0", "0-2", "0-0", "0-0", "0-0", "0-0", "0-3", "2-1", "0-0", "2-0", "2-1", "0-0", "0-2", "2-0", "0-0", "0-2", "0-0", "0-2", "0-0"], "262732": ["2-1", "2-1", "1-0", "1-1", "2-0", "3-1", "2-2", "2-1", "2-0", "1-1", "1-1", "0-3", "2-0", "1-1", "2-1", "0-1", "1-1", "1-1", "2-1", "1-2", "0-2", "0-2", "2-1", "1-0"], "262754": ["1-1", "1-0", "1-0", "2-0", "3-0", "1-0", "0-2", "1-0", "1-0", "0-2", "1-0", "0-3", "2-0", "1-0", "1-2", "1-0", "1-0", "1-1", "2-0", "1-0", "0-1", "0-1", "1-0", "1-0"], "262733": ["2-1", "3-1", "0-0", "3-0", "2-0", "0-1", "1-4", "2-0", "0-0", "1-0", "1-1", "0-3", "2-0", "2-1", "2-1", "2-0", "1-1", "1-0", "3-0", "1-1", "0-1", "1-1", "3-1", "1-0"], "262774": ["0-1", "2-0", "1-0", "2-0", "3-1", "1-1", "0-2", "1-1", "1-2", "1-2", "1-1", "0-2", "1-0", "0-0", "2-0", "0-0", "1-2", "2-1", "2-0", "1-1", "0-2", "0-0", "3-1", "0-2"], "262771": ["2-2", "3-1", "2-1", "4-0", "5-0", "1-1", "1-3", "1-1", "2-2", "1-1", "2-1", "1-4", "3-1", "3-0", "2-1", "1-0", "1-1", "3-1", "3-1", "1-3", "1-1", "1-1", "1-1", "2-1"], "262730": ["0-3", "3-0", "1-0", "3-1", "2-0", "1-1", "0-2", "0-1", "0-0", "0-1", "0-2", "0-3", "2-0", "2-1", "0-2", "2-0", "1-1", "1-2", "3-0", "0-1", "0-2", "0-0", "1-1", "2-1"], "262707": ["0-4", "3-0", "2-1", "1-1", "1-0", "0-0", "0-2", "0-0", "2-1", "0-2", "0-0", "0-4", "1-0", "0-0", "0-0", "0-0", "0-0", "0-0", "2-0", "1-0", "0-2", "0-0", "0-0", "0-2"], "262816": ["0-1", "3-1", "0-2", "1-0", "2-0", "0-0", "0-3", "1-1", "3-0", "0-2", "0-0", "0-2", "3-0", "0-2", "2-0", "1-1", "2-1", "1-3", "3-0", "0-0", "0-2", "0-3", "2-0", "0-1"], "262719": ["2-1", "2-1", "2-0", "2-1", "3-0", "2-1", "0-2", "3-1", "2-1", "1-1", "1-2", "0-2", "3-0", "2-1", "2-1", "1-1", "1-2", "2-1", "3-0", "2-1", "1-1", "2-1", "1-2", "2-0"], "262725": ["0-2", "2-0", "1-1", "3-0", "3-0", "1-0", "0-2", "1-1", "2-0", "2-1", "2-1", "0-2", "2-0", "0-0", "1-1", "1-0", "2-0", "1-0", "2-0", "0-1", "0-2", "1-0", "1-0", "0-1"], "262711": ["0-1", "3-1", "1-0", "3-0", "3-0", "2-1", "0-4", "0-0", "1-1", "1-3", "1-1", "1-2", "2-2", "1-0", "1-1", "2-1", "0-0", "2-1", "3-0", "0-0", "1-1", "1-2", "2-2", "2-0"], "262718": ["1-2", "4-1", "3-1", "3-0", "4-1", "1-1", "1-3", "2-2", "2-1", "1-1", "1-2", "1-3", "2-0", "2-1", "2-2", "2-1", "2-2", "1-1", "3-1", "2-2", "1-2", "1-3", "2-2", "1-2"], "262721": ["0-1", "2-0", "1-0", "3-1", "2-1", "0-2", "0-3", "2-1", "2-0", "1-2", "1-1", "0-3", "3-1", "1-1", "0-1", "0-2", "0-1", "0-2", "2-0", "0-2", "0-3", "0-1", "2-2", "0-1"], "262726": ["1-3", "2-2", "2-2", "3-0", "4-0", "1-1", "1-2", "2-1", "1-1", "1-1", "1-2", "0-3", "1-1", "2-1", "0-2", "0-2", "2-0", "1-1", "2-0", "3-1", "2-2", "0-2", "1-0", "2-1"], "262702": ["0-2", "1-0", "1-1", "3-1", "2-0", "1-0", "0-2", "0-1", "0-0", "0-1", "1-0", "0-3", "2-0", "1-0", "0-1", "1-0", "1-0", "2-0", "3-0", "1-1", "0-0", "0-1", "0-0", "2-0"], "262738": ["1-1", "2-1", "1-1", "1-0", "3-0", "2-1", "1-3", "2-1", "2-1", "1-1", "2-1", "1-3", "2-0", "1-1", "2-2", "2-1", "2-1", "1-1", "2-0", "2-1", "1-1", "1-1", "2-1", "1-1"], "262750": ["1-1", "3-1", "2-2", "3-1", "3-0", "1-1", "1-3", "2-1", "0-0", "1-2", "2-2", "0-3", "3-1", "2-0", "2-2", "0-0", "1-1", "0-2", "3-1", "0-2", "0-3", "1-2", "1-3", "2-0"], "262705": ["1-3", "3-1", "2-1", "3-1", "3-1", "3-0", "1-3", "1-2", "3-1", "1-2", "1-2", "0-3", "2-0", "3-0", "2-1", "2-1", "2-0", "2-0", "4-0", "3-1", "0-1", "0-2", "1-2", "1-1"], "262706": ["0-2", "4-1", "1-0", "3-0", "2-0", "0-2", "0-2", "0-0", "0-0", "0-1", "0-0", "0-2", "0-2", "0-0", "0-1", "0-0", "0-0", "0-1", "2-0", "2-1", "0-2", "0-2", "0-0", "2-0"], "262716": ["1-1", "3-2", "1-0", "3-1", "3-0", "3-1", "0-3", "0-0", "3-1", "0-2", "1-1", "0-4", "2-0", "3-1", "1-1", "3-0", "2-1", "1-1", "4-0", "2-1", "0-2", "0-2", "1-1", "1-2"], "262736": ["1-2", "2-1", "1-2", "3-0", "4-0", "2-1", "2-4", "3-1", "2-2", "2-2", "3-2", "1-1", "3-1", "3-0", "1-1", "4-1", "2-1", "2-1", "1-0", "2-1", "1-1", "1-1", "1-1", "3-0"], "262714": ["1-3", "2-0", "0-2", "0-0", "2-0", "0-1", "1-1", "0-0", "2-0", "0-1", "2-0", "0-3", "1-1", "0-1", "1-1", "0-0", "0-0", "1-0", "1-0", "0-0", "1-0", "1-1", "0-1", "0-1"], "262749": ["2-1", "3-1", "2-0", "3-0", "3-1", "2-2", "1-2", "2-1", "2-0", "2-0", "2-2", "1-3", "2-1", "2-1", "2-1", "1-1", "2-1", "1-1", "2-1", "2-1", "0-2", "1-2", "2-2", "1-1"], "262753": ["1-1", "2-1", "2-0", "3-0", "1-1", "1-0", "3-2", "1-1", "1-0", "2-2", "2-2", "0-3", "2-0", "1-2", "1-1", "1-1", "1-1", "0-1", "2-0", "1-1", "1-2", "1-1", "0-2", "1-1"], "262740": ["1-2", "1-1", "2-1", "2-0", "3-0", "1-2", "1-3", "1-1", "2-2", "1-1", "2-1", "1-3", "3-0", "1-1", "2-2", "2-1", "1-1", "1-2", "3-1", "2-1", "1-2", "2-1", "2-2", "1-1"], "262790": ["0-2", "3-1", "0-2", "0-2", "4-0", "0-2", "0-3", "3-1", "1-1", "2-0", "1-1", "0-3", "3-1", "2-1", "0-3", "2-1", "1-1", "2-0", "2-1", "1-0", "2-1", "1-1", "0-2", "0-2"], "262786": ["1-2", "3-1", "3-1", "3-0", "2-1", "1-1", "1-2", "1-1", "1-2", "2-0", "2-1", "1-1", "3-1", "2-0", "1-1", "1-2", "1-1", "1-1", "3-1", "2-1", "2-0", "1-2", "1-2", "1-1"], "262734": ["3-0", "4-1", "2-1", "3-1", "4-1", "2-1", "1-2", "3-2", "2-1", "3-2", "3-1", "2-1", "3-0", "2-3", "1-2", "3-1", "2-1", "3-2", "4-1", "3-1", "2-1", "3-1", "2-1", "3-1"], "262756": ["2-2", "3-2", "2-0", "4-2", "1-2", "1-2", "1-3", "1-2", "0-0", "0-0", "2-1", "1-3", "2-2", "1-2", "1-2", "1-2", "0-0", "0-0", "2-0", "0-0", "2-2", "0-1", "1-1", "1-3"], "262703": ["2-2", "1-1", "1-1", "2-1", "1-0", "1-1", "1-3", "2-2", "0-1", "0-0", "1-1", "0-2", "0-0", "0-0", "2-2", "1-1", "1-1", "0-0", "2-1", "1-1", "0-1", "1-1", "2-2", "0-0"], "262772": ["0-2", "2-0", "1-1", "1-1", "1-0", "0-0", "0-1", "0-0", "1-0", "1-2", "2-3", "0-3", "2-0", "1-1", "1-1", "1-0", "0-1", "1-0", "2-1", "1-1", "0-0", "0-1", "0-0", "0-1"], "262717": ["1-2", "0-1", "1-1", "2-2", "2-2", "2-0", "0-2", "1-2", "0-0", "0-2", "0-1", "0-2", "2-0", "1-2", "1-1", "1-0", "1-2", "0-0", "2-1", "1-0", "1-1", "3-2", "1-2", "0-0"], "262728": ["0-0", "0-0", "1-0", "2-1", "4-1", "0-1", "0-2", "1-1", "0-1", "0-0", "1-0", "0-5", "4-0", "2-0", "2-3", "1-2", "0-0", "0-0", "3-0", "0-0", "0-2", "0-1", "0-2", "0-0"], "262770": ["3-1", "3-1", "2-2", "2-0", "2-1", "1-1", "1-3", "0-2", "2-0", "0-3", "0-1", "0-4", "2-1", "1-1", "2-1", "2-0", "1-1", "1-0", "3-0", "2-3", "0-2", "1-2", "0-2", "3-1"], "262755": ["1-2", "4-1", "3-2", "2-1", "3-2", "1-1", "3-3", "2-1", "1-0", "0-1", "1-1", "0-2", "1-1", "3-0", "1-2", "4-2", "3-1", "2-2", "1-0", "2-2", "1-0", "3-2", "1-0", "3-1"], "262704": ["1-1", "2-1", "1-1", "2-0", "3-0", "0-1", "1-2", "2-1", "1-0", "0-1", "1-1", "1-3", "1-0", "2-0", "2-1", "2-0", "1-1", "1-1", "2-1", "1-1", "1-2", "0-2", "2-1", "1-1"], "262747": ["1-1", "2-0", "1-0", "2-0", "2-0", "1-1", "1-2", "1-1", "1-1", "1-1", "1-1", "1-3", "1-1", "1-1", "1-1", "1-1", "1-1", "1-1", "2-0", "1-1", "1-1", "1-1", "1-1", "1-1"], "262723": ["1-1", "3-1", "2-1", "2-0", "3-0", "1-2", "1-2", "2-1", "2-0", "1-2", "1-1", "2-1", "3-1", "3-0", "2-1", "1-1", "2-1", "1-1", "2-1", "1-1", "0-2", "0-2", "1-1", "2-0"], "262709": ["1-1", "2-1", "2-1", "2-0", "3-0", "1-1", "1-2", "1-1", "1-0", "1-0", "2-1", "0-2", "2-1", "2-0", "1-1", "1-0", "1-1", "2-1", "2-1", "1-1", "0-3", "0-2", "1-2", "1-0"],
  "262782": ["0-2", "0-0", "0-1", "1-0", "1-0", "0-0", "0-4", "1-0", "0-1", "0-0", "0-1", "0-3", "0-0", "0-0", "0-1", "0-0", "0-0", "0-0", "3-1", "0-0", "0-1", "0-0", "0-0", "0-0"],
  "262739": ["1-0", "3-1", "1-1", "3-0", "3-1", "0-1", "1-2", "3-1", "2-0", "2-0", "2-1", "1-2", "3-0", "2-0", "2-1", "3-2", "1-0", "1-0", "2-0", "1-1", "0-1", "1-1", "1-2", "1-0"]
};

// 🔴 1. HAFTA (Tamamı DFO)
const skorWeek1Data: Record<string, number> = {
  "262736": 4, "262755": 6, "262719": 4, "262756": 4, "262754": 4, "262786": 3, "262731": 3, "262717": 3, "262732": 4,
  "262726": 3, "262750": 2, "262747": 3, "262771": 2, "262728": 2, "262816": 2, "262716": 2, "262790": 2, "262733": 2,
  "262709": 1, "262753": 2, "262813": 2, "262740": 1, "262718": 3, "262707": 1, "262782": 1, "262702": 1, "262714": 1,
  "262721": 1, "262706": 1, "262787": 1, "262744": 1, "262774": 1, "262715": 1, "262723": 1, "351925": 0, "262749": 0,
  "262705": 0, "262708": 0, "262711": 0, "262712": 0, "262734": 0
};

// 🔴 2. HAFTA (Tamamı DFO)
const skorWeek2Data: Record<string, number> = {
  "262756": 3, "262755": 2, "262709": 2, "262790": 4, "262772": 1, "262728": 4, "262726": 3, "262711": 2, "262717": 2,
  "262737": 2, "262705": 2, "262816": 2, "262774": 1, "262732": 1, "262786": 1, "262721": 1, "262738": 1, "262714": 3,
  "262763": 2, "262736": 2, "262740": 1, "262702": 1, "262703": 1, "262730": 1, "262715": 1, "262749": 1, "262725": 1,
  "262758": 1, "262771": 1, "262754": 1, "262747": 1, "262716": 1, "262708": 1, "262731": 1, "262739": 1, "262813": 0,
  "262712": 0, "262734": 0, "351925": 0, "262744": 0, "262718": 0, "262704": 0, "262733": 0, "262707": 0, "262750": 0,
  "262753": 0, "262706": 0, "262723": 0, "262719": 0, "262782": 0, "262770": 0
};

// 🔴 3. HAFTA DFO
const skorWeek3DfoData: Record<string, number> = {
  "262816": 2, "262733": 1, "262721": 3, "262763": 2, "262786": 2, "262711": 2, "351925": 2, "262726": 2, "262725": 2,
  "262771": 1, "262813": 2, "262709": 2, "262706": 1, "262738": 1, "262753": 1, "262734": 1, "262756": 1, "262702": 1,
  "262730": 1, "262731": 1, "262755": 1, "262747": 1, "262732": 1, "262707": 1, "262754": 1, "262714": 1, "262782": 1,
  "262723": 1, "262772": 1, "262739": 1, "262716": 1, "262728": 0, "262705": 0, "262774": 0, "262740": 0, "262749": 0,
  "262770": 0, "262719": 0, "262708": 0, "262744": 0, "262758": 0, "262718": 0, "262736": 0, "262790": 0, "262750": 0,
  "262717": 0, "262703": 0
};

// 🔴 3. HAFTA TFF
const skorWeek3TffData: Record<string, number> = {
  "262707": 2, "262816": 3, "262733": 2, "262754": 3, "262728": 2, "262706": 1, "262755": 1, "262736": 1, "262771": 1,
  "262734": 1, "262705": 2, "262714": 1, "262763": 1, "262756": 1, "262774": 1, "262740": 1, "262702": 2, "262782": 2,
  "262813": 1, "262723": 1, "262749": 1, "262721": 1, "351925": 1, "262730": 1, "262772": 1, "262739": 1, "262770": 1,
  "262786": 0, "262711": 0, "262726": 0, "262725": 0, "262709": 0, "262738": 0, "262753": 0, "262731": 0, "262747": 0,
  "262732": 0, "262716": 0, "262719": 0, "262708": 0, "262744": 0, "262758": 0, "262718": 0, "262790": 0, "262750": 0,
  "262717": 0, "262703": 0
};

const isTffMatchCheck = (category: string) => {
  if (!category) return false;
  const uppercaseCat = category.toUpperCase();
  return ( uppercaseCat.includes("TÜRKİYE") || uppercaseCat.includes("TFF") || uppercaseCat.includes("AMATÖR") );
};

interface PlayerData {
  id: string;
  name: string;
  totalScore: number;
}

export default function SkorDurumuPage() {
  const [activeTab, setActiveTab] = useState<'MASTER' | 'DFO' | 'TFF'>('MASTER');
  const [selectedWeek, setSelectedWeek] = useState<string>('total');
  const [isWeeksOpen, setIsWeeksOpen] = useState(false);
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [teamLogosMap, setTeamLogosMap] = useState<Record<string, string>>({});
  
  const [week4DfoScores, setWeek4DfoScores] = useState<Record<string, number>>({});
  const [week4TffScores, setWeek4TffScores] = useState<Record<string, number>>({});
  
  const [leaderboardData, setLeaderboardData] = useState<PlayerData[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Tüm logoları Supabase'den çek
  useEffect(() => {
    const fetchTeams = async () => {
       const { data } = await supabase.from('teams').select('*');
       if (data) {
          const logos: Record<string, string> = {};
          data.forEach((team: any) => { logos[team.team_name] = team.logo_url; });
          setTeamLogosMap(logos);
       }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    if (activeTab === 'TFF' && (selectedWeek === '1' || selectedWeek === '2')) {
      setSelectedWeek('total');
    }
  }, [activeTab, selectedWeek]);

  // 🔴 4. Hafta Supabase Canlı Skor Motoru
  useEffect(() => {
    const fetchLiveMatches = async () => {
      const { data, error } = await supabase.from('live_matches').select('*');
      if (error) {
        console.error("Canlı maçlar çekilemedi: ", error);
        return;
      }
      
      if (data) {
        setLiveMatches(data);
        
        const uniqueMatches: Record<number, any> = {};
        data.forEach(row => { uniqueMatches[row.id] = row; });

        const dfoScores: Record<string, number> = {};
        const tffScores: Record<string, number> = {};
        Object.keys(allPlayersList).forEach(id => { dfoScores[id] = 0; tffScores[id] = 0; });

        Object.values(uniqueMatches).forEach(dbMatch => {
          if (dbMatch.status === 'FINISHED') {
            const finalScore = `${dbMatch.home_score}-${dbMatch.away_score}`;
            
            const matchIndex = week4Matches.findIndex(
              wm => wm.homeTeam.toLowerCase() === dbMatch.home_team.toLowerCase() &&
                    wm.awayTeam.toLowerCase() === dbMatch.away_team.toLowerCase()
            );

            if (matchIndex !== -1) {
              const isTff = isTffMatchCheck(week4Matches[matchIndex].category);
              
              Object.keys(week4PredictionsData).forEach(playerId => {
                if (week4PredictionsData[playerId] && week4PredictionsData[playerId][matchIndex] === finalScore) {
                  if (isTff) tffScores[playerId] += 1;
                  else dfoScores[playerId] += 1;
                }
              });
            }
          }
        });

        setWeek4DfoScores(dfoScores);
        setWeek4TffScores(tffScores);
      }
    };

    fetchLiveMatches();

    const channel = supabase
      .channel('skor_live_matches_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_matches' }, () => {
        fetchLiveMatches();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const calculateScores = () => {
      const baseScores: Record<string, number> = {};

      Object.keys(allPlayersList).forEach(id => {
        let total = 0;
        
        if (selectedWeek === 'total') {
            if (activeTab === 'MASTER') {
                total = (skorWeek1Data[id] || 0) + (skorWeek2Data[id] || 0) + 
                        (skorWeek3DfoData[id] || 0) + (skorWeek3TffData[id] || 0) +
                        (week4DfoScores[id] || 0) + (week4TffScores[id] || 0); 
            } else if (activeTab === 'DFO') {
                total = (skorWeek1Data[id] || 0) + (skorWeek2Data[id] || 0) + 
                        (skorWeek3DfoData[id] || 0) + (week4DfoScores[id] || 0);
            } else if (activeTab === 'TFF') {
                total = (skorWeek3TffData[id] || 0) + (week4TffScores[id] || 0);
            }
        } 
        else if (selectedWeek === '1') {
            if (activeTab === 'MASTER' || activeTab === 'DFO') total = skorWeek1Data[id] || 0;
        }
        else if (selectedWeek === '2') {
            if (activeTab === 'MASTER' || activeTab === 'DFO') total = skorWeek2Data[id] || 0;
        }
        else if (selectedWeek === '3') {
            if (activeTab === 'MASTER') total = (skorWeek3DfoData[id] || 0) + (skorWeek3TffData[id] || 0);
            else if (activeTab === 'DFO') total = skorWeek3DfoData[id] || 0;
            else if (activeTab === 'TFF') total = skorWeek3TffData[id] || 0;
        }
        else if (selectedWeek === '4') {
            if (activeTab === 'MASTER') total = (week4DfoScores[id] || 0) + (week4TffScores[id] || 0);
            else if (activeTab === 'DFO') total = week4DfoScores[id] || 0;
            else if (activeTab === 'TFF') total = week4TffScores[id] || 0;
        }

        baseScores[id] = total;
      });

      const finalData: PlayerData[] = [];
      Object.keys(baseScores).forEach(id => {
        if (baseScores[id] > 0 || selectedWeek === 'total') {
           finalData.push({ id, name: allPlayersList[id] || "Bilinmeyen", totalScore: baseScores[id] });
        }
      });

      finalData.sort((a, b) => b.totalScore - a.totalScore || a.name.localeCompare(b.name, 'tr'));
      
      const isAllZero = finalData.every(p => p.totalScore === 0);
      if (isAllZero && selectedWeek !== 'total') {
         setLeaderboardData([]);
      } else {
         setLeaderboardData(finalData);
      }
    };

    calculateScores();
  }, [activeTab, selectedWeek, week4DfoScores, week4TffScores]);

  let headerText = "MASTER SKOR ANALİZ MERKEZİ";
  let headerColor = "text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]";
  if (activeTab === 'DFO') {
    headerText = "DFO SKOR ANALİZ MERKEZİ";
    headerColor = "text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]";
  } else if (activeTab === 'TFF') {
    headerText = "TFF SKOR ANALİZ MERKEZİ";
    headerColor = "text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]";
  }

  return (
    <div className="min-h-screen bg-[#050b14] font-sans text-slate-200 pb-20 selection:bg-amber-500/30">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6 sm:py-10">

        <div className="text-center mb-8">
          <h1 className={`text-2xl sm:text-4xl font-black tracking-widest uppercase transition-colors duration-500 ${headerColor}`}>
            {headerText}
          </h1>
        </div>

        {/* 🔴 GÜNÜN CANLI MAÇLARI - ZIRHLI AKORDİYON */}
        <div className="w-full max-w-4xl mx-auto mb-8">
          <div className="bg-[#0b1120] border border-[#1e293b] rounded-xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setIsLiveOpen(!isLiveOpen)}
              className="w-full flex items-center justify-between bg-[#0f172a] p-4 hover:bg-[#1e293b] transition-colors"
            >
              <div className="w-6"></div>
              <div className="flex-1 flex justify-center items-center">
                <h2 className="text-sm sm:text-base font-bold text-amber-500 tracking-widest uppercase">
                  GÜNÜN CANLI MAÇLARI
                </h2>
              </div>
              <ChevronDown className={`w-5 h-5 text-amber-500 transition-transform duration-300 ${isLiveOpen ? "rotate-180" : ""}`} />
            </button>

            <div className={`grid transition-all duration-500 ease-in-out ${isLiveOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden">
                <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 bg-[#0a0f1c]">
                  {week4Matches.map((match, index) => {
                    const hTeam = match.homeTeam.toUpperCase();
                    const aTeam = match.awayTeam.toUpperCase();
                    
                    const hLogo = teamLogosMap[hTeam] || "/logos/default.png";
                    const aLogo = teamLogosMap[aTeam] || "/logos/default.png";

                    const liveData = liveMatches.find(
                      (m) => m.home_team.toLowerCase() === match.homeTeam.toLowerCase() &&
                             m.away_team.toLowerCase() === match.awayTeam.toLowerCase()
                    );
                    
                    const displayHomeScore = liveData && liveData.home_score !== '-' ? liveData.home_score : '-';
                    const displayAwayScore = liveData && liveData.away_score !== '-' ? liveData.away_score : '-';

                    return (
                      <div key={index} className="bg-slate-900 border border-slate-700/50 rounded-xl p-3 flex flex-col gap-3">
                         <div className="flex justify-between items-center px-2 border-b border-slate-800/50 pb-2">
                            <span className="text-[10px] text-slate-400 font-bold">{match.time}</span>
                            <span className="text-[10px] text-slate-500 font-bold truncate max-w-[150px]">{match.category}</span>
                         </div>
                         <div className="flex justify-between items-center px-2">
                             <div className="flex items-center gap-2 flex-1">
                                <img src={hLogo} className="w-6 h-6 object-contain" alt={hTeam} />
                                <span className="text-xs font-bold text-white truncate max-w-[100px]">{hTeam}</span>
                             </div>
                             <div className="bg-slate-950 px-3 py-1 rounded border border-slate-700">
                                <span className="text-sm font-black text-amber-400">{displayHomeScore} - {displayAwayScore}</span>
                             </div>
                             <div className="flex items-center gap-2 flex-1 justify-end">
                                <span className="text-xs font-bold text-white truncate max-w-[100px] text-right">{aTeam}</span>
                                <img src={aLogo} className="w-6 h-6 object-contain" alt={aTeam} />
                             </div>
                         </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🏆 TABLAR */}
        <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-3xl mx-auto">
              <button 
                onClick={() => setActiveTab('MASTER')} 
                className={`flex-1 py-4 px-4 rounded-xl font-black text-sm sm:text-lg tracking-widest uppercase transition-all duration-300 ${activeTab === 'MASTER' ? 'bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-[1.02] border-none' : 'bg-[#0f172a] text-slate-500 border border-slate-800 hover:bg-[#1e293b]'}`}
              >
                MASTER SKOR
              </button>
              
              <div className="flex gap-3 w-full sm:flex-1">
                <button 
                  onClick={() => setActiveTab('DFO')} 
                  className={`flex-1 py-3 px-2 rounded-xl font-black text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 ${activeTab === 'DFO' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-[1.02] border-none' : 'bg-[#0f172a] text-slate-500 border border-slate-800 hover:bg-[#1e293b]'}`}
                >
                  DFO SKOR
                </button>
                <button 
                  onClick={() => setActiveTab('TFF')} 
                  className={`flex-1 py-3 px-2 rounded-xl font-black text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 ${activeTab === 'TFF' ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] scale-[1.02] border-none' : 'bg-[#0f172a] text-slate-500 border border-slate-800 hover:bg-[#1e293b]'}`}
                >
                  TFF SKOR
                </button>
              </div>
            </div>
        </div>

        {/* 📅 HAFTALAR AKORDİYONU */}
        <div className="w-full max-w-3xl mx-auto mb-8">
          <div className="bg-[#0b1120] border border-[#1e293b] rounded-xl overflow-hidden shadow-2xl">
             <button 
                onClick={() => setIsWeeksOpen(!isWeeksOpen)} 
                className="w-full flex items-center justify-between bg-[#0f172a] p-4 hover:bg-[#1e293b] transition-colors"
             >
                <div className="flex items-center gap-2">
                   <span>📅</span>
                   <span className="font-bold text-white text-sm sm:text-base uppercase tracking-widest">
                     {selectedWeek === 'total' ? 'TOPLAM SKOR DURUMU' : `${selectedWeek}. HAFTA SKORLARI`}
                   </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                   <span className="text-xs font-bold tracking-widest">{isWeeksOpen ? 'KAPAT' : 'HAFTALAR'}</span>
                   {isWeeksOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
             </button>

             <div className={`transition-all duration-300 ease-in-out ${isWeeksOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 bg-[#0a0f1c] flex flex-wrap justify-center gap-2">
                   <button 
                      onClick={() => setSelectedWeek('total')} 
                      className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${selectedWeek === 'total' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                   >
                     TOPLAM
                   </button>
                   
                   {activeTab !== 'TFF' && (
                     <>
                       <button onClick={() => setSelectedWeek('1')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${selectedWeek === '1' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>1</button>
                       <button onClick={() => setSelectedWeek('2')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${selectedWeek === '2' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>2</button>
                     </>
                   )}
                   
                   <button onClick={() => setSelectedWeek('3')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${selectedWeek === '3' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>3</button>
                   <button onClick={() => setSelectedWeek('4')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${selectedWeek === '4' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>4</button>
                </div>
             </div>
          </div>
        </div>

        {/* 📊 SKOR TABLOSU */}
        <div className="bg-[#0a1120] rounded-3xl p-4 sm:p-8 shadow-2xl border border-slate-800/50 relative overflow-hidden">
          {leaderboardData.length === 0 ? (
             <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800">
                <span className="text-4xl opacity-50 block mb-4">⏳</span>
                <p className="text-slate-500 font-medium">Veriler bulunamadı veya henüz bu haftada tam isabet yok.</p>
             </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-800/50">
               <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-700/50">
                      <th className="p-4 sm:p-5 text-center text-slate-400 font-black text-xs sm:text-sm w-16">SIRA</th>
                      <th className="p-4 sm:p-5 text-slate-300 font-black text-xs sm:text-sm tracking-widest">YARIŞMACI</th>
                      <th className="p-4 sm:p-5 text-center text-amber-500 font-black text-xs sm:text-sm tracking-widest">SKOR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((player, index) => {
                      const isTop3 = index < 3;
                      const isTop1 = index === 0;

                      let nameColor = "text-slate-200";
                      let rowBg = "hover:bg-slate-800/30";
                      let rankDisplay = <span className="text-slate-500 font-bold">{index + 1}</span>;

                      if (isTop1) {
                        nameColor = "text-amber-400 font-black";
                        rowBg = "bg-amber-950/20 border-l-4 border-amber-500 hover:bg-amber-900/30";
                        rankDisplay = <span className="text-2xl drop-shadow-md">🥇</span>;
                      } else if (index === 1) {
                        nameColor = "text-slate-300 font-bold";
                        rowBg = "bg-slate-800/40 border-l-4 border-slate-400 hover:bg-slate-700/50";
                        rankDisplay = <span className="text-2xl drop-shadow-md">🥈</span>;
                      } else if (index === 2) {
                        nameColor = "text-orange-300 font-bold";
                        rowBg = "bg-orange-950/20 border-l-4 border-orange-500 hover:bg-orange-900/30";
                        rankDisplay = <span className="text-2xl drop-shadow-md">🥉</span>;
                      } else {
                        rowBg = "border-l-4 border-transparent hover:bg-slate-800/30";
                      }

                      const displayName = isMobile ? player.name.split(' 🏆')[0] : player.name;

                      return (
                        <tr key={player.id} className={`border-b border-slate-800/30 transition-all ${rowBg}`}>
                          <td className="p-4 sm:p-5 text-center align-middle">{rankDisplay}</td>
                          <td className="p-4 sm:p-5">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs sm:text-sm uppercase tracking-wide truncate ${nameColor}`}>
                                {displayName}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 sm:p-5 text-center">
                            <span className={`inline-flex items-center justify-center font-black ${isTop3 ? 'text-lg sm:text-2xl drop-shadow-[0_0_8px_currentColor]' : 'text-base sm:text-xl'} ${isTop1 ? 'text-amber-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-400' : 'text-slate-400'}`}>
                              {player.totalScore}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
               </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}