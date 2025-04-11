import { Flex, Button } from '@radix-ui/themes';
import type { Dispatch, SetStateAction } from 'react';
import clsx from 'clsx'; // Utility for conditionally joining class names
import { categoryColorMap } from '@/lib/utils'; // Import the centralized map

const categories = [
  'Todo', 'Frutas', 'Verdura', 'Carniceria',
  'Fiambreria', 'Almacen', 'Limpieza', 'Bebidas'
];

// Removed local categoryColorMap definition

interface CategoryFiltersProps {
  selectedCategory: string;
  onSelectCategory: Dispatch<SetStateAction<string>>;
}

export default function CategoryFilters({ selectedCategory, onSelectCategory }: CategoryFiltersProps) {
  return (
    // Remove the bottom border from the Flex container
    <Flex wrap="wrap" gap="3" px="4" py="3"> {/* Adjusted padding/gap */}
      {categories.map((category) => {
        const isActive = selectedCategory === category;
        const borderColorClass = categoryColorMap[category] || 'border-transparent'; // Fallback to transparent

        return (
          <Button
            key={category}
            variant="ghost" // Remove background
            size="2"
            onClick={() => onSelectCategory(category)}
            className={clsx(
              'pb-1 border-b-2 transition-colors duration-150', // Base styles: padding-bottom, border, transition
              isActive
                ? borderColorClass // Active color border
                : 'border-transparent hover:' + borderColorClass // Transparent border normally, colored on hover
            )}
            style={{
              // Ensure text color remains consistent or changes as desired
              color: isActive ? `var(--${categoryColorMap[category]?.split('-')[1]}-9)` : 'var(--gray-11)', // Example: Use Radix color variable based on Tailwind class
              // Radix Button ghost variant might override hover text color, adjust if needed
            }}
          >
            {category}
          </Button>
        );
      })}
    </Flex>
  );
}
