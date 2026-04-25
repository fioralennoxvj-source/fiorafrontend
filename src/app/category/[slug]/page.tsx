import React from 'react';
import { ProductCard } from '@/components/ProductCard';
import * as motion from "framer-motion/client";
import { formatStrapiUrl } from '@/lib/utils';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://192.168.1.50:1337';

async function getCategoryData(slug: string) {
  try {
    const query = new URLSearchParams({
      'filters[slug][$eq]': slug,
      'populate': '*'
    });
    const res = await fetch(`${STRAPI_URL}/api/categories?${query.toString()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.[0] || null;
  } catch (e) {
    return null;
  }
}

async function getProductsByCategory(categorySlug: string) {
  try {
    const query = new URLSearchParams();
    query.append('filters[category][slug]', categorySlug);
    query.append('populate[0]', 'variants.variant_video');
    query.append('populate[1]', 'variants.variant_images');
    query.append('populate[2]', 'main_image');
    query.append('populate[3]', 'category');
    query.append('pagination[pageSize]', '100');
    
    console.log(`Fetching products for category: ${categorySlug}`);
    const res = await fetch(`${STRAPI_URL}/api/products?${query.toString()}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    
    if (!json.data) return [];

    return json.data.map((p: any) => {
      const image = p.main_image?.url || p.variants?.[0]?.variant_images?.[0]?.url;
      const video = p.variants?.[0]?.variant_video?.url;
      
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        basePrice: p.base_price || 1000,
        imageUrl: formatStrapiUrl(image),
        videoUrl: formatStrapiUrl(video),
      };
    });
  } catch (e) {
    return [];
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [category, products] = await Promise.all([
    getCategoryData(slug),
    getProductsByCategory(slug)
  ]);

  console.log(`[CategoryPage RENDER] slug: ${slug}, count: ${products.length}`);

  if (!category && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        Category not found
      </div>
    );
  }

  const title = category?.name || slug.replace(/-/g, ' ').toUpperCase();

  return (
    <main className="min-h-screen bg-background pt-32 pb-20 px-8 transition-colors duration-500">
      <div className="max-w-[1800px] mx-auto flex flex-col gap-16">
        
        {/* Header */}
        <div className="flex flex-col gap-6 max-w-4xl border-l border-border/20 pl-10 py-4">
          <span className="uppercase text-foreground/40 tracking-[0.5em] font-light text-[10px] leading-none">
            The Collection / {products.length} Pieces
          </span>
          <h2 className="font-heading text-6xl md:text-8xl font-light italic text-foreground tracking-tight leading-none">
            {title}
          </h2>
          {category?.description && (
            <p className="text-foreground/60 font-light text-lg md:text-xl max-w-2xl leading-relaxed mt-4">
              {category.description}
            </p>
          )}
        </div>

        {/* Product Grid with Luxury reveal */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16"
        >
          {products.map((product: any) => (
            <motion.div 
              key={product.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {products.length === 0 && (
          <div className="py-40 text-center flex flex-col gap-4 items-center opacity-30">
            <span className="font-heading text-2xl italic text-foreground">The vault is currently being curated.</span>
            <span className="text-xs uppercase tracking-widest font-light text-foreground">Check back soon for new additions.</span>
          </div>
        )}
      </div>
    </main>
  );
}
