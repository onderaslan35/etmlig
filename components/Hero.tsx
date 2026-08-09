import Image from "next/image";

export default function Hero() {
  return (
    <section className="text-center py-24">

      <Image
        src="/logo.png"
        width={220}
        height={220}
        alt="ETML"
        className="mx-auto mb-8"
      />

      <h1 className="text-6xl font-black text-yellow-400">
        ELİT TAHMİN
      </h1>

      <h2 className="text-5xl font-bold text-white mt-3">
        MASTER LİGİ
      </h2>

      <p className="text-gray-300 mt-8 text-xl">
        Türkiye'nin Profesyonel Futbol Tahmin Platformu
      </p>

      <div className="mt-12 flex justify-center gap-6">

        <button className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl font-bold">
          Tahmin Yap
        </button>

        <button className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-4 rounded-xl font-bold">
          Puan Durumu
        </button>

      </div>

    </section>
  );
}