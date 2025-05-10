import React, { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "@/components/ui/sonner";

type User = {
  phone: string;
  name?: string;
  role: 'admin' | 'customer';
};

const BASE_URL = "https://server-food-court.onrender.com"; // Hardcoded for consistency

const normalizePhone = (phone: string): string => {
  let normalized = phone.replace(/\s+/g, '');
  if (!normalized.startsWith('+')) {
    normalized = `+91${normalized}`; // Add +91 for India
  }
  return normalized;
};

type AuthContextType = {
  user: User | null;
  sendOTP: (phone: string, role: 'admin' | 'customer') => Promise<void>;
  verifyOTP: (phone: string, otp: string, name?: string, role?: 'admin' | 'customer') => Promise<void>;
  checkUser: (phone: string, role: 'admin' | 'customer') => Promise<{ exists: boolean; name?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && typeof parsedUser === 'object' && 'phone' in parsedUser && 'role' in parsedUser) {
          return { ...parsedUser, phone: normalizePhone(parsedUser.phone) };
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        localStorage.removeItem('user');
      }
    }
    return null;
  });

  const sendOTP = async (phone: string, role: 'admin' | 'customer') => {
    const normalizedPhone = normalizePhone(phone);
    try {
      const response = await fetch(`${BASE_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ phone: normalizedPhone, role }),
      });

      const result = await response.json();
      if (result.status === "success") {
        toast.success("OTP sent to your phone number");
      } else {
        throw new Error(result.error || "Failed to send OTP");
      }
    } catch (error: any) {
      console.error("Send OTP error:", error);
      toast.error(error.message || "Failed to send OTP");
      throw error;
    }
  };

  const verifyOTP = async (phone: string, otp: string, name?: string, role: 'admin' | 'customer' = 'customer') => {
    const normalizedPhone = normalizePhone(phone);
    try {
      const response = await fetch(`${BASE_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ phone: normalizedPhone, otp, name, role }),
      });

      const result = await response.json();
      if (result.status === "success") {
        const userData = role === 'admin' ? result.admin : result.user;
        if (userData) {
          const updatedUser = { ...userData, role };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          toast.success("Logged in successfully");
        } else {
          throw new Error("User data not found in response");
        }
      } else {
        throw new Error(result.error || "Invalid OTP");
      }
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      toast.error(error.message || "Invalid OTP");
      throw error;
    }
  };

  const checkUser = async (phone: string, role: 'admin' | 'customer') => {
    const normalizedPhone = normalizePhone(phone);
    try {
      const endpoint = role === 'admin' ? '/admin/check' : '/check-user';
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ phone: normalizedPhone }),
      });

      const result = await response.json();
      if (result.status === "success") {
        return { exists: result.exists, name: result.name };
      } else {
        throw new Error(result.error || "Failed to check user");
      }
    } catch (error: any) {
      console.error("Check user error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{
      user,
      sendOTP,
      verifyOTP,
      checkUser,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
