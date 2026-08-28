'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('✅ Welcome to Cbazaar Bridal Club!');
        setEmail('');
      } else {
        setStatus(`❌ ${data.error || 'Failed to subscribe'}`);
      }
    } catch {
      setStatus('❌ Network error. Please try again.');
    }
  };

  return (
    <footer className="bg-[#1a1819] text-gray-300 text-xs mt-16 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Mission */}
          <div className="space-y-3">
            <Link href="/" className="text-2xl font-serif font-bold text-white tracking-widest block uppercase">
              CBAZAAR <span className="text-amber-400 font-sans text-xs tracking-normal block font-normal text-left">BRIDAL COUTURE</span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              World class South Asian ethnic fashion, bridal lehengas, silk sarees, and real Kundan jewellery. Worldwide delivery with custom Made-To-Measure tailoring.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-serif font-bold text-sm mb-3 tracking-wider uppercase border-b border-amber-900/50 pb-1">
              Bridal Collections
            </h3>
            <ul className="space-y-2 text-xs font-light">
              <li><Link href="/shop?category=bridal-lehengas" className="hover:text-amber-400">Bridal Lehengas</Link></li>
              <li><Link href="/shop?category=sarees-and-drapes" className="hover:text-amber-400">Sarees & Drapes</Link></li>
              <li><Link href="/shop?category=salwar-kameez" className="hover:text-amber-400">Salwar Kameez & Anarkalis</Link></li>
              <li><Link href="/shop?category=bridal-jewellery" className="hover:text-amber-400">Kundan Jewellery</Link></li>
              <li><Link href="/shop" className="hover:text-amber-400">Ready To Ship Items</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-white font-serif font-bold text-sm mb-3 tracking-wider uppercase border-b border-amber-900/50 pb-1">
              Client Support
            </h3>
            <ul className="space-y-2 text-xs font-light">
              <li><Link href="/contact" className="hover:text-amber-400">Contact Couture Stylists</Link></li>
              <li><Link href="/blog" className="hover:text-amber-400">Style Guides & Trends</Link></li>
              <li><Link href="/account/orders" className="hover:text-amber-400">Track Order Status</Link></li>
              <li><Link href="/admin" className="hover:text-amber-400 font-bold text-amber-400">👑 Admin Control Panel</Link></li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-3">
            <h3 className="text-white font-serif font-bold text-sm tracking-wider uppercase border-b border-amber-900/50 pb-1">
              Don&apos;t Miss Out
            </h3>
            <p className="text-xs text-gray-400">Subscribe for early access to bridal trunk shows, luxury coupons, & new arrivals.</p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
              <button
                type="submit"
                className="w-full py-2 bg-[#580520] hover:bg-[#7b113a] text-amber-200 font-bold text-xs uppercase tracking-wider rounded transition-colors"
              >
                Subscribe
              </button>
            </form>
            {status && <p className="text-xs font-medium mt-1 text-amber-300">{status}</p>}
          </div>

        </div>

        {/* Security & Copyright Bar */}
        <div className="border-t border-neutral-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            © {new Date().getFullYear()} Cbazaar Bridal Couture. All Rights Reserved. Built with Next.js App Router & PostgreSQL.
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>🔒 SECURE SHOPPING</span>
            <span>|</span>
            <span>💳 VISA • MASTERCARD • PAYPAL • AMEX</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
