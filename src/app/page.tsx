"use client"; // Mark as a Client Component for state management

import { useState, useCallback } from 'react'; // Import useCallback
import { Flex, Select, Text } from '@radix-ui/themes'; // Import Select and Text
import Header from '@/components/Header'; // Import the Header component
import CategoryFilters from '@/components/CategoryFilters'; // Import CategoryFilters
import ProductGrid from '@/components/ProductGrid'; // Import ProductGrid
import { useCart } from '@/context/CartContext'; // Import useCart

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todo');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('Todo');
  // const [searchTerm, setSearchTerm] = useState<string>(''); // Remove local state
  const [sortOption, setSortOption] = useState<string>('alfabetico'); // Add state for sort option
  const { headerSearchTerm, setHeaderSearchTerm } = useCart(); // Get search term from context

  // Function to reset filters
  const handleResetFilters = useCallback(() => {
    setSelectedCategory('Todo');
    setSelectedSubcategory('Todo'); // Reset subcategory as well
    setHeaderSearchTerm(''); // Reset search term using context setter
  }, [setHeaderSearchTerm]); // Add setter to dependency array

  // Handler for selecting a category, resets subcategory and clears search
  const handleSelectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory('Todo'); // Reset subcategory when main category changes
    setHeaderSearchTerm(''); // Clear search term
  }, [setHeaderSearchTerm]); // Add setter to dependency array

  // Handler for selecting a subcategory, clears search
  const handleSelectSubcategory = useCallback((subcategory: string) => {
    setSelectedSubcategory(subcategory);
    setHeaderSearchTerm(''); // Clear search term
  }, [setHeaderSearchTerm]); // Add setter to dependency array

  return (
    <main>
      <Header
        // Remove searchTerm and onSearchTermChange props
        onResetFilters={handleResetFilters} // Pass the reset function
      /> {/* Pass only reset handler */}
      <CategoryFilters
        selectedCategory={selectedCategory} // Pass the selected category state
        selectedSubcategory={selectedSubcategory} // Pass selected subcategory state
        onSelectCategory={handleSelectCategory} // Pass the updated category handler
        onSelectSubcategory={handleSelectSubcategory} // Pass the new subcategory handler
      />
      <Flex direction="column" gap="4" p="4">
        {/* Add Sort Dropdown */}
        <Flex justify="end" align="center" gap="2" className='filtros-productos' >
           <Text size="2" weight="medium">Ordenar por:</Text>
           <Select.Root value={sortOption} onValueChange={setSortOption}>
            <Select.Trigger placeholder="Seleccionar orden..." />
            <Select.Content className='bg-sort'>
              <Select.Item value="alfabetico">Alfabético (A-Z)</Select.Item>
              <Select.Item value="menor-precio">Menor Precio</Select.Item>
              <Select.Item value="mayor-precio">Mayor Precio</Select.Item>
              <Select.Item value="ofertas">Ofertas</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>

        <ProductGrid
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          searchTerm={headerSearchTerm} // Pass context search term
          sortOption={sortOption} // Pass sortOption state
        />
      </Flex>
    </main>
  );
}
