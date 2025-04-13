import { useState, useEffect } from 'react'; // Import hooks
import { Grid, Text, Flex } from '@radix-ui/themes'; // Add Text, Flex for loading/error
import ProductCard from './ProductCard';
import { supabase } from '@/lib/supabaseClient'; // Import supabase client

// Define the structure of a product
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  imageUrl: string | null; // Allow null from DB
  unitType: 'kg' | 'unit'; // Add unit type
  promotionPrice?: number | null; // Add optional promotion price
}

// Removed placeholder product data

interface ProductGridProps {
  selectedCategory: string;
  searchTerm: string; // Add searchTerm prop
}

export default function ProductGrid({ selectedCategory, searchTerm }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
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

        // Map snake_case from DB to camelCase for the component
        const mappedData = data?.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          imageUrl: p.image_url, // Map image_url
          unitType: p.unit_type, // Map unit_type
          promotionPrice: p.promotion_price // Map promotion_price
        })) || [];

        setProducts(mappedData);
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
  const filteredProducts = selectedCategory === 'Todo'
    ? searchedProducts
    : searchedProducts.filter(product => product.category === selectedCategory);

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
        // Ensure the product passed to ProductCard matches its expected props
        <ProductCard key={product.id} product={{
            ...product,
            imageUrl: product.imageUrl || '/placeholder-image.jpg' // Provide fallback image
        }} />
      ))}
    </Grid>
  );
}
