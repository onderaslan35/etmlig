'use client';
import React from 'react';
import LiveMatchCard from '@/components/LiveMatchCard';

export default function CanliYayinMerkezi() {
  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center min-h-screen">
      <div className="flex flex-col items-center text-center mb-5 mt-4">
        <h1 className="text-2xl sm:text-3xl font-black text-rose-500 tracking-widest flex items-center justify-center gap-3 uppercase drop-shadow-[0_0_15px_rgba(225,29,72,0.4)] animate-pulse">
          🔴 CANLI YAYIN MERKEZİ
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-2 font-medium tracking-wide">
          Anlık Skorlar, Puan Lideri ve Skor Kralı
        </p>
      </div>
      
      {/* İŞTE KESİP BURAYA YAPIŞTIRDIĞIMIZ ORİJİNAL KARTIN */}
      <div className="w-full mb-6">
        <LiveMatchCard />
      </div>
    </div>
  );
}