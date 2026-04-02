import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API_URL as API } from "@/api_config";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface AuthContextType {
  customer: Customer | null;
  isLoggedIn: boolean;
  loading: boolean;
  checkAuth: () => Promise<boolean>;
  login: (customer: Customer) => void;
  logout: () => void;
  requireAuth: (callback: () => void, message?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API}/auth/customer_check.php`, { credentials: "include" });
      const json = await res.json();
      if (json.loggedIn) {
        setCustomer(json.customer);
        return true;
      } else {
        setCustomer(null);
        return false;
      }
    } catch (err) {
      console.error("Auth check failed", err);
      setCustomer(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (c: Customer) => {
    setCustomer(c);
  };

  const logout = async () => {
    try {
      await fetch(`${API}/auth/customer_logout.php`, { method: "POST", credentials: "include" });
    } catch (err) {
      // If logout.php doesn't exist, we fallback to session clearing via customer_check.php POST if it supports it
      await fetch(`${API}/auth/customer_check.php`, { method: "POST", credentials: "include" });
    }
    setCustomer(null);
    toast.success("Successfully logged out");
    navigate("/");
  };

  const requireAuth = (callback: () => void, message: string = "Please login to continue") => {
    if (customer) {
      callback();
    } else {
      toast.info(message);
      const returnUrl = encodeURIComponent(location.pathname + location.search);
      navigate(`/account?returnTo=${returnUrl}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        isLoggedIn: !!customer,
        loading,
        checkAuth,
        login,
        logout,
        requireAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
