  import { Box, Flex, Text, TextField } from '@radix-ui/themes';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import type { Dispatch, SetStateAction } from 'react'; // Import types
import { useCart } from '@/context/CartContext'; // Import useCart
import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
  searchTerm: string;
  onSearchTermChange: Dispatch<SetStateAction<string>>;
  onResetFilters: () => void; // Add prop for resetting filters
}

export default function Header({ searchTerm, onSearchTermChange, onResetFilters }: HeaderProps) {
  const { getCartTotalItems, openCart } = useCart(); // Get cart count and open function
  const totalItems = getCartTotalItems(); // Calculate total items

  return (
    <Flex align="center" justify="between" gap="4" p="4"> {/* Removed borderBottom style */}
      {/* Logo Placeholder - Add onClick handler */}
      <Box onClick={() => {
        onSearchTermChange(''); // Clear search term
        onResetFilters(); // Reset category filter
      }}>
        <Image
          src="/logo.png"
          alt="Logo La Vieja Estación"
          width={140}
          height={140}
          style={{ display: 'inline-block', cursor: 'pointer' }} //Para que el width y height funcionen correctamente.  También puede ser flex.
        />
      </Box>

      {/* Search Bar */}
      <Box flexGrow="1" maxWidth="400px">
        <TextField.Root
          placeholder="Buscar…"
          size="3"
          value={searchTerm}
          className="bg-[#FFFBF5] border border-[#EAE0CC]" // Added background and border
          onChange={(e) => onSearchTermChange(e.target.value)} // Update state on change
        >
          <TextField.Slot>
            <MagnifyingGlassIcon height="16" width="16" />
          </TextField.Slot>
        </TextField.Root>
      </Box>

      {/* Cart Section - Make clickable */}
      <Box onClick={openCart} style={{ cursor: 'pointer' }}> {/* Add onClick and pointer */}
        <Flex align="center" gap="2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" ><path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="M4.5 15.5h15"/><path d="m5 11 4-7"/><path d="m9 11 1 9"/></svg>
          <Text>Canasto ({totalItems})</Text> {/* Display dynamic count */}
        </Flex>
      </Box>
    </Flex>
  );
}
