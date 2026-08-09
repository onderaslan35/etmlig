import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-black/90 border-b border-green-700 backdrop-blur">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        <div className="flex items-center gap-3">
          <span className="text-3xl">⚽</span>

          <div>
            <h1 className="text-2xl font-bold text-yellow-400">
              ETML
            </h1>

            <p className="text-xs text-gray-400">
              Elit Tahmin Master Ligi
            </p>
          </div>
        </div>

        <nav className="hidden md:flex gap-8 text-white font-medium">

          <Link href="/">Ana Sayfa</Link>

          <Link href="/tahmin">
            Tahmin Yap
          </Link>

          <Link href="/puan-durumu">
            Puan Durumu
          </Link>

          <Link href="/fikstur">
            Fikstür
          </Link>

          <Link href="/login">
            Giriş
          </Link>

        </nav>

      </div>
    </header>
  );
}