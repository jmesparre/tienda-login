'use client';

import { useState, useEffect } from 'react'; // Import useEffect
import Image from 'next/image'; // Import next/image
import { supabase } from '@/lib/supabaseClient'; // Import supabase client
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
  Dialog // Added Dialog
  // Removed unused TextArea import
} from '@radix-ui/themes';
import { Cross1Icon, Pencil1Icon, MagnifyingGlassIcon, PlusIcon } from '@radix-ui/react-icons'; // Added MagnifyingGlassIcon and PlusIcon

interface AdminDashboardProps {
  onLogout: () => void;
}

// Define Product type matching DB structure (camelCase for component use)
interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    unitType: 'kg' | 'unit'; // Keep as 'kg' | 'unit'
    promotionPrice: number | null;
    imageUrl: string | null;
    createdAt: string; // Add created_at if needed
}

// Removed exampleProducts

// Example categories based on wireframe
const categories = ['Todo', 'Frutas', 'Verdura', 'Carniceria', 'Fiambreria', 'Almacen', 'Limpieza', 'Bebidas'];

// Define available images from public folder (excluding SVGs and directories)
const availableImages = ['/banana.png', '/aji-picante.png', '/berenjena.png', '/calabaza.png', '/cebolla.png', '/lechuga.png', '/manteca.png', '/manzana.png', '/morron.png', '/papa.png', '/pepino.png', '/pollo.png', '/queso.png', '/remolacha.png', '/uvas.png', '/cigarrillos.png', '/lata-cerveza.png', '/carne.png', '/milanesas.png']; // Added this line

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [products, setProducts] = useState<Product[]>([]); // Initialize with empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch Products Function ---
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false }); // Order by creation date

      if (dbError) {
        throw dbError;
      }

      // Map snake_case from DB to camelCase for the component state
      const mappedData = data?.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        unitType: p.unit_type, // Map unit_type
        promotionPrice: p.promotion_price, // Map promotion_price
        imageUrl: p.image_url, // Map image_url
        createdAt: p.created_at
      })) || [];

      setProducts(mappedData);
    } catch (err: unknown) {
      console.error("Error fetching products:", err);
      setError("Error al cargar los productos.");
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch products on component mount ---
  useEffect(() => {
    fetchProducts();
  }, []);

  // --- Edit Product Handler ---
  const handleEditProduct = (productId: number) => {
    // Find the product in the current list
    const productToEdit = products.find(p => p.id === productId);
    if (productToEdit) {
      setEditingProduct(productToEdit); // Set the product to be edited
      setIsEditModalOpen(true); // Open the edit modal
      console.log('Editing Product:', productToEdit);
    } else {
      console.error('Product not found for editing:', productId);
      setError('Producto no encontrado para editar.');
    }
  };

  // --- Delete Product Handler ---
  const handleDeleteProduct = async (productId: number) => {
     // Optional: Add confirmation dialog here
     console.log('Attempting to delete product:', productId);
     try {
         const { error: deleteError } = await supabase
             .from('products')
             .delete()
             .match({ id: productId });

         if (deleteError) {
             throw deleteError;
         }

         console.log('Product deleted successfully');
         // Refresh the product list after deletion
         fetchProducts();
         // Or optimistically remove from local state:
         // setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));

     } catch (err: unknown) {
         console.error("Error deleting product:", err);
         setError("Error al eliminar el producto.");
         // Consider showing a user-friendly error message (e.g., using a toast notification)
     }
  };


  // --- Component State ---
  const [activeCategory, setActiveCategory] = useState('Todo');
  // State for search term
  const [searchTerm, setSearchTerm] = useState('');
  // State for sorting
  const [sortOrder, setSortOrder] = useState('default');
  // State for Add Product Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // State for Image Selection Modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  // State for Edit Product Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); // State to hold the product being edited
  // State for new product form
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: categories[1], // Default to first actual category
    price: '',
    unitType: 'kg', // Changed 'unit' to 'unitType' to match DB/interface
    promotionPrice: '',
    imageUrl: '',
  });

  // TODO: Implement filtering and sorting logic based on state

  const handleNewProductChange = (field: keyof typeof newProduct, value: string) => {
    // Ensure correct field name 'unitType' is used if needed
    setNewProduct(prev => ({ ...prev, [field]: value }));
  };

  // --- Save New Product Handler ---
  const handleSaveNewProduct = async () => {
    console.log('Saving new product:', newProduct);

    // Prepare data for Supabase (snake_case keys)
    const productToInsert = {
      name: newProduct.name,
      category: newProduct.category,
      price: parseFloat(newProduct.price) || 0,
      unit_type: newProduct.unitType, // Use unitType from state
      promotion_price: newProduct.promotionPrice ? parseFloat(newProduct.promotionPrice) : null,
      image_url: newProduct.imageUrl || null, // Use null if empty
    };

    // Validate required fields (basic example)
    if (!productToInsert.name || !productToInsert.category || !productToInsert.price || !productToInsert.unit_type) {
        setError("Por favor complete todos los campos requeridos (Nombre, Categoría, Precio, Unidad).");
        return; // Prevent insertion
    }

    try {
      const { data, error: insertError } = await supabase
        .from('products')
        .insert([productToInsert])
        .select(); // Select the inserted data

      if (insertError) {
        throw insertError;
      }

      console.log('Product saved successfully:', data);
      setIsAddModalOpen(false); // Close modal
      // Reset form
      setNewProduct({ name: '', category: categories[1], price: '', unitType: 'kg', promotionPrice: '', imageUrl: '' });
      // Refresh the product list
      fetchProducts();

    } catch (err: unknown) {
      console.error("Error saving product:", err);
      setError("Error al guardar el producto.");
      // Keep modal open or provide feedback
    }
  };

  // --- Update Product Handler ---
  const handleUpdateProduct = async () => {
    if (!editingProduct) {
      setError("No hay producto seleccionado para editar.");
      return;
    }

    console.log('Attempting to update product:', editingProduct);

    // Prepare data for Supabase (snake_case keys)
    const productToUpdate = {
      name: editingProduct.name,
      category: editingProduct.category,
      price: editingProduct.price, // Already a number
      unit_type: editingProduct.unitType,
      promotion_price: editingProduct.promotionPrice, // Already number or null
      image_url: editingProduct.imageUrl, // Already string or null
    };

    // Validate required fields (basic example)
    if (!productToUpdate.name || !productToUpdate.category || !productToUpdate.price || !productToUpdate.unit_type) {
        setError("Por favor complete todos los campos requeridos (Nombre, Categoría, Precio, Unidad).");
        // Keep modal open for correction
        return;
    }

    try {
      setLoading(true); // Indicate loading state during update
      setError(null); // Clear previous errors

      const { error: updateError } = await supabase
        .from('products')
        .update(productToUpdate)
        .match({ id: editingProduct.id });

      if (updateError) {
        throw updateError;
      }

      console.log('Product updated successfully:', editingProduct.id);
      setIsEditModalOpen(false); // Close modal
      setEditingProduct(null); // Clear editing state
      fetchProducts(); // Refresh the product list to show changes

    } catch (err: unknown) {
      console.error("Error updating product:", err);
      setError("Error al actualizar el producto.");
      // Keep modal open or provide specific feedback
    } finally {
       setLoading(false); // Reset loading state
    }
  };

  // --- Handle changes in the Edit Modal form ---
  const handleEditingProductChange = (field: keyof Product, value: string | number | null) => {
    if (!editingProduct) return;
    setEditingProduct(prev => prev ? { ...prev, [field]: value } : null);
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
             placeholder="Buscar…"
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

      {/* Action Bar & Modals */}
      <Flex justify="end" align="center" mb="4" gap="4" px="3">
        {/* Add Product Modal */}
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
              {/* Form fields for new product */}
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
                      value={newProduct.unitType} // Use unitType
                      onValueChange={(value) => handleNewProductChange('unitType', value)} // Update unitType
                    >
                      <Select.Trigger placeholder="Unidad" />
                      <Select.Content>
                        <Select.Item value="kg">kg</Select.Item>
                        <Select.Item value="unit">c/u</Select.Item> {/* Changed value to "unit" */}
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
              {/* Image Selection Button */}
              <Flex direction="column" gap="1">
                <Text as="div" size="2" mb="1" weight="bold">
                  Imagen
                </Text>
                <Flex align="center" gap="3">
                  <Button variant="outline" onClick={() => setIsImageModalOpen(true)}>
                    Seleccionar Imagen
                  </Button>
                  {newProduct.imageUrl && (
                    <Text size="1" color="gray" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {newProduct.imageUrl}
                    </Text>
                  )}
                </Flex>
              </Flex>
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

        {/* Image Selection Modal */}
        <Dialog.Root open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <Dialog.Content style={{ maxWidth: '90vw', maxHeight: '80vh', width: 'auto', height: 'auto', overflowY: 'auto' }}>
            <Dialog.Title>Seleccionar Imagen</Dialog.Title>
            <Dialog.Description size="2" mb="4">
              Haz clic en la imagen para seleccionarla.
            </Dialog.Description>
            <Flex justify="center" p="4" gap="3" wrap="wrap">
              {availableImages.map((imagePath) => (
                <Box
                  key={imagePath}
                  onClick={() => {
                    // Determine which state to update based on which modal is open
                    if (isAddModalOpen) {
                      handleNewProductChange('imageUrl', imagePath);
                    } else if (isEditModalOpen && editingProduct) {
                      handleEditingProductChange('imageUrl', imagePath);
                    }
                    setIsImageModalOpen(false); // Close this modal
                  }}
                  style={{
                    cursor: 'pointer',
                    border: '2px solid var(--gray-a6)',
                    padding: '4px',
                    borderRadius: 'var(--radius-3)',
                    transition: 'border-color 0.2s',
                  }}
                  className="hover:border-blue-500"
                >
                  <Image
                    src={imagePath}
                    alt={`Imagen ${imagePath}`}
                    width={100}
                    height={100}
                    style={{ display: 'block', borderRadius: 'var(--radius-2)', objectFit: 'cover', width: 'auto', height: 'auto' }}
                  />
                </Box>
              ))}
            </Flex>
            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cerrar
                </Button>
              </Dialog.Close>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>

        {/* Edit Product Modal */}
        <Dialog.Root open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          {/* Trigger is handled by the Pencil icon in the table */}
          <Dialog.Content style={{ maxWidth: 450 }}>
            <Dialog.Title>Editar Producto</Dialog.Title>
            <Dialog.Description size="2" mb="4">
              Modifique los detalles del producto.
            </Dialog.Description>

            {editingProduct && ( // Only render form if a product is being edited
              <Flex direction="column" gap="3">
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Nombre
                  </Text>
                  <TextField.Root
                    placeholder="Ej: Manzana Roja"
                    value={editingProduct.name}
                    onChange={(e) => handleEditingProductChange('name', e.target.value)}
                  />
                </label>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Categoría
                  </Text>
                  <Select.Root
                    value={editingProduct.category}
                    onValueChange={(value) => handleEditingProductChange('category', value)}
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
                        value={editingProduct.price} // Use number directly
                        onChange={(e) => handleEditingProductChange('price', parseFloat(e.target.value) || 0)} // Parse to float
                      />
                    </label>
                    <label>
                      <Text as="div" size="2" mb="1" weight="bold">
                        Unidad
                      </Text>
                      <Select.Root
                        value={editingProduct.unitType}
                        onValueChange={(value) => handleEditingProductChange('unitType', value)}
                      >
                        <Select.Trigger placeholder="Unidad" />
                        <Select.Content>
                          <Select.Item value="kg">kg</Select.Item>
                          <Select.Item value="unit">c/u</Select.Item>
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
                    value={editingProduct.promotionPrice ?? ''} // Handle null
                    onChange={(e) => handleEditingProductChange('promotionPrice', e.target.value ? parseFloat(e.target.value) : null)} // Parse or set null
                  />
                </label>
                {/* Image Selection Button for Edit Modal */}
                <Flex direction="column" gap="1">
                  <Text as="div" size="2" mb="1" weight="bold">
                    Imagen
                  </Text>
                  <Flex align="center" gap="3">
                    <Button variant="outline" onClick={() => setIsImageModalOpen(true)}>
                      Seleccionar Imagen
                    </Button>
                    {editingProduct.imageUrl && (
                      <Text size="1" color="gray" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {editingProduct.imageUrl}
                      </Text>
                    )}
                  </Flex>
                </Flex>
              </Flex>
            )}

            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray" onClick={() => setEditingProduct(null)}> {/* Clear editing product on cancel */}
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button onClick={handleUpdateProduct}>Guardar Cambios</Button>
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
          <Table.Row><Table.ColumnHeaderCell>Image</Table.ColumnHeaderCell><Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell><Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell><Table.ColumnHeaderCell>Price</Table.ColumnHeaderCell><Table.ColumnHeaderCell>Unit</Table.ColumnHeaderCell><Table.ColumnHeaderCell>Promotion Price</Table.ColumnHeaderCell><Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell></Table.Row>
        </Table.Header>

        <Table.Body>
          {loading && (
            <Table.Row>
              <Table.Cell colSpan={7} align="center"><Text>Cargando...</Text></Table.Cell>
            </Table.Row>
          )}
          {error && (
            <Table.Row>
              <Table.Cell colSpan={7} align="center"><Text color="red">{error}</Text></Table.Cell>
            </Table.Row>
          )}
          {!loading && !error && products.length === 0 && (
             <Table.Row>
               <Table.Cell colSpan={7} align="center"><Text>No hay productos para mostrar.</Text></Table.Cell>
             </Table.Row>
          )}
          {!loading && !error && products.map((product) => (
            <Table.Row key={product.id} align="center">
              {/* Image Cell */}
              <Table.Cell>
                {/* Use next/image for optimization */}
                <Image
                  src={product.imageUrl || '/placeholder-image.jpg'} // Use product image or placeholder
                  alt={product.name}
                  width={40} // Keep width and height for layout
                  height={40}
                  style={{ objectFit: 'cover', borderRadius: '4px' }} // Style remains the same
                />
              </Table.Cell>
              <Table.RowHeaderCell>{product.name}</Table.RowHeaderCell>
              <Table.Cell>{product.category}</Table.Cell>
              <Table.Cell>
                {/* Display price, inline editing removed for now */}
                {`$${product.price.toFixed(2)}`}
              </Table.Cell>
              <Table.Cell>
                 {/* Display unit, inline editing removed */}
                 {product.unitType === 'kg' ? 'kg' : 'c/u'}
              </Table.Cell>
              <Table.Cell>
                {/* Display promo price, inline editing removed */}
                {product.promotionPrice ? `$${product.promotionPrice.toFixed(2)}` : '-'}
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
