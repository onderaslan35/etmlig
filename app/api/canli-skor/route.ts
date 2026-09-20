import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 0; 
export const maxDuration = 60; 

const API_KEY = "933e5ccc09194d0db30171e2bca20ca9";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function isTffMatchCheck(category: string) {
    const uppercaseCat = category ? category.toUpperCase() : '';
    return uppercaseCat.includes("TÜRKİYE") || uppercaseCat.includes("TFF") || uppercaseCat.includes("AMATÖR") || uppercaseCat.includes("PTT") || uppercaseCat.includes("2.LİG") || uppercaseCat.includes("3.LİG");
}

export async function GET(request: Request) {
    const nowUTC = new Date();
    const todayTurkey = new Date(nowUTC.getTime() + (3 * 60 * 60 * 1000));
    const d = String(todayTurkey.getUTCDate()).padStart(2, '0');
    const m = String(todayTurkey.getUTCMonth() + 1).padStart(2, '0');
    const y = todayTurkey.getUTCFullYear();
    const todayStr = `${d}.${m}.${y}`; 

    const { data: bulten } = await supabase.from('matches_bulletin').select('match_index, week_num, match_date, category');
    if (bulten) {
        const todaysMatches = bulten.filter(match => match.match_date === todayStr);
        if (todaysMatches.length > 0) {
            const matchIds = todaysMatches.map(match => (match.week_num * 100) + match.match_index);
            const { data: liveData } = await supabase.from('live_matches').select('api_match_id, status').in('id', matchIds).neq('status', 'FINISHED').not('api_match_id', 'is', null);

            if (liveData && liveData.length > 0) {
                const apiIds = liveData.map(l => l.api_match_id).join('-');
                const HEDEF = `https://v3.football.api-sports.io/fixtures?ids=${apiIds}`;
                try {
                    const res = await fetch(HEDEF, { method: 'GET', headers: { 'x-apisports-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }, cache: 'no-store' });
                    if (res.ok) {
                        const sonuc = await res.json();
                        const maclar = sonuc.response || [];
                        for (const mac of maclar) {
                            const macId = mac.fixture.id; 
                            const evSkor = mac.goals.home ?? 0;
                            const depSkor = mac.goals.away ?? 0;
                            const durum = mac.fixture.status.short; 
                            
                            let statu = 'NOT_STARTED';
                            if (durum === 'FT' || durum === 'AET' || durum === 'PEN') statu = 'FINISHED';
                            else if (['1H','2H','HT','ET','P'].includes(durum)) statu = 'LIVE';

                            await supabase.from('live_matches').update({ home_score: evSkor.toString(), away_score: depSkor.toString(), status: statu }).eq('api_match_id', macId);
                        }
                    }
                } catch (e) { console.log("API Cekim Hatasi", e); }
            }
        }
    }

    try {
        const { data: dbPlayers } = await supabase.from('players').select('*');
        const playersList: Record<string, string> = {};
        if (dbPlayers) dbPlayers.forEach(p => { const pid = p.username || p.id; if (pid !== 'mankoman') playersList[pid] = p.name || p.full_name; });

        const fetchTable = async (t: string) => { const { data } = await supabase.from(t).select('*'); return data || []; };
        const [masterData, dfoData, tffPointsData, skorDfoData, skorTffData, manualPointsData, dbLiveMatches] = await Promise.all([
            fetchTable('master_weekly_points'), fetchTable('dfo_weekly_points'), fetchTable('tff_weekly_points'),
            fetchTable('dfo_weekly_scores'), fetchTable('tff_weekly_scores'), fetchTable('points'), fetchTable('live_matches')
        ]);

        const dynamicBonuses: Record<number, Record<string, number>> = {};
        manualPointsData.forEach(b => {
            const evSahibi = String(b.ev_sahibi).toUpperCase().trim();
            if (String(b.kategori).toUpperCase().trim() === 'MASTER' && ['HAFTANIN', 'SKOR'].includes(evSahibi)) {
                if (!dynamicBonuses[b.hafta]) dynamicBonuses[b.hafta] = {};
                if (!dynamicBonuses[b.hafta][b.username]) dynamicBonuses[b.hafta][b.username] = 0;
                dynamicBonuses[b.hafta][b.username] += b.puan;
            }
        });

        let allPredictions: any[] = [];
        let from = 0; let step = 1000; let keepFetching = true;
        while(keepFetching) {
            const { data } = await supabase.from('player_predictions').select('*').gte('week_num', 5).order('id', { ascending: true }).range(from, from + step - 1);
            if (data && data.length > 0) { allPredictions = [...allPredictions, ...data]; if (data.length < step) keepFetching = false; else from += step; } 
            else keepFetching = false;
        }

        const pDict: Record<string, string> = {};
        allPredictions.forEach(pred => pDict[`${String(pred.user_id)}-${pred.week_num}-${pred.match_index}`] = pred.predicted_score.replace(/\s+/g, ''));

        const catDict: Record<string, string> = {};
        if (bulten) bulten.forEach((m: any) => catDict[`${m.week_num}-${m.match_index}`] = m.category || "");

        let st: Record<string, any> = {};
        Object.keys(playersList).forEach(uid => {
            const md = masterData.find((r:any) => String(r.id||r.username||r.user_id) === uid) || {w1:0, w2:0, w3:0, w4:0};
            const dd = dfoData.find((r:any) => String(r.id||r.username||r.user_id) === uid) || {w1:0, w2:0, w3:0, w4:0};
            const td = tffPointsData.find((r:any) => String(r.id||r.username||r.user_id) === uid) || {w1:0, w2:0, w3:0, w4:0};
            const sd = skorDfoData.find((r:any) => String(r.id||r.username||r.user_id) === uid) || {w1:0, w2:0, w3:0, w4:0};
            const stff = skorTffData.find((r:any) => String(r.id||r.username||r.user_id) === uid) || {w1:0, w2:0, w3:0, w4:0};

            st[uid] = { 
                masterW1W4: Number(md.w1||0) + Number(md.w2||0) + Number(md.w3||0) + Number(md.w4||0),
                dfoPts: Number(dd.w1||0) + Number(dd.w2||0) + Number(dd.w3||0) + Number(dd.w4||0),
                tffPts: Number(td.w1||0) + Number(td.w2||0) + Number(td.w3||0) + Number(td.w4||0),
                skorPts: Number(sd.w1||0) + Number(sd.w2||0) + Number(sd.w3||0) + Number(sd.w4||0) + Number(stff.w1||0) + Number(stff.w2||0) + Number(stff.w3||0) + Number(stff.w4||0),
                masterBaseAll: 0, masterBasePrev: 0, masterLive: 0,
                dfoBaseAll: 0, dfoBasePrev: 0, dfoLive: 0,
                tffBaseAll: 0, tffBasePrev: 0, tffLive: 0
            };
        });

        let highestWeekFound = 6; 
        dbLiveMatches.forEach((m: any) => {
             const weekNum = Math.floor(m.id / 100);
             if (weekNum >= 5 && weekNum <= 38 && m.home_score && m.home_score !== '-' && m.away_score && m.away_score !== '-') {
                 if (weekNum > highestWeekFound) highestWeekFound = weekNum;
             }
        });

        dbLiveMatches.forEach((dbMatch: any) => {
            const weekNum = Math.floor(dbMatch.id / 100);
            const matchIndex = dbMatch.id % 100;
            
            if (weekNum >= 5 && weekNum <= 38 && dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-') {
                const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`.replace(/\s+/g, '');
                const winnerIds = Object.keys(playersList).filter(id => pDict[`${id}-${weekNum}-${matchIndex}`] === targetScore);
                
                let pts = 1;
                if(winnerIds.length === 1) pts = 12; else if(winnerIds.length === 2) pts = 6;
                else if(winnerIds.length === 3) pts = 5; else if(winnerIds.length === 4) pts = 4;
                else if(winnerIds.length === 5) pts = 3; else if(winnerIds.length === 6) pts = 2;
                else if(winnerIds.length >= 7) pts = 1; else pts = 0;

                const isFinished = dbMatch.status === 'FINISHED' || dbMatch.status === 'FT';
                const isLive = ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'WAITING_APPROVAL'].includes(dbMatch.status);
                const isTff = isTffMatchCheck(catDict[`${weekNum}-${matchIndex}`] || "");

                winnerIds.forEach(wId => {
                    if (st[wId]) {
                        if (isFinished) {
                            st[wId].masterBaseAll += pts;
                            if (weekNum < highestWeekFound) st[wId].masterBasePrev += pts; 
                            
                            if (isTff) {
                                st[wId].tffPts += pts;
                                st[wId].tffBaseAll += pts;
                                if (weekNum < highestWeekFound) st[wId].tffBasePrev += pts; 
                            } else {
                                st[wId].dfoPts += pts;
                                st[wId].dfoBaseAll += pts;
                                if (weekNum < highestWeekFound) st[wId].dfoBasePrev += pts;
                            }
                            st[wId].skorPts += 1;
                        } else if (isLive) {
                            st[wId].masterLive += pts;
                            if (isTff) st[wId].tffLive += pts;
                            else st[wId].dfoLive += pts;
                        }
                    }
                });
            }
        });

        const getAdminBonus = (uid: string, maxW: number) => {
            let t = 0; for (let w = 5; w <= maxW; w++) if (dynamicBonuses[w] && dynamicBonuses[w][uid]) t += dynamicBonuses[w][uid]; return t;
        };

        // 🔥 MASTER
        const prevList = Object.keys(st).map(id => ({ 
            id, score: st[id].masterW1W4 + st[id].masterBasePrev + getAdminBonus(id, highestWeekFound - 1) 
        })).sort((a,b) => b.score - a.score || (playersList[a.id]||"").localeCompare(playersList[b.id]||"", 'tr'));
        const prevRanks: Record<string, number> = {};
        prevList.forEach((p, i) => prevRanks[p.id] = i + 1);
        const currList = Object.keys(st).map(id => ({ 
            id, score: st[id].masterW1W4 + st[id].masterBaseAll + st[id].masterLive + getAdminBonus(id, highestWeekFound)
        })).sort((a,b) => b.score - a.score || (playersList[a.id]||"").localeCompare(playersList[b.id]||"", 'tr'));

        // 🔥 DFO
        const prevListDfo = Object.keys(st).map(id => ({ 
            id, score: st[id].dfoPts - st[id].dfoBaseAll + st[id].dfoBasePrev 
        })).sort((a,b) => b.score - a.score || (playersList[a.id]||"").localeCompare(playersList[b.id]||"", 'tr'));
        const prevRanksDfo: Record<string, number> = {};
        prevListDfo.forEach((p, i) => prevRanksDfo[p.id] = i + 1);
        const currListDfo = Object.keys(st).map(id => ({ 
            id, score: st[id].dfoPts + st[id].dfoLive 
        })).sort((a,b) => b.score - a.score || (playersList[a.id]||"").localeCompare(playersList[b.id]||"", 'tr'));

        // 🔥 TFF
        const prevListTff = Object.keys(st).map(id => ({ 
            id, score: st[id].tffPts - st[id].tffBaseAll + st[id].tffBasePrev 
        })).sort((a,b) => b.score - a.score || (playersList[a.id]||"").localeCompare(playersList[b.id]||"", 'tr'));
        const prevRanksTff: Record<string, number> = {};
        prevListTff.forEach((p, i) => prevRanksTff[p.id] = i + 1);
        const currListTff = Object.keys(st).map(id => ({ 
            id, score: st[id].tffPts + st[id].tffLive 
        })).sort((a,b) => b.score - a.score || (playersList[a.id]||"").localeCompare(playersList[b.id]||"", 'tr'));

        const upsertData = currList.map((player, index) => {
            const currentRank = index + 1;
            const prevRank = prevRanks[player.id] || currentRank;
            let trend = 'same', trendDiff = 0; 
            if (currentRank < prevRank) { trend = 'up'; trendDiff = prevRank - currentRank; } 
            else if (currentRank > prevRank) { trend = 'down'; trendDiff = currentRank - prevRank; }

            const currRankDfo = currListDfo.findIndex(p => p.id === player.id) + 1;
            const prevRankDfo = prevRanksDfo[player.id] || currRankDfo;
            let dfoTrend = 'same', dfoTrendDiff = 0;
            if (currRankDfo < prevRankDfo) { dfoTrend = 'up'; dfoTrendDiff = prevRankDfo - currRankDfo; }
            else if (currRankDfo > prevRankDfo) { dfoTrend = 'down'; dfoTrendDiff = currRankDfo - prevRankDfo; }

            const currRankTff = currListTff.findIndex(p => p.id === player.id) + 1;
            const prevRankTff = prevRanksTff[player.id] || currRankTff;
            let tffTrend = 'same', tffTrendDiff = 0;
            if (currRankTff < prevRankTff) { tffTrend = 'up'; tffTrendDiff = prevRankTff - currRankTff; }
            else if (currRankTff > prevRankTff) { tffTrend = 'down'; tffTrendDiff = currRankTff - prevRankTff; }

            return {
                id: player.id,
                name: playersList[player.id] || "Bilinmiyor",
                master_pts: player.score,
                master_rank: currentRank,
                dfo_pts: st[player.id].dfoPts,
                tff_pts: st[player.id].tffPts,
                skor_pts: st[player.id].skorPts,
                trend_direction: trend,
                trend_diff: trendDiff,
                dfo_trend_direction: dfoTrend,
                dfo_trend_diff: dfoTrendDiff,
                tff_trend_direction: tffTrend,
                tff_trend_diff: tffTrendDiff,
                updated_at: new Date().toISOString()
            };
        });

        if (upsertData.length > 0) {
            await supabase.from('live_leaderboard').upsert(upsertData, { onConflict: 'id' });
        }

    } catch (e) {
        return NextResponse.json({ message: 'Mutfak Coktu', error: e });
    }

    return NextResponse.json({ message: 'ŞİMŞEK MANTIĞI AKTİF: DFO ve TFF Okları da Hesaplandı!' });
}