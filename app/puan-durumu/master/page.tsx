'use client';

import React, { useState, useEffect } from 'react';
import LiveMatchCard from '@/components/LiveMatchCard';
import { supabase } from '@/utils/supabase'; // 🔴 EKREM: Veritabanı bağlantısı buraya eklendi!

const allPlayersMasterList: Record<string, string> = {
  "262756": "EYÜP KARACAOĞLU", "262755": "DOĞAÇ ALKAN", "262816": "SEDAT SEDAT", "262736": "MEHMET ALİ KARA",
  "262786": "SEDAT DİŞLİ", "262733": "MUHSİN ASİLKAN", "262728": "ÖNDER ASLAN", "262726": "HUDAVER TOPARDIC",
  "262709": "SALİH KARACAOĞLU", "262719": "UĞUR VARDAR", "262754": "OSMAN ALİ AYDIN", "262771": "ULAŞ ADIGÜZEL",
  "262721": "MUSTAFA GÜMÜŞÇÜ", "262790": "CUMALİ SÖKER", "262717": "MURAT ALİ", "262732": "R. İLHAN KARACA",
  "262711": "RIDVAN DOGER", "262731": "FATİH AYAN", "262772": "CEMAL SİVRİKAYA", "262763": "MUSTAFA ELMAS",
  "262707": "HAKAN AYAN", "262706": "GAZİ AYAN", "262813": "KEMAL ERSOY", "262774": "ŞENOL CAN ÇAKICI",
  "262747": "SAVAŞ ÇAĞLAYAN", "262705": "AHMET BİRCAN", "262714": "İSMAİL EKER", "262740": "ABDULLAH DİK",
  "262702": "MURAT KARA", "262738": "MEVLÜT EVLER", "262753": "YUSUF KIZILTUĞ", "262716": "BİROL DEMİREL",
  "262750": "MAHMUT CBR", "262734": "LEVENT YILDIRIM", "262725": "İLYAS KAZDAL", "262737": "ŞAHİN GEZGİNCİ",
  "351925": "ALİOS GÖZTEPE", "262730": "ÖNDER IŞIK", "262782": "YUSUF ERBAY",
  "262749": "B.VEYSELOĞLU EROL", "262718": "BEKİR KARADAĞ", "262715": "ŞEMSETTİN DÜGER", "262739": "UĞUR GÜRBÜZ",
  "262703": "CEMALETTİN BELLİ", "262758": "MELİH PINAR", "262770": "OZKAYA MAZAKALI BAYRAM", "262708": "BAYRAM YILMAZ",
  "262787": "MUSTAFA TUCİ", "262744": "İLYAS UYGUN", "262712": "MURAT AYDEMİR", "262704": "YAPAY ZEKA",
  "262723": "AYHAN LUŞOĞLU"
};

const masterWeek1Data: Record<string, { name: string; puan: number }> = { "262736": { name: "MEHMET ALİ KARA 🏔️ (+3 PUAN HAFTANIN ZİRVE BONUSU)", puan: 34 }, "262755": { name: "DOĞAÇ ALKAN 🎯 (+3 PUAN HAFTANIN SKOR BONUSU)", puan: 24 }, "262719": { name: "UĞUR VARDAR", puan: 23 }, "262756": { name: "EYÜP KARACAOĞLU", puan: 17 }, "262754": { name: "OSMAN ALİ AYDIN 🏆", puan: 14 }, "262786": { name: "SEDAT DİŞLİ", puan: 12 }, "262717": { name: "MURAT ALİ", puan: 11 }, "262731": { name: "FATİH AYAN", puan: 11 }, "262726": { name: "HUDAVER TOPARDIC", puan: 10 }, "262732": { name: "R. İLHAN KARACA 🏆🏆", puan: 10 }, "262750": { name: "MAHMUT CBR", puan: 9 }, "262728": { name: "ÖNDER ASLAN", puan: 8 }, "262747": { name: "SAVAŞ ÇAĞLAYAN", puan: 8 }, "262771": { name: "ULAŞ ADIGÜZEL", puan: 8 }, "262716": { name: "BİROL DEMİREL", puan: 7 }, "262733": { name: "MUHSİN ASİLKAN", puan: 7 }, "262790": { name: "CUMALİ SÖKER", puan: 7 }, "262816": { name: "SEDAT SEDAT", puan: 7 }, "262709": { name: "SALİH KARACAOĞLU", puan: 5 }, "262740": { name: "ABDULLAH DİK", puan: 4 }, "262753": { name: "YUSUF KIZILTUĞ", puan: 4 }, "262813": { name: "KEMAL ERSOY", puan: 4 }, "262718": { name: "BEKİR KARADAĞ", puan: 3 }, "262702": { name: "MURAT KARA", puan: 1 }, "262706": { name: "GAZİ AYAN 🏆🏆", puan: 1 }, "262707": { name: "HAKAN AYAN", puan: 1 }, "262714": { name: "İSMAİL EKER 🏆", puan: 1 }, "262715": { name: "ŞEMSETTİN DÜGER", puan: 1 }, "262721": { name: "MUSTAFA GÜMÜŞÇÜ", puan: 1 }, "262723": { name: "AYHAN LUŞOĞLU", puan: 1 }, "262744": { name: "İLYAS UYGUN", puan: 1 }, "262774": { name: "ŞENOL CAN ÇAKICI", puan: 1 }, "262782": { name: "YUSUF ERBAY", puan: 1 } };
const masterWeek2Data: Record<string, { name: string; puan: number }> = { "262756": { name: "EYÜP KARACAOĞLU 🏔️ (+3 PUAN HAFTANIN ZİRVE BONUSU)", puan: 19 }, "262709": { name: "SALİH KARACAOĞLU", puan: 13 }, "262755": { name: "DOĞAÇ ALKAN", puan: 13 }, "262772": { name: "CEMAL SİVRİKAYA 🏆", puan: 12 }, "262790": { name: "CUMALİ SÖKER", puan: 12 }, "262728": { name: "ÖNDER ASLAN", puan: 11 }, "262726": { name: "HUDAVER TOPARDIC", puan: 9 }, "262711": { name: "RIDVAN DOGER", puan: 8 }, "262717": { name: "MURAT ALİ", puan: 7 }, "262737": { name: "ŞAHİN GEZGİNCİ", puan: 7 }, "262705": { name: "AHMET BİRCAN 🏆", puan: 6 }, "262732": { name: "R. İLHAN KARACA 🏆🏆", puan: 6 }, "262774": { name: "ŞENOL CAN ÇAKICI", puan: 6 }, "262786": { name: "SEDAT DİŞLİ", puan: 6 }, "262816": { name: "SEDAT SEDAT", puan: 6 }, "262721": { name: "MUSTAFA GÜMÜŞÇÜ", puan: 5 }, "262738": { name: "MEVLÜT EVLER", puan: 5 }, "262714": { name: "İSMAİL EKER 🏆", puan: 4 }, "262702": { name: "MURAT KARA", puan: 2 }, "262703": { name: "CEMALETTİN BELLİ", puan: 2 }, "262715": { name: "ŞEMSETTİN DÜGER", puan: 2 }, "262730": { name: "ÖNDER IŞIK", puan: 2 }, "262736": { name: "MEHMET ALİ KARA", puan: 2 }, "262740": { name: "ABDULLAH DİK", puan: 2 }, "262749": { name: "B.VEYSELOĞLU EROL", puan: 2 }, "262763": { name: "MUSTAFA ELMAS", puan: 2 }, "262708": { name: "BAYRAM YILMAZ", puan: 1 }, "262716": { name: "BİROL DEMİREL", puan: 1 }, "262725": { name: "İLYAS KAZDAL", puan: 1 }, "262731": { name: "FATİH AYAN", puan: 1 }, "262739": { name: "UĞUR GÜRBÜZ", puan: 1 }, "262747": { name: "SAVAŞ ÇAĞLAYAN", puan: 1 }, "262754": { name: "OSMAN ALİ AYDIN 🏆", puan: 1 }, "262758": { name: "MELİH PINAR", puan: 1 }, "262771": { name: "ULAŞ ADIGÜZEL", puan: 1 } };
const masterWeek3Data: Record<string, { name: string; puan: number }> = { "262816": { name: "SEDAT SEDAT 🏔️ (+3 PUAN HAFTANIN PUAN LİDERİ) 🎯 (+3 PUAN HAFTANIN SKOR LİDERİ)", puan: 31 }, "262733": { name: "MUHSİN ASİLKAN", puan: 19 }, "262706": { name: "GAZİ AYAN 🏆🏆", puan: 11 }, "262707": { name: "HAKAN AYAN", puan: 11 }, "262721": { name: "MUSTAFA GÜMÜŞÇÜ", puan: 11 }, "262763": { name: "MUSTAFA ELMAS", puan: 11 }, "262771": { name: "ULAŞ ADIGÜZEL", puan: 11 }, "262734": { name: "LEVENT YILDIRIM", puan: 9 }, "262755": { name: "DOĞAÇ ALKAN", puan: 8 }, "262756": { name: "EYÜP KARACAOĞLU", puan: 8 }, "262813": { name: "KEMAL ERSOY", puan: 8 }, "262702": { name: "MURAT KARA", puan: 7 }, "262711": { name: "RIDVAN DOGER", puan: 7 }, "262754": { name: "OSMAN ALİ AYDIN 🏆", puan: 7 }, "262786": { name: "SEDAT DİŞLİ", puan: 7 }, "351925": { name: "ALİOS GÖZTEPE", puan: 7 }, "262725": { name: "İLYAS KAZDAL", puan: 6 }, "262726": { name: "HUDAVER TOPARDIC", puan: 6 }, "262728": { name: "ÖNDER ASLAN", puan: 6 }, "262736": { name: "MEHMET ALİ KARA", puan: 6 }, "262709": { name: "SALİH KARACAOĞLU", puan: 5 }, "262714": { name: "İSMAİL EKER 🏆", puan: 5 }, "262730": { name: "ÖNDER IŞIK", puan: 5 }, "262738": { name: "MEVLÜT EVLER", puan: 5 }, "262753": { name: "YUSUF KIZILTUĞ", puan: 5 }, "262705": { name: "AHMET BİRCAN 🏆", puan: 4 }, "262740": { name: "ABDULLAH DİK", puan: 4 }, "262774": { name: "ŞENOL CAN ÇAKICI", puan: 4 }, "262782": { name: "YUSUF ERBAY", puan: 4 }, "262723": { name: "AYHAN LUŞOĞLU", puan: 3 }, "262731": { name: "FATİH AYAN", puan: 2 }, "262732": { name: "R. İLHAN KARACA 🏆🏆", puan: 2 }, "262739": { name: "UĞUR GÜRBÜZ", puan: 2 }, "262747": { name: "SAVAŞ ÇAĞLAYAN", puan: 2 }, "262749": { name: "B.VEYSELOĞLU EROL", puan: 2 }, "262772": { name: "CEMAL SİVRİKAYA 🏆", puan: 2 }, "262716": { name: "BİROL DEMİREL", puan: 1 }, "262770": { name: "OZKAYA MAZAKALI BAYRAM", puan: 1 } };

// 🔴 EKREM: 4. Hafta tahmin havuzu. Sistem okumaları buradan yapacak.
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

export default function MasterPuanDurumuPage() {
  const [activeTab, setActiveTab] = useState<string>('total');
  const [isWeekMenuOpen, setIsWeekMenuOpen] = useState<boolean>(false);
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [adminStatus, setAdminStatus] = useState<string>('NOT_STARTED');
  
  const availableWeeks = [1, 2, 3, 4];

  // 🔴 EKREM: YENİ NESİL ÇELİK KASA VE SEYYAR KASA MOTORU
  const loadLeaderboard = async () => {
    try {
      // 1. Veritabanındaki tüm maçları çek
      const { data: dbMatches, error } = await supabase.from('live_matches').select('*');
      
      let w4Base: Record<string, number> = {}; // Kalıcı Puanlar (Çelik Kasa)
      let w4Live: Record<string, number> = {}; // Canlı Puanlar (Seyyar Kasa)
      let isAnyMatchLive = false;

      // Herkesi sıfırdan başlat
      Object.keys(allPlayersMasterList).forEach(id => {
        w4Base[id] = 0;
        w4Live[id] = 0;
      });

      // 2. Maçları tek tek analiz et
      if (dbMatches) {
        dbMatches.forEach(dbMatch => {
          if (dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-') {
            const matchIndex = dbMatch.id - 1; // 4. Hafta 1. Maç => index 0
            const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`;
            
            // Tahmini bilenleri bul
            const winnerIds = Object.keys(week4PredictionsData).filter(id => week4PredictionsData[id][matchIndex] === targetScore);
            
            // Puan hesapla
            let points = 1;
            if(winnerIds.length === 1) points = 12;
            else if(winnerIds.length === 2) points = 6;
            else if(winnerIds.length === 3) points = 5;
            else if(winnerIds.length === 4) points = 4;
            else if(winnerIds.length === 5) points = 3;
            else if(winnerIds.length === 6) points = 2;

            // Puanları dağıt
            winnerIds.forEach(wId => {
              if (dbMatch.status === 'FINISHED') {
                w4Base[wId] += points; // MAÇ BİTMİŞ, ÇELİK KASAYA AT! (Ebedi silinmez)
              } else if (dbMatch.status === 'LIVE' || dbMatch.status === 'HT') {
                w4Live[wId] += points; // MAÇ CANLI, SEYYAR KASAYA AT!
                isAnyMatchLive = true;
              }
            });
          }
        });
      }

      setAdminStatus(isAnyMatchLive ? 'LIVE' : 'NOT_STARTED');

      // 3. Tabloyu oluştur
      if (activeTab === 'total') {
        const baseList = Object.keys(allPlayersMasterList).map(id => {
          const w1 = masterWeek1Data[id]?.puan || 0;
          const w2 = masterWeek2Data[id]?.puan || 0;
          const w3 = masterWeek3Data[id]?.puan || 0;
          const w4B = w4Base[id] || 0; // Çelik kasadan gelen kalıcı 4. hafta puanı!
          
          const basePuan = w1 + w2 + w3 + w4B;
          const liveExtra = w4Live[id] || 0; // Seyyar kasadan gelen canlı puan!
          
          const finalName = allPlayersMasterList[id];

          return { id, name: finalName, basePuan, liveExtra, puan: basePuan + liveExtra };
        }).sort((a, b) => b.puan - a.puan || a.name.localeCompare(b.name, 'tr'));

        const prevRanks: Record<string, number> = {};
        const noLiveList = [...baseList].sort((a, b) => b.basePuan - a.basePuan || a.name.localeCompare(b.name, 'tr'));
        noLiveList.forEach((player, index) => { prevRanks[player.id] = index + 1; });

        const finalRows = baseList.map((player, index) => {
          const currentRank = index + 1;
          const prevRank = prevRanks[player.id];
          let trend = 'same';
          if (currentRank < prevRank) trend = 'up';
          else if (currentRank > prevRank) trend = 'down';
          return { ...player, currentRank, prevRank, trend };
        });

        setTableRows(finalRows);
      } else {
        // Hafta 4 Seçildiyse
        if(activeTab === 'week4') {
          const list = Object.keys(allPlayersMasterList).map(id => {
            const basePuan = w4Base[id] || 0; // Çelik kasa
            const liveExtra = w4Live[id] || 0; // Seyyar kasa
            return { id, name: allPlayersMasterList[id], puan: basePuan + liveExtra, liveExtra, trend: 'none' };
          });
          setTableRows(list.sort((a, b) => b.puan - a.puan || a.name.localeCompare(b.name, 'tr')));
        } else {
          // Hafta 1, 2, 3 seçildiyse eski sistem
          let dataMap = masterWeek1Data;
          if(activeTab === 'week2') dataMap = masterWeek2Data;
          if(activeTab === 'week3') dataMap = masterWeek3Data;

          const list = Object.keys(allPlayersMasterList).map(id => {
            const rawObj = dataMap[id];
            const basePuan = rawObj ? rawObj.puan : 0;
            return { id, name: rawObj ? rawObj.name : allPlayersMasterList[id], puan: basePuan, liveExtra: 0, trend: 'none' };
          });
          setTableRows(list.sort((a, b) => b.puan - a.puan || a.name.localeCompare(b.name, 'tr')));
        }
      }
    } catch (error) {
      console.log("Supabase verileri okunurken hata oluştu");
    }
  };

  useEffect(() => {
    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 5000); // Her 5 saniyede bir veritabanını tarar!
    return () => clearInterval(interval);
  }, [activeTab]);

  const selectTab = (tabKey: string) => {
    setActiveTab(tabKey);
    setIsWeekMenuOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className="text-xl md:text-2xl font-extrabold text-center text-amber-400 tracking-wider uppercase drop-shadow-md">
          ELİT TAHMİN MASTER LİGİ
        </h1>
      </div>

      <div className="w-full mb-6">
        <LiveMatchCard />
      </div>

      <div className="max-w-xl flex flex-col items-center mb-6 space-y-3 w-full">
        <button onClick={() => selectTab('total')} className={`px-8 py-2.5 rounded-xl font-black text-sm md:text-base transition-all duration-200 border w-full text-center shadow-md uppercase tracking-wider ${activeTab === 'total' ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20 scale-[1.02]' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'}`}>
          MASTER TOPLAM PUAN DURUMU
        </button>
        <div className="w-full relative">
          <button onClick={() => setIsWeekMenuOpen(!isWeekMenuOpen)} className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs md:text-sm border transition-all flex items-center justify-between shadow-md ${activeTab !== 'total' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'}`}>
            <span>📅 {activeTab === 'total' ? 'TOPLAM PUAN DURUMU' : `MASTER ${activeTab.replace('week', '')}. HAFTA PUAN DURUMU`}</span>
            <span className="text-xs transition-transform duration-200">{isWeekMenuOpen ? '▲ KAPAT' : '▼ HAFTALAR'}</span>
          </button>
          
          {isWeekMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-slate-900/95 border border-slate-700/80 p-3 rounded-2xl shadow-2xl backdrop-blur-md">
              <div className="flex flex-wrap justify-center gap-1.5 max-h-56 overflow-y-auto pr-1">
                {availableWeeks.map((weekNum) => {
                  const weekKey = `week${weekNum}`;
                  return (
                    <button 
                      key={weekNum} 
                      onClick={() => selectTab(weekKey)} 
                      className={`w-12 py-1.5 text-xs font-bold rounded-lg border transition-all text-center flex-shrink-0 ${activeTab === weekKey ? 'bg-amber-500 text-slate-950 border-amber-400 scale-105 shadow-sm' : 'bg-slate-950/90 text-slate-300 border-slate-800 hover:bg-amber-500/20 hover:text-amber-300'}`}
                    >
                      {weekNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {tableRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-xs border-b border-slate-800">
                <tr><th className="px-6 py-3.5 w-20 text-center">SIRA</th><th className="px-6 py-3.5">YARIŞMACI</th><th className="px-6 py-3.5 text-right">{activeTab === 'total' ? 'TOPLAM PUAN' : 'HAFTALIK PUAN'}</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tableRows.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-slate-300 font-medium text-sm">{row.currentRank || idx + 1}</span>
                        {activeTab === 'total' && row.trend === 'up' && <span className="text-emerald-400 text-sm animate-bounce">▲</span>}
                        {activeTab === 'total' && row.trend === 'down' && <span className="text-red-500 text-sm">▼</span>}
                        {activeTab === 'total' && row.trend === 'same' && <span className="text-slate-600 text-[10px]">▶</span>}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-200 font-semibold">{row.name}</span>
                        
                        {row.liveExtra > 0 && activeTab === 'total' && adminStatus === 'LIVE' && (
                          <span className="bg-emerald-950/80 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse">
                            +{row.liveExtra} CANLI
                          </span>
                        )}

                        {row.liveExtra > 0 && activeTab !== 'total' && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border shadow-sm ${adminStatus === 'LIVE' ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse' : 'bg-cyan-950/80 text-cyan-400 border-cyan-500/50'}`}>
                            +{row.liveExtra} {adminStatus === 'LIVE' ? 'CANLI' : '(MAÇ)'}
                          </span>
                        )}

                      </div>
                    </td>
                    <td className={`px-6 py-3.5 text-right font-bold text-base ${row.liveExtra > 0 && activeTab !== 'total' ? "text-emerald-400" : "text-amber-400"}`}>
                      {row.puan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 font-medium text-xs sm:text-sm">⏳ Veriler bulunamadı.</div>
        )}
      </div>
    </div>
  );
}