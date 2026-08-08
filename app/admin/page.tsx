'use client';
import React, { useState, useEffect } from 'react';

interface Match {
  id: string;
  home: string;
  away: string;
  league: 'DFO' | 'TFF';
  categoryName: string;
  desc: string;
  defaultScore: string;
}

export default function AdminPage() {
  const [activeWeek, setActiveWeek] = useState<number>(3);
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({});
  const [loadingMatchId, setLoadingMatchId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const week3Matches: Match[] = [
    { id: 'm1', home: 'OLIMPIYAKOS', away: 'NEC NIJMEGEN', league: 'DFO', categoryName: 'UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '4 Ağustos | 21:00', defaultScore: '0 - 0' },
    { id: 'm2', home: 'SPARTA PRAG', away: 'OLIMPIC LYON', league: 'DFO', categoryName: 'UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '4 Ağustos | 21:00', defaultScore: '2 - 1' },
    { id: 'm3', home: 'USG', away: 'BODO-GLIMT', league: 'DFO', categoryName: 'UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '4 Ağustos | 21:00', defaultScore: '3 - 3' },
    { id: 'm4', home: 'FENERBAHÇE', away: 'STURM GRAZ', league: 'DFO', categoryName: 'UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '5 Ağustos | 21:00', defaultScore: '2 - 0' },
    { id: 'm5', home: 'PANATHINAIKOS', away: 'CSKA 1948', league: 'DFO', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '5 Ağustos | 21:30', defaultScore: '1 - 1' },
    { id: 'm6', home: 'PAIDE LINNAMEESKOND', away: 'RAPID WIEN', league: 'DFO', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '6 Ağustos | 19:00', defaultScore: '1 - 4' },
    { id: 'm7', home: 'HRADEC KRALOVE', away: 'BEŞİKTAŞ', league: 'DFO', categoryName: 'UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '6 Ağustos | 20:00', defaultScore: '0 - 1' },
    { id: 'm8', home: 'DEBRECEN', away: 'KOPENAG', league: 'DFO', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '6 Ağustos | 20:00', defaultScore: '0 - 3' },
    { id: 'm9', home: 'DINAMO KIEV', away: 'KARABAĞ FK', league: 'DFO', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '6 Ağustos | 20:00', defaultScore: '1 - 0' },
    { id: 'm10', home: 'GOTEBORG', away: 'GENT', league: 'DFO', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '6 Ağustos | 20:00', defaultScore: '0 - 1' },
    { id: 'm11', home: 'PAOK', away: 'ANDERLECHT', league: 'DFO', categoryName: 'UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '6 Ağustos | 20:45', defaultScore: '0 - 1' },
    { id: 'm12', home: 'AJAX', away: 'SHELBOURNE', league: 'DFO', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '6 Ağustos | 21:00', defaultScore: '3 - 1' },
    { id: 'm13', home: 'BRAGA', away: 'DINAMO MINSK', league: 'DFO', categoryName: 'UEFA KONFERANS LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '6 Ağustos | 21:30', defaultScore: '1 - 0' },
    { id: 'm14', home: 'BENFICA', away: 'HEART', league: 'DFO', categoryName: 'UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İLK MAÇ', desc: '6 Ağustos | 22:00', defaultScore: '6 - 1' },
    { id: 'm15', home: 'BOLUSPOR', away: 'MANİSA FK', league: 'TFF', categoryName: 'TÜRKİYE 1.LİG', desc: '7 Ağustos | 21:30', defaultScore: '1 - 2' },
    { id: 'm16', home: 'BANDIRMASPOR', away: 'İSTANBULSPOR', league: 'TFF', categoryName: 'TÜRKİYE 1.LİG', desc: '8 Ağustos | 17:00', defaultScore: '0 - 0' },
    { id: 'm17', home: 'SİVASSPOR', away: 'EROKSPOR', league: 'TFF', categoryName: 'TÜRKİYE 1.LİG', desc: '8 Ağustos | 19:00', defaultScore: '0 - 0' },
    { id: 'm18', home: 'ÜMRANİYE SPOR', away: 'MARDİN 1969', league: 'TFF', categoryName: 'TÜRKİYE 1.LİG', desc: '8 Ağustos | 19:00', defaultScore: '0 - 0' },
    { id: 'm19', home: 'ANTALYASPOR', away: 'KEÇİÖRENGÜCÜ', league: 'TFF', categoryName: 'TÜRKİYE 1.LİG', desc: '8 Ağustos | 21:30', defaultScore: '0 - 0' },
    { id: 'm20', home: 'IĞDIR FK', away: 'FATİH KARAGÜMRÜK', league: 'TFF', categoryName: 'TÜRKİYE 1.LİG', desc: '9 Ağustos | 19:00', defaultScore: '0 - 0' },
    { id: 'm21', home: 'SARIYER', away: 'MUĞLASPOR', league: 'TFF', categoryName: 'TÜRKİYE 1.LİG', desc: '9 Ağustos | 19:00', defaultScore: '0 - 0' },
    { id: 'm22', home: 'BODRUMSPOR', away: 'BURSASPOR', league: 'TFF', categoryName: 'TÜRKİYE 1.LİG', desc: '9 Ağustos | 21:30', defaultScore: '0 - 0' },
    { id: 'm23', home: 'VANSPOR FK', away: 'KAYSERİSPOR', league: 'TFF', categoryName: 'TÜRKİYE 1.LİG', desc: '9 Ağustos | 21:30', defaultScore: '0 - 0' },
    { id: 'm24', home: 'PENDİKSPOR', away: 'BATMAN PETROL SPOR', league: 'TFF', categoryName: 'TÜRKİYE 1.LİG', desc: '10 Ağustos | 21:30', defaultScore: '0 - 0' },
  ];

  useEffect(() => {
    // Önce varsayılan skorları yükleyelim
    const initialScores: Record<string, { home: string; away: string }> = {};
    week3Matches.forEach((m) => {
      const parts = m.defaultScore.split('-').map((s) => s.trim());
      initialScores[m.id] = { home: parts[0] || '0', away: parts[1] || '0' };
    });

    // Varsa kaydedilmiş dinamik skorlarla ezelim
    fetch(`/api/get-scores?week=${activeWeek}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          Object.keys(data).forEach((matchId) => {
            const parts = data[matchId].split('-').map((s: string) => s.trim());
            if (parts.length === 2) {
              initialScores[matchId] = { home: parts[0], away: parts[1] };
            }
          });
        }
        setScores(initialScores);
      })
      .catch(() => {
        setScores(initialScores);
      });
  }, [activeWeek]);

  const handleScoreChange = (matchId: string, side: 'home' | 'away', value: string) => {
    setScores((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [side]: value,
      },
    }));
  };

  const handleSaveMatch = async (matchId: string) => {
    const matchScore = scores[matchId];
    if (!matchScore || matchScore.home === undefined || matchScore.away === undefined) {
      alert('Lütfen skoru giriniz');
      return;
    }

    const scoreString = `${matchScore.home} - ${matchScore.away}`;
    setLoadingMatchId(matchId);
    setMessage(null);

    try {
      const res = await fetch('/api/save-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          week: activeWeek,
          score: scoreString,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setMessage(result.message);
      } else {
        alert('Hata oluştu: ' + (result.error || 'Bilinmeyen hata'));
      }
    } catch (err) {
      alert('Bağlantı hatası oluştu.');
    } finally {
      setLoadingMatchId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 text-slate-100 flex flex-col items-center">
      <h1 className="text-2xl font-black text-amber-400 mb-2 uppercase">ADMIN SKOR GİRİŞ PANELİ</h1>
      <p className="text-xs text-slate-400 mb-6">Skoru girip Kaydet'e basıldığında PUANSİS ve Maç Arşivi otomatik güncellenir.</p>

      {message && (
        <div className="w-full mb-4 p-3 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-bold text-xs rounded-xl text-center">
          {message}
        </div>
      )}

      <div className="w-full space-y-3">
        {week3Matches.map((match) => {
          const currentScore = scores[match.id] || { home: '0', away: '0' };
          const isLoading = loadingMatchId === match.id;

          return (
            <div key={match.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
              <div className="w-1/3 text-right text-xs font-bold text-slate-200">{match.home}</div>

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={currentScore.home}
                  onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                  className="w-10 h-9 bg-slate-950 border border-slate-700 rounded-lg text-center font-black text-amber-400 text-sm focus:outline-none focus:border-amber-500"
                />
                <span className="text-slate-500 font-bold">:</span>
                <input
                  type="text"
                  value={currentScore.away}
                  onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                  className="w-10 h-9 bg-slate-950 border border-slate-700 rounded-lg text-center font-black text-amber-400 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="w-1/3 text-left text-xs font-bold text-slate-200">{match.away}</div>

              <button
                onClick={() => handleSaveMatch(match.id)}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs px-4 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                {isLoading ? '...' : '💾 Kaydet'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}