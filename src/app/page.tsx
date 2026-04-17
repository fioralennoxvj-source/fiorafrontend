import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { HeroCarousel } from "@/components/HeroCarousel"
import { CategoryCarousel } from "@/components/CategoryCarousel"

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://192.168.1.50:1337';

async function getHomepageData() {
  try {
    // In Strapi 5, sometimes explicit population for media in single types is needed
    const query = new URLSearchParams({
      'populate[Carousel_image][populate]': '*',
      'populate[OurstoryBG][populate]': '*',
      'populate[PricingBG][populate]': '*'
    });
    const res = await fetch(`${STRAPI_URL}/api/homepage?${query.toString()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (e) {
    return null;
  }
}

async function getProductsByCategory(categorySlug: string) {
  try {
    // Valid Strapi 5 nested population syntax
    // Filters for Published documents are implicit when status is not provided, 
    // but in Strapi 5 Document Service / API it handles it.
    const query = new URLSearchParams();
    query.append('filters[category][slug]', categorySlug);
    query.append('populate[0]', 'variants.variant_video');
    query.append('populate[1]', 'variants.variant_images');
    query.append('populate[2]', 'main_image');
    query.append('populate[3]', 'category');
    query.append('pagination[pageSize]', '24');

    const res = await fetch(`${STRAPI_URL}/api/products?${query.toString()}`, { cache: 'no-store' });
    if (!res.ok) {
      console.error(`Fetch failed for ${categorySlug}: ${res.status} ${res.statusText}`);
      return [];
    }
    const json = await res.json();

    if (!json.data) return [];

    const products = json.data.map((p: any) => {
      // Find the first variant or prioritized variant
      const variant = p.variants?.[0] || {};
      const image = p.main_image?.url || variant.variant_images?.[0]?.url;
      const video = variant.variant_video?.url;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        basePrice: p.base_price || 1000,
        imageUrl: image ? (image.startsWith('http') ? image : `${STRAPI_URL}${image}`) : null,
        videoUrl: video ? (video.startsWith('http') ? video : `${STRAPI_URL}${video}`) : null,
      };
    });

    return products.sort(() => 0.5 - Math.random()).slice(0, 8);
  } catch (e) {
    console.error(`Failed to fetch products for ${categorySlug}`, e);
    return [];
  }
}

export default async function Home() {
  const [homepageData, rings, bracelets, earrings, necklaces] = await Promise.all([
    getHomepageData(),
    getProductsByCategory('rings'),
    getProductsByCategory('bracelet'),
    getProductsByCategory('ear-ring'),
    getProductsByCategory('necklace-and-pendants')
  ]);

  const home = homepageData || {};
  const heroHeading = home.heroHeadline || "Elegance Forged in Earth.";
  const heroSubtext = home.heroSubline || "Discover natural diamonds crafted into breathtaking silhouettes.";
  const heroCtaText = home.heroCTA || "Shop Now";
  const ourStoryEyebrow = home.ourStoryEyebrow || "Maison Fiora Lennox";
  const ourStoryHeadline = home.ourStoryHeadline || "For generations, we have sourced only the most exceptionally cut natural stones, prioritizing brilliance over all else.";
  const ourStoryBody = home.ourStoryBody || "Uncompromising quality and sustainable extraction trace the journey of every diamond from the deep earth to your hands.";
  const ourStoryCTA = home.ourStoryCTA || "Read Our Heritage";
  const carouselImages = home.Carousel_image && home.Carousel_image.length > 0
    ? home.Carousel_image.map((img: any) => img.url.startsWith('http') ? img.url : `${STRAPI_URL}${img.url}`)
    : [];

  const ourStoryBG = home.OurstoryBG?.url
    ? (home.OurstoryBG.url.startsWith('http') ? home.OurstoryBG.url : `${STRAPI_URL}${home.OurstoryBG.url}`)
    : null;

  const pricingHeader = home.PricingHeader || "Clarity in Craft, Honesty in Pricing";
  const pricingText = home.PricingText || "At Fiora Lennox, transparency is as intrinsic as the clarity of our stones.";
  const pricingBG = home.PricingBG?.url
    ? (home.PricingBG.url.startsWith('http') ? home.PricingBG.url : `${STRAPI_URL}${home.PricingBG.url}`)
    : null;

  return (
    <main className="flex flex-col min-h-screen selection:bg-foreground selection:text-background transition-colors duration-500">

      {/* Hero Section */}
      <section className="relative h-screen flex items-end justify-start overflow-hidden bg-background p-12 md:p-20 lg:p-32">
        {carouselImages.length > 0 ? (
          <HeroCarousel images={carouselImages} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-background pointer-events-none transition-colors duration-500" />
        )}
        <div className="z-10 text-left flex flex-col items-start gap-8 max-w-4xl">
          <h2 className="font-heading text-5xl md:text-7xl lg:text-8xl font-light text-white leading-tight">
            {heroHeading}
          </h2>
          <p className="text-white/80 font-light tracking-wide text-lg md:text-xl max-w-2xl">
            {heroSubtext}
          </p>
          <Button className="mt-4 bg-white text-black hover:bg-white/90 uppercase tracking-[0.2em] px-10 py-7 rounded-none font-light text-sm transition-all duration-500 hover:tracking-[0.3em]">
            {heroCtaText}
          </Button>
        </div>
      </section>

      {/* Category Carousels in requested order */}
      <CategoryCarousel title="Engagement Rings" products={rings} />
      <CategoryCarousel title="Bracelets" products={bracelets} />
      <CategoryCarousel title="Earrings" products={earrings} />
      <CategoryCarousel title="Necklace & Pendants" products={necklaces} />

      {/* Pricing Philosophy Section */}
      <section className="relative py-40 px-8 bg-zinc-950 overflow-hidden transition-colors duration-500">
        {pricingBG && (
          <div className="absolute inset-0 z-0">
            <img
              src={pricingBG}
              alt="Pricing Background"
              className="w-full h-full object-cover opacity-70 brightness-50 contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950" />
          </div>
        )}
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1 flex flex-col gap-6">
            <span className="uppercase text-white/50 tracking-[0.4em] font-light text-[10px]">Honest Luxury</span>
            <h3 className="font-heading text-4xl md:text-6xl text-white leading-tight font-light italic">
              {pricingHeader}
            </h3>
          </div>
          <div className="flex-1 flex flex-col gap-8">
            <p className="text-white/70 leading-relaxed font-light text-sm md:text-lg border-l border-white/20 pl-8">
              {pricingText}
            </p>
            <Button variant="outline" className="w-fit border-white/20 text-white bg-transparent hover:bg-white hover:text-black transition-all duration-700 px-8 py-6 rounded-none uppercase tracking-[0.2em] text-xs">
              View Price Guide
            </Button>
          </div>
        </div>
      </section>

      {/* Our Story Writeup */}
      <section className="relative py-40 px-8 bg-black overflow-hidden transition-colors duration-500">
        {ourStoryBG && (
          <img
            src={ourStoryBG}
            alt="Our Story Background"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        )}
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col gap-8 items-center">
          <span className="uppercase text-white/50 tracking-[0.3em] font-light text-xs">{ourStoryEyebrow}</span>
          <h3 className="font-heading text-4xl md:text-5xl text-white leading-relaxed font-medium">
            {ourStoryHeadline}
          </h3>
          <p className="text-white/80 leading-loose max-w-2xl font-normal text-2xl">
            {ourStoryBody}
          </p>
          <Button variant="link" className="text-white mt-4 tracking-widest uppercase font-light text-xs opacity-70 hover:opacity-100 p-0 border-b border-white rounded-none">{ourStoryCTA}</Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background dark:bg-black py-24 px-8 border-t border-border transition-colors duration-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="flex flex-col gap-4">
            <h4 className="font-heading text-xl text-foreground">Fiora Lennox</h4>
            <p className="text-foreground/50 text-sm font-light leading-relaxed">The pinnacle of natural diamond luxury.</p>
          </div>
          <div className="flex flex-col gap-4 text-sm font-light text-foreground/80">
            <span className="uppercase tracking-widest text-foreground/50 text-xs mb-2">Shop</span>
            <a href="#" className="hover:text-foreground transition">Rings</a>
            <a href="#" className="hover:text-foreground transition">Necklaces</a>
            <a href="#" className="hover:text-foreground transition">Earrings</a>
          </div>
          <div className="flex flex-col gap-4 text-sm font-light text-foreground/80">
            <span className="uppercase tracking-widest text-foreground/50 text-xs mb-2">Assistance</span>
            <a href="#" className="hover:text-foreground transition">Concierge</a>
            <a href="#" className="hover:text-foreground transition">Shipping & Returns</a>
            <a href="#" className="hover:text-foreground transition">Track Order</a>
          </div>
          <div className="flex flex-col gap-4 text-sm font-light text-foreground/80">
            <span className="uppercase tracking-widest text-foreground/50 text-xs mb-2">Legal</span>
            <a href="#" className="hover:text-foreground transition">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition">Terms of Service</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
