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
  Link,
  Text, // Re-added Text
  Dialog, // Added Dialog
  TextArea // Added TextArea for potential description field later
} from '@radix-ui/themes';
import { Cross1Icon, Pencil1Icon, MagnifyingGlassIcon, PlusIcon } from '@radix-ui/react-icons'; // Added MagnifyingGlassIcon and PlusIcon

interface AdminDashboardProps {
  onLogout: () => void;
}

// Example product data structure matching the wireframe
const exampleProducts = [
  { id: 1, name: 'Banana', category: 'Frutas', price: 22000.00, unit: 'kg', promotionPrice: null },
  { id: 2, name: 'Manzana', category: 'Verduras', price: 35.00, unit: 'kg', promotionPrice: 15.00 },
  { id: 3, name: 'Lechuga', category: 'Limpieza', price: 15.00, unit: 'c/u', promotionPrice: null },
  { id: 4, name: 'Tomate', category: 'Comestible', price: 40.00, unit: 'kg', promotionPrice: null },
  // Add more products if needed based on a full dataset
];

// Example categories based on wireframe
const categories = ['Todo', 'Frutas', 'Verdura', 'Carniceria', 'Fiambreira', 'Almacen', 'Limpieza', 'Bebidas'];

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

  // State for active category filter
  const [activeCategory, setActiveCategory] = useState('Todo');
  // State for search term
  const [searchTerm, setSearchTerm] = useState('');
// State for sorting
const [sortOrder, setSortOrder] = useState('default');
// State for Add Product Modal
const [isAddModalOpen, setIsAddModalOpen] = useState(false);
// State for new product form
const [newProduct, setNewProduct] = useState({
  name: '',
  category: categories[1], // Default to first actual category
  price: '',
  unit: 'kg',
  promotionPrice: '',
});

// TODO: Implement filtering and sorting logic based on state

const handleNewProductChange = (field: keyof typeof newProduct, value: string) => {
  setNewProduct(prev => ({ ...prev, [field]: value }));
};

const handleSaveNewProduct = () => {
  console.log('Saving new product:', newProduct);
  // TODO: Add actual save logic (e.g., API call, update state)
  // Example: Add to local state for now
  const productToAdd = {
      id: Date.now(), // Temporary ID
      name: newProduct.name,
      category: newProduct.category,
      price: parseFloat(newProduct.price) || 0,
      unit: newProduct.unit as 'kg' | 'c/u', // Type assertion might be needed
      promotionPrice: newProduct.promotionPrice ? parseFloat(newProduct.promotionPrice) : null,
  };
  setProducts(prev => [...prev, productToAdd]);
  setIsAddModalOpen(false); // Close modal
  // Reset form
  setNewProduct({ name: '', category: categories[1], price: '', unit: 'kg', promotionPrice: '' });
};

  return (
    <Box p="4">
      {/* Header/Navbar */}
      <Flex justify="between" align="center" mb="4" p="3" style={{ borderBottom: '1px solid var(--gray-a6)' }}>
        <Heading as="h1" size="6" weight="bold">
          La Vieja Estacion
        </Heading>
        <Flex gap="4" align="center" flexGrow="1" justify="center" mx="6">
           <TextField.Root
             placeholder="Buscar productos…"
             size="2"
             style={{ minWidth: '300px', maxWidth: '500px' }}
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           >
             <TextField.Slot>
               <MagnifyingGlassIcon height="16" width="16" />
             </TextField.Slot>
           </TextField.Root>
        </Flex>
        <Link href="#" onClick={onLogout} size="2" color="gray" highContrast>
          Cerrar Sesión
        </Link>
      </Flex>

      {/* Category Filters */}
      <Flex gap="4" mb="4" wrap="wrap" px="3">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? 'solid' : 'soft'}
            color="gray"
            highContrast={activeCategory === category}
            onClick={() => setActiveCategory(category)}
            size="2"
            style={{ cursor: 'pointer' }}
          >
            {category}
          </Button>
        ))}
      </Flex>

      {/* Action Bar & Add Product Modal */}
      <Flex justify="end" align="center" mb="4" gap="4" px="3">
        <Dialog.Root open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <Dialog.Trigger>
            <Button size="2">
              <PlusIcon /> Agregar Producto
            </Button>
          </Dialog.Trigger>
          <Dialog.Content style={{ maxWidth: 450 }}>
            <Dialog.Title>Agregar Nuevo Producto</Dialog.Title>
            <Dialog.Description size="2" mb="4">
              Complete los detalles del nuevo producto.
            </Dialog.Description>

            <Flex direction="column" gap="3">
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Nombre
                </Text>
                <TextField.Root
                  placeholder="Ej: Manzana Roja"
                  value={newProduct.name}
                  onChange={(e) => handleNewProductChange('name', e.target.value)}
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Categoría
                </Text>
                <Select.Root
                  value={newProduct.category}
                  onValueChange={(value) => handleNewProductChange('category', value)}
                >
                  <Select.Trigger placeholder="Seleccionar categoría..." />
                  <Select.Content>
                    {categories.filter(c => c !== 'Todo').map(cat => (
                      <Select.Item key={cat} value={cat}>{cat}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </label>
              <Flex gap="3">
                 <label style={{ flexGrow: 1 }}>
                    <Text as="div" size="2" mb="1" weight="bold">
                      Precio
                    </Text>
                    <TextField.Root
                      type="number"
                      placeholder="Ej: 1500.00"
                      value={newProduct.price}
                      onChange={(e) => handleNewProductChange('price', e.target.value)}
                    />
                  </label>
                  <label>
                    <Text as="div" size="2" mb="1" weight="bold">
                      Unidad
                    </Text>
                    <Select.Root
                      value={newProduct.unit}
                      onValueChange={(value) => handleNewProductChange('unit', value)}
                    >
                      <Select.Trigger placeholder="Unidad" />
                      <Select.Content>
                        <Select.Item value="kg">kg</Select.Item>
                        <Select.Item value="c/u">c/u</Select.Item>
                        {/* Add other units */}
                      </Select.Content>
                    </Select.Root>
                  </label>
              </Flex>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Precio Promocional (Opcional)
                </Text>
                <TextField.Root
                  type="number"
                  placeholder="Ej: 1200.00"
                  value={newProduct.promotionPrice}
                  onChange={(e) => handleNewProductChange('promotionPrice', e.target.value)}
                />
              </label>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button onClick={handleSaveNewProduct}>Guardar Producto</Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>

        <Select.Root value={sortOrder} onValueChange={setSortOrder} size="2">
            <Select.Trigger placeholder="Filtros" />
            <Select.Content>
              <Select.Item value="default">Ordenar por defecto</Select.Item>
              <Select.Separator />
              <Select.Item value="az">Nombre (A-Z)</Select.Item>
              <Select.Item value="za">Nombre (Z-A)</Select.Item>
              <Select.Item value="price_high_low">Precio (Mayor a Menor)</Select.Item>
              <Select.Item value="price_low_high">Precio (Menor a Mayor)</Select.Item>
            </Select.Content>
          </Select.Root>
      </Flex>

      {/* Products Table */}
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
