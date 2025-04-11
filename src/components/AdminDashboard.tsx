'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Table,
  TextField,
  Select,
  IconButton,
  // Text, // Removed unused import
  Link
} from '@radix-ui/themes';
import { Cross1Icon, Pencil1Icon } from '@radix-ui/react-icons';

interface AdminDashboardProps {
  onLogout: () => void;
}

// Example product data structure (replace with actual data fetching later)
const exampleProducts = [
  { id: 1, name: 'Banana', category: 'Frutas', price: 20.00, unit: 'kg', promotionPrice: null },
  { id: 2, name: 'Manzana', category: 'Verduras', price: 35.00, unit: 'kg', promotionPrice: 15.0 },
  { id: 3, name: 'Lechuga', category: 'Limpieza', price: 15.00, unit: 'c/u', promotionPrice: null },
  { id: 4, name: 'Tomate', category: 'Comestible', price: 40.00, unit: 'kg', promotionPrice: null },
  { id: 5, name: 'Pollo', category: 'Domestic', price: 45.00, unit: 'c/u', promotionPrice: 1500 },
];

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  // State for products (using example data for now)
  const [products, setProducts] = useState(exampleProducts);

  // Placeholder functions for actions (implement later)
  const handleAddProduct = () => {
    console.log('Add Product clicked');
    // Logic to open a modal or navigate to an add product page
  };

  const handleEditProduct = (productId: number) => {
    console.log('Edit Product clicked:', productId);
    // Logic to open an edit modal or page for the product
  };

  const handleDeleteProduct = (productId: number) => {
    console.log('Delete Product clicked:', productId);
    // Logic to confirm and delete the product
    setProducts(products.filter(p => p.id !== productId)); // Example deletion
  };

  return (
    <Box>
      <Flex justify="between" align="center" mb="5">
        <Heading as="h2" size="7">
          Admin Dashboard
        </Heading>
        <Flex gap="4" align="center">
           <Button onClick={handleAddProduct} size="3">
             Add Product
           </Button>
           <Link href="#" onClick={onLogout} size="3" color="gray" highContrast>
             Cerrar Sesión
           </Link>
        </Flex>
      </Flex>

      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Price</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Unit</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Promotion Price</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {products.map((product) => (
            <Table.Row key={product.id} align="center">
              <Table.RowHeaderCell>{product.name}</Table.RowHeaderCell>
              <Table.Cell>{product.category}</Table.Cell>
              <Table.Cell>
                <TextField.Root
                  size="1"
                  type="number"
                  defaultValue={product.price.toFixed(2)}
                  // Add onChange handler later for actual editing
                  style={{ maxWidth: '80px' }}
                />
              </Table.Cell>
              <Table.Cell>
                 <Select.Root defaultValue={product.unit} size="1">
                    <Select.Trigger variant="soft" style={{ minWidth: '60px' }} />
                    <Select.Content>
                      <Select.Item value="kg">kg</Select.Item>
                      <Select.Item value="c/u">c/u</Select.Item>
                      {/* Add other units as needed */}
                    </Select.Content>
                  </Select.Root>
              </Table.Cell>
              <Table.Cell>
                <TextField.Root
                  size="1"
                  type="number"
                  placeholder="-"
                  defaultValue={product.promotionPrice?.toFixed(2) ?? ''}
                   // Add onChange handler later for actual editing
                  style={{ maxWidth: '80px' }}
                />
              </Table.Cell>
              <Table.Cell>
                <Flex gap="2">
                  <IconButton size="1" variant="soft" onClick={() => handleEditProduct(product.id)}>
                    <Pencil1Icon />
                  </IconButton>
                  <IconButton size="1" variant="soft" color="red" onClick={() => handleDeleteProduct(product.id)}>
                    <Cross1Icon />
                  </IconButton>
                </Flex>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
