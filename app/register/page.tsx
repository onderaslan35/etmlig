"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [adSoyad, setAdSoyad] = useState("");
  const [kullaniciAdi, setKullaniciAdi] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function kayitOl() {
    setYukleniyor(true);

    const { error } = await supabase.auth.signUp({
      email,
      password: sifre,
      options: {
        data: {
          adSoyad,
          kullaniciAdi,
        },
      },
    });

    setYukleniyor(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Kayıt başarılı! E-posta adresini doğrulaman gerekiyor.");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-zinc-900 p-8 rounded-2xl w-full max-w-md">

        <h1 className="text-3xl font-bold text-yellow-400 mb-6">
          ETML Kayıt Ol
        </h1>

        <input
          type="text"
          placeholder="Ad Soyad"
          value={adSoyad}
          onChange={(e) => setAdSoyad(e.target.value)}
          className="w-full mb-3 p-3 rounded bg-zinc-800"
        />

        <input
          type="text"
          placeholder="Kullanıcı Adı"
          value={kullaniciAdi}
          onChange={(e) => setKullaniciAdi(e.target.value)}
          className="w-full mb-3 p-3 rounded bg-zinc-800"
        />

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
          onClick={kayitOl}
          disabled={yukleniyor}
          className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-xl font-bold disabled:opacity-50"
        >
          {yukleniyor ? "Kaydediliyor..." : "Kayıt Ol"}
        </button>

      </div>
    </main>
  );
}