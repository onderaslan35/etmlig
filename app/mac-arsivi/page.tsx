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

  // Gerçek JSON verisinden ve canlı skordan yola çıkarak o maçı bilenleri ve PUANSİS kuralına göre puanını bulan fonksiyon
  const getPredictorsForMatch = (matchId: string) => {
    let dataSource = week1Data;
    if (activeWeek === 2) dataSource = week2Data;
    if (activeWeek === 3) dataSource = week3Data;

    // Aktif haftanın güncel skorlarını al
    const currentScores = activeWeek === 3 ? week3Matches : (activeWeek === 2 ? week2Matches : week1Matches);
    const targetMatch = currentScores.find(m => m.id === matchId);
    const officialScore = liveScores[matchId] || (targetMatch ? targetMatch.score : '');

    // Eğer maç henüz oynanmamışsa veya skor girilmemişse boş dön
    if (!officialScore || officialScore.includes('- -')) return [];

    // Bu maçı tam bilen kullanıcıları filtrele (Senin orijinal JSON yapına göre predictions içinde o maçın skoru veya puanı tutuluyor)
    // Gerçek tahmin verilerini tarıyoruz:
    const predictors = (dataSource || []).filter((user: any) => {
      if (!user.predictions) return false;
      // Eğer kullanıcının predictions objesinde bu maç için kayıt varsa ve puanı 0'dan büyükse
      return user.predictions[matchId] !== undefined && user.predictions[matchId] > 0;
    });

    const exactCount = predictors.length;
    const calculatedPoints = calculatePuansis(exactCount);

    return predictors.map((user: any) => ({
      name: user.name,
      puan: calculatedPoints, // PUANSİS kurallarına göre dinamik puan (1 kişi:12, 2 kişi:6, 3 kişi:5 vb.)
    })).sort((a, b) => b.puan - a.puan);
  };

  const renderTeamBadge = (teamName: string) => {
    const shortText = teamName.substring(0, 3).toUpperCase();
    return (
      <div className="w-12 h-12 bg-slate-950 border border-amber-500/30 rounded-xl flex items-center justify-center font-black text-xs text-amber-400 uppercase shadow-md shrink-0">
        {shortText}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-1 text-amber-400 tracking-wider uppercase">
        MAÇLAR VE FİKSTÜR
      </h1>
      <p className="text-slate-400 text-xs md:text-sm mb-6 text-center">
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
            className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${
              activeLeague === league ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {league}
          </button>
        ))}
      </div>

      {/* Hafta Seçim Butonları */}
      <div className="flex gap-2 mb-8">
        {availableWeeks.map((week) => (
          <button
            key={week}
            onClick={() => {
              setActiveWeek(week);
              setSelectedMatch(null);
            }}
            className={`px-6 py-2 rounded-lg text-xs font-bold border transition-all ${
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
              className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] shadow-lg group relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="w-full flex justify-center mb-1.5">
                  <span className={`w-full text-center px-3 py-1 rounded-lg border text-[11px] font-extrabold uppercase tracking-tight shadow-sm ${badgeClass}`}>
                    {match.categoryName}
                  </span>
                </div>

                <div className="text-[11px] font-bold text-amber-400/90 text-center mb-1">{match.desc}</div>

                <div className="w-full flex justify-center mb-3">
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 font-black text-[11px] px-3 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                    {match.league} - {index + 1}. MAÇ
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 px-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                  <div className="flex flex-col items-center w-2/5 text-center gap-1.5">
                    {renderTeamBadge(match.home)}
                    <span className="font-extrabold text-xs text-slate-100 line-clamp-1">{match.home}</span>
                  </div>

                  <div className="bg-amber-500 text-slate-950 font-black px-4 py-2 rounded-xl text-sm md:text-base tracking-wider shadow-lg shrink-0 border border-amber-400">
                    {match.score}
                  </div>

                  <div className="flex flex-col items-center w-2/5 text-center gap-1.5">
                    {renderTeamBadge(match.away)}
                    <span className="font-extrabold text-xs text-slate-100 line-clamp-1">{match.away}</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-center text-slate-400 mt-3 font-semibold group-hover:text-amber-400 transition-colors flex items-center justify-center gap-1.5 border-t border-slate-800/40 pt-2">
                <span className="text-emerald-400 font-bold">🎯 {predictors.length} kişi bildi</span>
                <span className="text-slate-600">•</span>
                <span>Puan alanları gör ➔</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal / Maç Detayı */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md font-bold">
                  {selectedMatch.league} - {activeWeek}. HAFTA
                </span>
                <h3 className="text-sm font-bold text-slate-200 mt-1">{selectedMatch.home} vs {selectedMatch.away}</h3>
              </div>
              <button onClick={() => setSelectedMatch(null)} className="text-slate-400 hover:text-white bg-slate-800 w-8 h-8 rounded-xl flex items-center justify-center font-bold">✕</button>
            </div>

            <div className="p-4 bg-slate-900/50 text-center border-b border-slate-800 flex flex-col items-center">
              <span className={`px-3 py-1 rounded-lg border text-[11px] font-extrabold uppercase tracking-tight mb-2 ${getBadgeStyle(selectedMatch.category)}`}>
                {selectedMatch.categoryName}
              </span>
              <div className="flex items-center justify-center gap-4 my-2">
                <div className="flex flex-col items-center gap-1 w-28">
                  {renderTeamBadge(selectedMatch.home)}
                  <span className="text-xs font-bold text-slate-200 truncate w-full text-center">{selectedMatch.home}</span>
                </div>
                <div className="text-2xl font-black text-amber-400 bg-slate-950 px-5 py-2 rounded-xl border border-slate-800 shadow-md">
                  {selectedMatch.score}
                </div>
                <div className="flex flex-col items-center gap-1 w-28">
                  {renderTeamBadge(selectedMatch.away)}
                  <span className="text-xs font-bold text-slate-200 truncate w-full text-center">{selectedMatch.away}</span>
                </div>
              </div>
              <div className="text-xs text-amber-400 font-bold mt-1">{selectedMatch.desc}</div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                <span>🎯 Bu Maçtan Puan Kazanan Yarışmacılar</span>
                <span className="bg-slate-800 text-amber-400 px-2 py-0.5 rounded-full text-[10px]">
                  {getPredictorsForMatch(selectedMatch.id).length} Kişi
                </span>
              </h4>
              {getPredictorsForMatch(selectedMatch.id).length > 0 ? (
                getPredictorsForMatch(selectedMatch.id).map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <span className="text-xs font-bold text-slate-200">{idx + 1}. {p.name}</span>
                    <span className="text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg">+{p.puan} PTS</span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs font-medium">Bu maçtan puan kazanan yarışmacı bulunmuyor.</div>
              )}
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 text-right">
              <button onClick={() => setSelectedMatch(null)} className="px-5 py-2 bg-slate-800 text-slate-200 rounded-xl text-xs font-bold">Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}