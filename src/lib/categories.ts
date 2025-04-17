export const categoriesWithSubcategories: { [key: string]: string[] } = {
  Frutas: ["Cítricos", "Bayas", "Con carozo"],
  Verdura: ["Hojas verdes", "De raíz", "Tomates y pimientos"],
  Carnicería: ["Vacuno", "Cerdo", "Pollo"],
  Fiambres: ["Jamón cocido", "Queso", "Picada"],
  Almacén: ["Pastas y arroces", "Conservas", "Legumbres", "Lacteos" , "Tabaco" , "Golosinas"],
  Limpieza: ["Ropa", "Multiusos", "Baño"],
  Bebidas: ["Agua", "Gaseosas", "Energizantes", "Vinos", "Licores", "Sodas", "Cervezas"],
};

// Helper function to get subcategories for a given category, including "Todo"
export const getSubcategories = (category: string): string[] => {
  const subcategories = categoriesWithSubcategories[category];
  // Return ["Todo", ...subcategories] if the category exists and has subcategories
  return subcategories ? ["Todo", ...subcategories] : [];
};

// List of all main categories
export const mainCategories: string[] = [
  "Todo",
  "Frutas",
  "Verdura",
  "Carnicería",
  "Fiambres",
  "Almacén",
  "Limpieza",
  "Bebidas",
  // Add any other main categories without subcategories if needed
];

// Define a type for the Product, ensuring subcategory is included
export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  subcategory: string | null; // Added subcategory field
  image_url: string | null;
  stock: number;
  created_at: string;
  // Add fields fetched from DB and potentially used elsewhere
  is_paused?: boolean; // Make optional if not always present/needed everywhere
  unit_type: 'kg' | 'unit'; // Made non-optional, assuming it's always present in DB
  promotion_price?: number | null; // Add promotion price if needed
}
