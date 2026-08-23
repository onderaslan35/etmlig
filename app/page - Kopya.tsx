"use client";

export default function RootDashboardPage() {
  const routes = [
    {
      title: "KULLANICI VE SİSTEM EKRANLARI",
      items: [
        {
          name: "🏆 Master Puan Durumu",
          path: "/puan-durumu/master",
          description: "Tüm liglerin (DFO + TFFO) genel toplam puan sıralaması.",
          badge: "Master",
          color: "border-amber-500/30 hover:border-amber-500 bg-amber-950/10",
        },
        {
          name: "🌍 DFO Puan Durumu",
          path: "/puan-durumu/dfo",
          description: "Dünya Futbol Organizasyonları özel puan durumu.",
          badge: "DFO",
          color: "border-blue-500/30 hover:border-blue-500 bg-blue-950/10",
        },
        {
          name: "🇹🇷 TFF Puan Durumu",
          path: "/puan-durumu/tff",
          description: "TFF 1. Lig ve yerli organizasyonlar özel puan durumu.",
          badge: "TFFO",
          color: "border-red-500/30 hover:border-red-500 bg-red-950/10",
        },
        {
          name: "⚽ Skor Durumu",
          path: "/skor-durumu",
          description: "Haftalık oynanan ve canlı devam eden tüm maç sonuçları ile skorlar.",
          badge: "Canlı / Sonuçlar",
          color: "border-emerald-500/30 hover:border-emerald-500 bg-emerald-950/10",
        },
      ],
    },
    {
      title: "ADMIN YÖNETİM PANELİ (mankoman)",
      items: [
        {
          name: "⚙️ Admin Paneli Ana Sayfa",
          path: "/admin",
          description: "Yönetici genel bakış ve yönetim kontrol merkezi.",
          badge: "Admin Root",
          color: "border-purple-500/30 hover:border-purple-500 bg-purple-950/10",
        },
        {
          name: "⚽ Maç ve Skor Yönetimi",
          path: "/admin/maclar",
          description: "Haftalık maç tanımlama, canlı skor girme ve TFFO/DFO renk rozetleri.",
          badge: "Maç Girişi",
          color: "border-emerald-500/30 hover:border-emerald-500 bg-emerald-950/10",
        },
        {
          name: "👥 Yarışmacı Yönetimi",
          path: "/admin/yarismacilar",
          description: "52 kişilik kemik kadro yarışmacı listesi ve ID kontrolü.",
          badge: "Kullanıcılar",
          color: "border-cyan-500/30 hover:border-cyan-500 bg-cyan-950/10",
        },
        {
          name: "📝 Tahmin Kontrol Paneli",
          path: "/admin/tahminler",
          description: "Yarışmacıların haftalık yaptığı skor tahminlerinin listesi.",
          badge: "Tahminler",
          color: "border-rose-500/30 hover:border-rose-500 bg-rose-950/10",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-10 font-sans">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center sm:text-left border-b border-white/10 pb-6">
          <p className="text-xs font-black uppercase tracking-widest text-amber-400">
            ELİT TAHMİN MASTER LİGİ
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-white mt-1">
            Kök Komuta Merkezi
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Bütün müstakil sayfalar ve yönetim araçları aktif.
          </p>
        </div>

        <div className="space-y-10">
          {routes.map((group, gIdx) => (
            <div key={gIdx}>
              <h2 className="text-xs font-black tracking-widest uppercase text-slate-400 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                {group.title}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.items.map((item, iIdx) => (
                  <a
                    key={iIdx}
                    href={item.path}
                    className={`p-5 rounded-2xl border transition-all duration-200 block group hover:scale-[1.01] ${item.color}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors">
                        {item.name}
                      </h3>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/10 text-slate-300">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      {item.description}
                    </p>
                    <div className="text-[11px] font-mono text-amber-400/80 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Sayfaya Git &rarr;
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}