'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PORTAL_OPEN_LOGIN_EVENT,
  PORTAL_SESSION_EVENT,
  PortalSession,
  readPortalSession,
  writePortalSession,
  isSuperAdminUser
} from '@/components/PortalAuthGate';
import { getClubLogoUrl, isNationalTeamName, refreshCustomClubsCache } from '@/components/FavoriteTeamSelector';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [portalSession, setPortalSession] = useState<PortalSession | null>(null);
  const [, setLogoTick] = useState(0);

  useEffect(() => {
    refreshCustomClubsCache(false).then(() => setLogoTick((v) => v + 1));
    const sync = () => setPortalSession(readPortalSession());
    sync();
    window.addEventListener(PORTAL_SESSION_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(PORTAL_SESSION_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const isVisitor = !portalSession || portalSession.role === 'visitor';
  const isSuperAdmin = Boolean(
    portalSession?.role === 'player' && isSuperAdminUser(portalSession.userId)
  );

  const playerClubLogo =
    portalSession?.role === 'player' &&
    portalSession.favoriteTeam &&
    !isNationalTeamName(portalSession.favoriteTeam)
      ? getClubLogoUrl(portalSession.favoriteTeam)
      : '';

  const handleLogout = () => {
    writePortalSession(null);
    window.dispatchEvent(new CustomEvent(PORTAL_OPEN_LOGIN_EVENT));
  };

  const handleOpenLogin = () => {
    window.dispatchEvent(new CustomEvent(PORTAL_OPEN_LOGIN_EVENT));
  };

  const navLinks = [
    { name: 'PUAN DURUMLARI VE ARŞİV', path: '/yeni-arsiv', isCanli: false },
    {
      name: isVisitor ? 'RESMİ DEKLARASYON' : 'TAHMİNLER',
      path: '/tahmin',
      isCanli: false
    },
    { name: 'CANLI', path: '/canli', isCanli: true }
  ];

  const isAdminActive = pathname?.startsWith('/admin');

  const desktopBtnCls = (active: boolean) =>
    `px-4 xl:px-5 py-2.5 rounded-xl text-[10px] xl:text-xs font-black tracking-widest uppercase transition-all duration-300 whitespace-nowrap bg-black text-white inline-flex items-center justify-center gap-2 ${
      active
        ? 'border-2 border-white shadow-[0_0_14px_rgba(255,255,255,0.2)]'
        : 'border border-slate-700 hover:border-white'
    }`;

  const mobileBtnCls = (active: boolean) =>
    `px-4 py-3.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all bg-black text-white flex items-center gap-2 ${
      active ? 'border-2 border-white' : 'border border-slate-700'
    }`;

  const renderAuthBadge = (compactMobile: boolean = false) => {
    if (!portalSession) return null;

    if (portalSession.role === 'player') {
      return (
        <div
          className={`flex items-center gap-1.5 bg-[#0a1326] border border-slate-700/90 rounded-full ${
            compactMobile ? 'px-2 py-1' : 'px-3 py-1.5'
          } shadow-inner min-w-0`}
        >
          {playerClubLogo ? (
            <img src={playerClubLogo} alt="" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain shrink-0" />
          ) : (
            <span className="text-[10px]">⚽</span>
          )}
          <span
            className={`text-white font-black uppercase tracking-wider truncate ${
              compactMobile ? 'text-[9px] max-w-[82px] sm:max-w-[130px]' : 'text-[10.5px] max-w-[150px]'
            }`}
          >
            {portalSession.name}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="px-1.5 py-0.5 rounded-full bg-rose-950/90 hover:bg-rose-700 text-rose-200 border border-rose-500/40 text-[8.5px] sm:text-[9.5px] font-black transition-colors cursor-pointer shrink-0"
          >
            Çıkış
          </button>
        </div>
      );
    }

    return (
      <div
        className={`flex items-center gap-1.5 bg-[#0a1326] border border-slate-700/90 rounded-full ${
          compactMobile ? 'px-2 py-1' : 'px-3 py-1.5'
        }`}
      >
        <span className="text-sky-400 font-black text-[9px] sm:text-[10px] whitespace-nowrap">
          👁️ ZİYARETÇİ
        </span>
        <button
          type="button"
          onClick={handleOpenLogin}
          className="px-2 py-0.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-[8.5px] sm:text-[9.5px] font-black transition-colors cursor-pointer whitespace-nowrap"
        >
          Giriş
        </button>
      </div>
    );
  };

  return (
    <nav className="bg-[#050b14]/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-xl">
      <div className="max-w-[1600px] mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* MASAÜSTÜ MENÜ */}
          <div className="hidden lg:flex items-center w-full">
            <div className="flex-1 flex items-center justify-start">
              {renderAuthBadge(false)}
            </div>

            <div className="flex items-center justify-center gap-2 xl:gap-3">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.path ||
                  (link.path === '/tahmin' && pathname === '/tahminler');

                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={desktopBtnCls(isActive)}
                  >
                    {link.isCanli && (
                      <span
                        className={`w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981] shrink-0 ${
                          isActive ? 'animate-pulse' : ''
                        }`}
                      />
                    )}
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex-1 flex items-center justify-end">
              {isSuperAdmin && (
                <Link href="/admin" className={desktopBtnCls(Boolean(isAdminActive))}>
                  YÖNETİM
                </Link>
              )}
            </div>
          </div>

          {/* MOBİL ÜST BAR */}
          <div className="lg:hidden flex items-center justify-between gap-1.5 w-full px-1">
            <Link
              href="/yeni-arsiv"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white font-black tracking-wider text-[10px] sm:text-xs uppercase truncate shrink min-w-0"
            >
              PUAN VE ARŞİV
            </Link>

            <div className="flex items-center justify-center shrink-0">
              {renderAuthBadge(true)}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white focus:outline-none p-1.5 sm:p-2 rounded-lg bg-black border border-slate-700 shrink-0"
              aria-label="Menüyü Aç/Kapat"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* MOBİL AÇILIR MENÜ */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#050b14] border-t border-slate-800/80 px-4 pt-3 pb-5 space-y-2.5 w-full">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.path ||
              (link.path === '/tahmin' && pathname === '/tahminler');

            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={mobileBtnCls(isActive)}
              >
                {link.isCanli && (
                  <span
                    className={`w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981] shrink-0 ${
                      isActive ? 'animate-pulse' : ''
                    }`}
                  />
                )}
                <span>{link.name}</span>
              </Link>
            );
          })}

          {isSuperAdmin && (
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className={mobileBtnCls(Boolean(isAdminActive))}
            >
              YÖNETİM
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}