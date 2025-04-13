"use client"; // Mark as a Client Component for state management

import { useState } from 'react';
import { Flex } from '@radix-ui/themes';
import Header from '@/components/Header'; // Import the Header component
import CategoryFilters from '@/components/CategoryFilters'; // Import CategoryFilters
import ProductGrid from '@/components/ProductGrid'; // Import ProductGrid

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todo'); // Default to 'Todo'
  const [searchTerm, setSearchTerm] = useState<string>(''); // Add state for search term

  // Function to reset filters
  const handleResetFilters = () => {
    setSelectedCategory('Todo');
  };

  return (
    <main>
      <Header
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onResetFilters={handleResetFilters} // Pass the reset function
      /> {/* Pass search state and reset handler */}
      <CategoryFilters
        onSelectCategory={setSelectedCategory}
      /> {/* Pass category state handler */}
      <Flex direction="column" gap="4" p="4">
        <ProductGrid selectedCategory={selectedCategory} searchTerm={searchTerm} /> {/* Pass selected category and search term */}
      </Flex>
    </main>
  );
}
