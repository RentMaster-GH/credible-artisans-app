// components/auth/AuthScreen.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdBanner } from '@/AdBanner';
import { supabase } from '@/lib/supabaseClient';
import { DonateModal } from '@/components/donation/DonateModal';

const GLOBAL_CITIES = [
  'Accra, Ghana',
  'Kumasi, Ghana',
  'Lagos, Nigeria',
  'London, United Kingdom',
  'New York, USA',
  'Toronto, Canada',
  'Dubai, UAE',
  'Johannesburg, South Africa',
  'Berlin, Germany',
  'Sydney, Australia',
];

const SAMPLE_ARTISANS = [
  { id: '1', name: 'Kwame M.', service: 'Carpentry & Cabinets', location: 'Accra, Ghana' },
  { id: '2', name: 'David R.', service: 'Master Electrician', location: 'London, UK' },
  { id: '3', name: 'Sarah B.', service: 'Plumbing Specialist', location: 'Toronto, Canada' },
];

export function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'artisan' | 'client'>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);

  const [searchCity, setSearchCity] = useState('');
  const [searchService, setSearchService] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Seamless Google OAuth Handler with Callback Route
  const handleGoogleSignIn = async () => {
    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      if (googleError) throw googleError;
    } catch (err: any) {
      setError(err.message || 'Google sign in failed.');
    }
  };

  // 2. Seamless Email/Password Auth Handler
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
    }

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role: role },
          },
        });
        if (signUpError) throw signUpError;
        
        window.location.href = role === 'artisan' ? '/artisan/boq' : '/dashboard';
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        window.location.href = role === 'artisan' ? '/artisan/boq' : '/dashboard';
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContactArtisanClick = () => {
    setIsSignUp(true);
    setError('Please sign up or sign in to enter your user portal and connect with artisans.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-gray-900 text-white font-sans">
      
      {/* LEFT COLUMN: Global Showcase */}
      <div className="lg:col-span-7 relative hidden lg:flex flex-col justify-between p-12 bg-cover bg-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-10000 hover:scale-100"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=1200')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/60 backdrop-blur-[2px]" />

        {/* Header Branding & DONATE BUTTON */}
        <div className="relative z-10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center font-extrabold text-black text-xl shadow-lg">
              CA
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Credible<span className="text-amber-400">Artisans</span>.com
            </span>
          </div>

          <button
            onClick={() => setIsDonateOpen(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg border border-rose-400/40 flex items-center gap-1.5 transition animate-pulse"
          >
            💖 Support Development / Donate
          </button>
        </div>

        {/* Center Headline & Global Near Me Discovery */}
        <div className="relative z-10 my-auto space-y-6 max-w-xl">
          <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
            THE GLOBAL NETWORK FOR VERIFIED ARTISANS
          </span>
          <h1 className="text-4xl lg:text-5xl font-black leading-tight text-white">
            Connect with Skilled Artisans Worldwide.
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed">
            Generate professional Bill of Quantities (BOQ), video call clients live on screen, and showcase your craftsmanship globally.
          </p>

          {/* GLOBAL "📍 Artisans Near Me" Discovery Box */}
          <div className="bg-gray-800/90 p-4 rounded-xl border border-gray-700/80 space-y-3 backdrop-blur-md shadow-xl">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                📍 Discover Artisans Near Me (Global)
              </span>
              <span className="text-[10px] text-gray-400">Sign Up Required to Contact</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">Select City (Worldwide)</option>
                {GLOBAL_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              <select
                value={searchService}
                onChange={(e) => setSearchService(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">All Services</option>
                <option value="Carpentry">Carpentry & Furniture</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Welding">Welding & Fabrication</option>
                <option value="Masonry">Masonry & Construction</option>
              </select>
            </div>

            <div className="space-y-2 pt-1">
              {SAMPLE_ARTISANS.map((artisan) => (
                <div key={artisan.id} className="flex justify-between items-center bg-gray-900/80 p-2.5 rounded-lg border border-gray-700/50">
                  <div>
                    <p className="text-xs font-bold text-white">{artisan.name} <span className="text-[10px] text-amber-400">({artisan.service})</span></p>
                    <p className="text-[10px] text-gray-400">📍 {artisan.location}</p>
                  </div>
                  <button
                    onClick={handleContactArtisanClick}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-[11px] px-3 py-1.5 rounded transition shadow"
                  >
                    💬 Contact
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Floating Stats */}
        <div className="relative z-10 flex items-center gap-8 border-t border-white/10 pt-6">
          <div>
            <p className="text-2xl font-black text-amber-400">Global</p>
            <p className="text-xs text-gray-400 font-medium">Verified Artisan Network</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div>
            <p className="text-2xl font-black text-amber-400">100%</p>
            <p className="text-xs text-gray-400 font-medium">In-App Live Video & BOQ</p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Auth Form & Self-Service Sponsor Portal */}
      <div className="lg:col-span-5 bg-white text-gray-900 flex flex-col justify-between p-6 sm:p-10 overflow-y-auto">
        
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-black text-sm">
              CA
            </div>
            <span className="font-bold text-lg">CredibleArtisans</span>
          </Link>

          <button
            onClick={() => setIsDonateOpen(true)}
            className="lg:hidden bg-rose-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow"
          >
            💖 Donate
          </button>

          <div className="text-sm font-medium ml-auto">
            {isSignUp ? 'Already registered?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-amber-600 hover:text-amber-700 font-bold underline ml-1"
            >
              {isSignUp ? 'Sign In' : 'Register Now'}
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto space-y-6 my-auto">
          
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isSignUp ? 'Join CredibleArtisans as an Artisan or Client' : 'Sign in to access your portal, chats, and BOQs'}
            </p>
          </div>

          {/* GOOGLE SIGN IN WITH FIXED CALLBACK ROUTE */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl shadow-sm transition text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-3 text-xs text-gray-400 uppercase font-semibold">Or Email</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <AdBanner />

          {error && (
            <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-xs font-semibold border border-amber-300">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`py-2 text-xs font-bold rounded-lg transition ${role === 'client' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                👤 I am a Client
              </button>
              <button
                type="button"
                onClick={() => setRole('artisan')}
                className={`py-2 text-xs font-bold rounded-lg transition ${role === 'artisan' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                🛠️ I am an Artisan
              </button>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Kwame Mensah"
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm pr-10 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-base focus:outline-none p-1"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Confirm Password *</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm pr-10 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-base focus:outline-none p-1"
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-3.5 rounded-xl shadow-lg shadow-amber-500/30 transition disabled:opacity-50 text-sm"
            >
              {loading
                ? 'Processing...'
                : isSignUp
                ? `Register as ${role === 'artisan' ? 'Artisan' : 'Client'}`
                : 'Sign In to Portal'}
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-gray-400 mt-6 pt-4 border-t">
          © {new Date().getFullYear()} CredibleArtisans.com. All rights reserved.
        </div>
      </div>

      <DonateModal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
      />

    </div>
  );
}

export default AuthScreen;