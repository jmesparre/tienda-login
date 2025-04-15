import { useState, useEffect } from 'react'; // Import hooks
import { Grid, Text, Flex } from '@radix-ui/themes'; // Add Text, Flex for loading/error
import ProductCard from './ProductCard';
import { supabase } from '@/lib/supabaseClient'; // Import supabase client

import { Product as ProductType } from '@/lib/categories'; // Import the shared Product type

// Removed local Product interface definition as ProductType should be sufficient

interface ProductGridProps {
  selectedCategory: string;
  selectedSubcategory: string; // Add selectedSubcategory prop
  searchTerm: string; // Add searchTerm prop
}

export default function ProductGrid({ selectedCategory, selectedSubcategory, searchTerm }: ProductGridProps) { // Add selectedSubcategory
  const [products, setProducts] = useState<ProductType[]>([]); // Use ProductType
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

  // Apply search filter first (case-insensitive)
  const searchedProducts = searchTerm
    ? products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  // Then, apply category filter
  const categoryFilteredProducts = selectedCategory === 'Todo'
    ? searchedProducts
    : searchedProducts.filter(product => product.category === selectedCategory);

  // Finally, apply subcategory filter
  const filteredProducts = selectedSubcategory === 'Todo' || !selectedSubcategory
    ? categoryFilteredProducts // If 'Todo' or no subcategory selected, show all from category
    : categoryFilteredProducts.filter(product => product.subcategory === selectedSubcategory);

  if (loading) {
    return <Flex justify="center" p="4"><Text className='pt-8'>Cargando productos...</Text></Flex>;
  }

  if (error) {
    return <Flex justify="center" p="4"><Text color="red">{error}</Text></Flex>;
  }

  if (filteredProducts.length === 0) {
      return <Flex justify="center" p="4"><Text className='pt-8'>No se encontraron productos.</Text></Flex>;
  }

  return (
    <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="3" width="auto">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} /> // Pass the product directly
      ))}
    </Grid>
  );
}
