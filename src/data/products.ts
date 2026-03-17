import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import product7 from "@/assets/product-7.jpg";
import product8 from "@/assets/product-8.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description: string;
  fabric: string;
  color: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  inStock: boolean;
}

/**
 * @deprecated All product data is now fetched from the database API. 
 * Use the /api/public/products.php endpoint instead.
 * This array is intentionally left empty to ensure the application remains dynamic.
 */
export const products: Product[] = [];

export const categories = [
  { name: "Sarees", slug: "sarees" },
  { name: "Blouses", slug: "blouses" },
  { name: "Suit Sets", slug: "suit-sets" },
  { name: "New Arrivals", slug: "new-arrivals" },
  { name: "Best Sellers", slug: "best-sellers" },
];

export const fabricTypes = [
  "All",
  "Pure Silk",
  "Banarasi Silk",
  "Kanjivaram Silk",
  "Mysore Silk",
  "Patola Silk",
  "Chanderi Silk",
  "Pochampally Ikat",
  "Tussar Silk",
];
