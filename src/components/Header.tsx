  import { Box, Flex, Text, TextField } from '@radix-ui/themes';
import { MagnifyingGlassIcon, BackpackIcon } from '@radix-ui/react-icons';
import type { Dispatch, SetStateAction } from 'react'; // Import types
import { useCart } from '@/context/CartContext'; // Import useCart

interface HeaderProps {
  searchTerm: string;
  onSearchTermChange: Dispatch<SetStateAction<string>>;
}

export default function Header({ searchTerm, onSearchTermChange }: HeaderProps) {
  const { getCartTotalItems, openCart } = useCart(); // Get cart count and open function
  const totalItems = getCartTotalItems(); // Calculate total items

  return (
    <Flex align="center" justify="between" gap="4" p="4" style={{ borderBottom: '1px solid var(--gray-a6)' }}>
      {/* Logo Placeholder */}
      <Box>
        <Text size="5" weight="bold">La Vieja Estacion</Text>
      </Box>

      {/* Search Bar */}
      <Box flexGrow="1" maxWidth="400px">
        <TextField.Root
          placeholder="Buscar productos…"
          size="3"
          value={searchTerm}
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
          <BackpackIcon height="20" width="20" />
          <Text>Carrito ({totalItems})</Text> {/* Display dynamic count */}
        </Flex>
      </Box>
    </Flex>
  );
}
