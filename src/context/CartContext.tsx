"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Define the structure for an item in the cart
interface CartItem {
  id: number; // Product ID
  name: string;
  price: number;
  unitType: 'kg' | 'unit';
  quantityKg?: number; // Optional: Quantity in kilograms
  quantityGrams?: number;
  quantityUnits?: number;
  imageUrl?: string;
  category?: string; // Add category (optional)
  subcategory?: string | null; // Add subcategory (optional, nullable)
}

// Define the shape of the context data
interface CartContextType {
  cartItems: CartItem[];
  // Update addToCart item type to include category/subcategory
  addToCart: (item: Omit<CartItem, 'quantityKg' | 'quantityGrams' | 'quantityUnits'>, quantities: { kg?: number; grams?: number; units?: number }) => void;
  removeFromCart: (itemId: number) => void;
  getCartTotalItems: () => number;
  getCartTotalPrice: () => number; // Add total price function
  clearCart: () => void; // Add function to clear the cart
  isCartOpen: boolean; // Add sidebar state
  openCart: () => void; // Add function to open
  closeCart: () => void; // Add function to close
  cartResetCounter: number; // Add a counter to signal cart resets
  headerSearchTerm: string; // Add state for header search term
  setHeaderSearchTerm: (term: string) => void; // Add setter for search term
  isCartAnimating: boolean; // Add state for cart animation trigger
}

// Create the context with a default value
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create the provider component
interface CartProviderProps {
  children: ReactNode;
}
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartResetCounter, setCartResetCounter] = useState(0); // State for reset signal
  const [headerSearchTerm, setHeaderSearchTerm] = useState(''); // Add state for search term
  const [isCartAnimating, setIsCartAnimating] = useState(false); // Add animation state

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

  // Update addToCart parameter type to match the updated CartContextType
  const addToCart = (product: Omit<CartItem, 'quantityKg' | 'quantityGrams' | 'quantityUnits'>, quantities: { kg?: number; grams?: number; units?: number }) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      const newItems = [...prevItems];

      const quantityKg = quantities.kg ?? 0;
      const quantityGrams = quantities.grams ?? 0;
      const quantityUnits = quantities.units ?? 0;

      // Basic logic: Add if quantity > 0, update if exists, remove if quantity becomes 0
      // More complex logic needed for kg/grams combined update
      if (quantityKg > 0 || quantityGrams > 0 || quantityUnits > 0) {
        const newItemData = {
          ...product, // Includes id, name, price, unitType, imageUrl, category, subcategory
          quantityKg: product.unitType === 'kg' ? quantityKg : undefined,
          quantityGrams: product.unitType === 'kg' ? quantityGrams : undefined,
          quantityUnits: product.unitType === 'unit' ? quantityUnits : undefined,
        };

        if (existingItemIndex > -1) {
          // Update existing item, ensuring category/subcategory are preserved/updated
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex], // Keep existing data
            ...newItemData, // Overwrite with new data (including quantities, category, etc.)
          };
        } else {
          // Add new item
          newItems.push(newItemData);
        }
      } else {
         // If quantities are zero, remove item if it exists
         if (existingItemIndex > -1) {
            newItems.splice(existingItemIndex, 1);
         }
      }


      // Trigger animation if an item was added or updated positively
      if (quantityKg > 0 || quantityGrams > 0 || quantityUnits > 0) {
        setIsCartAnimating(true);
        setTimeout(() => setIsCartAnimating(false), 500); // Reset after 500ms
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
    setCartResetCounter(prev => prev + 1); // Increment counter to signal reset
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
    cartResetCounter, // Expose the counter
    headerSearchTerm, // Expose search term state
    setHeaderSearchTerm, // Expose search term setter
    isCartAnimating, // Expose animation state
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
