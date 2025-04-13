"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Define the structure for an item in the cart
interface CartItem {
  id: number; // Product ID
  name: string;
  price: number;
  unitType: 'kg' | 'unit';
  quantityKg?: number; // Optional: Quantity in kilograms
  quantityGrams?: number; // Optional: Quantity in grams
  quantityUnits?: number; // Optional: Quantity in units
  imageUrl?: string; // Optional: for displaying in cart later
}

// Define the shape of the context data
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantityKg' | 'quantityGrams' | 'quantityUnits'>, quantities: { kg?: number; grams?: number; units?: number }) => void;
  removeFromCart: (itemId: number) => void; // Add remove function
  getCartTotalItems: () => number;
  getCartTotalPrice: () => number; // Add total price function
  clearCart: () => void; // Add function to clear the cart
  isCartOpen: boolean; // Add sidebar state
  openCart: () => void; // Add function to open
  closeCart: () => void; // Add function to close
}

// Create the context with a default value
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create the provider component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false); // State for sidebar visibility

  // Load cart from localStorage on initial mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('laViejaEstacionCart');
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        // Basic validation: check if it's an array
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        } else {
          console.error("Stored cart data is not an array:", parsedCart);
          localStorage.removeItem('laViejaEstacionCart'); // Clear invalid data
        }
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage:", error);
      localStorage.removeItem('laViejaEstacionCart'); // Clear corrupted data
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    // Avoid saving the initial empty array before loading from storage
    // Only save if cartItems has items OR if there was something previously in storage (to handle clearing the cart)
    if (cartItems.length > 0 || localStorage.getItem('laViejaEstacionCart') !== null) {
       try {
         localStorage.setItem('laViejaEstacionCart', JSON.stringify(cartItems));
       } catch (error) {
         console.error("Failed to save cart to localStorage:", error);
       }
    }
  }, [cartItems]); // Dependency array ensures this runs whenever cartItems changes

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: Omit<CartItem, 'quantityKg' | 'quantityGrams' | 'quantityUnits'>, quantities: { kg?: number; grams?: number; units?: number }) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      const newItems = [...prevItems]; // Changed let to const

      const quantityKg = quantities.kg ?? 0;
      const quantityGrams = quantities.grams ?? 0;
      const quantityUnits = quantities.units ?? 0;

      // Basic logic: Add if quantity > 0, update if exists, remove if quantity becomes 0
      // More complex logic needed for kg/grams combined update
      if (quantityKg > 0 || quantityGrams > 0 || quantityUnits > 0) {
        if (existingItemIndex > -1) {
          // Update existing item (simple overwrite for now)
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantityKg: product.unitType === 'kg' ? quantityKg : undefined,
            quantityGrams: product.unitType === 'kg' ? quantityGrams : undefined,
            quantityUnits: product.unitType === 'unit' ? quantityUnits : undefined,
          };
        } else {
          // Add new item
          newItems.push({
            ...product,
            quantityKg: product.unitType === 'kg' ? quantityKg : undefined,
            quantityGrams: product.unitType === 'kg' ? quantityGrams : undefined,
            quantityUnits: product.unitType === 'unit' ? quantityUnits : undefined,
          });
        }
      } else {
         // If quantities are zero, remove item if it exists
         if (existingItemIndex > -1) {
            newItems.splice(existingItemIndex, 1);
         }
      }


      return newItems;
    });
     // Automatically open cart when item is added/updated? Optional.
     // if (quantityKg > 0 || quantityGrams > 0 || quantityUnits > 0) {
     //   openCart();
     // }
  };

  const removeFromCart = (itemId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]); // Set cart to empty array
  };

  // Calculate total number of distinct items in cart
  const getCartTotalItems = () => {
    // Counts distinct product lines, not total quantity
    return cartItems.length;
  };

  // Calculate total price
  const getCartTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      let itemTotal = 0;
      if (item.unitType === 'kg') {
        // Combine kg and grams for price calculation (assuming price is per kg)
        const totalKg = (item.quantityKg ?? 0) + (item.quantityGrams ?? 0) / 1000;
        itemTotal = totalKg * item.price;
      } else {
        itemTotal = (item.quantityUnits ?? 0) * item.price;
      }
      return total + itemTotal;
    }, 0);
  };


  // Value provided to consuming components
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    getCartTotalItems,
    getCartTotalPrice,
    clearCart, // Expose clearCart
    isCartOpen,
    openCart,
    closeCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use the CartContext
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
