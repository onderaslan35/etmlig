'use client';

import React, { useState } from 'react';

// YARIŞMACI ID - İSİM EŞLEŞTİRME HARİTASI
const userNamesMap: { [id: string]: string } = {
  "262711": "RIDVAN DOGER",
  "262734": "LEVENT YILDIRIM",
  "262721": "MUSTAFA GÜMÜŞÇÜ",
  "262758": "MELİH PINAR",
  "262716": "BİROL DEMİREL",
  "262733": "MUHSİN ASİLKAN",
  "262744": "İLYAS UYGUN",
  "262763": "MUSTAFA ELMAS",
  "262813": "KEMAL ERSOY",
  "262816": "SEDAT SEDAT",
  "262718": "BEKİR KARADAĞ",
  "262731": "FATİH AYAN",
  "262755": "DOĞAÇ ALKAN",
  "262749": "B.VEYSELOĞLU EROL",
  "262726": "HUDAVER TOPARDIC",
  "262736": "MEHMET ALİ KARA",
  "262707": "HAKAN AYAN",
  "262771": "ULAŞ ADIGÜZEL",
  "262725": "İLYAS KAZDAL",
  "262702": "MURAT KARA",
  "351925": "ALİOS GÖZTEPE",
  "262728": "ÖNDER ASLAN",
  "262738": "MEVLÜT EVLER",
  "262730": "ÖNDER IŞIK",
  "262719": "UĞUR VARDAR",
  "262772": "CEMAL SİVRİKAYA 🏆",
  "262774": "ŞENOL CAN ÇAKICI",
  "262723": "AYHAN LUŞOĞLU",
  "262706": "GAZİ AYAN 🏆🏆",
  "262740": "ABDULLAH DİK",
  "262756": "EYÜP KARACAOĞLU",
  "262790": "CUMALİ SÖKER",
  "262786": "SEDAT DİŞLİ",
  "262705": "AHMET BİRCAN 🏆",
  "262753": "YUSUF KIZILTUĞ",
  "262750": "MAHMUT CBR",
  "262770": "OZKAYA MAZAKALI BAYRAM",
  "262754": "OSMAN ALİ AYDIN 🏆",
  "262747": "SAVAŞ ÇAĞLAYAN",
  "262714": "İSMAİL EKER 🏆",
  "262717": "MURAT ALİ",
  "262703": "CEMALETTİN BELLİ",
  "262732": "R. İLHAN KARACA 🏆🏆",
  "262709": "SALİH KARACAOĞLU",
  "262782": "YUSUF ERBAY",
  "262708": "BAYRAM YILMAZ",
  "262739": "UĞUR GÜRBÜZ"
};

// 3. HAFTA 24 MAÇ GERÇEK FİKSTÜR
const week3Matches = [
  { id: 1, home: "OLIMPIYAKOS", away: "NEC NIJMEGEN", type: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ - 4 Ağustos | 21:00" },
  { id: 2, home: "SPARTA PRAG", away: "OLIMPIC LYON", type: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ - 4 Ağustos | 21:00" },
  { id: 3, home: "USG", away: "BODO-GLIMT", type: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ - 4 Ağustos | 21:00" },
  { id: 4, home: "FENERBAHÇE", away: "STURM GRAZ", type: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ - 5 Ağustos | 21:00" },
  { id: 5, home: "PANATHINAIKOS", away: "CSKA 1948", type: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ - 5 Ağustos | 21:30" },
  { id: 6, home: "PAIDE LINNAMEESKOND", away: "RAPID WIEN", type: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ - 6 Ağustos | 19:00" },
  { id: 7, home: "HRADEC KRALOVE", away: "BEŞİKTAŞ", type: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ - 6 Ağustos | 20:00" },
  { id: 8, home: "DEBRECEN", away: "KOPENAG", type: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ - 6 Ağustos | 20:00" },
  { id: 9, home: "DINAMO KIEV", away: "KARABAĞ FK", type: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ - 6 Ağustos | 20:00" },
  { id: 10, home: "GOTEBORG", away: "GENT", type: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ - 6 Ağustos | 20:00" },
  { id: 11, home: "PAOK", away: "ANDERLECHT", type: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ - 6 Ağustos | 20:45" },
  { id: 12, home: "AJAX", away: "SHELBOURNE", type: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ - 6 Ağustos | 21:00" },
  { id: 13, home: "BRAGA", away: "DINAMO MINSK", type: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ - 6 Ağustos | 21:30" },
  { id: 14, home: "BENFICA", away: "HEART", type: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ - 6 Ağustos | 22:00" },
  { id: 15, home: "BOLUSPOR", away: "MANİSA FK", type: "TÜRKİYE 1.LİG - 7 Ağustos | 21:30" },
  { id: 16, home: "BANDIRMASPOR", away: "İSTANBULSPOR", type: "TÜRKİYE 1.LİG - 8 Ağustos | 17:00" },
  { id: 17, home: "SİVASSPOR", away: "EROKSPOR", type: "TÜRKİYE 1.LİG - 8 Ağustos | 19:00" },
  { id: 18, home: "ÜMRANİYE SPOR", away: "MARDİN 1969", type: "TÜRKİYE 1.LİG - 8 Ağustos | 19:00" },
  { id: 19, home: "ANTALYASPOR", away: "KEÇİÖRENGÜCÜ", type: "TÜRKİYE 1.LİG - 8 Ağustos | 21:30" },
  { id: 20, home: "IĞDIR FK", away: "FATİH KARAGÜMRÜK", type: "TÜRKİYE 1.LİG - 9 Ağustos | 19:00" },
  { id: 21, home: "SARIYER", away: "MUĞLASPOR", type: "TÜRKİYE 1.LİG - 9 Ağustos | 19:00" },
  { id: 22, home: "BODRUMSPOR", away: "BURSASPOR", type: "TÜRKİYE 1.LİG - 9 Ağustos | 21:30" },
  { id: 23, home: "VANSPOR FK", away: "KAYSERİSPOR", type: "TÜRKİYE 1.LİG - 9 Ağustos | 21:30" },
  { id: 24, home: "PENDİKSPOR", away: "BATMAN PETROL SPOR", type: "TÜRKİYE 1.LİG - 10 Ağustos | 21:30" }
];

// GÖNDERDİĞİN TAHMİN MATRİSİ
const rawPredictionsData = [
  { id: "262711", preds: ["2 − 0","1 − 2","1 − 1","1 − 0","1 − 1","0 − 3","0 − 4","0 − 1","1 − 1","0 − 0","0 − 1","5 − 0","2 − 0","3 − 1","0 − 0","1 − 0","1 − 2","2 − 2","2 − 0","1 − 1","0 − 0","1 − 2","0 − 0","1 − 1"] },
  { id: "262734", preds: ["2 − 1","1 − 3","0 − 2","0 − 2","4 − 1","0 − 4","1 − 2","0 − 3","1 − 3","1 − 4","2 − 1","4 − 1","3 − 1","4 − 0","1 − 2","2 − 1","1 − 2","3 − 2","3 − 1","1 − 2","1 − 2","1 − 2","3 − 1","1 − 2"] },
  { id: "262721", preds: ["2 − 0","1 − 3","0 − 3","2 − 0","3 − 0","0 − 4","0 − 3","0 − 2","2 − 2","0 − 2","0 − 1","2 − 0","3 − 0","3 − 0","0 − 2","0 − 1","2 − 1","0 − 3","3 − 1","0 − 1","1 − 1","0 − 2","0 − 1","1 − 1"] },
  { id: "262758", preds: ["2 − 1","0 − 2","3 − 1","1 − 2","3 − 0","0 − 2","0 − 2","1 − 1","1 − 1","1 − 3","3 − 0","4 − 0","2 − 0","4 − 1","1 − 1","1 − 1","1 − 1","1 − 1","3 − 0","1 − 1","2 − 1","1 − 1","0 − 1","0 − 1"] },
  { id: "262716", preds: ["3 − 1","1 − 2","0 − 2","1 − 1","2 − 0","1 − 2","0 − 1","1 − 3","1 − 1","0 − 3","3 − 0","3 − 0","2 − 0","3 − 0","1 − 1","1 − 1","2 − 1","2 − 0","2 − 1","1 − 2","1 − 1","3 − 1","0 − 3","2 − 0"] },
  { id: "262733", preds: ["3 − 1","1 − 2","4 − 2","3 − 2","3 − 1","1 − 2","1 − 1","0 − 1","1 − 0","1 − 1","1 − 1","4 − 1","2 − 0","4 − 1","4 − 1","1 − 2","1 − 0","0 − 0","0 − 0","1 − 1","2 − 0","1 − 3","2 − 1","2 − 1"] },
  { id: "262744", preds: ["2 − 1","1 − 2","0 − 3","1 − 2","3 − 0","0 − 4","0 − 2","0 − 2","1 − 1","1 − 2","1 − 3","3 − 0","3 − 0","3 − 1","1 − 1","2 − 0","2 − 1","3 − 0","2 − 1","0 − 2","1 − 0","1 − 2","1 − 1","2 − 0"] },
  { id: "262763", preds: ["2 − 0","2 − 1","1 − 1","3 − 1","1 − 1","1 − 1","1 − 2","1 − 1","1 − 1","2 − 1","1 − 1","3 − 0","2 − 1","4 − 0","2 − 0","2 − 0","2 − 0","2 − 0","2 − 0","2 − 0","1 − 1","1 − 1","1 − 0","1 − 1"] },
  { id: "262813", preds: ["1 − 1","1 − 2","1 − 0","2 − 0","3 − 1","1 − 2","1 − 0","0 − 2","0 − 0","0 − 2","1 − 2","2 − 0","3 − 1","4 − 0","1 − 1","0 − 2","1 − 2","3 − 0","1 − 1","0 − 2","2 − 0","1 − 1","1 − 3","3 − 0"] },
  { id: "262816", preds: ["3 − 0","1 − 2","0 − 2","0 − 2","2 − 1","0 − 2","0 − 3","0 − 3","3 − 0","0 − 2","0 − 2","3 − 0","1 − 0","3 − 0","0 − 3","2 − 0","4 − 0","0 − 0","1 − 1","0 − 4","2 − 0","0 − 4","0 − 2","2 − 1"] },
  { id: "262718", preds: ["3 − 1","1 − 3","2 − 2","2 − 1","1 − 0","1 − 2","1 − 2","0 − 2","1 − 2","4 − 2","1 − 1","3 − 2","2 − 0","3 − 0","2 − 1","3 − 2","1 − 2","2 − 0","1 − 1","2 − 2","1 − 0","2 − 2","1 − 2","3 − 0"] },
  { id: "262731", preds: ["2 − 0","1 − 2","1 − 1","1 − 0","1 − 1","1 − 2","1 − 2","1 − 1","1 − 1","1 − 1","1 − 1","2 − 1","2 − 0","2 − 0","1 − 1","1 − 0","1 − 2","1 − 1","1 − 1","1 − 1","2 − 1","1 − 1","1 − 1","2 − 1"] },
  { id: "262755", preds: ["2 − 2","1 − 3","4 − 3","2 − 1","1 − 1","0 − 2","1 − 4","1 − 3","2 − 3","1 − 1","2 − 1","2 − 1","2 − 2","3 − 0","1 − 3","1 − 0","4 − 2","0 − 1","0 − 1","1 − 0","1 − 0","1 − 2","0 − 1","2 − 2"] },
  { id: "262749", preds: ["2 − 0","1 − 2","1 − 1","2 − 1","2 − 0","0 − 2","1 − 3","1 − 3","1 − 1","1 − 2","2 − 1","4 − 0","3 − 0","3 − 0","1 − 1","2 − 1","2 − 0","1 − 0","2 − 1","1 − 2","2 − 2","1 − 1","0 − 2","2 − 0"] },
  { id: "262726", preds: ["1 − 1","1 − 3","2 − 0","1 − 0","2 − 0","1 − 1","0 − 1","0 − 0","0 − 1","0 − 1","1 − 1","3 − 0","1 − 1","3 − 2","4 − 1","2 − 1","3 − 1","1 − 1","2 − 0","1 − 0","4 − 0","0 − 1","0 − 0","3 − 1"] },
  { id: "262736", preds: ["3 − 1","2 − 2","3 − 2","3 − 2","2 − 0","1 − 3","1 − 2","1 − 3","3 − 0","2 − 1","2 − 3","4 − 1","2 − 2","4 − 1","2 − 1","1 − 2","1 − 3","2 − 1","1 − 1","1 − 3","3 − 0","1 − 3","1 − 1","2 − 2"] },
  { id: "262707", preds: ["1 − 0","0 − 2","0 − 0","2 − 0","0 − 0","0 − 2","0 − 0","0 − 2","0 − 0","0 − 0","0 − 2","3 − 0","3 − 0","3 − 0","0 − 0","0 − 0","0 − 0","0 − 0","0 − 0","0 − 0","0 − 0","0 − 0","0 − 0","1 − 0"] },
  { id: "262771", preds: ["2 − 1","2 − 2","3 − 2","2 − 1","3 − 1","1 − 4","0 − 2","2 − 2","2 − 2","1 − 2","2 − 2","4 − 1","3 − 1","4 − 1","1 − 2","1 − 1","2 − 2","1 − 2","3 − 1","1 − 2","1 − 2","1 − 3","1 − 1","1 − 2"] },
  { id: "262725", preds: ["2 − 0","1 − 1","0 − 1","2 − 0","2 − 0","1 − 3","0 − 2","0 − 2","2 − 0","0 − 0","0 − 1","3 − 1","2 − 1","2 − 0","1 − 1","0 − 2","1 − 0","2 − 0","2 − 0","0 − 2","0 − 0","1 − 2","0 − 1","2 − 0"] },
  { id: "262702", preds: ["4 − 0","0 − 2","0 − 1","1 − 0","3 − 0","0 − 2","0 − 3","0 − 1","1 − 2","1 − 0","1 − 1","2 − 0","3 − 0","4 − 0","0 − 2","1 − 0","0 − 2","1 − 0","1 − 0","2 − 1","1 − 0","0 − 2","0 − 2","1 − 1"] },
  { id: "351925", preds: ["3 − 0","2 − 1","0 − 1","2 − 0","2 − 0","0 − 2","0 − 2","0 − 2","3 − 0","2 − 1","0 − 0","1 − 0","2 − 0","2 − 0","0 − 0","0 − 0","2 − 0","1 − 0","2 − 1","0 − 0","0 − 0","0 − 2","0 − 0","0 − 0"] },
  { id: "262728", preds: ["2 − 1","0 − 0","0 − 1","0 − 1","1 − 2","0 − 5","0 − 2","0 − 1","0 − 0","1 − 1","1 − 0","1 − 3","3 − 0","1 − 2","1 − 2","2 − 1","2 − 0","2 − 0","2 − 2","1 − 0","1 − 3","0 − 2","0 − 1","0 − 1"] },
  { id: "262738", preds: ["2 − 2","2 − 1","1 − 2","2 − 1","2 − 2","2 − 2","1 − 2","2 − 2","1 − 1","1 − 1","2 − 1","3 − 1","2 − 1","2 − 2","1 − 1","1 − 1","1 − 1","1 − 1","1 − 1","1 − 1","1 − 1","1 − 2","1 − 2","1 − 1"] },
  { id: "262730", preds: ["0 − 2","0 − 2","0 − 2","2 − 1","1 − 0","0 − 1","0 − 2","0 − 3","1 − 1","1 − 1","2 − 1","2 − 1","2 − 0","2 − 0","0 − 3","1 − 1","1 − 2","1 − 0","2 − 2","2 − 1","1 − 0","0 − 2","1 − 3","2 − 0"] },
  { id: "262719", preds: ["2 − 1","1 − 1","1 − 2","1 − 2","2 − 1","1 − 3","1 − 2","1 − 1","2 − 1","0 − 0","2 − 1","5 − 0","3 − 0","4 − 0","2 − 3","2 − 1","1 − 1","1 − 1","3 − 1","1 − 1","1 − 2","1 − 1","1 − 1","1 − 1"] },
  { id: "262772", preds: ["2 − 0","1 − 2","1 − 3","2 − 0","2 − 1","0 − 2","1 − 2","1 − 2","1 − 1","1 − 1","2 − 1","4 − 0","2 − 0","3 − 0","1 − 1","1 − 1","1 − 0","1 − 1","2 − 1","0 − 1","0 − 0","0 − 2","1 − 1","2 − 0"] },
  { id: "262774", preds: ["2 − 0","1 − 2","0 − 2","1 − 1","2 − 0","0 − 1","0 − 2","1 − 2","2 − 2","1 − 0","1 − 1","3 − 1","2 − 0","4 − 0","1 − 0","1 − 1","1 − 1","2 − 0","3 − 1","2 − 0","1 − 0","2 − 2","1 − 2","3 − 0"] },
  { id: "262723", preds: ["2 − 1","2 − 2","1 − 2","2 − 0","2 − 0","1 − 3","0 − 2","0 − 2","1 − 1","1 − 1","3 − 2","3 − 0","2 − 0","3 − 1","2 − 1","2 − 0","2 − 2","1 − 0","2 − 0","0 − 2","3 − 0","1 − 2","0 − 2","1 − 0"] },
  { id: "262706", preds: ["1 − 0","0 − 2","0 − 0","1 − 0","3 − 1","0 − 2","0 − 3","0 − 1","0 − 0","0 − 1","0 − 0","4 − 0","4 − 1","5 − 0","0 − 0","1 − 0","0 − 0","1 − 0","0 − 1","0 − 0","0 − 1","0 − 1","0 − 0","3 − 0"] },
  { id: "262740", preds: ["2 − 1","2 − 2","2 − 2","3 − 2","3 − 0","1 − 2","1 − 2","1 − 3","2 − 2","1 − 1","1 − 2","3 − 1","2 − 1","2 − 2","2 − 2","1 − 1","2 − 1","2 − 0","3 − 0","2 − 0","3 − 1","1 − 3","2 − 1","3 − 1"] },
  { id: "262756", preds: ["1 − 2","1 − 2","1 − 2","3 − 0","1 − 0","2 − 2","1 − 1","2 − 1","2 − 1","1 − 2","0 − 2","2 − 0","2 − 2","4 − 0","2 − 0","1 − 1","1 − 1","1 − 1","1 − 2","2 − 0","2 − 2","2 − 2","2 − 0","1 − 1"] },
  { id: "262790", preds: ["3 − 1","0 − 2","0 − 3","0 − 2","2 − 1","0 − 3","1 − 3","1 − 3","2 − 1","2 − 1","0 − 2","3 − 0","3 − 1","3 − 1","0 − 2","0 − 2","0 − 2","0 − 2","0 − 1","0 − 2","0 − 0","0 − 3","0 − 0","1 − 2"] },
  { id: "262786", preds: ["2 − 1","1 − 3","1 − 1","2 − 0","4 − 1","1 − 4","0 − 4","1 − 3","1 − 2","1 − 1","1 − 1","3 − 1","3 − 2","3 − 0","3 − 1","1 − 1","2 − 1","1 − 1","1 − 1","1 − 3","1 − 1","1 − 3","3 − 1","2 − 1"] },
  { id: "262705", preds: ["3 − 1","0 − 2","1 − 2","3 − 0","3 − 0","0 − 1","1 − 1","0 − 2","1 − 1","2 − 1","2 − 0","3 − 0","4 − 1","5 − 1","0 − 2","0 − 0","1 − 1","2 − 0","2 − 1","2 − 1","2 − 0","0 − 2","0 − 1","3 − 1"] },
  { id: "262753", preds: ["2 − 1","1 − 2","1 − 1","3 − 1","3 − 0","1 − 1","0 − 2","0 − 1","1 − 1","0 − 1","2 − 2","6 − 0","4 − 1","3 − 0","2 − 2","1 − 1","1 − 2","3 − 1","1 − 2","2 − 2","2 − 3","1 − 2","1 − 1","1 − 2"] },
  { id: "262750", preds: ["3 − 1","1 − 2","0 − 2","2 − 1","2 − 0","0 − 3","0 − 2","0 − 1","2 − 2","1 − 0","1 − 3","4 − 1","3 − 1","4 − 1","2 − 1","3 − 1","2 − 0","1 − 1","2 − 0","0 − 0","1 − 1","2 − 3","1 − 2","1 − 1"] },
  { id: "262770", preds: ["3 − 1","1 − 2","1 − 1","4 − 0","3 − 0","1 − 0","1 − 2","0 − 2","2 − 0","0 − 2","0 − 0","3 − 0","3 − 0","3 − 0","2 − 2","1 − 2","1 − 2","0 − 2","2 − 0","2 − 1","3 − 1","0 − 2","1 − 2","1 − 1"] },
  { id: "262754", preds: ["2 − 0","0 − 1","0 − 1","1 − 0","1 − 0","0 − 1","0 − 1","0 − 2","0 − 1","1 − 0","1 − 0","3 − 0","2 − 0","3 − 0","0 − 2","1 − 0","0 − 1","0 − 1","1 − 0","0 − 2","2 − 0","0 − 2","0 − 2","2 − 0"] },
  { id: "262747", preds: ["1 − 1","1 − 1","1 − 1","1 − 1","1 − 1","1 − 1","1 − 1","1 − 1","1 − 1","1 − 1","1 − 1","1 − 1","1 − 1","1 − 1","1 − 1","1 − 1","1 − 1","1 − 1","1 − 1","1 − 1","1 − 1","1 − 1","1 − 1","1 − 1"] },
  { id: "262714", preds: ["1 − 1","1 − 1","1 − 0","1 − 0","0 − 0","0 − 3","0 − 1","0 − 2","0 − 0","1 − 1","1 − 0","1 − 0","2 − 0","1 − 1","2 − 1","1 − 1","0 − 2","0 − 0","0 − 1","0 − 0","1 − 1","0 − 0","1 − 0","1 − 1"] },
  { id: "262717", preds: ["2 − 1","1 − 0","3 − 2","1 − 1","1 − 2","0 − 0","1 − 2","1 − 0","1 − 1","2 − 2","1 − 2","1 − 1","0 − 1","3 − 1","1 − 1","1 − 0","1 − 3","1 − 0","1 − 0","2 − 3","2 − 1","3 − 1","1 − 2","1 − 0"] },
  { id: "262703", preds: ["1 − 1","0 − 1","1 − 1","2 − 1","1 − 0","0 − 2","1 − 2","1 − 1","1 − 1","0 − 0","1 − 0","3 − 0","2 − 0","1 − 0","0 − 0","1 − 1","1 − 0","1 − 0","2 − 0","0 − 0","1 − 1","0 − 1","0 − 1","1 − 0"] },
  { id: "262732", preds: ["2 − 1","0 − 2","0 − 2","3 − 1","1 − 1","0 − 2","1 − 1","1 − 1","0 − 1","1 − 1","0 − 2","3 − 0","2 − 1","2 − 0","3 − 0","1 − 0","0 − 2","2 − 0","3 − 0","0 − 2","1 − 1","1 − 1","2 − 0","2 − 0"] },
  { id: "262709", preds: ["3 − 1","1 − 2","2 − 1","3 − 1","4 − 0","0 − 4","0 − 1","0 − 3","1 − 1","2 − 2","2 − 2","5 − 0","4 − 0","2 − 0","2 − 0","1 − 1","2 − 2","1 − 0","1 − 1","2 − 2","1 − 1","1 − 3","0 − 0","3 − 1"] },
  { id: "262782", preds: ["1 − 0","2 − 0","0 − 2","1 − 0","1 − 0","0 − 0","0 − 1","0 − 2","1 − 1","2 − 0","0 − 2","0 − 3","0 − 2","0 − 0","2 − 0","0 − 1","1 − 0","1 − 2","1 − 0","1 − 1","1 − 0","0 − 2","0 − 2","2 − 0"] },
  { id: "262708", preds: ["2 − 1","1 − 2","0 − 2","2 − 1","3 − 1","0 − 2","0 − 3","0 − 2","2 − 1","2 − 1","0 − 2","3 − 0","2 − 0","3 − 0","0 − 2","2 − 1","2 − 1","2 − 0","3 − 1","2 − 1","1 − 0","1 − 3","1 − 0","4 − 0"] },
  { id: "262739", preds: ["2 − 0","0 − 0","0 − 3","2 − 1","3 − 1","0 − 1","0 − 1","1 − 3","2 − 0","2 − 0","0 − 0","4 − 0","4 − 1","5 − 1","2 − 0","0 − 1","2 − 0","3 − 1","4 − 0","1 − 1","0 − 0","0 − 2","0 − 1","1 − 0"] }
];

export default function TahminmatikPage() {
  const [scores, setScores] = useState<{ [matchId: number]: { home: string; away: string } }>({});

  const scoreOptions = ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  const handleSelectChange = (matchId: number, team: 'home' | 'away', val: string) => {
    const finalVal = val === "-" ? "" : val;
    setScores((prev) => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] || { home: "", away: "" }),
        [team]: finalVal
      }
    }));
  };

  const getWinnersForMatch = (matchId: number) => {
    const current = scores[matchId];
    if (!current || current.home === "" || current.away === "") return null;

    const targetHome = current.home;
    const targetAway = current.away;

    const winners = rawPredictionsData.filter((user) => {
      if (!user || !user.preds) return false;
      const pred = user.preds[matchId - 1];
      if (!pred || typeof pred !== 'string') return false;

      const cleanPred = pred.replace(/\s+/g, '').replace('−', '-');
      const parts = cleanPred.split('-');
      
      if (parts.length !== 2) return false;
      return parts[0] === targetHome && parts[1] === targetAway;
    });

    return winners.map(w => ({
      id: w.id,
      name: userNamesMap[w.id] || `Yarışmacı (${w.id})`
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* ÜST BAŞLIK */}
        <div className="bg-slate-900 border border-emerald-500/30 p-5 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.15)] flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-black text-emerald-400 tracking-wider uppercase flex items-center justify-center md:justify-start gap-2 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
              ⚡ TAHMİNMATİK (3. HAFTA)
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Açılır kutudan skoru seçin, 24 maçta tam skoru tutturan yarışmacıları anında görün!
            </p>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 px-3.5 py-1.5 rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            CANLI SİMÜLASYON
          </span>
        </div>

        {/* 24 GERÇEK MAÇLIK IZGARA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {week3Matches.map((match) => {
            const currentHome = scores[match.id]?.home || "";
            const currentAway = scores[match.id]?.away || "";
            const winners = getWinnersForMatch(match.id);
            const hasSelection = currentHome !== "" && currentAway !== "";

            return (
              <div
                key={match.id}
                className={`bg-slate-900/90 border rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-3 transition-all duration-300 ${
                  hasSelection && winners && winners.length > 0
                    ? 'border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* MAÇ BAŞLIĞI VE LİG BİLGİSİ */}
                <div className="space-y-1 border-b border-slate-800/80 pb-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      📌 3. HAFTA - {match.id}. MAÇ
                    </span>
                    <span className="text-slate-500 text-[10px]">SKOR SEÇ</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium truncate">
                    {match.type}
                  </div>
                </div>

                {/* TAKIM İSİMLERİ SKOR KUTULARINA SIKIŞTIRILDI (EV SAHİBİ SAĞA, MİSAFİR SOLA YANAŞTI) */}
                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800/80 gap-2">
                  {/* EV SAHİBİ: SAĞA YANAŞIK (SKOR KUTUSUNUN HİZASINDA) */}
                  <div className="flex-1 text-right">
                    <span className="font-extrabold text-xs text-slate-100 uppercase block truncate">
                      {match.home}
                    </span>
                  </div>

                  {/* ORTADAKİ SKOR SEÇİM KUTUCUKLARI */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={currentHome === "" ? "-" : currentHome}
                      onChange={(e) => handleSelectChange(match.id, 'home', e.target.value)}
                      className="w-11 h-10 bg-slate-900 border border-emerald-500/50 text-emerald-400 font-black text-center text-base rounded-lg outline-none cursor-pointer focus:ring-2 focus:ring-emerald-400 appearance-none px-2 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                    >
                      {scoreOptions.map(opt => (
                        <option key={opt} value={opt} className="bg-slate-950 text-emerald-400 font-bold">
                          {opt}
                        </option>
                      ))}
                    </select>

                    <span className="text-slate-600 font-black">-</span>

                    <select
                      value={currentAway === "" ? "-" : currentAway}
                      onChange={(e) => handleSelectChange(match.id, 'away', e.target.value)}
                      className="w-11 h-10 bg-slate-900 border border-emerald-500/50 text-emerald-400 font-black text-center text-base rounded-lg outline-none cursor-pointer focus:ring-2 focus:ring-emerald-400 appearance-none px-2 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                    >
                      {scoreOptions.map(opt => (
                        <option key={opt} value={opt} className="bg-slate-950 text-emerald-400 font-bold">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* MİSAFİR TAKIM: SOLA YANAŞIK (SKOR KUTUSUNUN HİZASINDA) */}
                  <div className="flex-1 text-left">
                    <span className="font-extrabold text-xs text-slate-100 uppercase block truncate">
                      {match.away}
                    </span>
                  </div>
                </div>

                {/* SONUÇ / BİLEN YARIŞMACILAR ALANI */}
                <div className="min-h-[50px] flex flex-col justify-center bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  {winners === null ? (
                    <span className="text-[11px] text-slate-500 italic text-center">
                      Skorları seçtiğinizde bilenler burada listelenir...
                    </span>
                  ) : winners.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold border-b border-slate-800/80 pb-1.5">
                        <span className="text-emerald-400 flex items-center gap-1 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                          🎯 Tam Skoru Bilenler ({winners.length} Kişi)
                        </span>
                        <span className="text-[10px] text-emerald-300 bg-emerald-950 border border-emerald-500/40 px-2 py-0.5 rounded font-black shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                          {winners.length === 1 ? '12 Puan' : `${Math.floor(12 / winners.length)} Puan`}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {winners.map((winner) => (
                          <span
                            key={winner.id}
                            className="bg-slate-900 text-emerald-200 border border-emerald-500/40 text-[10px] sm:text-[11px] px-2.5 py-1 rounded-md font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                          >
                            {winner.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-rose-400/90 font-semibold text-center">
                      ❌ Bu skoru doğru tahmin eden yarışmacı yok.
                    </span>
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