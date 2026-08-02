"use client";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-zinc-900 p-8 rounded-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-yellow-400 mb-6">
          ETML Kayıt Ol
        </h1>

        <input
          type="text"
          placeholder="Ad Soyad"
          className="w-full mb-3 p-3 rounded bg-zinc-800"
        />

        <input
          type="text"
          placeholder="Kullanıcı Adı"
          className="w-full mb-3 p-3 rounded bg-zinc-800"
        />

        <input
          type="email"
          placeholder="E-posta"
          className="w-full mb-3 p-3 rounded bg-zinc-800"
        />

        <input
          type="password"
          placeholder="Şifre"
          className="w-full mb-5 p-3 rounded bg-zinc-800"
        />

        <button className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-xl font-bold">
          Kayıt Ol
        </button>
      </div>
    </main>
  );
}