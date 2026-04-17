'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: {
    id: string | number;
    name: string;
    basePrice: number;
    slug: string;
    videoUrl?: string | null;
    imageUrl?: string | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    if (isHovered) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play was prevented, handles silent failure
        });
      }
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered]);

  return (
    <div className="relative group flex flex-col gap-4">
      <div
        className="relative aspect-[4/5] bg-muted/20 dark:bg-zinc-950/40 overflow-hidden transition-all duration-700 hover:shadow-2xl hover:shadow-white/5 border border-border/10 group-hover:border-border/40"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >

        <Link href={`/products/${product.slug}`} className="block h-full">
          {/* Static Image */}
          <div className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isHovered && product.videoUrl ? 'opacity-0' : 'opacity-100'}`}>
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-foreground/20 text-[10px] font-light uppercase tracking-[0.3em]">Maison Fiora</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </div>

          {/* Video on Hover */}
          <div className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${isHovered && product.videoUrl ? 'opacity-100' : 'opacity-0'}`}>
            {product.videoUrl && (
              <video
                ref={videoRef}
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
                preload="auto"
              >
                <source src={product.videoUrl} type="video/mp4" />
              </video>
            )}
          </div>
        </Link>

        {/* Add to Cart Button - Centered Down on Hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 bottom-8 flex justify-center z-30 pointer-events-none"
            >
              <Button
                className="bg-white/90 backdrop-blur-md text-black hover:bg-white px-8 py-6 rounded-none uppercase tracking-[0.3em] text-[10px] font-light pointer-events-auto border-0 shadow-xl"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addItem({
                    id: product.id,
                    name: product.name,
                    price: product.basePrice,
                    slug: product.slug,
                    imageUrl: product.imageUrl || null
                  });
                }}
              >
                Add to Cart
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Info - Price & Favorite */}
      <div className="flex items-center justify-center gap-3">
        <p className="text-xs uppercase tracking-[0.2em] font-light text-foreground/80">
          ${(product.basePrice || 0).toLocaleString()}
        </p>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="p-1 group/fav"
        >
          <Heart
            size={25}
            className={`transition-all duration-500 ${isFavorite ? 'fill-red-500 stroke-red-500 scale-110' : 'stroke-neutral-500/40 fill-solid group-hover/fav:stroke-foreground'}`}
            strokeWidth={2}
          />
        </button>
      </div>
    </div>
  );
}
