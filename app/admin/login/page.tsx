"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (field: "email" | "password", value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!form.email.trim() || !form.password.trim()) {
      setError("E-posta ve şifre zorunludur.");
      return;
    }

    setMessage(
      "Giriş formu hazır. Sonraki adımda bunu gerçek Supabase auth sistemine bağlayacağız."
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm lg:grid-cols-2">
          <div className="flex flex-col justify-between border-b border-white/10 p-8 lg:border-b-0 lg:border-r">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
                ETML Giriş
              </p>
              <h1 className="text-4xl font-black tracking-tight text-white">
                Hoş geldin
              </h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
                Tahminlerini yönetmek, puan durumunu görmek ve ETML sistemine
                giriş yapmak için hesabınla oturum aç.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <p className="text-xs uppercase tracking-widest text-emerald-300">
                  Sistem
                </p>
                <p className="mt-2 text-xl font-black text-white">ETML</p>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                <p className="text-xs uppercase tracking-widest text-cyan-300">
                  Mod
                </p>
                <p className="mt-2 text-xl font-black text-white">Login</p>
              </div>

              <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-4">
                <p className="text-xs uppercase tracking-widest text-fuchsia-300">
                  Durum
                </p>
                <p className="mt-2 text-xl font-black text-white">Hazır</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="mx-auto max-w-md">
              <h2 className="text-2xl font-black text-white">Giriş Yap</h2>
              <p className="mt-2 text-sm text-slate-400">
                E-posta ve şifren ile hesabına giriş yap.
              </p>

              <form onSubmit={handleLogin} className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="ornek@mail.com"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Şifre
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Şifreni gir"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                  />
                </div>

                {message ? (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                    {message}
                  </div>
                ) : null}

                {error ? (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-400"
                >
                  Giriş Yap
                </button>
              </form>

              <div className="mt-6 text-sm text-slate-400">
                Hesabın yok mu?{" "}
                <Link
                  href="/register"
                  className="font-bold text-emerald-400 transition hover:text-emerald-300"
                >
                  Kayıt Ol
                </Link>
              </div>

              <div className="mt-4 text-sm text-slate-500">
                Admin girişleri için yönetim paneli ayrı akışta tutulabilir.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
