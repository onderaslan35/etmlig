'use client';
import React, { useState, useEffect } from 'react';
import LiveMatchCard from '@/components/LiveMatchCard';
import { supabase } from '@/utils/supabase'; 

const allPlayersMasterList: Record<string, string> = {
  "262756": "EYÜP KARACAOĞLU", "262755": "DOĞAÇ ALKAN", "262816": "SEDAT SEDAT", "262736": "MEHMET ALİ KARA", "262786": "SEDAT DİŞLİ", "262733": "MUHSİN ASİLKAN", "262728": "ÖNDER ASLAN", "262726": "HUDAVER TOPARDIC", "262709": "SALİH KARACAOĞLU", "262719": "UĞUR VARDAR", "262754": "OSMAN ALİ AYDIN 🏆", "262771": "ULAŞ ADIGÜZEL", "262721": "MUSTAFA GÜMÜŞÇÜ", "262790": "CUMALİ SÖKER", "262717": "MURAT ALİ", "262732": "R. İLHAN KARACA 🏆🏆", "262711": "RIDVAN DOGER", "262731": "FATİH AYAN", "262772": "CEMAL SİVRİKAYA 🏆", "262763": "MUSTAFA ELMAS", "262707": "HAKAN AYAN", "262706": "GAZİ AYAN 🏆🏆", "262813": "KEMAL ERSOY", "262774": "ŞENOL CAN ÇAKICI", "262747": "SAVAŞ ÇAĞLAYAN", "262705": "AHMET BİRCAN 🏆", "262714": "İSMAİL EKER 🏆", "262740": "ABDULLAH DİK", "262702": "MURAT KARA", "262738": "MEVLÜT EVLER", "262753": "YUSUF KIZILTUĞ", "262716": "BİROL DEMİREL", "262750": "MAHMUT CBR", "262734": "LEVENT YILDIRIM", "262725": "İLYAS KAZDAL", "262737": "ŞAHİN GEZGİNCİ", "351925": "ALİOS GÖZTEPE", "262730": "ÖNDER IŞIK", "262782": "YUSUF ERBAY", "262749": "B.VEYSELOĞLU EROL", "262718": "BEKİR KARADAĞ", "262715": "ŞEMSETTİN DÜGER", "262739": "UĞUR GÜRBÜZ", "262703": "CEMALETTİN BELLİ", "262758": "MELİH PINAR", "262770": "OZKAYA MAZAKALI BAYRAM", "262708": "BAYRAM YILMAZ", "262787": "MUSTAFA TUCİ", "262744": "İLYAS UYGUN", "262712": "MURAT AYDEMİR", "262704": "YAPAY ZEKA", "262723": "AYHAN LUŞOĞLU"
};

const tffWeek1Data: Record<string, { name: string; puan: number }> = {}; 
const tffWeek2Data: Record<string, { name: string; puan: number }> = {};
const tffWeek3Data: Record<string, { name: string; puan: number }> = { "262707": { name: "HAKAN AYAN", puan: 10 }, "262816": { name: "SEDAT SEDAT", puan: 9 }, "262733": { name: "MUHSİN ASİLKAN", puan: 7 }, "262754": { name: "OSMAN ALİ AYDIN 🏆", puan: 6 }, "262728": { name: "ÖNDER ASLAN", puan: 6 }, "262706": { name: "GAZİ AYAN 🏆🏆", puan: 6 }, "262755": { name: "DOĞAÇ ALKAN", puan: 6 }, "262736": { name: "MEHMET ALİ KARA", puan: 6 }, "262771": { name: "ULAŞ ADIGÜZEL", puan: 5 }, "262734": { name: "LEVENT YILDIRIM", puan: 5 }, "262705": { name: "AHMET BİRCAN 🏆", puan: 4 }, "262714": { name: "İSMAİL EKER 🏆", puan: 4 }, "262763": { name: "MUSTAFA ELMAS", puan: 4 }, "262774": { name: "ŞENOL CAN ÇAKICI", puan: 4 }, "262740": { name: "ABDULLAH DİK", puan: 4 }, "262756": { name: "EYÜP KARACAOĞLU", puan: 4 }, "262782": { name: "YUSUF ERBAY", puan: 3 }, "262702": { name: "MURAT KARA", puan: 3 }, "262813": { name: "KEMAL ERSOY", puan: 3 }, "262723": { name: "AYHAN LUŞOĞLU", puan: 2 }, "262749": { name: "B.VEYSELOĞLU EROL", puan: 2 }, "262721": { name: "MUSTAFA GÜMÜŞÇÜ", puan: 1 }, "351925": { name: "ALİOS GÖZTEPE", puan: 1 }, "262730": { name: "ÖNDER IŞIK", puan: 1 }, "262772": { name: "CEMAL SİVRİKAYA 🏆", puan: 1 }, "262739": { name: "UĞUR GÜRBÜZ", puan: 1 }, "262770": { name: "OZKAYA MAZAKALI BAYRAM", puan: 1 } };

const week4PredictionsData: Record<string, string[]> = {
  "262731": ["1-1", "3-1", "1-1", "2-0", "3-0", "2-2", "1-3", "1-1", "2-1", "1-2", "1-0", "1-3", "2-1", "1-2", "2-2", "2-1", "2-1", "1-1", "3-1", "1-1", "1-1", "1-1", "1-1", "2-1"], "262758": ["1-2", "3-0", "2-0", "3-0", "4-1", "1-1", "1-3", "1-1", "1-1", "0-2", "2-1", "0-3", "3-0", "1-1", "2-1", "2-1", "3-0", "3-0", "3-0", "1-1", "0-3", "1-1", "1-2", "3-0"], "262763": ["1-1", "1-1", "1-1", "2-0", "4-0", "1-1", "0-2", "1-0", "1-0", "1-1", "1-1", "1-1", "1-1", "2-0", "1-1", "1-1", "1-1", "1-0", "3-0", "1-1", "1-1", "1-1", "1-1", "1-0"], "262744": ["1-2", "3-1", "1-1", "2-0", "4-0", "2-0", "1-2", "1-1", "1-0", "0-0", "2-2", "0-4", "2-0", "2-0", "1-2", "2-1", "0-1", "0-2", "2-0", "0-1", "0-2", "0-2", "1-1", "0-1"], "262813": ["1-2", "4-1", "1-0", "3-2", "2-0", "2-0", "1-3", "1-1", "3-0", "2-2", "1-2", "0-4", "1-1", "2-2", "2-0", "1-0", "2-0", "1-2", "2-0", "1-2", "1-3", "0-0", "0-1", "1-2"], "351925": ["0-2", "0-0", "2-1", "1-0", "3-0", "0-0", "0-2", "0-0", "0-0", "0-0", "0-0", "0-3", "2-1", "0-0", "2-0", "2-1", "0-0", "0-2", "2-0", "0-0", "0-2", "0-0", "0-2", "0-0"], "262732": ["2-1", "2-1", "1-0", "1-1", "2-0", "3-1", "2-2", "2-1", "2-0", "1-1", "1-1", "0-3", "2-0", "1-1", "2-1", "0-1", "1-1", "1-1", "2-1", "1-2", "0-2", "0-2", "2-1", "1-0"], "262754": ["1-1", "1-0", "1-0", "2-0", "3-0", "1-0", "0-2", "1-0", "1-0", "0-2", "1-0", "0-3", "2-0", "1-0", "1-2", "1-0", "1-0", "1-1", "2-0", "1-0", "0-1", "0-1", "1-0", "1-0"], "262733": ["2-1", "3-1", "0-0", "3-0", "2-0", "0-1", "1-4", "2-0", "0-0", "1-0", "1-1", "0-3", "2-0", "2-1", "2-1", "2-0", "1-1", "1-0", "3-0", "1-1", "0-1", "1-1", "3-1", "1-0"], "262774": ["0-1", "2-0", "1-0", "2-0", "3-1", "1-1", "0-2", "1-1", "1-2", "1-2", "1-1", "0-2", "1-0", "0-0", "2-0", "0-0", "1-2", "2-1", "2-0", "1-1", "0-2", "0-0", "3-1", "0-2"], "262771": ["2-2", "3-1", "2-1", "4-0", "5-0", "1-1", "1-3", "1-1", "2-2", "1-1", "2-1", "1-4", "3-1", "3-0", "2-1", "1-0", "1-1", "3-1", "3-1", "1-3", "1-1", "1-1", "1-1", "2-1"], "262730": ["0-3", "3-0", "1-0", "3-1", "2-0", "1-1", "0-2", "0-1", "0-0", "0-1", "0-2", "0-3", "2-0", "2-1", "0-2", "2-0", "1-1", "1-2", "3-0", "0-1", "0-2", "0-0", "1-1", "2-1"], "262707": ["0-4", "3-0", "2-1", "1-1", "1-0", "0-0", "0-2", "0-0", "2-1", "0-2", "0-0", "0-4", "1-0", "0-0", "0-0", "0-0", "0-0", "0-0", "2-0", "1-0", "0-2", "0-0", "0-0", "0-2"], "262816": ["0-1", "3-1", "0-2", "1-0", "2-0", "0-0", "0-3", "1-1", "3-0", "0-2", "0-0", "0-2", "3-0", "0-2", "2-0", "1-1", "2-1", "1-3", "3-0", "0-0", "0-2", "0-3", "2-0", "0-1"], "262719": ["2-1", "2-1", "2-0", "2-1", "3-0", "2-1", "0-2", "3-1", "2-1", "1-1", "1-2", "0-2", "3-0", "2-1", "2-1", "1-1", "1-2", "2-1", "3-0", "2-1", "1-1", "2-1", "1-2", "2-0"], "262725": ["0-2", "2-0", "1-1", "3-0", "3-0", "1-0", "0-2", "1-1", "2-0", "2-1", "2-1", "0-2", "2-0", "0-0", "1-1", "1-0", "2-0", "1-0", "2-0", "0-1", "0-2", "1-0", "1-0", "0-1"], "262711": ["0-1", "3-1", "1-0", "3-0", "3-0", "2-1", "0-4", "0-0", "1-1", "1-3", "1-1", "1-2", "2-2", "1-0", "1-1", "2-1", "0-0", "2-1", "3-0", "0-0", "1-1", "1-2", "2-2", "2-0"], "262718": ["1-2", "4-1", "3-1", "3-0", "4-1", "1-1", "1-3", "2-2", "2-1", "1-1", "1-2", "1-3", "2-0", "2-1", "2-2", "2-1", "2-2", "1-1", "3-1", "2-2", "1-2", "1-3", "2-2", "1-2"], "262721": ["0-1", "2-0", "1-0", "3-1", "2-1", "0-2", "0-3", "2-1", "2-0", "1-2", "1-1", "0-3", "3-1", "1-1", "0-1", "0-2", "0-1", "0-2", "2-0", "0-2", "0-3", "0-1", "2-2", "0-1"], "262726": ["1-3", "2-2", "2-2", "3-0", "4-0", "1-1", "1-2", "2-1", "1-1", "1-1", "1-2", "0-3", "1-1", "2-1", "0-2", "0-2", "2-0", "1-1", "2-0", "3-1", "2-2", "0-2", "1-0", "2-1"], "262702": ["0-2", "1-0", "1-1", "3-1", "2-0", "1-0", "0-2", "0-1", "0-0", "0-1", "1-0", "0-3", "2-0", "1-0", "0-1", "1-0", "1-0", "2-0", "3-0", "1-1", "0-0", "0-1", "0-0", "2-0"], "262738": ["1-1", "2-1", "1-1", "1-0", "3-0", "2-1", "1-3", "2-1", "2-1", "1-1", "2-1", "1-3", "2-0", "1-1", "2-2", "2-1", "2-1", "1-1", "2-0", "2-1", "1-1", "1-1", "2-1", "1-1"], "262750": ["1-1", "3-1", "2-2", "3-1", "3-0", "1-1", "1-3", "2-1", "0-0", "1-2", "2-2", "0-3", "3-1", "2-0", "2-2", "0-0", "1-1", "0-2", "3-1", "0-2", "0-3", "1-2", "1-3", "2-0"], "262705": ["1-3", "3-1", "2-1", "3-1", "3-1", "3-0", "1-3", "1-2", "3-1", "1-2", "1-2", "0-3", "2-0", "3-0", "2-1", "2-1", "2-0", "2-0", "4-0", "3-1", "0-1", "0-2", "1-2", "1-1"], "262706": ["0-2", "4-1", "1-0", "3-0", "2-0", "0-2", "0-2", "0-0", "0-0", "0-1", "0-0", "0-2", "0-2", "0-0", "0-1", "0-0", "0-0", "0-1", "2-0", "2-1", "0-2", "0-2", "0-0", "2-0"], "262716": ["1-1", "3-2", "1-0", "3-1", "3-0", "3-1", "0-3", "0-0", "3-1", "0-2", "1-1", "0-4", "2-0", "3-1", "1-1", "3-0", "2-1", "1-1", "4-0", "2-1", "0-2", "0-2", "1-1", "1-2"], "262736": ["1-2", "2-1", "1-2", "3-0", "4-0", "2-1", "2-4", "3-1", "2-2", "2-2", "3-2", "1-1", "3-1", "3-0", "1-1", "4-1", "2-1", "2-1", "1-0", "2-1", "1-1", "1-1", "1-1", "3-0"], "262714": ["1-3", "2-0", "0-2", "0-0", "2-0", "0-1", "1-1", "0-0", "2-0", "0-1", "2-0", "0-3", "1-1", "0-1", "1-1", "0-0", "0-0", "1-0", "1-0", "0-0", "1-0", "1-1", "0-1", "0-1"], "262749": ["2-1", "3-1", "2-0", "3-0", "3-1", "2-2", "1-2", "2-1", "2-0", "2-0", "2-2", "1-3", "2-1", "2-1", "2-1", "1-1", "2-1", "1-1", "2-1", "2-1", "0-2", "1-2", "2-2", "1-1"], "262753": ["1-1", "2-1", "2-0", "3-0", "1-1", "1-0", "3-2", "1-1", "1-0", "2-2", "2-2", "0-3", "2-0", "1-2", "1-1", "1-1", "1-1", "0-1", "2-0", "1-1", "1-2", "1-1", "0-2", "1-1"], "262740": ["1-2", "1-1", "2-1", "2-0", "3-0", "1-2", "1-3", "1-1", "2-2", "1-1", "2-1", "1-3", "3-0", "1-1", "2-2", "2-1", "1-1", "1-2", "3-1", "2-1", "1-2", "2-1", "2-2", "1-1"], "262790": ["0-2", "3-1", "0-2", "0-2", "4-0", "0-2", "0-3", "3-1", "1-1", "2-0", "1-1", "0-3", "3-1", "2-1", "0-3", "2-1", "1-1", "2-0", "2-1", "1-0", "2-1", "1-1", "0-2", "0-2"], "262786": ["1-2", "3-1", "3-1", "3-0", "2-1", "1-1", "1-2", "1-1", "1-2", "2-0", "2-1", "1-1", "3-1", "2-0", "1-1", "1-2", "1-1", "1-1", "3-1", "2-1", "2-0", "1-2", "1-2", "1-1"], "262734": ["3-0", "4-1", "2-1", "3-1", "4-1", "2-1", "1-2", "3-2", "2-1", "3-2", "3-1", "2-1", "3-0", "2-3", "1-2", "3-1", "2-1", "3-2", "4-1", "3-1", "2-1", "3-1", "2-1", "3-1"], "262756": ["2-2", "3-2", "2-0", "4-2", "1-2", "1-2", "1-3", "1-2", "0-0", "0-0", "2-1", "1-3", "2-2", "1-2", "1-2", "1-2", "0-0", "0-0", "2-0", "0-0", "2-2", "0-1", "1-1", "1-3"], "262703": ["2-2", "1-1", "1-1", "2-1", "1-0", "1-1", "1-3", "2-2", "0-1", "0-0", "1-1", "0-2", "0-0", "0-0", "2-2", "1-1", "1-1", "0-0", "2-1", "1-1", "0-1", "1-1", "2-2", "0-0"], "262772": ["0-2", "2-0", "1-1", "1-1", "1-0", "0-0", "0-1", "0-0", "1-0", "1-2", "2-3", "0-3", "2-0", "1-1", "1-1", "1-0", "0-1", "1-0", "2-1", "1-1", "0-0", "0-1", "0-0", "0-1"], "262717": ["1-2", "0-1", "1-1", "2-2", "2-2", "2-0", "0-2", "1-2", "0-0", "0-2", "0-1", "0-2", "2-0", "1-2", "1-1", "1-0", "1-2", "0-0", "2-1", "1-0", "1-1", "3-2", "1-2", "0-0"], "262728": ["0-0", "0-0", "1-0", "2-1", "4-1", "0-1", "0-2", "1-1", "0-1", "0-0", "1-0", "0-5", "4-0", "2-0", "2-3", "1-2", "0-0", "0-0", "3-0", "0-0", "0-2", "0-1", "0-2", "0-0"], "262770": ["3-1", "3-1", "2-2", "2-0", "2-1", "1-1", "1-3", "0-2", "2-0", "0-3", "0-1", "0-4", "2-1", "1-1", "2-1", "2-0", "1-1", "1-0", "3-0", "2-3", "0-2", "1-2", "0-2", "3-1"], "262755": ["1-2", "4-1", "3-2", "2-1", "3-2", "1-1", "3-3", "2-1", "1-0", "0-1", "1-1", "0-2", "1-1", "3-0", "1-2", "4-2", "3-1", "2-2", "1-0", "2-2", "1-0", "3-2", "1-0", "3-1"], "262704": ["1-1", "2-1", "1-1", "2-0", "3-0", "0-1", "1-2", "2-1", "1-0", "0-1", "1-1", "1-3", "1-0", "2-0", "2-1", "2-0", "1-1", "1-1", "2-1", "1-1", "1-2", "0-2", "2-1", "1-1"], "262747": ["1-1", "2-0", "1-0", "2-0", "2-0", "1-1", "1-2", "1-1", "1-1", "1-1", "1-1", "1-3", "1-1", "1-1", "1-1", "1-1", "1-1", "1-1", "2-0", "1-1", "1-1", "1-1", "1-1", "1-1"], "262723": ["1-1", "3-1", "2-1", "2-0", "3-0", "1-2", "1-2", "2-1", "2-0", "1-2", "1-1", "2-1", "3-1", "3-0", "2-1", "1-1", "2-1", "1-1", "2-1", "1-1", "0-2", "0-2", "1-1", "2-0"], "262709": ["1-1", "2-1", "2-1", "2-0", "3-0", "1-1", "1-2", "1-1", "1-0", "1-0", "2-1", "0-2", "2-1", "2-0", "1-1", "1-0", "1-1", "2-1", "2-1", "1-1", "0-3", "0-2", "1-2", "1-0"], "262739": ["1-0", "3-1", "1-1", "3-0", "3-1", "0-1", "1-2", "3-1", "2-0", "2-0", "2-1", "1-2", "3-0", "2-0", "2-1", "3-2", "1-0", "1-0", "2-0", "1-1", "0-1", "1-1", "1-2", "1-0"], "262782": ["0-2", "0-0", "0-1", "1-0", "1-0", "0-0", "0-4", "1-0", "0-1", "0-0", "0-1", "0-3", "0-0", "0-0", "0-1", "0-0", "0-0", "0-0", "3-1", "0-0", "0-1", "0-0", "0-0", "0-0"]
};

const isTffMatchCheck = (category: string) => {
  const uppercaseCat = category.toUpperCase();
  return (uppercaseCat.includes("TÜRKİYE SÜPER LİG") || uppercaseCat.includes("TÜRKİYE 1.LİG") || uppercaseCat.includes("TÜRKİYE SÜPER KUPA"));
};

const week4Matches = [
  { id: 1, category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR RÖVANŞ MAÇI" }, { id: 2, category: "UEFA SÜPER KUPA" }, { id: 3, category: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR RÖVANŞ" }, { id: 4, category: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR RÖVANŞ" }, { id: 5, category: "TÜRKİYE SÜPER LİG" }, { id: 6, category: "TÜRKİYE 1.LİG" }, { id: 7, category: "TÜRKİYE SÜPER LİG" }, { id: 8, category: "TÜRKİYE SÜPER LİG" }, { id: 9, category: "TÜRKİYE 1.LİG" }, { id: 10, category: "TÜRKİYE 1.LİG" }, { id: 11, category: "TÜRKİYE SÜPER LİG" }, { id: 12, category: "TÜRKİYE SÜPER LİG" }, { id: 13, category: "TÜRKİYE 1.LİG" }, { id: 14, category: "TÜRKİYE 1.LİG" }, { id: 15, category: "İNGİLTERE SÜPER KUPA" }, { id: 16, category: "TÜRKİYE SÜPER LİG" }, { id: 17, category: "TÜRKİYE 1.LİG" }, { id: 18, category: "TÜRKİYE SÜPER LİG" }, { id: 19, category: "TÜRKİYE SÜPER LİG" }, { id: 20, category: "TÜRKİYE 1.LİG" }, { id: 21, category: "TÜRKİYE 1.LİG" }, { id: 22, category: "TÜRKİYE 1.LİG" }, { id: 23, category: "TÜRKİYE SÜPER KUPA" }, { id: 24, category: "TÜRKİYE 1.LİG" }
];

// 🔴 KESİNLİKLE KIRILMAYAN RAW (HAM) VİKİPEDİ LİNKLERİ 🔴
const leftLogos = [
  { id: 'superlig', src: 'https://upload.wikimedia.org/wikipedia/tr/b/b3/Trendyol_S%C3%BCper_Lig_logo.png', alt: 'Trendyol Süper Lig' },
  { id: '1lig', src: 'https://upload.wikimedia.org/wikipedia/tr/c/c2/Trendyol_1._Lig_logo.png', alt: 'Trendyol 1. Lig' },
  { id: 'zkupa', src: 'https://upload.wikimedia.org/wikipedia/tr/7/75/Ziraat_T%C3%BCrkiye_Kupas%C4%B1_logo.png', alt: 'Ziraat Türkiye Kupası' }
];

const tffLogo = 'https://upload.wikimedia.org/wikipedia/commons/e/e3/T%C3%BCrkiye_Futbol_Federasyonu_logo.png';

const rightLogos = [
  { id: 'skupa', src: 'https://upload.wikimedia.org/wikipedia/tr/3/31/TFF_S%C3%BCper_Kupa.png', alt: 'TFF Süper Kupa' },
  { id: 'kadinlar', src: 'https://upload.wikimedia.org/wikipedia/tr/4/4c/Turkcell_Kad%C4%B1n_Futbol_S%C3%BCper_Ligi_logo.png', alt: 'Kadınlar Süper Ligi' },
  { id: '2lig', src: 'https://upload.wikimedia.org/wikipedia/tr/b/be/TFF_2._Lig_logo.png', alt: 'TFF 2. Lig' },
  { id: '3lig', src: 'https://upload.wikimedia.org/wikipedia/tr/f/fa/TFF_3._Lig_logo.png', alt: 'TFF 3. Lig' }
];

export default function TffPuanDurumuPage() {
  const [activeTab, setActiveTab] = useState<string>('total');
  const [isWeekMenuOpen, setIsWeekMenuOpen] = useState<boolean>(false);
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [adminStatus, setAdminStatus] = useState<string>('NOT_STARTED');
  const availableWeeks = [3, 4]; 

  const loadLeaderboard = async () => {
    try {
      const { data: dbMatches } = await supabase.from('live_matches').select('*');
      let w4Base: Record<string, number> = {}; 
      let w4Live: Record<string, number> = {}; 
      let isAnyMatchLive = false;

      Object.keys(allPlayersMasterList).forEach(id => { w4Base[id] = 0; w4Live[id] = 0; });

      if (dbMatches) {
        const uniqueMatches: Record<number, any> = {};
        dbMatches.forEach(row => { uniqueMatches[row.id] = row; });

        Object.values(uniqueMatches).forEach(dbMatch => {
          const matchIndex = dbMatch.id - 1; 
          const matchDef = week4Matches[matchIndex];
          
          if (matchDef && isTffMatchCheck(matchDef.category) && dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-') {
            const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`;
            const winnerIds = Object.keys(week4PredictionsData).filter(id => week4PredictionsData[id][matchIndex] === targetScore);
            
            let points = 1;
            if(winnerIds.length === 1) points = 12; else if(winnerIds.length === 2) points = 6; else if(winnerIds.length === 3) points = 5; else if(winnerIds.length === 4) points = 4; else if(winnerIds.length === 5) points = 3; else if(winnerIds.length === 6) points = 2; else points = 1;

            winnerIds.forEach(wId => {
              if (dbMatch.status === 'FINISHED') w4Base[wId] += points; 
              else if (dbMatch.status === 'LIVE' || dbMatch.status === 'HT') { w4Live[wId] += points; isAnyMatchLive = true; }
            });
          }
        });
      }

      setAdminStatus(isAnyMatchLive ? 'LIVE' : 'NOT_STARTED');

      if (activeTab === 'total') {
        const referenceList = Object.keys(allPlayersMasterList).map(id => {
          const basePuan = (tffWeek1Data[id]?.puan || 0) + (tffWeek2Data[id]?.puan || 0) + (tffWeek3Data[id]?.puan || 0);
          return { id, name: allPlayersMasterList[id], basePuan };
        }).sort((a, b) => b.basePuan - a.basePuan || a.name.localeCompare(b.name, 'tr'));

        const prevRanks: Record<string, number> = {};
        referenceList.forEach((player, index) => { prevRanks[player.id] = index + 1; });

        const baseList = Object.keys(allPlayersMasterList).map(id => {
          const w4B = w4Base[id] || 0; 
          const basePuan = (tffWeek1Data[id]?.puan || 0) + (tffWeek2Data[id]?.puan || 0) + (tffWeek3Data[id]?.puan || 0) + w4B;
          const liveExtra = w4Live[id] || 0; 
          return { id, name: allPlayersMasterList[id], basePuan, liveExtra, puan: basePuan + liveExtra };
        }).sort((a, b) => b.puan - a.puan || a.name.localeCompare(b.name, 'tr'));

        const finalRows = baseList.map((player, index) => {
          const currentRank = index + 1;
          const prevRank = prevRanks[player.id];
          let trend = 'same', trendDiff = 0; 
          if (currentRank < prevRank) { trend = 'up'; trendDiff = prevRank - currentRank; } 
          else if (currentRank > prevRank) { trend = 'down'; trendDiff = currentRank - prevRank; }
          return { ...player, currentRank, prevRank, trend, trendDiff };
        });
        setTableRows(finalRows);
      } else {
        if(activeTab === 'week4') {
          const list = Object.keys(allPlayersMasterList).map(id => {
            return { id, name: allPlayersMasterList[id], puan: (w4Base[id] || 0) + (w4Live[id] || 0), liveExtra: w4Live[id] || 0, trend: 'none', trendDiff: 0 };
          });
          setTableRows(list.sort((a, b) => b.puan - a.puan || a.name.localeCompare(b.name, 'tr')));
        } else {
          let dataMap = tffWeek1Data; if(activeTab === 'week2') dataMap = tffWeek2Data; if(activeTab === 'week3') dataMap = tffWeek3Data;
          const list = Object.keys(allPlayersMasterList).map(id => {
            const rawObj = dataMap[id];
            return { id, name: rawObj ? rawObj.name : allPlayersMasterList[id], puan: rawObj ? rawObj.puan : 0, liveExtra: 0, trend: 'none', trendDiff: 0 };
          });
          setTableRows(list.sort((a, b) => b.puan - a.puan || a.name.localeCompare(b.name, 'tr')));
        }
      }
    } catch (e) {}
  };

  useEffect(() => { loadLeaderboard(); const interval = setInterval(loadLeaderboard, 5000); return () => clearInterval(interval); }, [activeTab]);
  const selectTab = (tabKey: string) => { setActiveTab(tabKey); setIsWeekMenuOpen(false); };

  return (
    <div className="max-w-[1400px] mx-auto p-4 text-slate-100 flex flex-col items-center">
      
      {/* 🔴 SİMETRİK ŞEREF KÜRSÜSÜ (YENİ TASARIM) 🔴 */}
      <div className="flex flex-col items-center text-center mb-8 mt-2 w-full">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 w-full px-4 bg-slate-900/40 py-6 rounded-[2rem] border border-slate-800/60 shadow-[0_0_30px_rgba(0,0,0,0.4)] backdrop-blur-sm">
          
          {/* Sol Grup */}
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {leftLogos.map(logo => (
              <img key={logo.id} src={logo.src} alt={logo.alt} title={logo.alt} className="h-8 sm:h-10 md:h-12 w-auto object-contain drop-shadow-xl hover:scale-110 transition-transform cursor-pointer opacity-90 hover:opacity-100" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ))}
          </div>
          
          {/* TFF Sol Logo */}
          <img src={tffLogo} alt="TFF" title="TFF" className="h-10 sm:h-12 md:h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:scale-110 transition-transform mx-1 sm:mx-2 cursor-pointer" onError={(e) => { e.currentTarget.style.display = 'none'; }} />

          {/* ANA BAŞLIK */}
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-widest uppercase mx-1 sm:mx-2 whitespace-nowrap" style={{ textShadow: '0 0 15px rgba(220,38,38,1), 0 0 30px rgba(220,38,38,0.8)' }}>
            TFF <span className="text-red-500">PUAN DURUMU</span>
          </h1>

          {/* TFF Sağ Logo */}
          <img src={tffLogo} alt="TFF" title="TFF" className="h-10 sm:h-12 md:h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:scale-110 transition-transform mx-1 sm:mx-2 cursor-pointer" onError={(e) => { e.currentTarget.style.display = 'none'; }} />

          {/* Sağ Grup */}
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {rightLogos.map(logo => (
              <img key={logo.id} src={logo.src} alt={logo.alt} title={logo.alt} className="h-8 sm:h-10 md:h-12 w-auto object-contain drop-shadow-xl hover:scale-110 transition-transform cursor-pointer opacity-90 hover:opacity-100" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ))}
          </div>

        </div>
      </div>
      
      <div className="w-full mb-6 max-w-5xl"><LiveMatchCard /></div>
      
      <div className="max-w-xl flex flex-col items-center mb-6 space-y-3 w-full">
        <button onClick={() => selectTab('total')} className={`px-8 py-2.5 rounded-xl font-black text-sm md:text-base transition-all duration-200 border w-full text-center shadow-md uppercase tracking-wider ${activeTab === 'total' ? 'bg-red-700 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)] scale-[1.02]' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'}`}>
          TFF TOPLAM PUAN DURUMU
        </button>
        <div className="w-full relative">
          <button onClick={() => setIsWeekMenuOpen(!isWeekMenuOpen)} className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs md:text-sm border transition-all flex items-center justify-between shadow-md ${activeTab !== 'total' ? 'bg-red-700 text-white border-red-500' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'}`}>
            <span>📅 {activeTab === 'total' ? 'TOPLAM PUAN DURUMU' : `TFF ${activeTab.replace('week', '')}. HAFTA PUAN DURUMU`}</span>
            <span className="text-xs transition-transform duration-200">{isWeekMenuOpen ? '▲ KAPAT' : '▼ HAFTALAR'}</span>
          </button>
          {isWeekMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-slate-900/95 border border-slate-700/80 p-3 rounded-2xl shadow-2xl backdrop-blur-md">
              <div className="flex flex-wrap justify-center gap-1.5 max-h-56 overflow-y-auto pr-1">
                {availableWeeks.map((weekNum) => {
                  const weekKey = `week${weekNum}`;
                  return (
                    <button key={weekNum} onClick={() => selectTab(weekKey)} className={`w-12 py-1.5 text-xs font-bold rounded-lg border transition-all text-center flex-shrink-0 ${activeTab === weekKey ? 'bg-red-700 text-white border-red-500 scale-105 shadow-sm' : 'bg-slate-950/90 text-slate-300 border-slate-800 hover:bg-red-500/20 hover:text-red-300'}`}>{weekNum}</button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl max-w-5xl">
        {tableRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] sm:text-xs border-b border-slate-800">
                <tr>
                  <th className="px-2 sm:px-6 py-3 sm:py-3.5 w-12 sm:w-24 text-center">SIRA</th>
                  <th className="px-2 sm:px-6 py-3 sm:py-3.5">YARIŞMACI</th>
                  <th className="px-2 sm:px-6 py-3 sm:py-3.5 text-right whitespace-nowrap pr-4 sm:pr-8">
                    {activeTab === 'total' ? 'TOPLAM PUAN' : 'HAFTALIK PUAN'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tableRows.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-2 sm:px-6 py-3 sm:py-3.5 text-center align-middle">
                      <div className="flex items-center justify-center gap-0.5 sm:gap-2">
                        <span className="text-slate-300 font-medium text-xs sm:text-sm w-4 sm:w-5 text-center sm:text-right">{row.currentRank || idx + 1}</span>
                        <div className="w-6 sm:w-10 flex items-center justify-start">
                          {activeTab === 'total' && row.trend === 'up' && <span className="text-emerald-400 text-[10px] sm:text-xs font-bold animate-bounce flex items-center gap-0.5">▲ <span className="text-[8px] sm:text-[10px]">{row.trendDiff}</span></span>}
                          {activeTab === 'total' && row.trend === 'down' && <span className="text-red-500 text-[10px] sm:text-xs font-bold flex items-center gap-0.5">▼ <span className="text-[8px] sm:text-[10px]">{row.trendDiff}</span></span>}
                          {activeTab === 'total' && row.trend === 'same' && <span className="text-slate-600 text-[8px] sm:text-[10px] ml-0.5 sm:ml-1">▶</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-3.5 w-full max-w-[120px] sm:max-w-none">
                      <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
                        {(() => {
                          const trophyCount = (row.name.match(/🏆/g) || []).length;
                          const cleanName = row.name.replace(/🏆/g, '').trim();
                          return ( <><span className="text-slate-200 font-semibold truncate whitespace-nowrap flex-shrink" title={cleanName}>{cleanName}</span>{trophyCount > 0 && <span className="flex-shrink-0 text-amber-400 text-[10px] sm:text-xs tracking-widest whitespace-nowrap">{'🏆'.repeat(trophyCount)}</span>}</> );
                        })()}
                        {row.liveExtra > 0 && activeTab === 'total' && adminStatus === 'LIVE' && <span className="bg-emerald-950/80 text-emerald-400 text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse flex-shrink-0">+{row.liveExtra} CANLI</span>}
                        {row.liveExtra > 0 && activeTab !== 'total' && <span className={`text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md border shadow-sm flex-shrink-0 ${adminStatus === 'LIVE' ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse' : 'bg-cyan-950/80 text-cyan-400 border-cyan-500/50'}`}>+{row.liveExtra} {adminStatus === 'LIVE' ? 'CANLI' : '(MAÇ)'}</span>}
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-3.5 text-right whitespace-nowrap pr-4 sm:pr-8">
                      <span
                        className="text-white font-black text-base sm:text-xl tracking-wider"
                        style={{ textShadow: '0 0 10px rgba(239,68,68,1), 0 0 20px rgba(220,38,38,0.9), 0 0 30px rgba(153,27,27,0.8)' }}
                      >
                        {row.puan}
                      </span>
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