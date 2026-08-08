"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [userCode, setUserCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanCode = userCode.trim();
    const cleanPass = password.trim();

    if (!cleanCode || !cleanPass) {
      setError("Lütfen Kullanıcı ID ve Şifrenizi girin.");
      return;
    }

    setLoading(true);

    const { data, error: dbError } = await supabase
      .from("users")
      .select("*")
      .eq("user_code", cleanCode)
      .eq("password", cleanPass);

    if (dbError || !data || data.length === 0) {
      setError("Girdiğiniz Kullanıcı ID veya Şifre hatalı!");
      setLoading(false);
      return;
    }

    // Başarılı Giriş
    const loggedUser = data[0];
    localStorage.setItem("etml_user", JSON.stringify(loggedUser));

    router.push("/tahmin");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
            Elit Tahmin Master Ligi
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
            Giriş Yap
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Lütfen size verilen Kullanıcı ID ve Şifrenizi giriniz.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
              Kullanıcı ID (Giriş Kodu)
            </label>
            <input
              type="text"
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              placeholder="Örn: 262728"
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3.5 text-white outline-none transition focus:border-emerald-400 font-bold"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••"
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3.5 text-white outline-none transition focus:border-emerald-400 font-bold"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm font-semibold text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-500 py-4 text-base font-black text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60 shadow-lg shadow-emerald-500/20"
          >
            {loading ? "Giriş Yapılıyor..." : "Sisteme Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}