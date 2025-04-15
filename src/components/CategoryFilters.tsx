import { Flex, Button } from '@radix-ui/themes';
import type { Dispatch, SetStateAction } from 'react';
import clsx from 'clsx';

// Define categories and their subcategories
const categoryData = {
  'Todo': [],
  'Frutas': [], // Add subcategories if needed
  'Verdura': [], // Add subcategories if needed
  'Carniceria': [], // Add subcategories if needed
  'Fiambreria': ['Todo', 'Queso', 'Jamon', 'Picada'],
  'Almacén': [], // Add subcategories if needed
  'Limpieza': [], // Add subcategories if needed
  'Bebidas': ['Todo', 'Aguas', 'Gaseosas', 'Energizantes', 'Vinos', 'Licores', 'Sodas', 'Cervezas']
};

const mainCategories = Object.keys(categoryData);

interface CategoryFiltersProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void; // Keep simplified type for this one as it works
  selectedSubcategory: string;
  onSelectSubcategory: Dispatch<SetStateAction<string>>; // Reverted to original type
}

export default function CategoryFilters({
  selectedCategory,
  onSelectCategory,
  selectedSubcategory,
  onSelectSubcategory
}: CategoryFiltersProps) {
  const subcategories = categoryData[selectedCategory as keyof typeof categoryData] || [];

  const handleCategorySelect = (category: string) => {
    onSelectCategory(category);
    // Reset subcategory when a new main category is selected
    const subcats = categoryData[category as keyof typeof categoryData] || []; // Ensure subcats is always an array
    let determinedSubcategory: string = ''; // Initialize with empty string

    if (Array.isArray(subcats)) {
        if (subcats.includes('Todo')) {
            determinedSubcategory = 'Todo';
        } else if (subcats.length > 0) {
            determinedSubcategory = subcats[0];
        }
    }
    // Pass the guaranteed string value, satisfying Dispatch<SetStateAction<string>>
    onSelectSubcategory(determinedSubcategory);
  };

  return (
    <div>
      {/* Main Category Filters */}
      <Flex wrap="wrap" gap="3" px="4" py="3">
        {mainCategories.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <Button
              key={category}
              variant="ghost"
              size="3"
              color="gray"
              onClick={() => handleCategorySelect(category)}
              className={clsx(
                'transition-colors duration-150 pointer',
                isActive ? 'active-category-filter' : ''
              )}
              style={
                isActive
                  ? { textDecoration: 'underline', textUnderlineOffset: '4px', border: 'none', backgroundColor: 'transparent' }
                  : { textDecoration: 'none', border: 'none', backgroundColor: 'transparent' }
              }
            >
              {category}
            </Button>
          );
        })}
      </Flex>

      {/* Subcategory Filters - Render only if a category other than 'Todo' is selected and has subcategories */}
      {selectedCategory !== 'Todo' && subcategories.length > 0 && (
        <Flex wrap="wrap" gap="3" px="4" pb="3" pt="1"> {/* Adjusted padding */}
          {subcategories.map((subcategory) => {
            const isActive = selectedSubcategory === subcategory;
            return (
              <Button
                key={subcategory}
                variant="ghost"
                size="2" // Slightly smaller size for subcategories
                color="gray"
                onClick={() => onSelectSubcategory(subcategory)} // This call should be fine now
                className={clsx(
                  'transition-colors duration-150 pointer',
                  isActive ? 'active-category-filter' : '' // Reuse the same active style or create a new one
                )}
                style={
                  isActive
                    ? { textDecoration: 'underline', textUnderlineOffset: '4px', border: 'none', backgroundColor: 'transparent' }
                    : { textDecoration: 'none', border: 'none', backgroundColor: 'transparent' }
                }
              >
                {subcategory}
              </Button>
            );
          })}
        </Flex>
      )}
    </div>
  );
}
