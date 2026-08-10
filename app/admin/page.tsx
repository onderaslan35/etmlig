'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { USER_LIST } from '@/app/constants';

const userMap: Record<string, string> = Object.fromEntries(
  USER_LIST.map(u => [u.id, u.name])
);

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

const userPredictionsData: any[] = [];

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
  const [selectedWeek] = useState<number>(3);
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
    const key = id.toString();
    setScores(prev => ({
      ...prev,
      [key]: {
        h: side === 'h' ? val : (prev[key]?.h || ''),
        a: side === 'a' ? val : (prev[key]?.a || '')
      }
    }));
    setApprovedMatches(prev => ({ ...prev, [key]: false }));
  };

  const getBilenUsers = (matchId: number) => {
    const key = matchId.toString();
    const matchScore = scores[key];
    if (!matchScore || !matchScore.h || !matchScore.a) return [];
    
    const targetScoreStr = `${matchScore.h}-${matchScore.a}`;
    return userPredictionsData.filter(u => u.preds && u.preds[matchId - 1] === targetScoreStr)
      .map(u => ({ id: u.id, name: userMap[u.id] || `ID: ${u.id}` }));
  };

  const handleApproveAndDistribute = (match: any) => {
    const key = match.id.toString();
    const matchScore = scores[key];
    const matchKey = `match_${selectedWeek}_${key}`;
    const approvedStore = JSON.parse(localStorage.getItem('elitTahmin_ApprovedMatches') || '{}');

    if (!matchScore || !matchScore.h || !matchScore.a) return;

    const scoreString = `${matchScore.h}-${matchScore.a}`;
    const bilenUsers = getBilenUsers(match.id);
    const count = bilenUsers.length;

    if (count > 0) {
      const tahsisPuani = getTahsisPuan(count);
      const userAllocations = bilenUsers.map(u => ({ id: u.id, name: u.name, points: tahsisPuani, cat: match.cat }));

      approvedStore[matchKey] = { week: selectedWeek, matchId: match.id, score: scoreString, allocations: userAllocations };
      
      const weeklyScoresStore = JSON.parse(localStorage.getItem('elitTahmin_WeeklyScores') || '{}');
      if (!weeklyScoresStore[selectedWeek]) weeklyScoresStore[selectedWeek] = {};
      bilenUsers.forEach((u: any) => {
        weeklyScoresStore[selectedWeek][u.id] = (weeklyScoresStore[selectedWeek][u.id] || 0) + 1;
      });

      localStorage.setItem('elitTahmin_WeeklyScores', JSON.stringify(weeklyScoresStore));
      setCardMessages(prev => ({ ...prev, [key]: `✅ İşlendi: ${count} kişi puan kazandı.` }));
    } else {
      setCardMessages(prev => ({ ...prev, [key]: `⚠️ Bu skoru bilen yarışmacı bulunamadı.` }));
    }

    localStorage.setItem('elitTahmin_ApprovedMatches', JSON.stringify(approvedStore));
    setApprovedMatches(prev => ({ ...prev, [key]: true }));
  };

  if (!adminUser) return null;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 text-slate-100">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 mb-8 text-center shadow-xl backdrop-blur-md">
        <h1 className="text-2xl md:text-3xl font-black text-amber-400 tracking-wider uppercase mb-2">
          ⚡ ADMIN TAHMİNMATİK (3. HAFTA)
        </h1>
        <p className="text-xs md:text-sm text-slate-400 font-medium">
          Maç skorlarını girerek kazanan yarışmacıları anında onaylayın ve puanları dağıtın!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {officialWeek3Matches.map(match => {
          const key = match.id.toString();
          const isApproved = approvedMatches[key];
          const message = cardMessages[key];
          const bilenCount = getBilenUsers(match.id).length;

          return (
            <div 
              key={match.id} 
              className="bg-slate-950/90 border border-slate-800 hover:border-amber-500/40 transition-all rounded-2xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden"
            >
              <div>
                <div className="flex justify-between items-center text-[11px] text-slate-400 font-bold mb-3 border-b border-slate-800/80 pb-2">
                  <span className="text-amber-400 tracking-wider font-extrabold uppercase">
                    3. HAFTA - {match.id}. MAÇ ({match.cat})
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
                    <input 
                      type="number" 
                      min="0"
                      value={scores[key]?.h || ''}
                      onChange={(e) => handleScoreChange(match.id, 'h', e.target.value)}
                      className="w-11 h-11 text-center bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl font-black text-lg text-amber-400 outline-none shadow-inner"
                      placeholder="-"
                    />
                    <span className="text-xs font-black text-slate-500">-</span>
                    <input 
                      type="number" 
                      min="0"
                      value={scores[key]?.a || ''}
                      onChange={(e) => handleScoreChange(match.id, 'a', e.target.value)}
                      className="w-11 h-11 text-center bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl font-black text-lg text-amber-400 outline-none shadow-inner"
                      placeholder="-"
                    />
                  </div>

                  <span className="font-extrabold text-sm sm:text-base text-slate-100 uppercase truncate w-[38%] text-right">
                    {match.away}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">
                    Bilen Yarışmacı: <strong className="text-amber-400">{bilenCount} kişi</strong>
                  </span>
                  <button
                    onClick={() => handleApproveAndDistribute(match)}
                    className={`px-5 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md ${
                      isApproved 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-400'
                    }`}
                  >
                    {isApproved ? '✓ ONAYLANDI' : 'ONAYLA & DAĞIT'}
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