"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel"

export function HeroCarousel({ images }: { images: string[] }) {
  // Use useMemo to ensure the plugin is stable across renders but correctly initialized
  const plugin = React.useMemo(
    () => Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: false }),
    []
  )

  return (
    <Carousel 
      className="absolute inset-0 w-full h-full" 
      opts={{ 
        loop: true,
        duration: 30, // Smooth transition duration
      }} 
      plugins={[plugin]}
    >
      <CarouselContent className="h-full m-0">
        {images.map((src, idx) => (
          <CarouselItem key={idx} className="h-screen p-0">
            <div 
              className="w-full h-full bg-cover bg-center transition-transform duration-[5000ms] ease-linear group-data-[state=active]:scale-110" 
              style={{ backgroundImage: `url('${src}')` }} 
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
    </Carousel>
  )
}
