import { Grid } from '@radix-ui/themes';
import ProductCard from './ProductCard';

// Define the structure of a product
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  unitType: 'kg' | 'unit'; // Add unit type
}

// Placeholder product data - replace with actual data source later
const placeholderProducts: Product[] = [
  { id: 1, name: 'Banana', category: 'Frutas', price: 2000, imageUrl: '', unitType: 'kg' },
  { id: 2, name: 'Manzana', category: 'Frutas', price: 1800, imageUrl: '', unitType: 'kg' },
  { id: 3, name: 'Lechuga', category: 'Verdura', price: 1500, imageUrl: '', unitType: 'kg' },
  { id: 4, name: 'Tomate', category: 'Verdura', price: 1600, imageUrl: '', unitType: 'kg' },
  { id: 5, name: 'Pollo', category: 'Carniceria', price: 3500, imageUrl: '', unitType: 'kg' },
  { id: 6, name: 'Queso', category: 'Fiambreria', price: 4000, imageUrl: '', unitType: 'kg' },
  { id: 7, name: 'Pan Lactal', category: 'Almacen', price: 1200, imageUrl: '', unitType: 'unit' }, // Unit based
  { id: 8, name: 'Lavandina', category: 'Limpieza', price: 900, imageUrl: '', unitType: 'unit' }, // Unit based
  // Add a 'Bebidas' example
  { id: 9, name: 'Gaseosa 2L', category: 'Bebidas', price: 1500, imageUrl: '', unitType: 'unit' }, // Unit based
  { id: 10, name: 'Gaseosa 1L', category: 'Bebidas', price: 800, imageUrl: '', unitType: 'unit' }, // Unit based
];

interface ProductGridProps {
  selectedCategory: string;
  searchTerm: string; // Add searchTerm prop
}

export default function ProductGrid({ selectedCategory, searchTerm }: ProductGridProps) {
  // Apply search filter first to all products (case-insensitive)
  const searchedProducts = searchTerm
    ? placeholderProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : placeholderProducts;

  // Then, apply category filter to the search results
  const filteredProducts = selectedCategory === 'Todo'
    ? searchedProducts
    : searchedProducts.filter(product => product.category === selectedCategory);

  return (
    <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4" width="auto">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Grid>
  );
}
