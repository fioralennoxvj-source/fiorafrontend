'use client';

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCard } from "./ProductCard";

interface CategoryCarouselProps {
  title: string;
  products: any[];
}

export function CategoryCarousel({ title, products }: CategoryCarouselProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  if (!products || products.length === 0) return null;

  return (
    <section className="py-24 px-8 bg-background transition-colors duration-500 overflow-hidden">
      <div className="max-w-[1800px] mx-auto flex flex-col gap-12">
        <div className="flex items-end justify-between border-b border-border/10 pb-8">
          <div className="flex flex-col gap-2">
            <span className="uppercase text-foreground/40 tracking-[0.3em] font-light text-[10px]">Collection Showcase</span>
            <h3 className="font-heading text-4xl text-foreground tracking-tight">{title}</h3>
          </div>
          <div className="hidden md:flex gap-4">
            {/* Custom navigation style if needed, but we'll use CarouselPrevious/Next */}
          </div>
        </div>

        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-4 md:-ml-6">
            {products.map((product, idx) => (
              <CarouselItem key={idx} className="pl-4 md:pl-6 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-end gap-2 mt-12 px-4">
             <CarouselPrevious className="static translate-y-0 rounded-none border-border/20 bg-transparent hover:bg-foreground hover:text-background transition-all duration-500 w-12 h-12" />
             <CarouselNext className="static translate-y-0 rounded-none border-border/20 bg-transparent hover:bg-foreground hover:text-background transition-all duration-500 w-12 h-12" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
