import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 15. Hafta için MASTER kategorisindeki fişleri çek
    const { data: points, error } = await supabase
      .from('points')
      .select('id, user_name, ev_sahibi, deplasman')
      .eq('hafta', 15)
      .eq('kategori', 'MASTER');

    if (error) throw error;

    // 🔥 TİP TANIMLAMALARI EKLENDİ (TypeScript Disiplin Subayı Sussun Diye!) 🔥
    const duplicates: any[] = [];
    const seen = new Set<string>();

    points?.forEach(pt => {
      // Benzersiz bir anahtar: Kullanıcı + Ev Sahibi + Deplasman
      const key = `${pt.user_name}-${pt.ev_sahibi}-${pt.deplasman}`;
      if (seen.has(key)) {
        duplicates.push(pt.id); // Eğer daha önce gördüysek, bu bir kopyadır
      } else {
        seen.add(key);
      }
    });

    if (duplicates.length > 0) {
       // Kopyaları sil
       const { error: deleteError } = await supabase
         .from('points')
         .delete()
         .in('id', duplicates);
       
       if (deleteError) throw deleteError;
       
       return NextResponse.json({ 
           success: true,
           message: `MÜKEMMEL! 15. haftadaki ${duplicates.length} adet şişirilmiş (mükerrer) fiş temizlendi!` 
       });
    }

    return NextResponse.json({ 
        success: true,
        message: "15. haftada silinecek mükerrer kayıt bulunamadı. Sistem zaten temiz." 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}