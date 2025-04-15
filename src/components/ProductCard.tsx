import { Box, Card, Flex, Text, Button, TextField, IconButton } from '@radix-ui/themes';
import Image from 'next/image'; // Using next/image for potential optimization
import { PlusIcon, MinusIcon } from '@radix-ui/react-icons';
import { useState, useEffect } from 'react'; // Import useState and useEffect
import { useCart } from '@/context/CartContext'; // Import useCart
import clsx from 'clsx';
import { Product as ProductType } from '@/lib/categories'; // Import the shared Product type

// Removed local Product interface definition

interface ProductCardProps {
  product: ProductType; // Use the shared ProductType
}

export default function ProductCard({ product }: ProductCardProps) {
  // Get addToCart, cartItems, and removeFromCart from context
  const { addToCart, cartItems, removeFromCart } = useCart();

  // Find if the current product is in the cart
  const cartItem = cartItems.find(item => item.id === product.id);
  const isInCart = !!cartItem;

  // Local state for quantity inputs - Initialize with cart quantity if available
  // Use optional chaining for safety as product properties might be optional in the type
  const initialKg = cartItem?.quantityKg ?? 0;
  const initialGrams = cartItem?.quantityGrams ?? 0;
  const initialUnits = cartItem?.quantityUnits ?? 0;

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
    const MAX_VALUE = 900; // Define the maximum limit

    // Use product.unit_type (snake_case)
    if (type === 'kg') {
      setQuantityKg((prev) => {
        const newValue = prev + delta;
        // Ensure value is between 0 and MAX_VALUE
        return Math.max(0, Math.min(MAX_VALUE, newValue));
      });
    } else if (type === 'grams') {
      setQuantityGrams((prev) => {
        const newValue = prev + delta * 100;
        // Ensure value is between 0 and MAX_VALUE (grams are capped at 999)
        return Math.max(0, Math.min(MAX_VALUE, newValue));
      });
    } else if (type === 'units') {
      setQuantityUnits((prev) => {
        const newValue = prev + delta;
        // Ensure value is between 0 and MAX_VALUE
        return Math.max(0, Math.min(MAX_VALUE, newValue));
      });
    }
  };

  // Handler for adding item to cart - increments by 1 unit/kg on each click
  const handleAddToCart = () => {
    // Destructure using snake_case from product
    const { id, name, price, unit_type, image_url, category, subcategory } = product;

    // Find the current item in the cart to get its existing quantity
    const currentCartItem = cartItems.find(item => item.id === id);

    let newQuantities;

    if (isModified) {
      // If inputs were modified, use the current local state quantities
      if (unit_type === 'kg') { // Use snake_case
        newQuantities = {
          kg: quantityKg,
          grams: quantityGrams,
          units: undefined,
        };
        // No need to update local state here, it's already set
      } else { // unit_type === 'unit'
        newQuantities = {
          kg: undefined,
          grams: undefined,
          units: quantityUnits,
        };
         // No need to update local state here, it's already set
      }
    } else {
      // If inputs were NOT modified, increment the existing cart quantity by 1
      if (unit_type === 'kg') { // Use snake_case
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

      } else { // unit_type === 'unit'
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

    // Call addToCart with the determined quantities, passing snake_case props
    // Convert image_url from null to undefined if necessary
    addToCart({
      id,
      name,
      price,
      unitType: unit_type,
      imageUrl: image_url ?? undefined, // Convert null to undefined
      category,
      subcategory
    }, newQuantities);

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
    if (product.unit_type === 'kg') { // Use snake_case
      const totalKilos = quantityKg + (quantityGrams / 1000);
      return totalKilos * product.price;
    } else {
      return quantityUnits * product.price;
    }
  };

  const totalPrice = calculateTotalPrice();

  return (
    <Card size="2" className="bg-[#d0c2a7] border border-[#EAE0CC]"> {/* Added background and border */}
      {/* Main Flex container for the card content */}
      <Flex gap="2" align="start"> {/* Use string "4" */}
        {/* Image Box (Left) */}
        <Box width="80px" height="80px" flexShrink="0" style={{ aspectRatio: '1 / 1', width: 'auto', height: 'auto', background: 'transparent', borderRadius: 'var(--radius-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {/* Use product.image_url (snake_case) */}
          <Image src={product.image_url || '/placeholder-image.jpg'} alt={product.name} width={80} height={80} style={{ objectFit: 'cover', borderRadius: 'var(--radius-2)' }} />
        </Box>

        {/* Center Column: Info + Quantity */}
        <Flex direction="column" flexGrow="1" gap="1">
          <Text size="3" weight="bold">{product.name}</Text>
          {/* Display Category and Subcategory */}
          <Text size="1" color="gray">
            {product.category}
            {product.subcategory ? `, ${product.subcategory}` : ''} {/* Add subcategory if exists */}
          </Text>

          {/* Quantity Inputs - Conditional Rendering */}
          <Flex direction="column" gap="1" mt="1">
            {product.unit_type === 'kg' ? ( // Use snake_case
              <>
                <Flex align="center" gap="1">
                  <Text size="1" style={{ width: '52px' }}>Kilos</Text>
                  <IconButton size="1" variant="outline" onClick={() => handleQuantityChange('kg', -1)} className="bg-[#FFFBF5] border border-[#EAE0CC]"><MinusIcon /></IconButton>
                  <TextField.Root
                    size="1"
                    type="number"
                    className="bg-[#FFFBF5] border border-[#EAE0CC]"
                    value={String(quantityKg)}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (/^\d+$/.test(value) && value.length <= 3)) {
                        setQuantityKg(parseInt(value, 10) || 0);
                      }
                    }}
                    style={{ width: '37px', textAlign: 'center' }}
                    maxLength={3}
                  />
                  <IconButton size="1" variant="outline" onClick={() => handleQuantityChange('kg', 1)} className="bg-[#FFFBF5] border border-[#EAE0CC]"><PlusIcon /></IconButton>
                </Flex>
                <Flex align="center" gap="1">
                  <Text size="1" style={{ width: '52px' }}>Gramos</Text>
                  <IconButton size="1" variant="outline" onClick={() => handleQuantityChange('grams', -1)} className="bg-[#FFFBF5] border border-[#EAE0CC]"><MinusIcon /></IconButton>
                  <TextField.Root
                    size="1"
                    type="number"
                    className="bg-[#FFFBF5] border border-[#EAE0CC]"
                    value={String(quantityGrams)}
                     onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (/^\d+$/.test(value) && value.length <= 3)) {
                        setQuantityGrams(parseInt(value, 10) || 0);
                      }
                    }}
                    style={{ width: '37px', textAlign: 'center' }}
                    maxLength={3}
                  />
                  <IconButton size="1" variant="outline" onClick={() => handleQuantityChange('grams', 1)} className="bg-[#FFFBF5] border border-[#EAE0CC]"><PlusIcon /></IconButton>
                </Flex>
              </>
            ) : (
              <Flex align="center" gap="1" >
                <Text size="1" style={{ width: '52px' }}>Unidades</Text>
                <IconButton size="1" variant="outline" onClick={() => handleQuantityChange('units', -1)} className="bg-[#FFFBF5] border border-[#EAE0CC]"><MinusIcon /></IconButton>
                <TextField.Root
                  size="1"
                  type="number"
                  className="bg-[#FFFBF5] border border-[#EAE0CC]"
                  value={String(quantityUnits)}
                   onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (/^\d+$/.test(value) && value.length <= 3)) {
                        setQuantityUnits(parseInt(value, 10) || 0);
                      }
                    }}
                  style={{ width: '40px', textAlign: 'center' }}
                  maxLength={3}
                 />
                <IconButton size="1" variant="outline" onClick={() => handleQuantityChange('units', 1)} className="bg-[#FFFBF5] border border-[#EAE0CC]"><PlusIcon /></IconButton>
              </Flex>
            )}
          </Flex>
        </Flex>

        {/* Right Column: Price + Button */}
        <Flex direction="column" align="end" gap="1" justify="between" style={{ alignSelf: 'stretch' }}>
           {/* Conditionally display price unit */}
           <Text size="2" weight="medium" align="right">
            ${product.price.toLocaleString('es-AR')} {product.unit_type === 'kg' ? 'kg' : 'c/u'} {/* Use snake_case */}
          </Text>
          {/* Display total price if greater than 0 */}
          {totalPrice > 0 && (
            <Text size="2" weight="bold" color="green" align="right"> {/* Increased size and added color */}
              ${totalPrice.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          )}
          {/* Conditionally render the remove text */}
          {isInCart && (
            <Text
              size="1"
              // Removed invalid color prop
              onClick={handleRemoveFromCart}
              style={{ color: '#eb7c80', cursor: 'pointer', textDecoration: 'underline', marginBottom: 'var(--space-1)' }} // Moved color to style prop
              align="right"
            >
              Quitar
            </Text>
          )}
          {/* Add conditional color prop */}
          <Button
            size="2"
            variant="solid"
            // Apply classes conditionally based on state, adding the animation class
            className={clsx('btn-animated',  { // Added 'btn-animated'
              'button-comprar': !isInCart, // Default orange state
              'button-modificar': isInCart && isModified, // Blue state
              'button-comprado': isInCart && !isModified, // Green state
            })}
             onClick={handleAddToCart}
             // mt="auto" // Removed to test visibility
           >
             {isInCart ? (isModified ? 'Modificar' : 'Comprado') : 'Comprar'}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
