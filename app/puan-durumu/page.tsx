'use client';

import { useState, useEffect } from 'react';
import PuanDurumuTable from '@/components/PuanDurumuTable';
import week1Data from '@/app/data/week1_predictions.json';
import week2Data from '@/app/data/week2_predictions.json';
import week3Data from '@/app/data/week3_predictions.json';

interface UserPrediction {
  id: string;
  name: string;
  score: number;
  exacts: number;
}

interface StandingUser {
  id: string;
  name: string;
  w1_score: number;
  w2_score: number;
  w3_score: number;
  total_score: number;
  exacts: number;
}

export default function MasterPage() {
  const [selectedWeek, setSelectedWeek] = useState<number | 'total'>('total');
  const [computedStandings, setComputedStandings] = useState<StandingUser[]>([]);

  useEffect(() => {
    const userMap: Record<string, StandingUser> = {};

    // 1. Hafta Verilerini İşle
    (week1Data as UserPrediction[]).forEach((u) => {
      userMap[u.id] = {
        id: u.id,
        name: u.name,
        w1_score: u.score || 0,
        w2_score: 0,
        w3_score: 0,
        total_score: u.score || 0,
        exacts: u.exacts || 0,
      };
    });

    // 2. Hafta Verilerini İşle
    (week2Data as UserPrediction[]).forEach((u) => {
      if (!userMap[u.id]) {
        userMap[u.id] = { id: u.id, name: u.name, w1_score: 0, w2_score: 0, w3_score: 0, total_score: 0, exacts: 0 };
      }
      userMap[u.id].w2_score = u.score || 0;
      userMap[u.id].exacts += u.exacts || 0;
    });

    // 3. Hafta Verilerini İşle
    (week3Data as UserPrediction[]).forEach((u) => {
      if (!userMap[u.id]) {
        userMap[u.id] = { id: u.id, name: u.name, w1_score: 0, w2_score: 0, w3_score: 0, total_score: 0, exacts: 0 };
      }
      userMap[u.id].w3_score = u.score || 0;
      userMap[u.id].exacts += u.exacts || 0;
    });

    // Toplam Puanları Hesapla ve Sırala
    const list = Object.values(userMap).map((u) => ({
      ...u,
      total_score: u.w1_score + u.w2_score + u.w3_score,
    }));

    list.sort((a, b) => b.total_score - a.total_score || b.exacts - a.exacts);

    setComputedStandings(list);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="flex justify-center gap-2 md:gap-4 mb-6 flex-wrap">
        <button
          onClick={() => setSelectedWeek(1)}
          className={`px-4 py-2 rounded-lg font-bold transition text-xs md:text-sm ${
            selectedWeek === 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700'
          }`}
        >
          1. Hafta
        </button>
        <button
          onClick={() => setSelectedWeek(2)}
          className={`px-4 py-2 rounded-lg font-bold transition text-xs md:text-sm ${
            selectedWeek === 2 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700'
          }`}
        >
          2. Hafta
        </button>
        <button
          onClick={() => setSelectedWeek(3)}
          className={`px-4 py-2 rounded-lg font-bold transition text-xs md:text-sm ${
            selectedWeek === 3 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700'
          }`}
        >
          3. Hafta
        </button>
        <button
          onClick={() => setSelectedWeek('total')}
          className={`px-4 py-2 rounded-lg font-bold transition text-xs md:text-sm ${
            selectedWeek === 'total' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700'
          }`}
        >
          Genel Puan Durumu
        </button>
      </div>

      <PuanDurumuTable 
        leagueTitle={`Master Ligi - ${selectedWeek === 'total' ? 'Genel Sıralama' : `${selectedWeek}. Hafta`}`} 
        standings={computedStandings} 
        activeWeek={selectedWeek}
      />
    </main>
  );
}