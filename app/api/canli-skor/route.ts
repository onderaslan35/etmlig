import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 0; 
export const maxDuration = 60; 

const API_KEY = "933e5ccc09194d0db30171e2bca20ca9";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 🔥 UZAY ÜSSÜ ÇEVİRİ MOTORU: Türkçe isimleri API-Sports diline (İngilizceye) çevirir 🔥
const teamDict: Record<string, string> = {
    "TÜRKİYE": "Turkey", "ALMANYA": "Germany", "İNGİLTERE": "England", 
    "FRANSA": "France", "İSPANYA": "Spain", "İTALYA": "Italy",
    "GÜRCİSTAN": "Georgia", "KUZEY İRLANDA": "Northern Ireland", "HOLLANDA": "Netherlands",
    "BELÇİKA": "Belgium", "İSVEÇ": "Sweden", "UKRAYNA": "Ukraine", 
    "POLONYA": "Poland", "MACARİSTAN": "Hungary", "GALLER": "Wales",
    "İZLANDA": "Iceland", "KARADAĞ": "Montenegro", "ÇEKYA": "Czech Republic",
    "HIRVATİSTAN": "Croatia", "İSVİÇRE": "Switzerland", "DANİMARKA": "Denmark",
    "SIRBİSTAN": "Serbia", "PORTEKİZ": "Portugal", "İSKOÇYA": "Scotland",
    "ANDORRA": "Andorra", "MALTA": "Malta", "NORVEÇ": "Norway", "KOSOVA": "Kosovo",
    "İRLANDA": "Republic of Ireland", "LİHTENŞTAYN": "Liechtenstein", "LİTVANYA": "Lithuania",
    "BOSNA-HERSEK": "Bosnia & Herzegovina", "ROMANYA": "Romania", "KIBRIS": "Cyprus",
    "SLOVENYA": "Slovenia", "SAN MARİNO": "San Marino", "FİNLANDİYA": "Finland",
    "FAROE ADALARI": "Faroe Islands", "KAZAKİSTAN": "Kazakhstan", "BULGARİSTAN": "Bulgaria",
    "LÜKSEMBURG": "Luxembourg", "ESTONYA": "Estonia", "KUZEY MAKEDONYA": "North Macedonia",
    "ARNAVUTLUK": "Albania", "BELARUS": "Belarus", "SLOVAKYA": "Slovakia", "MOLDOVA": "Moldova"
};

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
    const apiDateStr = `${y}-${m}-${d}`; // API Radarı için YYYY-MM-DD

    const { data: bulten } = await supabase.from('matches_bulletin').select('match_index, week_num, match_date, category, home_team');
    
    if (bulten) {
        const todaysMatches = bulten.filter(match => match.match_date === todayStr);
        if (todaysMatches.length > 0) {
            const matchIds = todaysMatches.map(match => (match.week_num * 100) + match.match_index);
            
            // DİKKAT: .not('api_match_id', 'is', null) SİLİNDİ. Kimliği olmayanları da çekeceğiz!
            const { data: liveData } = await supabase.from('live_matches').select('id, api_match_id, status').in('id', matchIds).neq('status', 'FINISHED');

            if (liveData && liveData.length > 0) {
                
                // =========================================================================
                // 🔥 OTOMATİK RADAR DEVREDE 🔥 API ID'si eksik olan maçları kendi bulur!
                // =========================================================================
                const missingIdMatches = liveData.filter(l => !l.api_match_id);
                if (missingIdMatches.length > 0) {
                    try {
                        const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${apiDateStr}`, { method: 'GET', headers: { 'x-apisports-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' } });
                        const json = await res.json();
                        const apiFixtures = json.response || [];

                        for (const missing of missingIdMatches) {
                            const bultenMatch = todaysMatches.find(tm => (tm.week_num * 100) + tm.match_index === missing.id);
                            if (bultenMatch && bultenMatch.home_team) {
                                const homeTr = bultenMatch.home_team.toUpperCase();
                                const homeEn = teamDict[homeTr] || homeTr; // İngilizce karşılığını bul

                                const foundApiMatch = apiFixtures.find((f: any) => 
                                    f.teams.home.name.toUpperCase().includes(homeEn.toUpperCase()) ||
                                    f.teams.home.name.toUpperCase().includes(homeTr)
                                );

                                if (foundApiMatch) {
                                    await supabase.from('live_matches').update({ api_match_id: foundApiMatch.fixture.id }).eq('id', missing.id);
                                    missing.api_match_id = foundApiMatch.fixture.id; // Bellekte güncelle ki aşağıda skoru hemen çeksin
                                }
                            }
                        }
                    } catch (err) { console.log("Otomatik Radar Hatası", err); }
                }

                // =========================================================================
                // 🔥 STANDART CANLI SKOR VE OLAY ÇEKME İŞLEMİ 🔥
                // =========================================================================
                const validLiveData = liveData.filter(l => l.api_match_id);
                if (validLiveData.length > 0) {
                    const apiIds = validLiveData.map(l => l.api_match_id).join('-');
                    const HEDEF = `https://v3.football.api-sports.io/fixtures?ids=${apiIds}`;
                    try {
                        const res = await fetch(HEDEF, { method: 'GET', headers: { 'x-apisports-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }, cache: 'no-store' });
                        if (res.ok) {
                            const sonuc = await res.json();
                            const maclar = sonuc.response || [];
                            for (const mac of maclar) {
                                const macId = mac.fixture.id; 
                                const durum = mac.fixture.status.short; 
                                const dakika = mac.fixture.status.elapsed ?? null; 
                                const olaylar = mac.events ?? []; 
                                
                                let statu = 'NOT_STARTED';
                                if (['FT', 'AET', 'PEN', 'Match Finished'].includes(durum)) statu = 'FINISHED';
                                else if (['HT', 'Halftime'].includes(durum)) statu = 'HT';
                                else if (['1H', '2H', 'ET', 'P', 'LIVE', 'IN PLAY'].includes(durum) || dakika !== null) statu = 'LIVE';

                                const dbMatchInfo = validLiveData.find(l => l.api_match_id === macId);
                                if (dbMatchInfo && (dbMatchInfo.status === 'LIVE' || dbMatchInfo.status === 'HT') && statu === 'NOT_STARTED') {
                                    statu = dbMatchInfo.status;
                                }

                                let evSkorStr = '-';
                                let depSkorStr = '-';

                                if (statu !== 'NOT_STARTED') {
                                    evSkorStr = (mac.goals.home ?? 0).toString();
                                    depSkorStr = (mac.goals.away ?? 0).toString();
                                }

                                await supabase.from('live_matches').update({ 
                                    home_score: evSkorStr, 
                                    away_score: depSkorStr, 
                                    status: statu,
                                    elapsed: dakika,
                                    events: JSON.stringify(olaylar) 
                                }).eq('api_match_id', macId);
                            }
                        }
                    } catch (e) { console.log("API Cekim Hatasi", e); }
                }
            }
        }
    }

    // =========================================================================
    // 🔴 BURADAN AŞAĞISI SENİN ORJİNAL PUANLAMA VE LİDERLİK TABLOSU HESABIN 🔴
    // =========================================================================
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

            const w1W4SkorDfo = Number(sd.w1||0) + Number(sd.w2||0) + Number(sd.w3||0) + Number(sd.w4||0);
            const w1W4SkorTff = Number(stff.w1||0) + Number(stff.w2||0) + Number(stff.w3||0) + Number(stff.w4||0);

            st[uid] = { 
                masterW1W4: Number(md.w1||0) + Number(md.w2||0) + Number(md.w3||0) + Number(md.w4||0),
                dfoPts: Number(dd.w1||0) + Number(dd.w2||0) + Number(dd.w3||0) + Number(dd.w4||0),
                tffPts: Number(td.w1||0) + Number(td.w2||0) + Number(td.w3||0) + Number(td.w4||0),
                
                skorPts: w1W4SkorDfo + w1W4SkorTff,
                dfoSkorBase: w1W4SkorDfo,
                tffSkorBase: w1W4SkorTff,
                
                masterBaseAll: 0, masterBasePrev: 0, masterLive: 0,
                dfoBaseAll: 0, dfoBasePrev: 0, dfoLive: 0,
                tffBaseAll: 0, tffBasePrev: 0, tffLive: 0,
                
                skorAll: 0, skorPrev: 0, skorLive: 0,
                dfoSkorAll: 0, dfoSkorPrev: 0, dfoSkorLive: 0,
                tffSkorAll: 0, tffSkorPrev: 0, tffSkorLive: 0
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
                            st[wId].skorAll += 1; 
                            
                            if (weekNum < highestWeekFound) { 
                                st[wId].masterBasePrev += pts; 
                                st[wId].skorPrev += 1; 
                            } 
                            
                            if (isTff) {
                                st[wId].tffPts += pts;
                                st[wId].tffBaseAll += pts;
                                st[wId].tffSkorAll += 1; 
                                if (weekNum < highestWeekFound) { 
                                    st[wId].tffBasePrev += pts; 
                                    st[wId].tffSkorPrev += 1; 
                                } 
                            } else {
                                st[wId].dfoPts += pts;
                                st[wId].dfoBaseAll += pts;
                                st[wId].dfoSkorAll += 1; 
                                if (weekNum < highestWeekFound) { 
                                    st[wId].dfoBasePrev += pts; 
                                    st[wId].dfoSkorPrev += 1; 
                                }
                            }
                        } else if (isLive) {
                            st[wId].masterLive += pts;
                            st[wId].skorLive += 1;
                            if (isTff) {
                                st[wId].tffLive += pts;
                                st[wId].tffSkorLive += 1;
                            } else {
                                st[wId].dfoLive += pts;
                                st[wId].dfoSkorLive += 1;
                            }
                        }
                    }
                });
            }
        });

        const getAdminBonus = (uid: string, maxW: number) => {
            let t = 0; for (let w = 5; w <= maxW; w++) if (dynamicBonuses[w] && dynamicBonuses[w][uid]) t += dynamicBonuses[w][uid]; return t;
        };
        
        const sortFunc = (a:any, b:any) => b.score - a.score || (playersList[a.id]||"").localeCompare(playersList[b.id]||"", 'tr');
        const makePrevRanks = (list: any[]) => { const r:Record<string,number>={}; list.forEach((p,i)=>r[p.id]=i+1); return r; };

        const currList = Object.keys(st).map(id => ({ id, score: st[id].masterW1W4 + st[id].masterBaseAll + st[id].masterLive + getAdminBonus(id, highestWeekFound) })).sort(sortFunc);
        const prevRanks = makePrevRanks(Object.keys(st).map(id => ({ id, score: st[id].masterW1W4 + st[id].masterBasePrev + getAdminBonus(id, highestWeekFound - 1) })).sort(sortFunc));
        
        const currListDfo = Object.keys(st).map(id => ({ id, score: st[id].dfoPts + st[id].dfoLive })).sort(sortFunc);
        const prevRanksDfo = makePrevRanks(Object.keys(st).map(id => ({ id, score: st[id].dfoPts - st[id].dfoBaseAll + st[id].dfoBasePrev })).sort(sortFunc));
        
        const currListTff = Object.keys(st).map(id => ({ id, score: st[id].tffPts + st[id].tffLive })).sort(sortFunc);
        const prevRanksTff = makePrevRanks(Object.keys(st).map(id => ({ id, score: st[id].tffPts - st[id].tffBaseAll + st[id].tffBasePrev })).sort(sortFunc));

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
                id: player.id,
                name: playersList[player.id] || "Bilinmiyor",
                master_pts: player.score,
                master_rank: currList.findIndex(p => p.id === player.id) + 1,
                trend_direction: pTrend.dir,
                trend_diff: pTrend.diff,
                dfo_pts: currListDfo.find(p => p.id === player.id)?.score || 0,
                dfo_trend_direction: dfoTrend.dir,
                dfo_trend_diff: dfoTrend.diff,
                tff_pts: currListTff.find(p => p.id === player.id)?.score || 0,
                tff_trend_direction: tffTrend.dir,
                tff_trend_diff: tffTrend.diff,
                
                skor_pts: currSkor.find(p => p.id === player.id)?.score || 0,
                skor_trend_direction: skorTr.dir,
                skor_trend_diff: skorTr.diff,
                dfo_skor_pts: currDfoSkor.find(p => p.id === player.id)?.score || 0,
                dfo_skor_trend_direction: dfoSkorTr.dir,
                dfo_skor_trend_diff: dfoSkorTr.diff,
                tff_skor_pts: currTffSkor.find(p => p.id === player.id)?.score || 0,
                tff_skor_trend_direction: tffSkorTr.dir,
                tff_skor_trend_diff: tffSkorTr.diff,
                updated_at: new Date().toISOString()
            };
        });

        if (upsertData.length > 0) {
            await supabase.from('live_leaderboard').upsert(upsertData, { onConflict: 'id' });
        }

    } catch (e) {
        return NextResponse.json({ message: 'Mutfak Coktu', error: e });
    }

    return NextResponse.json({ message: 'API BAGLANTISI VE OTOMATIK RADAR BASARIYLA CALISTI!' });
}