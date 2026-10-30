"use client";

import Link from 'next/link';
import { ShieldCheck, MapPin, MessageCircle, Star, Search, Hammer, Zap, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#fcfcff] dark:bg-[#05060f] text-zinc-900 dark:text-white">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-[#05060f]/70 border-b border-zinc-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-[64px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-black leading-none">C</div>
            <span className="font-bold tracking-tight">CredibleArtisans</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="h-9 px-4 rounded-full text-sm font-medium inline-flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-white/10">Log in</Link>
            <Link href="/signup" className="h-9 px-5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-bold inline-flex items-center justify-center leading-none">Get Started</Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-amber-50 dark:from-indigo-950/20 dark:via-[#05060f] dark:to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-white/[0.06] border border-zinc-200 dark:border-white/10 text-xs">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> 1,200+ clients trust us in Ghana
          </div>
          <h1 className="mt-6 text-[42px] md:text-[72px] font-black tracking-tighter leading-[0.9]">
            Find <span className="text-indigo-600 dark:text-indigo-400">credible</span><br />artisans nearby.
          </h1>
          <p className="mt-6 text-[17px] leading-relaxed text-zinc-600 dark:text-white/60 max-w-[560px]">
            Verified electricians, plumbers, carpenters, masons. Chat instantly, get a BOQ, pay securely. No more ghosting.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/client/dashboard" className="h-12 px-7 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-bold inline-flex items-center justify-center gap-2 leading-none">
              <Search className="w-4 h-4" /> Find an Artisan <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/signup" className="h-12 px-7 rounded-full bg-white dark:bg-white/10 border border-zinc-200 dark:border-white/10 text-sm font-bold inline-flex items-center justify-center gap-2 leading-none">
              <Hammer className="w-4 h-4" /> Join as Artisan
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-zinc-300 border-2 border-white dark:border-[#05060f]" />
              <div className="w-8 h-8 rounded-full bg-zinc-400 border-2 border-white dark:border-[#05060f]" />
              <div className="w-8 h-8 rounded-full bg-zinc-500 border-2 border-white dark:border-[#05060f]" />
            </div>
            <span className="text-sm flex items-center gap-1.5"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> <b>4.8/5</b> from 340 reviews</span>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { Icon: MapPin, t: 'Nearby & Fast', d: 'Find artisans within 5km in Accra. Real-time availability.' },
            { Icon: MessageCircle, t: 'Chat + BOQ', d: 'Send photos, get Bill of Quantities before work starts.' },
            { Icon: ShieldCheck, t: 'Verified & Safe', d: 'Ghana Card + skill verified. Payments protected.' },
          ].map(({Icon, t, d}) => (
            <div key={t} className="p-6 rounded-[24px] bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center"><Icon className="w-5 h-5" /></div>
              <h3 className="mt-4 font-bold">{t}</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-white/50 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-200 dark:border-white/10 py-8 text-center text-xs text-zinc-500">
        © 2026 CredibleArtisans • <Link href="/support" className="underline">Support</Link>
      </footer>
    </main>
  );
}
