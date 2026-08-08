'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'DFO PUAN DURUMU', path: '/puan-durumu/dfo' },
    { name: 'MASTER PUAN DURUMU', path: '/puan-durumu/master' },
    { name: 'TFF PUAN DURUMU', path: '/puan-durumu/tff' },
    { name: 'SKOR DURUMU', path: '/skor-durumu' },
    { name: 'MAÇ ARŞİVİ', path: '/mac-arsivi' },
  ];

  return (
    <nav className="w-full bg-slate-950/90 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* MASAÜSTÜ MENÜ LİNKLERİ (TÜMÜ BÜYÜK VE EŞİT YAZI BOYUTUNDA) */}
        <div className="hidden md:flex items-center gap-1.5 w-full justify-between">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`px-3 py-2 rounded-xl text-xs font-black tracking-wide transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-105 border border-amber-400'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* MOBİL MENÜ BUTONU (HAMBURGER) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-slate-300 hover:text-white p-2 rounded-lg focus:outline-none ml-auto"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* MOBİL MENÜ AÇILIR LİSTESİ */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-xs font-black tracking-wide transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}