'use client';

import React, { useState } from 'react';
import { supabase } from '@/utils/supabase';

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

export default function AdminTahminmatik() {
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(true); // Otomatik açık başlasın
  const [matchInputs, setMatchInputs] = useState<Record<number, { home: string, away: string, min: string }>>({});

  const scoreOptions = ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  
  const minOptions: string[] = [];
  for(let i=1; i<=45; i++) minOptions.push(i.toString());
  for(let i=1; i<=15; i++) minOptions.push(`45+${i}`);
  for(let i=46; i<=90; i++) minOptions.push(i.toString());
  for(let i=1; i<=15; i++) minOptions.push(`90+${i}`);

  const handleScoreChange = (matchId: number, type: 'home' | 'away' | 'min', value: string) => {
    setMatchInputs(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId] || { home: "-", away: "-", min: "1" },
        [type]: value
      }
    }));
  };

  const dispatchScores = async (matchId: number, h: string, a: string, status: 'LIVE' | 'HT' | 'FINISHED', baseMinute: string) => {
    
    try {
      const { error } = await supabase
        .from('live_matches')
        .upsert({
          id: matchId,
          home_score: h,
          away_score: a,
          status: status,
          base_minute: baseMinute,
          started_at: status === 'LIVE' ? Date.now() : 0
        });

      if (error) {
        alert("Supabase Hatası: " + error.message);
      } else {
        console.log("Supabase güncellendi!");
      }
    } catch (e) {
      console.log("Supabase hatası, sadece lokal güncelleniyor.");
    }

    // YEDEK LOKAL GÜNCELLEME (Hızlı Tepki İçin)
    const targetScore = `${h}-${a}`;
    const winnerIds = Object.keys(week4PredictionsData).filter(id => week4PredictionsData[id][matchId - 1] === targetScore);
    
    let points = 1;
    if(winnerIds.length === 1) points = 12;
    else if(winnerIds.length === 2) points = 6;
    else if(winnerIds.length === 3) points = 5;
    else if(winnerIds.length === 4) points = 4;
    else if(winnerIds.length === 5) points = 3;
    else if(winnerIds.length === 6) points = 2;
    else if(winnerIds.length === 0) points = 0;

    const currentBoard = {}; 
    winnerIds.forEach(wId => {
      currentBoard[wId] = { dfo: points, master: points, skor: 1 };
    });

    const signalData = { 
      status, 
      homeScore: h, 
      awayScore: a, 
      baseMinute: baseMinute,
      startedAt: status === 'LIVE' ? Date.now() : null 
    };
    
    localStorage.setItem('elitTahmin_AdminSignal', JSON.stringify(signalData));
    localStorage.setItem('elitTahmin_Leaderboard', JSON.stringify(currentBoard));
    
    window.dispatchEvent(new Event('adminUpdate')); 
    window.dispatchEvent(new Event('leaderboardUpdate')); 
  };

  const resetSystem = async () => {
    try {
      await supabase.from('live_matches').upsert({
        id: 1, home_score: '-', away_score: '-', status: 'NOT_STARTED', base_minute: '1', started_at: 0
      });
    } catch(e) {}

    localStorage.removeItem('elitTahmin_AdminSignal');
    localStorage.removeItem('elitTahmin_Leaderboard');
    window.dispatchEvent(new Event('adminUpdate')); 
    window.dispatchEvent(new Event('leaderboardUpdate')); 
    setMatchInputs({});
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 text-slate-100 min-h-screen">
      
      <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-amber-400 tracking-tight uppercase flex items-center gap-3">
          ⚡ ADMIN TAHMİNMATİK
        </h1>
        <button onClick={resetSystem} className="mt-4 md:mt-0 bg-red-950/80 border border-red-800 text-red-400 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm hover:bg-red-900 hover:text-red-300 transition-colors shadow-lg">
          📌 SİSTEMİ & PUANLARI SIFIRLA
        </button>
      </div>

      <div className="w-full relative mb-8">
        <button onClick={() => setIsAdminPanelOpen(!isAdminPanelOpen)} className={`w-full py-4 px-6 rounded-xl font-extrabold text-base border-2 transition-all flex items-center justify-between shadow-lg ${isAdminPanelOpen ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-amber-500 border-amber-500/50 hover:bg-slate-800'}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎛️</span>
            <span>MANUEL MAÇ KONTROL PANELİ (YÖNETMEN MODU)</span>
          </div>
          <span className="text-lg transition-transform duration-300">{isAdminPanelOpen ? '▲' : '▼'}</span>
        </button>

        {isAdminPanelOpen && (
          <div className="absolute top-full left-0 right-0 mt-3 z-40 bg-slate-900/95 border-2 border-amber-500/50 p-6 rounded-2xl shadow-2xl backdrop-blur-xl animate-fadeIn max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {week4Matches.slice(0, 1).map((match) => { 
                const currentInputs = matchInputs[match.id] || { home: "-", away: "-", min: "1" };
                return (
                  <div key={match.id} className="flex flex-col gap-4 bg-slate-950 border border-slate-700/80 p-5 rounded-xl shadow-lg">
                    <h3 className="text-amber-400 font-black text-sm tracking-widest text-center border-b border-slate-700 pb-2 truncate">
                      {match.title} | <span className="text-white">{match.homeTeam} - {match.awayTeam}</span>
                    </h3>
                    
                    <div className="flex justify-between gap-4 mb-2">
                      <div className="flex flex-col flex-1 items-center">
                        <label className="text-[10px] text-slate-400 font-bold mb-2">EV SAHİBİ SKOR</label>
                        <select 
                          value={currentInputs.home} 
                          onChange={(e)=>handleScoreChange(match.id, 'home', e.target.value)} 
                          className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-2 text-lg font-bold outline-none focus:border-amber-500 appearance-none text-center cursor-pointer hover:bg-slate-800 shadow-inner"
                        >
                          {scoreOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col flex-1 items-center">
                        <label className="text-[10px] text-slate-400 font-bold mb-2">DEPLASMAN SKOR</label>
                        <select 
                          value={currentInputs.away} 
                          onChange={(e)=>handleScoreChange(match.id, 'away', e.target.value)} 
                          className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-2 text-lg font-bold outline-none focus:border-amber-500 appearance-none text-center cursor-pointer hover:bg-slate-800 shadow-inner"
                        >
                          {scoreOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col flex-1 items-center">
                        <label className="text-[10px] text-slate-400 font-bold mb-2">DAKİKA SEÇ</label>
                        <select 
                          value={currentInputs.min} 
                          onChange={(e)=>handleScoreChange(match.id, 'min', e.target.value)} 
                          className="w-full bg-slate-900 border border-slate-600 text-amber-400 rounded-lg p-2 text-lg font-bold outline-none focus:border-amber-500 appearance-none text-center cursor-pointer hover:bg-slate-800 shadow-inner"
                        >
                          {minOptions.map(opt => <option key={opt} value={opt}>{opt}'</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      <button onClick={() => dispatchScores(match.id, currentInputs.home, currentInputs.away, 'LIVE', currentInputs.min)} className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black py-2 rounded-lg transition-colors shadow-md">
                        🚀 MAÇI BAŞLAT
                      </button>
                      <button onClick={() => dispatchScores(match.id, currentInputs.home, currentInputs.away, 'HT', 'İY')} className="bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-black py-2 rounded-lg transition-colors shadow-md">
                        ⏸️ İLK YARI BİTTİ
                      </button>
                      <button onClick={() => { handleScoreChange(match.id, 'min', '46'); dispatchScores(match.id, currentInputs.home, currentInputs.away, 'LIVE', '46'); }} className="bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black py-2 rounded-lg transition-colors shadow-md">
                        ▶️ 2. YARI BAŞLA
                      </button>
                      <button onClick={() => dispatchScores(match.id, currentInputs.home, currentInputs.away, 'LIVE', currentInputs.min)} className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-black py-2 rounded-lg transition-colors shadow-md col-span-1 sm:col-span-2">
                        🔴 CANLI GÜNCELLE
                      </button>
                      <button onClick={() => dispatchScores(match.id, currentInputs.home, currentInputs.away, 'FINISHED', 'MS')} className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black py-2 rounded-lg transition-colors shadow-md col-span-2 sm:col-span-1">
                        🏁 BİTİR (MS)
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}