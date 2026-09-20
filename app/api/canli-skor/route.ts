import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 120; // 2 Dakikada bir taranır

// 🚨 4 NAMLULU ŞARJÖR 🚨
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
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');

  if (!ids) return NextResponse.json({ error: 'Komutanım, Maç ID eksik!' }, { status: 400 });

  const HEDEF = `https://v3.football.api-sports.io/fixtures?ids=${ids}`;
  let sonuc = null;
  let sonHata = null;

  for (let i = 0; i < API_KEYS.length; i++) {
    try {
      const res = await fetch(HEDEF, {
        method: 'GET',
        headers: {
          'x-apisports-key': API_KEYS[i],
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
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

  const maclar = sonuc.response;
  
  for (const mac of maclar) {
    const macId = mac.fixture.id; 
    const evSkor = mac.goals.home ?? 0;
    const depSkor = mac.goals.away ?? 0;
    const durum = mac.fixture.status.short; 
    const dakika = mac.fixture.status.elapsed || 0; // 🔴 YENİ: DAKİKA YAKALANIYOR
    
    let statu = 'NOT_STARTED';
    if (durum === 'FT' || durum === 'AET' || durum === 'PEN') statu = 'FINISHED';
    else if (['1H','2H','HT','ET','P'].includes(durum)) statu = 'LIVE';

    const olaylar = mac.events || [];

    const { error } = await supabase
      .from('live_matches')
      .update({
        home_score: evSkor.toString(),
        away_score: depSkor.toString(),
        status: statu,
        elapsed: dakika, // 🔴 YENİ: VERİTABANINA YAZILIYOR
        events: olaylar 
      })
      .eq('api_match_id', macId);
  }

  return NextResponse.json(sonuc);
}