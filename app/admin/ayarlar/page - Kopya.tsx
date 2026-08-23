"use client";

import { useState } from "react";

type SettingItem = {
  id: number;
  title: string;
  description: string;
  enabled: boolean;
};

export default function AyarlarPage() {
  const [settings, setSettings] = useState<SettingItem[]>([
    {
      id: 1,
      title: "Tahmin Sistemi Aktif",
      description: "Kullanıcıların tahmin girişi yapabilmesini aç veya kapat.",
      enabled: true,
    },
    {
      id: 2,
      title: "Puanlama Sistemi Aktif",
      description: "Sonuçlardan sonra puan hesaplama ekranını kullanılabilir yap.",
      enabled: true,
    },
    {
      id: 3,
      title: "Haftalık Liderlik Göster",
      description: "Liderlik ekranında haftalık lider bilgisini görünür yap.",
      enabled: true,
    },
    {
      id: 4,
      title: "Bakım Modu",
      description: "Sistemi geçici olarak yönetim dışı kullanıcılara kapat.",
      enabled: false,
    },
  ]);

  const [message, setMessage] = useState("");

  const handleToggle = (id: number) => {
    setSettings((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );

    setMessage("Ayar görünümü güncellendi. Bu sürüm şu an yerel ön izleme modunda çalışıyor.");
  };

  const enabledCount = settings.filter((item) => item.enabled).length;
  const disabledCount = settings.filter((item) => !item.enabled).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">
                ETML Yönetim Paneli
              </p>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Ayarlar
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                Sistem modüllerini kontrol et, görünüm ayarlarını yönet ve
                ETML yönetim yapılandırmasını düzenle.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-emerald-300">
                  Aktif Ayar
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {enabledCount}
                </p>
              </div>

              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-amber-300">
                  Pasif Ayar
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {disabledCount}
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-4">
                <p className="text-xs uppercase tracking-widest text-cyan-300">
                  Mod
                </p>
                <p className="mt-2 text-2xl font-black text-white">T6</p>
              </div>
            </div>
          </div>
        </div>

        {message ? (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {message}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {settings.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {item.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle(item.id)}
                  className={`inline-flex min-w-[110px] items-center justify-center rounded-2xl px-4 py-3 text-sm font-black transition ${
                    item.enabled
                      ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                      : "bg-slate-700 text-white hover:bg-slate-600"
                  }`}
                >
                  {item.enabled ? "Açık" : "Kapalı"}
                </button>
              </div>

              <div className="mt-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    item.enabled
                      ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                      : "border border-amber-500/20 bg-amber-500/10 text-amber-300"
                  }`}
                >
                  {item.enabled ? "Aktif" : "Pasif"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
          <h2 className="text-xl font-black text-white">Sistem Notu</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Bu ekran şu anda ön izleme mantığıyla çalışıyor. Yani değişiklikler
            şimdilik sadece arayüzde görünür. Sonraki adımda bu ayarları gerçek
            veritabanı tablosuna bağlayıp kalıcı hale getirebiliriz.
          </p>
        </div>
      </div>
    </div>
  );
}
