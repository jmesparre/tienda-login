import { Box, Card, Flex, Text, Button, TextField, IconButton } from '@radix-ui/themes';
import Image from 'next/image'; // Using next/image for potential optimization
import { PlusIcon, MinusIcon } from '@radix-ui/react-icons';
import { useState, useEffect } from 'react'; // Import useState and useEffect
import { useCart } from '@/context/CartContext'; // Import useCart
import { categoryColorMap } from '@/lib/utils'; // Import color map
import clsx from 'clsx'; // Import clsx

// Import the Product type definition (assuming it might be moved later)
// If ProductGrid is the only place it's defined, this import isn't needed here,
// but it's good practice if the type becomes shared.
// For now, we'll redefine it or assume it's globally available via ProductGrid import.

// Define the structure matching ProductGrid
interface Product {
  id: number; // Added id for consistency if needed, though not used directly here yet
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  unitType: 'kg' | 'unit'; // Include unitType
}

interface ProductCardProps {
  product: Product; // Use the updated Product type
}

export default function ProductCard({ product }: ProductCardProps) {
  // Get addToCart, cartItems, and removeFromCart from context
  const { addToCart, cartItems, removeFromCart } = useCart();

  // Find if the current product is in the cart
  const cartItem = cartItems.find(item => item.id === product.id);
  const isInCart = !!cartItem;

  // Local state for quantity inputs - Initialize with cart quantity if available
  const initialKg = cartItem?.quantityKg ?? 0; // Corrected access
  const initialGrams = cartItem?.quantityGrams ?? 0; // Corrected access
  const initialUnits = cartItem?.quantityUnits ?? 0; // Corrected access

  const [quantityKg, setQuantityKg] = useState(initialKg);
  const [quantityGrams, setQuantityGrams] = useState(initialGrams);
  const [quantityUnits, setQuantityUnits] = useState(initialUnits);

  // State to track if quantities have been modified from the cart state
  const [isModified, setIsModified] = useState(false);

  // Effect to update modification status when local quantities change relative to cart state
  useEffect(() => {
    let modified = false; // Initialize modified flag
    if (isInCart) {
      // If in cart, modified if local state differs from initial cart state
      const kgMatch = quantityKg === initialKg;
      const gramsMatch = quantityGrams === initialGrams;
      const unitsMatch = quantityUnits === initialUnits;
      modified = !(kgMatch && gramsMatch && unitsMatch);
    } else {
      // If not in cart (initial state is 0), modified if any quantity is > 0
      modified = quantityKg > 0 || quantityGrams > 0 || quantityUnits > 0;
    }
    setIsModified(modified);
    // Rerun effect if local quantities or initial (cart) quantities change
  }, [quantityKg, quantityGrams, quantityUnits, initialKg, initialGrams, initialUnits, isInCart]);


  // Handlers for quantity changes
  const handleQuantityChange = (type: 'kg' | 'grams' | 'units', delta: number) => {
    if (type === 'kg') {
      setQuantityKg((prev: number) => Math.max(0, prev + delta)); // Added type
    } else if (type === 'grams') {
      // Increment/decrement grams by 100, ensure it doesn't go below 0
      setQuantityGrams((prev: number) => Math.max(0, prev + delta * 100)); // Added type
    } else if (type === 'units') {
      setQuantityUnits((prev: number) => Math.max(0, prev + delta)); // Added type
    }
  };

  // Handler for adding item to cart - increments by 1 unit/kg on each click
  const handleAddToCart = () => {
    const { id, name, price, unitType, imageUrl } = product;

    // Find the current item in the cart to get its existing quantity
    const currentCartItem = cartItems.find(item => item.id === product.id);

    let newQuantities;

    if (isModified) {
      // If inputs were modified, use the current local state quantities
      if (unitType === 'kg') {
        newQuantities = {
          kg: quantityKg,
          grams: quantityGrams,
          units: undefined,
        };
        // No need to update local state here, it's already set
      } else { // unitType === 'unit'
        newQuantities = {
          kg: undefined,
          grams: undefined,
          units: quantityUnits,
        };
         // No need to update local state here, it's already set
      }
    } else {
      // If inputs were NOT modified, increment the existing cart quantity by 1
      if (unitType === 'kg') {
        const currentKg = currentCartItem?.quantityKg ?? 0;
        const currentGrams = currentCartItem?.quantityGrams ?? 0; // Keep existing grams

        const newKg = currentKg + 1; // Increment kg by 1
        const newGrams = currentGrams;

        newQuantities = {
          kg: newKg,
          grams: newGrams,
          units: undefined,
        };

        // Update local state to reflect the new total quantity in the cart
        setQuantityKg(newKg);
        setQuantityGrams(newGrams);

      } else { // unitType === 'unit'
        const currentUnits = currentCartItem?.quantityUnits ?? 0;
        const newUnits = currentUnits + 1; // Increment units by 1

        newQuantities = {
          kg: undefined,
          grams: undefined,
          units: newUnits,
        };

        // Update local state to reflect the new total quantity in the cart
        setQuantityUnits(newUnits);
      }
    }

    // Call addToCart with the determined quantities
    // The addToCart function in CartContext handles adding or updating
    addToCart({ id, name, price, unitType, imageUrl }, newQuantities);

    // Reset modification state as the local state now matches the cart state
    setIsModified(false);
   };

  // Handler for removing item from cart
  const handleRemoveFromCart = () => {
    removeFromCart(product.id);
    // Reset local quantities
    setQuantityKg(0);
    setQuantityGrams(0);
    setQuantityUnits(0);
    setIsModified(false); // Reset modification state as well
  };

  // Calculate total price based on quantity
  const calculateTotalPrice = () => {
    if (product.unitType === 'kg') {
      const totalKilos = quantityKg + (quantityGrams / 1000);
      return totalKilos * product.price;
    } else {
      return quantityUnits * product.price;
    }
  };

  const totalPrice = calculateTotalPrice();

  return (
    <Card size="2">
      {/* Main Flex container for the card content */}
      <Flex gap="4" align="start"> {/* Use string "4" */}
        {/* Image Box (Left) */}
        <Box width="80px" height="80px" flexShrink="0" style={{ aspectRatio: '1 / 1', background: '#eee', borderRadius: 'var(--radius-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}> {/* Use string "0" */}
          <Text size="1" color="gray">Image</Text>
          {/* Example using next/image:
          <Image src={product.imageUrl} alt={product.name} width={80} height={80} style={{ objectFit: 'cover', borderRadius: 'var(--radius-2)' }} />
          */}
        </Box>

        {/* Center Column: Info + Quantity */}
        <Flex direction="column" flexGrow="1" gap="2"> {/* Use string "2" */}
          <Text size="3" weight="bold">{product.name}</Text>
          <Text size="1" color="gray">{product.category}</Text>

          {/* Quantity Inputs - Conditional Rendering */}
          <Flex direction="column" gap="1" mt="1"> {/* Use strings "1" */}
            {product.unitType === 'kg' ? (
              <>
                <Flex align="center" gap="2"> {/* Use string "2" */}
                  <Text size="1" style={{ width: '50px' }}>Kilos</Text> {/* Fixed width for alignment */}
                  <IconButton size="1" variant="outline" onClick={() => handleQuantityChange('kg', -1)}><MinusIcon /></IconButton>
                  <TextField.Root
                    size="1"
                    type="number" // Use number type for better input handling
                    value={String(quantityKg)} // Bind value to state
                    onChange={(e) => setQuantityKg(parseInt(e.target.value, 10) || 0)} // Update state on change
                    style={{ width: '40px', textAlign: 'center' }}
                  />
                  <IconButton size="1" variant="outline" onClick={() => handleQuantityChange('kg', 1)}><PlusIcon /></IconButton>
                </Flex>
                <Flex align="center" gap="2"> {/* Use string "2" */}
                  <Text size="1" style={{ width: '50px' }}>Gramos</Text> {/* Fixed width for alignment */}
                  <IconButton size="1" variant="outline" onClick={() => handleQuantityChange('grams', -1)}><MinusIcon /></IconButton>
                  <TextField.Root
                    size="1"
                    type="number"
                    value={String(quantityGrams)} // Bind value to state
                    onChange={(e) => setQuantityGrams(parseInt(e.target.value, 10) || 0)} // Update state on change
                    style={{ width: '40px', textAlign: 'center' }}
                  />
                  <IconButton size="1" variant="outline" onClick={() => handleQuantityChange('grams', 1)}><PlusIcon /></IconButton>
                </Flex>
              </>
            ) : (
              <Flex align="center" gap="2"> {/* Use string "2" */}
                <Text size="1" style={{ width: '50px' }}>Unidades</Text> {/* Fixed width for alignment */}
                <IconButton size="1" variant="outline" onClick={() => handleQuantityChange('units', -1)}><MinusIcon /></IconButton>
                <TextField.Root
                  size="1"
                  type="number"
                  value={String(quantityUnits)} // Bind value to state
                  onChange={(e) => setQuantityUnits(parseInt(e.target.value, 10) || 0)} // Update state on change
                  style={{ width: '40px', textAlign: 'center' }}
                 />
                <IconButton size="1" variant="outline" onClick={() => handleQuantityChange('units', 1)}><PlusIcon /></IconButton>
              </Flex>
            )}
          </Flex>
        </Flex>

        {/* Right Column: Price + Button */}
        <Flex direction="column" align="end" gap="1" justify="between" style={{ alignSelf: 'stretch' }}> {/* Reduced gap */}
           {/* Conditionally display price unit */}
           <Text size="2" weight="medium" align="right">
            ${product.price.toLocaleString('es-AR')} {product.unitType === 'kg' ? 'kg' : 'c/u'}
          </Text>
          {/* Display total price if greater than 0 */}
          {totalPrice > 0 && (
            <Text size="3" weight="bold" color="green" align="right"> {/* Increased size and added color */}
              ${totalPrice.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          )}
          {/* Conditionally render the remove text */}
          {isInCart && (
            <Text
              size="1"
              color="red" // Use red color for removal action
              onClick={handleRemoveFromCart}
              style={{ cursor: 'pointer', textDecoration: 'underline', marginBottom: 'var(--space-1)' }} // Add styling
              align="right"
            >
              Quitar
            </Text>
          )}
          {/* Add conditional color prop */}
          <Button
            size="2"
            variant="solid"
            color={isInCart ? 'green' : undefined} // Change color to green if in cart
            onClick={handleAddToCart}
            mt="auto"
          >
            {isInCart ? (isModified ? 'Modificar' : 'Comprado') : 'Comprar'}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
