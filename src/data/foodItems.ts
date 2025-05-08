
import { FoodItem } from "@/types";

const foodItems: FoodItem[] = [
  {
    id: 1,
    name: "Dosa",
    description: "Dosas with chutney and sambar",
    price: 599,
    stock: 5,
    category: "South Indian",
    image: "/lovable-uploads/f70bd4a0-54ae-422f-bede-94eff5372a01.png",
    timeSlot: "morning",
    type: "premium"
  },
  {
    id: 2,
    name: "Lunch Thali Special",
    description: "Full South Indian thali with 6 varieties",
    price: 399,
    stock: 0,
    category: "South Indian",
    timeSlot: "afternoon",
    type: "deluxe"
  },
  {
    id: 3,
    name: "Weekend Idli Feast",
    description: "12 Idlis with unlimited sambar and chutney",
    price: 349,
    stock: 0,
    category: "South Indian",
    timeSlot: "morning",
    type: "premium"
  },
  {
    id: 4,
    name: "Vada Sambar Combo",
    description: "6 Vadas with special sambar",
    price: 199,
    stock: 0,
    category: "South Indian",
    timeSlot: "morning",
    type: "regular"
  },
  {
    id: 5,
    name: "Paneer Butter Masala",
    description: "Rich and creamy paneer curry with butter",
    price: 299,
    stock: 8,
    category: "North Indian",
    timeSlot: "afternoon",
    type: "premium"
  },
  {
    id: 6,
    name: "Masala Chai",
    description: "Traditional Indian spiced tea",
    price: 49,
    stock: 25,
    category: "Beverages",
    timeSlot: "morning",
    type: "regular"
  },
  {
    id: 7,
    name: "Chicken Biryani",
    description: "Fragrant rice dish with spiced chicken",
    price: 349,
    stock: 10,
    category: "North Indian",
    timeSlot: "afternoon",
    type: "deluxe"
  },
  {
    id: 8,
    name: "Filter Coffee",
    description: "South Indian filter coffee, freshly brewed",
    price: 79,
    stock: 18,
    category: "Beverages",
    timeSlot: "morning",
    type: "premium"
  }
];

export default foodItems;
