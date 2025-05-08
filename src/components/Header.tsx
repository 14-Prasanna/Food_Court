
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

const Header = () => {
  const { totalItems } = useCart();
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full shadow-sm bg-white">
      <div className="container mx-auto flex items-center justify-between py-4 px-4">
        <Link to="/" className="text-2xl font-bold text-foodcourt-red">
          KIOT FOOD COURT
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-gray-800 hover:text-foodcourt-red">
            Home
          </Link>
          
          {isAuthenticated ? (
            <Link to="/profile" className="text-gray-800 hover:text-foodcourt-red">
              My Account
            </Link>
          ) : (
            <Link to="/login" className="text-gray-800 hover:text-foodcourt-red">
              Login
            </Link>
          )}
          
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-foodcourt-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
