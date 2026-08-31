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
    e.stopPropagation();
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

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    window.location.href = '/checkout';
  };

  return (
    <Link href={`/products/${slug}`} className="group bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative block">
      
      {/* Product Image Gallery Preview */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        <Image
          src={mainImage}
          alt={name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-0.5 z-10">
          <span className="bg-[#580520] text-amber-200 text-[8px] font-bold px-1.5 py-0.5 rounded-xs tracking-wider uppercase shadow-xs">
            ⚡ Ready To Ship
          </span>
          <span className="bg-amber-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-xs tracking-wider uppercase shadow-xs">
            Value Guarantee
          </span>
        </div>

        {/* Discount Badge */}
        {discountPercent && (
          <span className="absolute top-1.5 right-1.5 bg-pink-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-xs">
            {discountPercent}% OFF
          </span>
        )}

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          aria-label="Add to Wishlist"
          className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-gray-700 hover:text-red-500 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110 text-xs"
        >
          ♡
        </button>
      </div>

      {/* Card Body */}
      <div className="p-2.5 flex flex-col flex-1">
        {/* Brand/Designer */}
        <div className="text-[8px] uppercase font-bold text-amber-800 tracking-widest mb-0.5">
          {brand?.name || 'Sabyasachi Heritage'}
        </div>

        {/* Product Title */}
        <h3 className="font-serif text-xs font-semibold text-gray-900 line-clamp-2 mb-1 leading-snug">
          {name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-0.5 text-[9px] text-amber-500 mb-1">
          <span>★</span>
          <span className="font-bold text-gray-800">{averageRating > 0 ? averageRating : '5.0'}</span>
          <span className="text-gray-400 text-[8px]">({totalReviews || 8})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-sm font-extrabold text-[#580520]">
            Rs. {Number(basePrice).toLocaleString()}
          </span>
          {originalPrice && originalPrice > basePrice && (
            <span className="text-[10px] text-gray-400 line-through">
              Rs. {Number(originalPrice).toLocaleString()}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto pt-2 border-t border-gray-100 grid grid-cols-2 gap-1.5">
          <button
            onClick={handleQuickAdd}
            className="px-2 py-1.5 bg-[#580520] hover:bg-[#7b113a] text-white text-[10px] font-bold rounded transition-colors"
          >
            Add
          </button>
          <button
            onClick={handleBuyNow}
            className="px-2 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded transition-colors"
          >
            Buy
          </button>
        </div>
      </div>
    </Link>
  );
}
