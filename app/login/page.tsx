"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function girisYap() {
    setYukleniyor(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: sifre,
    });

    setYukleniyor(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-zinc-900 p-8 rounded-2xl w-full max-w-md">

        <h1 className="text-3xl font-bold text-yellow-400 mb-6">
          ETML Giriş
        </h1>

        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-3 rounded bg-zinc-800"
        />

        <input
          type="password"
          placeholder="Şifre"
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
          className="w-full mb-5 p-3 rounded bg-zinc-800"
        />

        <button
          onClick={girisYap}
          disabled={yukleniyor}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-xl font-bold"
        >
          {yukleniyor ? "Giriş Yapılıyor..." : "Giriş Yap"}
        </button>

      </div>
    </main>
  );
}