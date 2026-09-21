'use client';

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import {
  staticPlayersList,
  parseDateLocal,
  getLocalLogoUrl,
  isTffMatchCheck,
  getEliteTheme,
  getUniqueMatchId
} from '@/utils/themeEngine';

// 1. HAFTA MAÇ VERİLERİ (STATİK DESTEK)
const week1Matches = [
  { id: 1, weekLabel: "1. Hafta - 1. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "21.07.2026", time: "20:00", homeTeam: "IBERIA 1999", awayTeam: "SLOVAN BRATISLAVA", score: "0 - 2", winnersCount: 13, earnedPoints: 1, winners: ["MUSTAFA GÜMÜŞÇÜ", "CUMALİ SÖKER", "SEDAT SEDAT", "ÖNDER ASLAN", "FATİH AYAN", "MEHMET ALİ KARA", "İSMAİL EKER", "HUDAVER TOPARDIC", "MURAT ALİ", "SAVAŞ ÇAĞLAYAN", "MUSTAFA ELMAS", "UĞUR GÜRBÜZ", "R. İLHAN KARACA"] },
  { id: 2, weekLabel: "1. Hafta - 2. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "21.07.2026", time: "21:00", homeTeam: "SABAH FK", awayTeam: "KUPS", score: "1 - 0", winnersCount: 2, earnedPoints: 6, winners: ["EYÜP KARACAOĞLU", "ÖNDER ASLAN"] },
  { id: 3, weekLabel: "1. Hafta - 3. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "22.07.2026", time: "20:30", homeTeam: "FENERBAHÇE", awayTeam: "GORNİK ZABRZE", score: "1 - 0", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 4, weekLabel: "1. Hafta - 4. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "22.07.2026", time: "21:45", homeTeam: "THUN", awayTeam: "DINAMO ZAGREB", score: "1 - 1", winnersCount: 9, earnedPoints: 1, winners: ["FATİH AYAN", "MEHMET ALİ KARA", "İSMAİL EKER", "ÖNDER ASLAN", "HUDAVER TOPARDIC", "MURAT ALİ", "SAVAŞ ÇAĞLAYAN", "MUSTAFA ELMAS", "UĞUR GÜRBÜZ"] },
  { id: 5, weekLabel: "1. Hafta - 5. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "23.07.2026", time: "19:00", homeTeam: "STURM GRAZ", awayTeam: "HEART", score: "4 - 0", winnersCount: 2, earnedPoints: 6, winners: ["CUMALİ SÖKER", "SEDAT SEDAT"] },
  { id: 6, weekLabel: "1. Hafta - 6. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "23.07.2026", time: "20:00", homeTeam: "LARNE FC", awayTeam: "KIZILYILDIZ", score: "0 - 4", winnersCount: 1, earnedPoints: 12, winners: ["DOĞAÇ ALKAN"] },
  { id: 7, weekLabel: "1. Hafta - 7. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "23.07.2026", time: "20:30", homeTeam: "GOTEBORG", awayTeam: "LEVADIA FC", score: "1 - 2", winnersCount: 2, earnedPoints: 6, winners: ["RIDVAN DOGER", "ÖNDER IŞIK"] },
  { id: 8, weekLabel: "1. Hafta - 8. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "23.07.2026", time: "21:00", homeTeam: "LEVSKI SOFYA", awayTeam: "UNIVERSITATEA CRAIOVA", score: "1 - 0", winnersCount: 4, earnedPoints: 4, winners: ["ABDULLAH DİK", "ŞAHİN GEZGİNCİ", "ÖNDER ASLAN", "HUDAVER TOPARDIC"] },
  { id: 9, weekLabel: "1. Hafta - 9. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "23.07.2026", time: "21:15", homeTeam: "POLISSYA", awayTeam: "KOPENAG", score: "0 - 3", winnersCount: 1, earnedPoints: 12, winners: ["SALİH KARACAOĞLU"] },
  { id: 10, weekLabel: "1. Hafta - 10. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "23.07.2026", time: "21:30", homeTeam: "SANTA COLOMA FC", awayTeam: "RAPID WIEN", score: "1 - 2", winnersCount: 3, earnedPoints: 5, winners: ["CUMALİ SÖKER", "MEHMET ALİ KARA", "ÖNDER ASLAN"] },
  { id: 11, weekLabel: "1. Hafta - 11. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "23.07.2026", time: "21:30", homeTeam: "FCSB", awayTeam: "AUDA RIGA", score: "2 - 1", winnersCount: 5, earnedPoints: 3, winners: ["MUSTAFA GÜMÜŞÇÜ", "İSMAİL EKER", "HUDAVER TOPARDIC", "SAVAŞ ÇAĞLAYAN", "MUSTAFA ELMAS"] },
  { id: 12, weekLabel: "1. Hafta - 12. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "23.07.2026", time: "21:45", homeTeam: "BAŞAKŞEHİR", awayTeam: "INTER TURKU", score: "1 - 1", winnersCount: 4, earnedPoints: 4, winners: ["FATİH AYAN", "MURAT ALİ", "UĞUR GÜRBÜZ", "R. İLHAN KARACA"] },
  { id: 13, weekLabel: "1. Hafta - 13. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "23.07.2026", time: "22:00", homeTeam: "UNIVERSITATEA CLUJ", awayTeam: "BRANN", score: "0 - 0", winnersCount: 2, earnedPoints: 6, winners: ["EYÜP KARACAOĞLU", "SEDAT SEDAT"] },
  { id: 14, weekLabel: "1. Hafta - 14. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "23.07.2026", time: "22:00", homeTeam: "VOJVODINA", awayTeam: "AJAX", score: "1 - 3", winnersCount: 2, earnedPoints: 6, winners: ["DOĞAÇ ALKAN", "ÖNDER ASLAN"] },
  { id: 15, weekLabel: "1. Hafta - 15. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "23.07.2026", time: "22:00", homeTeam: "PAKSI FC", awayTeam: "PANATHINAIKOS", score: "0 - 2", winnersCount: 3, earnedPoints: 5, winners: ["RIDVAN DOGER", "ÖNDER IŞIK", "ABDULLAH DİK"] },
  { id: 16, weekLabel: "1. Hafta - 16. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "23.07.2026", time: "22:00", homeTeam: "ZELEZNICAR PANCEVO", awayTeam: "BRAGA", score: "0 - 1", winnersCount: 1, earnedPoints: 12, winners: ["ŞAHİN GEZGİNCİ"] },
  { id: 17, weekLabel: "1. Hafta - 17. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "23.07.2026", time: "22:00", homeTeam: "BEŞİKTAŞ", awayTeam: "MIDTJYLLAND", score: "2 - 1", winnersCount: 6, earnedPoints: 2, winners: ["MUSTAFA GÜMÜŞÇÜ", "CUMALİ SÖKER", "SEDAT SEDAT", "FATİH AYAN", "MEHMET ALİ KARA", "İSMAİL EKER"] },
  { id: 18, weekLabel: "1. Hafta - 18. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "23.07.2026", time: "22:00", homeTeam: "HAJDUK SPLIT", awayTeam: "PATOS", score: "3 - 0", winnersCount: 2, earnedPoints: 6, winners: ["HUDAVER TOPARDIC", "MURAT ALİ"] },
  { id: 19, weekLabel: "1. Hafta - 19. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "23.07.2026", time: "22:00", homeTeam: "DINAMO KIEV", awayTeam: "PAOK", score: "1 - 1", winnersCount: 8, earnedPoints: 1, winners: ["SAVAŞ ÇAĞLAYAN", "MUSTAFA ELMAS", "UĞUR GÜRBÜZ", "R. İLHAN KARACA", "EYÜP KARACAOĞLU", "DOĞAÇ ALKAN", "RIDVAN DOGER", "ÖNDER IŞIK"] },
  { id: 20, weekLabel: "1. Hafta - 20. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "23.07.2026", time: "22:00", homeTeam: "KARABAĞ FK", awayTeam: "CSKA SOFYA", score: "2 - 0", winnersCount: 4, earnedPoints: 4, winners: ["ABDULLAH DİK", "ŞAHİN GEZGİNCİ", "SALİH KARACAOĞLU", "MUSTAFA GÜMÜŞÇÜ"] },
  { id: 21, weekLabel: "1. Hafta - 21. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "23.07.2026", time: "22:00", homeTeam: "HAMMARBY", awayTeam: "ANDERLECHT", score: "1 - 0", winnersCount: 1, earnedPoints: 12, winners: ["CUMALİ SÖKER"] },
  { id: 22, weekLabel: "1. Hafta - 22. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "23.07.2026", time: "22:00", homeTeam: "TWENTE", awayTeam: "FERENCVAROS", score: "1 - 2", winnersCount: 2, earnedPoints: 6, winners: ["SEDAT SEDAT", "ÖNDER ASLAN"] },
  { id: 23, weekLabel: "1. Hafta - 23. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "23.07.2026", time: "22:00", homeTeam: "ST GALLEN", awayTeam: "BENFICA", score: "0 - 4", winnersCount: 1, earnedPoints: 12, winners: ["FATİH AYAN"] },
  { id: 24, weekLabel: "1. Hafta - 24. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR İLK MAÇ", date: "23.07.2026", time: "22:00", homeTeam: "SPARTAK TRNAVA", awayTeam: "CSKA 1948", score: "2 - 0", winnersCount: 3, earnedPoints: 5, winners: ["MEHMET ALİ KARA", "İSMAİL EKER", "HUDAVER TOPARDIC"] }
];

// 2. HAFTA MAÇ VERİLERİ (STATİK DESTEK)
const week2Matches = [
  { id: 1, weekLabel: "2. Hafta - 1. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "28.07.2026", time: "18:00", homeTeam: "KUPS", awayTeam: "SABAH FK", score: "0 - 2", winnersCount: 3, earnedPoints: 5, winners: ["MUSTAFA GÜMÜŞÇÜ", "CUMALİ SÖKER", "SEDAT SEDAT"] },
  { id: 2, weekLabel: "2. Hafta - 2. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "28.07.2026", time: "21:00", homeTeam: "DINAMO ZAGREB", awayTeam: "THUN", score: "3 - 2", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 3, weekLabel: "2. Hafta - 3. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "28.07.2026", time: "21:45", homeTeam: "HEART", awayTeam: "STURM GRAZ", score: "0 - 2", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 4, weekLabel: "2. Hafta - 4. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "28.07.2026", time: "20:30", homeTeam: "CSKA 1948", awayTeam: "SPARTAK TRNAVA", score: "0 - 0", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 5, weekLabel: "2. Hafta - 5. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "29.07.2026", time: "19:00", homeTeam: "UNIVERSITATEA CRAIOVA", awayTeam: "LEVSKI SOFYA", score: "2 - 2", winnersCount: 1, earnedPoints: 12, winners: ["DOĞAÇ ALKAN"] },
  { id: 6, weekLabel: "2. Hafta - 6. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "29.07.2026", time: "19:30", homeTeam: "KIZILYILDIZ", awayTeam: "LARNE FC", score: "5 - 0", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 7, weekLabel: "2. Hafta - 7. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "29.07.2026", time: "20:00", homeTeam: "GORNİK ZABRZE", awayTeam: "FENERBAHÇE", score: "1 - 1", winnersCount: 9, earnedPoints: 1, winners: ["FATİH AYAN", "MEHMET ALİ KARA", "İSMAİL EKER", "ÖNDER ASLAN", "HUDAVER TOPARDIC", "MURAT ALİ", "SAVAŞ ÇAĞLAYAN", "MUSTAFA ELMAS", "UĞUR GÜRBÜZ"] },
  { id: 8, weekLabel: "2. Hafta - 8. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "29.07.2026", time: "20:00", homeTeam: "SLOVAN BRATISLAVA", awayTeam: "IBERIA 1999", score: "1 - 1", winnersCount: 3, earnedPoints: 5, winners: ["CUMALİ SÖKER", "EYÜP KARACAOĞLU", "ŞAHİN GEZGİNCİ"] },
  { id: 9, weekLabel: "2. Hafta - 9. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "29.07.2026", time: "20:00", homeTeam: "KOPENAG", awayTeam: "POLISSYA", score: "2 - 1", winnersCount: 6, earnedPoints: 2, winners: ["B. VEYSELOĞLU EROL", "ABDULLAH DİK", "ŞAHİN GEZGİNCİ", "ÖNDER ASLAN", "HUDAVER TOPARDIC", "ŞEMSETTİN DÜGER"] },
  { id: 10, weekLabel: "2. Hafta - 10. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "29.07.2026", time: "20:00", homeTeam: "RAPID WIEN", awayTeam: "SANTA COLOMA FC", score: "6 - 2", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 11, weekLabel: "2. Hafta - 11. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "29.07.2026", time: "20:00", homeTeam: "AUDA RIGA", awayTeam: "FCSB", score: "4 - 1", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 12, weekLabel: "2. Hafta - 12. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "20:00", homeTeam: "INTER TURKU", awayTeam: "BAŞAKŞEHİR", score: "2 - 0", winnersCount: 2, earnedPoints: 6, winners: ["EYÜP KARACAOĞLU", "ÖNDER ASLAN"] },
  { id: 13, weekLabel: "2. Hafta - 13. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "21:00", homeTeam: "LEVADIA FC", awayTeam: "GOTEBORG", score: "0 - 1", winnersCount: 6, earnedPoints: 2, winners: ["RIDVAN DOGER", "ÖNDER IŞIK", "MURAT KARA", "CEMALETTİN BELLİ", "İSMAİL EKER", "ÖNDER ASLAN"] },
  { id: 14, weekLabel: "2. Hafta - 14. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "21:30", homeTeam: "BRANN", awayTeam: "UNIVERSITATEA CLUJ", score: "3 - 1", winnersCount: 1, earnedPoints: 12, winners: ["CEMAL SİVRİKAYA"] },
  { id: 15, weekLabel: "2. Hafta - 15. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "21:00", homeTeam: "AJAX", awayTeam: "VOJVODINA", score: "4 - 1", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 16, weekLabel: "2. Hafta - 16. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "20:00", homeTeam: "PANATHINAIKOS", awayTeam: "PAKSI FC", score: "2 - 2", winnersCount: 3, earnedPoints: 5, winners: ["AHMET BİRCAN", "MEVLÜT EVLER", "EYÜP KARACAOĞLU"] },
  { id: 17, weekLabel: "2. Hafta - 17. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "20:00", homeTeam: "BRAGA", awayTeam: "ZELEZNICAR PANCEVO", score: "4 - 0", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 18, weekLabel: "2. Hafta - 18. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "20:00", homeTeam: "MIDTJYLLAND", awayTeam: "BEŞİKTAŞ", score: "0 - 2", winnersCount: 2, earnedPoints: 6, winners: ["R. İLHAN KARACA", "HUDAVER TOPARDIC"] },
  { id: 19, weekLabel: "2. Hafta - 19. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "20:45", homeTeam: "PATOS", awayTeam: "HAJDUK SPLIT", score: "2 - 0", winnersCount: 2, earnedPoints: 6, winners: ["ŞENOL CAN ÇAKICI", "MURAT ALİ"] },
  { id: 20, weekLabel: "2. Hafta - 20. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "21:00", homeTeam: "PAOK", awayTeam: "DINAMO KIEV", score: "2 - 0", winnersCount: 8, earnedPoints: 1, winners: ["CUMALİ SÖKER", "MUSTAFA ELMAS", "SEDAT SEDAT", "OSMAN ALİ AYDIN", "DOĞAÇ ALKAN", "BİROL DEMİREL", "İSMAİL EKER", "BAYRAM YILMAZ"] },
  { id: 21, weekLabel: "2. Hafta - 21. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "21:30", homeTeam: "CSKA SOFYA", awayTeam: "KARABAĞ FK", score: "0 - 0", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 22, weekLabel: "2. Hafta - 22. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "22:00", homeTeam: "ANDERLECHT", awayTeam: "HAMMARBY", score: "3 - 1", winnersCount: 7, earnedPoints: 1, winners: ["ULAŞ ADIGÜZEL", "CUMALİ SÖKER", "MEHMET ALİ KARA", "İLYAS KAZDAL", "AHMET BİRCAN", "MELİH PINAR", "SALİH KARACAOĞLU"] },
  { id: 23, weekLabel: "2. Hafta - 23. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "22:00", homeTeam: "FERENCVAROS", awayTeam: "TWENTE", score: "2 - 2", winnersCount: 2, earnedPoints: 6, winners: ["RIDVAN DOGER", "SEDAT DİŞLİ"] },
  { id: 24, weekLabel: "2. Hafta - 24. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "30.07.2026", time: "22:30", homeTeam: "BENFICA", awayTeam: "ST GALLEN", score: "5 - 0", winnersCount: 1, earnedPoints: 12, winners: ["SALİH KARACAOĞLU"] }
];

// 3. HAFTA MAÇ VERİLERİ (STATİK DESTEK)
const week3Matches = [
  { id: 1, weekLabel: "3. Hafta - 1. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "05.08.2026", time: "20:00", homeTeam: "OLIMPIYAKOS", awayTeam: "NEC NIJMEGEN", score: "0 - 0", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 2, weekLabel: "3. Hafta - 2. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "05.08.2026", time: "20:30", homeTeam: "SPARTA PRAG", awayTeam: "OLIMPIC LYON", score: "2 - 1", winnersCount: 3, earnedPoints: 5, winners: ["MUSTAFA ELMAS", "ALİOS GÖZTEPE", "MEVLÜT EVLER"] },
  { id: 3, weekLabel: "3. Hafta - 3. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "05.08.2026", time: "21:00", homeTeam: "USG", awayTeam: "BODO", score: "3 - 3", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 4, weekLabel: "3. Hafta - 4. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "05.08.2026", time: "21:45", homeTeam: "FENERBAHÇE", awayTeam: "STURM GRAZ", score: "2 - 0", winnersCount: 8, earnedPoints: 1, winners: ["HAKAN AYAN", "MUSTAFA GÜMÜŞÇÜ", "İLYAS KAZDAL", "ALİOS GÖZTEPE", "SEDAT DİŞLİ", "KEMAL ERSOY", "AYHAN LUŞOĞLU", "CEMAL SİVRİKAYA"] },
  { id: 5, weekLabel: "3. Hafta - 5. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "06.08.2026", time: "19:00", homeTeam: "PANATHINAIKOS", awayTeam: "CSKA 1948", score: "1 - 1", winnersCount: 6, earnedPoints: 2, winners: ["RIDVAN DOGER", "MUSTAFA ELMAS", "FATİH AYAN", "SAVAŞ ÇAĞLAYAN", "DOĞAÇ ALKAN", "R. İLHAN KARACA"] },
  { id: 6, weekLabel: "3. Hafta - 6. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "06.08.2026", time: "20:00", homeTeam: "PAIDE LINNAMEESKOND", awayTeam: "RAPID WIEN", score: "1 - 4", winnersCount: 2, earnedPoints: 6, winners: ["ULAŞ ADIGÜZEL", "SEDAT DİŞLİ"] },
  { id: 7, weekLabel: "3. Hafta - 7. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "06.08.2026", time: "20:30", homeTeam: "HRADEC KRALOVE", awayTeam: "BEŞİKTAŞ", score: "0 - 1", winnersCount: 7, earnedPoints: 1, winners: ["BİROL DEMİREL", "HUDAVER TOPARDIC", "OSMAN ALİ AYDIN", "İSMAİL EKER", "SALİH KARACAOĞLU", "YUSUF ERBAY", "UĞUR GÜRBÜZ"] },
  { id: 8, weekLabel: "3. Hafta - 8. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "06.08.2026", time: "20:00", homeTeam: "DEBRECEN", awayTeam: "KOPENHAG", score: "0 - 3", winnersCount: 4, earnedPoints: 3, winners: ["LEVENT YILDIRIM", "SEDAT SEDAT", "CUMALİ SÖKER", "SALİH KARACAOĞLU"] },
  { id: 9, weekLabel: "3. Hafta - 9. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "06.08.2026", time: "21:00", homeTeam: "DINAMO KIEV", awayTeam: "KARABAĞ FK", score: "1 - 0", winnersCount: 1, earnedPoints: 12, winners: ["MUHSİN ASİLKAN"] },
  { id: 10, weekLabel: "3. Hafta - 10. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "06.08.2026", time: "21:00", homeTeam: "GOTEBORG", awayTeam: "GENT", score: "0 - 1", winnersCount: 3, earnedPoints: 5, winners: ["HUDAVER TOPARDIC", "GAZİ AYAN", "YUSUF KIZILTUĞ"] },
  { id: 11, weekLabel: "3. Hafta - 11. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "06.08.2026", time: "21:00", homeTeam: "PAOK", awayTeam: "ANDERLECHT", score: "0 - 1", winnersCount: 3, earnedPoints: 5, winners: ["MUSTAFA GÜMÜŞÇÜ", "İLYAS KAZDAL", "RIDVAN DOĞER"] },
  { id: 12, weekLabel: "3. Hafta - 12. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "06.08.2026", time: "21:30", homeTeam: "AJAX", awayTeam: "SHELBOURNE", score: "2 - 0", winnersCount: 4, earnedPoints: 3, winners: ["MEHMET ALİ KARA", "RIDVAN DOGER", "MURAT KARA", "EYÜP KARACAOĞLU"] },
  { id: 13, weekLabel: "3. Hafta - 13. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "06.08.2026", time: "21:30", homeTeam: "BRAGA", awayTeam: "DINAMO MINSK", score: "1 - 0", winnersCount: 1, earnedPoints: 12, winners: ["SEDAT SEDAT"] },
  { id: 14, weekLabel: "3. Hafta - 14. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", date: "06.08.2026", time: "21:45", homeTeam: "BENFICA", awayTeam: "HEART", score: "2 - 0", winnersCount: 6, earnedPoints: 2, winners: ["İLYAS KAZDAL", "ALİ ÖZKÖZTEPE", "SALİH KARACAOĞLU", "ÖNDER IŞIK", "RECEP İLHAN KARACA", "FATİH AYAN"] },
  { id: 15, weekLabel: "3. Hafta - 15. MAÇ", category: "TÜRKİYE 1.LİG", date: "07.08.2026", time: "20:00", homeTeam: "BOLUSPOR", awayTeam: "MANİSA FK", score: "1 - 2", winnersCount: 3, earnedPoints: 5, winners: ["ULAŞ ADIGÜZEL", "LEVENT YILDIRIM", "ÖNDER ASLAN"] },
  { id: 16, weekLabel: "3. Hafta - 16. MAÇ", category: "TÜRKİYE 1.LİG", date: "08.08.2026", time: "21:00", homeTeam: "BANDIRMASPOR", awayTeam: "İSTANBULSPOR", score: "3 - 0", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 17, weekLabel: "3. Hafta - 17. MAÇ", category: "TÜRKİYE 1.LİG", date: "08.08.2026", time: "19:15", homeTeam: "SİVASSPOR", awayTeam: "ESENLER EROKSPOR", score: "0 - 0", winnersCount: 2, earnedPoints: 6, winners: ["HAKAN AYAN", "GAZİ AYAN"] },
  { id: 18, weekLabel: "3. Hafta - 18. MAÇ", category: "TÜRKİYE 1.LİG", date: "08.08.2026", time: "21:45", homeTeam: "ÜMRANİYESPOR", awayTeam: "MARDİN 1969", score: "0 - 0", winnersCount: 4, earnedPoints: 3, winners: ["SEDAT SEDAT", "MUHSİN ASİLKAN", "HAKAN AYAN", "İSMAİL EKER"] },
  { id: 19, weekLabel: "3. Hafta - 19. MAÇ", category: "TÜRKİYE 1.LİG", date: "08.08.2026", time: "21:45", homeTeam: "ANTALYASPOR", awayTeam: "KEÇİÖRENGÜCÜ", score: "4 - 3", winnersCount: 0, earnedPoints: 0, winners: [] },
  { id: 20, weekLabel: "3. Hafta - 20. MAÇ", category: "TÜRKİYE 1.LİG", date: "09.08.2026", time: "19:00", homeTeam: "IĞDIR FK", awayTeam: "FATİH KARAGÜMRÜK", score: "2 - 0", winnersCount: 4, earnedPoints: 4, winners: ["MUSTAFA ELMAS", "ŞENOL CAN ÇAKICI", "ABDULLAH DİK", "EYÜP KARACAOĞLU"] },
  { id: 21, weekLabel: "3. Hafta - 21. MAÇ", category: "TÜRKİYE 1.LİG", date: "09.08.2026", time: "19:00", homeTeam: "SARIYER", awayTeam: "MUĞLASPOR", score: "2 - 0", winnersCount: 5, earnedPoints: 3, winners: ["SEDAT SEDAT", "MUHSİN ASİLKAN", "KEMAL ERSOY", "OSMAN ALİ AYDIN", "AHMET BİRCAN"] },
  { id: 22, weekLabel: "3. Hafta - 22. MAÇ", category: "TÜRKİYE 1.LİG", date: "09.08.2026", time: "21:30", homeTeam: "BODRUMSPOR", awayTeam: "BURSASPOR", score: "0 - 2", winnersCount: 11, earnedPoints: 1, winners: ["MUSTAFA GÜMÜŞÇÜ", "MURAT KARA", "ALİOS GÖZTEPE", "ÖNDER ASLAN", "ÖNDER IŞIK", "CEMAL SİVRİKAYA", "AHMET BİRCAN", "OZKAYA MAZAKALI BAYRAM", "OSMAN ALİ AYDIN", "YUSUF ERBAY", "UĞUR GÜRBÜZ"] },
  { id: 23, weekLabel: "3. Hafta - 23. MAÇ", category: "TÜRKİYE 1.LİG", date: "09.08.2026", time: "21:30", homeTeam: "VANSPOR FK", awayTeam: "KAYSERİSPOR", score: "0 - 2", winnersCount: 6, earnedPoints: 2, winners: ["SEDAT SEDAT", "B.VEYSELOĞLU EROL", "MURAT KARA", "AYHAN LUŞOĞLU", "OSMAN ALİ AYDIN", "YUSUF ERBAY"] },
  { id: 24, weekLabel: "3. Hafta - 24. MAÇ", category: "TÜRKİYE 1.LİG", date: "10.08.2026", time: "21:30", homeTeam: "PENDİKSPOR", awayTeam: "BATMAN PETROL SPOR", score: "2 - 2", winnersCount: 2, earnedPoints: 6, winners: ["DOĞAÇ ALKAN", "MEHMET ALİ KARA"] }
];

// 4. HAFTA MAÇ VERİLERİ VE TAHMİNLER (STATİK DESTEK)
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
  { id: 1, weekLabel: "4. Hafta - 1. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR RÖVANŞ MAÇI", date: "11.08.2026", time: "21:30", homeTeam: "STURM GRAZ", awayTeam: "FENERBAHÇE", score: "- : -" },
  { id: 2, weekLabel: "4. Hafta - 2. MAÇ", category: "UEFA SÜPER KUPA", date: "12.08.2026", time: "22:00", homeTeam: "PARIS SG", awayTeam: "ASTON VILLA", score: "- : -" },
  { id: 3, weekLabel: "4. Hafta - 3. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR RÖVANŞ", date: "13.08.2026", time: "19:00", homeTeam: "KARABAĞ FK", awayTeam: "DINAMO KIEV", score: "- : -" },
  { id: 4, weekLabel: "4. Hafta - 4. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR RÖVANŞ", date: "13.08.2026", time: "20:00", homeTeam: "BEŞİKTAŞ", awayTeam: "HRADEC KRALOVE", score: "- : -" },
  { id: 5, weekLabel: "4. Hafta - 5. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "14.08.2026", time: "21:30", homeTeam: "GALATASARAY", awayTeam: "ÇORUM FK", score: "- : -" },
  { id: 6, weekLabel: "4. Hafta - 6. MAÇ", category: "TÜRKİYE 1.LİG", date: "14.08.2026", time: "21:30", homeTeam: "EROKSPOR", awayTeam: "SARIYER", score: "- : -" },
  { id: 7, weekLabel: "4. Hafta - 7. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "19:00", homeTeam: "KASIMPAŞA", awayTeam: "TRABZONSPOR", score: "- : -" },
  { id: 8, weekLabel: "4. Hafta - 8. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "19:00", homeTeam: "KONYASPOR", awayTeam: "ÇAYKUR RİZE", score: "- : -" },
  { id: 9, weekLabel: "4. Hafta - 9. MAÇ", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "19:00", homeTeam: "FATİH KARAGÜMRÜK", awayTeam: "ÜMRANİYESPOR", score: "- : -" },
  { id: 10, weekLabel: "4. Hafta - 10. MAÇ", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "19:00", homeTeam: "İSTANBULSPOR", awayTeam: "BODRUMSPOR", score: "- : -" },
  { id: 11, weekLabel: "4. Hafta - 11. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "21:30", homeTeam: "GAZİANTEP FK", awayTeam: "ALANYASPOR", score: "- : -" },
  { id: 12, weekLabel: "4. Hafta - 12. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "21:30", homeTeam: "GENÇLERBİRLİĞİ", awayTeam: "FENERBAHÇE", score: "- : -" },
  { id: 13, weekLabel: "4. Hafta - 13. MAÇ", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "21:30", homeTeam: "BURSASPOR", awayTeam: "IĞDIR FK", score: "- : -" },
  { id: 14, weekLabel: "4. Hafta - 14. MAÇ", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "21:30", homeTeam: "MANİSA FK", awayTeam: "VANSPOR FK", score: "- : -" },
  { id: 15, weekLabel: "4. Hafta - 15. MAÇ", category: "İNGİLTERE SÜPER KUPA", date: "16.08.2026", time: "17:00", homeTeam: "ARSENAL", awayTeam: "MANCHESTER CITY", score: "- : -" },
  { id: 16, weekLabel: "4. Hafta - 16. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "16.08.2026", time: "19:00", homeTeam: "BAŞAKŞEHİR", awayTeam: "KOCAELİSPOR", score: "- : -" },
  { id: 17, weekLabel: "4. Hafta - 17. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "19:00", homeTeam: "KAYSERİSPOR", awayTeam: "SİVASSPOR", score: "- : -" },
  { id: 18, weekLabel: "4. Hafta - 18. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "16.08.2026", time: "21:30", homeTeam: "AMED SPOR", awayTeam: "ERZURUMSPOR", score: "- : -" },
  { id: 19, weekLabel: "4. Hafta - 19. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "16.08.2026", time: "21:30", homeTeam: "BEŞİKTAŞ", awayTeam: "EYÜPSPOR", score: "- : -" },
  { id: 20, weekLabel: "4. Hafta - 20. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "19:00", homeTeam: "KEÇİÖRENGÜCÜ", awayTeam: "PENDİKSPOR", score: "- : -" },
  { id: 21, weekLabel: "4. Hafta - 21. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "21:30", homeTeam: "MARDİN 1969", awayTeam: "ANTALYASPOR", score: "- : -" },
  { id: 22, weekLabel: "4. Hafta - 22. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "21:30", homeTeam: "MUĞLASPOR", awayTeam: "BANDIRMASPOR", score: "- : -" },
  { id: 23, weekLabel: "4. Hafta - 23. MAÇ", category: "TÜRKİYE SÜPER KUPA", date: "17.08.2026", time: "21:30", homeTeam: "SAMSUNSPOR", awayTeam: "GÖZTEPE", score: "- : -" },
  { id: 24, weekLabel: "4. Hafta - 24. MAÇ", category: "TÜRKİYE 1.LİG", date: "17.08.2026", time: "21:30", homeTeam: "BATMAN PETROL SPOR", awayTeam: "BOLUSPOR", score: "- : -" }
];

export default function MacArsiviPage() {
  const [selectedWeek, setSelectedWeek] = useState<number>(6); 
  const [openWinnersMap, setOpenWinnersMap] = useState<{ [key: number]: boolean }>({});
  const [openEventsMap, setOpenEventsMap] = useState<{ [key: number]: boolean }>({});
  
  const [liveMatchesData, setLiveMatchesData] = useState<Record<number, any>>({});
  const [bulletinData, setBulletinData] = useState<Record<number, any>>({});
  const [predictionsDB, setPredictionsDB] = useState<Record<string, string[]>>({});
  const [mergedAccounts, setMergedAccounts] = useState<Record<string, string>>(staticPlayersList);

  useEffect(() => {
     const fetchDbPlayers = async () => {
        const { data } = await supabase.from('players').select('*');
        if (data) {
           const newAccounts = { ...staticPlayersList };
           data.forEach(p => {
               const pid = p.username || p.id;
               if (pid !== 'mankoman') {
                   newAccounts[String(pid)] = p.name || p.full_name;
               }
           });
           setMergedAccounts(newAccounts);
        }
     };
     fetchDbPlayers();
  }, []);

  useEffect(() => {
      const initWeek = async () => {
          const { data } = await supabase.from('matches_bulletin').select('week_num, match_date');
          if (data && data.length > 0) {
              const nowUTC = new Date();
              const todayTurkey = new Date(nowUTC.getTime() + (3 * 60 * 60 * 1000));
              const todayMidnight = new Date(todayTurkey.getUTCFullYear(), todayTurkey.getUTCMonth(), todayTurkey.getUTCDate());

              const upcomingMatches = data
                  .filter(d => parseDateLocal(d.match_date) >= todayMidnight)
                  .sort((a,b) => parseDateLocal(a.match_date).getTime() - parseDateLocal(b.match_date).getTime());
              
              if (upcomingMatches.length > 0) {
                  setSelectedWeek(upcomingMatches[0].week_num);
              } else {
                  const weeks = Array.from(new Set(data.map(d => d.week_num)));
                  if (weeks.length > 0) setSelectedWeek(Math.max(...weeks));
              }
          }
      };
      initWeek();
  }, []);

  useEffect(() => {
    const fetchFromDB = async () => {
      try {
        const { data: liveData } = await supabase.from('live_matches').select('*');
        if (liveData) {
          const liveMap: Record<number, any> = {};
          liveData.forEach(row => liveMap[row.id] = row);
          setLiveMatchesData(liveMap);
        }

        const { data: bultenData } = await supabase.from('matches_bulletin').select('*');
        if (bultenData) {
           const bultenMap: Record<number, any[]> = {};
           bultenData.forEach(row => {
              if(!bultenMap[row.week_num]) bultenMap[row.week_num] = [];
              bultenMap[row.week_num].push({
                 id: row.match_index,
                 weekLabel: `${row.week_num}. Hafta - ${row.match_index}. MAÇ`,
                 category: row.category,
                 date: row.match_date,
                 time: row.match_time,
                 homeTeam: row.home_team,
                 awayTeam: row.away_team,
                 score: "- : -" 
              });
           });
           
           Object.keys(bultenMap).forEach(week => {
             bultenMap[Number(week)].sort((a,b) => a.id - b.id);
           });
           
           setBulletinData(bultenMap);
        }

        let allPredictions: any[] = [];
        let fetchMore = true;
        let from = 0;
        const step = 1000;

        while (fetchMore) {
          const { data: pDataChunk, error } = await supabase
            .from('player_predictions')
            .select('*')
            .eq('week_num', selectedWeek)
            .order('user_id', { ascending: true })
            .order('match_index', { ascending: true })
            .range(from, from + step - 1);
            
          if (!error && pDataChunk && pDataChunk.length > 0) {
             allPredictions = [...allPredictions, ...pDataChunk];
             if (pDataChunk.length < step) fetchMore = false; else from += step; 
          } else { fetchMore = false; }
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

      } catch (e) {
        console.log("Supabase baglantisi bekleniyor...");
      }
    };
    fetchFromDB(); 
    const interval = setInterval(fetchFromDB, 5000); 
    return () => clearInterval(interval);
  }, [selectedWeek]); 

  const currentMatches =
    selectedWeek === 1 ? week1Matches :
    selectedWeek === 2 ? week2Matches :
    selectedWeek === 3 ? week3Matches : 
    selectedWeek === 4 ? week4Matches :
    (bulletinData[selectedWeek] || []);

  const toggleWinners = (matchId: number) => {
    setOpenWinnersMap((prev) => ({ ...prev, [matchId]: !prev[matchId] }));
  };

  const toggleEvents = (matchId: number) => {
    setOpenEventsMap((prev) => ({ ...prev, [matchId]: !prev[matchId] }));
  };

  const getWeekDateRange = (weekNum: number) => {
    const startDate = new Date(2026, 7, 11 + (weekNum - 4) * 7); 
    const endDate = new Date(2026, 7, 17 + (weekNum - 4) * 7);
    
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    const startStr = startDate.toLocaleDateString('tr-TR', options);
    const endStr = endDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 font-sans relative">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors font-bold text-xs bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-lg shadow-sm">
            <span className="text-base leading-none">←</span> Ana Sayfaya Dön
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3 border-b border-slate-800 pb-4">
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight flex items-center justify-center sm:justify-start gap-2">
              📂 MAÇ ARŞİVİ & FİKSTÜR
            </h1>
            <p className="text-slate-400 text-xs mt-1 bg-slate-900 inline-block px-3 py-1 rounded-md border border-slate-800">
              <strong className="text-amber-500 mr-1">{selectedWeek}. HAFTA BÜLTENİ:</strong> 
              {getWeekDateRange(selectedWeek)}
            </p>
          </div>
          <div>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-lg cursor-pointer outline-none transition-all shadow text-sm"
            >
              {[1, 2, 3, 4, ...Object.keys(bulletinData).map(Number).filter(w => w > 4)]
                .sort((a, b) => a - b)
                .map(week => (
                  <option key={week} value={week}>{week}. HAFTA BÜLTENİ</option>
              ))}
            </select>
          </div>
        </div>

        {currentMatches.length === 0 ? (
           <div className="w-full py-20 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
              <span className="text-5xl mb-4 block opacity-50">🏟️</span>
              <h2 className="text-xl font-bold text-slate-400 mb-2 tracking-widest">{selectedWeek}. HAFTA BÜLTENİ HAZIRLANIYOR</h2>
              <p className="text-slate-500 text-sm">Bu haftanın maç programı yönetici tarafından henüz yayınlanmadı.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {currentMatches.map((match: any) => {
              const isWinnersOpen = !!openWinnersMap[match.id];
              const isEventsOpen = !!openEventsMap[match.id];
              const isTffMatch = isTffMatchCheck(match.category);
              
              const homeUpper = match.homeTeam?.toUpperCase() || match.home_team?.toUpperCase() || "";
              const awayUpper = match.awayTeam?.toUpperCase() || match.away_team?.toUpperCase() || "";
              
              const theme = getEliteTheme(match.category, homeUpper, awayUpper);

              let homeScore = "-";
              let awayScore = "-";
              let matchStatus = "NOT_STARTED";
              let currentWinners: string[] = match.winners || [];
              let winnersCount = match.winnersCount || 0;
              let displayPoints = match.earnedPoints || 0;
              let isFinished = false;
              let safeEvents: any[] = [];

              if (selectedWeek >= 4) {
                const uniqueId = getUniqueMatchId(selectedWeek, match.id);
                const dbMatch = liveMatchesData[uniqueId];
                if (dbMatch && dbMatch.status !== 'NOT_STARTED') {
                  matchStatus = dbMatch.status;
                  homeScore = dbMatch.home_score;
                  awayScore = dbMatch.away_score;
                  isFinished = (matchStatus === 'FINISHED' || matchStatus === 'HT' || matchStatus === 'LIVE' || matchStatus === 'WAITING_APPROVAL');
                  
                  // 🔥 MAÇ OLAYLARINI (GOL/KART) VERİTABANINDAN ÇEKME 🔥
                  if (Array.isArray(dbMatch.events)) {
                     safeEvents = dbMatch.events;
                  } else if (typeof dbMatch.events === 'string') {
                     try {
                        const parsed = JSON.parse(dbMatch.events);
                        safeEvents = Array.isArray(parsed) ? parsed : [];
                     } catch (e) {
                        safeEvents = [];
                     }
                  }

                  if (isFinished && homeScore !== '-' && awayScore !== '-') {
                    const targetScore = `${homeScore}-${awayScore}`;
                    const predictionsToUse = selectedWeek === 4 ? week4PredictionsData : predictionsDB;
                    
                    currentWinners = Object.keys(predictionsToUse)
                      .filter(id => predictionsToUse[id] && predictionsToUse[id][match.id - 1] === targetScore)
                      .map(id => mergedAccounts[id])
                      .filter(name => name)
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
                }
              } else {
                const scoreText = match.score || "- : -";
                isFinished = scoreText.includes("-") && !scoreText.includes("- : -") && !scoreText.includes("-:-");
                if (isFinished) {
                  const parts = scoreText.split("-").map((s: string) => s.trim());
                  homeScore = parts[0] || "-";
                  awayScore = parts[1] || "-";
                }
              }

              const homeEvents = safeEvents.filter((e: any) => e.type !== 'SystemTime' && (e.isHome === true || e?.team?.name === match.homeTeam));
              const awayEvents = safeEvents.filter((e: any) => e.type !== 'SystemTime' && (e.isHome === false || (e.isHome === undefined && e?.team?.name === match.awayTeam)));

              return (
                <div 
                  key={match.id} 
                  className={`w-full mx-auto border rounded-2xl overflow-hidden transition-all duration-500 flex flex-col relative ${theme.containerBorder} ${theme.containerShadow} ${theme.containerBg}`}
                >
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
                          {match.weekLabel}
                        </span>
                        <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border text-center flex items-center gap-1.5 ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                          🏆 {match.category}
                        </span>
                        <span className={`${theme.catText} text-[10px] sm:text-[11px] font-semibold tracking-widest mt-0.5 opacity-90`}>
                          {match.date} <span className="opacity-50 mx-1">|</span> {match.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-0 sm:px-4">
                        <div className="flex flex-col items-center justify-center flex-1 gap-1.5 sm:gap-3">
                          <div className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center relative z-20">
                            <img src={theme.homeLogo} alt={homeUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
                          </div>
                          <span className="text-white font-extrabold text-[10px] sm:text-[13px] text-center uppercase tracking-wide drop-shadow-lg leading-tight px-1">{homeUpper}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center mx-1.5 sm:mx-4 w-20 sm:w-32 z-30 relative">
                          
                          {theme.leagueLogo && (
                            <div className="w-10 h-10 sm:w-14 sm:h-14 mb-1 flex items-center justify-center drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:scale-110 transition-transform duration-500 z-40">
                              <img src={theme.leagueLogo} alt="League Logo" className="w-full h-full object-contain" />
                            </div>
                          )}

                          <div className={`w-full bg-[#080d1a]/80 border ${theme.scoreBorder} py-2.5 sm:py-4 rounded-xl flex items-center justify-center gap-1.5 sm:gap-3 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
                            <span className="text-xl sm:text-4xl font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{homeScore}</span>
                            <span className={`text-base sm:text-2xl font-bold ${theme.colonText}`}>:</span>
                            <span className="text-xl sm:text-4xl font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{awayScore}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center flex-1 gap-1.5 sm:gap-3">
                          <div className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center relative z-20">
                            <img src={theme.awayLogo} alt={awayUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
                          </div>
                          <span className="text-white font-extrabold text-[10px] sm:text-[13px] text-center uppercase tracking-wide drop-shadow-lg leading-tight px-1">{awayUpper}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 🔥 MAÇ OLAYLARI (GOL / KART) VİTRİNİ 🔥 */}
                  {safeEvents.length > 0 && (
                    <div className="w-full mb-3 flex flex-col gap-2 px-4 relative z-30 animate-fadeIn mt-2">
                      <button onClick={() => toggleEvents(match.id)} className="w-full flex justify-between items-center px-3 py-1.5 bg-slate-900/60 hover:bg-slate-800/80 transition-colors border border-slate-700/50 rounded-lg backdrop-blur-md shadow-sm">
                        <span className="text-slate-300 font-bold text-[9px] sm:text-[10px] tracking-widest flex items-center gap-2"><span>📊</span> MAÇ İSTATİSTİKLERİ VE OLAYLARI</span>
                        <span className="text-slate-400 text-[10px]">{isEventsOpen ? '▲' : '▼'}</span>
                      </button>
                      {isEventsOpen && (
                        <div className="flex justify-between w-full text-xs sm:text-sm text-slate-300 bg-slate-900/40 rounded-lg p-1.5 sm:p-3 border border-slate-800/80 shadow-inner">
                          <div className="flex-1 flex flex-col gap-1 items-start pr-1 sm:pr-3 border-r border-slate-700/50 overflow-hidden">
                            {homeEvents.map((e: any, i: number) => {
                              let icon = ''; let text = '';
                              if (e.type === 'Goal') { icon = e.detail === 'Penalty' ? '🎯' : (e.detail === 'Own Goal' ? '🤦‍♂️' : '⚽'); text = String(e.player?.name || 'Oyuncu'); } 
                              else if (e.type === 'Card') { icon = e.detail === 'Yellow Card' ? '🟨' : '🟥'; text = String(e.player?.name || 'Oyuncu'); } 
                              else if (e.type === 'subst') { icon = '🔄'; text = `${String(e.assist?.name || 'Giren')} / ${String(e.player?.name || 'Çıkan')}`; } else return null;
                              return (
                                <span key={`h-e-${i}`} className="flex items-center gap-1 bg-slate-800/40 px-1 sm:px-2 py-0.5 rounded shadow-sm w-full">
                                  <span className="text-[9px] sm:text-xs drop-shadow-md shrink-0">{icon}</span> 
                                  <span className="font-medium text-slate-200 flex-1 text-left text-[8.5px] sm:text-[10px] leading-[1.1] break-words whitespace-normal">{text}</span> 
                                  <span className="text-emerald-400 font-bold text-[8px] sm:text-[9px] shrink-0">({String(e.time?.elapsed || 0)}')</span>
                                </span>
                              );
                            })}
                          </div>
                          <div className="flex-1 flex flex-col gap-1 items-end pl-1 sm:pl-3 overflow-hidden">
                            {awayEvents.map((e: any, i: number) => {
                              let icon = ''; let text = '';
                              if (e.type === 'Goal') { icon = e.detail === 'Penalty' ? '🎯' : (e.detail === 'Own Goal' ? '🤦‍♂️' : '⚽'); text = String(e.player?.name || 'Oyuncu'); } 
                              else if (e.type === 'Card') { icon = e.detail === 'Yellow Card' ? '🟨' : '🟥'; text = String(e.player?.name || 'Oyuncu'); } 
                              else if (e.type === 'subst') { icon = '🔄'; text = `${String(e.assist?.name || 'Giren')} / ${String(e.player?.name || 'Çıkan')}`; } else return null;
                              return (
                                <span key={`a-e-${i}`} className="flex items-center gap-1 bg-slate-800/40 px-1 sm:px-2 py-0.5 rounded shadow-sm w-full justify-end">
                                  <span className="text-emerald-400 font-bold text-[8px] sm:text-[9px] shrink-0">({String(e.time?.elapsed || 0)}')</span> 
                                  <span className="font-medium text-slate-200 flex-1 text-right text-[8.5px] sm:text-[10px] leading-[1.1] break-words whitespace-normal">{text}</span> 
                                  <span className="text-[9px] sm:text-xs drop-shadow-md shrink-0">{icon}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`${theme.bottomBar} border-t px-4 py-3 w-full backdrop-blur-md z-10 relative mt-auto`}>
                    <div className="flex justify-between items-center w-full">
                      <div className="text-left flex-1">
                        {!isFinished ? (
                          <span className="text-[10px] sm:text-xs font-medium text-slate-400 italic drop-shadow-sm">Henüz oynanmadı</span>
                        ) : winnersCount === 0 ? (
                          <span className="text-[10px] sm:text-xs font-medium text-slate-400 italic drop-shadow-sm">Bu skoru bilen yok</span>
                        ) : (
                          <span className="text-[10px] sm:text-xs font-medium text-blue-200">
                            <strong className="text-amber-400">{winnersCount} kişi</strong> tam isabetli
                          </span>
                        )}
                      </div>
                      <div className="flex-0 text-center px-1">
                        <span className={`text-[9px] font-black tracking-widest whitespace-nowrap px-2.5 py-0.5 rounded block shadow-[0_0_10px_currentColor] border ${theme.tagText} ${theme.tagBg} ${theme.tagBorder}`}>
                          {isTffMatch ? "TFF MAÇI" : "DFO MAÇI"}
                        </span>
                      </div>
                      <div className="text-right flex-1">
                        {winnersCount > 0 && (
                          <button onClick={() => toggleWinners(match.id)} className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-[10px] sm:text-xs outline-none whitespace-nowrap drop-shadow-sm">
                            {isWinnersOpen ? "Gizle ▲" : "Bilenleri gör →"}
                          </button>
                        )}
                      </div>
                    </div>
                  
                    {isWinnersOpen && winnersCount > 0 && (
                      <div className="w-full mt-3 p-3 bg-slate-950/40 rounded-lg border border-slate-800/40 text-xs animate-fadeIn shadow-inner">
                        <div className="text-slate-300/80 font-semibold mb-2 border-b border-slate-800/50 pb-1.5 flex justify-between items-center text-[10px] sm:text-[11px]">
                          <span>BİLEN YARIŞMACILAR (A-Z)</span>
                          <span className="text-amber-400 font-bold bg-amber-900/20 px-2 py-0.5 rounded border border-amber-700/30">Kişi Başı: {displayPoints} Puan</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                          {currentWinners.map((winner: string, idx: number) => (
                            <span key={idx} className="border px-2 py-1 rounded text-[9px] sm:text-[10px] font-medium transition-all duration-500 bg-slate-900/60 text-white border-slate-600/50 shadow-[0_0_10px_rgba(0,0,0,0.4)]">
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
        )}
      </div>
    </div>
  );
}