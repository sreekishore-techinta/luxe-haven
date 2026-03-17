import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";

export interface CartProduct {
  id: string;          // product ID (string to support both static & API ids)
  name: string;
  price: number;
  discount_price?: number | null;
  image: string;
  fabric?: string;
  color?: string;
  sku?: string;
  stock_quantity?: number;
  stock_qty?: number; // fallback
  status?: string;
  category?: string;
  // Keep legacy fields for static data compat
  [key: string]: unknown;
}

interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: CartProduct) => {
    const id = String(product.id);
    const availableStock = product.stock_quantity ?? product.stock_qty ?? 50;

    if (availableStock <= 0 || product.status === "Out of Stock") {
      toast.error("This masterpiece is currently out of stock.");
      return;
    }

    setItems((prev) => {
      const existing = prev.find((item) => String(item.product.id) === id);
      if (existing) {
        if (existing.quantity >= availableStock) {
          toast.error(`Maximum available quantity is ${availableStock}`);
          return prev;
        }
        return prev.map((item) =>
          String(item.product.id) === id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product: { ...product, id }, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => String(item.product.id) !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = items.find(i => String(i.product.id) === productId);
    if (item) {
      const availableStock = item.product.stock_quantity ?? item.product.stock_qty ?? 50;
      if (quantity > availableStock) {
        toast.error(`Only ${availableStock} items are currently available in our collection.`);
        return;
      }
    }

    setItems((prev) =>
      prev.map((item) =>
        String(item.product.id) === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.product.discount_price || item.product.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
