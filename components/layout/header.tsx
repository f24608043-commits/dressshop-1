'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/components/providers/cart-context';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { itemCount, setIsCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { name: 'READY TO SHIP', href: '/shop?sort=newest' },
    { name: 'WEDDING COUTURE', href: '/shop?category=bridal-lehengas' },
    { name: 'LEHENGA', href: '/shop?category=bridal-lehengas' },
    { name: 'SALWAR KAMEEZ', href: '/shop?category=salwar-kameez' },
    { name: 'SAREES', href: '/shop?category=sarees-and-drapes' },
    { name: 'JEWELLERY', href: '/shop?category=bridal-jewellery' },
    { name: 'BLOG', href: '/blog' },
    { name: 'CONTACT', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs">
      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-serif font-bold tracking-widest text-[#580520] uppercase">
              CBAZAAR<span className="text-amber-600 font-sans text-xs tracking-normal block text-right font-normal">BRIDAL COUTURE</span>
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for Bridal Lehengas, Kundan Jewellery, Sarees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-full text-xs focus:outline-none focus:border-[#580520] focus:ring-1 focus:ring-[#580520]"
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#580520]"
              >
                🔍
              </button>
            </div>
          </form>

          {/* User Account & Cart Buttons */}
          <div className="flex items-center gap-6">
            {session?.user ? (
              <div className="relative group">
                <Link
                  href={session.user.role === 'ADMIN' ? '/admin' : '/account'}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 hover:text-[#580520]"
                >
                  <span className="w-8 h-8 rounded-full bg-amber-50 text-[#580520] flex items-center justify-center text-xs font-bold border border-amber-200">
                    {session.user.name?.charAt(0) || 'U'}
                  </span>
                  <span className="hidden sm:inline">{session.user.name?.split(' ')[0]}</span>
                  {session.user.role === 'ADMIN' && (
                    <span className="bg-[#580520] text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide">
                      ADMIN
                    </span>
                  )}
                </Link>

                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 text-xs z-50">
                  {session.user.role === 'ADMIN' && (
                    <Link href="/admin" className="block px-3 py-2 text-gray-800 hover:bg-amber-50 rounded font-semibold">
                      👑 Admin Control Panel
                    </Link>
                  )}
                  <Link href="/account" className="block px-3 py-2 text-gray-800 hover:bg-amber-50 rounded font-medium">
                    📦 My Orders & Account
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded mt-1 font-medium"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-semibold text-gray-800 hover:text-[#580520] flex items-center gap-1"
              >
                👤 <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1.5 p-2 text-gray-800 hover:text-[#580520] transition-colors"
              aria-label="Shopping Cart"
            >
              <span className="text-xl">🛍</span>
              <span className="text-xs font-bold hidden sm:inline">Bag</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#580520] text-amber-200 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-800 hover:text-[#580520]"
              aria-label="Toggle menu"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Category Bar */}
      <div className="hidden lg:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center justify-center space-x-8 text-xs font-bold tracking-wider py-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`transition-colors hover:text-[#580520] ${
                  pathname === link.href ? 'text-[#580520] border-b-2 border-[#580520] pb-1' : 'text-gray-800'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="mt-2">
            <input
              type="text"
              placeholder="Search lehengas, jewellery, sarees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-xs"
            />
          </form>
          <div className="flex flex-col space-y-2 font-bold text-xs pt-2 tracking-wide">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-gray-800 hover:text-[#580520] border-b border-gray-50"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
