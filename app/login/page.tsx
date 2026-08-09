// app/login/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdBanner } from '@/AdBanner'; // Adjust import path if AdBanner is in components/
import { supabase } from '@/lib/supabaseClient';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'artisan' | 'client'>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Sign Up Flow
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
            },
          },
        });
        if (signUpError) throw signUpError;
        alert('Account created successfully! Please check your email to verify.');
      } else {
        // Sign In Flow
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

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-gray-900 text-white font-sans">
      
      {/* LEFT COLUMN: Visual Showcase & Artisan Gallery (7 Columns) */}
      <div className="lg:col-span-7 relative hidden lg:flex flex-col justify-between p-12 bg-cover bg-center overflow-hidden">
        {/* Background Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-10000 hover:scale-100"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=1200')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/60 backdrop-blur-[2px]" />

        {/* Top Brand Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center font-extrabold text-black text-xl shadow-lg">
            CA
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            Credible<span className="text-amber-400">Artisans</span>.com
          </span>
        </div>

        {/* Center Headline & Artisan Cards Grid */}
        <div className="relative z-10 my-auto space-y-6 max-w-xl">
          <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
            Ghana's #1 Verified Artisan Platform
          </span>
          <h1 className="text-4xl lg:text-5xl font-black leading-tight text-white">
            Connect with Skilled Artisans or Grow Your Workshop.
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed">
            Generate professional Bill of Quantities (BOQ), video call clients live on screen, and showcase your craftsmanship to thousands of homeowners.
          </p>

          {/* Photo Showcase Grid */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="relative group overflow-hidden rounded-xl border border-white/20 h-28 shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400" 
                alt="Welder" 
                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
              />
              <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded text-amber-300">
                Fabrication
              </span>
            </div>
            <div className="relative group overflow-hidden rounded-xl border border-white/20 h-28 shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400" 
                alt="Plumbing" 
                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
              />
              <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded text-amber-300">
                Plumbing
              </span>
            </div>
            <div className="relative group overflow-hidden rounded-xl border border-white/20 h-28 shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=400" 
                alt="Electrical" 
                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
              />
              <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded text-amber-300">
                Electrical
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Floating Stats */}
        <div className="relative z-10 flex items-center gap-8 border-t border-white/10 pt-6">
          <div>
            <p className="text-2xl font-black text-amber-400">2,500+</p>
            <p className="text-xs text-gray-400 font-medium">Verified Artisans</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div>
            <p className="text-2xl font-black text-amber-400">100%</p>
            <p className="text-xs text-gray-400 font-medium">In-App Live Video & BOQ</p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Auth Form & Self-Service Sponsor Portal (5 Columns) */}
      <div className="lg:col-span-5 bg-white text-gray-900 flex flex-col justify-between p-6 sm:p-10 overflow-y-auto">
        
        {/* Top Toggle Header */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-black text-sm">
              CA
            </div>
            <span className="font-bold text-lg">CredibleArtisans</span>
          </Link>

          <div className="text-sm font-medium ml-auto">
            {isSignUp ? 'Already registered?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-amber-600 hover:text-amber-700 font-bold underline ml-1"
            >
              {isSignUp ? 'Sign In' : 'Register Now'}
            </button>
          </div>
        </div>

        {/* Main Auth Form Container */}
        <div className="max-w-md w-full mx-auto space-y-6 my-auto">
          
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isSignUp
                ? 'Join CredibleArtisans as an Artisan or Client'
                : 'Sign in to access your portal, chats, and BOQs'}
            </p>
          </div>

          {/* Self-Service 20 GHS Sponsor Ad Banner */}
          <AdBanner />

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-medium border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            
            {/* Account Role Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  role === 'client'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                👤 I am a Client
              </button>
              <button
                type="button"
                onClick={() => setRole('artisan')}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  role === 'artisan'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                🛠️ I am an Artisan
              </button>
            </div>

            {/* Name Input (Sign Up Only) */}
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

            {/* Email Input */}
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

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

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

        {/* Bottom Footer */}
        <div className="text-center text-xs text-gray-400 mt-6 pt-4 border-t">
          © {new Date().getFullYear()} CredibleArtisans.com. All rights reserved.
        </div>
      </div>

    </div>
  );
}