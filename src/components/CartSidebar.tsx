"use client";

import { Box, Flex, Text, Button, IconButton, ScrollArea, Heading, Separator } from '@radix-ui/themes';
import { Cross1Icon, TrashIcon } from '@radix-ui/react-icons';
import { useCart } from '@/context/CartContext';

export default function CartSidebar() {
  // Add clearCart to the destructured hook
  const { cartItems, isCartOpen, closeCart, removeFromCart, getCartTotalPrice, clearCart } = useCart();

  if (!isCartOpen) {
    return null; // Don't render if closed
  }

  const totalPrice = getCartTotalPrice();

  // Basic WhatsApp message generation (can be improved)
  const generateWhatsAppMessage = () => {
    let message = "Hola! Quisiera hacer el siguiente pedido:\n\n";
    cartItems.forEach(item => {
      message += `- ${item.name}: `;
      if (item.unitType === 'kg') {
        message += `${item.quantityKg ?? 0} kg ${item.quantityGrams ?? 0} gr\n`;
      } else {
        message += `${item.quantityUnits ?? 0} unidades\n`;
      }
    });
    message += `\nTotal aproximado: $${totalPrice.toLocaleString('es-AR')}`;
    return encodeURIComponent(message);
  };

  // Replace with actual WhatsApp number
  const whatsappNumber = "5491132750873"; // Updated number
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${generateWhatsAppMessage()}`;


  return (
    // Overlay container
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0, // Cover entire screen
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
        zIndex: 999, // Below sidebar, above content
        display: 'flex',
        justifyContent: 'flex-end', // Push sidebar to the right
      }}
      onClick={closeCart} // Close when overlay is clicked
    >
      {/* Actual Sidebar content container */}
      <Box
        style={{
          // Keep original sidebar styles
          width: '350px',
          height: '100%', // Ensure full height within overlay flex container
          backgroundColor: '#fff6d6ff',
          boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
          zIndex: 1000, // Above overlay
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid var(--gray-a6)'
        }}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside sidebar from closing it
      >
        {/* Sidebar Header */}
        <Flex justify="between" align="center" p="4" style={{ borderBottom: '1px solid var(--gray-a6)', flexShrink: 0 }}>
          <Heading size="4">Canasto de Compras</Heading>
          {/* Removed stray style properties from here */}
          <IconButton variant="ghost" onClick={closeCart}>
            <Cross1Icon width="18" height="18" />
          </IconButton>
        </Flex>
        {/* Add Empty Cart Button below header */}
        <Flex p="2" justify="end">
            <Button
                size="1"
                variant="soft"
                color="gray"
                onClick={clearCart}
                disabled={cartItems.length === 0} // Disable if cart is empty
            >
                <TrashIcon width="14" height="14" />
                Vaciar canasto
            </Button>
        </Flex>

      {/* Cart Items Area */}
      <ScrollArea style={{ flexGrow: 1 }}> {/* Allow content to scroll */}
        <Box p="4">
          {cartItems.length === 0 ? (
            <Text>No hay productos en el carrito.</Text>
          ) : (
            <Flex direction="column" gap="3">
              {cartItems.map((item) => {
                // Calculate subtotal for the item
                let itemSubtotal = 0;
                if (item.unitType === 'kg') {
                  const totalKg = (item.quantityKg ?? 0) + (item.quantityGrams ?? 0) / 1000;
                  itemSubtotal = totalKg * item.price;
                } else {
                  itemSubtotal = (item.quantityUnits ?? 0) * item.price;
                }

                return (
                  <Flex key={item.id} gap="3" align="center">
                    {/* Basic item info */}
                    <Box flexGrow="1">
                    <Text size="2" weight="bold">{item.name}</Text>
                    <Text size="1" color="gray" as="div">
                      {item.unitType === 'kg'
                        ? `${item.quantityKg ?? 0} kg ${item.quantityGrams ?? 0} gr`
                          : `${item.quantityUnits ?? 0} u.`}
                      </Text>
                    </Box>
                    {/* Display Item Subtotal */}
                    <Text size="2" weight="medium" style={{ minWidth: '60px', textAlign: 'right' }}>
                      ${itemSubtotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                    {/* Remove button */}
                    <IconButton size="1" color="red" variant="soft" onClick={() => removeFromCart(item.id)}>
                      <TrashIcon />
                    </IconButton>
                  </Flex>
                );
              })}
            </Flex>
          )}
        </Box>
      </ScrollArea>

      {/* Sidebar Footer */}
      <Box p="4" style={{ borderTop: '1px solid var(--gray-a6)', flexShrink: 0 }}>
         <Separator my="3" size="4" />
         <Flex justify="between" align="center" mb="3">
            <Text weight="bold">Total:</Text>
            <Text weight="bold">${totalPrice.toLocaleString('es-AR')}</Text>
         </Flex>
        <Button
            size="3"
            style={{ width: '100%', backgroundColor: 'var(--green-9)', color: 'white' }}
            disabled={cartItems.length === 0}
            onClick={() => window.open(whatsappUrl, '_blank')} // Open WhatsApp link
        >
            Enviar por WhatsApp
        </Button>
      </Box>
     </Box> {/* End of actual sidebar content Box */}
    </Box> // End of overlay Box
  );
}
