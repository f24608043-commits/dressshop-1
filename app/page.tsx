import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/product/product-card';

export const revalidate = 60; // SSR with 60s revalidation

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true },
      include: {
        images: { orderBy: { order: 'asc' } },
        category: true,
        brand: true,
        reviews: { where: { approved: true }, select: { rating: true } },
      },
      take: 6,
    }),
    prisma.category.findMany({
      where: { parentCategoryId: null },
      take: 6,
    }),
  ]);

  const occasions = [
    { title: 'Wedding Reception', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800', slug: 'bridal-lehengas' },
    { title: 'Engagement Drapes', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800', slug: 'sarees-and-drapes' },
    { title: 'Haldi Yellow Couture', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800', slug: 'salwar-kameez' },
    { title: 'Sangeet & Mehendi', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800', slug: 'bridal-jewellery' },
  ];

  return (
    <div className="space-y-16 py-4">
      {/* Cbazaar Hero Banner Slider */}
      <section className="relative rounded-xl overflow-hidden bg-neutral-950 text-white min-h-[480px] flex items-center shadow-xl">
        <div className="absolute inset-0 z-0 opacity-55">
          <Image
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1600"
            alt="Bridal Couture Banner"
            fill
            priority
            className="object-cover object-top"
          />
        </div>

        <div className="relative z-10 max-w-3xl px-8 sm:px-16 py-12 space-y-6">
          <span className="bg-amber-400/20 text-amber-300 text-xs font-bold px-3.5 py-1 rounded-full border border-amber-400/40 uppercase tracking-widest inline-block">
            ✦ Heritage Bridal Collection 2026
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-wide leading-tight">
            Less Ordinary, <br />
            <span className="text-amber-300 italic">More Artfully Yours.</span>
          </h1>
          <p className="text-gray-200 text-sm sm:text-base leading-relaxed max-w-xl font-light">
            Handcrafted Zardozi Lehengas, Real Kundan Jewellery, & Custom Made-to-Measure Ethnic Ensembles tailored by master couturiers.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/shop?category=bridal-lehengas"
              className="px-8 py-3.5 bg-[#580520] hover:bg-[#7b113a] text-amber-200 font-bold text-xs uppercase tracking-wider rounded-sm shadow-xl transition-transform hover:scale-105"
            >
              Explore Wedding Lehengas ➔
            </Link>
            <Link
              href="/shop?category=bridal-jewellery"
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-sm backdrop-blur-xs transition-colors border border-white/30"
            >
              Royal Kundan Jewels
            </Link>
          </div>
        </div>
      </section>

      {/* Shop By Category Section */}
      <section className="space-y-6">
        <div className="text-center space-y-2 border-b border-gray-200 pb-4">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-wide">
            EXPLORE BY CATEGORY
          </h2>
          <p className="text-xs text-amber-900 uppercase tracking-widest font-semibold">
            Fine Ethnic Craftsmanship & Bridal Excellence
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative h-80 rounded-lg overflow-hidden shadow-sm block bg-neutral-900"
            >
              <Image
                src={cat.heroBannerImageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800'}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                <h3 className="text-xl font-serif font-bold text-white group-hover:text-amber-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-300 line-clamp-1 mt-1 font-light">{cat.description}</p>
                <span className="text-[11px] font-bold text-amber-300 mt-3 inline-flex items-center gap-1 uppercase tracking-wider">
                  Shop Collection ➔
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Shop By Wedding Occasion Grid (Cbazaar Style) */}
      <section className="space-y-6">
        <div className="text-center space-y-2 border-b border-gray-200 pb-4">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-wide">
            WEDDING OCCASION LOOKS
          </h2>
          <p className="text-xs text-amber-900 uppercase tracking-widest font-semibold">
            Curated Outfits For Every Festive Celebration
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {occasions.map((occ, idx) => (
            <Link
              key={idx}
              href={`/shop?category=${occ.slug}`}
              className="group relative h-64 rounded-sm overflow-hidden block bg-neutral-900"
            >
              <Image
                src={occ.image}
                alt={occ.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center p-4">
                <span className="text-white font-serif font-bold text-lg sm:text-xl text-center border-b border-amber-300 pb-1 group-hover:text-amber-300 transition-colors">
                  {occ.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900">FEATURED BRIDAL CREATIONS</h2>
            <p className="text-xs text-gray-500 mt-1">Top-rated handcrafted designs selected by our master stylists</p>
          </div>
          <Link href="/shop" className="text-xs font-bold text-[#580520] hover:underline uppercase tracking-wider">
            View All Products ➔
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              id={prod.id}
              name={prod.name}
              slug={prod.slug}
              basePrice={Number(prod.basePrice)}
              originalPrice={prod.originalPrice ? Number(prod.originalPrice) : null}
              productType={prod.productType}
              images={prod.images}
              category={prod.category}
              brand={prod.brand}
              averageRating={
                prod.reviews.length > 0
                  ? Math.round((prod.reviews.reduce((acc, r) => acc + r.rating, 0) / prod.reviews.length) * 10) / 10
                  : 5.0
              }
              totalReviews={prod.reviews.length || 15}
            />
          ))}
        </div>
      </section>

      {/* Value Guarantee & Coupon Banner */}
      <section className="bg-[#580520] text-white rounded-md p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-amber-900/50">
        <div className="space-y-2 text-center sm:text-left">
          <span className="bg-amber-400 text-black text-[10px] font-bold px-3 py-1 rounded-xs uppercase tracking-widest">
            ✦ Value Guarantee Promotion
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-amber-200">
            Enjoy 10% Off Orders Over $50
          </h2>
          <p className="text-amber-100 text-xs sm:text-sm">
            Use code <span className="font-mono font-bold bg-white text-[#580520] px-2 py-0.5 rounded">BRIDAL10</span> at checkout for instant savings!
          </p>
        </div>
        <Link
          href="/shop"
          className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider rounded-xs shrink-0 shadow-lg"
        >
          Claim Savings Now
        </Link>
      </section>
    </div>
  );
}
