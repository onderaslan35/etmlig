"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MacEklePage() {
  const [hafta, setHafta] = useState("");
  const [macNo, setMacNo] = useState("");
  const [lig, setLig] = useState("TFF 1. Lig");
  const [evSahibi, setEvSahibi] = useState("");
  const [deplasman, setDeplasman] = useState("");
  const [macTarihi, setMacTarihi] = useState("");
  const [kaydediliyor, setKaydediliyor] = useState(false);

  async function macEkle() {
    if (!hafta || !macNo || !evSahibi || !deplasman || !macTarihi) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    setKaydediliyor(true);

    const { error } = await supabase.from("matches").insert({
      hafta: Number(hafta),
      mac_no: Number(macNo),
      lig,
      ev_sahibi: evSahibi,
      deplasman,
      mac_tarihi: macTarihi,
      durum: "Bekliyor",
    });

    setKaydediliyor(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Maç başarıyla eklendi.");

    setMacNo("");
    setEvSahibi("");
    setDeplasman("");
    setMacTarihi("");
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto p-10">

        <h1 className="text-4xl font-bold text-yellow-400 mb-10">
          ETML Yönetici Paneli
        </h1>

        <div className="bg-zinc-900 rounded-xl p-8">

          <div className="grid grid-cols-2 gap-5">

            <input
              placeholder="Hafta"
              value={hafta}
              onChange={(e) => setHafta(e.target.value)}
              className="bg-zinc-800 p-3 rounded"
            />

            <input
              placeholder="Maç No"
              value={macNo}
              onChange={(e) => setMacNo(e.target.value)}
              className="bg-zinc-800 p-3 rounded"
            />

            <select
              value={lig}
              onChange={(e) => setLig(e.target.value)}
              className="bg-zinc-800 p-3 rounded"
            >
              <option>TFF 1. Lig</option>
            </select>

            <input
              type="datetime-local"
              value={macTarihi}
              onChange={(e) => setMacTarihi(e.target.value)}
              className="bg-zinc-800 p-3 rounded"
            />

            <input
              placeholder="Ev Sahibi"
              value={evSahibi}
              onChange={(e) => setEvSahibi(e.target.value)}
              className="bg-zinc-800 p-3 rounded"
            />

            <input
              placeholder="Deplasman"
              value={deplasman}
              onChange={(e) => setDeplasman(e.target.value)}
              className="bg-zinc-800 p-3 rounded"
            />

          </div>

          <button
            onClick={macEkle}
            disabled={kaydediliyor}
            className="mt-8 w-full bg-green-600 hover:bg-green-700 rounded-xl p-4 font-bold disabled:opacity-50"
          >
            {kaydediliyor ? "Kaydediliyor..." : "MAÇI EKLE"}
          </button>

        </div>

      </div>
    </main>
  );
}