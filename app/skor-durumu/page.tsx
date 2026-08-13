'use client';
import React, { useState, useEffect } from 'react';
import LiveMatchCard from '@/components/LiveMatchCard';
import { supabase } from '@/utils/supabase'; 

const allPlayersMasterList: Record<string, string> = {
  "262756": "EYÜP KARACAOĞLU", "262755": "DOĞAÇ ALKAN", "262816": "SEDAT SEDAT", "262736": "MEHMET ALİ KARA", "262786": "SEDAT DİŞLİ", "262733": "MUHSİN ASİLKAN", "262728": "ÖNDER ASLAN", "262726": "HUDAVER TOPARDIC", "262709": "SALİH KARACAOĞLU", "262719": "UĞUR VARDAR", "262754": "OSMAN ALİ AYDIN 🏆", "262771": "ULAŞ ADIGÜZEL", "262721": "MUSTAFA GÜMÜŞÇÜ", "262790": "CUMALİ SÖKER", "262717": "MURAT ALİ", "262732": "R. İLHAN KARACA 🏆🏆", "262711": "RIDVAN DOGER", "262731": "FATİH AYAN", "262772": "CEMAL SİVRİKAYA 🏆", "262763": "MUSTAFA ELMAS", "262707": "HAKAN AYAN", "262706": "GAZİ AYAN 🏆🏆", "262813": "KEMAL ERSOY", "262774": "ŞENOL CAN ÇAKICI", "262747": "SAVAŞ ÇAĞLAYAN", "262705": "AHMET BİRCAN 🏆", "262714": "İSMAİL EKER 🏆", "262740": "ABDULLAH DİK", "262702": "MURAT KARA", "262738": "MEVLÜT EVLER", "262753": "YUSUF KIZILTUĞ", "262716": "BİROL DEMİREL", "262750": "MAHMUT CBR", "262734": "LEVENT YILDIRIM", "262725": "İLYAS KAZDAL", "262737": "ŞAHİN GEZGİNCİ", "351925": "ALİOS GÖZTEPE", "262730": "ÖNDER IŞIK", "262782": "YUSUF ERBAY", "262749": "B.VEYSELOĞLU EROL", "262718": "BEKİR KARADAĞ", "262715": "ŞEMSETTİN DÜGER", "262739": "UĞUR GÜRBÜZ", "262703": "CEMALETTİN BELLİ", "262758": "MELİH PINAR", "262770": "OZKAYA MAZAKALI BAYRAM", "262708": "BAYRAM YILMAZ", "262787": "MUSTAFA TUCİ", "262744": "İLYAS UYGUN", "262712": "MURAT AYDEMİR", "262704": "YAPAY ZEKA", "262723": "AYHAN LUŞOĞLU"
};

// 1. ve 2. Haftalarda DFO = Master. TFF = 0.
const w1Skor: Record<string, number> = { "262756": 4, "262755": 6, "262719": 4, "262736": 4, "262754": 4, "262786": 3, "262731": 3, "262717": 3, "262732": 4, "262726": 3, "262750": 2, "262747": 3, "262771": 2, "262728": 2, "262816": 2, "262716": 2, "262790": 2, "262733": 2, "262709": 1, "262753": 2, "262813": 2, "262740": 1, "262718": 3, "262707": 1, "262782": 1, "262702": 1, "262714": 1, "262721": 1, "262706": 1, "262787": 1, "262744": 1, "262774": 1, "262715": 1, "262723": 1 };
const w2Skor: Record<string, number> = { "262756": 3, "262755": 2, "262709": 2, "262790": 4, "262772": 1, "262728": 4, "262726": 3, "262711": 2, "262717": 2, "262737": 2, "262705": 2, "262816": 2, "262774": 1, "262732": 1, "262786": 1, "262721": 1, "262738": 1, "262714": 3, "262763": 2, "262736": 2, "262740": 1, "262702": 1, "262703": 1, "262730": 1, "262715": 1, "262749": 1, "262725": 1, "262758": 1, "262771": 1, "262754": 1, "262747": 1, "262716": 1, "262708": 1, "262731": 1, "262739": 1 };
const w3DfoSkor: Record<string, number> = { "262816": 2, "262733": 1, "262786": 3, "262725": 3, "262738": 2, "262763": 2, "262711": 2, "262721": 2, "351925": 2, "262726": 2, "262771": 1, "262709": 2, "262706": 1, "262753": 1, "262734": 1, "262730": 1, "262774": 1, "262740": 1, "262755": 1, "262732": 1, "262731": 1, "262747": 1, "262707": 1, "262754": 1, "262714": 1, "262782": 1, "262813": 1, "262723": 1, "262772": 1, "262739": 1, "262716": 1 };
const w3TffSkor: Record<string, number> = { "262707": 2, "262816": 3, "262733": 2, "262754": 3, "262728": 2, "262706": 1, "262755": 1, "262736": 1, "262771": 1, "262734": 1, "262705": 2, "262714": 1, "262763": 1, "262774": 1, "262740": 1, "262756": 1, "262782": 2, "262702": 2, "262813": 1, "262723": 1, "262749": 1, "262721": 1, "351925": 1, "262730": 1, "262772": 1, "262739": 1, "262770": 1 };

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

export default function SkorDurumuPage() {
  const [activeTab, setActiveTab] = useState<string>('master'); // 'master', 'dfo', 'tff'
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [adminStatus, setAdminStatus] = useState<string>('NOT_STARTED');

  const loadLeaderboard = async () => {
    try {
      const { data: dbMatches } = await supabase.from('live_matches').select('*');
      
      let w4MasterBase: Record<string, number> = {}; let w4MasterLive: Record<string, number> = {};
      let w4DfoBase: Record<string, number> = {}; let w4DfoLive: Record<string, number> = {};
      let w4TffBase: Record<string, number> = {}; let w4TffLive: Record<string, number> = {};
      let isAnyMatchLive = false;

      Object.keys(allPlayersMasterList).forEach(id => { 
        w4MasterBase[id] = 0; w4MasterLive[id] = 0;
        w4DfoBase[id] = 0; w4DfoLive[id] = 0;
        w4TffBase[id] = 0; w4TffLive[id] = 0;
      });

      if (dbMatches) {
        // 🔴 EKMEL ÇELİK SÜZGECİ 🔴
        const uniqueMatches: Record<number, any> = {};
        dbMatches.forEach(row => { uniqueMatches[row.id] = row; });

        Object.values(uniqueMatches).forEach(dbMatch => {
          if (dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-' && dbMatch.status !== 'NOT_STARTED') {
            const matchIndex = dbMatch.id - 1; 
            const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`;
            const isTff = isTffMatchCheck(week4Matches[matchIndex].category);
            
            Object.keys(week4PredictionsData).forEach(id => {
              if (week4PredictionsData[id][matchIndex] === targetScore) {
                if (dbMatch.status === 'FINISHED') {
                  w4MasterBase[id] += 1;
                  if (isTff) w4TffBase[id] += 1; else w4DfoBase[id] += 1;
                } else {
                  w4MasterLive[id] += 1;
                  if (isTff) w4TffLive[id] += 1; else w4DfoLive[id] += 1;
                  isAnyMatchLive = true;
                }
              }
            });
          }
        });
      }
      setAdminStatus(isAnyMatchLive ? 'LIVE' : 'NOT_STARTED');

      const baseList = Object.keys(allPlayersMasterList).map(id => {
        let baseSkor = 0; let liveSkor = 0;
        if (activeTab === 'master') {
          baseSkor = (w1Skor[id]||0) + (w2Skor[id]||0) + (w3DfoSkor[id]||0) + (w3TffSkor[id]||0) + w4MasterBase[id];
          liveSkor = w4MasterLive[id];
        } else if (activeTab === 'dfo') {
          baseSkor = (w1Skor[id]||0) + (w2Skor[id]||0) + (w3DfoSkor[id]||0) + w4DfoBase[id];
          liveSkor = w4DfoLive[id];
        } else if (activeTab === 'tff') {
          baseSkor = (w3TffSkor[id]||0) + w4TffBase[id];
          liveSkor = w4TffLive[id];
        }
        
        return { id, name: allPlayersMasterList[id], skor: baseSkor + liveSkor, liveExtra: liveSkor };
      }).sort((a, b) => b.skor - a.skor || a.name.localeCompare(b.name, 'tr'));

      const finalRows = baseList.map((player, index) => ({ ...player, currentRank: index + 1 }));
      setTableRows(finalRows);

    } catch (e) {}
  };

  useEffect(() => { loadLeaderboard(); const interval = setInterval(loadLeaderboard, 5000); return () => clearInterval(interval); }, [activeTab]);

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-5 mt-1"><h1 className="text-xl md:text-2xl font-extrabold text-center text-amber-500 tracking-wider uppercase drop-shadow-md">GÜNCEL SKOR TABLOSU (ANALİZ MERKEZİ)</h1></div>
      <div className="w-full mb-6"><LiveMatchCard /></div>
      
      <div className="w-full flex justify-center mb-6">
        <div className="flex bg-slate-900 border border-slate-700 rounded-xl overflow-hidden p-1 gap-1">
          <button onClick={() => setActiveTab('master')} className={`px-6 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${activeTab === 'master' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'}`}>MASTER SKOR</button>
          <button onClick={() => setActiveTab('dfo')} className={`px-6 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${activeTab === 'dfo' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>DFO SKOR</button>
          <button onClick={() => setActiveTab('tff')} className={`px-6 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${activeTab === 'tff' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>TFF SKOR</button>
        </div>
      </div>

      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {tableRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] sm:text-xs border-b border-slate-800">
                <tr><th className="px-2 sm:px-6 py-3 sm:py-3.5 w-12 sm:w-24 text-center">SIRA</th><th className="px-2 sm:px-6 py-3 sm:py-3.5">YARIŞMACI</th><th className="px-2 sm:px-6 py-3 sm:py-3.5 text-right whitespace-nowrap">DOĞRU SKOR</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tableRows.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-2 sm:px-6 py-3 sm:py-3.5 text-center font-medium text-slate-300">{row.currentRank}</td>
                    <td className="px-2 sm:px-6 py-3 sm:py-3.5 w-full">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {(() => {
                          const trophyCount = (row.name.match(/🏆/g) || []).length;
                          const cleanName = row.name.replace(/🏆/g, '').trim();
                          return ( <><span className="text-slate-200 font-semibold truncate flex-shrink" title={cleanName}>{cleanName}</span>{trophyCount > 0 && <span className="flex-shrink-0 text-amber-400 text-[10px] sm:text-xs tracking-widest whitespace-nowrap">{'🏆'.repeat(trophyCount)}</span>}</> );
                        })()}
                        {row.liveExtra > 0 && adminStatus === 'LIVE' && <span className="bg-emerald-950/80 text-emerald-400 text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md border border-emerald-500/50 animate-pulse flex-shrink-0">+{row.liveExtra} CANLI</span>}
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-3.5 text-right font-bold text-sm sm:text-base text-amber-400">{row.skor} SKOR</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : ( <div className="py-12 text-center text-slate-500 font-medium text-xs sm:text-sm">⏳ Veriler bulunamadı.</div> )}
      </div>
    </div>
  );
}