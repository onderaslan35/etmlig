'use client';

import React, { useState } from 'react';

// 1, 2 ve 3. Haftanın Orijinal ve Eksiksiz Maç Bültenleri
const realArchiveData: Record<number, any[]> = {
  1: [
    { id: 1, home: "IBERIA 1999", away: "SLOVAN BRATISLAVA", homeCode: "IBE", awayCode: "SLO", homeScore: 0, awayScore: 2, isFinished: true, type: "DFO", matchNo: 1, date: "21 Temmuz | 19:00", league: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME" },
    { id: 2, home: "SABAH FK", away: "KUPS", homeCode: "SAB", awayCode: "KUP", homeScore: 1, awayScore: 0, isFinished: true, type: "DFO", matchNo: 2, date: "21 Temmuz | 19:00", league: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME" },
    { id: 3, home: "FENERBAHÇE", away: "GORNİK ZABRZE", homeCode: "FB", awayCode: "GOR", homeScore: 1, awayScore: 0, isFinished: true, type: "DFO", matchNo: 3, date: "21 Temmuz | 21:00", league: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME" },
    { id: 4, home: "THUN", away: "DİNAMO ZAGREB", homeCode: "THU", awayCode: "DIN", homeScore: 1, awayScore: 1, isFinished: true, type: "DFO", matchNo: 4, date: "21 Temmuz | 21:00", league: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME" },
    { id: 5, home: "STURM GRAZ", away: "HEART", homeCode: "STU", awayCode: "HEA", homeScore: 4, awayScore: 0, isFinished: true, type: "DFO", matchNo: 5, date: "21 Temmuz | 21:30", league: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME" },
    { id: 6, home: "LARNE FC", away: "KIZILYILDIZ", homeCode: "LAR", awayCode: "KIZ", homeScore: 0, awayScore: 4, isFinished: true, type: "DFO", matchNo: 6, date: "21 Temmuz | 22:00", league: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME" },
    { id: 7, home: "GOTEBORG", away: "LEVADIA FC", homeCode: "GOT", awayCode: "LEV", homeScore: 1, awayScore: 2, isFinished: true, type: "DFO", matchNo: 7, date: "21 Temmuz | 20:00", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 8, home: "LEVSKI SOFYA", away: "UNIVERSITATEA CRAIOVA", homeCode: "LEV", awayCode: "CRA", homeScore: 1, awayScore: 0, isFinished: true, type: "DFO", matchNo: 8, date: "22 Temmuz | 20:30", league: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME" },
    { id: 9, home: "BAŞAKŞEHİR", away: "INTER TURKU", homeCode: "IBFK", awayCode: "INT", homeScore: 1, awayScore: 1, isFinished: true, type: "DFO", matchNo: 9, date: "22 Temmuz | 20:45", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 10, home: "SPARTAK TRNAVA", away: "CSKA 1948", homeCode: "SPA", awayCode: "CSK", homeScore: 0, awayScore: 0, isFinished: true, type: "DFO", matchNo: 10, date: "22 Temmuz | 21:30", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 11, home: "ZELEZNICAR PANCEVO", away: "BRAGA", homeCode: "ZEL", awayCode: "BRA", homeScore: 0, awayScore: 1, isFinished: true, type: "DFO", matchNo: 11, date: "22 Temmuz | 22:00", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 12, home: "FCSB", away: "AUDA RIGA", homeCode: "FCS", awayCode: "AUD", homeScore: 2, awayScore: 3, isFinished: true, type: "DFO", matchNo: 12, date: "23 Temmuz | 19:00", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 13, home: "PAKSI FC", away: "PANATHINAIKOS", homeCode: "PAK", awayCode: "PAO", homeScore: 1, awayScore: 2, isFinished: true, type: "DFO", matchNo: 13, date: "23 Temmuz | 19:00", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 14, home: "UNIVERSITATEA CLUJ", away: "BRANN", homeCode: "CLU", awayCode: "BRA", homeScore: 2, awayScore: 2, isFinished: true, type: "DFO", matchNo: 14, date: "23 Temmuz | 19:00", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 15, home: "VOJVODINA", away: "AJAX", homeCode: "VOJ", awayCode: "AJA", homeScore: 1, awayScore: 4, isFinished: true, type: "DFO", matchNo: 15, date: "23 Temmuz | 19:00", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 16, home: "SANTA COLOMA FC", away: "RAPID WIEN", homeCode: "SAN", awayCode: "RAP", homeScore: 1, awayScore: 3, isFinished: true, type: "DFO", matchNo: 16, date: "23 Temmuz | 20:00", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 17, home: "POLISSYA", away: "KOPENAG", homeCode: "POL", awayCode: "KOP", homeScore: 3, awayScore: 3, isFinished: true, type: "DFO", matchNo: 17, date: "23 Temmuz | 21:00", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 18, home: "KARABAĞ FK", away: "CSKA SOFYA", homeCode: "KAR", awayCode: "SOF", homeScore: 0, awayScore: 0, isFinished: true, type: "DFO", matchNo: 18, date: "23 Temmuz | 19:00", league: "UEFA AVRUPA LİGİ ÖN ELEME" },
    { id: 19, home: "DINAMO KIEV", away: "PAOK", homeCode: "KIE", awayCode: "PAO", homeScore: 2, awayScore: 3, isFinished: true, type: "DFO", matchNo: 19, date: "23 Temmuz | 20:00", league: "UEFA AVRUPA LİGİ ÖN ELEME" },
    { id: 20, home: "HAMMARBY", away: "ANDERLECHT", homeCode: "HAM", awayCode: "AND", homeScore: 1, awayScore: 1, isFinished: true, type: "DFO", matchNo: 20, date: "23 Temmuz | 20:00", league: "UEFA AVRUPA LİGİ ÖN ELEME" },
    { id: 21, home: "BEŞİKTAŞ", away: "MIDTGYLLAND", homeCode: "BJK", awayCode: "MID", homeScore: 1, awayScore: 0, isFinished: true, type: "DFO", matchNo: 21, date: "23 Temmuz | 21:00", league: "UEFA AVRUPA LİGİ ÖN ELEME" },
    { id: 22, home: "TWENTE", away: "FERENCVAROS", homeCode: "TWE", awayCode: "FER", homeScore: 1, awayScore: 2, isFinished: true, type: "DFO", matchNo: 22, date: "23 Temmuz | 21:00", league: "UEFA AVRUPA LİGİ ÖN ELEME" },
    { id: 23, home: "ST GALLEN", away: "BENFICA", homeCode: "STG", awayCode: "BEN", homeScore: 2, awayScore: 1, isFinished: true, type: "DFO", matchNo: 23, date: "23 Temmuz | 21:00", league: "UEFA AVRUPA LİGİ ÖN ELEME" },
    { id: 24, home: "HAJDUK SPLIT", away: "PATOS", homeCode: "HAJ", awayCode: "PAT", homeScore: 2, awayScore: 0, isFinished: true, type: "DFO", matchNo: 24, date: "23 Temmuz | 22:00", league: "UEFA AVRUPA LİGİ ÖN ELEME" }
  ],
  2: [
    { id: 1, home: "KUPS", away: "SABAH FK", homeCode: "KUP", awayCode: "SAB", homeScore: 0, awayScore: 2, isFinished: true, type: "DFO", matchNo: 1, date: "28 Temmuz | 18:00", league: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME" },
    { id: 2, home: "CSKA 1948", away: "SPARTAK TRNAVA", homeCode: "CSK", awayCode: "SPA", homeScore: 0, awayScore: 0, isFinished: true, type: "DFO", matchNo: 2, date: "28 Temmuz | 20:30", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 3, home: "DINAMO ZAGREB", away: "THUN", homeCode: "DIN", awayCode: "THU", homeScore: 3, awayScore: 2, isFinished: true, type: "DFO", matchNo: 3, date: "28 Temmuz | 21:00", league: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME" },
    { id: 4, home: "HEART", away: "STURM GRAZ", homeCode: "HEA", awayCode: "STU", homeScore: 0, awayScore: 2, isFinished: true, type: "DFO", matchNo: 4, date: "28 Temmuz | 21:45", league: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME" },
    { id: 5, home: "KOPENAG", away: "POLISSYA", homeCode: "KOP", awayCode: "POL", homeScore: 2, awayScore: 1, isFinished: true, type: "DFO", matchNo: 5, date: "29 Temmuz | 20:00", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 6, home: "UNIVERSITATEA CRAIOVA", away: "LEVSKI SOFYA", homeCode: "CRA", awayCode: "LEV", homeScore: 2, awayScore: 2, isFinished: true, type: "DFO", matchNo: 6, date: "29 Temmuz | 20:30", league: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME" },
    { id: 7, home: "GORNİK ZABRZE", away: "FENERBAHÇE", homeCode: "GOR", awayCode: "FB", homeScore: 1, awayScore: 1, isFinished: true, type: "DFO", matchNo: 7, date: "29 Temmuz | 21:00", league: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME" },
    { id: 8, home: "KIZILYILDIZ", away: "LARNE FC", homeCode: "KIZ", awayCode: "LAR", homeScore: 5, awayScore: 0, isFinished: true, type: "DFO", matchNo: 8, date: "29 Temmuz | 21:00", league: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME" },
    { id: 9, home: "SLOVAN BRATISLAVA", away: "IBERIA 1999", homeCode: "SLO", awayCode: "IBE", homeScore: 1, awayScore: 1, isFinished: true, type: "DFO", matchNo: 9, date: "29 Temmuz | 21:15", league: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME" },
    { id: 10, home: "RAPID WIEN", away: "SANTA COLOMA FC", homeCode: "RAP", awayCode: "SAN", homeScore: 6, awayScore: 2, isFinished: true, type: "DFO", matchNo: 10, date: "29 Temmuz | 21:30", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 11, home: "AUDA RIGA", away: "FCSB", homeCode: "AUD", awayCode: "FCS", homeScore: 4, awayScore: 1, isFinished: true, type: "DFO", matchNo: 11, date: "30 Temmuz | 19:00", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 12, home: "INTER TURKU", away: "BAŞAKŞEHİR", homeCode: "INT", awayCode: "IBFK", homeScore: 2, awayScore: 0, isFinished: true, type: "DFO", matchNo: 12, date: "30 Temmuz | 19:00", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 13, home: "LEVADIA FC", away: "GOTEBORG", homeCode: "LEV", awayCode: "GOT", homeScore: 0, awayScore: 1, isFinished: true, type: "DFO", matchNo: 13, date: "30 Temmuz | 19:30", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 14, home: "FERENCVAROS", away: "TWENTE", homeCode: "FER", awayCode: "TWE", homeScore: 2, awayScore: 2, isFinished: true, type: "DFO", matchNo: 14, date: "30 Temmuz | 21:30", league: "UEFA AVRUPA LİGİ ÖN ELEME" },
    { id: 15, home: "CSKA SOFYA", away: "KARABAĞ FK", homeCode: "SOF", awayCode: "KAR", homeScore: 0, awayScore: 0, isFinished: true, type: "DFO", matchNo: 15, date: "30 Temmuz | 21:00", league: "UEFA AVRUPA LİGİ ÖN ELEME" },
    { id: 16, home: "PATOS", away: "HAJDUK SPLIT", homeCode: "PAT", awayCode: "HAJ", homeScore: 2, awayScore: 0, isFinished: true, type: "DFO", matchNo: 16, date: "30 Temmuz | 20:00", league: "UEFA AVRUPA LİGİ ÖN ELEME" },
    { id: 17, home: "MIDTJYLLAND", away: "BEŞİKTAŞ", homeCode: "MID", awayCode: "BJK", homeScore: 0, awayScore: 2, isFinished: true, type: "DFO", matchNo: 17, date: "30 Temmuz | 20:00", league: "UEFA AVRUPA LİGİ ÖN ELEME" },
    { id: 18, home: "BRANN", away: "UNIVERSITATEA CLUJ", homeCode: "BRA", awayCode: "CLU", homeScore: 3, awayScore: 1, isFinished: true, type: "DFO", matchNo: 18, date: "30 Temmuz | 20:00", league: "UEFA AVRUPA LİGİ ÖN ELEME" },
    { id: 19, home: "PAOK", away: "DINAMO KIEV", homeCode: "PAO", awayCode: "KIE", homeScore: 2, awayScore: 0, isFinished: true, type: "DFO", matchNo: 19, date: "30 Temmuz | 20:45", league: "UEFA AVRUPA LİGİ ÖN ELEME" },
    { id: 20, home: "AJAX", away: "VOJVODINA", homeCode: "AJA", awayCode: "VOJ", homeScore: 4, awayScore: 1, isFinished: true, type: "DFO", matchNo: 20, date: "30 Temmuz | 21:00", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 21, home: "PANATHINAIKOS", away: "PAKSI FC", homeCode: "PAO", awayCode: "PAK", homeScore: 2, awayScore: 2, isFinished: true, type: "DFO", matchNo: 21, date: "30 Temmuz | 21:30", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 22, home: "ANDERLECHT", away: "HAMMARBY", homeCode: "AND", awayCode: "HAM", homeScore: 3, awayScore: 1, isFinished: true, type: "DFO", matchNo: 22, date: "30 Temmuz | 21:30", league: "UEFA AVRUPA LİGİ ÖN ELEME" },
    { id: 23, home: "BENFICA", away: "ST GALLEN", homeCode: "BEN", awayCode: "STG", homeScore: 5, awayScore: 0, isFinished: true, type: "DFO", matchNo: 23, date: "30 Temmuz | 22:00", league: "UEFA AVRUPA LİGİ ÖN ELEME" },
    { id: 24, home: "BRAGA", away: "ZELEZNICAR PANCEVO", homeCode: "BRA", awayCode: "ZEL", homeScore: 4, awayScore: 0, isFinished: true, type: "DFO", matchNo: 24, date: "30 Temmuz | 22:00", league: "UEFA AVRUPA LİGİ ÖN ELEME" }
  ],
  3: [
    { id: 1, home: "OLIMPIYAKOS", away: "NEC NIJMEGEN", homeCode: "OLI", awayCode: "NEC", homeScore: 0, awayScore: 0, isFinished: true, type: "DFO", matchNo: 1, date: "3. Hafta", league: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME" },
    { id: 2, home: "SPARTA PRAG", away: "OLIMPIC LYON", homeCode: "SPA", awayCode: "LYO", homeScore: 2, awayScore: 1, isFinished: true, type: "DFO", matchNo: 2, date: "3. Hafta", league: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME" },
    { id: 3, home: "USG", away: "BODO-GLIMT", homeCode: "USG", awayCode: "BOD", homeScore: 3, awayScore: 3, isFinished: true, type: "DFO", matchNo: 3, date: "3. Hafta", league: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME" },
    { id: 4, home: "FENERBAHÇE", away: "STURM GRAZ", homeCode: "FB", awayCode: "STU", homeScore: 2, awayScore: 0, isFinished: true, type: "DFO", matchNo: 4, date: "3. Hafta", league: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME" },
    { id: 5, home: "PANATHINAIKOS", away: "CSKA 1948", homeCode: "PAO", awayCode: "CSK", homeScore: 1, awayScore: 1, isFinished: true, type: "DFO", matchNo: 5, date: "3. Hafta", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 6, home: "PAIDE LINNAMEESKOND", away: "RAPID WIEN", homeCode: "PAI", awayCode: "RAP", homeScore: 1, awayScore: 4, isFinished: true, type: "DFO", matchNo: 6, date: "3. Hafta", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 7, home: "HRADEC KRALOVE", away: "BEŞİKTAŞ", homeCode: "HRA", awayCode: "BJK", homeScore: 0, awayScore: 1, isFinished: true, type: "DFO", matchNo: 7, date: "3. Hafta", league: "UEFA AVRUPA LİGİ ÖN ELEME" },
    { id: 8, home: "DEBRECEN", away: "KOPENAG", homeCode: "DEB", awayCode: "KOP", homeScore: 0, awayScore: 3, isFinished: true, type: "DFO", matchNo: 8, date: "3. Hafta", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 9, home: "DINAMO KIEV", away: "KARABAĞ FK", homeCode: "KIE", awayCode: "KAR", homeScore: 1, awayScore: 0, isFinished: true, type: "DFO", matchNo: 9, date: "3. Hafta", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 10, home: "GOTEBORG", away: "GENT", homeCode: "GOT", awayCode: "GNT", homeScore: 0, awayScore: 1, isFinished: true, type: "DFO", matchNo: 10, date: "3. Hafta", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 11, home: "PAOK", away: "ANDERLECHT", homeCode: "PAO", awayCode: "AND", homeScore: 0, awayScore: 1, isFinished: true, type: "DFO", matchNo: 11, date: "3. Hafta", league: "UEFA AVRUPA LİGİ ÖN ELEME" },
    { id: 12, home: "AJAX", away: "SHELBOURNE", homeCode: "AJA", awayCode: "SHE", homeScore: 3, awayScore: 1, isFinished: true, type: "DFO", matchNo: 12, date: "3. Hafta", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 13, home: "BRAGA", away: "DINAMO MINSK", homeCode: "BRA", awayCode: "DIN", homeScore: 1, awayScore: 0, isFinished: true, type: "DFO", matchNo: 13, date: "3. Hafta", league: "UEFA KONFERANS LİGİ ÖN ELEME" },
    { id: 14, home: "BENFICA", away: "HEART", homeCode: "BEN", awayCode: "HEA", homeScore: 6, awayScore: 1, isFinished: true, type: "DFO", matchNo: 14, date: "3. Hafta", league: "UEFA AVRUPA LİGİ ÖN ELEME" },
    { id: 15, home: "BOLUSPOR", away: "MANİSA FK", homeCode: "BOL", awayCode: "MAN", homeScore: 1, awayScore: 2, isFinished: true, type: "TFF", matchNo: 15, date: "3. Hafta", league: "TÜRKİYE 1.LİG" },
    { id: 16, home: "BANDIRMASPOR", away: "İSTANBULSPOR", homeCode: "BAN", awayCode: "İST", homeScore: 3, awayScore: 0, isFinished: true, type: "TFF", matchNo: 16, date: "3. Hafta", league: "TÜRKİYE 1.LİG" },
    { id: 17, home: "SİVASSPOR", away: "EROKSPOR", homeCode: "SİV", awayCode: "ERO", homeScore: null, awayScore: null, isFinished: false, type: "TFF", matchNo: 17, date: "3. Hafta", league: "TÜRKİYE 1.LİG" },
    { id: 18, home: "ÜMRANİYESPOR", away: "MARDİN 1969", homeCode: "ÜMR", awayCode: "MAR", homeScore: null, awayScore: null, isFinished: false, type: "TFF", matchNo: 18, date: "3. Hafta", league: "TÜRKİYE 1.LİG" },
    { id: 19, home: "ANTALYASPOR", away: "KEÇİÖRENGÜCÜ", homeCode: "ANT", awayCode: "KEÇ", homeScore: null, awayScore: null, isFinished: false, type: "TFF", matchNo: 19, date: "3. Hafta", league: "TÜRKİYE 1.LİG" },
    { id: 20, home: "IĞDIR FK", away: "FATİH KARAGÜMRÜK", homeCode: "IĞD", awayCode: "KAR", homeScore: null, awayScore: null, isFinished: false, type: "TFF", matchNo: 20, date: "3. Hafta", league: "TÜRKİYE 1.LİG" },
    { id: 21, home: "SARIYER", away: "MUĞLASPOR", homeCode: "SAR", awayCode: "MUĞ", homeScore: null, awayScore: null, isFinished: false, type: "TFF", matchNo: 21, date: "3. Hafta", league: "TÜRKİYE 1.LİG" },
    { id: 22, home: "BODRUMSPOR", away: "BURSASPOR", homeCode: "BOD", awayCode: "BUR", homeScore: null, awayScore: null, isFinished: false, type: "TFF", matchNo: 22, date: "3. Hafta", league: "TÜRKİYE 1.LİG" },
    { id: 23, home: "VANSPOR FK", away: "KAYSERİSPOR", homeCode: "VAN", awayCode: "KAY", homeScore: null, awayScore: null, isFinished: false, type: "TFF", matchNo: 23, date: "3. Hafta", league: "TÜRKİYE 1.LİG" },
    { id: 24, home: "PENDİKSPOR", away: "BATMAN PETROL SPOR", homeCode: "PEN", awayCode: "BAT", homeScore: null, awayScore: null, isFinished: false, type: "TFF", matchNo: 24, date: "3. Hafta", league: "TÜRKİYE 1.LİG" }
  ]
};

export default function MacArsiviPage() {
  const [selectedWeek, setSelectedWeek] = useState<number>(3);
  const [isWeekMenuOpen, setIsWeekMenuOpen] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'DFO' | 'TFF'>('ALL');

  const totalWeeks = Array.from({ length: 48 }, (_, i) => i + 1);

  // Seçilen haftaya ait maç verisi
  const matches = realArchiveData[selectedWeek] || [];

  const selectWeek = (weekNum: number) => {
    setSelectedWeek(weekNum);
    setIsWeekMenuOpen(false);
  };

  const filteredMatches = matches.filter((m) => {
    if (selectedFilter === 'ALL') return true;
    return m.type === selectedFilter;
  });

  const dfoCount = matches.filter((m) => m.type === 'DFO').length;
  const tffCount = matches.filter((m) => m.type === 'TFF').length;

  return (
    <div className="max-w-6xl mx-auto p-4 text-slate-100">
      {/* Üst Başlık ve Hafta Akordeon Menüsü */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-amber-400 uppercase tracking-wider text-center md:text-left">
            📂 MAÇ ARŞİVİ & FİKSTÜR
          </h1>
          <p className="text-xs text-slate-400 text-center md:text-left">
            {selectedWeek}. Hafta Canlı ve Tamamlanan Karşılaşmalar
          </p>
        </div>

        {/* Hafta Seçim Açılır Menüsü */}
        <div className="w-full md:w-auto relative">
          <button
            onClick={() => setIsWeekMenuOpen(!isWeekMenuOpen)}
            className="w-full md:w-56 py-2.5 px-4 rounded-xl font-extrabold text-xs md:text-sm border transition-all flex items-center justify-between shadow-md bg-slate-900 text-amber-400 border-amber-500/40 hover:border-amber-400"
          >
            <span>📅 {selectedWeek}. HAFTA BÜLTENİ</span>
            <span className="text-xs ml-2">{isWeekMenuOpen ? '▲' : '▼'}</span>
          </button>

          {/* Akordeon Kutu */}
          {isWeekMenuOpen && (
            <div className="absolute top-full right-0 left-0 md:left-auto mt-2 z-50 w-full md:w-72 bg-slate-900 border border-slate-700 p-3 rounded-2xl shadow-2xl backdrop-blur-md">
              <div className="text-[11px] font-bold text-slate-400 mb-2 text-center uppercase tracking-wider border-b border-slate-800 pb-1">
                İncelemek İstediğiniz Haftayı Seçin
              </div>
              <div className="grid grid-cols-6 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {totalWeeks.map((weekNum) => (
                  <button
                    key={weekNum}
                    onClick={() => selectWeek(weekNum)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all text-center ${
                      selectedWeek === weekNum
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black scale-105'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-amber-500/20 hover:text-amber-300'
                    }`}
                  >
                    {weekNum}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kategori Filtre Butonları */}
      <div className="flex justify-center md:justify-end mb-6">
        <div className="flex gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedFilter === 'ALL' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            TÜMÜ ({matches.length})
          </button>
          <button
            onClick={() => setSelectedFilter('DFO')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedFilter === 'DFO' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            DFO ({dfoCount})
          </button>
          <button
            onClick={() => setSelectedFilter('TFF')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedFilter === 'TFF' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            TFF ({tffCount})
          </button>
        </div>
      </div>

      {/* Maç Kartları Grid Structure */}
      {filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatches.map((match: any) => (
            <div
              key={match.id}
              className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              {/* Üst Bilgi Rozeti */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/60">
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                    match.type === 'TFF'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                      : 'bg-slate-950 text-amber-400 border border-slate-800'
                  }`}
                >
                  {match.league}
                </span>
                <div className="text-[11px] font-bold text-slate-400">
                  <span>{match.date}</span>
                  <span className="ml-2 font-black text-amber-500">
                    {match.type} - {match.matchNo}. MAÇ
                  </span>
                </div>
              </div>

              {/* Skor Alanı */}
              <div className="flex items-center justify-between my-2 px-2">
                <div className="flex-1 text-center font-extrabold text-sm md:text-base text-slate-100">
                  <div className="text-xs text-slate-400 mb-0.5">{match.homeCode}</div>
                  <div>{match.home}</div>
                </div>

                {/* Orta Skor Kutu */}
                <div className="mx-4">
                  {match.isFinished ? (
                    <div className="bg-amber-500 text-slate-950 font-black px-4 py-2 rounded-xl text-lg md:text-xl shadow-lg border border-amber-400 tracking-widest">
                      {match.homeScore} - {match.awayScore}
                    </div>
                  ) : (
                    <div className="bg-amber-500/90 text-slate-950 font-black px-4 py-2 rounded-xl text-lg md:text-xl shadow-lg border border-amber-400 tracking-widest">
                      ---
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center font-extrabold text-sm md:text-base text-slate-100">
                  <div className="text-xs text-slate-400 mb-0.5">{match.awayCode}</div>
                  <div>{match.away}</div>
                </div>
              </div>

              {/* Alt Detay Bilgi */}
              <div className="mt-3 pt-2 border-t border-slate-800/50 flex items-center justify-center text-[11px] text-slate-400 font-medium">
                <span>🎯 0 kişi bildi • Puan alanları gör →</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-500 font-medium text-sm bg-slate-900/50 border border-slate-800 rounded-2xl">
          ⏳ {selectedWeek}. Haftanın maç bülteni henüz girilmedi veya yayınlanmadı.
        </div>
      )}
    </div>
  );
}