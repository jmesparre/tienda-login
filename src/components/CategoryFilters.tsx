import { Flex, Button } from '@radix-ui/themes';
import clsx from 'clsx'; // Utility for conditionally joining class names
import { mainCategories, getSubcategories } from '@/lib/categories'; // Import categories data

interface CategoryFiltersProps {
  selectedCategory: string;
  selectedSubcategory: string; // Add prop for selected subcategory
  onSelectCategory: (category: string) => void; // Update prop type
  onSelectSubcategory: (subcategory: string) => void; // Update prop type for subcategory selection
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
        <Flex wrap="wrap" gap="3"> {/* Indent subcategories slightly */}
          {subcategories.map((subcategory) => {
            const isSubActive = selectedSubcategory === subcategory;
            return (
              <Button
                key={subcategory}
                variant="ghost" // Use ghost variant like main categories
                size="3" // Use same size as main categories
                color="gray"
                onClick={() => onSelectSubcategory(subcategory)}
                className={clsx(
                  'transition-colors duration-150 pointer'
                  // Removed active-subcategory-filter class, using inline styles like main categories
                )}
                style={
                  isSubActive
                    ? { textDecoration: 'underline', textUnderlineOffset: '4px', border: 'none', backgroundColor: 'transparent' } // Active style like main categories
                    : { textDecoration: 'none', border: 'none', backgroundColor: 'transparent' } // Inactive style like main categories
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
