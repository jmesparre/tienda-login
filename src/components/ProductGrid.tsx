import { useState, useEffect } from 'react'; // Import hooks
import { Grid, Text, Flex } from '@radix-ui/themes'; // Add Text, Flex for loading/error
import ProductCard from './ProductCard';
import { supabase } from '@/lib/supabaseClient'; // Import supabase client

import { Product as ProductType } from '@/lib/categories'; // Import the shared Product type

// Removed local Product interface definition as ProductType should be sufficient

interface ProductGridProps {
  selectedCategory: string;
  selectedSubcategory: string;
  searchTerm: string;
  sortOption: string; // Add sortOption prop
}

export default function ProductGrid({ selectedCategory, selectedSubcategory, searchTerm, sortOption }: ProductGridProps) {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from('products')
          .select('*'); // Fetch all columns

        if (dbError) {
          throw dbError;
        }

        // Map snake_case from DB to the ProductType interface fields
        const mappedData = data?.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description, // Map description
          price: p.price,
          category: p.category,
          subcategory: p.subcategory,
          image_url: p.image_url,
          stock: p.stock,
          created_at: p.created_at,
          // Map additional fields included in the updated ProductType
          is_paused: p.is_paused,
          unit_type: p.unit_type,
          promotion_price: p.promotion_price,
        } as ProductType )) || []; // Assert type

        // Filter out paused products using the mapped is_paused field
        const activeProducts = mappedData.filter(p => !p.is_paused);
        setProducts(activeProducts);
      } catch (err: unknown) { // Use unknown instead of any
        console.error("Error fetching products:", err);
        setError("Error al cargar los productos. Intente de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array means this runs once on mount

  // 1. Filter by Category and Subcategory on the original products list
  const categoryFilteredProducts = selectedCategory === 'Todo'
    ? products
    : products.filter(product => product.category === selectedCategory);

  const subcategoryFilteredProducts = selectedSubcategory === 'Todo' || !selectedSubcategory
    ? categoryFilteredProducts
    : categoryFilteredProducts.filter(product => product.subcategory === selectedSubcategory);

  // 2. Filter by Search Term independently on the original products list
  const searchedProducts = searchTerm
    ? products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []; // Use an empty array if no search term, to default to category filters

  // 3. Determine the final list: Use search results if searchTerm exists, otherwise use category/subcategory filters
  const productsToDisplay = searchTerm ? searchedProducts : subcategoryFilteredProducts;

  // 4. Apply sorting based on sortOption to the determined list
  const sortedProducts = [...productsToDisplay].sort((a, b) => {
    const priceA = a.promotion_price ?? a.price;
    const priceB = b.promotion_price ?? b.price;
    const hasOfferA = a.promotion_price != null && a.promotion_price > 0;
    const hasOfferB = b.promotion_price != null && b.promotion_price > 0;

    switch (sortOption) {
      case 'alfabetico':
        return a.name.localeCompare(b.name);
      case 'menor-precio':
        return priceA - priceB;
      case 'mayor-precio':
        return priceB - priceA;
      case 'ofertas':
        if (hasOfferA && !hasOfferB) return -1; // Offer A comes first
        if (!hasOfferA && hasOfferB) return 1;  // Offer B comes first
        // If both have offers or both don't, sort alphabetically (or by price, etc.)
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // No need to filter separately for 'ofertas' anymore, sorting handles prioritization
  const finalProducts = sortedProducts;


  if (loading) {
    return <Flex justify="center" p="4"><Text className='pt-8'>Cargando productos...</Text></Flex>;
  }

  if (error) {
    return <Flex justify="center" p="4"><Text color="red">{error}</Text></Flex>;
  }

  if (finalProducts.length === 0) {
      // Simplified message as 'ofertas' now shows all products if none have offers
      return <Flex justify="center" p="4"><Text className='pt-8'>No se encontraron productos.</Text></Flex>;
  }

  return (
    <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="3" width="auto">
      {finalProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Grid>
  );
}
