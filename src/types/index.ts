export type FoodItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  timeSlot: "morning" | "afternoon" | "both";
  type: "regular" | "premium" | "deluxe";
  isActive: boolean;
  quantity: number; // Add quantity
};

export type OrderDetails = {
  items: {
    id: number;
    name: string;
    price: number;
    quantity: number;
    serviceType: "dine-in" | "takeaway";
  }[];
  totalAmount: number;
  paymentMethod: "cash" | "card" | "upi";
  customerPhone: string;
  orderDate: Date;
  serviceType: "dine-in" | "takeaway";
};

export type FeedbackData = {
  rating: number;
  comment: string;
  orderId: string;
};