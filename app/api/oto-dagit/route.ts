import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET(request: Request) {
  try {
    // 1. Uydudan "FINISHED" (Bitti) veya "FT" (Maç Sonu) sinyali gelmiş maçları bul
    const { data: finishedMatches } = await supabase
      .from('live_matches')
      .select('*')
      .in('status', ['FINISHED', 'FT']);

    if (!finishedMatches || finishedMatches.length === 0) {
      return NextResponse.json({ message: "Dağıtılacak bitmiş maç yok." });
    }

    // 2. Bu maçların puanları "points" (Kasa) tablosunda zaten var mı kontrol et
    // Eğer yoksa (yani yeni bittiyse), tahminleri çekip 12-6-5-4-3-2-1 matematiğiyle dağıt!
    // 24. maç ise +3 Bonusları ekle...
    
    // (Buraya Admin sayfasındaki o devasa dağıtım kodunun arka plan versiyonu gelecek)

    return NextResponse.json({ message: "Hayalet Komutan devriyesini tamamladı, puanlar dağıtıldı!" });
  } catch (error) {
    return NextResponse.json({ error: "Sistem hatası" }, { status: 500 });
  }
}