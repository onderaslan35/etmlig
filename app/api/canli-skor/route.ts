// 🔥 KESİN TETİKLEME ATIŞI - OTONOM MOTOR (ÜCRETSİZ PLAN SÜRÜMÜ) 🔥
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 0; 

const API_KEYS = [
  "f9c02fd1f6df721f93bebc2491c12250",
  "f8c84a423579036585045dafed920ff6",
  "118e3f179990afa09f807677673a93a0",
  "b19f6602229b82fd8e2d329c102cd1c0"
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  const nowUTC = new Date();
  const todayTurkey = new Date(nowUTC.getTime() + (3 * 60 * 60 * 1000));
  const d = String(todayTurkey.getUTCDate()).padStart(2, '0');
  const m = String(todayTurkey.getUTCMonth() + 1).padStart(2, '0');
  const y = todayTurkey.getUTCFullYear();
  
  const todayStr = `${d}.${m}.${y}`; // Supabase bülten için (DD.MM.YYYY)
  const apiDateStr = `${y}-${m}-${d}`; // API-Sports araması için (YYYY-MM-DD)

  const { data: bulten } = await supabase.from('matches_bulletin').select('match_index, week_num, match_date');
  if (!bulten) return NextResponse.json({ message: 'Bülten çekilemedi.' });
  
  const todaysMatches = bulten.filter(match => match.match_date === todayStr);
  if (todaysMatches.length === 0) return NextResponse.json({ message: 'Bugün maç yok, mermi harcanmadı.' });

  const matchIds = todaysMatches.map(match => (match.week_num * 100) + match.match_index);

  const { data: liveData } = await supabase
    .from('live_matches')
    .select('api_match_id, status')
    .in('id', matchIds)
    .neq('status', 'FINISHED')
    .not('api_match_id', 'is', null);

  if (!liveData || liveData.length === 0) return NextResponse.json({ message: 'Aktif maç yok.' });

  // API'ye "ids" ile sormak yasak olduğu için kendi içimizde filtrelemek üzere ID'leri diziye alıyoruz
  const bizimMacIdleri = liveData.map(l => String(l.api_match_id));

  // YENİ HEDEF: Tüm dünyadaki bugünün maçlarını çekiyoruz (Ücretsiz plana uygun sorgu)
  const HEDEF = `https://v3.football.api-sports.io/fixtures?date=${apiDateStr}`;
  
  let sonuc = null;
  let sonHata = null;

  for (let i = 0; i < API_KEYS.length; i++) {
    try {
      const res = await fetch(HEDEF, {
        method: 'GET',
        headers: {
          'x-apisports-key': API_KEYS[i],
          'x-rapidapi-host': 'v3.football.api-sports.io'
        },
        cache: 'no-store'
      });
      if (!res.ok) { sonHata = `Kalkan: ${res.status}`; continue; }
      sonuc = await res.json();
      break; 
    } catch (error: any) {
      sonHata = error.message;
      continue;
    }
  }

  if (!sonuc || !sonuc.response) return NextResponse.json({ error: `Mermiler Bitti! Hata: ${sonHata}` }, { status: 500 });
  
  // SIZMA HAREKATI: Dünyadaki yüzlerce maç arasından sadece bizim aradığımız ID'leri cımbızlıyoruz
  const maclar = sonuc.response.filter((mac: any) => bizimMacIdleri.includes(String(mac.fixture.id)));
  
  for (const mac of maclar) {
    const macId = mac.fixture.id; 
    const evSkor = mac.goals.home ?? 0;
    const depSkor = mac.goals.away ?? 0;
    const durum = mac.fixture.status.short; 
    const dakika = mac.fixture.status.elapsed || 0; 
    
    let statu = 'NOT_STARTED';
    if (durum === 'FT' || durum === 'AET' || durum === 'PEN') statu = 'FINISHED';
    else if (['1H','2H','HT','ET','P'].includes(durum)) statu = 'LIVE';

    const olaylar = mac.events || [];

    await supabase.from('live_matches').update({ home_score: evSkor.toString(), away_score: depSkor.toString(), status: statu, elapsed: dakika, events: olaylar }).eq('api_match_id', macId);
  }

  return NextResponse.json({ message: 'Sızma Harekatı Başarılı', cekilenMac: maclar.length, arananIDler: bizimMacIdleri, apiHatasi: sonuc.errors });
}