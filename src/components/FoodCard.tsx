import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { FoodItem } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/sonner";

interface FoodCardProps {
  item: FoodItem;
}

const FoodCard: React.FC<FoodCardProps> = ({ item }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [selectedServiceType, setSelectedServiceType] = React.useState<"dine-in" | "takeaway" | null>(null);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    setSelectedServiceType(null);
    setOpen(true);
  };

  const confirmAddToCart = () => {
    if (selectedServiceType) {
      addToCart(
        { id: item.id, name: item.name, price: item.price },
        selectedServiceType
      );
      setOpen(false);
    } else {
      toast.error("Please select a service type");
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="relative">
        <div
          className="h-48 bg-foodcourt-gray flex items-center justify-center text-5xl text-foodcourt-red font-bold"
          style={{
            backgroundImage: item.image ? `url(${item.image})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {!item.image && "Food"}
        </div>
        <div className="absolute top-2 right-2">
          <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
            item.type === 'premium' ? 'bg-green-500' :
            item.type === 'deluxe' ? 'bg-gray-500' :
            'bg-gray-400'
          }`}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </span>
        </div>
      </div>

      <CardContent className="flex-grow p-4">
        <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-foodcourt-red">
            {formatCurrency(item.price)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full bg-foodcourt-red hover:bg-red-600"
          disabled={!item.isActive} // Disable button if item is not active
          onClick={handleAddToCart}
        >
          {item.isActive ? 'Add to Cart' : 'Inactive'}
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Select Service Type</DialogTitle>
              <DialogDescription>
                Would you like to dine-in or take your food as a parcel?
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-4 py-4">
              <Button
                variant={selectedServiceType === "dine-in" ? "default" : "outline"}
                className={`flex-1 ${selectedServiceType === "dine-in" ? "bg-foodcourt-red hover:bg-red-600" : ""}`}
                onClick={() => setSelectedServiceType("dine-in")}
              >
                Hand-on-Food (Dine-in)
              </Button>
              <Button
                variant={selectedServiceType === "takeaway" ? "default" : "outline"}
                className={`flex-1 ${selectedServiceType === "takeaway" ? "bg-foodcourt-red hover:bg-red-600" : ""}`}
                onClick={() => setSelectedServiceType("takeaway")}
              >
                Parcel (Takeaway)
              </Button>
            </div>

            <DialogFooter>
              <Button
                className="bg-foodcourt-red hover:bg-red-600"
                onClick={confirmAddToCart}
              >
                Add to Cart
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default FoodCard;