'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import LiveMatchCard from '@/components/LiveMatchCard';

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

const pastWeeksData: Record<string, { week1: number, week2: number, week3: number }> = {
  "262736": { week1: 17, week2: 24, week3: 12 },
  "262755": { week1: 22, week2: 22, week3: 8 },
  "262816": { week1: 25, week2: 11, week3: 16 },
  "262756": { week1: 22, week2: 20, week3: 5 },
  "262786": { week1: 17, week2: 12, week3: 9 },
  "262733": { week1: 13, week2: 14, week3: 4 },
  "262726": { week1: 16, week2: 10, week3: 4 },
  "262717": { week1: 16, week2: 11, week3: 3 },
  "262719": { week1: 17, week2: 12, week3: 0 },
  "262734": { week1: 18, week2: 10, week3: 0 },
  "262744": { week1: 10, week2: 10, week3: 8 },
  "262749": { week1: 14, week2: 7, week3: 6 },
  "262750": { week1: 17, week2: 10, week3: 0 },
  "262758": { week1: 14, week2: 13, week3: 0 },
  "262771": { week1: 14, week2: 9, week3: 4 },
  "262731": { week1: 15, week2: 9, week3: 2 },
  "262740": { week1: 12, week2: 8, week3: 6 },
  "262782": { week1: 10, week2: 12, week3: 4 },
  "262704": { week1: 16, week2: 9, week3: 0 },
  "262705": { week1: 8, week2: 13, week3: 4 },
  "262718": { week1: 16, week2: 9, week3: 0 },
  "262725": { week1: 11, week2: 12, week3: 2 },
  "262738": { week1: 13, week2: 9, week3: 3 },
  "262763": { week1: 14, week2: 11, week3: 0 },
  "262813": { week1: 11, week2: 14, week3: 0 },
  "262728": { week1: 6, week2: 10, week3: 8 },
  "262732": { week1: 8, week2: 10, week3: 6 },
  "262703": { week1: 7, week2: 10, week3: 5 },
  "262709": { week1: 12, week2: 9, week3: 1 },
  "262711": { week1: 13, week2: 9, week3: 0 },
  "262714": { week1: 8, week2: 10, week3: 4 },
  "262723": { week1: 12, week2: 9, week3: 1 },
  "262730": { week1: 8, week2: 9, week3: 4 },
  "262747": { week1: 10, week2: 9, week3: 2 },
  "262770": { week1: 11, week2: 8, week3: 2 },
  "262772": { week1: 9, week2: 7, week3: 5 },
  "262774": { week1: 11, week2: 8, week3: 2 },
  "262702": { week1: 8, week2: 8, week3: 4 },
  "262716": { week1: 10, week2: 6, week3: 4 },
  "262753": { week1: 8, week2: 8, week3: 4 },
  "262790": { week1: 12, week2: 8, week3: 0 },
  "262706": { week1: 9, week2: 8, week3: 1 },
  "262707": { week1: 8, week2: 8, week3: 2 },
  "262739": { week1: 9, week2: 9, week3: 0 },
  "262754": { week1: 8, week2: 7, week3: 2 },
  "351925": { week1: 7, week2: 9, week3: 1 },
  "262721": { week1: 7, week2: 8, week3: 0 }
};

const week4PredictionsData: Record<string, string[]> = {
  "262731": ["1-1", "3-1", "1-1", "2-0", "3-0", "2-2", "1-3", "1-1", "2-1", "1-2", "1-0", "1-3", "2-1", "1-2", "2-2", "2-1", "2-1", "1-1", "3-1", "1-1", "1-1", "1-1", "1-1", "2-1"], "262758": ["1-2", "3-0", "2-0", "3-0", "4-1", "1-1", "1-3", "1-1", "1-1", "0-2", "2-1", "0-3", "3-0", "1-1", "2-1", "2-1", "3-0", "3-0", "3-0", "1-1", "0-3", "1-1", "1-2", "3-0"], "262763": ["1-1", "1-1", "1-1", "2-0", "4-0", "1-1", "0-2", "1-0", "1-0", "1-1", "1-1", "1-1", "1-1", "2-0", "1-1", "1-1", "1-1", "1-0", "3-0", "1-1", "1-1", "1-1", "1-1", "1-0"], "262744": ["1-2", "3-1", "1-1", "2-0", "4-0", "2-0", "1-2", "1-1", "1-0", "0-0", "2-2", "0-4", "2-0", "2-0", "1-2", "2-1", "0-1", "0-2", "2-0", "0-1", "0-2", "0-2", "1-1", "0-1"], "262813": ["1-2", "4-1", "1-0", "3-2", "2-0", "2-0", "1-3", "1-1", "3-0", "2-2", "1-2", "0-4", "1-1", "2-2", "2-0", "1-0", "2-0", "1-2", "2-0", "1-2", "1-3", "0-0", "0-1", "1-2"], "351925": ["0-2", "0-0", "2-1", "1-0", "3-0", "0-0", "0-2", "0-0", "0-0", "0-0", "0-0", "0-3", "2-1", "0-0", "2-0", "2-1", "0-0", "0-2", "2-0", "0-0", "0-2", "0-0", "0-2", "0-0"], "262732": ["2-1", "2-1", "1-0", "1-1", "2-0", "3-1", "2-2", "2-1", "2-0", "1-1", "1-1", "0-3", "2-0", "1-1", "2-1", "0-1", "1-1", "1-1", "2-1", "1-2", "0-2", "0-2", "2-1", "1-0"], "262754": ["1-1", "1-0", "1-0", "2-0", "3-0", "1-0", "0-2", "1-0", "1-0", "0-2", "1-0", "0-3", "2-0", "1-0", "1-2", "1-0", "1-0", "1-1", "2-0", "1-0", "0-1", "0-1", "1-0", "1-0"], "262733": ["2-1", "3-1", "0-0", "3-0", "2-0", "0-1", "1-4", "2-0", "0-0", "1-0", "1-1", "0-3", "2-0", "2-1", "2-1", "2-0", "1-1", "1-0", "3-0", "1-1", "0-1", "1-1", "3-1", "1-0"], "262774": ["0-1", "2-0", "1-0", "2-0", "3-1", "1-1", "0-2", "1-1", "1-2", "1-2", "1-1", "0-2", "1-0", "0-0", "2-0", "0-0", "1-2", "2-1", "2-0", "1-1", "0-2", "0-0", "3-1", "0-2"], "262771": ["2-2", "3-1", "2-1", "4-0", "5-0", "1-1", "1-3", "1-1", "2-2", "1-1", "2-1", "1-4", "3-1", "3-0", "2-1", "1-0", "1-1", "3-1", "3-1", "1-3", "1-1", "1-1", "1-1", "2-1"], "262730": ["0-3", "3-0", "1-0", "3-1", "2-0", "1-1", "0-2", "0-1", "0-0", "0-1", "0-2", "0-3", "2-0", "2-1", "0-2", "2-0", "1-1", "1-2", "3-0", "0-1", "0-2", "0-0", "1-1", "2-1"], "262707": ["0-4", "3-0", "2-1", "1-1", "1-0", "0-0", "0-2", "0-0", "2-1", "0-2", "0-0", "0-4", "1-0", "0-0", "0-0", "0-0", "0-0", "0-0", "2-0", "1-0", "0-2", "0-0", "0-0", "0-2"], "262816": ["0-1", "3-1", "0-2", "1-0", "2-0", "0-0", "0-3", "1-1", "3-0", "0-2", "0-0", "0-2", "3-0", "0-2", "2-0", "1-1", "2-1", "1-3", "3-0", "0-0", "0-2", "0-3", "2-0", "0-1"], "262719": ["2-1", "2-1", "2-0", "2-1", "3-0", "2-1", "0-2", "3-1", "2-1", "1-1", "1-2", "0-2", "3-0", "2-1", "2-1", "1-1", "1-2", "2-1", "3-0", "2-1", "1-1", "2-1", "1-2", "2-0"], "262725": ["0-2", "2-0", "1-1", "3-0", "3-0", "1-0", "0-2", "1-1", "2-0", "2-1", "2-1", "0-2", "2-0", "0-0", "1-1", "1-0", "2-0", "1-0", "2-0", "0-1", "0-2", "1-0", "1-0", "0-1"], "262711": ["0-1", "3-1", "1-0", "3-0", "3-0", "2-1", "0-4", "0-0", "1-1", "1-3", "1-1", "1-2", "2-2", "1-0", "1-1", "2-1", "0-0", "2-1", "3-0", "0-0", "1-1", "1-2", "2-2", "2-0"], "262718": ["1-2", "4-1", "3-1", "3-0", "4-1", "1-1", "1-3", "2-2", "2-1", "1-1", "1-2", "1-3", "2-0", "2-1", "2-2", "2-1", "2-2", "1-1", "3-1", "2-2", "1-2", "1-3", "2-2", "1-2"], "262721": ["0-1", "2-0", "1-0", "3-1", "2-1", "0-2", "0-3", "2-1", "2-0", "1-2", "1-1", "0-3", "3-1", "1-1", "0-1", "0-2", "0-1", "0-2", "2-0", "0-2", "0-3", "0-1", "2-2", "0-1"], "262726": ["1-3", "2-2", "2-2", "3-0", "4-0", "1-1", "1-2", "2-1", "1-1", "1-1", "1-2", "0-3", "1-1", "2-1", "0-2", "0-2", "2-0", "1-1", "2-0", "3-1", "2-2", "0-2", "1-0", "2-1"], "262702": ["0-2", "1-0", "1-1", "3-1", "2-0", "1-0", "0-2", "0-1", "0-0", "0-1", "1-0", "0-3", "2-0", "1-0", "0-1", "1-0", "1-0", "2-0", "3-0", "1-1", "0-0", "0-1", "0-0", "2-0"], "262738": ["1-1", "2-1", "1-1", "1-0", "3-0", "2-1", "1-3", "2-1", "2-1", "1-1", "2-1", "1-3", "2-0", "1-1", "2-2", "2-1", "2-1", "1-1", "2-0", "2-1", "1-1", "1-1", "2-1", "1-1"], "262750": ["1-1", "3-1", "2-2", "3-1", "3-0", "1-1", "1-3", "2-1", "0-0", "1-2", "2-2", "0-3", "3-1", "2-0", "2-2", "0-0", "1-1", "0-2", "3-1", "0-2", "0-3", "1-2", "1-3", "2-0"], "262705": ["1-3", "3-1", "2-1", "3-1", "3-1", "3-0", "1-3", "1-2", "3-1", "1-2", "1-2", "0-3", "2-0", "3-0", "2-1", "2-1", "2-0", "2-0", "4-0", "3-1", "0-1", "0-2", "1-2", "1-1"], "262706": ["0-2", "4-1", "1-0", "3-0", "2-0", "0-2", "0-2", "0-0", "0-0", "0-1", "0-0", "0-2", "0-2", "0-0", "0-1", "0-0", "0-0", "0-1", "2-0", "2-1", "0-2", "0-2", "0-0", "2-0"], "262716": ["1-1", "3-2", "1-0", "3-1", "3-0", "3-1", "0-3", "0-0", "3-1", "0-2", "1-1", "0-4", "2-0", "3-1", "1-1", "3-0", "2-1", "1-1", "4-0", "2-1", "0-2", "0-2", "1-1", "1-2"], "262736": ["1-2", "2-1", "1-2", "3-0", "4-0", "2-1", "2-4", "3-1", "2-2", "2-2", "3-2", "1-1", "3-1", "3-0", "1-1", "4-1", "2-1", "2-1", "1-0", "2-1", "1-1", "1-1", "1-1", "3-0"], "262714": ["1-3", "2-0", "0-2", "0-0", "2-0", "0-1", "1-1", "0-0", "2-0", "0-1", "2-0", "0-3", "1-1", "0-1", "1-1", "0-0", "0-0", "1-0", "1-0", "0-0", "1-0", "1-1", "0-1", "0-1"], "262749": ["2-1", "3-1", "2-0", "3-0", "3-1", "2-2", "1-2", "2-1", "2-0", "2-0", "2-2", "1-3", "2-1", "2-1", "2-1", "1-1", "2-1", "1-1", "2-1", "2-1", "0-2", "1-2", "2-2", "1-1"], "262753": ["1-1", "2-1", "2-0", "3-0", "1-1", "1-0", "3-2", "1-1", "1-0", "2-2", "2-2", "0-3", "2-0", "1-2", "1-1", "1-1", "1-1", "0-1", "2-0", "1-1", "1-2", "1-1", "0-2", "1-1"], "262740": ["1-2", "1-1", "2-1", "2-0", "3-0", "1-2", "1-3", "1-1", "2-2", "1-1", "2-1", "1-3", "3-0", "1-1", "2-2", "2-1", "1-1", "1-2", "3-1", "2-1", "1-2", "2-1", "2-2", "1-1"], "262790": ["0-2", "3-1", "0-2", "0-2", "4-0", "0-2", "0-3", "3-1", "1-1", "2-0", "1-1", "0-3", "3-1", "2-1", "0-3", "2-1", "1-1", "2-0", "2-1", "1-0", "2-1", "1-1", "0-2", "0-2"], "262786": ["1-2", "3-1", "3-1", "3-0", "2-1", "1-1", "1-2", "1-1", "1-2", "2-0", "2-1", "1-1", "3-1", "2-0", "1-1", "1-2", "1-1", "1-1", "3-1", "2-1", "2-0", "1-2", "1-2", "1-1"], "262734": ["3-0", "4-1", "2-1", "3-1", "4-1", "2-1", "1-2", "3-2", "2-1", "3-2", "3-1", "2-1", "3-0", "2-3", "1-2", "3-1", "2-1", "3-2", "4-1", "3-1", "2-1", "3-1", "2-1", "3-1"], "262756": ["2-2", "3-2", "2-0", "4-2", "1-2", "1-2", "1-3", "1-2", "0-0", "0-0", "2-1", "1-3", "2-2", "1-2", "1-2", "1-2", "0-0", "0-0", "2-0", "0-0", "2-2", "0-1", "1-1", "1-3"], "262703": ["2-2", "1-1", "1-1", "2-1", "1-0", "1-1", "1-3", "2-2", "0-1", "0-0", "1-1", "0-2", "0-0", "0-0", "2-2", "1-1", "1-1", "0-0", "2-1", "1-1", "0-1", "1-1", "2-2", "0-0"], "262772": ["0-2", "2-0", "1-1", "1-1", "1-0", "0-0", "0-1", "0-0", "1-0", "1-2", "2-3", "0-3", "2-0", "1-1", "1-1", "1-0", "0-1", "1-0", "2-1", "1-1", "0-0", "0-1", "0-0", "0-1"], "262717": ["1-2", "0-1", "1-1", "2-2", "2-2", "2-0", "0-2", "1-2", "0-0", "0-2", "0-1", "0-2", "2-0", "1-2", "1-1", "1-0", "1-2", "0-0", "2-1", "1-0", "1-1", "3-2", "1-2", "0-0"], "262728": ["0-0", "0-0", "1-0", "2-1", "4-1", "0-1", "0-2", "1-1", "0-1", "0-0", "1-0", "0-5", "4-0", "2-0", "2-3", "1-2", "0-0", "0-0", "3-0", "0-0", "0-2", "0-1", "0-2", "0-0"], "262770": ["3-1", "3-1", "2-2", "2-0", "2-1", "1-1", "1-3", "0-2", "2-0", "0-3", "0-1", "0-4", "2-1", "1-1", "2-1", "2-0", "1-1", "1-0", "3-0", "2-3", "0-2", "1-2", "0-2", "3-1"], "262755": ["1-2", "4-1", "3-2", "2-1", "3-2", "1-1", "3-3", "2-1", "1-0", "0-1", "1-1", "0-2", "1-1", "3-0", "1-2", "4-2", "3-1", "2-2", "1-0", "2-2", "1-0", "3-2", "1-0", "3-1"], "262704": ["1-1", "2-1", "1-1", "2-0", "3-0", "0-1", "1-2", "2-1", "1-0", "0-1", "1-1", "1-3", "1-0", "2-0", "2-1", "2-0", "1-1", "1-1", "2-1", "1-1", "1-2", "0-2", "2-1", "1-1"], "262747": ["1-1", "2-0", "1-0", "2-0", "2-0", "1-1", "1-2", "1-1", "1-1", "1-1", "1-1", "1-3", "1-1", "1-1", "1-1", "1-1", "1-1", "1-1", "2-0", "1-1", "1-1", "1-1", "1-1", "1-1"], "262723": ["1-1", "3-1", "2-1", "2-0", "3-0", "1-2", "1-2", "2-1", "2-0", "1-2", "1-1", "2-1", "3-1", "3-0", "2-1", "1-1", "2-1", "1-1", "2-1", "1-1", "0-2", "0-2", "1-1", "2-0"], "262709": ["1-1", "2-1", "2-1", "2-0", "3-0", "1-1", "1-2", "1-1", "1-0", "1-0", "2-1", "0-2", "2-1", "2-0", "1-1", "1-0", "1-1", "2-1", "2-1", "1-1", "0-3", "0-2", "1-2", "1-0"],
  "262782": ["0-2", "0-0", "0-1", "1-0", "1-0", "0-0", "0-4", "1-0", "0-1", "0-0", "0-1", "0-3", "0-0", "0-0", "0-1", "0-0", "0-0", "0-0", "3-1", "0-0", "0-1", "0-0", "0-0", "0-0"],
  "262739": ["1-0", "3-1", "1-1", "3-0", "3-1", "0-1", "1-2", "3-1", "2-0", "2-0", "2-1", "1-2", "3-0", "2-0", "2-1", "3-2", "1-0", "1-0", "2-0", "1-1", "0-1", "1-1", "1-2", "1-0"]
};

export default function MasterPuanDurumu() {
  const [playersData, setPlayersData] = useState<any[]>([]);
  const [weekDataState, setWeekDataState] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<number | 'total'>('total');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fetchData = async () => {
    try {
      const { data: stData } = await supabase.from('standings').select('*').eq('league_type', 'MASTER');
      const { data: ptsData } = await supabase.from('points').select('*').eq('kategori', 'MASTER');
      const { data: liveData } = await supabase.from('live_matches').select('*');

      // Deduplication for standings
      const uniqueMatches: Record<string, any> = {};
      if (stData) {
        stData.forEach(row => {
          const current = uniqueMatches[row.user_id];
          if (!current || row.points > current.points) {
            uniqueMatches[row.user_id] = row;
          }
        });
      }
      const grouped: Record<string, number> = {};
      Object.values(uniqueMatches).forEach(row => {
        grouped[row.user_id] = row.points;
      });

      // Weekly points
      const weekGrouped: Record<string, number> = {};
      if (ptsData && typeof selectedWeek === 'number') {
        ptsData.filter(r => r.hafta === selectedWeek).forEach(r => {
          weekGrouped[r.username] = (weekGrouped[r.username] || 0) + r.puan;
        });
      }

      // Live Extra Points
      const liveMatches = liveData?.filter(m => m.status === 'LIVE' && m.id >= 1 && m.id <= 24) || [];
      const liveExtraMap: Record<string, number> = {};
      
      liveMatches.forEach(m => {
        const hScore = m.home_score;
        const aScore = m.away_score;
        if (hScore !== '-' && aScore !== '-') {
          const targetScore = `${hScore}-${aScore}`;
          const winners = Object.keys(week4PredictionsData).filter(uid => week4PredictionsData[uid][m.id - 1] === targetScore);
          
          let pts = 0;
          if(winners.length === 1) pts = 12;
          else if(winners.length === 2) pts = 6;
          else if(winners.length === 3) pts = 5;
          else if(winners.length === 4) pts = 4;
          else if(winners.length === 5) pts = 3;
          else if(winners.length === 6) pts = 2;
          else if(winners.length >= 7) pts = 1;

          winners.forEach(uid => {
            liveExtraMap[uid] = (liveExtraMap[uid] || 0) + pts;
          });
        }
      });

      const buildFullList = (baseGroupedMap: Record<string, number>, isTotal: boolean) => {
        return Object.keys(staticPlayersList).map(userId => {
          let basePoints = baseGroupedMap[userId] || 0;
          let previousTotal = 0;

          if (pastWeeksData[userId]) {
             const pw = pastWeeksData[userId];
             previousTotal = pw.week1 + pw.week2 + pw.week3;
             if (isTotal) {
                 basePoints = previousTotal; 
             }
          }

          let lExtra = liveExtraMap[userId] || 0;

          return {
            id: userId,
            name: staticPlayersList[userId] || 'Bilinmeyen',
            puan: basePoints + lExtra,
            liveExtra: lExtra,
            previousTotal: previousTotal
          };
        }).sort((a, b) => {
          if (b.puan !== a.puan) return b.puan - a.puan;
          return (staticPlayersList[a.id] || '').localeCompare(staticPlayersList[b.id] || '', 'tr');
        });
      };

      const fullListTotal = buildFullList(grouped, true);
      const fullListWeek = buildFullList(weekGrouped, false);

      const previousRanking = [...fullListTotal].sort((a, b) => {
        if (b.previousTotal !== a.previousTotal) return b.previousTotal - a.previousTotal;
        return a.name.localeCompare(b.name, 'tr');
      }).map(p => p.id);

      const finalPlayersData = fullListTotal.map((player, currentIndex) => {
          const previousIndex = previousRanking.indexOf(player.id);
          let trend = 'same';
          let trendValue = 0;
          
          if (previousIndex > currentIndex) {
              trend = 'up';
              trendValue = previousIndex - currentIndex;
          } else if (previousIndex < currentIndex) {
              trend = 'down';
              trendValue = currentIndex - previousIndex;
          }

          return { ...player, trend, trendValue };
      });

      setPlayersData(finalPlayersData);
      setWeekDataState(fullListWeek);
      
    } catch (error) {
      console.error("Master Puanları çekilirken hata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('public:live_matches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_matches' }, payload => {
        fetchData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedWeek]);

  const sortedData = selectedWeek === 'total' ? playersData : weekDataState;

  const renderPlayerName = (fullName: string) => {
      const parts = fullName.split('🏆');
      const namePart = parts[0].trim();
      const trophyCount = parts.length - 1;
      const trophies = '🏆'.repeat(trophyCount);

      return (
          <div className="flex items-center gap-1 min-w-0">
              <span className="truncate">{namePart}</span>
              {trophies && <span className="flex-shrink-0">{trophies}</span>}
          </div>
      );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 p-4 sm:p-6 font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-lg font-bold text-amber-500 tracking-widest animate-pulse">LİDERLİK TABLOSU YÜKLENİYOR...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-2 sm:p-6 font-sans pb-24">
      <div className="max-w-4xl mx-auto pt-6">
        
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-black text-amber-500 tracking-tight uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            ELİT TAHMİN MASTER LİGİ
          </h1>
        </div>

        <div className="w-full max-w-4xl mx-auto mb-8 sm:mb-12">
            <LiveMatchCard />
        </div>

        <div className="flex justify-center mb-6 w-full max-w-4xl mx-auto px-2">
          <button onClick={() => { setSelectedWeek('total'); setIsDropdownOpen(false); }}
            className="bg-amber-500 hover:bg-amber-400 text-[#0f172a] w-full max-w-lg py-3 rounded-xl font-black text-sm tracking-widest transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] uppercase">
            MASTER TOPLAM PUAN DURUMU
          </button>
        </div>

        <div className="flex justify-center mb-10 w-full max-w-4xl mx-auto px-2 relative z-50">
          <div className="w-full max-w-lg relative">
             <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}
               className="bg-[#0f172a] border border-slate-700 w-full py-3 rounded-xl font-black text-xs text-slate-300 tracking-widest transition-all shadow-lg flex justify-between items-center px-4 uppercase hover:bg-slate-800/50">
               <span className="flex items-center gap-2">
                  <span className="text-base">📅</span> 
                  {selectedWeek === 'total' ? 'TOPLAM PUAN DURUMU' : `MASTER ${selectedWeek}. HAFTA PUAN DURUMU`}
               </span>
               <span className="text-[10px]">{isDropdownOpen ? '▲ KAPAT' : '▼ HAFTALAR'}</span>
             </button>

             {isDropdownOpen && (
               <div className="absolute top-full left-0 w-full mt-2 bg-[#0b1221] border border-slate-700/50 rounded-xl shadow-2xl p-4 overflow-hidden z-50 animate-fadeIn">
                 <div className="flex flex-wrap justify-center gap-3">
                   {[1,2,3,4].map(w => (
                     <button key={w} onClick={() => { setSelectedWeek(w); setIsDropdownOpen(false); }}
                       className={`w-10 h-10 rounded-lg font-black text-sm flex items-center justify-center transition-all ${selectedWeek === w ? 'bg-amber-500 text-slate-900 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-[#0f172a] text-slate-400 border border-slate-800 hover:border-amber-500/50 hover:text-amber-400'}`}>
                       {w}
                     </button>
                   ))}
                 </div>
               </div>
             )}
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto bg-[#0b1221] rounded-2xl sm:rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden">
          <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead>
                <tr className="bg-[#0d1629]">
                  <th className="p-3 sm:p-4 text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-widest w-16 text-center border-b border-slate-800">SIRA</th>
                  <th className="p-3 sm:p-4 text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-widest border-b border-slate-800">YARIŞMACI</th>
                  <th className="p-3 sm:p-4 text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-widest text-center border-b border-slate-800 w-24 sm:w-32">
                    {selectedWeek === 'total' ? 'TOPLAM PUAN' : 'HAFTALIK PUAN'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.length === 0 ? (
                   <tr>
                     <td colSpan={3} className="p-8 text-center text-slate-500 italic font-medium text-sm">
                        Henüz puan verisi bulunmamaktadır.
                     </td>
                   </tr>
                ) : (
                  sortedData.map((player, index) => (
                    <tr 
                      key={player.id} 
                      className="transition-colors hover:bg-slate-800/30 border-b border-slate-800/50 last:border-0"
                    >
                      <td className="p-3 sm:p-4 text-center">
                        <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                           <span className="font-bold text-slate-400 text-xs sm:text-sm w-4">{index + 1}</span>
                           {selectedWeek === 'total' && player.trend && (
                              <div className="flex items-center w-6">
                                 {player.trend === 'up' && <span className="text-emerald-500 text-[9px] sm:text-[11px] flex items-center font-black">▲{player.trendValue}</span>}
                                 {player.trend === 'down' && <span className="text-rose-500 text-[9px] sm:text-[11px] flex items-center font-black">▼{player.trendValue}</span>}
                                 {player.trend === 'same' && <span className="text-slate-600 text-[9px] sm:text-[11px] flex items-center font-black">▶</span>}
                              </div>
                           )}
                        </div>
                      </td>
                      
                      <td className="p-3 sm:p-4 text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm uppercase tracking-wide text-slate-200">
                            {renderPlayerName(player.name)}
                          </span>
                          
                          {player.liveExtra > 0 && (
                            <span className="text-[9px] sm:text-[10px] font-black text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800 flex w-fit items-center gap-1 shadow-sm">
                              +{player.liveExtra} CANLI
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-3 sm:p-4 text-center">
                        <span className="font-black text-sm sm:text-base text-amber-500">
                          {player.puan}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}