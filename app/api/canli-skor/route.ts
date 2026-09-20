import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 0; 
export const maxDuration = 60; 

const API_KEY = "933e5ccc09194d0db30171e2bca20ca9";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

function isTffMatchCheck(category: string) {
    const uppercaseCat = category ? category.toUpperCase() : '';
    return uppercaseCat.includes("TÜRKİYE") || uppercaseCat.includes("TFF") || uppercaseCat.includes("AMATÖR") || uppercaseCat.includes("PTT") || uppercaseCat.includes("2.LİG") || uppercaseCat.includes("3.LİG");
}

export async function GET(request: Request) {
    const nowUTC = new Date();
    const todayTurkey = new Date(nowUTC.getTime() + (3 * 60 * 60 * 1000));
    const todayStr = `${String(todayTurkey.getUTCDate()).padStart(2, '0')}.${String(todayTurkey.getUTCMonth() + 1).padStart(2, '0')}.${todayTurkey.getUTCFullYear()}`; 

    const { data: bulten } = await supabase.from('matches_bulletin').select('match_index, week_num, match_date, category');
    if (bulten) {
        const todaysMatches = bulten.filter(m => m.match_date === todayStr);
        if (todaysMatches.length > 0) {
            const matchIds = todaysMatches.map(m => (m.week_num * 100) + m.match_index);
            const { data: liveData } = await supabase.from('live_matches').select('api_match_id, status').in('id', matchIds).neq('status', 'FINISHED').not('api_match_id', 'is', null);

            if (liveData && liveData.length > 0) {
                const apiIds = liveData.map(l => l.api_match_id).join('-');
                try {
                    const res = await fetch(`https://v3.football.api-sports.io/fixtures?ids=${apiIds}`, { method: 'GET', headers: { 'x-apisports-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }, cache: 'no-store' });
                    if (res.ok) {
                        const maclar = (await res.json()).response || [];
                        for (const mac of maclar) {
                            const durum = mac.fixture.status.short; 
                            let statu = 'NOT_STARTED';
                            if (durum === 'FT' || durum === 'AET' || durum === 'PEN') statu = 'FINISHED';
                            else if (['1H','2H','HT','ET','P'].includes(durum)) statu = 'LIVE';
                            await supabase.from('live_matches').update({ home_score: String(mac.goals.home ?? 0), away_score: String(mac.goals.away ?? 0), status: statu }).eq('api_match_id', mac.fixture.id);
                        }
                    }
                } catch (e) { console.log("API Hatasi"); }
            }
        }
    }

    try {
        const { data: dbPlayers } = await supabase.from('players').select('*');
        const playersList: Record<string, string> = {};
        if (dbPlayers) dbPlayers.forEach(p => { if (p.username !== 'mankoman') playersList[p.username || p.id] = p.name || p.full_name; });

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
                dynamicBonuses[b.hafta][b.username] = (dynamicBonuses[b.hafta][b.username] || 0) + b.puan;
            }
        });

        let allPredictions: any[] = [];
        let from = 0; let step = 1000; let keepFetching = true;
        while(keepFetching) {
            const { data } = await supabase.from('player_predictions').select('*').gte('week_num', 5).order('id').range(from, from + step - 1);
            if (data && data.length > 0) { allPredictions = [...allPredictions, ...data]; if (data.length < step) keepFetching = false; else from += step; } 
            else keepFetching = false;
        }

        const pDict: Record<string, string> = {};
        allPredictions.forEach(pred => pDict[`${pred.user_id}-${pred.week_num}-${pred.match_index}`] = pred.predicted_score.replace(/\s+/g, ''));
        const catDict: Record<string, string> = {};
        if (bulten) bulten.forEach((m: any) => catDict[`${m.week_num}-${m.match_index}`] = m.category || "");

        let st: Record<string, any> = {};
        Object.keys(playersList).forEach(uid => {
            const getVal = (arr:any[], id:string) => arr.find((r:any) => String(r.id||r.username||r.user_id) === id) || {w1:0, w2:0, w3:0, w4:0};
            const sumW = (r:any) => Number(r.w1||0) + Number(r.w2||0) + Number(r.w3||0) + Number(r.w4||0);
            const md = getVal(masterData, uid), dd = getVal(dfoData, uid), td = getVal(tffPointsData, uid);
            const sd = getVal(skorDfoData, uid), stff = getVal(skorTffData, uid);

            st[uid] = { 
                masterW1W4: sumW(md), dfoPts: sumW(dd), tffPts: sumW(td),
                skorPts: sumW(sd) + sumW(stff), dfoSkorBase: sumW(sd), tffSkorBase: sumW(stff),
                masterBaseAll: 0, masterBasePrev: 0, masterLive: 0, dfoBaseAll: 0, dfoBasePrev: 0, dfoLive: 0, tffBaseAll: 0, tffBasePrev: 0, tffLive: 0,
                skorAll: 0, skorPrev: 0, skorLive: 0, dfoSkorAll: 0, dfoSkorPrev: 0, dfoSkorLive: 0, tffSkorAll: 0, tffSkorPrev: 0, tffSkorLive: 0
            };
        });

        let highestWeekFound = 6; 
        dbLiveMatches.forEach((m: any) => {
             const weekNum = Math.floor(m.id / 100);
             if (weekNum >= 5 && weekNum <= 38 && m.home_score && m.home_score !== '-' && m.away_score && m.away_score !== '-') if (weekNum > highestWeekFound) highestWeekFound = weekNum;
        });

        dbLiveMatches.forEach((dbMatch: any) => {
            const weekNum = Math.floor(dbMatch.id / 100);
            const matchIndex = dbMatch.id % 100;
            if (weekNum >= 5 && weekNum <= 38 && dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-') {
                const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`.replace(/\s+/g, '');
                const winnerIds = Object.keys(playersList).filter(id => pDict[`${id}-${weekNum}-${matchIndex}`] === targetScore);
                
                let pts = 1;
                if(winnerIds.length === 1) pts = 12; else if(winnerIds.length === 2) pts = 6; else if(winnerIds.length === 3) pts = 5; else if(winnerIds.length === 4) pts = 4; else if(winnerIds.length === 5) pts = 3; else if(winnerIds.length === 6) pts = 2; else if(winnerIds.length >= 7) pts = 1; else pts = 0;

                const isFinished = dbMatch.status === 'FINISHED' || dbMatch.status === 'FT';
                const isLive = ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'WAITING_APPROVAL'].includes(dbMatch.status);
                const isTff = isTffMatchCheck(catDict[`${weekNum}-${matchIndex}`] || "");

                winnerIds.forEach(wId => {
                    if (st[wId]) {
                        if (isFinished) {
                            st[wId].masterBaseAll += pts; st[wId].skorAll += 1;
                            if (weekNum < highestWeekFound) { st[wId].masterBasePrev += pts; st[wId].skorPrev += 1; } 
                            if (isTff) {
                                st[wId].tffPts += pts; st[wId].tffBaseAll += pts; st[wId].tffSkorAll += 1;
                                if (weekNum < highestWeekFound) { st[wId].tffBasePrev += pts; st[wId].tffSkorPrev += 1; }
                            } else {
                                st[wId].dfoPts += pts; st[wId].dfoBaseAll += pts; st[wId].dfoSkorAll += 1;
                                if (weekNum < highestWeekFound) { st[wId].dfoBasePrev += pts; st[wId].dfoSkorPrev += 1; }
                            }
                        } else if (isLive) {
                            st[wId].masterLive += pts; st[wId].skorLive += 1;
                            if (isTff) { st[wId].tffLive += pts; st[wId].tffSkorLive += 1; } 
                            else { st[wId].dfoLive += pts; st[wId].dfoSkorLive += 1; }
                        }
                    }
                });
            }
        });

        const getAdminBonus = (uid: string, maxW: number) => { let t = 0; for (let w = 5; w <= maxW; w++) if (dynamicBonuses[w] && dynamicBonuses[w][uid]) t += dynamicBonuses[w][uid]; return t; };
        
        const sortFunc = (a:any, b:any) => b.score - a.score || (playersList[a.id]||"").localeCompare(playersList[b.id]||"", 'tr');
        const makeList = (keyBase:string, keyLive:string) => Object.keys(st).map(id => ({ id, score: st[id][keyBase] + st[id][keyLive] })).sort(sortFunc);
        const makePrevRanks = (list: any[]) => { const r:Record<string,number>={}; list.forEach((p,i)=>r[p.id]=i+1); return r; };

        // Puan Trendleri
        const currList = Object.keys(st).map(id => ({ id, score: st[id].masterW1W4 + st[id].masterBaseAll + st[id].masterLive + getAdminBonus(id, highestWeekFound) })).sort(sortFunc);
        const prevRanks = makePrevRanks(Object.keys(st).map(id => ({ id, score: st[id].masterW1W4 + st[id].masterBasePrev + getAdminBonus(id, highestWeekFound - 1) })).sort(sortFunc));
        
        const currListDfo = makeList('dfoPts', 'dfoLive');
        const prevRanksDfo = makePrevRanks(Object.keys(st).map(id => ({ id, score: st[id].dfoPts - st[id].dfoBaseAll + st[id].dfoBasePrev })).sort(sortFunc));
        
        const currListTff = makeList('tffPts', 'tffLive');
        const prevRanksTff = makePrevRanks(Object.keys(st).map(id => ({ id, score: st[id].tffPts - st[id].tffBaseAll + st[id].tffBasePrev })).sort(sortFunc));

        // Skor (Tam İsabet) Trendleri
        const currSkor = Object.keys(st).map(id => ({ id, score: st[id].skorPts + st[id].skorAll + st[id].skorLive })).sort(sortFunc);
        const prevRanksSkor = makePrevRanks(Object.keys(st).map(id => ({ id, score: st[id].skorPts + st[id].skorPrev })).sort(sortFunc));
        
        const currDfoSkor = Object.keys(st).map(id => ({ id, score: st[id].dfoSkorBase + st[id].dfoSkorAll + st[id].dfoSkorLive })).sort(sortFunc);
        const prevRanksDfoSkor = makePrevRanks(Object.keys(st).map(id => ({ id, score: st[id].dfoSkorBase + st[id].dfoSkorPrev })).sort(sortFunc));
        
        const currTffSkor = Object.keys(st).map(id => ({ id, score: st[id].tffSkorBase + st[id].tffSkorAll + st[id].tffSkorLive })).sort(sortFunc);
        const prevRanksTffSkor = makePrevRanks(Object.keys(st).map(id => ({ id, score: st[id].tffSkorBase + st[id].tffSkorPrev })).sort(sortFunc));

        const getTrend = (currListArr:any[], prevRanksObj:Record<string,number>, pId:string) => {
            const currRank = currListArr.findIndex(p => p.id === pId) + 1;
            const prevRank = prevRanksObj[pId] || currRank;
            if (currRank < prevRank) return { dir: 'up', diff: prevRank - currRank };
            if (currRank > prevRank) return { dir: 'down', diff: currRank - prevRank };
            return { dir: 'same', diff: 0 };
        };

        const upsertData = currList.map((player) => {
            const pTrend = getTrend(currList, prevRanks, player.id);
            const dfoTrend = getTrend(currListDfo, prevRanksDfo, player.id);
            const tffTrend = getTrend(currListTff, prevRanksTff, player.id);
            const skorTr = getTrend(currSkor, prevRanksSkor, player.id);
            const dfoSkorTr = getTrend(currDfoSkor, prevRanksDfoSkor, player.id);
            const tffSkorTr = getTrend(currTffSkor, prevRanksTffSkor, player.id);

            return {
                id: player.id, name: playersList[player.id] || "Bilinmiyor",
                master_pts: player.score, master_rank: currList.findIndex(p => p.id === player.id) + 1,
                trend_direction: pTrend.dir, trend_diff: pTrend.diff,
                dfo_pts: currListDfo.find(p => p.id === player.id)?.score || 0,
                dfo_trend_direction: dfoTrend.dir, dfo_trend_diff: dfoTrend.diff,
                tff_pts: currListTff.find(p => p.id === player.id)?.score || 0,
                tff_trend_direction: tffTrend.dir, tff_trend_diff: tffTrend.diff,
                
                skor_pts: currSkor.find(p => p.id === player.id)?.score || 0,
                skor_trend_direction: skorTr.dir, skor_trend_diff: skorTr.diff,
                dfo_skor_pts: currDfoSkor.find(p => p.id === player.id)?.score || 0,
                dfo_skor_trend_direction: dfoSkorTr.dir, dfo_skor_trend_diff: dfoSkorTr.diff,
                tff_skor_pts: currTffSkor.find(p => p.id === player.id)?.score || 0,
                tff_skor_trend_direction: tffSkorTr.dir, tff_skor_trend_diff: tffSkorTr.diff,
                updated_at: new Date().toISOString()
            };
        });

        if (upsertData.length > 0) await supabase.from('live_leaderboard').upsert(upsertData, { onConflict: 'id' });

    } catch (e) { return NextResponse.json({ message: 'Mutfak Coktu' }); }
    return NextResponse.json({ message: 'B PLANI AKTİF: Tüm Skor (Tam İsabet) Okları Veritabanına Bağlandı!' });
}