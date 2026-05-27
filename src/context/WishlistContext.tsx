import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { API_URL as API } from "@/api_config";

interface WishlistProduct {
    id: string;
    name: string;
    price: number;
    discount_price?: number;
    image: string;
    category?: string;
    fabric?: string;
}

interface WishlistContextType {
    wishlist: WishlistProduct[];
    toggleWishlist: (product: WishlistProduct) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    totalWishlisted: number;
    isLoading: boolean;
    refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const WISHLIST_STORAGE_KEY = "luxe_haven_wishlist";

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const [wishlist, setWishlist] = useState<WishlistProduct[]>(() => {
        try {
            const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const { isLoggedIn } = useAuth();

    useEffect(() => {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    }, [wishlist]);

    useEffect(() => {
        if (isLoggedIn) {
            fetchWishlist();
        }
    }, [isLoggedIn]);

    const fetchWishlist = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API}/public/wishlist.php`, { credentials: "include" });
            const json = await res.json();
            if (json.status === 'success') {
                const mapped = json.data.map((p: any) => ({
                    id: String(p.id),
                    name: p.name,
                    price: parseFloat(p.price),
                    discount_price: p.discount_price ? parseFloat(p.discount_price) : undefined,
                    image: p.image,
                    category: p.category_name || p.category,
                    fabric: p.fabric
                }));
                setWishlist(mapped);
            }
        } catch (err) {
            console.error("Failed to fetch wishlist", err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleWishlist = async (product: WishlistProduct) => {
        if (!isLoggedIn) return; // UI handles the redirect

        try {
            const res = await fetch(`${API}/public/wishlist.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: "include",
                body: JSON.stringify({ product_id: product.id })
            });
            const json = await res.json();

            if (json.status === 'success') {
                if (json.action === 'added') {
                    setWishlist(prev => [...prev, product]);
                    toast.success(`${product.name} added to wishlist`);
                } else {
                    setWishlist(prev => prev.filter(p => String(p.id) !== String(product.id)));
                    toast.info(`${product.name} removed from wishlist`);
                }
            }
        } catch (err) {
            toast.error("Failed to update wishlist");
        }
    };

    const isInWishlist = (productId: string) => {
        return wishlist.some(p => String(p.id) === String(productId));
    };

    const totalWishlisted = wishlist.length;

    return (
        <WishlistContext.Provider value={{
            wishlist,
            toggleWishlist,
            isInWishlist,
            totalWishlisted,
            isLoading,
            refreshWishlist: fetchWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
    return context;
};
