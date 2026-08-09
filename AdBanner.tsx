// AdBanner.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Advertisement } from '@/types/advertisement';
import { CreateAdModal } from '@/components/ads/CreateAdModal';
import { DeleteAdModal } from '@/components/ads/DeleteAdModal';

export const AdBanner: React.FC = () => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch active sponsor advertisements
  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAds(data as Advertisement[]);
      }
    } catch (err) {
      console.error('Failed to fetch sponsor ads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // Auto-rotate advertisement banner every 5 seconds
  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [ads.length]);

  const currentAd = ads[currentIndex];

  return (
    <div className="w-full my-4">
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-5 text-white shadow-xl">
        
        {/* Top Header Badge & Action Button */}
        <div className="flex justify-between items-center mb-3">
          <span className="bg-black/30 backdrop-blur-md text-amber-200 border border-amber-300/30 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full">
            ⭐ SPONSORED ARTISAN SHOP
          </span>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-white text-gray-900 hover:bg-amber-100 font-bold text-xs px-3 py-1.5 rounded-lg shadow transition"
          >
            📢 Feature Your Shop (GH₵ 20)
          </button>
        </div>

        {/* Dynamic Live Ad Content */}
        {loading ? (
          <div className="py-6 text-center text-xs opacity-80">Loading sponsor showcase...</div>
        ) : ads.length > 0 && currentAd ? (
          <div className="flex flex-col md:flex-row items-center gap-4">
            <img
              src={currentAd.image_url}
              alt={currentAd.shop_name}
              className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl border-2 border-white/50 shadow-md flex-shrink-0"
            />
            <div className="flex-1 text-center md:text-left space-y-1">
              <span className="bg-white/20 text-xs px-2 py-0.5 rounded font-medium">
                {currentAd.category}
              </span>
              <h4 className="text-lg font-extrabold leading-tight">{currentAd.shop_name}</h4>
              <p className="text-xs text-amber-100 line-clamp-2">{currentAd.headline}</p>
              
              <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
                <a
                  href={`https://wa.me/${currentAd.contact_phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-bold text-xs px-3 py-1.5 rounded-md shadow"
                >
                  💬 WhatsApp Shop
                </a>

                {/* DIRECT DELETE BUTTON FOR ADVERTISERS */}
                <button
                  onClick={() => setAdToDelete(currentAd)}
                  className="text-xs bg-black/20 hover:bg-black/40 text-red-200 hover:text-red-100 font-semibold px-2.5 py-1.5 rounded-md border border-white/20 transition"
                  title="Remove this advertisement"
                >
                  🗑️ Delete Ad
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Fallback when no paid ads exist yet */
          <div className="text-center py-4 space-y-2">
            <h4 className="text-base font-bold">Be the First Sponsored Artisan Shop Here!</h4>
            <p className="text-xs text-amber-100 max-w-md mx-auto">
              Get thousands of direct client calls & WhatsApp orders by featuring your business on our sign-in page for 20 GHS.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-2 bg-white text-gray-900 hover:bg-amber-100 font-bold text-xs px-4 py-2 rounded-lg shadow"
            >
              🚀 Promote My Business Now (GH₵ 20)
            </button>
          </div>
        )}

        {/* Dots indicator for carousel */}
        {ads.length > 1 && (
          <div className="flex justify-center space-x-1.5 mt-3">
            {ads.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 1. Self-Service Creation Modal */}
      <CreateAdModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchAds}
      />

      {/* 2. Deletion Modal */}
      {adToDelete && (
        <DeleteAdModal
          ad={adToDelete}
          isOpen={!!adToDelete}
          onClose={() => setAdToDelete(null)}
          onSuccess={fetchAds}
        />
      )}
    </div>
  );
};

export default AdBanner;