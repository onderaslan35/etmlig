'use client';
import { useEffect, useState } from 'react';
// Sende var olan Supabase bağlantısını çağırıyoruz:
import { supabase } from '@/lib/supabase'; 

export default function Istatistikler() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      // Supabase'den Sanal Tabloyu (View) Çekiyoruz
      const { data: stats, error } = await supabase
        .from('view_taktik_istatistikleri')
        .select('*')
        .order('Toplam_Tahmin', { ascending: false });

      if (error) {
        console.error('İstihbarat çekilirken hata:', error);
      } else {
        setData(stats || []);
      }
      setLoading(false);
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center">
        <p className="text-[#f0ca56] text-2xl font-bold animate-pulse">Karargah İstatistikleri Yükleniyor...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold text-[#ff2a2a] mb-4">ETML TAKTİK ODASI</h1>
        <p>Henüz istihbarat verisi bulunamadı.</p>
      </div>
    );
  }

  // Sadece oynanmış (toplamı 0'dan büyük) skorları gösteren, hayalet skorları silen radarımız
  const columnsToKeep = Object.keys(data[0]).filter(key => {
    if (key === 'Yarismaci' || key === 'Toplam_Tahmin') return true;
    return data.some(row => row[key] > 0);
  });

  return (
    <div className="min-h-screen bg-[#090a0f] p-4 md:p-10 font-sans text-white">
      {/* BAŞLIK */}
      <div className="text-center mb-10">
        <h1 className="text-5xl md:text-7xl font-black text-[#ff2a2a] tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          ETML
        </h1>
        <h2 className="text-xl md:text-3xl font-bold text-[#f0ca56] mt-2 tracking-widest uppercase">
          Taktİk ve İstİhbarat Odası
        </h2>
        <p className="text-gray-400 mt-2 text-sm">(6. Hafta İtibarıyla Tüm Skor Tercihleri)</p>
      </div>

      {/* DEV TABLO */}
      <div className="max-w-7xl mx-auto overflow-x-auto shadow-[0_0_15px_rgba(255,42,42,0.3)] rounded-lg border border-[#ff2a2a]/30">
        <table className="w-full text-sm text-center">
          <thead className="bg-[#1a0f0f] text-[#f0ca56] uppercase font-bold text-xs md:text-sm border-b border-[#ff2a2a]/50">
            <tr>
              {columnsToKeep.map((col) => (
                <th key={col} className="px-4 py-4 tracking-wider whitespace-nowrap border-r border-[#ff2a2a]/20 last:border-r-0">
                  {col.replace('Skor_', '').replace('_', '-')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-[#0f111a] divide-y divide-[#ff2a2a]/20">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-[#1f1515] transition-colors duration-200">
                {columnsToKeep.map((col, colIndex) => {
                  const val = row[col];
                  // Yarışmacı ismini vurgulama
                  if (col === 'Yarismaci') {
                    return (
                      <td key={colIndex} className="px-4 py-3 font-bold text-left whitespace-nowrap border-r border-[#ff2a2a]/10">
                        {val}
                      </td>
                    );
                  }
                  // Skor verilerini boyama (0 ise soluk gri, sayı varsa parlak beyaz)
                  return (
                    <td key={colIndex} className={`px-4 py-3 font-medium border-r border-[#ff2a2a]/10 last:border-r-0 ${val > 0 ? 'text-white' : 'text-gray-700'}`}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}