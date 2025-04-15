import { Flex, Button } from '@radix-ui/themes';
import type { Dispatch, SetStateAction } from 'react';
import clsx from 'clsx'; // Utility for conditionally joining class names
import { mainCategories, getSubcategories } from '@/lib/categories'; // Import categories data

interface CategoryFiltersProps {
  selectedCategory: string;
  selectedSubcategory: string; // Add prop for selected subcategory
  onSelectCategory: (category: string) => void; // Update prop type
  onSelectSubcategory: Dispatch<SetStateAction<string>>; // Add prop for subcategory selection
}

export default function CategoryFilters({
  selectedCategory,
  selectedSubcategory,
  onSelectCategory,
  onSelectSubcategory
}: CategoryFiltersProps) {
  const subcategories = getSubcategories(selectedCategory); // Get subcategories for the selected main category

  return (
    <Flex direction="column" px="4" py="3" gap="3"> {/* Main container */}
      {/* Main Category Filters */}
      <Flex wrap="wrap" gap="3">
        {mainCategories.map((category) => {
          const isActive = selectedCategory === category;

          return (
          <Button
            key={category}
            variant="ghost"
            size="3"
            color="gray"
            onClick={() => onSelectCategory(category)}
            className={clsx(
              'transition-colors duration-150 pointer',
              isActive ? 'active-category-filter' : '' // Apply active style
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

      {/* Subcategory Filters - Render only if subcategories exist */}
      {subcategories.length > 0 && (
        <Flex wrap="wrap" gap="2" pl="2"> {/* Indent subcategories slightly */}
          {subcategories.map((subcategory) => {
            const isSubActive = selectedSubcategory === subcategory;
            return (
              <Button
                key={subcategory}
                variant="soft" // Use soft variant for subcategories
                size="2" // Slightly smaller size
                color="gray"
                onClick={() => onSelectSubcategory(subcategory)}
                className={clsx(
                  'transition-colors duration-150 pointer',
                  isSubActive ? 'active-subcategory-filter' : '' // Style for active subcategory
                )}
                style={
                  isSubActive
                    ? { fontWeight: 'bold', backgroundColor: 'var(--gray-a5)' } // Example active style
                    : {}
                }
              >
                {subcategory}
              </Button>
            );
          })}
        </Flex>
      )}
    </Flex>
  );
}
