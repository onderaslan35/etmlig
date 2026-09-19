import React from 'react';

// Vercel bu sayfayı hafızaya almasın, her girişte canlı saldırsın diye:
export const dynamic = 'force-dynamic';

export default async function KacakTunelOtomatik() {
  // 🔴 HEDEF KOORDİNAT VE ŞİFRE DOĞRUDAN SİSTEME KAZINDI 🔴
  const hedef = "https://api.skorunkalbi.com/api/fixture/1570400";
  const TOKEN = "Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6IjNhMDMyY2I2LTMzZWMtNDgyYS1hN2E4LTQ4OTI1ZjA3MWNkNCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2JidHRycGRpbXd5b2hvanpuam5oLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJkYzlmMjdkNS1kNzcxLTQ1NTUtYTRkMi1hMjI1N2UxZWJkMWMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzg5ODUyOTMxLCJpYXQiOjE3ODk4NDkzMzEsImVtYWlsIjoib25kZXJhc2xhbjM1QGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZ29vZ2xlIiwicHJvdmlkZXJzIjpbImdvb2dsZSJdfSwidXNlcl9tZXRhZGF0YSI6eyJhdmF0YXJfdXJsIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jTHNxcGZIRERJWjQ2RGlMNE9BRVUwRFdMM1FUeG5Zb1ZlMXlfS1ZLM21IUWRIdWF6ZU5Cdz1zOTYtYyIsImVtYWlsIjoib25kZXJhc2xhbjM1QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiLDlm5kZXIgQXNsYW4gKEzDqW9uKSIsImlzcyI6Imh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbSIsIm5hbWUiOiLDlm5kZXIgQXNsYW4gKEzDqW9uKSIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0xzcXBmSERESVo0NkRpTDRPQUVVMERXTDNRVHhuWW9WZTF5X0tWSzNtSFFkSHVhemVOQnc9czk2LWMiLCJwcm92aWRlcl9pZCI6IjEwMDQ1NTEwNjM5Nzc2OTIyODkxNiIsInN1YiI6IjEwMDQ1NTEwNjM5Nzc2OTIyODkxNiJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6Im9hdXRoIiwidGltZXN0YW1wIjoxNzg5ODQ5MzMxfV0sInNlc3Npb25faWQiOiIyMzIxZWNlOS1hNzZkLTQzYjctYTQ2Zi00NzAzOTIwMTJlMzgiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.aEBzigW1699JVklvw1lFWE4ofdFe2t8rN6A14_CoanuN6rbS_j8MWe5x4BrF5uZ9gn2iXscICGWOKjazCg94Ag";

  let sonuc = null;
  let hata = null;

  try {
    const res = await fetch(hedef, {
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json'
      },
      cache: 'no-store' 
    });
    
    if (!res.ok) {
      hata = `Kalkanlara Çarptık! HTTP Hatası: ${res.status}`;
    } else {
      sonuc = await res.json();
    }
  } catch (e: any) {
    hata = `Tünel Çöktü: ${e.message}`;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-emerald-400 p-4 sm:p-8 font-sans">
       <div className="max-w-4xl mx-auto">
           <h1 className="text-3xl font-black mb-2 text-rose-500 tracking-widest drop-shadow-[0_0_15px_rgba(225,29,72,0.5)]">🚨 OTOMATİK SIZMA MERKEZİ 🚨</h1>
           <p className="text-slate-400 mb-8 text-sm">Hedef: {hedef}</p>

           {hata && (
             <div className="bg-red-950/80 border border-red-500 text-red-300 p-6 rounded-xl font-bold tracking-wide">
               <span className="text-2xl block mb-2">🛑</span>
               {hata}
             </div>
           )}
           
           {sonuc && (
             <div className="bg-slate-900/80 p-6 rounded-xl border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
               <h2 className="text-emerald-400 font-bold mb-4 tracking-widest border-b border-emerald-500/30 pb-2">🎯 SIZMA BAŞARILI! ELE GEÇİRİLEN VERİ:</h2>
               <div className="overflow-auto max-h-[600px] custom-scrollbar">
                 <pre className="text-xs text-emerald-300/80">{JSON.stringify(sonuc, null, 2)}</pre>
               </div>
             </div>
           )}
       </div>
    </div>
  );
}