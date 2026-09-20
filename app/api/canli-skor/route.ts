import { NextResponse } from 'next/server';

// 🚨 VERCEL KARATAHTASI: Her isteği 2 dakika (120 saniye) boyunca hafızada tutar.
// Böylece saniyede binlerce tık bile gelse 120 saniyede sadece 1 mermi yakarız.
export const revalidate = 120;

// ŞARJÖRDEKİ MERMİLER (3 Resmi API Anahtarı)
const API_KEYS = [
  "f9c02fd1f6df721f93bebc2491c12250", // Dünkü anahtar
  "f8c84a423579036585045dafed920ff6", // 1. Yeni anahtar
  "118e3f179990afa09f807677673a93a0"  // 2. Yeni anahtar
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');

  if (!ids) {
    return NextResponse.json({ error: 'Komutanım, Maç ID eksik girildi!' }, { status: 400 });
  }

  const HEDEF = `https://v3.football.api-sports.io/fixtures?ids=${ids}`;
  let sonuc = null;
  let sonHata = null;

  // 3 NAMLULU ROTASYON: Anahtarları sırayla dener, boş çıkanı atlar.
  for (let i = 0; i < API_KEYS.length; i++) {
    try {
      const res = await fetch(HEDEF, {
        method: 'GET',
        headers: {
          'x-apisports-key': API_KEYS[i],
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      });

      // Eğer bu şifrenin günlük limiti dolduysa (429) veya hata verdiyse
      if (!res.ok) {
        sonHata = `Kalkan: ${res.status}`;
        console.warn(`Şarjör ${i + 1} boşaldı. Hissedilmeden diğerine geçiliyor...`);
        continue; // Döngüyü kırma, hemen alt satıra inmeden sıradaki şifreye geç!
      }

      // Atış başarılıysa veriyi hafızaya al ve döngüyü sonlandır
      sonuc = await res.json();
      break; 
      
    } catch (error: any) {
      sonHata = error.message;
      continue;
    }
  }

  // Eğer 3 şarjör de boşaldıysa (Günde 300 istek bitmişse)
  if (!sonuc) {
     return NextResponse.json({ error: `Tüm mermiler bitti! Son Hata: ${sonHata}` }, { status: 500 });
  }

  return NextResponse.json(sonuc);
}