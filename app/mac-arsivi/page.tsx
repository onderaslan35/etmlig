"use client";

import React, { useState } from "react";

// 1. HAFTA MAÇ VERİLERİ (EKSİKSİZ 24 MAÇ)
const week1Matches = [
  {
    id: 1,
    weekLabel: "1. Hafta - 1. MAÇ",
    category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME",
    date: "21.07.2026",
    time: "20:00",
    homeTeam: "IBERIA 1999",
    awayTeam: "SLOVAN BRATISLAVA",
    score: "0 - 2",
    winnersCount: 13,
    earnedPoints: 1,
    winners: ["MUSTAFA GÜMÜŞÇÜ", "CUMALİ SÖKER", "SEDAT SEDAT", "ÖNDER ASLAN", "FATİH AYAN", "MEHMET ALİ KARA", "İSMAİL EKER", "HUDAVER TOPARDIC", "MURAT ALİ", "SAVAŞ ÇAĞLAYAN", "MUSTAFA ELMAS", "UĞUR GÜRBÜZ", "R. İLHAN KARACA"]
  },
  {
    id: 2,
    weekLabel: "1. Hafta - 2. MAÇ",
    category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME",
    date: "21.07.2026",
    time: "21:00",
    homeTeam: "SABAH FK",
    awayTeam: "KUPS",
    score: "1 - 0",
    winnersCount: 2,
    earnedPoints: 6,
    winners: ["EYÜP KARACAOĞLU", "ÖNDER ASLAN"]
  },
  {
    id: 3,
    weekLabel: "1. Hafta - 3. MAÇ",
    category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME",
    date: "22.07.2026",
    time: "20:30",
    homeTeam: "FENERBAHÇE",
    awayTeam: "GORNİK ZABRZE",
    score: "1 - 0",
    winnersCount: 0,
    earnedPoints: 0,
    winners: []
  },
  {
    id: 4,
    weekLabel: "1. Hafta - 4. MAÇ",
    category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME",
    date: "22.07.2026",
    time: "21:45",
    homeTeam: "THUN",
    awayTeam: "DINAMO ZAGREB",
    score: "1 - 1",
    winnersCount: 9,
    earnedPoints: 1,
    winners: ["FATİH AYAN", "MEHMET ALİ KARA", "İSMAİL EKER", "ÖNDER ASLAN", "HUDAVER TOPARDIC", "MURAT ALİ", "SAVAŞ ÇAĞLAYAN", "MUSTAFA ELMAS", "UĞUR GÜRBÜZ"]
  },
  {
    id: 5,
    weekLabel: "1. Hafta - 5. MAÇ",
    category: "UEFA KONFERANS LİGİ ÖN ELEME",
    date: "23.07.2026",
    time: "19:00",
    homeTeam: "STURM GRAZ",
    awayTeam: "HEART",
    score: "4 - 0",
    winnersCount: 2,
    earnedPoints: 6,
    winners: ["CUMALİ SÖKER", "SEDAT SEDAT"]
  },
  {
    id: 6,
    weekLabel: "1. Hafta - 6. MAÇ",
    category: "UEFA KONFERANS LİGİ ÖN ELEME",
    date: "23.07.2026",
    time: "20:00",
    homeTeam: "LARNE FC",
    awayTeam: "KIZILYILDIZ",
    score: "0 - 4",
    winnersCount: 1,
    earnedPoints: 12,
    winners: ["DOĞAÇ ALKAN"]
  },
  {
    id: 7,
    weekLabel: "1. Hafta - 7. MAÇ",
    category: "UEFA AVRUPA LİGİ ÖN ELEME",
    date: "23.07.2026",
    time: "20:30",
    homeTeam: "GOTEBORG",
    awayTeam: "LEVADIA FC",
    score: "1 - 2",
    winnersCount: 2,
    earnedPoints: 6,
    winners: ["RIDVAN DOGER", "ÖNDER IŞIK"]
  },
  {
    id: 8,
    weekLabel: "1. Hafta - 8. MAÇ",
    category: "UEFA KONFERANS LİGİ ÖN ELEME",
    date: "23.07.2026",
    time: "21:00",
    homeTeam: "LEVSKI SOFYA",
    awayTeam: "UNIVERSITATEA CRAIOVA",
    score: "1 - 0",
    winnersCount: 4,
    earnedPoints: 4,
    winners: ["ABDULLAH DİK", "ŞAHİN GEZGİNCİ", "ÖNDER ASLAN", "HUDAVER TOPARDIC"]
  },
  {
    id: 9,
    weekLabel: "1. Hafta - 9. MAÇ",
    category: "UEFA KONFERANS LİGİ ÖN ELEME",
    date: "23.07.2026",
    time: "21:15",
    homeTeam: "POLISSYA",
    awayTeam: "KOPENAG",
    score: "0 - 3",
    winnersCount: 1,
    earnedPoints: 12,
    winners: ["SALİH KARACAOĞLU"]
  },
  {
    id: 10,
    weekLabel: "1. Hafta - 10. MAÇ",
    category: "UEFA KONFERANS LİGİ ÖN ELEME",
    date: "23.07.2026",
    time: "21:30",
    homeTeam: "SANTA COLOMA FC",
    awayTeam: "RAPID WIEN",
    score: "1 - 2",
    winnersCount: 3,
    earnedPoints: 5,
    winners: ["CUMALİ SÖKER", "MEHMET ALİ KARA", "ÖNDER ASLAN"]
  },
  {
    id: 11,
    weekLabel: "1. Hafta - 11. MAÇ",
    category: "UEFA KONFERANS LİGİ ÖN ELEME",
    date: "23.07.2026",
    time: "21:30",
    homeTeam: "FCSB",
    awayTeam: "AUDA RIGA",
    score: "2 - 1",
    winnersCount: 5,
    earnedPoints: 3,
    winners: ["MUSTAFA GÜMÜŞÇÜ", "İSMAİL EKER", "HUDAVER TOPARDIC", "SAVAŞ ÇAĞLAYAN", "MUSTAFA ELMAS"]
  },
  {
    id: 12,
    weekLabel: "1. Hafta - 12. MAÇ",
    category: "UEFA KONFERANS LİGİ ÖN ELEME",
    date: "23.07.2026",
    time: "21:45",
    homeTeam: "BAŞAKŞEHİR",
    awayTeam: "INTER TURKU",
    score: "1 - 1",
    winnersCount: 4,
    earnedPoints: 4,
    winners: ["FATİH AYAN", "MURAT ALİ", "UĞUR GÜRBÜZ", "R. İLHAN KARACA"]
  },
  {
    id: 13,
    weekLabel: "1. Hafta - 13. MAÇ",
    category: "UEFA KONFERANS LİGİ ÖN ELEME",
    date: "23.07.2026",
    time: "22:00",
    homeTeam: "UNIVERSITATEA CLUJ",
    awayTeam: "BRANN",
    score: "0 - 0",
    winnersCount: 2,
    earnedPoints: 6,
    winners: ["EYÜP KARACAOĞLU", "SEDAT SEDAT"]
  },
  {
    id: 14,
    weekLabel: "1. Hafta - 14. MAÇ",
    category: "UEFA KONFERANS LİGİ ÖN ELEME",
    date: "23.07.2026",
    time: "22:00",
    homeTeam: "VOJVODINA",
    awayTeam: "AJAX",
    score: "1 - 3",
    winnersCount: 2,
    earnedPoints: 6,
    winners: ["DOĞAÇ ALKAN", "ÖNDER ASLAN"]
  },
  {
    id: 15,
    weekLabel: "1. Hafta - 15. MAÇ",
    category: "UEFA KONFERANS LİGİ ÖN ELEME",
    date: "23.07.2026",
    time: "22:00",
    homeTeam: "PAKSI FC",
    awayTeam: "PANATHINAIKOS",
    score: "0 - 2",
    winnersCount: 3,
    earnedPoints: 5,
    winners: ["RIDVAN DOGER", "ÖNDER IŞIK", "ABDULLAH DİK"]
  },
  {
    id: 16,
    weekLabel: "1. Hafta - 16. MAÇ",
    category: "UEFA AVRUPA LİGİ ÖN ELEME",
    date: "23.07.2026",
    time: "22:00",
    homeTeam: "ZELEZNICAR PANCEVO",
    awayTeam: "BRAGA",
    score: "0 - 1",
    winnersCount: 1,
    earnedPoints: 12,
    winners: ["ŞAHİN GEZGİNCİ"]
  },
  {
    id: 17,
    weekLabel: "1. Hafta - 17. MAÇ",
    category: "UEFA AVRUPA LİGİ ÖN ELEME",
    date: "23.07.2026",
    time: "22:00",
    homeTeam: "BEŞİKTAŞ",
    awayTeam: "MIDTJYLLAND",
    score: "2 - 1",
    winnersCount: 6,
    earnedPoints: 2,
    winners: ["MUSTAFA GÜMÜŞÇÜ", "CUMALİ SÖKER", "SEDAT SEDAT", "FATİH AYAN", "MEHMET ALİ KARA", "İSMAİL EKER"]
  },
  {
    id: 18,
    weekLabel: "1. Hafta - 18. MAÇ",
    category: "UEFA AVRUPA LİGİ ÖN ELEME",
    date: "23.07.2026",
    time: "22:00",
    homeTeam: "HAJDUK SPLIT",
    awayTeam: "PATOS",
    score: "3 - 0",
    winnersCount: 2,
    earnedPoints: 6,
    winners: ["HUDAVER TOPARDIC", "MURAT ALİ"]
  },
  {
    id: 19,
    weekLabel: "1. Hafta - 19. MAÇ",
    category: "UEFA AVRUPA LİGİ ÖN ELEME",
    date: "23.07.2026",
    time: "22:00",
    homeTeam: "DINAMO KIEV",
    awayTeam: "PAOK",
    score: "1 - 1",
    winnersCount: 8,
    earnedPoints: 1,
    winners: ["SAVAŞ ÇAĞLAYAN", "MUSTAFA ELMAS", "UĞUR GÜRBÜZ", "R. İLHAN KARACA", "EYÜP KARACAOĞLU", "DOĞAÇ ALKAN", "RIDVAN DOGER", "ÖNDER IŞIK"]
  },
  {
    id: 20,
    weekLabel: "1. Hafta - 20. MAÇ",
    category: "UEFA AVRUPA LİGİ ÖN ELEME",
    date: "23.07.2026",
    time: "22:00",
    homeTeam: "KARABAĞ FK",
    awayTeam: "CSKA SOFYA",
    score: "2 - 0",
    winnersCount: 4,
    earnedPoints: 4,
    winners: ["ABDULLAH DİK", "ŞAHİN GEZGİNCİ", "SALİH KARACAOĞLU", "MUSTAFA GÜMÜŞÇÜ"]
  },
  {
    id: 21,
    weekLabel: "1. Hafta - 21. MAÇ",
    category: "UEFA AVRUPA LİGİ ÖN ELEME",
    date: "23.07.2026",
    time: "22:00",
    homeTeam: "HAMMARBY",
    awayTeam: "ANDERLECHT",
    score: "1 - 0",
    winnersCount: 1,
    earnedPoints: 12,
    winners: ["CUMALİ SÖKER"]
  },
  {
    id: 22,
    weekLabel: "1. Hafta - 22. MAÇ",
    category: "UEFA AVRUPA LİGİ ÖN ELEME",
    date: "23.07.2026",
    time: "22:00",
    homeTeam: "TWENTE",
    awayTeam: "FERENCVAROS",
    score: "1 - 2",
    winnersCount: 2,
    earnedPoints: 6,
    winners: ["SEDAT SEDAT", "ÖNDER ASLAN"]
  },
  {
    id: 23,
    weekLabel: "1. Hafta - 23. MAÇ",
    category: "UEFA AVRUPA LİGİ ÖN ELEME",
    date: "23.07.2026",
    time: "22:00",
    homeTeam: "ST GALLEN",
    awayTeam: "BENFICA",
    score: "0 - 4",
    winnersCount: 1,
    earnedPoints: 12,
    winners: ["FATİH AYAN"]
  },
  {
    id: 24,
    weekLabel: "1. Hafta - 24. MAÇ",
    category: "UEFA AVRUPA LİGİ ÖN ELEME",
    date: "23.07.2026",
    time: "22:00",
    homeTeam: "SPARTAK TRNAVA",
    awayTeam: "CSKA 1948",
    score: "2 - 0",
    winnersCount: 3,
    earnedPoints: 5,
    winners: ["MEHMET ALİ KARA", "İSMAİL EKER", "HUDAVER TOPARDIC"]
  }
];

// 2. HAFTA MAÇ VERİLERİ (EKSİKSİZ 24 MAÇ)
const week2Matches = [
  {
    id: 1,
    weekLabel: "2. Hafta - 1. MAÇ",
    category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "28.07.2026",
    time: "18:00",
    homeTeam: "KUPS",
    awayTeam: "SABAH FK",
    score: "0 - 2",
    winnersCount: 3,
    earnedPoints: 5,
    winners: ["MUSTAFA GÜMÜŞÇÜ", "CUMALİ SÖKER", "SEDAT SEDAT"]
  },
  {
    id: 2,
    weekLabel: "2. Hafta - 2. MAÇ",
    category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "28.07.2026",
    time: "20:30",
    homeTeam: "DINAMO ZAGREB",
    awayTeam: "THUN",
    score: "3 - 2",
    winnersCount: 0,
    earnedPoints: 0,
    winners: []
  },
  {
    id: 3,
    weekLabel: "2. Hafta - 3. MAÇ",
    category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "28.07.2026",
    time: "21:00",
    homeTeam: "HEART",
    awayTeam: "STURM GRAZ",
    score: "0 - 2",
    winnersCount: 0,
    earnedPoints: 0,
    winners: []
  },
  {
    id: 4,
    weekLabel: "2. Hafta - 4. MAÇ",
    category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "28.07.2026",
    time: "21:45",
    homeTeam: "CSKA 1948",
    awayTeam: "SPARTAK TRNAVA",
    score: "0 - 0",
    winnersCount: 0,
    earnedPoints: 0,
    winners: []
  },
  {
    id: 5,
    weekLabel: "2. Hafta - 5. MAÇ",
    category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "29.07.2026",
    time: "20:00",
    homeTeam: "UNIVERSITATEA CRAIOVA",
    awayTeam: "LEVSKI SOFYA",
    score: "2 - 2",
    winnersCount: 1,
    earnedPoints: 12,
    winners: ["DOĞAÇ ALKAN"]
  },
  {
    id: 6,
    weekLabel: "2. Hafta - 6. MAÇ",
    category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "29.07.2026",
    time: "20:30",
    homeTeam: "KIZILYILDIZ",
    awayTeam: "LARNE FC",
    score: "5 - 0",
    winnersCount: 0,
    earnedPoints: 0,
    winners: []
  },
  {
    id: 7,
    weekLabel: "2. Hafta - 7. MAÇ",
    category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "29.07.2026",
    time: "21:00",
    homeTeam: "GORNİK ZABRZE",
    awayTeam: "FENERBAHÇE",
    score: "1 - 1",
    winnersCount: 9,
    earnedPoints: 1,
    winners: [
      "FATİH AYAN",
      "MEHMET ALİ KARA",
      "İSMAİL EKER",
      "ÖNDER ASLAN",
      "HUDAVER TOPARDIC",
      "MURAT ALİ",
      "SAVAŞ ÇAĞLAYAN",
      "MUSTAFA ELMAS",
      "UĞUR GÜRBÜZ"
    ]
  },
  {
    id: 8,
    weekLabel: "2. Hafta - 8. MAÇ",
    category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "29.07.2026",
    time: "21:00",
    homeTeam: "SLOVAN BRATISLAVA",
    awayTeam: "IBERIA 1999",
    score: "1 - 1",
    winnersCount: 3,
    earnedPoints: 5,
    winners: ["CUMALİ SÖKER", "EYÜP KARACAOĞLU", "ŞAHİN GEZGİNCİ"]
  },
  {
    id: 9,
    weekLabel: "2. Hafta - 9. MAÇ",
    category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "29.07.2026",
    time: "21:15",
    homeTeam: "KOPENAG",
    awayTeam: "POLISSYA",
    score: "2 - 1",
    winnersCount: 6,
    earnedPoints: 2,
    winners: [
      "B. VEYSELOĞLU EROL",
      "ABDULLAH DİK",
      "ŞAHİN GEZGİNCİ",
      "ÖNDER ASLAN",
      "HUDAVER TOPARDIC",
      "ŞEMSETTİN DÜGER"
    ]
  },
  {
    id: 10,
    weekLabel: "2. Hafta - 10. MAÇ",
    category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "29.07.2026",
    time: "21:30",
    homeTeam: "RAPID WIEN",
    awayTeam: "SANTA COLOMA FC",
    score: "6 - 2",
    winnersCount: 0,
    earnedPoints: 0,
    winners: []
  },
  {
    id: 11,
    weekLabel: "2. Hafta - 11. MAÇ",
    category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "30.07.2026",
    time: "19:00",
    homeTeam: "AUDA RIGA",
    awayTeam: "FCSB",
    score: "4 - 1",
    winnersCount: 0,
    earnedPoints: 0,
    winners: []
  },
  {
    id: 12,
    weekLabel: "2. Hafta - 12. MAÇ",
    category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "30.07.2026",
    time: "19:00",
    homeTeam: "INTER TURKU",
    awayTeam: "BAŞAKŞEHİR",
    score: "2 - 0",
    winnersCount: 2,
    earnedPoints: 6,
    winners: ["EYÜP KARACAOĞLU", "ÖNDER ASLAN"]
  },
  {
    id: 13,
    weekLabel: "2. Hafta - 13. MAÇ",
    category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "30.07.2026",
    time: "19:30",
    homeTeam: "LEVADIA FC",
    awayTeam: "GOTEBORG",
    score: "0 - 1",
    winnersCount: 6,
    earnedPoints: 2,
    winners: [
      "RIDVAN DOGER",
      "ÖNDER IŞIK",
      "MURAT KARA",
      "CEMALETTİN BELLİ",
      "İSMAİL EKER",
      "ÖNDER ASLAN"
    ]
  },
  {
    id: 14,
    weekLabel: "2. Hafta - 14. MAÇ",
    category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "30.07.2026",
    time: "21:30",
    homeTeam: "BRANN",
    awayTeam: "UNIVERSITATEA CLUJ",
    score: "3 - 1",
    winnersCount: 1,
    earnedPoints: 12,
    winners: ["CEMAL SİVRİKAYA"]
  },
  {
    id: 15,
    weekLabel: "2. Hafta - 15. MAÇ",
    category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "30.07.2026",
    time: "21:00",
    homeTeam: "AJAX",
    awayTeam: "VOJVODINA",
    score: "4 - 1",
    winnersCount: 0,
    earnedPoints: 0,
    winners: []
  },
  {
    id: 16,
    weekLabel: "2. Hafta - 16. MAÇ",
    category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "30.07.2026",
    time: "20:00",
    homeTeam: "PANATHINAIKOS",
    awayTeam: "PAKSI FC",
    score: "2 - 2",
    winnersCount: 3,
    earnedPoints: 5,
    winners: ["AHMET BİRCAN", "MEVLÜT EVLER", "EYÜP KARACAOĞLU"]
  },
  {
    id: 17,
    weekLabel: "2. Hafta - 17. MAÇ",
    category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "30.07.2026",
    time: "20:00",
    homeTeam: "BRAGA",
    awayTeam: "ZELEZNICAR PANCEVO",
    score: "4 - 0",
    winnersCount: 0,
    earnedPoints: 0,
    winners: []
  },
  {
    id: 18,
    weekLabel: "2. Hafta - 18. MAÇ",
    category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "30.07.2026",
    time: "20:00",
    homeTeam: "MIDTJYLLAND",
    awayTeam: "BEŞİKTAŞ",
    score: "0 - 2",
    winnersCount: 2,
    earnedPoints: 6,
    winners: ["R. İLHAN KARACA", "HUDAVER TOPARDIC"]
  },
  {
    id: 19,
    weekLabel: "2. Hafta - 19. MAÇ",
    category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "30.07.2026",
    time: "20:45",
    homeTeam: "PATOS",
    awayTeam: "HAJDUK SPLIT",
    score: "2 - 0",
    winnersCount: 2,
    earnedPoints: 6,
    winners: ["ŞENOL CAN ÇAKICI", "MURAT ALİ"]
  },
  {
    id: 20,
    weekLabel: "2. Hafta - 20. MAÇ",
    category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "30.07.2026",
    time: "21:00",
    homeTeam: "PAOK",
    awayTeam: "DINAMO KIEV",
    score: "2 - 0",
    winnersCount: 8,
    earnedPoints: 1,
    winners: [
      "CUMALİ SÖKER",
      "MUSTAFA ELMAS",
      "SEDAT SEDAT",
      "OSMAN ALİ AYDIN",
      "DOĞAÇ ALKAN",
      "BİROL DEMİREL",
      "İSMAİL EKER",
      "BAYRAM YILMAZ"
    ]
  },
  {
    id: 21,
    weekLabel: "2. Hafta - 21. MAÇ",
    category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "30.07.2026",
    time: "21:30",
    homeTeam: "CSKA SOFYA",
    awayTeam: "KARABAĞ FK",
    score: "0 - 0",
    winnersCount: 0,
    earnedPoints: 0,
    winners: []
  },
  {
    id: 22,
    weekLabel: "2. Hafta - 22. MAÇ",
    category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "30.07.2026",
    time: "21:30",
    homeTeam: "ANDERLECHT",
    awayTeam: "HAMMARBY",
    score: "3 - 1",
    winnersCount: 7,
    earnedPoints: 1,
    winners: [
      "ULAŞ ADIGÜZEL",
      "CUMALİ SÖKER",
      "MEHMET ALİ KARA",
      "İLYAS KAZDAL",
      "AHMET BİRCAN",
      "MELİH PINAR",
      "SALİH KARACAOĞLU"
    ]
  },
  {
    id: 23,
    weekLabel: "2. Hafta - 23. MAÇ",
    category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "30.07.2026",
    time: "22:00",
    homeTeam: "FERENCVAROS",
    awayTeam: "TWENTE",
    score: "2 - 2",
    winnersCount: 2,
    earnedPoints: 6,
    winners: ["RIDVAN DOGER", "SEDAT DİŞLİ"]
  },
  {
    id: 24,
    weekLabel: "2. Hafta - 24. MAÇ",
    category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    date: "30.07.2026",
    time: "22:00",
    homeTeam: "BENFICA",
    awayTeam: "ST GALLEN",
    score: "5 - 0",
    winnersCount: 1,
    earnedPoints: 12,
    winners: ["SALİH KARACAOĞLU"]
  }
];

// 3. HAFTA MAÇ VERİLERİ (EKSİKSİZ 24 MAÇ)
const week3Matches = [
  {
    id: 1,
    weekLabel: "3. Hafta - 1. MAÇ",
    category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ",
    date: "05.08.2026",
    time: "20:00",
    homeTeam: "OLIMPIYAKOS",
    awayTeam: "NEC NIJMEGEN",
    score: "0 - 0",
    winnersCount: 0,
    earnedPoints: 0,
    winners: []
  },
  {
    id: 2,
    weekLabel: "3. Hafta - 2. MAÇ",
    category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ",
    date: "05.08.2026",
    time: "20:30",
    homeTeam: "SPARTA PRAG",
    awayTeam: "OLIMPIC LYON",
    score: "2 - 1",
    winnersCount: 3,
    earnedPoints: 5,
    winners: ["MUSTAFA ELMAS", "ALİOS GÖZTEPE", "MEVLÜT EVLER"]
  },
  {
    id: 3,
    weekLabel: "3. Hafta - 3. MAÇ",
    category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ",
    date: "05.08.2026",
    time: "21:00",
    homeTeam: "USG",
    awayTeam: "BODO-GLIMT",
    score: "3 - 3",
    winnersCount: 0,
    earnedPoints: 0,
    winners: []
  },
  {
    id: 4,
    weekLabel: "3. Hafta - 4. MAÇ",
    category: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ",
    date: "05.08.2026",
    time: "21:45",
    homeTeam: "FENERBAHÇE",
    awayTeam: "STURM GRAZ",
    score: "2 - 0",
    winnersCount: 8,
    earnedPoints: 1,
    winners: ["HAKAN AYAN", "MUSTAFA GÜMÜŞÇÜ", "İLYAS KAZDAL", "ALİOS GÖZTEPE", "SEDAT DİŞLİ", "KEMAL ERSOY", "AYHAN LUŞOĞLU", "CEMAL SİVRİKAYA"]
  },
  {
    id: 5,
    weekLabel: "3. Hafta - 5. MAÇ",
    category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ",
    date: "06.08.2026",
    time: "19:00",
    homeTeam: "PANATHINAIKOS",
    awayTeam: "CSKA 1948",
    score: "1 - 1",
    winnersCount: 6,
    earnedPoints: 2,
    winners: ["RIDVAN DOGER", "MUSTAFA ELMAS", "FATİH AYAN", "SAVAŞ ÇAĞLAYAN", "DOĞAÇ ALKAN", "R. İLHAN KARACA"]
  },
  {
    id: 6,
    weekLabel: "3. Hafta - 6. MAÇ",
    category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ",
    date: "06.08.2026",
    time: "20:00",
    homeTeam: "PAIDE LINNAMEESKOND",
    awayTeam: "RAPID WIEN",
    score: "1 - 4",
    winnersCount: 2,
    earnedPoints: 6,
    winners: ["ULAŞ ADIGÜZEL", "SEDAT DİŞLİ"]
  },
  {
    id: 7,
    weekLabel: "3. Hafta - 7. MAÇ",
    category: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ",
    date: "06.08.2026",
    time: "20:30",
    homeTeam: "HRADEC KRALOVE",
    awayTeam: "BEŞİKTAŞ",
    score: "0 - 1",
    winnersCount: 7,
    earnedPoints: 1,
    winners: ["BİROL DEMİREL", "HUDAVER TOPARDIC", "OSMAN ALİ AYDIN", "İSMAİL EKER", "SALİH KARACAOĞLU", "YUSUF ERBAY", "UĞUR GÜRBÜZ"]
  },
  {
    id: 8,
    weekLabel: "3. Hafta - 8. MAÇ",
    category: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ",
    date: "06.08.2026",
    time: "20:00",
    homeTeam: "DEBRECEN",
    awayTeam: "KOPENHAG",
    score: "0 - 3",
    winnersCount: 4,
    earnedPoints: 3,
    winners: ["LEVENT YILDIRIM", "SEDAT SEDAT", "CUMALİ SÖKER", "SALİH KARACAOĞLU"]
  },
  {
    id: 9,
    weekLabel: "3. Hafta - 9. MAÇ",
    category: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ",
    date: "06.08.2026",
    time: "21:00",
    homeTeam: "DINAMO KIEV",
    awayTeam: "KARABAĞ FK",
    score: "1 - 0",
    winnersCount: 1,
    earnedPoints: 12,
    winners: ["MUHSİN ASİLKAN"]
  },
  {
    id: 10,
    weekLabel: "3. Hafta - 10. MAÇ",
    category: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ",
    date: "06.08.2026",
    time: "21:00",
    homeTeam: "GOTEBORG",
    awayTeam: "GENT",
    score: "0 - 1",
    winnersCount: 3,
    earnedPoints: 5,
    winners: ["HUDAVER TOPARDIC", "GAZİ AYAN", "YUSUF KIZILTUĞ"]
  },
  {
    id: 11,
    weekLabel: "3. Hafta - 11. MAÇ",
    category: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ",
    date: "06.08.2026",
    time: "21:00",
    homeTeam: "PAOK",
    awayTeam: "ANDERLECHT",
    score: "0 - 1",
    winnersCount: 3,
    earnedPoints: 5,
    winners: ["MUSTAFA GÜMÜŞÇÜ", "İLYAS KAZDAL", "RIDVAN DOĞER"]
  },
  {
    id: 12,
    weekLabel: "3. Hafta - 12. MAÇ",
    category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ",
    date: "06.08.2026",
    time: "21:30",
    homeTeam: "AJAX",
    awayTeam: "SHELBOURNE",
    score: "2 - 0",
    winnersCount: 4,
    earnedPoints: 3,
    winners: ["MEHMET ALİ KARA", "RIDVAN DOGER", "MURAT KARA", "EYÜP KARACAOĞLU"]
  },
  {
    id: 13,
    weekLabel: "3. Hafta - 13. MAÇ",
    category: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ",
    date: "06.08.2026",
    time: "21:30",
    homeTeam: "BRAGA",
    awayTeam: "DINAMO MINSK",
    score: "1 - 0",
    winnersCount: 1,
    earnedPoints: 12,
    winners: ["SEDAT SEDAT"]
  },
  {
    id: 14,
    weekLabel: "3. Hafta - 14. MAÇ",
    category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ",
    date: "06.08.2026",
    time: "21:45",
    homeTeam: "BENFICA",
    awayTeam: "HEART",
    score: "2 - 0",
    winnersCount: 6,
    earnedPoints: 2,
    winners: ["İLYAS KAZDAL", "ALİ ÖZKÖZTEPE", "SALİH KARACAOĞLU", "ÖNDER IŞIK", "RECEP İLHAN KARACA", "FATİH AYAN"]
  },
  {
    id: 15,
    weekLabel: "3. Hafta - 15. MAÇ",
    category: "TFF 1. LİG",
    date: "07.08.2026",
    time: "20:00",
    homeTeam: "BOLUSPOR",
    awayTeam: "MANİSA FK",
    score: "1 - 2",
    winnersCount: 3,
    earnedPoints: 5,
    winners: ["ULAŞ ADIGÜZEL", "LEVENT YILDIRIM", "ÖNDER ASLAN"]
  },
  {
    id: 16,
    weekLabel: "3. Hafta - 16. MAÇ",
    category: "TFF 1. LİG",
    date: "07.08.2026",
    time: "21:00",
    homeTeam: "BANDIRMASPOR",
    awayTeam: "İSTANBULSPOR",
    score: "3 - 0",
    winnersCount: 0,
    earnedPoints: 0,
    winners: []
  },
  {
    id: 17,
    weekLabel: "3. Hafta - 17. MAÇ",
    category: "TFF 1. LİG",
    date: "08.08.2026",
    time: "19:15",
    homeTeam: "SİVASSPOR",
    awayTeam: "ESENLER EROKSPOR",
    score: "0 - 0",
    winnersCount: 2,
    earnedPoints: 6,
    winners: ["HAKAN AYAN", "GAZİ AYAN"]
  },
  {
    id: 18,
    weekLabel: "3. Hafta - 18. MAÇ",
    category: "TFF 1. LİG",
    date: "08.08.2026",
    time: "21:45",
    homeTeam: "ÜMRANİYESPOR",
    awayTeam: "VANSPOR",
    score: "0 - 0",
    winnersCount: 4,
    earnedPoints: 3,
    winners: ["SEDAT SEDAT", "MUHSİN ASİLKAN", "HAKAN AYAN", "İSMAİL EKER"]
  },
  {
    id: 19,
    weekLabel: "3. Hafta - 19. MAÇ",
    category: "TFF 1. LİG",
    date: "08.08.2026",
    time: "21:45",
    homeTeam: "ANTALYASPOR",
    awayTeam: "KEÇİÖRENGÜCÜ",
    score: "4 - 3",
    winnersCount: 0,
    earnedPoints: 0,
    winners: []
  },
  {
    id: 20,
    weekLabel: "3. Hafta - 20. MAÇ",
    category: "TFF 1. LİG",
    date: "09.08.2026",
    time: "19:00",
    homeTeam: "IĞDIR FK",
    awayTeam: "FATİH KARAGÜMRÜK",
    score: "- : -",
    winnersCount: 0,
    earnedPoints: 0,
    winners: []
  },
  {
    id: 21,
    weekLabel: "3. Hafta - 21. MAÇ",
    category: "TFF 1. LİG",
    date: "09.08.2026",
    time: "19:00",
    homeTeam: "SARIYER",
    awayTeam: "MUĞLASPOR",
    score: "- : -",
    winnersCount: 0,
    earnedPoints: 0,
    winners: []
  },
  {
    id: 22,
    weekLabel: "3. Hafta - 22. MAÇ",
    category: "TFF 1. LİG",
    date: "09.08.2026",
    time: "21:30",
    homeTeam: "BODRUMSPOR",
    awayTeam: "BURSASPOR",
    score: "- : -",
    winnersCount: 0,
    earnedPoints: 0,
    winners: []
  },
  {
    id: 23,
    weekLabel: "3. Hafta - 23. MAÇ",
    category: "TFF 1. LİG",
    date: "09.08.2026",
    time: "21:30",
    homeTeam: "VANSPOR FK",
    awayTeam: "KAYSERİSPOR",
    score: "- : -",
    winnersCount: 0,
    earnedPoints: 0,
    winners: []
  },
  {
    id: 24,
    weekLabel: "3. Hafta - 24. MAÇ",
    category: "TFF 1. LİG",
    date: "10.08.2026",
    time: "21:30",
    homeTeam: "PENDİKSPOR",
    awayTeam: "BATMAN PETROL SPOR",
    score: "- : -",
    winnersCount: 0,
    earnedPoints: 0,
    winners: []
  }
];

export default function MacArsiviPage() {
  const [selectedWeek, setSelectedWeek] = useState<number>(3); // Varsayılan 3. Hafta
  const [openWinnersMap, setOpenWinnersMap] = useState<{ [key: number]: boolean }>({});

  const currentMatches =
    selectedWeek === 1
      ? week1Matches
      : selectedWeek === 2
      ? week2Matches
      : week3Matches;

  const toggleWinners = (matchId: number) => {
    setOpenWinnersMap((prev) => ({
      ...prev,
      [matchId]: !prev[matchId]
    }));
  };

  // KATEGORİYE ÖZEL KURUMSAL RENK FONKSİYONU
  const getCategoryBadgeClass = (category: string) => {
    if (category.includes("ŞAMPİYONLAR LİGİ")) {
      return "text-cyan-400 bg-cyan-950/60 border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]"; // Şampiyonlar Ligi Mavi
    } else if (category.includes("AVRUPA LİGİ")) {
      return "text-orange-400 bg-orange-950/60 border-orange-500/40 shadow-[0_0_10px_rgba(251,146,60,0.2)]"; // Avrupa Ligi Turuncu
    } else if (category.includes("KONFERANS LİGİ")) {
      return "text-emerald-400 bg-emerald-950/60 border-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.2)]"; // Konferans Ligi Yeşil
    }
    return "text-amber-400 bg-amber-950/60 border-amber-500/40";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* ÜST BAŞLIK VE HAFTA SEÇİM BUTONU */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3 border-b border-slate-800 pb-4">
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight flex items-center justify-center sm:justify-start gap-2">
              📂 MAÇ ARŞİVİ & FİKSTÜR
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              {selectedWeek}. Hafta Tamamlanan Karşılaşmalar
            </p>
          </div>

          <div>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg cursor-pointer outline-none transition-all shadow text-xs sm:text-sm"
            >
              <option value={1}>1. HAFTA BÜLTENİ</option>
              <option value={2}>2. HAFTA BÜLTENİ</option>
              <option value={3}>3. HAFTA BÜLTENİ</option>
            </select>
          </div>
        </div>

        {/* MAÇ KARTLARI IZGARASI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentMatches.map((match) => {
            const isWinnersOpen = !!openWinnersMap[match.id];
            const badgeClass = getCategoryBadgeClass(match.category);

            return (
              <div
                key={match.id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between text-center"
              >
                <div>
                  {/* EN TEPEDEKİ BEYAZ NEON PARLAK SİYAH HAFTA ETİKETİ */}
                  <div className="flex justify-center mb-2">
                    <span className="text-[10px] font-extrabold text-white bg-black border border-white/80 px-3 py-0.5 rounded-full uppercase tracking-widest shadow-[0_0_12px_rgba(255,255,255,0.6)]">
                      {match.weekLabel}
                    </span>
                  </div>

                  {/* KATEGORİ BAŞLIĞI */}
                  <div className="flex justify-center mb-1">
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border text-center ${badgeClass}`}
                    >
                      {match.category}
                    </span>
                  </div>

                  {/* TARİH VE SAAT */}
                  <div className="text-[10px] font-semibold text-slate-400 my-1">
                    {match.date} | {match.time}
                  </div>

                  {/* DARALTILMIŞ DAR MAÇ SKOR ALANI */}
                  <div className="flex items-center justify-center gap-2 my-2">
                    {/* EV SAHİBİ */}
                    <div className="flex-1 text-right">
                      <span className="text-xs sm:text-sm font-bold text-slate-100 leading-tight block break-words">
                        {match.homeTeam}
                      </span>
                    </div>

                    {/* DAR SKOR KUTUSU */}
                    <div className="shrink-0">
                      <div className="bg-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm px-2.5 py-1 rounded-md shadow-sm whitespace-nowrap">
                        {match.score}
                      </div>
                    </div>

                    {/* DEPLASMAN */}
                    <div className="flex-1 text-left">
                      <span className="text-xs sm:text-sm font-bold text-slate-100 leading-tight block break-words">
                        {match.awayTeam}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ALT ALAN */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-col justify-between items-stretch">
                  <div className="flex justify-between items-center w-full">
                    {/* SOL ALT: BİLEN KİŞİ BİLGİSİ */}
                    <div className="text-left flex-1">
                      {match.winnersCount === 0 ? (
                        <span className="text-xs font-medium text-slate-400 italic">
                          Bu maçı bilen yok
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-300">
                          <strong className="text-amber-400">{match.winnersCount} kişi</strong> bildi
                          {match.earnedPoints > 0 && (
                            <span className="text-slate-400"> ({match.earnedPoints} Puan)</span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* EN ORTA ALT: DFO ETİKETİ */}
                    <div className="flex-0 text-center px-2">
                      <span className="text-[10px] font-black text-amber-400/90 tracking-widest bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
                        DFO
                      </span>
                    </div>

                    {/* SAĞ ALT: BUTON */}
                    <div className="text-right flex-1">
                      {match.winnersCount > 0 && (
                        <button
                          onClick={() => toggleWinners(match.id)}
                          className="text-amber-400 hover:text-amber-300 transition-colors font-medium text-xs outline-none"
                        >
                          {isWinnersOpen
                            ? "Gizle ▲"
                            : match.winnersCount === 1
                            ? "Puan alanı gör →"
                            : "Puan alanları gör →"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* BİLEN YARIŞMACILAR LİSTESİ */}
                  {isWinnersOpen && match.winnersCount > 0 && (
                    <div className="w-full mt-2.5 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs animate-fadeIn">
                      <div className="text-slate-400 font-semibold mb-1.5 border-b border-slate-800 pb-1 flex justify-between items-center text-[11px]">
                        <span>
                          {match.winnersCount === 1 ? "BİLEN YARIŞMACI" : "BİLEN YARIŞMACILAR"}
                        </span>
                        <span className="text-amber-400">
                          Kişi Başı: {match.earnedPoints} Puan
                        </span>
                      </div>

                      <div className="flex flex-wrap justify-center gap-1 mt-1.5">
                        {match.winners.map((winner, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-800 text-slate-200 border border-slate-700/80 px-2 py-0.5 rounded text-[10px] sm:text-[11px]"
                          >
                            {winner}
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
      </div>
    </div>
  );
}