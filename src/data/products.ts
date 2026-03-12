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
  // ── Pure Silk ──────────────────────────────────────────────────────────────
  {
    id: "1",
    name: "Crimson Silk Saree with Gold Zari Border",
    price: 7590,
    originalPrice: 12590,
    image: product1,
    category: "Sarees",
    description:
      "A stunning deep red pure silk saree featuring an exquisite gold zari border. Perfect for weddings and festive occasions. Hand-woven by master artisans.",
    fabric: "Pure Silk",
    color: "Crimson Red",
    isNew: true,
    inStock: true,
  },
  {
    id: "3",
    name: "Royal Blue Pure Silk Saree",
    price: 6490,
    originalPrice: 9990,
    image: product3,
    category: "Sarees",
    description:
      "An elegant royal blue pure silk saree adorned with silver threadwork floral motifs. Features a contrasting silver border that adds regal sophistication.",
    fabric: "Pure Silk",
    color: "Royal Blue",
    isNew: true,
    inStock: true,
  },
  {
    id: "5",
    name: "Ivory Silk Saree with Pearl Embellishments",
    price: 9990,
    image: product5,
    category: "Sarees",
    description:
      "A graceful ivory white silk saree with delicate gold border and subtle pearl embellishments. Ideal for elegant gatherings and cultural events.",
    fabric: "Pure Silk",
    color: "Ivory White",
    isBestSeller: true,
    inStock: true,
  },
  {
    id: "ps-4",
    name: "Deep Teal Pure Silk Saree",
    price: 8290,
    originalPrice: 11990,
    image: product8,
    category: "Sarees",
    description:
      "A rich teal pure silk saree with delicate gold motifs and a luxurious sheen. Perfect for evening events and cultural gatherings.",
    fabric: "Pure Silk",
    color: "Teal",
    isNew: true,
    inStock: true,
  },

  // ── Banarasi Silk ───────────────────────────────────────────────────────────
  {
    id: "2",
    name: "Emerald Green Banarasi Silk Saree",
    price: 8990,
    originalPrice: 14990,
    image: product2,
    category: "Sarees",
    description:
      "A luxurious emerald green Banarasi silk saree with intricate gold embroidery and traditional motifs. A masterpiece of Indian textile artistry.",
    fabric: "Banarasi Silk",
    color: "Emerald Green",
    isBestSeller: true,
    inStock: true,
  },
  {
    id: "4",
    name: "Pink & Gold Banarasi Bridal Saree",
    price: 15990,
    originalPrice: 22990,
    image: product4,
    category: "Sarees",
    description:
      "A breathtaking pink and gold Banarasi silk saree with heavy zari work, perfect for bridal occasions.",
    fabric: "Banarasi Silk",
    color: "Pink & Gold",
    isBestSeller: true,
    inStock: true,
  },
  {
    id: "bn-3",
    name: "Midnight Navy Banarasi Brocade Saree",
    price: 11490,
    originalPrice: 17990,
    image: product6,
    category: "Sarees",
    description:
      "A majestic navy blue Banarasi brocade saree with silver and gold zari weaving, perfect for grand occasions.",
    fabric: "Banarasi Silk",
    color: "Navy Blue",
    isNew: true,
    inStock: true,
  },
  {
    id: "bn-4",
    name: "Crimson Banarasi Silk with Floral Zari",
    price: 13990,
    originalPrice: 19990,
    image: product1,
    category: "Sarees",
    description:
      "An opulent crimson Banarasi silk saree adorned with intricate floral zari motifs woven by master weavers of Varanasi.",
    fabric: "Banarasi Silk",
    color: "Crimson",
    isBestSeller: true,
    inStock: true,
  },

  // ── Kanjivaram Silk ─────────────────────────────────────────────────────────
  {
    id: "6",
    name: "Purple Kanjivaram Silk Saree",
    price: 11990,
    originalPrice: 16990,
    image: product6,
    category: "Sarees",
    description:
      "A rich purple Kanjivaram silk saree with traditional temple border in gold. Each piece is a work of art woven on handlooms by skilled artisans.",
    fabric: "Kanjivaram Silk",
    color: "Purple & Gold",
    isBestSeller: true,
    inStock: true,
  },
  {
    id: "kj-2",
    name: "Vermillion Kanjivaram with Zari Peacock Border",
    price: 18490,
    originalPrice: 26990,
    image: product4,
    category: "Sarees",
    description:
      "An exquisite vermillion Kanjivaram saree with an elaborate gold zari peacock border — the hallmark of South Indian bridal elegance.",
    fabric: "Kanjivaram Silk",
    color: "Vermillion",
    isBestSeller: true,
    inStock: true,
  },
  {
    id: "kj-3",
    name: "Bottle Green Kanjivaram Temple Saree",
    price: 14990,
    originalPrice: 20990,
    image: product2,
    category: "Sarees",
    description:
      "A grand bottle green Kanjivaram saree with traditional temple border and rich contrast pallu with gold zari.",
    fabric: "Kanjivaram Silk",
    color: "Bottle Green",
    isNew: true,
    inStock: true,
  },
  {
    id: "kj-4",
    name: "Royal Gold Kanjivaram Bridal Saree",
    price: 22990,
    originalPrice: 32990,
    image: product5,
    category: "Sarees",
    description:
      "A spectacular gold Kanjivaram saree with heavy zari weaving throughout — the ultimate bridal masterpiece from the looms of Kanchipuram.",
    fabric: "Kanjivaram Silk",
    color: "Royal Gold",
    isNew: true,
    inStock: true,
  },

  // ── Mysore Silk ─────────────────────────────────────────────────────────────
  {
    id: "7",
    name: "Coral Orange Mysore Silk Saree",
    price: 5990,
    originalPrice: 8990,
    image: product7,
    category: "Sarees",
    description:
      "A vibrant coral orange Mysore silk saree with a contrasting gold border. Lightweight yet luxurious, perfect for daytime celebrations.",
    fabric: "Mysore Silk",
    color: "Coral Orange",
    isNew: true,
    inStock: true,
  },
  {
    id: "my-2",
    name: "Rose Pink Mysore Crepe Silk Saree",
    price: 4990,
    originalPrice: 7490,
    image: product3,
    category: "Sarees",
    description:
      "A delicate rose pink Mysore crepe silk saree with silver border — lightweight, breathable, and perfect for all-day wear.",
    fabric: "Mysore Silk",
    color: "Rose Pink",
    isNew: true,
    inStock: true,
  },
  {
    id: "my-3",
    name: "Jade Green Mysore Pure Silk Saree",
    price: 6290,
    originalPrice: 9490,
    image: product8,
    category: "Sarees",
    description:
      "A vibrant jade green Mysore pure silk saree with a classic gold border — a statement piece for festive occasions.",
    fabric: "Mysore Silk",
    color: "Jade Green",
    isBestSeller: true,
    inStock: true,
  },
  {
    id: "my-4",
    name: "Sky Blue Mysore Silk with Gold Motifs",
    price: 5490,
    originalPrice: 8490,
    image: product1,
    category: "Sarees",
    description:
      "A serene sky blue Mysore silk saree with scattered gold motifs and an elegant gold border — ideal for daytime elegance.",
    fabric: "Mysore Silk",
    color: "Sky Blue",
    inStock: true,
  },

  // ── Patola Silk ─────────────────────────────────────────────────────────────
  {
    id: "8",
    name: "Teal Patola Silk Saree",
    price: 13490,
    originalPrice: 18990,
    image: product8,
    category: "Sarees",
    description:
      "An exquisite teal blue Patola silk saree featuring geometric patterns in gold thread. Double ikat weaving technique makes each piece truly unique.",
    fabric: "Patola Silk",
    color: "Teal Blue",
    isBestSeller: true,
    inStock: true,
  },
  {
    id: "pt-2",
    name: "Scarlet Red Double Ikat Patola Saree",
    price: 16990,
    originalPrice: 24990,
    image: product7,
    category: "Sarees",
    description:
      "A rare scarlet red double ikat Patola saree woven on the traditional looms of Patan, Gujarat — a UNESCO heritage craft.",
    fabric: "Patola Silk",
    color: "Scarlet Red",
    isNew: true,
    inStock: true,
  },
  {
    id: "pt-3",
    name: "Indigo Geometric Patola Saree",
    price: 14990,
    originalPrice: 21990,
    image: product3,
    category: "Sarees",
    description:
      "A stunning indigo Patola saree with bold geometric double-ikat patterns. Each thread interlocked with precision in the 700-year-old tradition.",
    fabric: "Patola Silk",
    color: "Indigo",
    isBestSeller: true,
    inStock: true,
  },
  {
    id: "pt-4",
    name: "Saffron & Gold Patola Weave Saree",
    price: 19490,
    originalPrice: 28990,
    image: product4,
    category: "Sarees",
    description:
      "A magnificent saffron and gold Patola saree with intricate elephant and parrot motifs — a collector's piece of Indian textile art.",
    fabric: "Patola Silk",
    color: "Saffron & Gold",
    isNew: true,
    inStock: true,
  },

  // ── Chanderi Silk ───────────────────────────────────────────────────────────
  {
    id: "ch-1",
    name: "Mint Green Chanderi Silk Saree",
    price: 3990,
    originalPrice: 5990,
    image: product5,
    category: "Sarees",
    description:
      "A sheer and airy mint green Chanderi silk saree with delicate gold bootis and a graceful drape — perfect for summer occasions.",
    fabric: "Chanderi Silk",
    color: "Mint Green",
    isNew: true,
    inStock: true,
  },
  {
    id: "ch-2",
    name: "Powder Blue Chanderi with Zari Checks",
    price: 4490,
    originalPrice: 6990,
    image: product2,
    category: "Sarees",
    description:
      "A translucent powder blue Chanderi saree with classic zari check weave — light as a feather and elegantly timeless.",
    fabric: "Chanderi Silk",
    color: "Powder Blue",
    isBestSeller: true,
    inStock: true,
  },
  {
    id: "ch-3",
    name: "Peach Chanderi Silk with Gold Border",
    price: 3590,
    originalPrice: 5490,
    image: product6,
    category: "Sarees",
    description:
      "A soft peach Chanderi silk saree with delicate gold border and fine texture — a must-have for casual festive wear.",
    fabric: "Chanderi Silk",
    color: "Peach",
    isNew: true,
    inStock: true,
  },

  // ── Pochampally Ikat ───────────────────────────────────────────────────────
  {
    id: "po-1",
    name: "Turquoise Pochampally Ikat Saree",
    price: 5490,
    originalPrice: 8490,
    image: product8,
    category: "Sarees",
    description:
      "A vibrant turquoise Pochampally ikat saree with geometric resist-dyed patterns from the looms of Telangana.",
    fabric: "Pochampally Ikat",
    color: "Turquoise",
    isNew: true,
    inStock: true,
  },
  {
    id: "po-2",
    name: "Emerald Pochampally Silk Ikat Saree",
    price: 6990,
    originalPrice: 9490,
    image: product1,
    category: "Sarees",
    description:
      "An earthy emerald Pochampally saree with bold ikat patterns — a celebration of Telangana's handloom heritage.",
    fabric: "Pochampally Ikat",
    color: "Emerald",
    isBestSeller: true,
    inStock: true,
  },
  {
    id: "po-3",
    name: "Rust & Black Pochampally Ikat Saree",
    price: 5990,
    originalPrice: 8990,
    image: product7,
    category: "Sarees",
    description:
      "A bold rust and black Pochampally ikat saree with large geometric ikat motifs and a classic cotton-silk blend.",
    fabric: "Pochampally Ikat",
    color: "Rust & Black",
    isNew: true,
    inStock: true,
  },

  // ── Tussar Silk ────────────────────────────────────────────────────────────
  {
    id: "ts-1",
    name: "Golden Tussar Silk Saree with Embroidery",
    price: 7990,
    originalPrice: 11990,
    image: product2,
    category: "Sarees",
    description:
      "A natural golden tussar silk saree with hand-painted floral embroidery — rustic elegance at its finest.",
    fabric: "Tussar Silk",
    color: "Golden",
    isBestSeller: true,
    inStock: true,
  },
  {
    id: "ts-2",
    name: "Copper Brown Tussar Silk Saree",
    price: 6490,
    originalPrice: 9990,
    image: product3,
    category: "Sarees",
    description:
      "A rich copper brown tussar saree with kalamkari print border — earthy, textured, and uniquely beautiful.",
    fabric: "Tussar Silk",
    color: "Copper Brown",
    isNew: true,
    inStock: true,
  },
  {
    id: "ts-3",
    name: "Off-White Tussar with Kantha Embroidery",
    price: 8990,
    originalPrice: 12990,
    image: product5,
    category: "Sarees",
    description:
      "A creamy off-white tussar saree with hand-stitched kantha embroidery from Bengal — a wearable work of art.",
    fabric: "Tussar Silk",
    color: "Off-White",
    isBestSeller: true,
    inStock: true,
  },
  {
    id: "bl-1",
    name: "Hand-Embroidered Zardosi Blouse",
    price: 3500,
    originalPrice: 4500,
    image: product1,
    category: "Blouses",
    description: "Intricately hand-embroidered silk blouse with traditional Zardosi work on the back and sleeves.",
    fabric: "Raw Silk",
    color: "Maroon",
    isNew: true,
    inStock: true,
  },
  {
    id: "bl-2",
    name: "Gold Brocade Designer Blouse",
    price: 2800,
    image: product5,
    category: "Blouses",
    description: "Elegant gold brocade blouse with deep neck and designer back pattern.",
    fabric: "Brocade Silk",
    color: "Gold",
    isBestSeller: true,
    inStock: true,
  },
  {
    id: "ss-1",
    name: "Royal Anarkali Silk Suit Set",
    price: 8500,
    originalPrice: 11000,
    image: product6,
    category: "Suit Sets",
    description: "Regal floor-length Anarkali suit in fine silk with a heavily embroidered dupatta.",
    fabric: "Art Silk",
    color: "Purple",
    isNew: true,
    inStock: true,
  },
  {
    id: "ss-2",
    name: "Pastel Green Straight Kurta Set",
    price: 5200,
    image: product2,
    category: "Suit Sets",
    description: "Graceful pastel green straight kurta with matching pants and a sheer organza dupatta.",
    fabric: "Chanderi",
    color: "Mint Green",
    isBestSeller: true,
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
