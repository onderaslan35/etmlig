'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { TEST_ACCOUNTS } from '@/utils/themeEngine';
import { getClubLogoUrl, isNationalTeamName, refreshCustomClubsCache } from '@/components/FavoriteTeamSelector';

export const PORTAL_SESSION_KEY = 'etml_portal_session_v1';
export const PORTAL_SESSION_EVENT = 'etml-portal-session-changed';
export const PORTAL_OPEN_LOGIN_EVENT = 'etml-portal-open-login';

export interface PortalSession {
  role: 'player' | 'visitor';
  userId?: string;
  name: string;
  favoriteTeam?: string;
}

export const readPortalSession = (): PortalSession | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PORTAL_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.role === 'player' || parsed.role === 'visitor')) {
      return parsed as PortalSession;
    }
  } catch {}
  return null;
};

export const writePortalSession = (session: PortalSession | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (!session) {
      localStorage.removeItem(PORTAL_SESSION_KEY);
    } else {
      localStorage.setItem(PORTAL_SESSION_KEY, JSON.stringify(session));
      if (session.role === 'player' && session.userId) {
        localStorage.setItem(
          'etml_visitor_identity',
          JSON.stringify({ userId: session.userId, name: session.name })
        );
        window.dispatchEvent(new CustomEvent('etml-identity-updated'));
      }
    }
    window.dispatchEvent(new CustomEvent(PORTAL_SESSION_EVENT));
  } catch {}
};

export default function PortalAuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<PortalSession | null>(null);
  const [forceLoginModal, setForceLoginModal] = useState(false);

  const [userIdInput, setUserIdInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Yönetim panelleri bu kapıdan muaftır
  const isAdminRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/master') ||
    pathname.startsWith('/yonetim');

  // Ziyaretçilere tamamen kapalı olan özel rotalar
  const isVisitorBlockedRoute = pathname.startsWith('/tahminmatik');

  useEffect(() => {
    refreshCustomClubsCache(false);
    setSession(readPortalSession());
    setReady(true);

    const syncHandler = () => {
      setSession(readPortalSession());
    };
    const openLoginHandler = () => setForceLoginModal(true);
    window.addEventListener(PORTAL_SESSION_EVENT, syncHandler);
    window.addEventListener('storage', syncHandler);
    window.addEventListener(PORTAL_OPEN_LOGIN_EVENT, openLoginHandler);
    return () => {
      window.removeEventListener(PORTAL_SESSION_EVENT, syncHandler);
      window.removeEventListener('storage', syncHandler);
      window.removeEventListener(PORTAL_OPEN_LOGIN_EVENT, openLoginHandler);
    };
  }, []);

  const handleContestantLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const uid = userIdInput.trim();
    const pwd = passInput.trim();

    if (!uid || !pwd) {
      setErrorMsg('Lütfen Yarışmacı ID ve Şifrenizi giriniz.');
      return;
    }

    if (uid.toLowerCase() === 'mankoman' || uid === '600060') {
      setErrorMsg('Bu hesap yarışmacı tahmin girişine kapalıdır.');
      return;
    }

    setSubmitting(true);
    try {
      const [legacyRes, officialRes] = await Promise.all([
        supabase.from('players').select('*').eq('username', uid).maybeSingle(),
        supabase.from('etml_official_players').select('*').eq('user_id', uid).maybeSingle()
      ]);

      const fallbackAcc = TEST_ACCOUNTS[uid];
      const legacyRow: any = legacyRes.data;
      const officialRow: any = officialRes.data;

      if (officialRow && officialRow.is_active === false) {
        setErrorMsg('Bu yarışmacı hesabı aktif değildir.');
        setSubmitting(false);
        return;
      }

      const validPass = String(legacyRow?.password || fallbackAcc?.pass || '').trim();
      if (!validPass || String(pwd) !== validPass) {
        setErrorMsg('ID veya Şifre hatalı! Lütfen kontrol edip tekrar deneyin.');
        setSubmitting(false);
        return;
      }

      const resolvedName = String(
        officialRow?.full_name || legacyRow?.name || legacyRow?.full_name || fallbackAcc?.name || uid
      ).trim();

      const rawFav = String(officialRow?.favorite_team || legacyRow?.favorite_team || '').trim();
      const safeFav = isNationalTeamName(rawFav) ? '' : rawFav;

      const newSession: PortalSession = {
        role: 'player',
        userId: uid,
        name: resolvedName,
        favoriteTeam: safeFav
      };

      writePortalSession(newSession);
      setSession(newSession);
      setForceLoginModal(false);
      setUserIdInput('');
      setPassInput('');
    } catch {
      setErrorMsg('Bağlantı hatası oluştu, lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVisitorEnter = () => {
    const visitorSession: PortalSession = {
      role: 'visitor',
      name: 'ZİYARETÇİ'
    };
    writePortalSession(visitorSession);
    setSession(visitorSession);
    setForceLoginModal(false);
    if (isVisitorBlockedRoute) {
      router.push('/yeni-arsiv');
    }
  };

  const handleLogoutOrSwitch = () => {
    writePortalSession(null);
    setSession(null);
    setForceLoginModal(true);
  };

  if (isAdminRoute) {
    return <>{children}</>;
  }

  if (!ready) {
    return <div className="min-h-screen bg-[#050b14]" />;
  }

  // Oturum yoksa veya kullanıcı "Yarışmacı Girişi Yap" butonuna bastıysa tam ekran karşılama kapısı
  if (!session || forceLoginModal) {
    return (
      <div className="min-h-screen bg-[#040914] text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0f295c_0%,#040914_65%)] opacity-90 pointer-events-none" />

        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-6">
          {/* ÜST BAŞLIK */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-[11px] font-black tracking-widest uppercase">
              🏆 ELİT TAHMİN MASTER LİGİ • RESMİ PORTAL
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-white to-amber-300">
              HOŞ GELDİNİZ
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-bold max-w-lg mx-auto">
              Maç kartları üzerinden tahmin yapmak ve size özel canlı gol animasyonlarını yaşamak için yarışmacı girişi yapın veya ziyaretçi olarak devam edin.
            </p>
          </div>

          {/* İKİLİ GİRİŞ KAPISI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
            {/* SOL KART: YARIŞMACI / TAHMİNCİ GİRİŞİ */}
            <div className="bg-gradient-to-b from-[#0b1936] via-[#081226] to-[#050b18] border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(245,158,11,0.18)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 text-[10px] font-black uppercase tracking-widest">
                    ⚽ TAHMİNCİ / ÜYE GİRİŞİ
                  </span>
                  <span className="text-2xl">🔐</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide mb-1">
                  YARIŞMACI GİRİŞİ
                </h2>
                <p className="text-xs text-slate-300 mb-5 leading-relaxed">
                  Maç kartlarının üzerinde <strong className="text-amber-300">+ / -</strong> ile anında skor tahmini yapın <strong className="text-emerald-300"></strong>  <strong className="text-rose-300"></strong> 
                </p>

                <form onSubmit={handleContestantLogin} className="space-y-3">
                  <input
                    type="text"
                    value={userIdInput}
                    onChange={(e) => setUserIdInput(e.target.value)}
                    placeholder="YARIŞMACI ID"
                    className="w-full bg-[#040914] border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-center font-black tracking-widest text-sm text-white outline-none transition-colors"
                  />
                  <input
                    type="password"
                    value={passInput}
                    onChange={(e) => setPassInput(e.target.value)}
                    placeholder="ŞİFRE"
                    className="w-full bg-[#040914] border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-center font-black tracking-[0.35em] text-base text-white outline-none transition-colors placeholder:tracking-widest placeholder:text-sm"
                  />

                  {errorMsg && (
                    <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/60 text-rose-200 text-[11px] font-bold text-center">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'DOĞRULANIYOR...' : '🚀 YARIŞMACI OLARAK GİR'}
                  </button>
                </form>
              </div>
            </div>

            {/* SAĞ KART: ZİYARETÇİ GİRİŞİ */}
            <div className="bg-gradient-to-b from-[#08152c] via-[#061020] to-[#040a14] border border-sky-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_12px_35px_rgba(2,132,199,0.15)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/50 text-sky-300 text-[10px] font-black uppercase tracking-widest">
                    👁️ ŞİFRESİZ İZLEYİCİ MODU
                  </span>
                  <span className="text-2xl">🏟️</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide mb-2">
                  ZİYARETÇİ GİRİŞİ
                </h2>
                <p className="text-xs text-slate-300 mb-5 leading-relaxed">
                  Şifre girmeden ligin heyecanını dışarıdan takip edin. Tahmin girişi ve Tahminmatik araçları ziyaretçilere kapalıdır.
                </p>

                <div className="space-y-2 text-[11px] font-bold text-slate-300 bg-[#040914]/80 border border-slate-800 rounded-2xl p-4 mb-5">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <span>✓</span> <span>Genel Puan Durumu & Haftalık Özeti Görme</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <span>✓</span> <span>Maç Arşivi & Yarışmacı Sezon Karneleri</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <span>✓</span> <span>Canlı Skorlar & Resmi Deklarasyon Tablosu</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-400/90 pt-1 border-t border-slate-800">
                    <span>✕</span> <span>Tahmin Girişi ve Tahminmatik Kapalıdır</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleVisitorEnter}
                className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs sm:text-sm uppercase tracking-widest border border-sky-300/60 shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all cursor-pointer"
              >
                👁️ ZİYARETÇİ OLARAK DEVAM ET
              </button>
            </div>
          </div>

          {session && forceLoginModal && (
            <button
              type="button"
              onClick={() => setForceLoginModal(false)}
              className="text-xs font-bold text-slate-400 hover:text-white underline cursor-pointer"
            >
              Vazgeç ve mevcut oturuma dön
            </button>
          )}
        </div>
      </div>
    );
  }

  // Ziyaretçi yasaklı bir adrese (/tahminmatik vb.) doğrudan URL yazarak girerse engelle
  if (session.role === 'visitor' && isVisitorBlockedRoute) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#071126] border border-rose-500/50 rounded-3xl p-7 text-center space-y-4 shadow-2xl">
          <div className="text-4xl">🔒</div>
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
            YARIŞMACILARA ÖZEL ALAN
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Ziyaretçi modunda yalnızca Puan Durumu, Maç Arşivi, Canlı Skorlar ve Resmi Deklarasyon görüntülenebilir.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setForceLoginModal(true)}
              className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              🔐 Yarışmacı Girişi
            </button>
            <button
              type="button"
              onClick={() => router.push('/tahminler')}
              className="flex-1 py-3 rounded-xl bg-sky-700 hover:bg-sky-600 text-white font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              📜 Resmi Deklarasyon
            </button>
          </div>
        </div>
      </div>
    );
  }

  const playerClubLogo =
    session.role === 'player' && session.favoriteTeam
      ? getClubLogoUrl(session.favoriteTeam)
      : '';

  return <>{children}</>;
}