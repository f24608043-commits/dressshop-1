'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/providers/cart-context';

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  originalPrice?: number | null;
  productType: 'SIMPLE' | 'VARIABLE';
  images: { url: string; altText?: string | null }[];
  category?: { name: string; slug: string } | null;
  brand?: { name: string } | null;
  averageRating?: number;
  totalReviews?: number;
}

export function ProductCard({
  id,
  name,
  slug,
  basePrice,
  originalPrice,
  productType,
  images,
  category,
  brand,
  averageRating = 5,
  totalReviews = 0,
}: ProductCardProps) {
  const { addItem } = useCart();

  const mainImage = images[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800';

  const discountPercent =
    originalPrice && originalPrice > basePrice
      ? Math.round(((originalPrice - basePrice) / originalPrice) * 100)
      : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (productType === 'VARIABLE') {
      window.location.href = `/products/${slug}`;
      return;
    }

    addItem({
      productId: id,
      productName: name,
      productSlug: slug,
      image: mainImage,
      unitPrice: Number(basePrice),
      quantity: 1,
    });
  };

  return (
    <div className="group bg-white border border-gray-100 rounded-md overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col h-full relative">
      
      {/* Product Image Gallery Preview */}
      <Link href={`/products/${slug}`} className="relative aspect-3/4 overflow-hidden bg-gray-50 block">
        <Image
          src={mainImage}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges (Cbazaar style) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          <span className="bg-[#580520] text-amber-200 text-[9px] font-bold px-2 py-0.5 rounded-xs tracking-wider uppercase shadow-xs">
            ⚡ Ready To Ship
          </span>
          <span className="bg-amber-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-xs tracking-wider uppercase shadow-xs">
            Value Guarantee Eligible
          </span>
        </div>

        {/* Discount Badge */}
        {discountPercent && (
          <span className="absolute top-2 right-2 bg-pink-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-xs">
            {discountPercent}% OFF
          </span>
        )}

        {/* Wishlist Heart Button */}
        <button
          type="button"
          aria-label="Add to Wishlist"
          className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-gray-700 hover:text-red-500 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110"
        >
          ♡
        </button>
      </Link>

      {/* Card Body */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {/* Brand/Designer */}
        <div className="text-[10px] uppercase font-bold text-amber-800 tracking-widest mb-1">
          {brand?.name || 'Sabyasachi Heritage'}
        </div>

        {/* Product Title */}
        <Link
          href={`/products/${slug}`}
          className="font-serif text-xs sm:text-sm font-semibold text-gray-900 hover:text-[#580520] line-clamp-2 mb-2 leading-snug"
        >
          {name}
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 text-[11px] text-amber-500 mb-2">
          <span>★</span>
          <span className="font-bold text-gray-800">{averageRating > 0 ? averageRating : '5.0'}</span>
          <span className="text-gray-400 text-[10px]">({totalReviews || 8})</span>
        </div>

        {/* Price & Action */}
        <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-extrabold text-[#580520]">
                ${Number(basePrice).toFixed(0)}
              </span>
              {originalPrice && originalPrice > basePrice && (
                <span className="text-xs text-gray-400 line-through">
                  ${Number(originalPrice).toFixed(0)}
                </span>
              )}
            </div>
            <span className="text-[9px] text-emerald-700 font-semibold block">
              Free Express Custom Tailoring Available
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            className="px-3 py-1.5 bg-[#580520] hover:bg-[#7b113a] text-white text-xs font-bold rounded-xs transition-colors flex items-center gap-1"
          >
            {productType === 'VARIABLE' ? 'Customise ✂' : 'Add To Bag 🛍'}
          </button>
        </div>
      </div>
    </div>
  );
}
