import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 text-slate-100 min-h-screen">
      <div className="text-center mb-12 mt-8">
        <h2 className="text-amber-500 font-bold tracking-widest text-sm mb-2 uppercase">Elit Tahmin Master Ligi</h2>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
          Kök Komuta Merkezi
        </h1>
        <p className="text-slate-400 mt-4 text-sm md:text-base">Bütün müstakil sayfalar ve yönetim araçları aktif.</p>
      </div>

      {/* KULLANICI EKRANLARI */}
      <div className="mb-10">
        <h3 className="text-amber-400 font-bold text-xs tracking-widest mb-4 uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          Kullanıcı ve Sistem Ekranları
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <Link href="/puan-durumu/master" className="bg-[#0a1120] border border-slate-800 rounded-2xl p-6 hover:border-amber-500/50 transition-all group shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">🏆 Master Puan Durumu</h4>
              <span className="bg-slate-900 text-[9px] text-slate-400 px-2 py-1 rounded border border-slate-700">MASTER</span>
            </div>
            <p className="text-sm text-slate-500 mb-4">Tüm liglerin (DFO + TFFO) genel toplam puan sıralaması.</p>
            <span className="text-amber-500 text-xs font-bold group-hover:text-amber-400">Sayfaya Git →</span>
          </Link>

          <Link href="/puan-durumu/dfo" className="bg-[#0a1120] border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all group shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">🌍 DFO Puan Durumu</h4>
              <span className="bg-slate-900 text-[9px] text-slate-400 px-2 py-1 rounded border border-slate-700">DFO</span>
            </div>
            <p className="text-sm text-slate-500 mb-4">Dünya Futbol Organizasyonları özel puan durumu.</p>
            <span className="text-amber-500 text-xs font-bold group-hover:text-amber-400">Sayfaya Git →</span>
          </Link>

          <Link href="/puan-durumu/tff" className="bg-[#0a1120] border border-slate-800 rounded-2xl p-6 hover:border-red-500/50 transition-all group shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">🇹🇷 TFF Puan Durumu</h4>
              <span className="bg-slate-900 text-[9px] text-slate-400 px-2 py-1 rounded border border-slate-700">TFFO</span>
            </div>
            <p className="text-sm text-slate-500 mb-4">TFF 1. Lig ve yerli organizasyonlar özel puan durumu.</p>
            <span className="text-amber-500 text-xs font-bold group-hover:text-amber-400">Sayfaya Git →</span>
          </Link>

          <Link href="/skor-durumu" className="bg-[#0a1120] border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all group shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">⚽ Skor Durumu</h4>
              <span className="bg-slate-900 text-[9px] text-slate-400 px-2 py-1 rounded border border-slate-700">CANLI / SONUÇLAR</span>
            </div>
            <p className="text-sm text-slate-500 mb-4">Haftalık oynanan ve canlı devam eden tüm maç sonuçları ile skorlar.</p>
            <span className="text-amber-500 text-xs font-bold group-hover:text-amber-400">Sayfaya Git →</span>
          </Link>

        </div>
      </div>

      {/* ADMİN EKRANLARI (FAZLALIKLAR SİLİNDİ) */}
      <div>
        <h3 className="text-amber-400 font-bold text-xs tracking-widest mb-4 uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          Admin Yönetim Paneli (Mankoman)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <Link href="/admin" className="bg-[#0a1120] border border-slate-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all group shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">⚙️ Admin Paneli Ana Sayfa</h4>
              <span className="bg-slate-900 text-[9px] text-slate-400 px-2 py-1 rounded border border-slate-700">ADMİN ROOT</span>
            </div>
            <p className="text-sm text-slate-500 mb-4">Yönetici genel bakış ve yönetim kontrol merkezi.</p>
            <span className="text-amber-500 text-xs font-bold group-hover:text-amber-400">Sayfaya Git →</span>
          </Link>

          <Link href="/admin/tahminler" className="bg-[#0a1120] border border-slate-800 rounded-2xl p-6 hover:border-amber-500/50 transition-all group shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">📝 Tahmin Kontrol Paneli</h4>
              <span className="bg-slate-900 text-[9px] text-slate-400 px-2 py-1 rounded border border-slate-700">TAHMİNLER</span>
            </div>
            <p className="text-sm text-slate-500 mb-4">Yarışmacıların haftalık yaptığı skor tahminlerinin arşiv ve gözetleme kulesi.</p>
            <span className="text-amber-500 text-xs font-bold group-hover:text-amber-400">Sayfaya Git →</span>
          </Link>

        </div>
      </div>

    </div>
  );
}