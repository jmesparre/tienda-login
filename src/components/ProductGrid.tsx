import { useState, useEffect, useCallback } from 'react'; // Import hooks, add useCallback
import { useInView } from 'react-intersection-observer'; // Import useInView
import { Grid, Text, Flex, Spinner } from '@radix-ui/themes'; // Add Text, Flex, Spinner
import ProductCard from './ProductCard';
import { supabase } from '@/lib/supabaseClient'; // Import supabase client

import { Product as ProductType } from '@/lib/categories'; // Import the shared Product type

// Removed local Product interface definition as ProductType should be sufficient

interface ProductGridProps {
  selectedCategory: string;
  selectedSubcategory: string;
  searchTerm: string;
  sortOption: string;
}

const PRODUCTS_PER_PAGE = 24; // Define how many products to load per page

export default function ProductGrid({ selectedCategory, selectedSubcategory, searchTerm, sortOption }: ProductGridProps) {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true); // Initial loading state
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Loading more state
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  // Removed unused totalProducts state
  const [hasMore, setHasMore] = useState(true); // Track if more products are available

  const { ref, inView } = useInView({
    threshold: 0, // Trigger as soon as the element enters the viewport
    triggerOnce: false // Keep observing
  });

  // Define fetchProducts using useCallback to memoize the function
  const fetchProducts = useCallback(async (page: number, loadMore = false) => {
    // Prevent fetching if already loading more or if there are no more products
    if (loadMore && (isLoadingMore || !hasMore)) {
      return;
    }

    // Set loading states
    if (!loadMore) {
      setLoading(true); // Initial load
      setProducts([]); // Clear products for new filter/sort
      setCurrentPage(1); // Reset page
      setHasMore(true); // Assume more products are available
    } else {
      setIsLoadingMore(true); // Loading subsequent pages
    }
    setError(null); // Clear previous errors

    try {
      // Start building the Supabase query
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' }) // Select all columns and get the total count
        .eq('is_paused', false); // Exclude paused products

      // Apply category filter if not 'Todo'
      if (selectedCategory !== 'Todo') {
        query = query.eq('category', selectedCategory);
      }

      // Apply subcategory filter if not 'Todo' and a category is selected
      if (selectedCategory !== 'Todo' && selectedSubcategory !== 'Todo') {
        query = query.eq('subcategory', selectedSubcategory);
      }

      // Apply search term filter (case-insensitive)
      // If searchTerm exists, it might override or combine with category filters based on desired UX
      // Here, we combine: search within the selected category/subcategory if they are set.
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      // Define sorting logic based on sortOption
      const orderOptions: { column: string; ascending: boolean; nullsFirst?: boolean }[] = [];
      switch (sortOption) {
        case 'alfabetico':
          orderOptions.push({ column: 'name', ascending: true });
          break;
        case 'menor-precio':
          // Sorting by calculated price (COALESCE) directly in Supabase JS client is tricky.
          // We'll sort client-side after fetching for price/offer options.
          // Fetch ordered by name as a default for consistency before client-sort.
          orderOptions.push({ column: 'name', ascending: true });
          break;
        case 'mayor-precio':
          orderOptions.push({ column: 'name', ascending: true }); // Fetch ordered by name
          break;
        case 'ofertas':
          // Prioritize products with promotion_price (non-null first), then sort by name
          orderOptions.push({ column: 'promotion_price', ascending: false, nullsFirst: false });
          orderOptions.push({ column: 'name', ascending: true });
          break;
        default:
          orderOptions.push({ column: 'name', ascending: true }); // Default sort
      }

      // Apply the determined order options to the query
      orderOptions.forEach(opt => {
        query = query.order(opt.column, { ascending: opt.ascending, nullsFirst: opt.nullsFirst });
      });

      // Apply pagination using range based on current page and products per page
      const startIndex = (page - 1) * PRODUCTS_PER_PAGE;
      const endIndex = startIndex + PRODUCTS_PER_PAGE - 1;
      query = query.range(startIndex, endIndex);

      // Execute the query
      const { data, error: dbError, count } = await query;

      // Handle potential database errors
      if (dbError) {
        throw dbError;
      }

      // Map the fetched data to the ProductType interface
      const mappedData = data?.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        subcategory: p.subcategory,
        image_url: p.image_url,
        stock: p.stock,
        created_at: p.created_at,
        is_paused: p.is_paused,
        unit_type: p.unit_type,
        promotion_price: p.promotion_price,
      } as ProductType)) || [];

      // Apply client-side sorting for price and offer options due to Supabase limitations
      if (sortOption === 'menor-precio' || sortOption === 'mayor-precio') {
        mappedData.sort((a, b) => {
          const priceA = a.promotion_price ?? a.price; // Use promotion price if available
          const priceB = b.promotion_price ?? b.price;
          return sortOption === 'menor-precio' ? priceA - priceB : priceB - priceA;
        });
      } else if (sortOption === 'ofertas') {
        // Refine 'ofertas' sort client-side to ensure correct secondary sorting
        mappedData.sort((a, b) => {
          const hasOfferA = a.promotion_price != null && a.promotion_price > 0;
          const hasOfferB = b.promotion_price != null && b.promotion_price > 0;
          if (hasOfferA && !hasOfferB) return -1; // Offer A comes first
          if (!hasOfferA && hasOfferB) return 1;  // Offer B comes first
          return a.name.localeCompare(b.name); // Otherwise, sort alphabetically
        });
      }

      // Update the products state
      setProducts(prevProducts => loadMore ? [...prevProducts, ...mappedData] : mappedData);
      // Update total products count - Removed setTotalProducts as it's unused
      // Update hasMore state based on whether the total count exceeds the currently loaded items
      setHasMore((count ?? 0) > page * PRODUCTS_PER_PAGE);
      // Update current page state if loading more
      if (loadMore) {
        setCurrentPage(page);
      }

    } catch (err: unknown) {
      // Handle errors during fetch
      console.error("Error fetching products:", err);
      setError("Error al cargar los productos. Intente de nuevo.");
      setProducts([]); // Clear products on error
      // Removed setTotalProducts(0) as it's unused
      setHasMore(false);
    } finally {
      // Reset loading states regardless of success or error
      setLoading(false);
      setIsLoadingMore(false);
    }
  // Dependencies for useCallback: re-create fetchProducts if any of these change
  }, [selectedCategory, selectedSubcategory, searchTerm, sortOption, isLoadingMore, hasMore]);

  // Effect to fetch initial products (page 1) when filters or sort option change
  useEffect(() => {
    fetchProducts(1, false); // Call fetchProducts for page 1, not loading more
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedSubcategory, searchTerm, sortOption]); // Rerun only when these change

  // Effect to fetch more products when the 'inView' element becomes visible
  useEffect(() => {
    // Check if the observer is in view, if there are more products, and if not currently loading
    if (inView && hasMore && !isLoadingMore && !loading) {
      const nextPage = currentPage + 1;
      fetchProducts(nextPage, true); // Fetch the next page and append results
    }
  // Removed unused eslint-disable directive
  }, [inView, hasMore, isLoadingMore, loading, currentPage, fetchProducts]); // Dependencies for this effect


  // Render loading spinner on initial load (page 1)
  if (loading && currentPage === 1) {
    return <Flex justify="center" p="4"><Spinner size="3" /><Text className='pt-8 ml-2'>Cargando productos...</Text></Flex>;
  }

  // Render error message if an error occurred
  if (error) {
    return <Flex justify="center" p="4"><Text color="red">{error}</Text></Flex>;
  }

  // Render message if no products match the filters after loading is complete
  if (!loading && products.length === 0) {
      return <Flex justify="center" p="4"><Text className='pt-8'>No se encontraron productos que coincidan con los filtros.</Text></Flex>;
  }

  // Render the product grid and the observer element
  return (
    <>
      <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="3" width="auto">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Grid>
      {/* Element to observe for infinite scroll trigger */}
      <Flex ref={ref} justify="center" align="center" p="9" style={{ minHeight: '50px' }}>
        {/* Show spinner when loading more products */}
        {isLoadingMore && <Spinner size="3" />}
        {/* Show message when there are no more products to load */}
        {!hasMore && products.length > 0 && <Text>...</Text>}
      </Flex>
    </>
  );
}
