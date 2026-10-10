'use client';

import React from 'react';
import { getEliteTheme } from '@/utils/themeEngine';

// TypeScript için gelen füzelerin cinsini tanımlıyoruz (Kalkanı indiren kod bu)
interface LiveMatchCardProps {
    match: any;
    homeScore: string;
    awayScore: string;
    liveInfo: any;
    currentWinners: string[];
    displayPoints: number;
    isSoundEnabled: boolean;
}

export default function LiveMatchCard({ 
    match, 
    homeScore, 
    awayScore, 
    liveInfo, 
    currentWinners, 
    displayPoints,
    isSoundEnabled 
}: LiveMatchCardProps) {
    const [isWinnersOpen, setIsWinnersOpen] = React.useState(false);
    
    const status = liveInfo?.status || 'NOT_STARTED';
    const isLive = status === 'LIVE' || status === 'WAITING_APPROVAL' || status === 'HT';

    const homeTeamUpper = match.home_team?.toUpperCase() || match.homeTeam?.toUpperCase() || "";
    const awayTeamUpper = match.away_team?.toUpperCase() || match.awayTeam?.toUpperCase() || "";

    const theme = getEliteTheme(match.category, homeTeamUpper, awayTeamUpper);
    const winnersCount = currentWinners.length;

    return (
        <div className={`w-full bg-slate-900 border ${isLive ? 'border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.2)]' : 'border-slate-800'} rounded-xl overflow-hidden transition-all flex flex-col`}>
            {/* Kart Başlığı */}
            <div className={`px-3 py-2 flex justify-between items-center text-[10px] font-bold ${isLive ? 'bg-rose-950/40 text-rose-300' : 'bg-slate-950 text-slate-400'}`}>
                <div className="flex items-center gap-1.5">
                    {isLive && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>}
                    <span>{match.week_num}. HAFTA | {match.match_index}. MAÇ</span>
                </div>
                <span className="text-indigo-400">{match.match_time}</span>
            </div>

            {/* Skor Alanı */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex flex-col items-center flex-1">
                    <span className="text-white font-black text-xs text-center uppercase mb-1">{homeTeamUpper}</span>
                </div>

                <div className="flex items-center gap-2 px-4">
                    <span className={`text-2xl font-black ${isLive ? 'text-rose-400' : 'text-slate-200'}`}>{homeScore}</span>
                    <span className="text-slate-600 font-bold">-</span>
                    <span className={`text-2xl font-black ${isLive ? 'text-rose-400' : 'text-slate-200'}`}>{awayScore}</span>
                </div>

                <div className="flex flex-col items-center flex-1">
                    <span className="text-white font-black text-xs text-center uppercase mb-1">{awayTeamUpper}</span>
                </div>
            </div>

            {/* Alt Bilgi & Bilenler */}
            <div className="bg-slate-950/80 px-3 py-2.5 border-t border-slate-800 flex flex-col">
                <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] font-bold text-amber-500">
                        {winnersCount > 0 ? `🎯 ${winnersCount} KİŞİ BİLDİ (+${displayPoints} P)` : "BU SKORU BİLEN YOK"}
                    </span>
                    {winnersCount > 0 && (
                        <button onClick={() => setIsWinnersOpen(!isWinnersOpen)} className="text-cyan-500 hover:text-cyan-400 text-[10px] font-bold outline-none transition-colors">
                            {isWinnersOpen ? "Gizle ▲" : "Bilenleri gör →"}
                        </button>
                    )}
                </div>
                
                {isWinnersOpen && winnersCount > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800/50 flex flex-wrap gap-1">
                        {currentWinners.map((p, i) => (
                            <span key={i} className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-300 uppercase">
                                {p}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}