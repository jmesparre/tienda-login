'use client';

import { useState, useEffect, ChangeEvent } from 'react'; // Import useEffect and ChangeEvent
import Image from 'next/image'; // Import next/image
import { supabase } from '@/lib/supabaseClient'; // Import supabase client
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique filenames
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
  Tooltip // Added Tooltip for icons
  // Removed unused TextArea import
} from '@radix-ui/themes';
import { Cross1Icon, Cross2Icon, Pencil1Icon, MagnifyingGlassIcon, PlusIcon, PlayIcon, PauseIcon, CheckIcon } from '@radix-ui/react-icons';
// Import category data and helpers
import { mainCategories as categoriesData, getSubcategories } from '@/lib/categories';

interface AdminDashboardProps {
  onLogout: () => void;
}

// Define Product type matching DB structure (camelCase for component use)
interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    unitType: 'kg' | 'unit';
    promotionPrice: number | null;
    imageUrl: string | null;
    createdAt: string;
    isPaused: boolean;
    subcategory: string | null; // Added subcategory field
}

// Use imported categories, filter out 'Todo' for selection purposes if needed
const categoriesForSelect = categoriesData.filter(c => c !== 'Todo');

// Define available images from public folder (excluding SVGs and directories)
const availableImages = ['/banana.png', '/aji-picante.png', '/berenjena.png', '/calabaza.png', '/cebolla.png', '/lechuga.png', '/manteca.png', '/manzana.png', '/morron.png', '/papa.png', '/pepino.png', '/pollo.png', '/queso.png', '/remolacha.png', '/uvas.png', '/cigarrillos.png', '/lata-cerveza.png', '/carne.png', '/milanesas.png', '/pañales.png', '/vino.png', '/jabon.png', '/chocolate.png'];

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [products, setProducts] = useState<Product[]>([]); // Initialize with empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State for inline price editing
  const [editedPrices, setEditedPrices] = useState<Record<number, string>>({});
  const [modifiedPrices, setModifiedPrices] = useState<Record<number, boolean>>({});
  const [updatingPriceId, setUpdatingPriceId] = useState<number | null>(null); // State for local loading
  // State for inline offer price editing
  const [editedOfferPrices, setEditedOfferPrices] = useState<Record<number, string>>({});
  const [modifiedOfferPrices, setModifiedOfferPrices] = useState<Record<number, boolean>>({});
  const [updatingOfferPriceId, setUpdatingOfferPriceId] = useState<number | null>(null); // State for local offer price loading
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false); // State for modal update loading


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
        imageUrl: p.image_url,
        createdAt: p.created_at,
        isPaused: p.is_paused,
        subcategory: p.subcategory // Map subcategory
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
    if (newPriceString === undefined || newPriceString === null) {
      console.warn('No edited price found for product:', productId);
      return; // Or handle as needed
    }

    const newPrice = parseFloat(newPriceString);
    if (isNaN(newPrice) || newPrice < 0) {
      setError(`Precio inválido para el producto ID ${productId}.`);
      // Optionally reset the input to the original price or keep the invalid value for correction
      // setEditedPrices(prev => ({ ...prev, [productId]: products.find(p => p.id === productId)?.price.toString() ?? '' }));
      return;
    }

    console.log(`Updating price for product ${productId} to ${newPrice}`);
    // setLoading(true); // Remove global loading indicator
    setUpdatingPriceId(productId); // Set local loading indicator for this row
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('products')
        .update({ price: newPrice })
        .match({ id: productId });

      if (updateError) {
        throw updateError;
      }

      console.log('Price updated successfully for product:', productId);
      // Update local state optimistically or refetch
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === productId ? { ...p, price: newPrice } : p
        )
      );
      // Reset modification status for this product
      setModifiedPrices(prev => ({ ...prev, [productId]: false }));
      // Clear the specific edited price state if desired, or keep it reflecting the saved value
      // setEditedPrices(prev => {
      //   const newState = { ...prev };
      //   delete newState[productId]; // Or set it to the newPrice string
      //   return newState;
      // });


    } catch (err: unknown) {
      console.error("Error updating price:", err);
      setError(`Error al actualizar el precio para el producto ID ${productId}.`);
      // Optionally revert the input field if the update fails
      // setEditedPrices(prev => ({ ...prev, [productId]: products.find(p => p.id === productId)?.price.toString() ?? '' }));
    } finally {
      // setLoading(false); // Remove global loading indicator
      setUpdatingPriceId(null); // Clear local loading indicator
    }
  };

  // --- Handle Inline Offer Price Change ---
  const handleOfferPriceChange = (productId: number, value: string) => {
    setEditedOfferPrices(prev => ({ ...prev, [productId]: value }));
    setModifiedOfferPrices(prev => ({ ...prev, [productId]: true }));
  };

  // --- Handle Inline Offer Price Save ---
  const handleUpdateOfferPrice = async (productId: number) => {
    const newOfferPriceString = editedOfferPrices[productId];
    // Allow empty string to represent null/no offer
    const newOfferPrice = newOfferPriceString === '' ? null : parseFloat(newOfferPriceString);

    if (newOfferPriceString !== '' && (isNaN(newOfferPrice as number) || (newOfferPrice as number) < 0)) {
      setError(`Precio de oferta inválido para el producto ID ${productId}.`);
      return;
    }

    console.log(`Updating offer price for product ${productId} to ${newOfferPrice}`);
    setUpdatingOfferPriceId(productId); // Set local loading indicator for this row
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('products')
        .update({ promotion_price: newOfferPrice }) // Use snake_case for DB
        .match({ id: productId });

      if (updateError) {
        throw updateError;
      }

      console.log('Offer price updated successfully for product:', productId);
      // Update local state
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === productId ? { ...p, promotionPrice: newOfferPrice } : p
        )
      );
      // Reset modification status for this product
      setModifiedOfferPrices(prev => ({ ...prev, [productId]: false }));

    } catch (err: unknown) {
      console.error("Error updating offer price:", err);
      setError(`Error al actualizar el precio de oferta para el producto ID ${productId}.`);
    } finally {
      setUpdatingOfferPriceId(null); // Clear local loading indicator
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

  // --- Toggle Pause Product Handler ---
  const handleTogglePauseProduct = async (productId: number, currentStatus: boolean) => {
    console.log(`Toggling pause status for product ${productId} to ${!currentStatus}`);
    try {
      setLoading(true); // Optional: Indicate loading during update
      setError(null);

      const { error: updateError } = await supabase
        .from('products')
        .update({ is_paused: !currentStatus }) // Toggle the status
        .match({ id: productId });

      if (updateError) {
        throw updateError;
      }

      console.log('Product pause status updated successfully');
      fetchProducts(); // Refresh the list to show the change

    } catch (err: unknown) {
      console.error("Error updating product pause status:", err);
      setError("Error al actualizar el estado del producto.");
    } finally {
      setLoading(false); // Reset loading state if used
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
  const [newProduct, setNewProduct] = useState<{
    name: string;
    category: string;
    subcategory: string;
    price: string;
    unitType: 'kg' | 'unit';
    promotionPrice: string;
  }>({ // Explicitly type the state object
    name: '',
    category: categoriesForSelect[0], // Default to first actual category
    subcategory: '', // Add subcategory state
    price: '',
    unitType: 'kg',
    promotionPrice: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // State for the selected image file
  const [isUploading, setIsUploading] = useState(false); // State for upload loading indicator
  // State for dynamic subcategories in modals
  const [currentSubcategories, setCurrentSubcategories] = useState<string[]>([]);

  // --- Filtering and Sorting Logic ---
  let filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply category filter if not 'Todo'
  if (activeCategory !== 'Todo') {
    filteredProducts = filteredProducts.filter(product => product.category === activeCategory);
  }

  // TODO: Implement sorting logic based on sortOrder state using filteredProducts

  // Update handler to manage subcategory reset and dynamic loading
  // Explicitly type the 'field' parameter to exclude 'imageUrl'
  const handleNewProductChange = (field: keyof Omit<typeof newProduct, 'imageUrl'>, value: string | null) => {
    setNewProduct(prev => {
      // Ensure prev is not null before spreading
      if (!prev) return prev;
      const updatedProduct = { ...prev, [field]: value };
      // If category changes, reset subcategory and update available subcategories
      if (field === 'category') {
        const subcats = getSubcategories(value || '');
        setCurrentSubcategories(subcats);
        // Reset subcategory selection, default to 'Todo' or empty if no subcats
        updatedProduct.subcategory = subcats.length > 0 ? subcats[0] : ''; // Default to 'Todo'
      }
      // If subcategory is explicitly set to 'Todo', store null or empty string
      if (field === 'subcategory' && value === 'Todo') {
          updatedProduct.subcategory = ''; // Store empty string or null based on DB preference
      }


      return updatedProduct;
    });
  };

  // Effect to set initial subcategories when Add modal opens based on default category
  useEffect(() => {
    if (isAddModalOpen) {
      setCurrentSubcategories(getSubcategories(newProduct.category));
      // Ensure default subcategory is set if category changes before opening
       setNewProduct(prev => ({
           ...prev,
           subcategory: getSubcategories(prev.category)[0] || '' // Default to 'Todo' or empty
       }));
    }
  }, [isAddModalOpen, newProduct.category]); // Rerun if modal opens or default category changes


  // --- Save New Product Handler ---
  const handleSaveNewProduct = async () => {
    console.log('Saving new product:', newProduct, 'File:', selectedFile);
    setIsUploading(true); // Start loading indicator
    setError(null); // Clear previous errors

    let imageUrl: string | null = null;
    let filePath: string | null = null; // Variable to store file path for potential deletion on error

    // 1. Upload image if selected
    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`; // Generate unique filename
      filePath = `public/${fileName}`; // Define storage path (e.g., in a 'public' folder within the bucket)

      try {
        const { error: uploadError } = await supabase.storage
          .from('imagenes-productos') // Use your bucket name
          .upload(filePath, selectedFile);

        if (uploadError) {
          throw new Error(`Error uploading image: ${uploadError.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('imagenes-productos')
          .getPublicUrl(filePath);

        if (!urlData || !urlData.publicUrl) {
            throw new Error('Could not get public URL for uploaded image.');
        }
        imageUrl = urlData.publicUrl;
        console.log('Image uploaded successfully:', imageUrl);

      } catch (uploadErr: unknown) { // Change type from any to unknown
        console.error("Error during image upload:", uploadErr);
        // Type check before accessing properties
        const errorMessage = uploadErr instanceof Error ? uploadErr.message : String(uploadErr);
        setError(`Error al subir la imagen: ${errorMessage}`);
        setIsUploading(false); // Stop loading on upload error
        return; // Stop the process if upload fails
      }
    }

    // 2. Prepare product data for insertion (including the image URL)
    const productToInsert = {
      name: newProduct.name,
      category: newProduct.category,
      subcategory: newProduct.subcategory === 'Todo' || newProduct.subcategory === '' ? null : newProduct.subcategory,
      price: parseFloat(newProduct.price) || 0,
      unit_type: newProduct.unitType,
      promotion_price: newProduct.promotionPrice ? parseFloat(newProduct.promotionPrice) : null,
      image_url: imageUrl, // Use the uploaded image URL or null
    };

    // 3. Validate required fields
    if (!productToInsert.name || !productToInsert.category || !productToInsert.price || !productToInsert.unit_type) {
      setError("Por favor complete todos los campos requeridos (Nombre, Categoría, Precio, Unidad).");
      setIsUploading(false); // Stop loading
      return;
    }
    // Optional: Validate subcategory
    // ... (validation logic remains the same)

    // 4. Insert product data into the database
    try {
      const { data, error: insertError } = await supabase
        .from('products')
        .insert([productToInsert])
        .select();

      if (insertError) {
        // Attempt to delete the uploaded image if DB insert fails
        if (imageUrl && filePath) {
            console.warn("DB insert failed, attempting to delete uploaded image:", filePath);
            await supabase.storage.from('imagenes-productos').remove([filePath]);
        }
        throw insertError;
      }

      console.log('Product saved successfully:', data);
      setIsAddModalOpen(false);
      // Reset form and selected file
      setNewProduct({ name: '', category: categoriesForSelect[0], subcategory: '', price: '', unitType: 'kg', promotionPrice: '' });
      setSelectedFile(null);
      fetchProducts();

    } catch (err: unknown) {
      console.error("Error saving product:", err);
      setError("Error al guardar el producto en la base de datos.");
      // Note: Image might be uploaded but product not saved. Manual cleanup in storage might be needed.
    } finally {
        setIsUploading(false); // Stop loading indicator
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
      subcategory: editingProduct.subcategory === 'Todo' || editingProduct.subcategory === '' ? null : editingProduct.subcategory, // Save null if 'Todo' or empty
      price: editingProduct.price,
      unit_type: editingProduct.unitType,
      promotion_price: editingProduct.promotionPrice,
      image_url: editingProduct.imageUrl,
    };

    // Validate required fields
    if (!productToUpdate.name || !productToUpdate.category || !productToUpdate.price || !productToUpdate.unit_type) {
        setError("Por favor complete todos los campos requeridos (Nombre, Categoría, Precio, Unidad).");
        return;
    }
    // Optional: Validate subcategory if category requires it
    if (getSubcategories(productToUpdate.category).length > 0 && !productToUpdate.subcategory) {
       // Allow saving without subcategory (treat as 'Todo'), or enforce selection:
       // setError(`La categoría '${productToUpdate.category}' requiere una subcategoría.`);
       // return;
    }

    setIsUpdatingProduct(true); // Set modal-specific loading state
    try {
      // setLoading(true); // REMOVED: Indicate loading state during update
      setError(null); // Clear previous errors

      const { error: updateError } = await supabase
        .from('products')
        .update(productToUpdate)
        .match({ id: editingProduct.id });

      if (updateError) {
        throw updateError;
      }

      console.log('Product updated successfully:', editingProduct.id);

      // Optimistically update the local state instead of refetching
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === editingProduct.id ? { ...editingProduct } : p // Replace the edited product
        )
      );

      setIsEditModalOpen(false); // Close modal
      setEditingProduct(null); // Clear editing state
      // fetchProducts(); // REMOVED: No longer refetching the entire list

    } catch (err: unknown) {
      console.error("Error updating product:", err);
      setError("Error al actualizar el producto.");
      // Keep modal open or provide specific feedback
    } finally {
       // setLoading(false); // REMOVED: Reset loading state
       setIsUpdatingProduct(false); // Reset modal-specific loading state
    }
  };

  // --- Handle changes in the Edit Modal form ---
  const handleEditingProductChange = (field: keyof Product, value: string | number | null) => {
    if (!editingProduct) return;

    setEditingProduct(prev => {
        if (!prev) return null;
        const updatedProduct = { ...prev, [field]: value };

        // If category changes, update available subcategories and potentially reset subcategory
        if (field === 'category') {
            const subcats = getSubcategories(value as string || '');
            setCurrentSubcategories(subcats);
            // Decide whether to reset subcategory or keep if valid
            if (!subcats.includes(updatedProduct.subcategory || '')) {
                 updatedProduct.subcategory = subcats.length > 0 ? subcats[0] : null; // Default to 'Todo' or null
            }
        }
         // If subcategory is explicitly set to 'Todo', store null
        if (field === 'subcategory' && value === 'Todo') {
            updatedProduct.subcategory = null;
        }


        return updatedProduct;
    });
  };

  // Effect to load subcategories when Edit modal opens
  useEffect(() => {
    if (isEditModalOpen && editingProduct) {
      setCurrentSubcategories(getSubcategories(editingProduct.category));
    }
  }, [isEditModalOpen, editingProduct]);

  // --- Handle File Selection ---
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };


  return (
    <Box p="4">
      {/* Header/Navbar */}
      <Flex justify="between" align="center" mb="4" p="3" style={{ borderBottom: '1px solid var(--gray-a6)' }}>
        <Heading as="h1" size="6" weight="bold">
          Tienda San Luis
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
             {/* Add clear button slot */}
             {searchTerm && (
                <TextField.Slot>
                    <IconButton size="1" variant="ghost" color="gray" onClick={() => setSearchTerm('')} style={{ cursor: 'pointer' }}>
                        <Cross2Icon height="14" width="14" />
                    </IconButton>
                </TextField.Slot>
             )}
           </TextField.Root>
        </Flex>
        <Link href="#" onClick={onLogout} size="2" color="gray" highContrast>
          Cerrar Sesión
        </Link>
      </Flex>

      {/* Category Filters - Use categoriesData */}
      <Flex gap="4" mb="4" wrap="wrap" px="3">
        {categoriesData.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? 'solid' : 'soft'}
            color="gray"
            highContrast={activeCategory === category}
            onClick={() => setActiveCategory(category)}
            size="2"
            style={{
              cursor: 'pointer',
              ...(activeCategory === category && { border: '1px solid #d0c2a7' }) // Add border conditionally
            }}
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
                    {categoriesForSelect.map(cat => ( // Use filtered categories
                      <Select.Item key={cat} value={cat}>{cat}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </label>
              {/* Subcategory Select (Add Modal) */}
              {currentSubcategories.length > 0 && (
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Subcategoría
                  </Text>
                  <Select.Root
                    value={newProduct.subcategory || 'Todo'} // Default to 'Todo' if empty
                    onValueChange={(value) => handleNewProductChange('subcategory', value)}
                  >
                    <Select.Trigger placeholder="Seleccionar subcategoría..." />
                    <Select.Content>
                      {currentSubcategories.map(subcat => (
                        <Select.Item key={subcat} value={subcat}>{subcat}</Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </label>
              )}
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
              {/* File Input for Image Upload */}
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Imagen (Opcional)
                </Text>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp" // Suggest image types
                  onChange={handleFileChange}
                  style={{
                      display: 'block', // Make it block for better layout control
                      marginTop: '4px', // Add some space
                      // Basic styling, can be improved
                      padding: '8px',
                      border: '1px solid var(--gray-a6)',
                      borderRadius: 'var(--radius-2)',
                      fontSize: 'var(--font-size-2)'
                  }}
                />
                {/* Display selected file name */}
                {selectedFile && (
                  <Text size="1" color="gray" mt="1">
                    Archivo seleccionado: {selectedFile.name}
                  </Text>
                )}
              </label>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray" onClick={() => setSelectedFile(null)}> {/* Clear file on cancel */}
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button onClick={handleSaveNewProduct} disabled={isUploading}>
                {isUploading ? 'Guardando...' : 'Guardar Producto'}
              </Button>
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
                    // Only update the editing product state now
                    if (isEditModalOpen && editingProduct) {
                      handleEditingProductChange('imageUrl', imagePath);
                    }
                    // Do nothing if the Add modal was somehow open when clicking here
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
                    {categoriesForSelect.map(cat => ( // Use filtered categories
                      <Select.Item key={cat} value={cat}>{cat}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </label>
              {/* Subcategory Select (Edit Modal) */}
              {currentSubcategories.length > 0 && (
                 <label>
                   <Text as="div" size="2" mb="1" weight="bold">
                     Subcategoría
                   </Text>
                   <Select.Root
                     value={editingProduct.subcategory || 'Todo'} // Default to 'Todo' if null/empty
                     onValueChange={(value) => handleEditingProductChange('subcategory', value)}
                   >
                     <Select.Trigger placeholder="Seleccionar subcategoría..." />
                     <Select.Content>
                       {currentSubcategories.map(subcat => (
                         <Select.Item key={subcat} value={subcat}>{subcat}</Select.Item>
                       ))}
                     </Select.Content>
                   </Select.Root>
                 </label>
              )}
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
              <Button onClick={handleUpdateProduct} disabled={isUpdatingProduct}>
                {isUpdatingProduct ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
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
            <Table.ColumnHeaderCell>Imagen</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Nombre</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Categoría</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Subcategoría</Table.ColumnHeaderCell> {/* Added Subcategory Column */}
            <Table.ColumnHeaderCell>Precio</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Unidad</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Oferta</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Acciones / Estado</Table.ColumnHeaderCell>
          </Table.Row>
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
               <Table.Cell colSpan={8} align="center"><Text>No hay productos para mostrar.</Text></Table.Cell> {/* Updated colSpan */}
             </Table.Row>
          )}
          {/* Map over filtered products */}
          {!loading && !error && filteredProducts.map((product) => (
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
              <Table.Cell>{product.subcategory || '-'}</Table.Cell> {/* Display subcategory or dash */}
              {/* Editable Price Cell */}
              <Table.Cell>
                <Flex align="center" gap="2">
                  <TextField.Root
                    size="1"
                    type="number"
                    placeholder="Precio"
                    value={editedPrices[product.id] ?? product.price.toString()} // Use edited price or original
                    onChange={(e) => handlePriceChange(product.id, e.target.value)}
                    style={{ width: '80px' }} // Adjust width as needed
                  />
                  {modifiedPrices[product.id] && ( // Show save button only if modified
                    <Tooltip content="Guardar precio">
                        <IconButton
                            size="1"
                            variant="soft"
                            color="green"
                            onClick={() => handleUpdatePrice(product.id)}
                            disabled={updatingPriceId === product.id} // Disable only this button while updating
                        >
                            <CheckIcon />
                        </IconButton>
                    </Tooltip>
                  )}
                </Flex>
              </Table.Cell>
              <Table.Cell>
                 {/* Display unit */}
                 {product.unitType === 'kg' ? 'kg' : 'c/u'}
              </Table.Cell>
              {/* Editable Offer Price Cell */}
              <Table.Cell>
                <Flex align="center" gap="2">
                  <TextField.Root
                    size="1"
                    type="number"
                    placeholder="-"
                    // Use edited offer price or original (handling null)
                    value={editedOfferPrices[product.id] ?? (product.promotionPrice !== null ? product.promotionPrice.toString() : '')}
                    onChange={(e) => handleOfferPriceChange(product.id, e.target.value)}
                    style={{ width: '80px' }} // Adjust width as needed
                  />
                  {modifiedOfferPrices[product.id] && ( // Show save button only if modified
                    <Tooltip content="Guardar oferta">
                        <IconButton
                            size="1"
                            variant="soft"
                            color="green"
                            onClick={() => handleUpdateOfferPrice(product.id)}
                            disabled={updatingOfferPriceId === product.id} // Disable only this button while updating
                        >
                            <CheckIcon />
                        </IconButton>
                    </Tooltip>
                  )}
                </Flex>
              </Table.Cell>
              <Table.Cell>
                <Flex gap="2">
                  <IconButton size="1" variant="soft" onClick={() => handleEditProduct(product.id)}>
                    <Pencil1Icon />
                  </IconButton>
                  <IconButton size="1" variant="soft" color="red" onClick={() => handleDeleteProduct(product.id)}>
                    <Cross1Icon />
                  </IconButton>
                  {/* Pause/Resume Button */}
                  <Tooltip content={product.isPaused ? "Reanudar producto" : "Pausar producto"}>
                    <IconButton
                      size="1"
                      variant="soft"
                      color={product.isPaused ? "green" : "orange"}
                      onClick={() => handleTogglePauseProduct(product.id, product.isPaused)}
                    >
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
