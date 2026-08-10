'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { USER_LIST } from '@/app/constants';

const userMap: Record<string, string> = Object.fromEntries(
  USER_LIST.map(u => [u.id, u.name])
);
const SCORE_OPTIONS = Array.from({ length: 10 }, (_, i) => i.toString());

const officialWeek3Matches = [
  { id: 1, home: "OLIMPIYAKOS", away: "NEC NIJMEGEN", info: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", cat: "DFO" },
  { id: 2, home: "SPARTA PRAG", away: "OLIMPIC LYON", info: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", cat: "DFO" },
  { id: 3, home: "USG", away: "BODO-GLIMT", info: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", cat: "DFO" },
  { id: 4, home: "FENERBAHÇE", away: "STURM GRAZ", info: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", cat: "DFO" },
  { id: 5, home: "PANATHINAIKOS", away: "CSKA 1948", info: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ", cat: "DFO" },
  { id: 6, home: "PAIDE LINNAMEESKOND", away: "RAPID WIEN", info: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ", cat: "DFO" },
  { id: 7, home: "HRADEC KRALOVE", away: "BEŞİKTAŞ", info: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ", cat: "DFO" },
  { id: 8, home: "DEBRECEN", away: "KOPENAG", info: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ", cat: "DFO" },
  { id: 9, home: "DINAMO KIEV", away: "KARABAĞ FK", info: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ", cat: "DFO" },
  { id: 10, home: "GOTEBORG", away: "GENT", info: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ", cat: "DFO" },
  { id: 11, home: "PAOK", away: "ANDERLECHT", info: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", cat: "DFO" },
  { id: 12, home: "AJAX", away: "SHELBOURNE", info: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", cat: "DFO" },
  { id: 13, home: "BRAGA", away: "DINAMO MINSK", info: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", cat: "DFO" },
  { id: 14, home: "BENFICA", away: "HEART", info: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ", cat: "DFO" },
  { id: 15, home: "BOLUSPOR", away: "MANİSA FK", info: "TÜRKİYE 1.LİG", cat: "TFF" },
  { id: 16, home: "BANDIRMASPOR", away: "İSTANBULSPOR", info: "TÜRKİYE 1.LİG", cat: "TFF" },
  { id: 17, home: "SİVASSPOR", away: "EROKSPOR", info: "TÜRKİYE 1.LİG", cat: "TFF" },
  { id: 18, home: "ÜMRANİYE SPOR", away: "MARDİN 1969", info: "TÜRKİYE 1.LİG", cat: "TFF" },
  { id: 19, home: "ANTALYASPOR", away: "KEÇİÖRENGÜCÜ", info: "TÜRKİYE 1.LİG", cat: "TFF" },
  { id: 20, home: "IĞDIR FK", away: "FATİH KARAGÜMRÜK", info: "TÜRKİYE 1.LİG", cat: "TFF" },
  { id: 21, home: "SARIYER", away: "MUĞLASPOR", info: "TÜRKİYE 1.LİG", cat: "TFF" },
  { id: 22, home: "BODRUMSPOR", away: "BURSASPOR", info: "TÜRKİYE 1.LİG", cat: "TFF" },
  { id: 23, home: "VANSPOR FK", away: "KAYSERİSPOR", info: "TÜRKİYE 1.LİG", cat: "TFF" },
  { id: 24, home: "PENDİKSPOR", away: "BATMAN PETROL SPOR", info: "TÜRKİYE 1.LİG", cat: "TFF" }
];

const userPredictionsData = [
  { preds: ["2 − 0", "1 − 2", "1 − 1", "1 − 0", "1 − 1", "0 − 3", "0 − 4", "0 − 1", "1 − 1", "0 − 0", "0 − 1", "5 − 0", "2 − 0", "3 − 1", "0 − 0", "1 − 0", "1 − 2", "2 − 2", "2 − 0", "1 − 1", "0 − 0", "1 − 2", "0 − 0", "1 − 1"], id: "262711" },
  { preds: ["2 − 1", "1 − 3", "0 − 2", "0 − 2", "4 − 1", "0 − 4", "1 − 2", "0 − 3", "1 − 3", "1 − 4", "2 − 1", "4 − 1", "3 − 1", "4 − 0", "1 − 2", "2 − 1", "1 − 2", "3 − 2", "3 − 1", "1 − 2", "1 − 2", "1 − 2", "3 − 1", "1 − 2"], id: "262734" },
  { preds: ["2 − 0", "1 − 3", "0 − 3", "2 − 0", "3 − 0", "0 − 4", "0 − 3", "0 − 2", "2 − 2", "0 − 2", "0 − 1", "2 − 0", "3 − 0", "3 − 0", "0 − 2", "0 − 1", "2 − 1", "0 − 3", "3 − 1", "0 − 1", "1 − 1", "0 − 2", "0 − 1", "1 − 1"], id: "262721" },
  { preds: ["2 − 1", "0 − 2", "3 − 1", "1 − 2", "3 − 0", "0 − 2", "0 − 2", "1 − 1", "1 − 1", "1 − 3", "3 − 0", "4 − 0", "2 − 0", "4 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "3 − 0", "1 − 1", "2 − 1", "1 − 1", "0 − 1", "0 − 1"], id: "262758" },
  { preds: ["3 − 1", "1 − 2", "0 − 2", "1 − 1", "2 − 0", "1 − 2", "0 − 1", "1 − 3", "1 − 1", "0 − 3", "3 − 0", "3 − 0", "2 − 0", "3 − 0", "1 − 1", "1 − 1", "2 − 1", "2 − 0", "2 − 1", "1 − 2", "1 − 1", "3 − 1", "0 − 3", "2 − 0"], id: "262716" },
  { preds: ["3 − 1", "1 − 2", "4 − 2", "3 − 2", "3 − 1", "1 − 2", "1 − 1", "0 − 1", "1 − 0", "1 − 1", "1 − 1", "4 − 1", "2 − 0", "4 − 1", "4 − 1", "1 − 2", "1 − 0", "0 − 0", "0 − 0", "1 − 1", "2 − 0", "1 − 3", "2 − 1", "2 − 1"], id: "262733" },
  { preds: ["2 − 1", "1 − 2", "0 − 3", "1 − 2", "3 − 0", "0 − 4", "0 − 2", "0 − 2", "1 − 1", "1 − 2", "1 − 3", "3 − 0", "3 − 0", "3 − 1", "1 − 1", "2 − 0", "2 − 1", "3 − 0", "2 − 1", "0 − 2", "1 − 0", "1 − 2", "1 − 1", "2 − 0"], id: "262744" },
  { preds: ["2 − 0", "2 − 1", "1 − 1", "3 − 1", "1 − 1", "1 − 1", "1 − 2", "1 − 1", "1 − 1", "2 − 1", "1 − 1", "3 − 0", "2 − 1", "4 − 0", "2 − 0", "2 − 0", "2 − 0", "2 − 0", "2 − 0", "2 − 0", "1 − 1", "1 − 1", "1 − 0", "1 − 1"], id: "262763" },
  { preds: ["1 − 1", "1 − 2", "1 − 0", "2 − 0", "3 − 1", "1 − 2", "1 − 0", "0 − 2", "0 − 0", "0 − 2", "1 − 2", "2 − 0", "3 − 1", "4 − 0", "1 − 1", "0 − 2", "1 − 2", "3 − 0", "1 − 1", "0 − 2", "2 − 0", "1 − 1", "1 − 3", "3 − 0"], id: "262813" },
  { preds: ["3 − 0", "1 − 2", "0 − 2", "0 − 2", "2 − 1", "0 − 2", "0 − 3", "0 − 3", "3 − 0", "0 − 2", "0 − 2", "3 − 0", "1 − 0", "3 − 0", "0 − 3", "2 − 0", "4 − 0", "0 − 0", "1 − 1", "0 − 4", "2 − 0", "0 − 4", "0 − 2", "2 − 1"], id: "262816" },
  { preds: ["3 − 1", "1 − 3", "2 − 2", "2 − 1", "1 − 0", "1 − 2", "1 − 2", "0 − 2", "1 − 2", "4 − 2", "1 − 1", "3 − 2", "2 − 0", "3 − 0", "2 − 1", "3 − 2", "1 − 2", "2 − 0", "1 − 1", "2 − 2", "1 − 0", "2 − 2", "1 − 2", "3 − 0"], id: "262718" },
  { preds: ["2 − 0", "1 − 2", "1 − 1", "1 − 0", "1 − 1", "1 − 2", "1 − 2", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "2 − 1", "2 − 0", "2 − 0", "1 − 1", "1 − 0", "1 − 2", "1 − 1", "1 − 1", "1 − 1", "2 − 1", "1 − 1", "1 − 1", "2 − 1"], id: "262731" },
  { preds: ["2 − 2", "1 − 3", "4 − 3", "2 − 1", "1 − 1", "0 − 2", "1 − 4", "1 − 3", "2 − 3", "1 − 1", "2 − 1", "2 − 1", "2 − 2", "3 − 0", "1 − 3", "1 − 0", "4 − 2", "0 − 1", "0 − 1", "1 − 0", "1 − 0", "1 − 2", "0 − 1", "2 − 2"], id: "262755" },
  { preds: ["2 − 0", "1 − 2", "1 − 1", "2 − 1", "2 − 0", "0 − 2", "1 − 3", "1 − 3", "1 − 1", "1 − 2", "2 − 1", "4 − 0", "3 − 0", "3 − 0", "1 − 1", "2 − 1", "2 − 0", "1 − 0", "2 − 1", "1 − 2", "2 − 2", "1 − 1", "0 − 2", "2 − 0"], id: "262749" },
  { preds: ["1 − 1", "1 − 3", "2 − 0", "1 − 0", "2 − 0", "1 − 1", "0 − 1", "0 − 0", "0 − 1", "0 − 1", "1 − 1", "3 − 0", "1 − 1", "3 − 2", "4 − 1", "2 − 1", "3 − 1", "1 − 1", "2 − 0", "1 − 0", "4 − 0", "0 − 1", "0 − 0", "3 − 1"], id: "262726" },
  { preds: ["3 − 1", "2 − 2", "3 − 2", "3 − 2", "2 − 0", "1 − 3", "1 − 2", "1 − 3", "3 − 0", "2 − 1", "2 − 3", "4 − 1", "2 − 2", "4 − 1", "2 − 1", "1 − 2", "1 − 3", "2 − 1", "1 − 1", "1 − 3", "3 − 0", "1 − 3", "1 − 1", "2 − 2"], id: "262736" },
  { preds: ["1 − 0", "0 − 2", "0 − 0", "2 − 0", "0 − 0", "0 − 2", "0 − 0", "0 − 2", "0 − 0", "0 − 0", "0 − 2", "3 − 0", "3 − 0", "3 − 0", "0 − 0", "0 − 0", "0 − 0", "0 − 0", "0 − 0", "0 − 0", "0 − 0", "0 − 0", "0 − 0", "1 − 0"], id: "262707" },
  { preds: ["2 − 1", "2 − 2", "3 − 2", "2 − 1", "3 − 1", "1 − 4", "0 − 2", "2 − 2", "2 − 2", "1 − 2", "2 − 2", "4 − 1", "3 − 1", "4 − 1", "1 − 2", "1 − 1", "2 − 2", "1 − 2", "3 − 1", "1 − 2", "1 − 2", "1 − 3", "1 − 1", "1 − 2"], id: "262771" },
  { preds: ["2 − 0", "1 − 1", "0 − 1", "2 − 0", "2 − 0", "1 − 3", "0 − 2", "0 − 2", "2 − 0", "0 − 0", "0 − 1", "3 − 1", "2 − 1", "2 − 0", "1 − 1", "0 − 2", "1 − 0", "2 − 0", "2 − 0", "0 − 2", "0 − 0", "1 − 2", "0 − 1", "2 − 0"], id: "262725" },
  { preds: ["4 − 0", "0 − 2", "0 − 1", "1 − 0", "3 − 0", "0 − 2", "0 − 3", "0 − 1", "1 − 2", "1 − 0", "1 − 1", "2 − 0", "3 − 0", "4 − 0", "0 − 2", "1 − 0", "0 − 2", "1 − 0", "1 − 0", "2 − 1", "1 − 0", "0 − 2", "0 − 2", "1 − 1"], id: "262702" },
  { preds: ["3 − 0", "2 − 1", "0 − 1", "2 − 0", "2 − 0", "0 − 2", "0 − 2", "0 − 2", "3 − 0", "2 − 1", "0 − 0", "1 − 0", "2 − 0", "2 − 0", "0 − 0", "0 − 0", "2 − 0", "1 − 0", "2 − 1", "0 − 0", "0 − 0", "0 − 2", "0 − 0", "0 − 0"], id: "351925" },
  { preds: ["2 − 1", "0 − 0", "0 − 1", "0 − 1", "1 − 2", "0 − 5", "0 − 2", "0 − 1", "0 − 0", "1 − 1", "1 − 0", "1 − 3", "3 − 0", "1 − 2", "1 − 2", "2 − 1", "2 − 0", "2 − 0", "2 − 2", "1 − 0", "1 − 3", "0 − 2", "0 − 1", "0 − 1"], id: "262728" },
  { preds: ["2 − 2", "2 − 1", "1 − 2", "2 − 1", "2 − 2", "2 − 2", "1 − 2", "2 − 2", "1 − 1", "1 − 1", "2 − 1", "3 − 1", "2 − 1", "2 − 2", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 2", "1 − 2", "1 − 1"], id: "262738" },
  { preds: ["0 − 2", "0 − 2", "0 − 2", "2 − 1", "1 − 0", "0 − 1", "0 − 2", "0 − 3", "1 − 1", "1 − 1", "2 − 1", "2 − 1", "2 − 0", "2 − 0", "0 − 3", "1 − 1", "1 − 2", "1 − 0", "2 − 2", "2 − 1", "1 − 0", "0 − 2", "1 − 3", "2 − 0"], id: "262730" },
  { preds: ["2 − 1", "1 − 1", "1 − 2", "1 − 2", "2 − 1", "1 − 3", "1 − 2", "1 − 1", "2 − 1", "0 − 0", "2 − 1", "5 − 0", "3 − 0", "4 − 0", "2 − 3", "2 − 1", "1 − 1", "1 − 1", "3 − 1", "1 − 1", "1 − 2", "1 − 1", "1 − 1", "1 − 1"], id: "262719" },
  { preds: ["2 − 0", "1 − 2", "1 − 3", "2 − 0", "2 − 1", "0 − 2", "1 − 2", "1 − 2", "1 − 1", "1 − 1", "2 − 1", "4 − 0", "2 − 0", "3 − 0", "1 − 1", "1 − 1", "1 − 0", "1 − 1", "2 − 1", "0 − 1", "0 − 0", "0 − 2", "1 − 1", "2 − 0"], id: "262772" },
  { preds: ["2 − 0", "1 − 2", "0 − 2", "1 − 1", "2 − 0", "0 − 1", "0 − 2", "1 − 2", "2 − 2", "1 − 0", "1 − 1", "3 − 1", "2 − 0", "4 − 0", "1 − 0", "1 − 1", "1 − 1", "2 − 0", "3 − 1", "2 − 0", "1 − 0", "2 − 2", "1 − 2", "3 − 0"], id: "262774" },
  { preds: ["2 − 1", "2 − 2", "1 − 2", "2 − 0", "2 − 0", "1 − 3", "0 − 2", "0 − 2", "1 − 1", "1 − 1", "3 − 2", "3 − 0", "2 − 0", "3 − 1", "2 − 1", "2 − 0", "2 − 2", "1 − 0", "2 − 0", "0 − 2", "3 − 0", "1 − 2", "0 − 2", "1 − 0"], id: "262723" },
  { preds: ["1 − 0", "0 − 2", "0 − 0", "1 − 0", "3 − 1", "0 − 2", "0 − 3", "0 − 1", "0 − 0", "0 − 1", "0 − 0", "4 − 0", "4 − 1", "5 − 0", "0 − 0", "1 − 0", "0 − 0", "1 − 0", "0 − 1", "0 − 0", "0 − 1", "0 − 1", "0 − 0", "3 − 0"], id: "262706" },
  { preds: ["2 − 1", "2 − 2", "2 − 2", "3 − 2", "3 − 0", "1 − 2", "1 − 2", "1 − 3", "2 − 2", "1 − 1", "1 − 2", "3 − 1", "2 − 1", "2 − 2", "2 − 2", "1 − 1", "2 − 1", "2 − 0", "3 − 0", "2 − 0", "3 − 1", "1 − 3", "2 − 1", "3 − 1"], id: "262740" },
  { preds: ["1 − 2", "1 − 2", "1 − 2", "3 − 0", "1 − 0", "2 − 2", "1 − 1", "2 − 1", "2 − 1", "1 − 2", "0 − 2", "2 − 0", "2 − 2", "4 − 0", "2 − 0", "1 − 1", "1 − 1", "1 − 1", "1 − 2", "2 − 0", "2 − 2", "2 − 2", "2 − 0", "1 − 1"], id: "262756" },
  { preds: ["3 − 1", "0 − 2", "0 − 3", "0 − 2", "2 − 1", "0 − 3", "1 − 3", "1 − 3", "2 − 1", "2 − 1", "0 − 2", "3 − 0", "3 − 1", "3 − 1", "0 − 2", "0 − 2", "0 − 2", "0 − 2", "0 − 1", "0 − 2", "0 − 0", "0 − 3", "0 − 0", "1 − 2"], id: "262790" },
  { preds: ["2 − 1", "1 − 3", "1 − 1", "2 − 0", "4 − 1", "1 − 4", "0 − 4", "1 − 3", "1 − 2", "1 − 1", "1 − 1", "3 − 1", "3 − 2", "3 − 0", "3 − 1", "1 − 1", "2 − 1", "1 − 1", "1 − 1", "1 − 3", "1 − 1", "1 − 3", "3 − 1", "2 − 1"], id: "262786" },
  { preds: ["3 − 1", "0 − 2", "1 − 2", "3 − 0", "3 − 0", "0 − 1", "1 − 1", "0 − 2", "1 − 1", "2 − 1", "2 − 0", "3 − 0", "4 − 1", "5 − 1", "0 − 2", "0 − 0", "1 − 1", "2 − 0", "2 − 1", "2 − 1", "2 − 0", "0 − 2", "0 − 1", "3 − 1"], id: "262705" },
  { preds: ["2 − 1", "1 − 2", "1 − 1", "3 − 1", "3 − 0", "1 − 1", "0 − 2", "0 − 1", "1 − 1", "0 − 1", "2 − 2", "6 − 0", "4 − 1", "3 − 0", "2 − 2", "1 − 1", "1 − 2", "3 − 1", "1 − 2", "2 − 2", "2 − 3", "1 − 2", "1 − 1", "1 − 2"], id: "262753" },
  { preds: ["3 − 1", "1 − 2", "0 − 2", "2 − 1", "2 − 0", "0 − 3", "0 − 2", "0 − 1", "2 − 2", "1 − 0", "1 − 3", "4 − 1", "3 − 1", "4 − 1", "2 − 1", "3 − 1", "2 − 0", "1 − 1", "2 − 0", "0 − 0", "1 − 1", "2 − 3", "1 − 2", "1 − 1"], id: "262750" },
  { preds: ["3 − 1", "1 − 2", "1 − 1", "4 − 0", "3 − 0", "1 − 0", "1 − 2", "0 − 2", "2 − 0", "0 − 2", "0 − 0", "3 − 0", "3 − 0", "3 − 0", "2 − 2", "1 − 2", "1 − 2", "0 − 2", "2 − 0", "2 − 1", "3 − 1", "0 − 2", "1 − 2", "1 − 1"], id: "262770" },
  { preds: ["2 − 0", "0 − 1", "0 − 1", "1 − 0", "1 − 0", "0 − 1", "0 − 1", "0 − 2", "0 − 1", "1 − 0", "1 − 0", "3 − 0", "2 − 0", "3 − 0", "0 − 2", "1 − 0", "0 − 1", "0 − 1", "1 − 0", "0 − 2", "2 − 0", "0 − 2", "0 − 2", "2 − 0"], id: "262754" },
  { preds: ["1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1", "1 − 1"], id: "262747" },
  { preds: ["1 − 1", "1 − 1", "1 − 0", "1 − 0", "0 − 0", "0 − 3", "0 − 1", "0 − 2", "0 − 0", "1 − 1", "1 − 0", "1 − 0", "2 − 0", "1 − 1", "2 − 1", "1 − 1", "0 − 2", "0 − 0", "0 − 1", "0 − 0", "1 − 1", "0 − 0", "1 − 0", "1 − 1"], id: "262714" },
  { preds: ["2 − 1", "1 − 0", "3 − 2", "1 − 1", "1 − 2", "0 − 0", "1 − 2", "1 − 0", "1 − 1", "2 − 2", "1 − 2", "1 − 1", "0 − 1", "3 − 1", "1 − 1", "1 − 0", "1 − 3", "1 − 0", "1 − 0", "2 − 3", "2 − 1", "3 − 1", "1 − 2", "1 − 0"], id: "262717" },
  { preds: ["1 − 1", "0 − 1", "1 − 1", "2 − 1", "1 − 0", "0 − 2", "1 − 2", "1 − 1", "1 − 1", "0 − 0", "1 − 0", "3 − 0", "2 − 0", "1 − 0", "0 − 0", "1 − 1", "1 − 0", "1 − 0", "2 − 0", "0 − 0", "1 − 1", "0 − 1", "0 − 1", "1 − 0"], id: "262703" },
  { preds: ["2 − 1", "0 − 2", "0 − 2", "3 − 1", "1 − 1", "0 − 2", "1 − 1", "1 − 1", "0 − 1", "1 − 1", "0 − 2", "3 − 0", "2 − 1", "2 − 0", "3 − 0", "1 − 0", "0 − 2", "2 − 0", "3 − 0", "0 − 2", "1 − 1", "1 − 1", "2 − 0", "2 − 0"], id: "262732" },
  { preds: ["3 − 1", "1 − 2", "2 − 1", "3 − 1", "4 − 0", "0 − 4", "0 − 1", "0 − 3", "1 − 1", "2 − 2", "2 − 2", "5 − 0", "4 − 0", "2 − 0", "2 − 0", "1 − 1", "2 − 2", "1 − 0", "1 − 1", "2 − 2", "1 − 1", "1 − 3", "0 − 0", "3 − 1"], id: "262709" },
  { preds: ["1 − 0", "2 − 0", "0 − 2", "1 − 0", "1 − 0", "0 − 0", "0 − 1", "0 − 2", "1 − 1", "2 − 0", "0 − 2", "0 − 3", "0 − 2", "0 − 0", "2 − 0", "0 − 1", "1 − 0", "1 − 2", "1 − 0", "1 − 1", "1 − 0", "0 − 2", "0 − 2", "2 − 0"], id: "262782" },
  { preds: ["2 − 1", "1 − 2", "0 − 2", "2 − 1", "3 − 1", "0 − 2", "0 − 3", "0 − 2", "2 − 1", "2 − 1", "0 − 2", "3 − 0", "2 − 0", "3 − 0", "0 − 2", "2 − 1", "2 − 1", "2 − 0", "3 − 1", "2 − 1", "1 − 0", "1 − 3", "1 − 0", "4 − 0"], id: "262708" },
  { preds: ["2 − 0", "0 − 0", "0 − 3", "2 − 1", "3 − 1", "0 − 1", "0 − 1", "1 − 3", "2 − 0", "2 − 0", "0 − 0", "4 − 0", "4 − 1", "5 − 1", "2 − 0", "0 − 1", "2 − 0", "3 − 1", "4 − 0", "1 − 1", "0 − 0", "0 − 2", "0 − 1", "1 − 0"], id: "262739" }
];

const getTahsisPuan = (count: number) => {
  if (count === 1) return 12;
  if (count === 2) return 6;
  if (count === 3) return 5;
  if (count === 4) return 4;
  if (count === 5) return 3;
  if (count === 6) return 2;
  return 1;
};

export default function AdminTahminmatikPage() {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [scores, setScores] = useState<Record<string, { h: string; a: string }>>({});
  const [approvedMatches, setApprovedMatches] = useState<Record<string, boolean>>({});
  const [cardMessages, setCardMessages] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (!session) router.push('/admin/login');
    else setAdminUser(JSON.parse(session));
  }, [router]);

  const handleScoreChange = (id: number, side: 'h' | 'a', val: string) => {
    setScores(prev => ({ ...prev, [id]: { ...(prev[id] || { h: '', a: '' }), [side]: val } }));
    setApprovedMatches(prev => ({ ...prev, [id]: false }));
  };

  const getBilenUsers = (matchId: number) => {
    const sc = scores[matchId];
    if (!sc || sc.h === '' || sc.a === '') return [];
    const target = `${sc.h} − ${sc.a}`;
    const targetAlt = `${sc.h} - ${sc.a}`;
    return userPredictionsData.filter(u => {
      const p = u.preds[matchId - 1];
      return p === target || p === targetAlt;
    }).map(u => ({ id: u.id, name: userMap[u.id] || u.id }));
  };

  const handleResetSystem = () => {
    if (window.confirm("Tüm puanlar, skorlar ve onaylanan maçlar sıfırlanacak. Emin misin?")) {
      localStorage.removeItem('elitTahmin_ApprovedMatches');
      localStorage.removeItem('elitTahmin_WeeklyScores');
      localStorage.removeItem('elitTahmin_MasterScores');
      localStorage.removeItem('elitTahmin_TffScores');
      localStorage.removeItem('elitTahmin_TFF_Scores');
      localStorage.removeItem('elitTahmin_Scores');
      alert("🧹 Sistem hafızası tamamen temizlendi ve sıfırlandı!");
      window.location.reload();
    }
  };

  const handleApprove = (match: any) => {
    const bilenler = getBilenUsers(match.id);
    const count = bilenler.length;
    if (count === 0) {
      setCardMessages(prev => ({ ...prev, [match.id]: `⚠️ Bu skoru bilen kimse yok.` }));
      return;
    }
    const puan = getTahsisPuan(count);
    
    const isTffMatch = match.id >= 15 || (match.cat && match.cat.trim().toUpperCase() === 'TFF');

    // KESİN ÇÖZÜM: TFF sayfası doğrudan approvedMatches üzerinden hesap yapıyorsa, cat değerini 'TFF' olarak mühürlüyoruz.
    const approvedStore = JSON.parse(localStorage.getItem('elitTahmin_ApprovedMatches') || '{}');
    approvedStore[`match_3_${match.id}`] = { 
        week: 3,
        matchId: match.id,
        cat: isTffMatch ? 'TFF' : 'DFO',
        score: `${scores[match.id].h} − ${scores[match.id].a}`, 
        allocations: bilenler.map(u => ({ id: u.id, name: u.name, points: puan, cat: isTffMatch ? 'TFF' : 'DFO' })) 
    };
    localStorage.setItem('elitTahmin_ApprovedMatches', JSON.stringify(approvedStore));
    
    // Ayrıca doğrudan TFF puan durumunun okuduğu olası tüm depolara puanı basıyoruz
    const weeklyScores = JSON.parse(localStorage.getItem('elitTahmin_WeeklyScores') || '{}');
    const masterScores = JSON.parse(localStorage.getItem('elitTahmin_MasterScores') || '{}');
    const tffScores = JSON.parse(localStorage.getItem('elitTahmin_TffScores') || '{}');
    const tffScoresAlt = JSON.parse(localStorage.getItem('elitTahmin_TFF_Scores') || '{}');
    const generalScores = JSON.parse(localStorage.getItem('elitTahmin_Scores') || '{}');

    if (!weeklyScores['3']) weeklyScores['3'] = {};

    bilenler.forEach(u => {
        weeklyScores['3'][u.id] = (Number(weeklyScores['3'][u.id]) || 0) + 1;
        
        if (isTffMatch) {
            tffScores[u.id] = (Number(tffScores[u.id]) || 0) + puan;
            tffScoresAlt[u.id] = (Number(tffScoresAlt[u.id]) || 0) + puan;
            generalScores[u.id] = (Number(generalScores[u.id]) || 0) + puan;
        } else {
            masterScores[u.id] = (Number(masterScores[u.id]) || 0) + puan;
        }
    });

    localStorage.setItem('elitTahmin_WeeklyScores', JSON.stringify(weeklyScores));
    localStorage.setItem('elitTahmin_MasterScores', JSON.stringify(masterScores));
    localStorage.setItem('elitTahmin_TffScores', JSON.stringify(tffScores));
    localStorage.setItem('elitTahmin_TFF_Scores', JSON.stringify(tffScoresAlt));
    localStorage.setItem('elitTahmin_Scores', JSON.stringify(generalScores));
    
    setApprovedMatches(prev => ({ ...prev, [match.id]: true }));
    setCardMessages(prev => ({ ...prev, [match.id]: `✅ ${count} kişiye ${puan} puan TFF/Master tablosuna işlendi!` }));
  };

  if (!adminUser) return null;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 mb-8 text-center shadow-xl backdrop-blur-md flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-amber-400 tracking-wider uppercase mb-1">
            ⚡ ADMIN TAHMİNMATİK (3. HAFTA)
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-medium">
            Skorları seçin, puanları hatasız dağıtın.
          </p>
        </div>
        <button 
          onClick={handleResetSystem}
          className="bg-red-500/25 hover:bg-red-500/35 text-red-300 border border-red-500/50 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md"
        >
          🧹 SİSTEMİ & PUANLARI SIFIRLA
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {officialWeek3Matches.map(match => {
          const bilenler = getBilenUsers(match.id);
          const count = bilenler.length;
          const puan = getTahsisPuan(count);
          const isApproved = approvedMatches[match.id];
          const message = cardMessages[match.id];
          const isTff = match.id >= 15 || (match.cat && match.cat.trim().toUpperCase() === 'TFF');

          return (
            <div key={match.id} className="bg-slate-950/90 border border-slate-800 hover:border-amber-500/40 transition-all rounded-2xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div>
                <div className="flex justify-between items-center text-[11px] text-slate-400 font-bold mb-3 border-b border-slate-800/80 pb-2">
                  <span className={`tracking-wider font-extrabold uppercase ${isTff ? 'text-emerald-400' : 'text-amber-400'}`}>
                    3. HAFTA - {match.id}. MAÇ ({isTff ? 'TFF' : 'DFO'}) {isTff ? '📌 [TFF LİGİ]' : '⭐ [MASTER / DFO]'}
                  </span>
                  <span className="bg-slate-900 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-md text-[10px] font-black uppercase">
                    {match.info}
                  </span>
                </div>

                <div className="flex items-center justify-between my-4 px-2">
                  <span className="font-extrabold text-sm sm:text-base text-slate-100 uppercase truncate w-[38%] text-left">
                    {match.home}
                  </span>

                  <div className="flex items-center gap-2 justify-center w-[24%]">
                    <select 
                      value={scores[match.id]?.h ?? ''}
                      onChange={(e) => handleScoreChange(match.id, 'h', e.target.value)}
                      className="w-12 h-11 text-center bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl font-black text-lg text-amber-400 outline-none shadow-inner cursor-pointer"
                    >
                      <option value="">-</option>
                      {SCORE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>

                    <span className="text-xs font-black text-slate-500">-</span>

                    <select 
                      value={scores[match.id]?.a ?? ''}
                      onChange={(e) => handleScoreChange(match.id, 'a', e.target.value)}
                      className="w-12 h-11 text-center bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl font-black text-lg text-amber-400 outline-none shadow-inner cursor-pointer"
                    >
                      <option value="">-</option>
                      {SCORE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>

                  <span className="font-extrabold text-sm sm:text-base text-slate-100 uppercase truncate w-[38%] text-right">
                    {match.away}
                  </span>
                </div>

                <div className="mt-4 bg-slate-900/80 border border-slate-800/80 rounded-xl p-3">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                      Tam Skoru Bilenler ({count} Kişi)
                    </span>
                    {count > 0 && (
                      <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded shadow-sm">
                        {puan} Puan ({isTff ? 'TFF Puan Tablosuna' : 'Master Puan Tablosuna'})
                      </span>
                    )}
                  </div>

                  {count > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {bilenler.map((u: any) => (
                        <div key={u.id} className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-200 shadow-sm">
                          {u.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic text-center py-2">
                      Skorları seçtiğinizde bilenler burada listelenir...
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">
                    Durum: <strong className={isApproved ? "text-emerald-400" : "text-amber-400"}>{isApproved ? "Onaylandı" : "Bekliyor"}</strong>
                  </span>
                  <button
                    onClick={() => handleApprove(match)}
                    className={`px-5 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md ${
                      isApproved 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-400'
                    }`}
                  >
                    {isApproved ? '✓ GÜNCELLE & DAĞIT' : 'ONAYLA & DAĞIT'}
                  </button>
                </div>

                {message && (
                  <div className="text-xs font-bold text-center py-1.5 px-3 bg-slate-900 border border-slate-800 rounded-lg text-amber-300">
                    {message}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}