import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/product/product-card';
import { HeroSection } from '@/components/hero-section';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();
  const [featuredProducts, categories, allProducts] = await Promise.all([
    supabase
      .from('products')
      .select('*, images:product_images(*), category:categories(*), brand:brands(*), reviews:reviews(rating)')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('categories')
      .select('*')
      .is('parent_category_id', null)
      .limit(6),
    supabase
      .from('products')
      .select('*, images:product_images(*), category:categories(*), brand:brands(*), reviews:reviews(rating)')
      .order('created_at', { ascending: false }),
  ]);

  const categoriesData = categories?.data || [];
  const featuredProductsData = featuredProducts?.data || [];
  const allProductsData = allProducts?.data || [];

  const occasions = [
    { title: 'Wedding Reception', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800', slug: 'bridal-lehengas' },
    { title: 'Engagement Drapes', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800', slug: 'sarees-and-drapes' },
    { title: 'Haldi Yellow Couture', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800', slug: 'salwar-kameez' },
    { title: 'Sangeet & Mehendi', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800', slug: 'bridal-jewellery' },
  ];

  return (
    <div className="space-y-0">
      {/* Scroll-Driven Hero Animation Section */}
      <HeroSection />

      {/* Content Container - applies to all sections below hero */}
      <div className="space-y-8">
        {/* Shop By Category Section */}
        <section className="space-y-4">
          <div className="text-center space-y-1 border-b border-gray-200 pb-3">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 tracking-wide">
            EXPLORE BY CATEGORY
          </h2>
          <p className="text-[10px] text-amber-900 uppercase tracking-widest font-semibold">
            Fine Ethnic Craftsmanship & Bridal Excellence
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categoriesData.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative h-48 rounded-lg overflow-hidden shadow-sm block bg-neutral-900"
            >
              <Image
                src={cat.hero_banner_image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800'}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end">
                <h3 className="text-sm font-serif font-bold text-white group-hover:text-amber-300 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[9px] font-bold text-amber-300 mt-1 uppercase tracking-wider">
                  Shop ➔
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Shop By Wedding Occasion Grid */}
      <section className="space-y-4">
        <div className="text-center space-y-1 border-b border-gray-200 pb-3">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 tracking-wide">
            WEDDING OCCASION LOOKS
          </h2>
          <p className="text-[10px] text-amber-900 uppercase tracking-widest font-semibold">
            Curated Outfits For Every Festive Celebration
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {occasions.map((occ, idx) => (
            <Link
              key={idx}
              href={`/shop?category=${occ.slug}`}
              className="group relative h-40 rounded-sm overflow-hidden block bg-neutral-900"
            >
              <Image
                src={occ.image}
                alt={occ.title}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center p-2">
                <span className="text-white font-serif font-bold text-xs sm:text-sm text-center border-b border-amber-300 pb-0.5 group-hover:text-amber-300 transition-colors">
                  {occ.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-4">
        <div className="flex items-end justify-between border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-xl font-serif font-bold text-gray-900">FEATURED BRIDAL CREATIONS</h2>
            <p className="text-[10px] text-gray-500 mt-0.5">Top-rated handcrafted designs selected by our master stylists</p>
          </div>
          <Link href="/shop" className="text-[10px] font-bold text-[#580520] hover:underline uppercase tracking-wider">
            View All ➔
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {featuredProductsData.map((prod: any) => (
            <ProductCard
              key={prod.id}
              id={prod.id}
              name={prod.name}
              slug={prod.slug}
              basePrice={Number(prod.base_price)}
              originalPrice={prod.original_price ? Number(prod.original_price) : null}
              productType={prod.product_type}
              images={prod.images}
              category={prod.category}
              brand={prod.brand}
              averageRating={
                prod.reviews && prod.reviews.length > 0
                  ? Math.round((prod.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / prod.reviews.length) * 10) / 10
                  : 5.0
              }
              totalReviews={prod.reviews?.length || 15}
            />
          ))}
        </div>
      </section>

      {/* All Products */}
      <section className="space-y-4">
        <div className="flex items-end justify-between border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-xl font-serif font-bold text-gray-900">ALL PRODUCTS</h2>
            <p className="text-[10px] text-gray-500 mt-0.5">Browse our complete collection of bridal couture and ethnic wear</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {allProductsData.map((prod: any) => (
            <ProductCard
              key={prod.id}
              id={prod.id}
              name={prod.name}
              slug={prod.slug}
              basePrice={Number(prod.base_price)}
              originalPrice={prod.original_price ? Number(prod.original_price) : null}
              productType={prod.product_type}
              images={prod.images}
              category={prod.category}
              brand={prod.brand}
              averageRating={
                prod.reviews && prod.reviews.length > 0
                  ? Math.round((prod.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / prod.reviews.length) * 10) / 10
                  : 5.0
              }
              totalReviews={prod.reviews?.length || 15}
            />
          ))}
        </div>
      </section>

      {/* Blog Section */}
      <section className="space-y-4">
        <div className="text-center space-y-1 border-b border-gray-200 pb-3">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 tracking-wide">
            LATEST FROM OUR BLOG
          </h2>
          <p className="text-[10px] text-amber-900 uppercase tracking-widest font-semibold">
            Bridal Tips, Trends & Inspiration
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/blog/choosing-the-perfect-bed" className="group relative h-48 rounded-lg overflow-hidden shadow-sm block bg-neutral-900">
            <Image
              src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800"
              alt="Blog Post"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
              <h3 className="text-sm font-serif font-bold text-white group-hover:text-amber-300 transition-colors">
                Choosing the Perfect Bridal Lehenga
              </h3>
              <p className="text-[10px] text-gray-300 line-clamp-2 mt-1 font-light">
                Discover essential guidelines on selecting the perfect bridal lehenga.
              </p>
              <span className="text-[9px] font-bold text-amber-300 mt-2 uppercase tracking-wider">
                Read More ➔
              </span>
            </div>
          </Link>
          <Link href="/blog/orthopedic-vs-memory-foam-mattress" className="group relative h-48 rounded-lg overflow-hidden shadow-sm block bg-neutral-900">
            <Image
              src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=800"
              alt="Blog Post"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
              <h3 className="text-sm font-serif font-bold text-white group-hover:text-amber-300 transition-colors">
                Traditional vs Modern Bridal Wear
              </h3>
              <p className="text-[10px] text-gray-300 line-clamp-2 mt-1 font-light">
                Understand the key differences between traditional ethnic wear and modern bridal fashion.
              </p>
              <span className="text-[9px] font-bold text-amber-300 mt-2 uppercase tracking-wider">
                Read More ➔
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Value Guarantee & Coupon Banner */}
      <section className="bg-[#580520] text-white rounded-md p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-amber-900/50">
        <div className="space-y-1 text-center sm:text-left">
          <span className="bg-amber-400 text-black text-[9px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-widest">
            ✦ Value Guarantee Promotion
          </span>
          <h2 className="text-lg sm:text-2xl font-serif font-bold text-amber-200">
            Enjoy 10% Off Orders Over $50
          </h2>
          <p className="text-amber-100 text-[10px] sm:text-xs">
            Use code <span className="font-mono font-bold bg-white text-[#580520] px-1.5 py-0.5 rounded text-[10px]">BRIDAL10</span> at checkout!
          </p>
        </div>
        <Link
          href="/shop"
          className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-[10px] uppercase tracking-wider rounded-xs shrink-0 shadow-lg"
        >
          Claim Savings Now
        </Link>
      </section>
      </div>
    </div>
  );
}
