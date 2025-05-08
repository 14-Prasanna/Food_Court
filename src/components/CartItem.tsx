
import React from 'react';
import { CartItem as CartItemType, useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CartItemProps {
  item: CartItemType;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart, updateServiceType } = useCart();
  
  return (
    <div className="flex items-center justify-between border-b py-4">
      <div className="flex-1">
        <h3 className="font-semibold">{item.name}</h3>
        <div className="text-sm text-gray-500">
          {formatCurrency(item.price)} × {item.quantity}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Select
          value={item.serviceType || undefined}
          onValueChange={(value) => 
            updateServiceType(item.id, value as "dine-in" | "takeaway")
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dine-in">Dine-in</SelectItem>
            <SelectItem value="takeaway">Takeaway</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
          >
            -
          </Button>
          <span>{item.quantity}</span>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
          >
            +
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="text-red-500 hover:text-red-700 hover:bg-transparent"
          onClick={() => removeFromCart(item.id)}
        >
          Remove
        </Button>
      </div>
    </div>
  );
};

export default CartItem;
