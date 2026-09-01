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
              <div className="relative z-10 max-w-xl px-8 sm:px-12 lg:px-16 py-8 space-y-6 w-full text-left" style={{ marginLeft: '8%' }}>
                <span className="inline-block bg-amber-400/20 text-amber-300 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-400/40 uppercase tracking-widest">
                  ✦ Heritage Bridal Collection 2026
                </span>
                <h1 className="text-5xl sm:text-6xl lg:text-8xl font-serif font-bold tracking-wide leading-tight text-white">
                  Golden Lehnga House
                </h1>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link
                    href="/shop"
                    className="px-10 py-4 bg-[#580520] hover:bg-[#7b113a] text-amber-200 font-bold text-sm uppercase tracking-wider rounded-sm shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  >
                    Shop Now ➔
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
