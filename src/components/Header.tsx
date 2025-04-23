  import { Box, Flex, Text, TextField, IconButton } from '@radix-ui/themes'; // Added IconButton
import { MagnifyingGlassIcon, Cross2Icon } from '@radix-ui/react-icons'; // Added Cross2Icon
import { useCart } from '@/context/CartContext'; // Import useCart
import Image from 'next/image';
import clsx from 'clsx'; // Import clsx for conditional classes

interface HeaderProps {
  // Remove searchTerm and onSearchTermChange
  onResetFilters: () => void; // Keep prop for resetting filters
}

export default function Header({ onResetFilters }: HeaderProps) { // Remove unused props
  // Add isCartAnimating to destructured props from useCart
  const { getCartTotalItems, openCart, headerSearchTerm, setHeaderSearchTerm, isCartAnimating } = useCart();
  const totalItems = getCartTotalItems(); // Calculate total items

  return (
    <Flex align="center" justify="between" gap="4" p="4"> {/* Removed borderBottom style */}
      {/* Logo Placeholder - Add onClick handler */}
      <Box onClick={() => {
        setHeaderSearchTerm(''); // Clear search term using context setter
        onResetFilters(); // Reset category filter
      }}>
        <Image
          src="/logo.png"
          alt="tienda-sanluis"
          width={173}
          height={63}
          priority // Add priority prop for LCP optimization
          style={{ display: 'inline-block', cursor: 'pointer', height: 'auto' }} // Add height: 'auto' to maintain aspect ratio
        />
      </Box>

      {/* Search Bar */}
      <Box flexGrow="1" maxWidth="400px">
        <TextField.Root
          placeholder="Buscar…"
          size="3"
          value={headerSearchTerm} // Use context state for value
          className="bg-[#FFFBF5] border border-[#EAE0CC]" // Added background and border
          onChange={(e) => setHeaderSearchTerm(e.target.value)} // Update context state on change
        >
           <TextField.Slot>
             <MagnifyingGlassIcon height="16" width="16" />
           </TextField.Slot>
           {/* Add clear button slot */}
           {headerSearchTerm && ( // Check context state
              <TextField.Slot>
                  <IconButton size="1" variant="ghost" color="gray" onClick={() => setHeaderSearchTerm('')} style={{ cursor: 'pointer' }}> {/* Use context setter */}
                      <Cross2Icon height="14" width="14" />
                  </IconButton>
              </TextField.Slot>
           )}
         </TextField.Root>
       </Box>

      {/* Cart Section - Make clickable */}
      {/* Added className="cart-section" and conditional 'cart-animating' class */}
      <Box
        onClick={openCart}
        style={{ cursor: 'pointer' }}
        className={clsx('cart-section', { 'cart-animating': isCartAnimating })} // Use clsx
      >
        <Flex align="center" gap="2">
          {/* Added span container for hover effect */}
          <span className="cart-icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              {/* Default state paths */}
              <g className="cart-icon-default">
                <path d="m15 11-1 9"/>
                <path d="m19 11-4-7"/>
                <path d="M2 11h20"/>
                <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/>
                <path d="M4.5 15.5h15"/>
                <path d="m5 11 4-7"/>
                <path d="m9 11 1 9"/>
              </g>
              {/* Hover state paths */}
              <g className="cart-icon-hover">
                <path d="m15 11-1 9"/>
                <path d="m19 11-0-7"/> {/* Changed path */}
                <path d="M2 11h20"/>
                <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/>
                <path d="M4.5 15.5h15"/>
                <path d="m5 11 0-7"/>  {/* Changed path */}
                <path d="m9 11 1 9"/>
              </g>
            </svg>
          </span>
          <Text>Canasto ({totalItems})</Text> {/* Display dynamic count */}
        </Flex>
      </Box>
    </Flex>
  );
}
