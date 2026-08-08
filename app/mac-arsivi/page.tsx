'use client';

import React, { useState, useEffect } from 'react';
import week1Data from '@/app/data/week1_predictions.json';
import week2Data from '@/app/data/week2_predictions.json';
import week3Data from '@/app/data/week3_predictions.json';

interface Match {
  id: string;
  home: string;
  away: string;
  score: string;
  league: 'DFO' | 'MASTER' | 'TFF';
  category: 'CHAMPIONS_LEAGUE' | 'EUROPA_LEAGUE' | 'CONFERENCE_LEAGUE';
  categoryName: string;
  desc: string;
}

export default function MacArsiviPage() {
  const [activeLeague, setActiveLeague] = useState<'DFO' | 'MASTER' | 'TFF'>('MASTER');
  const [activeWeek, setActiveWeek] = useState<number>(3);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [liveScores, setLiveScores] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch(`/api/get-scores?week=${activeWeek}&t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (data && typeof data === 'object') {
          setLiveScores(data);
        }
      } catch (e) {
        setLiveScores({});
      }
    };
    fetchScores();
  }, [activeWeek]);

  // Puansis hesaplama fonksiyonu (1 kişi: 12, 2 kişi: 6, 3 kişi: 5, 4 kişi: 4, 5 kişi: 3, 6 kişi: 2, 7+ kişi: 1)
  const calculatePuansis = (exactCount: number): number => {
    if (exactCount === 1) return 12;
    if (exactCount === 2) return 6;
    if (exactCount === 3) return 5;
    if (exactCount === 4) return 4;
    if (exactCount === 5) return 3;
    if (exactCount === 6) return 2;
    if (exactCount >= 7) return 1;
    return 0;
  };

  const week1Matches: Match[] = [
    { id: 'm1', home: 'IBERIA 1999', away: 'SLOVAN BRATISLAVA', score: '0 - 2', league: 'DFO', category: 'CHAMPIONS_LEAGUE', categoryName: 'UEFA ŞAMPIYONLAR LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '21 Temmuz | 19:00' },
    { id: 'm2', home: 'SABAH FK', away: 'KUPS', score: '1 - 0', league: 'DFO', category: 'CHAMPIONS_LEAGUE', categoryName: 'UEFA ŞAMPIYONLAR LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '21 Temmuz | 19:00' },
    { id: 'm3', home: 'FENERBAHÇE', away: 'GORNİK ZABRZE', score: '1 - 0', league: 'DFO', category: 'CHAMPIONS_LEAGUE', categoryName: 'UEFA ŞAMPIYONLAR LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '21 Temmuz | 21:00' },
    { id: 'm4', home: 'THUN', away: 'DINAMO ZAGREB', score: '1 - 1', league: 'DFO', category: 'CHAMPIONS_LEAGUE', categoryName: 'UEFA ŞAMPIYONLAR LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '21 Temmuz | 21:00' },
    { id: 'm5', home: 'STURM GRAZ', away: 'HEART', score: '4 - 0', league: 'DFO', category: 'CHAMPIONS_LEAGUE', categoryName: 'UEFA ŞAMPIYONLAR LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '21 Temmuz | 21:30' },
    { id: 'm6', home: 'LARNE FC', away: 'KIZILYILDIZ', score: '0 - 4', league: 'DFO', category: 'CHAMPIONS_LEAGUE', categoryName: 'UEFA ŞAMPIYONLAR LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '21 Temmuz | 22:00' },
    { id: 'm7', home: 'GOTEBORG', away: 'LEVADIA FC', score: '1 - 2', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '21 Temmuz | 20:00' },
    { id: 'm8', home: 'LEVSKI SOFYA', away: 'UNIVERSITATEA CRAIOVA', score: '1 - 0', league: 'DFO', category: 'CHAMPIONS_LEAGUE', categoryName: 'UEFA ŞAMPIYONLAR LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '22 Temmuz | 20:30' },
    { id: 'm9', home: 'BAŞAKŞEHİR', away: 'INTER TURKU', score: '1 - 1', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '22 Temmuz | 20:45' },
    { id: 'm10', home: 'SPARTAK TRNAVA', away: 'CSKA 1948', score: '0 - 0', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '22 Temmuz | 21:30' },
    { id: 'm11', home: 'ZELEZNICAR PANCEVO', away: 'BRAGA', score: '0 - 1', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '22 Temmuz | 22:00' },
    { id: 'm12', home: 'FCSB', away: 'AUDA RIGA', score: '2 - 3', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '23 Temmuz | 19:00' },
    { id: 'm13', home: 'PAKSI FC', away: 'PANATHINAIKOS', score: '1 - 2', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '23 Temmuz | 19:00' },
    { id: 'm14', home: 'UNIVERSITATEA CLUJ', away: 'BRANN', score: '2 - 2', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '23 Temmuz | 19:00' },
    { id: 'm15', home: 'VOJVODINA', away: 'AJAX', score: '1 - 4', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '23 Temmuz | 19:00' },
    { id: 'm16', home: 'SANTA COLOMA FC', away: 'RAPID WIEN', score: '1 - 3', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '23 Temmuz | 20:00' },
    { id: 'm17', home: 'POLISSYA', away: 'KOPENAG', score: '3 - 3', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '23 Temmuz | 21:00' },
    { id: 'm18', home: 'KARABAĞ FK', away: 'CSKA SOFYA', score: '0 - 0', league: 'DFO', category: 'EUROPA_LEAGUE', categoryName: 'UEFA AVRUPA LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '23 Temmuz | 19:00' },
    { id: 'm19', home: 'DINAMO KIEV', away: 'PAOK', score: '2 - 3', league: 'DFO', category: 'EUROPA_LEAGUE', categoryName: 'UEFA AVRUPA LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '23 Temmuz | 20:00' },
    { id: 'm20', home: 'HAMMARBY', away: 'ANDERLECHT', score: '1 - 1', league: 'DFO', category: 'EUROPA_LEAGUE', categoryName: 'UEFA AVRUPA LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '23 Temmuz | 20:00' },
    { id: 'm21', home: 'BEŞİKTAŞ', away: 'MIDTJYLLAND', score: '1 - 0', league: 'DFO', category: 'EUROPA_LEAGUE', categoryName: 'UEFA AVRUPA LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '23 Temmuz | 21:00' },
    { id: 'm22', home: 'TWENTE', away: 'FERENCVAROS', score: '1 - 2', league: 'DFO', category: 'EUROPA_LEAGUE', categoryName: 'UEFA AVRUPA LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '23 Temmuz | 21:00' },
    { id: 'm23', home: 'ST GALLEN', away: 'BENFICA', score: '2 - 1', league: 'DFO', category: 'EUROPA_LEAGUE', categoryName: 'UEFA AVRUPA LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '23 Temmuz | 21:00' },
    { id: 'm24', home: 'HAJDUK SPLIT', away: 'PATOS', score: '2 - 0', league: 'DFO', category: 'EUROPA_LEAGUE', categoryName: 'UEFA AVRUPA LİGİ ÖN ELEME 2.TUR İLK MAÇ', desc: '23 Temmuz | 22:00' },
  ];

  const week2Matches: Match[] = [
    { id: 'm1', home: 'KUPS', away: 'SABAH FK', score: '0 - 2', league: 'DFO', category: 'CHAMPIONS_LEAGUE', categoryName: 'UEFA ŞAMPIYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '28 Temmuz | 18:00' },
    { id: 'm2', home: 'DINAMO ZAGREB', away: 'THUN', score: '3 - 2', league: 'DFO', category: 'CHAMPIONS_LEAGUE', categoryName: 'UEFA ŞAMPIYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '28 Temmuz | 21:00' },
    { id: 'm3', home: 'HEART', away: 'STURM GRAZ', score: '0 - 2', league: 'DFO', category: 'CHAMPIONS_LEAGUE', categoryName: 'UEFA ŞAMPIYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '28 Temmuz | 21:45' },
    { id: 'm4', home: 'CSKA 1948', away: 'SPARTAK TRNAVA', score: '0 - 0', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '28 Temmuz | 20:30' },
    { id: 'm5', home: 'UNIVERSITATEA CRAIOVA', away: 'LEVSKI SOFYA', score: '2 - 2', league: 'DFO', category: 'CHAMPIONS_LEAGUE', categoryName: 'UEFA ŞAMPIYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '29 Temmuz | 20:30' },
    { id: 'm6', home: 'KIZILYILDIZ', away: 'LARNE FC', score: '5 - 0', league: 'DFO', category: 'CHAMPIONS_LEAGUE', categoryName: 'UEFA ŞAMPIYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '29 Temmuz | 21:00' },
    { id: 'm7', home: 'GORNİK ZABRZE', away: 'FENERBAHÇE', score: '1 - 1', league: 'DFO', category: 'CHAMPIONS_LEAGUE', categoryName: 'UEFA ŞAMPIYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '29 Temmuz | 21:00' },
    { id: 'm8', home: 'SLOVAN BRATISLAVA', away: 'IBERIA 1999', score: '1 - 1', league: 'DFO', category: 'CHAMPIONS_LEAGUE', categoryName: 'UEFA ŞAMPIYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '29 Temmuz | 21:15' },
    { id: 'm9', home: 'KOPENAG', away: 'POLISSYA', score: '2 - 1', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '29 Temmuz | 20:00' },
    { id: 'm10', home: 'RAPID WIEN', away: 'SANTA COLOMA FC', score: '6 - 2', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '29 Temmuz | 21:30' },
    { id: 'm11', home: 'AUDA RIGA', away: 'FCSB', score: '4 - 1', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '30 Temmuz | 19:00' },
    { id: 'm12', home: 'INTER TURKU', away: 'BAŞAKŞEHİR', score: '2 - 0', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '30 Temmuz | 19:00' },
    { id: 'm13', home: 'LEVADIA FC', away: 'GOTEBORG', score: '0 - 1', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '30 Temmuz | 19:30' },
    { id: 'm14', home: 'BRANN', away: 'UNIVERSITATEA CLUJ', score: '3 - 1', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '30 Temmuz | 20:00' },
    { id: 'm15', home: 'AJAX', away: 'VOJVODINA', score: '4 - 1', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '30 Temmuz | 21:00' },
    { id: 'm16', home: 'PANATHINAIKOS', away: 'PAKSI FC', score: '2 - 2', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '30 Temmuz | 21:30' },
    { id: 'm17', home: 'BRAGA', away: 'ZELEZNICAR PANCEVO', score: '4 - 0', league: 'DFO', category: 'EUROPA_LEAGUE', categoryName: 'UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '30 Temmuz | 22:00' },
    { id: 'm18', home: 'MIDTJYLLAND', away: 'BEŞİKTAŞ', score: '0 - 2', league: 'DFO', category: 'EUROPA_LEAGUE', categoryName: 'UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '30 Temmuz | 20:00' },
    { id: 'm19', home: 'PATOS', away: 'HAJDUK SPLIT', score: '2 - 0', league: 'DFO', category: 'EUROPA_LEAGUE', categoryName: 'UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '30 Temmuz | 20:00' },
    { id: 'm20', home: 'PAOK', away: 'DINAMO KIEV', score: '2 - 0', league: 'DFO', category: 'EUROPA_LEAGUE', categoryName: 'UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '30 Temmuz | 20:45' },
    { id: 'm21', home: 'CSKA SOFYA', away: 'KARABAĞ FK', score: '0 - 0', league: 'DFO', category: 'EUROPA_LEAGUE', categoryName: 'UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '30 Temmuz | 21:00' },
    { id: 'm22', home: 'ANDERLECHT', away: 'HAMMARBY', score: '3 - 1', league: 'DFO', category: 'EUROPA_LEAGUE', categoryName: 'UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '30 Temmuz | 21:30' },
    { id: 'm23', home: 'FERENCVAROS', away: 'TWENTE', score: '2 - 2', league: 'DFO', category: 'EUROPA_LEAGUE', categoryName: 'UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '30 Temmuz | 21:30' },
    { id: 'm24', home: 'BENFICA', away: 'ST GALLEN', score: '5 - 0', league: 'DFO', category: 'EUROPA_LEAGUE', categoryName: 'UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ', desc: '30 Temmuz | 22:00' },
  ];

  const rawWeek3Matches: Match[] = [
    { id: 'm1', home: 'OLIMPIYAKOS', away: 'NEC NIJMEGEN', score: '0 - 0', league: 'DFO', category: 'CHAMPIONS_LEAGUE', categoryName: 'UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '4 Ağustos | 21:00' },
    { id: 'm2', home: 'SPARTA PRAG', away: 'OLIMPIC LYON', score: '2 - 1', league: 'DFO', category: 'CHAMPIONS_LEAGUE', categoryName: 'UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '4 Ağustos | 21:00' },
    { id: 'm3', home: 'USG', away: 'BODO-GLIMT', score: '3 - 3', league: 'DFO', category: 'CHAMPIONS_LEAGUE', categoryName: 'UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '4 Ağustos | 21:00' },
    { id: 'm4', home: 'FENERBAHÇE', away: 'STURM GRAZ', score: '2 - 0', league: 'DFO', category: 'CHAMPIONS_LEAGUE', categoryName: 'UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '5 Ağustos | 21:00' },
    { id: 'm5', home: 'PANATHINAIKOS', away: 'CSKA 1948', score: '1 - 1', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '5 Ağustos | 21:30' },
    { id: 'm6', home: 'PAIDE LINNAMEESKOND', away: 'RAPID WIEN', score: '1 - 4', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '6 Ağustos | 19:00' },
    { id: 'm7', home: 'HRADEC KRALOVE', away: 'BEŞİKTAŞ', score: '0 - 1', league: 'DFO', category: 'EUROPA_LEAGUE', categoryName: 'UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '6 Ağustos | 20:00' },
    { id: 'm8', home: 'DEBRECEN', away: 'KOPENAG', score: '0 - 3', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '6 Ağustos | 20:00' },
    { id: 'm9', home: 'DINAMO KIEV', away: 'KARABAĞ FK', score: '1 - 0', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '6 Ağustos | 20:00' },
    { id: 'm10', home: 'GOTEBORG', away: 'GENT', score: '0 - 1', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '6 Ağustos | 20:00' },
    { id: 'm11', home: 'PAOK', away: 'ANDERLECHT', score: '0 - 1', league: 'DFO', category: 'EUROPA_LEAGUE', categoryName: 'UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '6 Ağustos | 20:45' },
    { id: 'm12', home: 'AJAX', away: 'SHELBOURNE', score: '3 - 1', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '6 Ağustos | 21:00' },
    { id: 'm13', home: 'BRAGA', away: 'DINAMO MINSK', score: '1 - 0', league: 'DFO', category: 'CONFERENCE_LEAGUE', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '6 Ağustos | 21:30' },
    { id: 'm14', home: 'BENFICA', away: 'HEART', score: '6 - 1', league: 'DFO', category: 'EUROPA_LEAGUE', categoryName: 'UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '6 Ağustos | 22:00' },
    { id: 'm15', home: 'BOLUSPOR', away: 'MANİSA FK', score: '- - -', league: 'TFF', category: 'CONFERENCE_LEAGUE', categoryName: 'TÜRKİYE 1.LİG', desc: '7 Ağustos | 21:30' },
    { id: 'm17', home: 'SİVASSPOR', away: 'EROKSPOR', score: '- - -', league: 'TFF', category: 'CONFERENCE_LEAGUE', categoryName: 'TÜRKİYE 1.LİG', desc: '8 Ağustos | 19:00' },
    { id: 'm18', home: 'ÜMRANİYE SPOR', away: 'MARDİN 1969', score: '- - -', league: 'TFF', category: 'CONFERENCE_LEAGUE', categoryName: 'TÜRKİYE 1.LİG', desc: '8 Ağustos | 19:00' },
    { id: 'm19', home: 'ANTALYASPOR', away: 'KEÇİÖRENGÜCÜ', score: '- - -', league: 'TFF', category: 'CONFERENCE_LEAGUE', categoryName: 'TÜRKİYE 1.LİG', desc: '8 Ağustos | 21:30' },
    { id: 'm20', home: 'IĞDIR FK', away: 'FATİH KARAGÜMRÜK', score: '- - -', league: 'TFF', category: 'CONFERENCE_LEAGUE', categoryName: 'TÜRKİYE 1.LİG', desc: '9 Ağustos | 19:00' },
    { id: 'm21', home: 'SARIYER', away: 'MUĞLASPOR', score: '- - -', league: 'TFF', category: 'CONFERENCE_LEAGUE', categoryName: 'TÜRKİYE 1.LİG', desc: '9 Ağustos | 19:00' },
    { id: 'm22', home: 'BODRUMSPOR', away: 'BURSASPOR', score: '- - -', league: 'TFF', category: 'CONFERENCE_LEAGUE', categoryName: 'TÜRKİYE 1.LİG', desc: '9 Ağustos | 21:30' },
    { id: 'm23', home: 'VANSPOR FK', away: 'KAYSERİSPOR', score: '- - -', league: 'TFF', category: 'CONFERENCE_LEAGUE', categoryName: 'TÜRKİYE 1.LİG', desc: '9 Ağustos | 21:30' },
    { id: 'm24', home: 'PENDİKSPOR', away: 'BATMAN PETROL SPOR', score: '- - -', league: 'TFF', category: 'CONFERENCE_LEAGUE', categoryName: 'TÜRKİYE 1.LİG', desc: '10 Ağustos | 21:30' },
  ];

  const week3Matches = rawWeek3Matches.map((m) => {
    const dynamicScore = liveScores[m.id];
    return dynamicScore ? { ...m, score: dynamicScore } : m;
  });

  const getAvailableWeeks = () => {
    if (activeLeague === 'DFO') return [1, 2, 3];
    if (activeLeague === 'TFF') return [3];
    return [1, 2, 3];
  };

  const getCurrentMatches = () => {
    let matches: Match[] = [];
    if (activeWeek === 1) matches = week1Matches;
    else if (activeWeek === 2) matches = week2Matches;
    else if (activeWeek === 3) matches = week3Matches;

    if (activeLeague === 'MASTER') return matches;
    return matches.filter((m) => m.league === activeLeague);
  };

  const currentMatches = getCurrentMatches();
  const availableWeeks = getAvailableWeeks();

  const getBadgeStyle = (category: Match['category']) => {
    switch (category) {
      case 'CHAMPIONS_LEAGUE':
        return 'bg-blue-950/90 text-blue-400 border-blue-800/80';
      case 'EUROPA_LEAGUE':
        return 'bg-amber-950/90 text-orange-400 border-orange-800/80';
      case 'CONFERENCE_LEAGUE':
        return 'bg-emerald-950/90 text-emerald-400 border-emerald-800/80';
      default:
        return 'bg-slate-950/90 text-amber-300 border-slate-800';
    }
  };

  const getPredictorsForMatch = (matchId: string) => {
    let dataSource = week1Data;
    if (activeWeek === 2) dataSource = week2Data;
    if (activeWeek === 3) dataSource = week3Data;

    const currentScores = activeWeek === 3 ? week3Matches : (activeWeek === 2 ? week2Matches : week1Matches);
    const targetMatch = currentScores.find(m => m.id === matchId);
    const officialScore = liveScores[matchId] || (targetMatch ? targetMatch.score : '');

    if (!officialScore || officialScore.includes('- -')) return [];

    const predictors = (dataSource || []).filter((user: any) => {
      if (!user.predictions) return false;
      return user.predictions[matchId] !== undefined && user.predictions[matchId] > 0;
    });

    const exactCount = predictors.length;
    const calculatedPoints = calculatePuansis(exactCount);

    return predictors.map((user: any) => ({
      name: user.name,
      puan: calculatedPoints,
    })).sort((a, b) => b.puan - a.puan);
  };

  const renderTeamBadge = (teamName: string) => {
    const shortText = teamName.substring(0, 3).toUpperCase();
    return (
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-950 border border-amber-500/30 rounded-xl flex items-center justify-center font-black text-xs text-amber-400 uppercase shadow-md shrink-0">
        {shortText}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-4 text-slate-100 flex flex-col items-center">
      <h1 className="text-2xl sm:text-4xl font-extrabold text-center mb-1 text-amber-400 tracking-wider uppercase">
        MAÇLAR VE FİKSTÜR
      </h1>
      <p className="text-slate-400 text-xs sm:text-sm mb-6 text-center">
        Organizasyon ve haftalara göre karşılaşmalar, skorlar ve detaylar
      </p>

      {/* Lig Seçim Butonları */}
      <div className="flex gap-2 mb-4 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
        {(['DFO', 'MASTER', 'TFF'] as const).map((league) => (
          <button
            key={league}
            onClick={() => {
              setActiveLeague(league);
              if (league === 'TFF') setActiveWeek(3);
            }}
            className={`px-5 sm:px-6 py-2 rounded-lg text-xs font-black transition-all ${
              activeLeague === league ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {league}
          </button>
        ))}
      </div>

      {/* Hafta Seçim Butonları */}
      <div className="flex gap-2 mb-6">
        {availableWeeks.map((week) => (
          <button
            key={week}
            onClick={() => {
              setActiveWeek(week);
              setSelectedMatch(null);
            }}
            className={`px-5 sm:px-6 py-2 rounded-lg text-xs font-bold border transition-all ${
              activeWeek === week ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {week}. Hafta
          </button>
        ))}
      </div>

      {/* Maç Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {currentMatches.map((match, index) => {
          const predictors = getPredictorsForMatch(match.id);
          const badgeClass = getBadgeStyle(match.category);

          return (
            <div
              key={`${match.id}-${index}`}
              onClick={() => setSelectedMatch(match)}
              className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-3.5 sm:p-4 cursor-pointer transition-all hover:scale-[1.01] shadow-lg group relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="w-full flex justify-center mb-1.5">
                  <span className={`w-full text-center px-3 py-1 rounded-lg border text-[10px] sm:text-[11px] font-extrabold uppercase tracking-tight shadow-sm truncate ${badgeClass}`}>
                    {match.categoryName}
                  </span>
                </div>

                <div className="text-[11px] font-bold text-amber-400/90 text-center mb-1">{match.desc}</div>

                <div className="w-full flex justify-center mb-2.5">
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 font-black text-[10px] sm:text-[11px] px-3 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                    {match.league} - {index + 1}. MAÇ
                  </span>
                </div>

                <div className="flex items-center justify-between py-2.5 px-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
                  <div className="flex flex-col items-center w-2/5 text-center gap-1 min-w-0">
                    {renderTeamBadge(match.home)}
                    <span className="font-extrabold text-[11px] sm:text-xs text-slate-100 truncate w-full">{match.home}</span>
                  </div>

                  {/* KARTTAKİ SKOR KUTUSU (ASLA YAN SATIRA KIRILMAZ) */}
                  <div className="bg-amber-500 text-slate-950 font-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm tracking-wider shadow-lg shrink-0 border border-amber-400 whitespace-nowrap">
                    {match.score}
                  </div>

                  <div className="flex flex-col items-center w-2/5 text-center gap-1 min-w-0">
                    {renderTeamBadge(match.away)}
                    <span className="font-extrabold text-[11px] sm:text-xs text-slate-100 truncate w-full">{match.away}</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-center text-slate-400 mt-2.5 font-semibold group-hover:text-amber-400 transition-colors flex items-center justify-center gap-1.5 border-t border-slate-800/40 pt-2">
                <span className="text-emerald-400 font-bold">🎯 {predictors.length} kişi bildi</span>
                <span className="text-slate-600">•</span>
                <span>Puan alanları gör ➔</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* BÜTÜN MAÇLAR İÇİN ORTAK YENİLENMİŞ MOBİL POPUP (MODAL) */}
      {/* ======================================================== */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 z-50">
          <div className="bg-[#0b1329] border border-slate-800/90 w-[95%] max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-100">
            
            {/* Pop-up Üst Başlık */}
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md font-extrabold uppercase">
                  {selectedMatch.league} - {activeWeek}. HAFTA
                </span>
                <h3 className="text-xs sm:text-sm font-black text-slate-100 mt-1 truncate">
                  {selectedMatch.home} vs {selectedMatch.away}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-slate-400 hover:text-white bg-slate-800/80 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition"
              >
                ✕
              </button>
            </div>

            {/* Pop-up Orta Skor Alanı */}
            <div className="p-3.5 bg-slate-900/60 text-center border-b border-slate-800/80 flex flex-col items-center">
              <span className={`px-2.5 py-1 rounded-md border text-[10px] font-extrabold uppercase tracking-tight mb-2 max-w-full truncate ${getBadgeStyle(selectedMatch.category)}`}>
                {selectedMatch.categoryName}
              </span>

              {/* MOBİLDE KUSURSUZ YAN YANA DURAN SKOR PANELİ */}
              <div className="flex items-center justify-between w-full bg-slate-950/80 rounded-2xl p-2.5 border border-slate-800 my-1">
                {/* Ev Sahibi */}
                <div className="flex flex-col items-center flex-1 min-w-0 px-1">
                  {renderTeamBadge(selectedMatch.home)}
                  <span className="text-[11px] font-bold text-slate-200 truncate w-full text-center mt-1">{selectedMatch.home}</span>
                </div>

                {/* SKOR KUTUSU (ASLA ALT SATIRA KIRILMAZ) */}
                <div className="text-lg sm:text-xl font-black text-amber-400 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-amber-500/30 shadow-md whitespace-nowrap select-none mx-1">
                  {selectedMatch.score}
                </div>

                {/* Deplasman */}
                <div className="flex flex-col items-center flex-1 min-w-0 px-1">
                  {renderTeamBadge(selectedMatch.away)}
                  <span className="text-[11px] font-bold text-slate-200 truncate w-full text-center mt-1">{selectedMatch.away}</span>
                </div>
              </div>

              <div className="text-[11px] text-amber-400 font-bold mt-1">{selectedMatch.desc}</div>
            </div>

            {/* Pop-up Kazananlar Listesi (Mobil Taşmasını Önleyen İç Kaydırma) */}
            <div className="p-3 overflow-y-auto flex-1 space-y-2 max-h-52 sm:max-h-64">
              <h4 className="text-[11px] sm:text-xs font-black text-slate-300 uppercase mb-2 flex items-center justify-between border-b border-slate-800 pb-2">
                <span>🎯 Bu Maçtan Puan Kazananlar</span>
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px]">
                  {getPredictorsForMatch(selectedMatch.id).length} Kişi
                </span>
              </h4>

              {getPredictorsForMatch(selectedMatch.id).length > 0 ? (
                getPredictorsForMatch(selectedMatch.id).map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-xl">
                    <span className="text-xs font-bold text-slate-200 truncate pr-2">{idx + 1}. {p.name}</span>
                    <span className="text-[11px] font-black bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2.5 py-0.5 rounded-lg whitespace-nowrap">
                      +{p.puan} PTS
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-500 text-xs font-medium">
                  Bu maçtan puan kazanan yarışmacı bulunmuyor.
                </div>
              )}
            </div>

            {/* Pop-up Kapat Butonu */}
            <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-right">
              <button
                onClick={() => setSelectedMatch(null)}
                className="w-full sm:w-auto px-5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition text-center"
              >
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}