
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header';
import CartItem from '@/components/CartItem';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

const Cart = () => {
  const { cartItems, totalItems, totalAmount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated) {
    return null; // We'll redirect to login, no need to render anything
  }
  
  const handleCheckout = () => {
    // Check if any items are missing service type
    const hasMissingServiceType = cartItems.some(item => !item.serviceType);
    if (hasMissingServiceType) {
      toast.error("Please select service type (dine-in/takeaway) for all items");
      return;
    }
    
    navigate('/checkout');
  };
  
  if (totalItems === 0) {
    return (
      <div>
        <Header />
        <div className="container max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some delicious items from our menu!</p>
          <Button 
            className="bg-foodcourt-red hover:bg-red-600"
            onClick={() => navigate('/')}
          >
            Browse Menu
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <Header />
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          {cartItems.map(item => (
            <CartItem key={item.id} item={item} />
          ))}
          
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center mb-2">
              <span>Subtotal</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold">Total</span>
              <span className="font-bold text-xl text-foodcourt-red">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            
            <Button 
              className="w-full bg-foodcourt-red hover:bg-red-600"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
