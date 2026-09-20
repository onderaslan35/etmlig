// 🔥 KESİN TETİKLEME ATIŞI - OTONOM MOTOR (PRO PLAN SÜRÜMÜ) 🔥
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 0; 

// YENİ VE SINIRSIZ MÜHİMMAT: Satın aldığın pakete ait temiz şifreyi (API Key) buraya yaz
const API_KEY = "BURAYA_YENI_PRO_SIFRENI_YAZ";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  const nowUTC = new Date();
  const todayTurkey = new Date(nowUTC.getTime() + (3 * 60 * 60 * 1000));
  const d = String(todayTurkey.getUTCDate()).padStart(2, '0');
  const m = String(todayTurkey.getUTCMonth() + 1).padStart(2, '0');
  const y = todayTurkey.getUTCFullYear();
  const todayStr = `${d}.${m}.${y}`; 

  const { data: bulten } = await supabase.from('matches_bulletin').select('match_index, week_num, match_date');
  if (!bulten) return NextResponse.json({ message: 'Bülten çekilemedi.' });
  
  const todaysMatches = bulten.filter(match => match.match_date === todayStr);
  if (todaysMatches.length === 0) return NextResponse.json({ message: 'Bugün maç yok, sistem beklemede.' });

  const matchIds = todaysMatches.map(match => (match.week_num * 100) + match.match_index);

  const { data: liveData } = await supabase
    .from('live_matches')
    .select('api_match_id, status')
    .in('id', matchIds)
    .neq('status', 'FINISHED')
    .not('api_match_id', 'is', null);

  if (!liveData || liveData.length === 0) return NextResponse.json({ message: 'Aktif maç yok, mermi harcanmadı.' });

  // NOKTA ATIŞI: Artık Pro planımız olduğu için doğrudan ID'leri birleştirip API'ye sorabiliriz!
  const apiIds = liveData.map(l => l.api_match_id).join('-');

  // YENİ HEDEF: Tüm dünyayı çekmek yok, sadece bizim ID'ler vurulacak!
  const HEDEF = `https://v3.football.api-sports.io/fixtures?ids=${apiIds}`;
  
  let sonuc = null;
  let sonHata = null;

  try {
    const res = await fetch(HEDEF, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      },
      cache: 'no-store'
    });
    if (!res.ok) { sonHata = `Kalkan: ${res.status}`; }
    else { sonuc = await res.json(); }
  } catch (error: any) {
    sonHata = error.message;
  }

  if (!sonuc || !sonuc.response) return NextResponse.json({ error: `Atış Başarısız! Hata: ${sonHata}` }, { status: 500 });
  const maclar = sonuc.response;
  
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

  return NextResponse.json({ message: 'Nokta Atışı Başarılı (PRO PLAN)', cekilenMac: maclar.length, firlatilanIDler: apiIds, apiHatasi: sonuc.errors });
}