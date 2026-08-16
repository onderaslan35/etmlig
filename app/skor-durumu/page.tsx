'use client';

import React, { useState, useEffect } from 'react';
import LiveMatchCard from '@/components/LiveMatchCard';
import { supabase } from '@/utils/supabase';

// 🏆 Sabit Oyuncu Listesi (Master'dan Birebir Alındı)
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
  "262723": "AYHAN LUŞOĞLU", "262701": "MUHAMMET OKUMUŞ", "262710": "MUZAFFER ERTUĞRUL", "262713": "VAHİT KÜLCÜ",
  "262720": "HASAN ASLAN", "262722": "MUSTAFA ERKAN", "262724": "YÜCEL TOMAK", "262727": "YAHŞİ ERKAN🏆",
  "262729": "HAKAN GÜN", "262735": "AYGÜN AKKEÇELİ", "262741": "SABAHATTİN ÇAYLAK", "262742": "ZEKERiYYA TOPKAYYA",
  "262743": "MEHMET ALİ ŞAHİN", "262745": "OĞUZ YILDIRIMKAYA", "262746": "MEHMET BAYIR", "262748": "YASİN ŞAHİN",
  "262751": "HÜSEYİN ERBAŞ", "262810": "ADEM BULUT ERTÜRK", "262762": "İLHAN DANIŞ", "262760": "UĞUR NES",
  "262776": "CUMA OKUR", "262777": "MİRAÇ TOPAL", "262778": "CENGİZ SAYAN", "262780": "YUSUF KILIÇ",
  "262781": "KADİR SOLMAZ", "262783": "YASİN AYAN", "262784": "MEHMET AVCI", "262785": "METE BÜYÜKGÖL 🏆",
  "262788": "HAKAN ÇİFTÇİ", "262789": "ALİ ABUKAN", "350909": "DİNÇER ÖZER", "262815": "MURAT KAYA",
  "262795": "SEFA İÇA", "262796": "D. SERGEN TAŞYÜREK", "262797": "ÖMER DOGER"
};

// 🔴 Sabit 4. Hafta Maçları (Tam İsabet Kıyaslaması İçin)
const week4Matches = [
  { id: 1, category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR RÖVANŞ MAÇI", home: "STURM GRAZ", away: "FENERBAHÇE" },
  { id: 2, category: "UEFA SÜPER KUPA", home: "PARIS SG", away: "ASTON VILLA" },
  { id: 3, category: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR RÖVANŞ", home: "KARABAĞ FK", away: "DINAMO KIEV" },
  { id: 4, category: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR RÖVANŞ", home: "BEŞİKTAŞ", away: "HRADEC KRALOVE" },
  { id: 5, category: "TÜRKİYE SÜPER LİG", home: "GALATASARAY", away: "ÇORUM FK" },
  { id: 6, category: "TÜRKİYE 1.LİG", home: "EROKSPOR", away: "SARIYER" },
  { id: 7, category: "TÜRKİYE SÜPER LİG", home: "KASIMPAŞA", away: "TRABZONSPOR" },
  { id: 8, category: "TÜRKİYE SÜPER LİG", home: "KONYASPOR", away: "ÇAYKUR RİZE" },
  { id: 9, category: "TÜRKİYE 1.LİG", home: "FATİH KARAGÜMRÜK", away: "ÜMRANİYESPOR" },
  { id: 10, category: "TÜRKİYE 1.LİG", home: "İSTANBULSPOR", away: "BODRUMSPOR" },
  { id: 11, category: "TÜRKİYE SÜPER LİG", home: "GAZİANTEP FK", away: "ALANYASPOR" },
  { id: 12, category: "TÜRKİYE SÜPER LİG", home: "GENÇLERBİRLİĞİ", away: "FENERBAHÇE" },
  { id: 13, category: "TÜRKİYE 1.LİG", home: "BURSASPOR", away: "IĞDIR FK" },
  { id: 14, category: "TÜRKİYE 1.LİG", home: "MANİSA FK", away: "VANSPOR FK" },
  { id: 15, category: "İNGİLTERE SÜPER KUPA", home: "ARSENAL", away: "MANCHESTER CITY" },
  { id: 16, category: "TÜRKİYE SÜPER LİG", home: "BAŞAKŞEHİR", away: "KOCAELİSPOR" },
  { id: 17, category: "TÜRKİYE 1.LİG", home: "KAYSERİSPOR", away: "SİVASSPOR" },
  { id: 18, category: "TÜRKİYE SÜPER LİG", home: "AMED SPOR", away: "ERZURUMSPOR" },
  { id: 19, category: "TÜRKİYE SÜPER LİG", home: "BEŞİKTAŞ", away: "EYÜPSPOR" },
  { id: 20, category: "TÜRKİYE 1.LİG", home: "KEÇİÖRENGÜCÜ", away: "PENDİKSPOR" },
  { id: 21, category: "TÜRKİYE 1.LİG", home: "MARDİN 1969", away: "ANTALYASPOR" },
  { id: 22, category: "TÜRKİYE 1.LİG", home: "MUĞLASPOR", away: "BANDIRMASPOR" },
  { id: 23, category: "TÜRKİYE SÜPER KUPA", home: "SAMSUNSPOR", away: "GÖZTEPE" },
  { id: 24, category: "TÜRKİYE 1.LİG", home: "BATMAN PETROL SPOR", away: "BOLUSPOR" }
];

// 🔴 Sabit 4. Hafta Tahminleri
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
  "262739": ["1-0", "3-1", "1-1", "3-0", "3-1", "0-1", "1-2", "3-1", "2-0", "2-0", "2-1", "1-2", "3-0", "2-0", "2-1", "3-2", "1-0", "1-0", "2-0", "1-1", "0-1", "1-1", "1-2", "1-0"],
  "262872": ["0-2", "0-0", "0-1", "1-0", "1-0", "0-0", "0-4", "1-0", "0-1", "0-0", "0-1", "0-3", "0-0", "0-0", "0-1", "0-0", "0-0", "0-0", "3-1", "0-0", "0-1", "0-0", "0-0", "0-0"]
};

// 🔴 1. HAFTA SKOR BİLME ADEDİ (Tamamı DFO)
const skorWeek1Data: Record<string, number> = {
  "262736": 4, "262755": 6, "262719": 4, "262756": 4, "262754": 4, "262786": 3, "262731": 3, "262717": 3, "262732": 4,
  "262726": 3, "262750": 2, "262747": 3, "262771": 2, "262728": 2, "262816": 2, "262716": 2, "262790": 2, "262733": 2,
  "262709": 1, "262753": 2, "262813": 2, "262740": 1, "262718": 3, "262707": 1, "262782": 1, "262702": 1, "262714": 1,
  "262721": 1, "262706": 1, "262787": 1, "262744": 1, "262774": 1, "262715": 1, "262723": 1, "351925": 0, "262749": 0,
  "262705": 0, "262708": 0, "262711": 0, "262712": 0, "262734": 0
};

// 🔴 2. HAFTA SKOR BİLME ADEDİ (Tamamı DFO)
const skorWeek2Data: Record<string, number> = {
  "262756": 3, "262755": 2, "262709": 2, "262790": 4, "262772": 1, "262728": 4, "262726": 3, "262711": 2, "262717": 2,
  "262737": 2, "262705": 2, "262816": 2, "262774": 1, "262732": 1, "262786": 1, "262721": 1, "262738": 1, "262714": 3,
  "262763": 2, "262736": 2, "262740": 1, "262702": 1, "262703": 1, "262730": 1, "262715": 1, "262749": 1, "262725": 1,
  "262758": 1, "262771": 1, "262754": 1, "262747": 1, "262716": 1, "262708": 1, "262731": 1, "262739": 1, "262813": 0,
  "262712": 0, "262734": 0, "351925": 0, "262744": 0, "262718": 0, "262704": 0, "262733": 0, "262707": 0, "262750": 0,
  "262753": 0, "262706": 0, "262723": 0, "262719": 0, "262782": 0, "262770": 0
};

// 🔴 3. HAFTA DFO SKOR BİLME ADEDİ
const skorWeek3DfoData: Record<string, number> = {
  "262816": 2, "262733": 1, "262721": 3, "262763": 2, "262786": 2, "262711": 2, "351925": 2, "262726": 2, "262725": 2,
  "262771": 1, "262813": 2, "262709": 2, "262706": 1, "262738": 1, "262753": 1, "262734": 1, "262756": 1, "262702": 1,
  "262730": 1, "262731": 1, "262755": 1, "262747": 1, "262732": 1, "262707": 1, "262754": 1, "262714": 1, "262782": 1,
  "262723": 1, "262772": 1, "262739": 1, "262716": 1, "262728": 0, "262705": 0, "262774": 0, "262740": 0, "262749": 0,
  "262770": 0, "262719": 0, "262708": 0, "262744": 0, "262758": 0, "262718": 0, "262736": 0, "262790": 0, "262750": 0,
  "262717": 0, "262703": 0
};

// 🔴 3. HAFTA TFF SKOR BİLME ADEDİ
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

export default function SkorDurumuPage() {
  const [activeTab, setActiveTab] = useState<string>('total');
  const [activeLeague, setActiveLeague] = useState<'MASTER' | 'DFO' | 'TFF'>('MASTER');
  const [isWeekMenuOpen, setIsWeekMenuOpen] = useState<boolean>(false);
  const [tableRows, setTableRows] = useState<any[]>([]);
  
  const availableWeeks = [1, 2, 3, 4];

  const loadLeaderboard = async () => {
    try {
      const { data: dbMatches } = await supabase.from('live_matches').select('*');
      
      let w4DfoScores: Record<string, number> = {}; 
      let w4TffScores: Record<string, number> = {}; 

      Object.keys(allPlayersList).forEach(id => {
        w4DfoScores[id] = 0;
        w4TffScores[id] = 0;
      });

      if (dbMatches) {
        const uniqueMatches: Record<number, any> = {};
        dbMatches.forEach(row => { uniqueMatches[row.id] = row; });

        Object.values(uniqueMatches).forEach(dbMatch => {
          if (dbMatch.status === 'FINISHED' && dbMatch.home_score !== '-' && dbMatch.away_score !== '-') {
            const finalScore = `${dbMatch.home_score}-${dbMatch.away_score}`;
            
            const matchIndex = week4Matches.findIndex(
              wm => wm.home.toLowerCase() === dbMatch.home_team.toLowerCase() &&
                    wm.away.toLowerCase() === dbMatch.away_team.toLowerCase()
            );

            if (matchIndex !== -1) {
              const isTff = isTffMatchCheck(week4Matches[matchIndex].category);
              
              Object.keys(week4PredictionsData).forEach(playerId => {
                if (week4PredictionsData[playerId] && week4PredictionsData[playerId][matchIndex] === finalScore) {
                  if (isTff) w4TffScores[playerId] += 1;
                  else w4DfoScores[playerId] += 1;
                }
              });
            }
          }
        });
      }

      const baseList = Object.keys(allPlayersList).map(id => {
        let totalSkorAdedi = 0;
        
        if (activeTab === 'total') {
            if (activeLeague === 'MASTER') {
                totalSkorAdedi = (skorWeek1Data[id] || 0) + (skorWeek2Data[id] || 0) + 
                                 (skorWeek3DfoData[id] || 0) + (skorWeek3TffData[id] || 0) +
                                 (w4DfoScores[id] || 0) + (w4TffScores[id] || 0); 
            } else if (activeLeague === 'DFO') {
                totalSkorAdedi = (skorWeek1Data[id] || 0) + (skorWeek2Data[id] || 0) + 
                                 (skorWeek3DfoData[id] || 0) + (w4DfoScores[id] || 0);
            } else if (activeLeague === 'TFF') {
                totalSkorAdedi = (skorWeek3TffData[id] || 0) + (w4TffScores[id] || 0);
            }
        } 
        else if (activeTab === 'week1') {
            if (activeLeague === 'MASTER' || activeLeague === 'DFO') totalSkorAdedi = skorWeek1Data[id] || 0;
        }
        else if (activeTab === 'week2') {
            if (activeLeague === 'MASTER' || activeLeague === 'DFO') totalSkorAdedi = skorWeek2Data[id] || 0;
        }
        else if (activeTab === 'week3') {
            if (activeLeague === 'MASTER') totalSkorAdedi = (skorWeek3DfoData[id] || 0) + (skorWeek3TffData[id] || 0);
            else if (activeLeague === 'DFO') totalSkorAdedi = skorWeek3DfoData[id] || 0;
            else if (activeLeague === 'TFF') totalSkorAdedi = skorWeek3TffData[id] || 0;
        }
        else if (activeTab === 'week4') {
            if (activeLeague === 'MASTER') totalSkorAdedi = (w4DfoScores[id] || 0) + (w4TffScores[id] || 0);
            else if (activeLeague === 'DFO') totalSkorAdedi = w4DfoScores[id] || 0;
            else if (activeLeague === 'TFF') totalSkorAdedi = w4TffScores[id] || 0;
        }

        return { id, name: allPlayersList[id], skorAdedi: totalSkorAdedi };
      }).filter(p => p.skorAdedi > 0 || activeTab === 'total') // Sıfır çekenleri gizle (Total hariç)
        .sort((a, b) => b.skorAdedi - a.skorAdedi || a.name.localeCompare(b.name, 'tr'));

      const finalRows = baseList.map((player, index) => {
        return { ...player, currentRank: index + 1 };
      });

      setTableRows(finalRows);

    } catch (error) {
      console.log("Supabase verileri okunurken hata oluştu");
    }
  };

  useEffect(() => {
    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 5000); 
    return () => clearInterval(interval);
  }, [activeTab, activeLeague]);

  useEffect(() => {
    if (activeLeague === 'TFF' && (activeTab === 'week1' || activeTab === 'week2')) {
      setActiveTab('total');
    }
  }, [activeLeague, activeTab]);

  const selectTab = (tabKey: string) => {
    setActiveTab(tabKey);
    setIsWeekMenuOpen(false);
  };

  let headerColor = "text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]";
  if (activeLeague === 'DFO') headerColor = "text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]";
  if (activeLeague === 'TFF') headerColor = "text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]";

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center pb-24">
      <div className="flex flex-col items-center text-center mb-5 mt-1">
        <h1 className={`text-xl md:text-2xl font-extrabold text-center tracking-wider uppercase drop-shadow-md ${headerColor}`}>
          ELİT TAHMİN SKOR (TAM İSABET) MERKEZİ
        </h1>
      </div>

      <div className="w-full mb-6">
        <LiveMatchCard />
      </div>

      <div className="max-w-xl flex flex-col items-center mb-6 space-y-3 w-full">
        <div className="flex gap-2 w-full">
          <button onClick={() => setActiveLeague('MASTER')} className={`flex-1 py-2.5 rounded-xl font-black text-xs md:text-sm border transition-all ${activeLeague === 'MASTER' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 text-slate-300 border-slate-800'}`}>MASTER</button>
          <button onClick={() => setActiveLeague('DFO')} className={`flex-1 py-2.5 rounded-xl font-black text-xs md:text-sm border transition-all ${activeLeague === 'DFO' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 text-slate-300 border-slate-800'}`}>DFO</button>
          <button onClick={() => setActiveLeague('TFF')} className={`flex-1 py-2.5 rounded-xl font-black text-xs md:text-sm border transition-all ${activeLeague === 'TFF' ? 'bg-red-600 text-white border-red-500' : 'bg-slate-900 text-slate-300 border-slate-800'}`}>TFF</button>
        </div>

        <button onClick={() => selectTab('total')} className={`px-8 py-2.5 rounded-xl font-black text-sm md:text-base transition-all duration-200 border w-full text-center shadow-md uppercase tracking-wider ${activeTab === 'total' ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-500/20 scale-[1.02]' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'}`}>
          {activeLeague} TOPLAM SKOR DURUMU
        </button>

        <div className="w-full relative">
          <button onClick={() => setIsWeekMenuOpen(!isWeekMenuOpen)} className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs md:text-sm border transition-all flex items-center justify-between shadow-md ${activeTab !== 'total' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'}`}>
            <span>📅 {activeTab === 'total' ? 'TOPLAM SKOR DURUMU' : `${activeLeague} ${activeTab.replace('week', '')}. HAFTA SKOR DURUMU`}</span>
            <span className="text-xs transition-transform duration-200">{isWeekMenuOpen ? '▲ KAPAT' : '▼ HAFTALAR'}</span>
          </button>
          
          {isWeekMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-slate-900/95 border border-slate-700/80 p-3 rounded-2xl shadow-2xl backdrop-blur-md">
              <div className="flex flex-wrap justify-center gap-1.5 max-h-56 overflow-y-auto pr-1">
                {availableWeeks.map((weekNum) => {
                  if (activeLeague === 'TFF' && (weekNum === 1 || weekNum === 2)) return null;
                  const weekKey = `week${weekNum}`;
                  return (
                    <button 
                      key={weekNum} 
                      onClick={() => selectTab(weekKey)} 
                      className={`w-12 py-1.5 text-xs font-bold rounded-lg border transition-all text-center flex-shrink-0 ${activeTab === weekKey ? 'bg-emerald-500 text-slate-950 border-emerald-400 scale-105 shadow-sm' : 'bg-slate-950/90 text-slate-300 border-slate-800 hover:bg-emerald-500/20 hover:text-emerald-300'}`}
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
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] sm:text-xs border-b border-slate-800">
                <tr>
                  <th className="px-2 sm:px-6 py-3 sm:py-3.5 w-12 sm:w-24 text-center">SIRA</th>
                  <th className="px-2 sm:px-6 py-3 sm:py-3.5">YARIŞMACI</th>
                  <th className="px-2 sm:px-6 py-3 sm:py-3.5 text-right whitespace-nowrap">TAM İSABET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tableRows.map((row, idx) => {
                  const isTop1 = idx === 0;
                  const isTop2 = idx === 1;
                  const isTop3 = idx === 2;
                  
                  let rankDisplay = <span className="text-slate-300 font-medium text-xs sm:text-sm">{row.currentRank}</span>;
                  let nameColor = "text-slate-200";
                  let rowBg = "hover:bg-slate-800/40";

                  if (isTop1) {
                    nameColor = "text-amber-400 font-black";
                    rowBg = "bg-amber-950/20 border-l-4 border-amber-500 hover:bg-amber-900/30";
                    rankDisplay = <span className="text-2xl drop-shadow-md">🥇</span>;
                  } else if (isTop2) {
                    nameColor = "text-slate-300 font-bold";
                    rowBg = "bg-slate-800/40 border-l-4 border-slate-400 hover:bg-slate-700/50";
                    rankDisplay = <span className="text-2xl drop-shadow-md">🥈</span>;
                  } else if (isTop3) {
                    nameColor = "text-orange-300 font-bold";
                    rowBg = "bg-orange-950/20 border-l-4 border-orange-500 hover:bg-orange-900/30";
                    rankDisplay = <span className="text-2xl drop-shadow-md">🥉</span>;
                  } else {
                    rowBg = "border-l-4 border-transparent hover:bg-slate-800/40";
                  }

                  const cleanName = row.name.replace(/🏆/g, '').trim();
                  const trophyCount = (row.name.match(/🏆/g) || []).length;

                  return (
                    <tr key={row.id || idx} className={`transition-all ${rowBg}`}>
                      <td className="px-2 sm:px-6 py-3 sm:py-3.5 text-center align-middle">
                        <div className="flex items-center justify-center">
                          {rankDisplay}
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-3 sm:py-3.5 w-full max-w-[120px] sm:max-w-none">
                        <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
                          <span className={`${nameColor} text-xs sm:text-sm uppercase tracking-wide truncate flex-shrink`} title={cleanName}>
                            {cleanName}
                          </span>
                          {trophyCount > 0 && (
                            <span className="flex-shrink-0 text-amber-400 text-[10px] sm:text-xs tracking-widest whitespace-nowrap">
                              {'🏆'.repeat(trophyCount)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`px-2 sm:px-6 py-3 sm:py-3.5 text-right font-black text-lg sm:text-xl whitespace-nowrap ${isTop1 || isTop2 || isTop3 ? 'text-amber-400 drop-shadow-md' : 'text-emerald-400'}`}>
                        {row.skorAdedi}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 font-medium text-xs sm:text-sm">⏳ Henüz tam isabet skor tahmini bulunmuyor.</div>
        )}
      </div>
    </div>
  );
}