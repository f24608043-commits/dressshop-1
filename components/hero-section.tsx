'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ScrollAnimation } from './hero-scroll-animation';

export function HeroSection() {
  const scrollSectionRef = useRef<HTMLDivElement | null>(null);

  return (
    <section 
      ref={scrollSectionRef}
      className="relative w-full -mt-0"
      style={{ height: '300vh' }}
    >
      <div className="sticky top-0 h-screen">
        <div className="relative w-full h-full bg-gradient-to-br from-[#1a0a0a] via-[#2d1515] to-[#1a0a0a] text-white">
          <ScrollAnimation 
            className="w-full h-full"
            scrollSectionRef={scrollSectionRef}
          >
            {/* Hero Content Overlay - Positioned to use negative space on left */}
            <div className="absolute inset-0 z-10 flex items-center">
              <div className="relative z-10 max-w-xl px-8 sm:px-12 lg:px-16 py-8 space-y-5 w-full text-left" style={{ marginLeft: '8%' }}>
                <span className="inline-block bg-amber-400/20 text-amber-300 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-400/40 uppercase tracking-widest">
                  ✦ Heritage Bridal Collection 2026
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold tracking-wide leading-tight">
                  Less Ordinary, <br />
                  <span className="text-amber-300 italic">More Artfully Yours.</span>
                </h1>
                <p className="text-gray-200 text-sm sm:text-base lg:text-lg leading-relaxed max-w-lg font-light">
                  Handcrafted Zardozi Lehengas, Real Kundan Jewellery, & Custom Made-to-Measure Ethnic Ensembles.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link
                    href="/shop?category=bridal-lehengas"
                    className="px-8 py-3 bg-[#580520] hover:bg-[#7b113a] text-amber-200 font-bold text-xs uppercase tracking-wider rounded-sm shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  >
                    Explore Lehengas ➔
                  </Link>
                  <Link
                    href="/shop?category=bridal-jewellery"
                    className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-sm transition-all duration-300 border border-white/30 hover:border-amber-400/50"
                  >
                    Kundan Jewels
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Subtle gradient overlay for text readability - left side darker */}
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/60 via-black/20 via-transparent to-transparent pointer-events-none" />
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
