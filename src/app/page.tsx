"use client"; // Mark as a Client Component for state management

import { useState, useCallback } from 'react'; // Import useCallback
import { Flex } from '@radix-ui/themes';
import Header from '@/components/Header'; // Import the Header component
import CategoryFilters from '@/components/CategoryFilters'; // Import CategoryFilters
import ProductGrid from '@/components/ProductGrid'; // Import ProductGrid

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todo'); // Default to 'Todo'
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('Todo'); // Add state for subcategory
  const [searchTerm, setSearchTerm] = useState<string>(''); // Add state for search term

  // Function to reset filters
  const handleResetFilters = useCallback(() => {
    setSelectedCategory('Todo');
    setSelectedSubcategory('Todo'); // Reset subcategory as well
    setSearchTerm(''); // Optionally reset search term too
  }, []); // Use useCallback for stability

  // Handler for selecting a category, resets subcategory
  const handleSelectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory('Todo'); // Reset subcategory when main category changes
  }, []); // Use useCallback

  return (
    <main>
      <Header
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onResetFilters={handleResetFilters} // Pass the reset function
      /> {/* Pass search state and reset handler */}
      <CategoryFilters
        selectedCategory={selectedCategory} // Pass the selected category state
        selectedSubcategory={selectedSubcategory} // Pass selected subcategory state
        onSelectCategory={handleSelectCategory} // Pass the updated handler
        onSelectSubcategory={setSelectedSubcategory} // Pass the subcategory setter
      /> {/* Pass category and subcategory state handlers */}
      <Flex direction="column" gap="4" p="4">
        <ProductGrid
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory} // Pass selected subcategory
          searchTerm={searchTerm}
        /> {/* Pass selected category, subcategory and search term */}
      </Flex>
    </main>
  );
}
