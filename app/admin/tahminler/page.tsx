'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase'; // 🔴 EKMEL DOKUNUŞU: Hatalı API Key sorununu çözen doğru bağlantı!

export default function TahminlerPanel() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterWeek, setFilterWeek] = useState<string>('all');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      try {
        // "predictions" isimli bir tablon varsa oradan çeker. Yoksa hata mesajı yakalar.
        const { data, error } = await supabase.from('predictions').select('*').order('created_at', { ascending: false });
        
        if (error) {
          setErrorMsg('Veritabanında henüz bir tahmin tablosu bulunmuyor veya boş. (Sistem hazır, verileri bekliyor)');
        } else if (data) {
          setPredictions(data);
        }
      } catch (err: any) {
        setErrorMsg('Supabase bağlantısında sorun oluştu. Lütfen bağlantı ayarlarını kontrol et.');
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  const filteredPredictions = predictions.filter(pred => {
    const matchesSearch = (pred.user_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (pred.match_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesWeek = filterWeek === 'all' || pred.week === filterWeek;
    return matchesSearch && matchesWeek;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 text-slate-100 min-h-screen">
      
      {/* ÜST BİLGİ KARTLARI */}
      <div className="bg-[#0a1120] border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-amber-500 font-bold text-[10px] tracking-widest uppercase mb-1">ETML YÖNETİM PANELİ</h2>
          <h1 className="text-3xl font-black text-white tracking-tight">Tahmin Kontrol Paneli</h1>
          <p className="text-slate-400 text-sm mt-2">Kullanıcı tahminlerini veritabanından çek, yarışmacıları takip et ve itirazları denetle.</p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex-1 text-center">
            <div className="text-slate-400 text-xs font-bold uppercase mb-1">Toplam Tahmin</div>
            <div className="text-2xl font-black text-white">{predictions.length}</div>
          </div>
          <div className="bg-blue-950/30 border border-blue-900/50 p-4 rounded-xl flex-1 text-center">
            <div className="text-blue-400 text-xs font-bold uppercase mb-1">Filtrelenen</div>
            <div className="text-2xl font-black text-blue-300">{filteredPredictions.length}</div>
          </div>
        </div>
      </div>

      {/* ARAMA VE FİLTRELEME */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-400 text-xs font-bold mb-2">Yarışmacı Ara (İtiraz Kontrol)</label>
          <input 
            type="text" 
            placeholder="Sedat Sedat, Doğuç Alkan vb. ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a1120] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-slate-400 text-xs font-bold mb-2">Hafta Filtresi (Kaçak Kontrolü)</label>
          <select 
            value={filterWeek}
            onChange={(e) => setFilterWeek(e.target.value)}
            className="w-full bg-[#0a1120] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tüm Haftalar</option>
            <option value="1">1. Hafta</option>
            <option value="2">2. Hafta</option>
            <option value="3">3. Hafta</option>
            <option value="4">4. Hafta</option>
          </select>
        </div>
      </div>

      {/* TAHMİN LİSTESİ TABLOSU */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <h3 className="font-bold text-white">Tahmin Listesi (Gözetleme Kulesi)</h3>
          <button className="bg-slate-800 hover:bg-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition-colors border border-slate-700">
            Yenile
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="text-center py-10 text-slate-500 animate-pulse font-medium">Veritabanına bağlanılıyor, kayıtlar aranıyor...</div>
          ) : errorMsg ? (
            <div className="bg-amber-950/30 border border-amber-900/50 text-amber-400 p-4 rounded-xl text-sm font-medium text-center">
              🚧 {errorMsg}
            </div>
          ) : filteredPredictions.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-medium">
              Bu kriterlere uygun bir tahmin bulunamadı veya veritabanı henüz boş.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-400 uppercase text-xs border-b border-slate-800">
                  <tr>
                    <th className="pb-3 pr-4">Tarih</th>
                    <th className="pb-3 pr-4">Hafta</th>
                    <th className="pb-3 pr-4">Yarışmacı</th>
                    <th className="pb-3 pr-4">Maç</th>
                    <th className="pb-3 text-center">Girilen Skor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPredictions.map((pred, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-3 pr-4 text-slate-500 text-xs">{new Date(pred.created_at).toLocaleString('tr-TR')}</td>
                      <td className="py-3 pr-4"><span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">{pred.week}. Hafta</span></td>
                      <td className="py-3 pr-4 font-bold text-amber-400">{pred.user_name}</td>
                      <td className="py-3 pr-4 text-slate-300">{pred.match_name}</td>
                      <td className="py-3 text-center">
                        <span className="bg-[#050b14] border border-slate-700 px-3 py-1 rounded-md font-black text-white shadow-inner">
                          {pred.home_score} - {pred.away_score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}