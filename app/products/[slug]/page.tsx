'use client';

import React, { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/providers/cart-context';
import { useAuth } from '@/components/providers/auth-provider';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { addItem } = useCart();
  const { session } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Selected Option Values for Variation Matrix (Size / Color)
  const [selectedVarOptions, setSelectedVarOptions] = useState<Record<string, string>>({});
  const [selectedVariation, setSelectedVariation] = useState<any>(null);

  // Selected Global Form Customizations (Map of optionId -> boolean or selectedOptionId)
  const [selectedGlobalOptions, setSelectedGlobalOptions] = useState<Record<string, any>>({});

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();

        if (res.ok) {
          setProduct(data);
          setSelectedImage(
            data.images[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800'
          );

          // Initialize default product options for variation matrix
          if (data.options && data.options.length > 0) {
            const initialMap: Record<string, string> = {};
            data.options.forEach((opt: any) => {
              if (opt.values && opt.values.length > 0) {
                initialMap[opt.name] = opt.values[0].id;
              }
            });
            setSelectedVarOptions(initialMap);
          }

          // Initialize default selected global options (e.g. select first radio child)
          if (data.globalForm && data.globalForm.options) {
            const initGlobal: Record<string, any> = {};
            data.globalForm.options.forEach((parentOpt: any) => {
              if (parentOpt.inputType === 'RADIO' && parentOpt.childOptions?.length > 0) {
                initGlobal[parentOpt.id] = parentOpt.childOptions[0].id;
              }
            });
            setSelectedGlobalOptions(initGlobal);
          }
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  // Find matching ProductVariation whenever selectedVarOptions changes
  useEffect(() => {
    if (!product || product.productType !== 'VARIABLE' || !product.variations) return;

    const selectedValueIds = Object.values(selectedVarOptions);

    const matchingVar = product.variations.find((v: any) => {
      const varValueIds = v.values.map((val: any) => val.optionValueId);
      return selectedValueIds.every((id) => varValueIds.includes(id));
    });

    setSelectedVariation(matchingVar || null);
  }, [selectedVarOptions, product]);

  const handleVarOptionSelect = (optionName: string, valueId: string) => {
    setSelectedVarOptions((prev) => ({
      ...prev,
      [optionName]: valueId,
    }));
  };

  // Toggle Global Option Selection
  const handleGlobalRadioSelect = (parentId: string, selectedChildId: string) => {
    setSelectedGlobalOptions((prev) => ({
      ...prev,
      [parentId]: selectedChildId,
    }));
  };

  const handleGlobalCheckboxToggle = (optionId: string) => {
    setSelectedGlobalOptions((prev) => ({
      ...prev,
      [optionId]: !prev[optionId],
    }));
  };

  // Compute Total Calculated Price (Base/Variation + Selected Customization Add-Ons)
  const calculateTotalPrice = () => {
    if (!product) return 0;

    let base =
      product.productType === 'VARIABLE'
        ? selectedVariation
          ? Number(selectedVariation.price)
          : Number(product.basePrice)
        : Number(product.basePrice);

    if (!product.globalForm || !product.globalForm.options) return base;

    let addonsTotal = 0;

    const processOptionGroup = (parentOpt: any) => {
      if (!parentOpt.enabled) return;

      if (parentOpt.inputType === 'RADIO') {
        const selectedChildId = selectedGlobalOptions[parentOpt.id];
        if (selectedChildId && parentOpt.childOptions) {
          const selectedChild = parentOpt.childOptions.find((c: any) => c.id === selectedChildId);
          if (selectedChild && selectedChild.enabled) {
            addonsTotal += Number(selectedChild.price || 0);
          }
        }
      } else if (parentOpt.inputType === 'CHECKBOX') {
        if (parentOpt.childOptions && parentOpt.childOptions.length > 0) {
          // If parent has children, check if parent is checked
          const parentChecked = !!selectedGlobalOptions[parentOpt.id];
          if (parentChecked) {
            addonsTotal += Number(parentOpt.price || 0);
            parentOpt.childOptions.forEach((childOpt: any) => {
              if (childOpt.enabled && selectedGlobalOptions[childOpt.id]) {
                addonsTotal += Number(childOpt.price || 0);
              }
            });
          }
        } else {
          // Single standalone checkbox
          if (selectedGlobalOptions[parentOpt.id]) {
            addonsTotal += Number(parentOpt.price || 0);
          }
        }
      }
    };

    product.globalForm.options.forEach((group: any) => processOptionGroup(group));

    return base + addonsTotal;
  };

  const finalTotalPrice = calculateTotalPrice();

  // Helper to compile human readable summary of selected customizations for cart
  const compileCustomizationSummary = () => {
    const summaryParts: string[] = [];

    // Variation options
    if (selectedVariation && selectedVariation.values) {
      const varText = selectedVariation.values
        .map((v: any) => `${v.optionValue.option.name}: ${v.optionValue.value}`)
        .join(', ');
      if (varText) summaryParts.push(varText);
    }

    // Global Form Options
    if (product.globalForm && product.globalForm.options) {
      product.globalForm.options.forEach((parentOpt: any) => {
        if (parentOpt.inputType === 'RADIO') {
          const selectedChildId = selectedGlobalOptions[parentOpt.id];
          const selectedChild = parentOpt.childOptions?.find((c: any) => c.id === selectedChildId);
          if (selectedChild) {
            summaryParts.push(`${parentOpt.title}: ${selectedChild.title}`);
          }
        } else if (parentOpt.inputType === 'CHECKBOX') {
          if (parentOpt.childOptions && parentOpt.childOptions.length > 0) {
            if (selectedGlobalOptions[parentOpt.id]) {
              const checkedChildren = parentOpt.childOptions
                .filter((c: any) => selectedGlobalOptions[c.id])
                .map((c: any) => c.title);
              if (checkedChildren.length > 0) {
                summaryParts.push(`${parentOpt.title} (${checkedChildren.join(', ')})`);
              } else {
                summaryParts.push(parentOpt.title);
              }
            }
          } else if (selectedGlobalOptions[parentOpt.id]) {
            summaryParts.push(parentOpt.title);
          }
        }
      });
    }

    return summaryParts.join(' | ');
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.productType === 'VARIABLE' && !selectedVariation) {
      alert('Please select valid color and size options.');
      return;
    }

    const customizationDetails = compileCustomizationSummary();

    addItem({
      productId: product.id,
      variationId: selectedVariation?.id,
      productName: product.name,
      productSlug: product.slug,
      image: selectedImage,
      variationDetails: customizationDetails,
      unitPrice: finalTotalPrice,
      quantity: 1,
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      alert('Please sign in to submit a review.');
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating: Number(reviewRating),
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setReviewStatus('✅ Review submitted! It will appear once approved by an admin.');
        setReviewComment('');
      } else {
        setReviewStatus(`❌ ${data.error || 'Failed to submit review'}`);
      }
    } catch {
      setReviewStatus('❌ Network error submitting review.');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse py-12 space-y-6 max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-gray-200 aspect-3/4 rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-10 bg-gray-200 rounded w-1/3" />
            <div className="h-48 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24 space-y-4">
        <span className="text-5xl block">👑</span>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Bridal Creation Not Found</h1>
        <p className="text-xs text-gray-500">The requested couture design is no longer available.</p>
        <Link href="/shop" className="inline-block px-6 py-2.5 bg-[#580520] text-amber-200 font-bold text-xs rounded-full">
          Explore Bridal Catalog ➔
        </Link>
      </div>
    );
  }

  const currentStock =
    product.productType === 'VARIABLE'
      ? selectedVariation
        ? selectedVariation.stock
        : 0
      : product.stock || 0;

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 flex items-center gap-2">
        <Link href="/" className="hover:underline">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:underline">Bridal Store</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/shop?category=${product.category.slug}`} className="hover:underline text-amber-800 font-semibold">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900 font-bold truncate">{product.name}</span>
      </nav>

      {/* Main Product Display Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Gallery (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-3/4 rounded-lg overflow-hidden bg-gray-50 border border-gray-200 shadow-md">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              priority
              className="object-cover"
            />
            <span className="absolute top-3 left-3 bg-[#580520] text-amber-200 text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider">
              ✦ Value Guarantee Eligible
            </span>
          </div>

          {/* Thumbnail Gallery */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative w-20 h-24 rounded overflow-hidden border-2 shrink-0 ${
                    selectedImage === img.url ? 'border-[#580520] scale-95' : 'border-gray-200 opacity-70'
                  }`}
                >
                  <Image src={img.url} alt={img.altText || ''} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Details & Configurator (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-widest block mb-1">
              {product.brand?.name || 'Sabyasachi Heritage'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 leading-snug">
              {product.name}
            </h1>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">{product.shortDescription || product.description}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 text-xs text-amber-600 border-y border-gray-100 py-2.5">
            <span>★</span>
            <span className="font-bold text-gray-900">{product.averageRating || '5.0'}</span>
            <span className="text-gray-400">({product.totalReviews || 12} customer reviews)</span>
          </div>

          {/* Price Breakdown */}
          <div className="bg-amber-50/50 p-4 rounded-md border border-amber-200/60 space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-[#580520]">
                ${finalTotalPrice.toFixed(2)}
              </span>
              {product.originalPrice && Number(product.originalPrice) > finalTotalPrice && (
                <span className="text-base text-gray-400 line-through">
                  ${Number(product.originalPrice).toFixed(2)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-emerald-800 font-semibold">
              ✔ Includes taxes and custom duty • Ships in 7 - 10 business days
            </p>
          </div>

          {/* Product Specific Variation Options (e.g. Color Variant) */}
          {product.options && product.options.length > 0 && (
            <div className="space-y-4 pt-2">
              {product.options.map((opt: any) => (
                <div key={opt.id} className="space-y-2">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                    Select {opt.name}:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {opt.values.map((val: any) => {
                      const isSelected = selectedVarOptions[opt.name] === val.id;
                      return (
                        <button
                          key={val.id}
                          type="button"
                          onClick={() => handleVarOptionSelect(opt.name, val.id)}
                          className={`px-3 py-1.5 text-xs font-bold rounded border transition-all ${
                            isSelected
                              ? 'bg-[#580520] text-amber-200 border-[#580520] shadow-sm'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {val.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Interactive Global Customization Configurator (Form Options & Add-Ons) */}
          {product.globalForm && product.globalForm.options && (
            <div className="space-y-5 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#580520]">
                  ✂ {product.globalForm.name}
                </h3>
                <span className="text-[10px] text-amber-800 font-semibold">Custom Configurator</span>
              </div>

              {product.globalForm.options.map((optGroup: any) => (
                <div key={optGroup.id} className="bg-gray-50/80 p-4 rounded-md border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                      {optGroup.title}
                    </label>
                    {optGroup.description && (
                      <span className="text-[10px] text-gray-500">{optGroup.description}</span>
                    )}
                  </div>

                  {/* Radio Stitching Fit Option Group */}
                  {optGroup.inputType === 'RADIO' && optGroup.childOptions && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {optGroup.childOptions.map((child: any) => {
                        const isSelected = selectedGlobalOptions[optGroup.id] === child.id;
                        return (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => handleGlobalRadioSelect(optGroup.id, child.id)}
                            className={`p-3 rounded text-left border transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'bg-white border-[#580520] ring-2 ring-[#580520]/20 shadow-xs'
                                : 'bg-white/60 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span className="text-xs font-bold text-gray-900">{child.title}</span>
                            <span className="text-[11px] font-extrabold text-[#580520] mt-1">
                              {child.price > 0 ? `+$${child.price}` : 'FREE'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Checkbox Add-Ons and Nested Accessories */}
                  {optGroup.inputType === 'CHECKBOX' && optGroup.childOptions && (
                    <div className="space-y-3">
                      {/* Parent Checkbox if present */}
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-gray-900 bg-white p-2.5 rounded border border-gray-200">
                        <input
                          type="checkbox"
                          checked={!!selectedGlobalOptions[optGroup.id]}
                          onChange={() => handleGlobalCheckboxToggle(optGroup.id)}
                          className="w-4 h-4 text-[#580520] rounded border-gray-300 focus:ring-[#580520]"
                        />
                        <span>Enable {optGroup.title}</span>
                      </label>

                      {/* Display Child Options if Parent Checked */}
                      {selectedGlobalOptions[optGroup.id] && (
                        <div className="pl-4 space-y-2 border-l-2 border-[#580520] pt-1">
                          {optGroup.childOptions.map((child: any) => {
                            const isChecked = !!selectedGlobalOptions[child.id];
                            return (
                              <label
                                key={child.id}
                                className={`flex items-center justify-between p-2.5 rounded border cursor-pointer transition-colors ${
                                  isChecked ? 'bg-amber-50/60 border-amber-300' : 'bg-white border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleGlobalCheckboxToggle(child.id)}
                                    className="w-4 h-4 text-[#580520] rounded border-gray-300 focus:ring-[#580520]"
                                  />
                                  {child.imageUrl && (
                                    <div className="relative w-10 h-10 rounded overflow-hidden shrink-0 border border-gray-200">
                                      <Image src={child.imageUrl} alt={child.title} fill className="object-cover" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-xs font-bold text-gray-900">{child.title}</p>
                                    {child.description && (
                                      <p className="text-[10px] text-gray-500">{child.description}</p>
                                    )}
                                  </div>
                                </div>
                                <span className="text-xs font-bold text-[#580520] shrink-0 ml-2">
                                  +${child.price}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Stock & SKU Info */}
          <div className="text-xs space-y-1 pt-2">
            {selectedVariation?.sku && (
              <p className="text-gray-500 font-mono">
                SKU: <span className="text-gray-900 font-bold">{selectedVariation.sku}</span>
              </p>
            )}
            <p className="flex items-center gap-1 font-semibold">
              Availability:{' '}
              {currentStock > 0 ? (
                <span className="text-emerald-700">In Stock ({currentStock} available)</span>
              ) : (
                <span className="text-red-600">Made to Order</span>
              )}
            </p>
          </div>

          {/* Add to Bag CTA Button */}
          <button
            onClick={handleAddToCart}
            className="w-full py-4 bg-[#580520] hover:bg-[#7b113a] text-amber-200 font-serif font-bold text-sm tracking-wider uppercase rounded-md shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span>ADD TO BAG</span>
            <span>•</span>
            <span>${finalTotalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>

      {/* Product Specification & Description */}
      <div className="pt-10 border-t border-gray-200 space-y-8">
        <div>
          <h2 className="text-xl font-serif font-bold text-gray-900 mb-3">Ensemble Specifications</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Customer Reviews Section */}
        <div className="space-y-6 pt-6 border-t border-gray-100">
          <h2 className="text-xl font-serif font-bold text-gray-900">Verified Client Reviews ({product.reviews?.length || 0})</h2>

          <div className="space-y-4">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev: any) => (
                <div key={rev.id} className="bg-white p-4 rounded border border-gray-200 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-900">{rev.user?.name || 'Verified Client'}</span>
                    <span className="text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-amber-500 text-xs">{'★'.repeat(rev.rating)}</div>
                  <p className="text-xs text-gray-700 mt-1">{rev.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No client reviews yet. Be the first to share your experience!</p>
            )}
          </div>

          {/* Submit Review Form */}
          <div className="bg-amber-50/40 p-6 rounded-lg border border-amber-200 space-y-4 max-w-lg">
            <h3 className="font-serif font-bold text-sm text-gray-900">Leave a Client Review</h3>
            {session ? (
              <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Rating (1 to 5 Stars):</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="px-3 py-1.5 border border-gray-300 rounded bg-white font-semibold"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                    <option value={3}>⭐⭐⭐ (3 - Satisfactory)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Your Feedback:</label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your thoughts on the craftsmanship, fit, & embroidery..."
                    className="w-full p-2.5 border border-gray-300 rounded bg-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#580520] text-amber-200 font-bold rounded"
                >
                  Submit Review
                </button>
                {reviewStatus && <p className="text-xs font-semibold mt-2">{reviewStatus}</p>}
              </form>
            ) : (
              <p className="text-xs text-gray-600">
                Please <Link href="/login" className="text-[#580520] font-bold underline">Sign In</Link> to submit a review.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
