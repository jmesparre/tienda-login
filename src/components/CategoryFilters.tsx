import { Flex, Button } from '@radix-ui/themes';
import type { Dispatch, SetStateAction } from 'react';
import clsx from 'clsx'; // Utility for conditionally joining class names
// Removed unused categoryColorMap import

const categories = [
  'Todo', 'Frutas', 'Verdura', 'Carniceria',
  'Fiambreria', 'Almacen', 'Limpieza', 'Bebidas'
];

// Removed local categoryColorMap definition

interface CategoryFiltersProps {
  // Removed unused selectedCategory prop
  onSelectCategory: Dispatch<SetStateAction<string>>;
}

export default function CategoryFilters({ onSelectCategory }: CategoryFiltersProps) { // Removed selectedCategory from destructuring
  return (
    // Remove the bottom border from the Flex container
    <Flex wrap="wrap" gap="3" px="4" py="3"> {/* Adjusted padding/gap */}
      {categories.map((category) => {
        // Removed unused isActive and borderColorClass variables

        return (
          <Button
            key={category}
            variant="ghost" // Remove background
            size="2"
            onClick={() => onSelectCategory(category)}
            className={clsx(
              // Removed border classes 'pb-1 border-b-2 border-[#D9534F]' and 'border-transparent'
              'transition-colors duration-150' // Kept transition for potential future hover effects
            )}
            // Style attribute was already removed
          >
            {category}
          </Button>
        );
      })}
    </Flex>
  );
}
