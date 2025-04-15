"use client"; // Mark as a Client Component for state management

import { useState } from 'react';
import { Flex } from '@radix-ui/themes';
import Header from '@/components/Header'; // Import the Header component
import CategoryFilters from '@/components/CategoryFilters'; // Import CategoryFilters
import ProductGrid from '@/components/ProductGrid'; // Import ProductGrid

import { Dispatch, SetStateAction } from 'react'; // Import Dispatch and SetStateAction

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todo'); // Default to 'Todo'
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(''); // Add state for subcategory, default empty
  const [searchTerm, setSearchTerm] = useState<string>(''); // Add state for search term

  // Function to reset filters
  const handleResetFilters = () => {
    setSelectedCategory('Todo');
    setSelectedSubcategory(''); // Reset subcategory as well
  };

  return (
    <main>
      <Header
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onResetFilters={handleResetFilters} // Pass the reset function
      /> {/* Pass search state and reset handler */}
      <CategoryFilters
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory as Dispatch<SetStateAction<string>>} // Cast for compatibility if needed, or adjust CategoryFilters prop type
        selectedSubcategory={selectedSubcategory}
        onSelectSubcategory={setSelectedSubcategory}
      /> {/* Pass category and subcategory state handlers */}
      <Flex direction="column" gap="4" p="4">
        <ProductGrid selectedCategory={selectedCategory} selectedSubcategory={selectedSubcategory} searchTerm={searchTerm} /> {/* Pass selected category, subcategory and search term */}
      </Flex>
    </main>
  );
}
