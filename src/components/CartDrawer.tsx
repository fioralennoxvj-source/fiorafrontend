'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

export function CartDrawer() {
  const { cartItems, removeItem, updateQuantity, subtotal, isDrawerOpen, setIsDrawerOpen } = useCart();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-border/40 z-[210] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-8 flex items-center justify-between border-b border-border/10">
              <div className="flex flex-col gap-1">
                <h2 className="font-heading text-xl uppercase tracking-[0.2em] font-light">Your Bag</h2>
                <span className="text-[10px] uppercase text-foreground/40 tracking-widest font-light">{cartItems.length} Items</span>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:opacity-50 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-10 scrollbar-hide">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-6 opacity-30">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p className="font-heading text-lg italic text-center">Your curation is empty.</p>
                  <Button 
                    variant="link" 
                    onClick={() => setIsDrawerOpen(false)}
                    className="uppercase tracking-[0.2em] text-[10px] font-light"
                  >
                    Return to Collections
                  </Button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-6 group">
                    <div className="w-24 h-32 bg-muted/20 flex-shrink-0 overflow-hidden relative border border-border/5">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-heading text-sm uppercase tracking-wider">{item.name}</h3>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-[10px] uppercase text-foreground/40 hover:text-foreground transition tracking-widest"
                          >
                            Remove
                          </button>
                        </div>
                        <span className="text-xs text-foreground/50 font-light">${item.price.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-border/20">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-muted transition"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-4 text-[10px] font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-muted transition"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="text-sm font-medium tracking-tight">${(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-8 border-t border-border/20 bg-muted/5 flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="uppercase text-foreground/40 tracking-[0.2em] text-[10px]">Subtotal</span>
                    <span className="text-2xl font-light">${subtotal.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-foreground/30 font-light">Taxes and shipping calculated at checkout.</p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button className="w-full bg-foreground text-background hover:bg-foreground/80 rounded-none uppercase tracking-[0.3em] font-light py-8 text-xs relative overflow-hidden group">
                    <span className="relative z-10">Proceed to Checkout</span>
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-full border-border/40 rounded-none uppercase tracking-[0.2em] font-light py-6 text-[10px] hover:bg-muted transition-all duration-500"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
