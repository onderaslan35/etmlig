import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { kullanici_id, kullanici_adi, hafta, eski_tahminler, yeni_tahminler } = body;

    // VERCEL DEDEKTİFİ: Gizli başlıkları (headers) yakalıyoruz
    const ip = request.headers.get('x-forwarded-for') || 'IP Bulunamadı';
    const city = request.headers.get('x-vercel-ip-city') || 'Şehir Gizli';
    const country = request.headers.get('x-vercel-ip-country') || '';
    const userAgent = request.headers.get('user-agent') || 'Cihaz Bulunamadı';
    
    const lokasyon = `${city} ${country}`.trim();

    // İstihbaratı Supabase'deki Kara Kutuya (tahmin_loglari) yazıyoruz
    const { error: logError } = await supabase
      .from('tahmin_loglari')
      .insert([
        {
          kullanici_id,
          kullanici_adi,
          hafta,
          eski_tahminler,
          yeni_tahminler,
          ip_adresi: ip,
          lokasyon: lokasyon !== '' ? lokasyon : 'Bilinmiyor',
          cihaz_bilgisi: userAgent
        }
      ]);

    if (logError) throw logError;

    return NextResponse.json({ success: true, message: 'İstihbarat başarıyla kaydedildi!' });
  } catch (error) {
    console.error('Log kaydetme hatası:', error);
    return NextResponse.json({ success: false, error: 'Bir hata oluştu' }, { status: 500 });
  }
}