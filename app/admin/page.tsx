'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { USER_LIST } from '@/app/constants';

// ID VE OYUNCU İSİM EŞLEŞTİRME SÖZLÜĞÜ (USER_LIST ÜZERİNDEN OTOMATİK OLUŞTURULUR)
const userMap: Record<string, string> = Object.fromEntries(
  USER_LIST.map(u => [u.id, u.name])
);

// RESMİ 3. HAFTA MAÇ PROGRAMI (24 MAÇ)
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
  { id: 11, home: "PAOK", away: "ANDERLECHT", info: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ", cat: "DFO" },
  { id: 12, home: "AJAX", away: "SHELBOURNE", info: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ", cat: "DFO" },
  { id: 13, home: "BRAGA", away: "DINAMO MINSK", info: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ", cat: "DFO" },
  { id: 14, home: "BENFICA", away: "HEART", info: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ", cat: "DFO" },
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

// TAHMİN MATRİSİ
const userPredictionsData = [
  { id: "262711", preds: ["2-0","1-2","1-1","1-0","1-1","0-3","0-4","0-1","1-1","0-0","0-1","5-0","2-0","3-1","0-0","1-0","1-2","2-2","2-0","1-1","0-0","1-2","0-0","1-1"] },
  { id: "262734", preds: ["2-1","1-3","0-2","0-2","4-1","0-4","1-2","0-3","1-3","1-4","2-1","4-1","3-1","4-0","1-2","2-1","1-2","3-2","3-1","1-2","1-2","1-2","3-1","1-2"] },
  { id: "262721", preds: ["2-0","1-3","0-3","2-0","3-0","0-4","0-3","0-2","2-2","0-2","0-1","2-0","3-0","3-0","0-2","0-1","2-1","0-3","3-1","0-1","1-1","0-2","0-1","1-1"] },
  { id: "262758", preds: ["2-1","0-2","3-1","1-2","3-0","0-2","0-2","1-1","1-1","1-3","3-0","4-0","2-0","4-1","1-1","1-1","1-1","1-1","3-0","1-1","2-1","1-1","0-1","0-1"] },
  { id: "262716", preds: ["3-1","1-2","0-2","1-1","2-0","1-2","0-1","1-3","1-1","0-3","3-0","3-0","2-0","3-0","1-1","1-1","2-1","2-0","2-1","1-2","1-1","3-1","0-3","2-0"] },
  { id: "262733", preds: ["3-1","1-2","4-2","3-2","3-1","1-2","1-1","0-1","1-0","1-1","1-1","4-1","2-0","4-1","4-1","1-2","1-0","0-0","0-0","1-1","2-0","1-3","2-1","2-1"] },
  { id: "262744", preds: ["2-1","1-2","0-3","1-2","3-0","0-4","0-2","0-2","1-1","1-2","1-3","3-0","3-0","3-1","1-1","2-0","2-1","3-0","2-1","0-2","1-0","1-2","1-1","2-0"] },
  { id: "262763", preds: ["2-0","2-1","1-1","3-1","1-1","1-1","1-2","1-1","1-1","2-1","1-1","3-0","2-1","4-0","2-0","2-0","2-0","2-0","2-0","2-0","1-1","1-1","1-0","1-1"] },
  { id: "262813", preds: ["1-1","1-2","1-0","2-0","3-1","1-2","1-0","0-2","0-0","0-2","1-2","2-0","3-1","4-0","1-1","0-2","1-2","3-0","1-1","0-2","2-0","1-1","1-3","3-0"] },
  { id: "262816", preds: ["3-0","1-2","0-2","0-2","2-1","0-2","0-3","0-3","3-0","0-2","0-2","3-0","1-0","3-0","0-3","2-0","4-0","0-0","1-1","0-4","2-0","0-4","0-2","2-1"] },
  { id: "262718", preds: ["3-1","1-3","2-2","2-1","1-0","1-2","1-2","0-2","1-2","4-2","1-1","3-2","2-0","3-0","2-1","3-2","1-2","2-0","1-1","2-2","1-0","2-2","1-2","3-0"] },
  { id: "262731", preds: ["2-0","1-2","1-1","1-0","1-1","1-2","1-2","1-1","1-1","1-1","1-1","2-1","2-0","2-0","1-1","1-0","1-2","1-1","1-1","1-1","2-1","1-1","1-1","2-1"] },
  { id: "262755", preds: ["2-2","1-3","4-3","2-1","1-1","0-2","1-4","1-3","2-3","1-1","2-1","2-1","2-2","3-0","1-3","1-0","4-2","0-1","0-1","1-0","1-0","1-2","0-1","2-2"] },
  { id: "262749", preds: ["2-0","1-2","1-1","2-1","2-0","0-2","1-3","1-3","1-1","1-2","2-1","4-0","3-0","3-0","1-1","2-1","2-0","1-0","2-1","1-2","2-2","1-1","0-2","2-0"] },
  { id: "262726", preds: ["1-1","1-3","2-0","1-0","2-0","1-1","0-1","0-0","0-1","0-1","1-1","3-0","1-1","3-2","4-1","2-1","3-1","1-1","2-0","1-0","4-0","0-1","0-0","3-1"] },
  { id: "262736", preds: ["3-1","2-2","3-2","3-2","2-0","1-3","1-2","1-3","3-0","2-1","2-3","4-1","2-2","4-1","2-1","1-2","1-3","2-1","1-1","1-3","3-0","1-3","1-1","2-2"] },
  { id: "262707", preds: ["1-0","0-2","0-0","2-0","0-0","0-2","0-0","0-2","0-0","0-0","0-2","3-0","3-0","3-0","0-0","0-0","0-0","0-0","0-0","0-0","0-0","0-0","0-0","1-0"] },
  { id: "262771", preds: ["2-1","2-2","3-2","2-1","3-1","1-4","0-2","2-2","2-2","1-2","2-2","4-1","3-1","4-1","1-2","1-1","2-2","1-2","3-1","1-2","1-2","1-3","1-1","1-2"] },
  { id: "262725", preds: ["2-0","1-1","0-1","2-0","2-0","1-3","0-2","0-2","2-0","0-0","0-1","3-1","2-1","2-0","1-1","0-2","1-0","2-0","2-0","0-2","0-0","1-2","0-1","2-0"] },
  { id: "262702", preds: ["4-0","0-2","0-1","1-0","3-0","0-2","0-3","0-1","1-2","1-0","1-1","2-0","3-0","4-0","0-2","1-0","0-2","1-0","1-0","2-1","1-0","0-2","0-2","1-1"] },
  { id: "351925", preds: ["3-0","2-1","0-1","2-0","2-0","0-2","0-2","0-2","3-0","2-1","0-0","1-0","2-0","2-0","0-0","0-0","2-0","1-0","2-1","0-0","0-0","0-2","0-0","0-0"] },
  { id: "262728", preds: ["2-1","0-0","0-1","0-1","1-2","0-5","0-2","0-1","0-0","1-1","1-0","1-3","3-0","1-2","1-2","2-1","2-0","2-0","2-2","1-0","1-3","0-2","0-1","0-1"] },
  { id: "262738", preds: ["2-2","2-1","1-2","2-1","2-2","2-2","1-2","2-2","1-1","1-1","2-1","3-1","2-1","2-2","1-1","1-1","1-1","1-1","1-1","1-1","1-1","1-2","1-2","1-1"] },
  { id: "262730", preds: ["0-2","0-2","0-2","2-1","1-0","0-1","0-2","0-3","1-1","1-1","2-1","2-1","2-0","2-0","0-3","1-1","1-2","1-0","2-2","2-1","1-0","0-2","1-3","2-0"] },
  { id: "262719", preds: ["2-1","1-1","1-2","1-2","2-1","1-3","1-2","1-1","2-1","0-0","2-1","5-0","3-0","4-0","2-3","2-1","1-1","1-1","3-1","1-1","1-2","1-1","1-1","1-1"] },
  { id: "262772", preds: ["2-0","1-2","1-3","2-0","2-1","0-2","1-2","1-2","1-1","1-1","2-1","4-0","2-0","3-0","1-1","1-1","1-0","1-1","2-1","0-1","0-0","0-2","1-1","2-0"] },
  { id: "262774", preds: ["2-0","1-2","0-2","1-1","2-0","0-1","0-2","1-2","2-2","1-0","1-1","3-1","2-0","4-0","1-0","1-1","1-1","2-0","3-1","2-0","1-0","2-2","1-2","3-0"] },
  { id: "262723", preds: ["2-1","2-2","1-2","2-0","2-0","1-3","0-2","0-2","1-1","1-1","3-2","3-0","2-0","3-1","2-1","2-0","2-2","1-0","2-0","0-2","3-0","1-2","0-2","1-0"] },
  { id: "262706", preds: ["1-0","0-2","0-0","1-0","3-1","0-2","0-3","0-1","0-0","0-1","0-0","4-0","4-1","5-0","0-0","1-0","0-0","1-0","0-1","0-0","0-1","0-1","0-0","3-0"] },
  { id: "262740", preds: ["2-1","2-2","2-2","3-2","3-0","1-2","1-2","1-3","2-2","1-1","1-2","3-1","2-1","2-2","2-2","1-1","2-1","2-0","3-0","2-0","3-1","1-3","2-1","3-1"] },
  { id: "262756", preds: ["1-2","1-2","1-2","3-0","1-0","2-2","1-1","2-1","2-1","1-2","0-2","2-0","2-2","4-0","2-0","1-1","1-1","1-1","1-2","2-0","2-2","2-2","2-0","1-1"] },
  { id: "262790", preds: ["3-1","0-2","0-3","0-2","2-1","0-3","1-3","1-3","2-1","2-1","0-2","3-0","3-1","3-1","0-2","0-2","0-2","0-2","0-1","0-2","0-0","0-3","0-0","1-2"] },
  { id: "262786", preds: ["2-1","1-3","1-1","2-0","4-1","1-4","0-4","1-3","1-2","1-1","1-1","3-1","3-2","3-0","3-1","1-1","2-1","1-1","1-1","1-3","1-1","1-3","3-1","2-1"] },
  { id: "262705", preds: ["3-1","0-2","1-2","3-0","3-0","0-1","1-1","0-2","1-1","2-1","2-0","3-0","4-1","5-1","0-2","0-0","1-1","2-0","2-1","2-1","2-0","0-2","0-1","3-1"] },
  { id: "262753", preds: ["2-1","1-2","1-1","3-1","3-0","1-1","0-2","0-1","1-1","0-1","2-2","6-0","4-1","3-0","2-2","1-1","1-2","3-1","1-2","2-2","2-3","1-2","1-1","1-2"] },
  { id: "262750", preds: ["3-1","1-2","0-2","2-1","2-0","0-3","0-2","0-1","2-2","1-0","1-3","4-1","3-1","4-1","2-1","3-1","2-0","1-1","2-0","0-0","1-1","2-3","1-2","1-1"] },
  { id: "262770", preds: ["3-1","1-2","1-1","4-0","3-0","1-0","1-2","0-2","2-0","0-2","0-0","3-0","3-0","3-0","2-2","1-2","1-2","0-2","2-0","2-1","3-1","0-2","1-2","1-1"] },
  { id: "262754", preds: ["2-0","0-1","0-1","1-0","1-0","0-1","0-1","0-2","0-1","1-0","1-0","3-0","2-0","3-0","0-2","1-0","0-1","0-1","1-0","0-2","2-0","0-2","0-2","2-0"] },
  { id: "262747", preds: ["1-1","1-1","1-1","1-1","1-1","1-1","1-1","1-1","1-1","1-1","1-1","1-1","1-1","1-1","1-1","1-1","1-1","1-1","1-1","1-1","1-1","1-1","1-1","1-1"] },
  { id: "262714", preds: ["1-1","1-1","1-0","1-0","0-0","0-3","0-1","0-2","0-0","1-1","1-0","1-0","2-0","1-1","2-1","1-1","0-2","0-0","0-1","0-0","1-1","0-0","1-0","1-1"] },
  { id: "262717", preds: ["2-1","1-0","3-2","1-1","1-2","0-0","1-2","1-0","1-1","2-2","1-2","1-1","0-1","3-1","1-1","1-0","1-3","1-0","1-0","2-3","2-1","3-1","1-2","1-0"] },
  { id: "262703", preds: ["1-1","0-1","1-1","2-1","1-0","0-2","1-2","1-1","1-1","0-0","1-0","3-0","2-0","1-0","0-0","1-1","1-0","1-0","2-0","0-0","1-1","0-1","0-1","1-0"] },
  { id: "262732", preds: ["2-1","0-2","0-2","3-1","1-1","0-2","1-1","1-1","0-1","1-1","0-2","3-0","2-1","2-0","3-0","1-0","0-2","2-0","3-0","0-2","1-1","1-1","2-0","2-0"] },
  { id: "262709", preds: ["3-1","1-2","2-1","3-1","4-0","0-4","0-1","0-3","1-1","2-2","2-2","5-0","4-0","2-0","2-0","1-1","2-2","1-0","1-1","2-2","1-1","1-3","0-0","3-1"] },
  { id: "262782", preds: ["1-0","2-0","0-2","1-0","1-0","0-0","0-1","0-2","1-1","2-0","0-2","0-3","0-2","0-0","2-0","0-1","1-0","1-2","1-0","1-1","1-0","0-2","0-2","2-0"] },
  { id: "262708", preds: ["2-1","1-2","0-2","2-1","3-1","0-2","0-3","0-2","2-1","2-1","0-2","3-0","2-0","3-0","0-2","2-1","2-1","2-0","3-1","2-1","1-0","1-3","1-0","4-0"] },
  { id: "262739", preds: ["2-0","0-0","0-3","2-1","3-1","0-1","0-1","1-3","2-0","2-0","0-0","4-0","4-1","5-1","2-0","0-1","2-0","3-1","4-0","1-1","0-0","0-2","0-1","1-0"] }
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
  const [selectedWeek, setSelectedWeek] = useState<number>(3);
  const [scores, setScores] = useState<Record<number, { h: string; a: string }>>({});
  const [approvedMatches, setApprovedMatches] = useState<Record<number, boolean>>({});
  const [cardMessages, setCardMessages] = useState<Record<number, string>>({});

  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (!session) {
      router.push('/admin/login');
    } else {
      const parsed = JSON.parse(session);
      if (parsed.id !== '262728') {
        router.push('/admin/login');
      } else {
        setAdminUser(parsed);
      }
    }
  }, [router]);

  const handleScoreChange = (id: number, side: 'h' | 'a', val: string) => {
    setScores(prev => ({
      ...prev,
      [id]: {
        h: side === 'h' ? val : (prev[id]?.h || ''),
        a: side === 'a' ? val : (prev[id]?.a || '')
      }
    }));

    setApprovedMatches(prev => ({ ...prev, [id]: false }));
    setCardMessages(prev => ({ ...prev, [id]: '' }));
  };

  const getBilenUsers = (matchId: number) => {
    const matchScore = scores[matchId];
    if (!matchScore || matchScore.h === '' || matchScore.a === '') return [];
    
    const targetScoreStr = `${matchScore.h}-${matchScore.a}`;
    const matchIndex = matchId - 1;

    return userPredictionsData
      .filter(u => u.preds[matchIndex] === targetScoreStr)
      .map(u => ({ id: u.id, name: userMap[u.id] || `ID: ${u.id}` }));
  };

  const handleApproveAndDistribute = (match: typeof officialWeek3Matches[0]) => {
    const matchScore = scores[match.id];
    const matchKey = `match_${selectedWeek}_${match.id}`;
    const approvedStore = JSON.parse(localStorage.getItem('elitTahmin_ApprovedMatches') || '{}');

    if (!matchScore || matchScore.h === '' || matchScore.a === '') {
      if (approvedStore[matchKey]) {
        delete approvedStore[matchKey];
        localStorage.setItem('elitTahmin_ApprovedMatches', JSON.stringify(approvedStore));

        setCardMessages(prev => ({
          ...prev,
          [match.id]: `🗑️ [${match.id}. MAÇ] Onayı ve dağıtılan puanlar başarıyla iptal edildi / sıfırlandı.`
        }));
        setApprovedMatches(prev => ({ ...prev, [match.id]: false }));
      } else {
        alert('Lütfen önce bu maç için geçerli bir skor seçin!');
      }
      return;
    }

    const scoreString = `${matchScore.h}-${matchScore.a}`;
    const bilenUsers = getBilenUsers(match.id);
    const count = bilenUsers.length;
    const targetLeaguesText = match.cat === 'TFF' ? 'MASTER + TFF' : 'MASTER + DFO';

    if (count === 0) {
      approvedStore[matchKey] = {
        week: selectedWeek,
        matchId: match.id,
        score: scoreString,
        allocations: []
      };
      localStorage.setItem('elitTahmin_ApprovedMatches', JSON.stringify(approvedStore));

      setCardMessages(prev => ({
        ...prev,
        [match.id]: `⚠️ [${scoreString}] skoru onaylandı. Tam bilen yarışmacı bulunamadı.`
      }));
      setApprovedMatches(prev => ({ ...prev, [match.id]: true }));
      return;
    }

    const tahsisPuani = getTahsisPuan(count);
    const namesList = bilenUsers.map(u => u.name).join(', ');

    const userAllocations = bilenUsers.map(u => ({
      id: u.id,
      name: u.name,
      points: tahsisPuani,
      cat: match.cat
    }));

    approvedStore[matchKey] = {
      week: selectedWeek,
      matchId: match.id,
      score: scoreString,
      allocations: userAllocations
    };

    localStorage.setItem('elitTahmin_ApprovedMatches', JSON.stringify(approvedStore));

    setCardMessages(prev => ({
      ...prev,
      [match.id]: `✅ [${scoreString}] skoru güncellendi! ${count} kişiye (${namesList}) ${tahsisPuani}'şer puan [${targetLeaguesText}] tablolarına canlı işlendi.`
    }));
    setApprovedMatches(prev => ({ ...prev, [match.id]: true }));
  };

  const handleResetAllSimulations = () => {
    if (confirm('Tüm simülasyon puan onaylarını sıfırlamak istediğinize emin misiniz? Tablolar ilk günkü haline dönecektir.')) {
      localStorage.removeItem('elitTahmin_ApprovedMatches');
      setApprovedMatches({});
      setCardMessages({});
      setScores({});
      alert('⚡ Tüm test ve simülasyon puanları başarıyla sıfırlandı!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    router.push('/admin/login');
  };

  if (!adminUser) return null;

  return (
    <div className="max-w-7xl mx-auto p-4 text-slate-100 font-sans">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-6 flex items-center justify-between shadow-xl flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black">
            👑
          </div>
          <div>
            <h2 className="text-sm font-black text-amber-400 uppercase">
              {adminUser.name} (YETKİLİ YÖNETİCİ)
            </h2>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              ADMIN TAHMİNMATİK SİSTEMİ
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetAllSimulations}
            className="text-xs font-black bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
          >
            <span>🔄</span> TÜM SİMÜLASYON PUANLARINI SIFIRLA
          </button>

          <button
            onClick={handleLogout}
            className="text-xs font-bold bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/40 px-4 py-2 rounded-xl transition-all"
          >
            ÇIKIŞ YAP
          </button>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 mb-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <span>⚡</span> TAHMİNMATİK ({selectedWeek}. HAFTA) — ONAY PANELİ
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Skoru seçip onaylayın. Skoru "- -" yapıp tekrar basarak maçı iptal edebilir ya da en üstten tüm simülasyonu sıfırlayabilirsiniz!
          </p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl text-emerald-400 font-black text-xs uppercase tracking-wider">
          CANLI SİMÜLASYON
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {officialWeek3Matches.map((match) => {
          const matchScore = scores[match.id] || { h: '', a: '' };
          const hasSelectedScore = matchScore.h !== '' && matchScore.a !== '';
          const bilenUsers = getBilenUsers(match.id);
          const tahsisPuan = getTahsisPuan(bilenUsers.length);
          const isApproved = approvedMatches[match.id];
          const cardMsg = cardMessages[match.id];

          return (
            <div
              key={match.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-all relative overflow-hidden ${
                isApproved ? 'border-emerald-500/80 bg-slate-900/95' : 'border-slate-800 hover:border-amber-500/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                  <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider">
                    📌 {selectedWeek}. HAFTA - {match.id}. MAÇ
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    {isApproved && (
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 animate-pulse">
                        ✅ PUANLAR DAĞITILDI
                      </span>
                    )}

                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                      match.cat === 'TFF' 
                        ? 'bg-red-500/15 text-red-400 border-red-500/30' 
                        : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                    }`}>
                      {match.cat === 'TFF' ? '🇹🇷 TFF ORGANİZASYONU' : '🌍 DFO ORGANİZASYONU'}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-wide">
                  {match.info}
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center space-y-3">
                <div className="w-full flex items-center justify-between px-2">
                  <span className="text-xs font-black text-slate-100 uppercase truncate w-2/5 text-right pr-2">
                    {match.home}
                  </span>
                  <span className="text-amber-500 font-black text-xs">-</span>
                  <span className="text-xs font-black text-slate-100 uppercase truncate w-2/5 text-left pl-2">
                    {match.away}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <select
                    value={matchScore.h}
                    onChange={(e) => handleScoreChange(match.id, 'h', e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-amber-400 font-black text-sm px-3 py-1.5 rounded-xl focus:outline-none cursor-pointer"
                  >
                    <option value="">-</option>
                    {[0,1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <span className="text-slate-600 font-bold text-base">-</span>
                  <select
                    value={matchScore.a}
                    onChange={(e) => handleScoreChange(match.id, 'a', e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-amber-400 font-black text-sm px-3 py-1.5 rounded-xl focus:outline-none cursor-pointer"
                  >
                    <option value="">-</option>
                    {[0,1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-3 bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center min-h-[60px] flex flex-col items-center justify-center">
                {!hasSelectedScore ? (
                  <span className="text-[11px] italic text-slate-500">
                    Skorları seçtiğinizde bilenler burada listelenir...
                  </span>
                ) : bilenUsers.length > 0 ? (
                  <div className="text-left w-full space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-emerald-400 uppercase">
                        🎯 TAM SKORU BİLEN YARIŞMACILAR ({bilenUsers.length} KİŞİ):
                      </span>
                      <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md">
                        Kişi Başı: {tahsisPuan} Puan
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {bilenUsers.map((u) => (
                        <span key={u.id} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                          {u.name}
                        </span>
                      ))}
                    </div>

                    <div className="text-[9px] font-bold text-slate-400 pt-0.5">
                      📍 Aktarılacak Ligler: <span className="text-amber-400 font-black">MASTER</span> + <span className="text-amber-400 font-black">{match.cat}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-[11px] font-bold text-amber-500/80">
                    ❌ Bu skoru tam bilen yarışmacı bulunamadı.
                  </span>
                )}
              </div>

              {cardMsg && (
                <div className={`mt-2 p-2 rounded-lg text-[10px] font-extrabold leading-snug border ${
                  cardMsg.includes('🗑️') 
                    ? 'bg-red-500/20 border-red-500/40 text-red-300' 
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                }`}>
                  {cardMsg}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => handleApproveAndDistribute(match)}
                  className={`w-full font-black px-4 py-3 rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg ${
                    isApproved
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95 shadow-emerald-500/20'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95 shadow-amber-500/20'
                  }`}
                >
                  {isApproved ? (
                    <span>🔄 SKORU GÜNCELLE VEYA SIFIRLA</span>
                  ) : (
                    <span>⚡ ONAYLA VE TAHSİS PUANLARINI DAĞIT</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}