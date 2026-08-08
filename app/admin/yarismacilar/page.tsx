"use client";

import { useMemo, useState } from "react";

type Contestant = {
  id: number;
  ad_soyad: string;
  kullanici_adi: string;
  email: string;
  durum: "Aktif" | "Pasif";
};

const sampleContestants: Contestant[] = [
  {
    id: 1,
    ad_soyad: "Onur Arslan",
    kullanici_adi: "onur",
    email: "onur@example.com",
    durum: "Aktif",
  },
  {
    id: 2,
    ad_soyad: "Ayşe Yılmaz",
    kullanici_adi: "ayse",
    email: "ayse@example.com",
    durum: "Aktif",
  },
  {
    id: 3,
    ad_soyad: "Mert Kaya",
    kullanici_adi: "mert",
    email: "mert@example.com",
    durum: "Aktif",
  },
  {
    id: 4,
    ad_soyad: "Can Demir",
    kullanici_adi: "can",
    email: "can@example.com",
    durum: "Pasif",
  },
];

export default function YarismacilarPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredContestants = useMemo(() => {
    let result = [...sampleContestants];

    if (statusFilter !== "all") {
      result = result.filter((item) => item.durum === statusFilter);
    }

    if (search.trim()) {
      const query = search.toLocaleLowerCase("tr");

      result = result.filter((item) =>
        [item.ad_soyad, item.kullanici_adi, item.email]
          .join(" ")
          .toLocaleLowerCase("tr")
          .includes(query)
      );
    }

    return result;
  }, [search, statusFilter]);

  const totalCount = sampleContestants.length;
  const activeCount = sampleContestants.filter(
    (item) => item.durum === "Aktif"
  ).length;
  const passiveCount = sampleContestants.filter(
    (item) => item.durum === "Pasif"
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-400">
                ETML Yönetim Paneli
              </p>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Yarışmacılar
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                Yarışmacı listesini görüntüle, aktif-pasif durumlarını takip et
                ve kullanıcı yönetim ekranını hazır hale getir.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-indigo-300">
                  Toplam
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {totalCount}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-emerald-300">
                  Aktif
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {activeCount}
                </p>
              </div>

              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-amber-300">
                  Pasif
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {passiveCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Ara
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ad, kullanıcı adı veya e-posta ara..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Durum
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-400"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="Aktif">Aktif</option>
                <option value="Pasif">Pasif</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-xl sm:p-6">
          <div className="mb-6">
            <h2 className="text-xl font-black text-white">Yarışmacı Listesi</h2>
            <p className="mt-1 text-sm text-slate-400">
              Şimdilik örnek veriler gösteriliyor. Sonraki adımda bunu gerçek
              kullanıcı tablosuna bağlarız.
            </p>
          </div>

          {filteredContestants.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-6 text-center text-slate-300">
              Gösterilecek yarışmacı bulunamadı.
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-950/80">
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                      <th className="px-4 py-4">Ad Soyad</th>
                      <th className="px-4 py-4">Kullanıcı Adı</th>
                      <th className="px-4 py-4">E-posta</th>
                      <th className="px-4 py-4">Durum</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10 bg-slate-900/40">
                    {filteredContestants.map((item) => (
                      <tr key={item.id} className="transition hover:bg-white/5">
                        <td className="px-4 py-4 text-sm font-bold text-white">
                          {item.ad_soyad}
                        </td>
                        <td className="px-4 py-4 text-sm text-cyan-300">
                          @{item.kullanici_adi}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-300">
                          {item.email}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              item.durum === "Aktif"
                                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                                : "border border-amber-500/20 bg-amber-500/10 text-amber-300"
                            }`}
                          >
                            {item.durum}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
