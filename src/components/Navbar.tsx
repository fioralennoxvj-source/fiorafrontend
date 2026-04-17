'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { useCart } from "@/context/CartContext";
import { useTheme } from 'next-themes';

interface NavbarProps {
  logoBlack?: string | null;
  logoWhite?: string | null;
}

export function Navbar({ logoBlack, logoWhite }: NavbarProps) {
  const { totalItems, setIsDrawerOpen } = useCart();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentTheme = resolvedTheme || theme;
  const activeLogo = currentTheme === 'dark' ? logoWhite : logoBlack;

  const navLinks = [
    { name: 'Engagement Rings', href: '/category/rings' },
    { name: 'Bracelets', href: '/category/bracelet' },
    { name: 'Earrings', href: '/category/ear-ring' },
    { name: 'Necklace & Pendants', href: '/category/necklace-and-pendants' }
  ];

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-700 ${isScrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border/40 py-4' : 'bg-transparent py-2'}`}>
      <div className="max-w-[1800px] mx-auto px-8 md:px-12 flex items-center justify-between">

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-foreground hover:opacity-70 transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
          <div className="flex items-center">
            {mounted && activeLogo ? (
              <img
                src={activeLogo}
                alt="Fiora Lennox"
                className={`transition-all duration-700 object-contain ${!isScrolled ? 'h-18 md:h-20' : 'h-16 md:h-18'}`}
              />
            ) : (
              <h1 className={`font-heading text-2xl font-light tracking-[0.3em] uppercase transition-all duration-700 ${!isScrolled ? 'md:text-3xl' : 'text-2xl'}`}>
                Fiora Lennox
              </h1>
            )}
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="group relative text-[10px] uppercase tracking-[0.3em] font-light text-foreground/70 hover:text-foreground transition-all duration-500"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-foreground transition-all duration-500 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-6">
          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle />
          </div>
          <Button variant="ghost" size="icon" className="hover:bg-transparent hover:opacity-50 transition-all duration-300">
            <Search size={18} strokeWidth={1.5} />
          </Button>
          <Button variant="outline" className="hidden lg:flex border-border/40 rounded-none uppercase text-[9px] tracking-[0.2em] font-light hover:bg-foreground hover:text-background transition-all duration-700 px-6">
            Inquiry
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative group"
            onClick={() => setIsDrawerOpen(true)}
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-foreground text-background text-[8px] flex items-center justify-center rounded-full font-bold animate-in zoom-in duration-300">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 top-[73px] bg-background z-[90] md:hidden transition-all duration-700 ease-in-out ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col items-center justify-center h-full gap-12 p-12">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg uppercase tracking-[0.4em] font-light text-foreground hover:opacity-50 transition"
            >
              {link.name}
            </Link>
          ))}
          <div className="flex gap-8 mt-12">
            <ThemeToggle />
            <Button variant="outline" className="border-border rounded-none uppercase text-xs tracking-widest px-8 py-6">Account</Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
