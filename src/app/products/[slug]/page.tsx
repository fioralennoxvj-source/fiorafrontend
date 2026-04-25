"use client"

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { formatStrapiUrl } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Play, Heart, Share2, Info } from 'lucide-react'
import { useCart } from "@/context/CartContext"

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://192.168.1.50:1337';

export default function ProductPage() {
  const { slug } = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMetal, setSelectedMetal] = useState('White Gold') // Display label
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      try {
        // Deep population for Strapi 5 to ensure media and metal specs are nested correctly
        const query = new URLSearchParams();
        query.append('filters[slug][$eq]', slug as string);
        query.append('populate[0]', 'variants.metal_spec');
        query.append('populate[1]', 'variants.variant_images');
        query.append('populate[2]', 'variants.variant_video');
        query.append('populate[3]', 'category');
        query.append('populate[4]', 'main_image');
        query.append('populate[5]', 'gallery');
        
        const res = await fetch(`${STRAPI_URL}/api/products?${query.toString()}`);
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setProduct(json.data[0]);
          
          // Robust default selection logic
          const variants = json.data[0].variants || [];
          const getMetalColor = (v: any) => {
            if (v.metal_spec?.color) return v.metal_spec.color;
            if (v.sku?.endsWith('-W')) return 'White';
            if (v.sku?.endsWith('-R')) return 'Rose';
            if (v.sku?.endsWith('-Y')) return 'Yellow';
            return null;
          };

          const hasWhite = variants.some((v: any) => getMetalColor(v) === 'White');
          if (!hasWhite && variants.length > 0) {
            const firstColor = getMetalColor(variants[0]);
            const metalLabel = firstColor === 'Yellow' ? 'Gold' : (firstColor === 'Rose' ? 'Rose Gold' : 'White Gold');
            setSelectedMetal(metalLabel);
          }
        }
      } catch (e) {
        console.error("Fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  const activeVariant = useMemo(() => {
    if (!product || !product.variants) return null;
    const colorTarget = selectedMetal === 'Gold' ? 'Yellow' : (selectedMetal === 'Rose Gold' ? 'Rose' : 'White');
    
    return product.variants.find((v: any) => {
      const vColor = v.metal_spec?.color || 
                    (v.sku?.endsWith('-W') ? 'White' : 
                     (v.sku?.endsWith('-R') ? 'Rose' : 
                      (v.sku?.endsWith('-Y') ? 'Yellow' : null)));
      return vColor === colorTarget;
    }) || product.variants[0];
  }, [product, selectedMetal]);

  const media = useMemo(() => {
    if (!product) return [];
    const items: { type: 'image' | 'video'; url: string }[] = [];
    const seenUrls = new Set<string>();

    const addMedia = (url: string, type: 'image' | 'video' = 'image') => {
      const formattedUrl = formatStrapiUrl(url);
      if (formattedUrl && !seenUrls.has(formattedUrl)) {
        items.push({ type, url: formattedUrl });
        seenUrls.add(formattedUrl);
      }
    };

    // 1. Add variant images first (most specific)
    if (activeVariant?.variant_images) {
      activeVariant.variant_images.forEach((img: any) => addMedia(img.url));
    }

    // 2. Add variant video
    if (activeVariant?.variant_video?.url) {
      addMedia(activeVariant.variant_video.url, 'video');
    }

    // 3. Add product main image
    if (product.main_image?.url) {
      addMedia(product.main_image.url);
    }

    // 4. Add product gallery images
    if (product.gallery) {
      product.gallery.forEach((img: any) => addMedia(img.url));
    }

    return items;
  }, [product, activeVariant]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-[1px] bg-foreground/20 animate-pulse" />
        <span className="uppercase tracking-[0.5em] text-[10px] font-light">Maison Fiora Lennox</span>
      </div>
    </div>
  );

  if (!product) return <div className="h-screen flex items-center justify-center bg-background text-foreground uppercase tracking-widest text-xs">Creation not found</div>;

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 pt-24 pb-20 transition-colors duration-500">
      <div className="max-w-[1800px] mx-auto px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left: Media Mosaic/Grid (Blue Nile Style) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="wait">
            {media.length > 0 ? (
              media.map((item, idx) => (
                <motion.div 
                  key={`${selectedMetal}-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative overflow-hidden group bg-muted/10 ${idx === 0 ? 'md:col-span-2 aspect-[16/9]' : 'aspect-square'}`}
                >
                  {item.type === 'video' ? (
                    <video 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      className="w-full h-full object-cover"
                    >
                      <source src={item.url} type="video/mp4" />
                    </video>
                  ) : (
                    <img 
                      src={item.url} 
                      alt={`${product.name} ${selectedMetal} view ${idx}`} 
                      className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                    />
                  )}
                </motion.div>
              ))
            ) : (
              <div className="col-span-full aspect-square bg-muted/20 flex items-center justify-center italic text-foreground/30">
                Visual assets being curated for this variant.
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Product Details & Interaction */}
        <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit flex flex-col gap-12">
          
          {/* Header Info */}
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <span className="uppercase tracking-[0.4em] font-light text-[10px] text-foreground/40 leading-none">
                {product.category?.name || 'High Jewelry'} / {product.name.slice(0, 4)}
              </span>
              <div className="flex gap-4">
                <button onClick={() => setIsFavorite(!isFavorite)} className="hover:opacity-60 transition">
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 stroke-red-500' : 'text-foreground/40'}`} strokeWidth={1} />
                </button>
                <button className="hover:opacity-60 transition">
                  <Share2 className="w-5 h-5 text-foreground/40" strokeWidth={1} />
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <h1 className="font-heading text-4xl md:text-5xl font-light text-foreground leading-tight tracking-tight">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-light text-foreground/90">
                  ${(product.base_price || 0).toLocaleString()}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-foreground/30">Inc. Shipping & Duties</span>
              </div>
            </div>
            
            <p className="text-sm font-light text-foreground/60 leading-relaxed italic">
              A breathtaking silhouette crafted with natural, sustainably sourced stones of exceptional clarity.
            </p>
          </div>

          {/* Metal Selection Toggle Group */}
          <div className="flex flex-col gap-6 border-t border-border/10 pt-10">
            <div className="flex justify-between items-center">
              <label className="uppercase tracking-[0.2em] text-[10px] font-medium text-foreground/60">Metal</label>
              <span className="text-[10px] font-light text-foreground/40">18k Hallmarked</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {['White Gold', 'Gold', 'Rose Gold'].map((metal) => (
                <button
                  key={metal}
                  onClick={() => setSelectedMetal(metal)}
                  className={`py-4 text-[10px] uppercase tracking-[0.2em] font-light border transition-all duration-500 ${
                    selectedMetal === metal 
                      ? 'border-foreground bg-foreground text-background shadow-lg' 
                      : 'border-border/30 text-foreground/50 hover:border-foreground/40'
                  }`}
                >
                  {metal === 'Gold' ? 'Gold' : metal}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-foreground/40 font-light">Selected: 18k {selectedMetal}</p>
          </div>

          {/* Sizing & Add to Cart */}
          <div className="flex flex-col gap-8 pt-10 border-t border-border/10">
            <div className="flex flex-col gap-4">
              <Button 
                onClick={() => {
                  if (activeVariant) {
                    addItem({
                      id: activeVariant.id,
                      name: `${product.name} (${selectedMetal})`,
                      price: product.base_price,
                      slug: product.slug,
                      imageUrl: activeVariant.variant_images?.[0]?.url ? formatStrapiUrl(activeVariant.variant_images[0].url) : (product.main_image?.url ? formatStrapiUrl(product.main_image.url) : null)
                    });
                  }
                }}
                className="w-full bg-foreground text-background hover:bg-foreground/90 uppercase tracking-[0.3em] py-9 rounded-none font-light transition-all duration-700 text-xs shadow-2xl overflow-hidden relative group"
              >
                <span className="relative z-10 transition-transform duration-500 group-hover:scale-110">Add to Private Collection</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-border/40 uppercase tracking-[0.2em] py-8 rounded-none font-light text-[10px] hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all duration-500"
              >
                Inquire with a Specialist
              </Button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-8 text-[9px] uppercase tracking-widest text-foreground/40 border-t border-border/10 pt-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-1 rounded-full bg-foreground/20" />
                <span>GIA Certified</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1 h-1 rounded-full bg-foreground/20" />
                <span>Secure Transit</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1 h-1 rounded-full bg-foreground/20" />
                <span>Handmade in Atelier</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1 h-1 rounded-full bg-foreground/20" />
                <span>Conflict Free</span>
              </div>
            </div>
          </div>

          {/* Atelier Note */}
          <div className="flex flex-col gap-6 p-8 bg-muted/10 border border-border/5">
             <div className="flex items-center gap-2">
               <Info className="w-3 h-3 text-foreground/40" />
               <h4 className="font-heading text-xs uppercase tracking-widest opacity-80">The Maison Archive</h4>
             </div>
             <p className="font-light text-foreground/60 leading-relaxed text-[11px] tracking-wide">
               Every piece is carefully documented in our Maison archives. Our master goldsmiths utilize 18K alloys 
               specifically formulated to maximize the dispersion of light within our exceptionally cut natural diamonds.
             </p>
          </div>

        </div>
      </div>

      {/* Similar Items Placeholder or other sections can go here */}
    </main>
  );
}
