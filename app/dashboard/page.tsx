import Link from "next/link";

const cards = [
  {
    title: "Tahmin Yap",
    href: "/tahmin",
    icon: "🎯",
    desc: "Aktif haftanın maçları için tahminlerini gir.",
  },
  {
    title: "Puan Durumu",
    href: "/puan-durumu",
    icon: "🥇",
    desc: "Genel sıralamayı ve puan durumunu görüntüle.",
  },
  {
    title: "Fikstür",
    href: "/fikstur",
    icon: "📅",
    desc: "Haftanın maç programını incele.",
  },
  {
    title: "Profil",
    href: "/login",
    icon: "👤",
    desc: "Hesap ve giriş bilgilerini yönet.",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
                ETML Kullanıcı Paneli
              </p>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                Dashboard
              </h1>
              <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
                Tahminlerini yönet, maçları takip et ve puan durumunu görüntüle.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-emerald-300">
                  Panel
                </p>
                <p className="mt-2 text-2xl font-black text-white">Kullanıcı</p>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-cyan-300">
                  Durum
                </p>
                <p className="mt-2 text-2xl font-black text-white">Hazır</p>
              </div>

              <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-fuchsia-300">
                  Modül
                </p>
                <p className="mt-2 text-2xl font-black text-white">4</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-2xl font-black text-white">Kullanıcı Modülleri</h2>
          <p className="mt-1 text-sm text-slate-400">
            Aşağıdaki ekranlardan kullanıcı işlemlerini yönet.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-3xl border border-white/10 bg-slate-900/80 p-5 transition duration-200 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-slate-900"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60 text-2xl">
                {card.icon}
              </div>

              <h3 className="text-xl font-black text-white">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {card.desc}
              </p>

              <div className="mt-5 inline-flex items-center text-sm font-bold text-emerald-400">
                Modüle git
                <span className="ml-2 transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
