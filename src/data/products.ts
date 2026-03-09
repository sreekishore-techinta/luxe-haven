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

export const products: Product[] = [
  {
    id: "1",
    name: "Crimson Silk Saree with Gold Zari Border",
    price: 7590,
    originalPrice: 12590,
    image: product1,
    category: "Sarees",
    description: "A stunning deep red pure silk saree featuring an exquisite gold zari border. Perfect for weddings and festive occasions. Hand-woven by master artisans using traditional techniques passed down through generations.",
    fabric: "Pure Silk",
    color: "Crimson Red",
    isNew: true,
    inStock: true,
  },
  {
    id: "2",
    name: "Emerald Green Banarasi Silk Saree",
    price: 8990,
    originalPrice: 14990,
    image: product2,
    category: "Sarees",
    description: "A luxurious emerald green Banarasi silk saree with intricate gold embroidery and traditional motifs. A masterpiece of Indian textile artistry.",
    fabric: "Banarasi Silk",
    color: "Emerald Green",
    isBestSeller: true,
    inStock: true,
  },
  {
    id: "3",
    name: "Royal Blue Pure Silk Saree",
    price: 6490,
    originalPrice: 9990,
    image: product3,
    category: "Sarees",
    description: "An elegant royal blue pure silk saree adorned with silver threadwork floral motifs. Features a contrasting silver border that adds regal sophistication.",
    fabric: "Pure Silk",
    color: "Royal Blue",
    isNew: true,
    inStock: true,
  },
  {
    id: "4",
    name: "Pink & Gold Banarasi Bridal Saree",
    price: 15990,
    originalPrice: 22990,
    image: product4,
    category: "Sarees",
    description: "A breathtaking pink and gold Banarasi silk saree with heavy zari work, perfect for bridal occasions. This exquisite piece showcases the finest craftsmanship.",
    fabric: "Banarasi Silk",
    color: "Pink & Gold",
    isBestSeller: true,
    inStock: true,
  },
  {
    id: "5",
    name: "Ivory Silk Saree with Pearl Embellishments",
    price: 9990,
    image: product5,
    category: "Sarees",
    description: "A graceful ivory white silk saree with delicate gold border and subtle pearl embellishments. Ideal for elegant gatherings and cultural events.",
    fabric: "Pure Silk",
    color: "Ivory White",
    inStock: true,
  },
  {
    id: "6",
    name: "Purple Kanjivaram Silk Saree",
    price: 11990,
    originalPrice: 16990,
    image: product6,
    category: "Sarees",
    description: "A rich purple Kanjivaram silk saree with traditional temple border in gold. Each piece is a work of art woven on handlooms by skilled artisans.",
    fabric: "Kanjivaram Silk",
    color: "Purple & Gold",
    isBestSeller: true,
    inStock: true,
  },
  {
    id: "7",
    name: "Coral Orange Mysore Silk Saree",
    price: 5990,
    originalPrice: 8990,
    image: product7,
    category: "Sarees",
    description: "A vibrant coral orange Mysore silk saree with a contrasting gold border. Lightweight yet luxurious, perfect for daytime celebrations.",
    fabric: "Mysore Silk",
    color: "Coral Orange",
    isNew: true,
    inStock: true,
  },
  {
    id: "8",
    name: "Teal Patola Silk Saree",
    price: 13490,
    originalPrice: 18990,
    image: product8,
    category: "Sarees",
    description: "An exquisite teal blue Patola silk saree featuring geometric patterns in gold thread. Double ikat weaving technique makes each piece truly unique.",
    fabric: "Patola Silk",
    color: "Teal Blue",
    inStock: true,
  },
];

export const categories = [
  { name: "Sarees", slug: "sarees" },
  { name: "Blouses", slug: "blouses" },
  { name: "Suit Sets", slug: "suit-sets" },
  { name: "New Arrivals", slug: "new-arrivals" },
  { name: "Best Sellers", slug: "best-sellers" },
];
