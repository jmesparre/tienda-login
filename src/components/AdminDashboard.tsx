'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
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
  Text,
  Dialog,
  Tooltip
} from '@radix-ui/themes';
import { Cross1Icon, Cross2Icon, Pencil1Icon, MagnifyingGlassIcon, PlusIcon, PlayIcon, PauseIcon, CheckIcon } from '@radix-ui/react-icons';

interface AdminDashboardProps {
  onLogout: () => void;
}

// Define categories and their subcategories (consistent with CategoryFilters)
const categoryData: Record<string, string[]> = { // Added explicit type
  'Frutas': [],
  'Verdura': [],
  'Carniceria': [],
  'Fiambreria': ['Todo', 'Queso', 'Jamon', 'Picada'],
  'Almacén': [],
  'Limpieza': [],
  'Bebidas': ['Todo', 'Aguas', 'Gaseosas', 'Energizantes', 'Vinos', 'Licores', 'Sodas', 'Cervezas']
};
const selectableCategories = Object.keys(categoryData); // Categories for selection dropdowns

// Define Product type matching DB structure (camelCase for component use)
interface Product {
    id: number;
    name: string;
    category: string;
    subcategory: string | null; // Added subcategory field
    price: number;
    unitType: 'kg' | 'unit';
    promotionPrice: number | null;
    imageUrl: string | null;
    createdAt: string;
    isPaused: boolean;
}

// Type for the new product form state
type NewProductFormState = {
    name: string;
    category: string;
    subcategory: string; // Always string in form state
    price: string;
    unitType: 'kg' | 'unit';
    promotionPrice: string;
    imageUrl: string;
};

// Categories for the filter buttons (includes 'Todo')
const filterCategories = ['Todo', ...selectableCategories];

// Define available images from public folder
const availableImages = ['/banana.png', '/aji-picante.png', '/berenjena.png', '/calabaza.png', '/cebolla.png', '/lechuga.png', '/manteca.png', '/manzana.png', '/morron.png', '/papa.png', '/pepino.png', '/pollo.png', '/queso.png', '/remolacha.png', '/uvas.png', '/cigarrillos.png', '/lata-cerveza.png', '/carne.png', '/milanesas.png', '/pañales.png', '/vino.png', '/jabon.png', '/chocolate.png'];

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editedPrices, setEditedPrices] = useState<Record<number, string>>({});
  const [modifiedPrices, setModifiedPrices] = useState<Record<number, boolean>>({});
  const [updatingPriceId, setUpdatingPriceId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('Todo');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  // State for new product form with explicit type
  const [newProduct, setNewProduct] = useState<NewProductFormState>({
    name: '',
    category: selectableCategories[0], // Default to first selectable category
    subcategory: '', // Initialize as empty string
    price: '',
    unitType: 'kg',
    promotionPrice: '',
    imageUrl: '',
  });
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);

  // --- Fetch Products Function ---
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;

      const mappedData = data?.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        subcategory: p.subcategory, // Map subcategory
        price: p.price,
        unitType: p.unit_type,
        promotionPrice: p.promotion_price,
        imageUrl: p.image_url,
        createdAt: p.created_at,
        isPaused: p.is_paused
      })) || [];
      setProducts(mappedData);
    } catch (err: unknown) {
      console.error("Error fetching products:", err);
      setError("Error al cargar los productos.");
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Inline Price Change ---
  const handlePriceChange = (productId: number, value: string) => {
    setEditedPrices(prev => ({ ...prev, [productId]: value }));
    setModifiedPrices(prev => ({ ...prev, [productId]: true }));
  };

  // --- Handle Inline Price Save ---
  const handleUpdatePrice = async (productId: number) => {
    const newPriceString = editedPrices[productId];
    if (newPriceString === undefined || newPriceString === null) return;
    const newPrice = parseFloat(newPriceString);
    if (isNaN(newPrice) || newPrice < 0) {
      setError(`Precio inválido para el producto ID ${productId}.`);
      return;
    }
    setUpdatingPriceId(productId);
    setError(null);
    try {
      const { error: updateError } = await supabase.from('products').update({ price: newPrice }).match({ id: productId });
      if (updateError) throw updateError;
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, price: newPrice } : p));
      setModifiedPrices(prev => ({ ...prev, [productId]: false }));
    } catch (err: unknown) {
      console.error("Error updating price:", err);
      setError(`Error al actualizar el precio para el producto ID ${productId}.`);
    } finally {
      setUpdatingPriceId(null);
    }
  };

  // --- Fetch products on mount ---
  useEffect(() => {
    fetchProducts();
  }, []);

  // --- Edit Product Handler ---
  const handleEditProduct = (productId: number) => {
    const productToEdit = products.find(p => p.id === productId);
    if (productToEdit) {
      setEditingProduct(productToEdit);
      const initialSubcats = categoryData[productToEdit.category as keyof typeof categoryData] || [];
      setAvailableSubcategories(initialSubcats);
      setIsEditModalOpen(true);
    } else {
      setError('Producto no encontrado para editar.');
    }
  };

  // --- Toggle Pause Product Handler ---
  const handleTogglePauseProduct = async (productId: number, currentStatus: boolean) => {
    try {
      setLoading(true); setError(null);
      const { error: updateError } = await supabase.from('products').update({ is_paused: !currentStatus }).match({ id: productId });
      if (updateError) throw updateError;
      fetchProducts();
    } catch (err: unknown) {
      console.error("Error updating product pause status:", err);
      setError("Error al actualizar el estado del producto.");
    } finally {
      setLoading(false);
    }
  };

  // --- Delete Product Handler ---
  const handleDeleteProduct = async (productId: number) => {
     try {
         const { error: deleteError } = await supabase.from('products').delete().match({ id: productId });
         if (deleteError) throw deleteError;
         fetchProducts();
     } catch (err: unknown) {
         console.error("Error deleting product:", err);
         setError("Error al eliminar el producto.");
     }
  };

  // --- Filtering Logic ---
  let filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (activeCategory !== 'Todo') {
    filteredProducts = filteredProducts.filter(product => product.category === activeCategory);
  }
  // TODO: Implement sorting logic

  // --- Handle New Product Form Changes ---
  const handleNewProductChange = (field: keyof NewProductFormState, value: string | null) => {
    const newValue = value ?? '';
    setNewProduct(prev => {
        const updatedState = { ...prev, [field]: newValue };
        if (field === 'category') {
            const subcats = categoryData[newValue as keyof typeof categoryData] || [];
            setAvailableSubcategories(subcats);
            const defaultSub: string = subcats.includes('Todo') ? 'Todo' : (subcats[0] || '');
            updatedState.subcategory = defaultSub; // Update subcategory directly
        }
        return updatedState; // Return the fully constructed state
    });
  };


  // --- Effect for Add Modal Subcategories ---
  useEffect(() => {
    if (isAddModalOpen) {
      const initialSubcats = categoryData[newProduct.category as keyof typeof categoryData] || [];
      setAvailableSubcategories(initialSubcats);
      if (!newProduct.subcategory || !initialSubcats.includes(newProduct.subcategory)) {
        const defaultSub: string = initialSubcats.includes('Todo') ? 'Todo' : (initialSubcats[0] || '');
        // Ensure the state update uses the correct type
        setNewProduct(prev => ({ ...prev, subcategory: defaultSub })); // Assign string directly
      }
    }
  }, [isAddModalOpen, newProduct.category]);

  // --- Save New Product Handler ---
  const handleSaveNewProduct = async () => {
    const productToInsert = {
      name: newProduct.name,
      category: newProduct.category,
      subcategory: newProduct.subcategory === 'Todo' || newProduct.subcategory === '' ? null : newProduct.subcategory,
      price: parseFloat(newProduct.price) || 0,
      unit_type: newProduct.unitType,
      promotion_price: newProduct.promotionPrice ? parseFloat(newProduct.promotionPrice) : null,
      image_url: newProduct.imageUrl || null,
    };
    if (!productToInsert.name || !productToInsert.category || !productToInsert.price || !productToInsert.unit_type) {
        setError("Por favor complete todos los campos requeridos (Nombre, Categoría, Precio, Unidad)."); return;
    }
    try {
      const { error: insertError } = await supabase.from('products').insert([productToInsert]).select();
      if (insertError) throw insertError;
      setIsAddModalOpen(false);
      setNewProduct({ name: '', category: selectableCategories[0], subcategory: '', price: '', unitType: 'kg', promotionPrice: '', imageUrl: '' });
      fetchProducts();
    } catch (err: unknown) {
      console.error("Error saving product:", err); setError("Error al guardar el producto.");
    }
  };

  // --- Update Product Handler ---
  const handleUpdateProduct = async () => {
    if (!editingProduct) { setError("No hay producto seleccionado para editar."); return; }
    const productToUpdate = {
      name: editingProduct.name,
      category: editingProduct.category,
      subcategory: editingProduct.subcategory === 'Todo' || editingProduct.subcategory === '' ? null : editingProduct.subcategory,
      price: editingProduct.price,
      unit_type: editingProduct.unitType,
      promotion_price: editingProduct.promotionPrice,
      image_url: editingProduct.imageUrl,
    };
    if (!productToUpdate.name || !productToUpdate.category || !productToUpdate.price || !productToUpdate.unit_type) {
        setError("Por favor complete todos los campos requeridos (Nombre, Categoría, Precio, Unidad)."); return;
    }
    try {
      setLoading(true); setError(null);
      const { error: updateError } = await supabase.from('products').update(productToUpdate).match({ id: editingProduct.id });
      if (updateError) throw updateError;
      setIsEditModalOpen(false); setEditingProduct(null); fetchProducts();
    } catch (err: unknown) {
      console.error("Error updating product:", err); setError("Error al actualizar el producto.");
    } finally {
       setLoading(false);
    }
  };

  // --- Handle Edit Modal Form Changes ---
  const handleEditingProductChange = (field: keyof Product, value: string | number | null) => {
    if (!editingProduct) return;
    let updatedProduct = { ...editingProduct };

    // Assign value based on field type, ensuring type correctness
    switch (field) {
        case 'subcategory': updatedProduct.subcategory = value as string | null; break;
        case 'promotionPrice': updatedProduct.promotionPrice = value ? Number(value) : null; break;
        case 'price': updatedProduct.price = Number(value) || 0; break;
        case 'unitType': if (value === 'kg' || value === 'unit') { updatedProduct.unitType = value; } break;
        case 'name': case 'category': updatedProduct = { ...updatedProduct, [field]: String(value ?? '') }; break;
        case 'imageUrl': updatedProduct = { ...updatedProduct, [field]: value as string | null }; break;
    }

    // Handle category change and subcategory reset
    if (field === 'category' && typeof value === 'string' && value) {
      const subcats = categoryData[value as keyof typeof categoryData] || [];
      setAvailableSubcategories(subcats);
      const currentSub = updatedProduct.subcategory;
      const isValidSub = subcats.includes(currentSub || '');
      if (!isValidSub) {
          const defaultSub: string = subcats.includes('Todo') ? 'Todo' : (subcats[0] || '');
          // Assign string or null, ensuring type compatibility with Product['subcategory']
          updatedProduct.subcategory = defaultSub === '' ? null : defaultSub;
      }
    }
     // Set state with the correctly typed object
     setEditingProduct(updatedProduct);
  };

  // --- Effect for Edit Modal Subcategories ---
  useEffect(() => {
    if (isEditModalOpen && editingProduct) {
      const initialSubcats = categoryData[editingProduct.category as keyof typeof categoryData] || [];
      setAvailableSubcategories(initialSubcats);
    }
  }, [isEditModalOpen, editingProduct?.category]);


  return (
    <Box p="4">
      {/* Header/Navbar */}
      <Flex justify="between" align="center" mb="4" p="3" style={{ borderBottom: '1px solid var(--gray-a6)' }}>
        <Heading as="h1" size="6" weight="bold">La Vieja Estacion</Heading>
        <Flex gap="4" align="center" flexGrow="1" justify="center" mx="6">
           <TextField.Root placeholder="Buscar…" size="2" style={{ minWidth: '300px', maxWidth: '500px' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}>
             <TextField.Slot><MagnifyingGlassIcon height="16" width="16" /></TextField.Slot>
             {searchTerm && (<TextField.Slot><IconButton size="1" variant="ghost" color="gray" onClick={() => setSearchTerm('')} style={{ cursor: 'pointer' }}><Cross2Icon height="14" width="14" /></IconButton></TextField.Slot>)}
           </TextField.Root>
        </Flex>
        <Link href="#" onClick={onLogout} size="2" color="gray" highContrast>Cerrar Sesión</Link>
      </Flex>

      {/* Category Filters */}
      <Flex gap="4" mb="4" wrap="wrap" px="3">
        {filterCategories.map((category) => (
          <Button key={category} variant={activeCategory === category ? 'solid' : 'soft'} color="gray" highContrast={activeCategory === category} onClick={() => setActiveCategory(category)} size="2" style={{ cursor: 'pointer', ...(activeCategory === category && { border: '1px solid #d0c2a7' }) }}>
            {category}
          </Button>
        ))}
      </Flex>

      {/* Action Bar & Modals */}
      <Flex justify="end" align="center" mb="4" gap="4" px="3">
        {/* Add Product Modal */}
        <Dialog.Root open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <Dialog.Trigger><Button size="2"><PlusIcon /> Agregar Producto</Button></Dialog.Trigger>
          <Dialog.Content style={{ maxWidth: 450 }}>
            <Dialog.Title>Agregar Nuevo Producto</Dialog.Title>
            <Dialog.Description size="2" mb="4">Complete los detalles del nuevo producto.</Dialog.Description>
            <Flex direction="column" gap="3">
              <label><Text as="div" size="2" mb="1" weight="bold">Nombre</Text><TextField.Root placeholder="Ej: Manzana Roja" value={newProduct.name} onChange={(e) => handleNewProductChange('name', e.target.value)}/></label>
              <Flex gap="3">
                 <label style={{ flexGrow: 1 }}><Text as="div" size="2" mb="1" weight="bold">Categoría</Text>
                    <Select.Root value={newProduct.category} onValueChange={(value) => handleNewProductChange('category', value)}>
                      <Select.Trigger placeholder="Seleccionar categoría..." />
                      <Select.Content>{selectableCategories.map(cat => (<Select.Item key={cat} value={cat}>{cat}</Select.Item>))}</Select.Content>
                    </Select.Root>
                  </label>
                  <label style={{ flexGrow: 1 }}><Text as="div" size="2" mb="1" weight="bold">SubCategoría</Text>
                     <Select.Root value={newProduct.subcategory} onValueChange={(value) => handleNewProductChange('subcategory', value)} disabled={availableSubcategories.length === 0}>
                       <Select.Trigger placeholder="Seleccionar..." />
                       <Select.Content>{availableSubcategories.map(subcat => (<Select.Item key={subcat} value={subcat}>{subcat}</Select.Item>))}</Select.Content>
                     </Select.Root>
                   </label>
              </Flex>
              <Flex gap="3">
                 <label style={{ flexGrow: 1 }}><Text as="div" size="2" mb="1" weight="bold">Precio</Text><TextField.Root type="number" placeholder="Ej: 1500.00" value={newProduct.price} onChange={(e) => handleNewProductChange('price', e.target.value)}/></label>
                  <label><Text as="div" size="2" mb="1" weight="bold">Unidad</Text>
                    <Select.Root value={newProduct.unitType} onValueChange={(value) => handleNewProductChange('unitType', value)}>
                      <Select.Trigger placeholder="Unidad" /><Select.Content><Select.Item value="kg">kg</Select.Item><Select.Item value="unit">c/u</Select.Item></Select.Content>
                    </Select.Root>
                  </label>
              </Flex>
              <label><Text as="div" size="2" mb="1" weight="bold">Precio Promocional (Opcional)</Text><TextField.Root type="number" placeholder="Ej: 1200.00" value={newProduct.promotionPrice} onChange={(e) => handleNewProductChange('promotionPrice', e.target.value)}/></label>
              <Flex direction="column" gap="1"><Text as="div" size="2" mb="1" weight="bold">Imagen</Text>
                <Flex align="center" gap="3">
                  <Button variant="outline" onClick={() => setIsImageModalOpen(true)}>Seleccionar Imagen</Button>
                  {newProduct.imageUrl && (<Text size="1" color="gray" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{newProduct.imageUrl}</Text>)}
                </Flex>
              </Flex>
            </Flex>
            <Flex gap="3" mt="4" justify="end"><Dialog.Close><Button variant="soft" color="gray">Cancelar</Button></Dialog.Close><Button onClick={handleSaveNewProduct}>Guardar Producto</Button></Flex>
          </Dialog.Content>
        </Dialog.Root>

        {/* Image Selection Modal */}
        <Dialog.Root open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
           <Dialog.Content style={{ maxWidth: '90vw', maxHeight: '80vh', width: 'auto', height: 'auto', overflowY: 'auto' }}>
             <Dialog.Title>Seleccionar Imagen</Dialog.Title>
             <Dialog.Description size="2" mb="4">Haz clic en la imagen para seleccionarla.</Dialog.Description>
             <Flex justify="center" p="4" gap="3" wrap="wrap">
               {availableImages.map((imagePath) => (
                 <Box key={imagePath} onClick={() => { if (isAddModalOpen) { handleNewProductChange('imageUrl', imagePath); } else if (isEditModalOpen && editingProduct) { handleEditingProductChange('imageUrl', imagePath); } setIsImageModalOpen(false); }} style={{ cursor: 'pointer', border: '2px solid var(--gray-a6)', padding: '4px', borderRadius: 'var(--radius-3)', transition: 'border-color 0.2s', }} className="hover:border-blue-500">
                   <Image src={imagePath} alt={`Imagen ${imagePath}`} width={100} height={100} style={{ display: 'block', borderRadius: 'var(--radius-2)', objectFit: 'cover', width: 'auto', height: 'auto' }}/>
                 </Box>
               ))}
             </Flex>
             <Flex gap="3" mt="4" justify="end"><Dialog.Close><Button variant="soft" color="gray">Cerrar</Button></Dialog.Close></Flex>
           </Dialog.Content>
         </Dialog.Root>

        {/* Edit Product Modal */}
        <Dialog.Root open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <Dialog.Content style={{ maxWidth: 450 }}>
            <Dialog.Title>Editar Producto</Dialog.Title>
            <Dialog.Description size="2" mb="4">Modifique los detalles del producto.</Dialog.Description>
            {editingProduct && (
              <Flex direction="column" gap="3">
                <label><Text as="div" size="2" mb="1" weight="bold">Nombre</Text><TextField.Root placeholder="Ej: Manzana Roja" value={editingProduct.name} onChange={(e) => handleEditingProductChange('name', e.target.value)}/></label>
                <Flex gap="3">
                   <label style={{ flexGrow: 1 }}><Text as="div" size="2" mb="1" weight="bold">Categoría</Text>
                      <Select.Root value={editingProduct.category} onValueChange={(value) => handleEditingProductChange('category', value)}>
                        <Select.Trigger placeholder="Seleccionar categoría..." /><Select.Content>{selectableCategories.map(cat => (<Select.Item key={cat} value={cat}>{cat}</Select.Item>))}</Select.Content>
                      </Select.Root>
                    </label>
                    <label style={{ flexGrow: 1 }}><Text as="div" size="2" mb="1" weight="bold">SubCategoría</Text>
                       <Select.Root value={editingProduct.subcategory ?? ''} onValueChange={(value) => handleEditingProductChange('subcategory', value)} disabled={availableSubcategories.length === 0}>
                         <Select.Trigger placeholder="Seleccionar..." /><Select.Content>{availableSubcategories.map(subcat => (<Select.Item key={subcat} value={subcat}>{subcat}</Select.Item>))}</Select.Content>
                       </Select.Root>
                     </label>
                </Flex>
                <Flex gap="3">
                  <label style={{ flexGrow: 1 }}><Text as="div" size="2" mb="1" weight="bold">Precio</Text><TextField.Root type="number" placeholder="Ej: 1500.00" value={editingProduct.price} onChange={(e) => handleEditingProductChange('price', parseFloat(e.target.value) || 0)}/></label>
                    <label><Text as="div" size="2" mb="1" weight="bold">Unidad</Text>
                      <Select.Root value={editingProduct.unitType} onValueChange={(value) => handleEditingProductChange('unitType', value)}>
                        <Select.Trigger placeholder="Unidad" /><Select.Content><Select.Item value="kg">kg</Select.Item><Select.Item value="unit">c/u</Select.Item></Select.Content>
                      </Select.Root>
                    </label>
                </Flex>
                <label><Text as="div" size="2" mb="1" weight="bold">Precio Promocional (Opcional)</Text><TextField.Root type="number" placeholder="Ej: 1200.00" value={editingProduct.promotionPrice ?? ''} onChange={(e) => handleEditingProductChange('promotionPrice', e.target.value ? parseFloat(e.target.value) : null)}/></label>
                <Flex direction="column" gap="1"><Text as="div" size="2" mb="1" weight="bold">Imagen</Text>
                  <Flex align="center" gap="3">
                    <Button variant="outline" onClick={() => setIsImageModalOpen(true)}>Seleccionar Imagen</Button>
                    {editingProduct.imageUrl && (<Text size="1" color="gray" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{editingProduct.imageUrl}</Text>)}
                  </Flex>
                </Flex>
              </Flex>
            )}
            <Flex gap="3" mt="4" justify="end"><Dialog.Close><Button variant="soft" color="gray" onClick={() => setEditingProduct(null)}>Cancelar</Button></Dialog.Close><Button onClick={handleUpdateProduct}>Guardar Cambios</Button></Flex>
          </Dialog.Content>
        </Dialog.Root>

        <Select.Root value={sortOrder} onValueChange={setSortOrder} size="2">
            <Select.Trigger placeholder="Filtros" /><Select.Content><Select.Item value="default">Ordenar por defecto</Select.Item><Select.Separator /><Select.Item value="az">Nombre (A-Z)</Select.Item><Select.Item value="za">Nombre (Z-A)</Select.Item><Select.Item value="price_high_low">Precio (Mayor a Menor)</Select.Item><Select.Item value="price_low_high">Precio (Menor a Mayor)</Select.Item></Select.Content>
          </Select.Root>
      </Flex>

      {/* Products Table */}
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Imagen</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Nombre</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Categoría</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Subcategoría</Table.ColumnHeaderCell> {/* Added Subcategory Header */}
            <Table.ColumnHeaderCell>Precio</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Unidad</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Oferta</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Acciones / Estado</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading && (<Table.Row><Table.Cell colSpan={8} align="center"><Text>Cargando...</Text></Table.Cell></Table.Row>)}
          {error && (<Table.Row><Table.Cell colSpan={8} align="center"><Text color="red">{error}</Text></Table.Cell></Table.Row>)}
          {!loading && !error && products.length === 0 && (<Table.Row><Table.Cell colSpan={8} align="center"><Text>No hay productos para mostrar.</Text></Table.Cell></Table.Row>)}
          {!loading && !error && filteredProducts.map((product) => (
            <Table.Row key={product.id} align="center">
              <Table.Cell><Image src={product.imageUrl || '/placeholder-image.jpg'} alt={product.name} width={40} height={40} style={{ objectFit: 'cover', borderRadius: '4px' }}/></Table.Cell>
              <Table.RowHeaderCell>{product.name}</Table.RowHeaderCell>
              <Table.Cell>{product.category}</Table.Cell>
              <Table.Cell>{product.subcategory || '-'}</Table.Cell> {/* Added Subcategory Cell */}
              <Table.Cell>
                <Flex align="center" gap="2">
                  <TextField.Root size="1" type="number" placeholder="Precio" value={editedPrices[product.id] ?? product.price.toString()} onChange={(e) => handlePriceChange(product.id, e.target.value)} style={{ width: '80px' }}/>
                  {modifiedPrices[product.id] && (<Tooltip content="Guardar precio"><IconButton size="1" variant="soft" color="green" onClick={() => handleUpdatePrice(product.id)} disabled={updatingPriceId === product.id}><CheckIcon /></IconButton></Tooltip>)}
                </Flex>
              </Table.Cell>
              <Table.Cell>{product.unitType === 'kg' ? 'kg' : 'c/u'}</Table.Cell>
              <Table.Cell>{product.promotionPrice ? `$${product.promotionPrice.toFixed(2)}` : '-'}</Table.Cell>
              <Table.Cell>
                <Flex gap="2">
                  <IconButton size="1" variant="soft" onClick={() => handleEditProduct(product.id)}><Pencil1Icon /></IconButton>
                  <IconButton size="1" variant="soft" color="red" onClick={() => handleDeleteProduct(product.id)}><Cross1Icon /></IconButton>
                  <Tooltip content={product.isPaused ? "Reanudar producto" : "Pausar producto"}>
                    <IconButton size="1" variant="soft" color={product.isPaused ? "green" : "orange"} onClick={() => handleTogglePauseProduct(product.id, product.isPaused)}>
                      {product.isPaused ? <PlayIcon /> : <PauseIcon />}
                    </IconButton>
                  </Tooltip>
                </Flex>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
