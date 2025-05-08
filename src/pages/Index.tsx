import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import TimeSlotSection from '@/components/TimeSlotSection';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { FoodItem } from '@/types';

const Index: React.FC = () => {
  const [morningItems, setMorningItems] = useState<FoodItem[]>([]);
  const [afternoonItems, setAfternoonItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const newSocket = io(BASE_URL, {
      reconnection: true,
      transports: ['websocket'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    newSocket.on('menuItemUpdated', (updatedItem: any) => {
      const mappedItem: FoodItem = {
        id: updatedItem._id,
        name: updatedItem.name,
        description: updatedItem.description,
        price: updatedItem.price,
        category: updatedItem.category,
        image: updatedItem.image || undefined,
        timeSlot: updatedItem.availableTime as "morning" | "afternoon" | "both",
        type: mapCategoryToType(updatedItem.category),
        isActive: updatedItem.isActive,
        quantity: updatedItem.quantity || 0,
      };
      updateItems(mappedItem);
    });

    newSocket.on('menuItemDeleted', (itemId: string) => {
      setMorningItems((prev) => prev.filter((item) => item.id !== itemId));
      setAfternoonItems((prev) => prev.filter((item) => item.id !== itemId));
    });

    newSocket.on('inventoryUpdated', ({ menuItemId, quantity }) => {
      setMorningItems((prev) =>
        prev.map((item) =>
          item.id === menuItemId ? { ...item, quantity } : item
        )
      );
      setAfternoonItems((prev) =>
        prev.map((item) =>
          item.id === menuItemId ? { ...item, quantity } : item
        )
      );
    });

    newSocket.on('inventoryReset', () => {
      setMorningItems((prev) =>
        prev.map((item) => ({ ...item, quantity: 0 }))
      );
      setAfternoonItems((prev) =>
        prev.map((item) => ({ ...item, quantity: 0 }))
      );
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/menu-items`);
        const items: FoodItem[] = response.data.menuItems.map((item: any) => ({
          id: item._id,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          image: item.image || undefined,
          timeSlot: item.availableTime as "morning" | "afternoon" | "both",
          type: mapCategoryToType(item.category),
          isActive: item.isActive,
          quantity: item.quantity || 0,
        }));
        setMorningItems(items.filter((item) => item.timeSlot === "morning" || item.timeSlot === "both"));
        setAfternoonItems(items.filter((item) => item.timeSlot === "afternoon" || item.timeSlot === "both"));
        setLoading(false);
      } catch (err) {
        setError('Failed to load menu items');
        setLoading(false);
        console.error('Error fetching menu items:', err);
      }
    };

    fetchFoodItems();
  }, []);

  const mapCategoryToType = (category: string): "regular" | "premium" | "deluxe" => {
    switch (category) {
      case 'deals':
        return 'premium';
      case 'snacks':
        return 'deluxe';
      case 'juices':
      case 'beverages':
        return 'regular';
      default:
        return 'regular';
    }
  };

  const updateItems = (updatedItem: FoodItem) => {
    setMorningItems((prev) => {
      const index = prev.findIndex((item) => item.id === updatedItem.id);
      if (index > -1) {
        const newItems = [...prev];
        newItems[index] = updatedItem;
        return newItems;
      } else if (updatedItem.timeSlot === "morning" || updatedItem.timeSlot === "both") {
        return [...prev, updatedItem];
      }
      return prev;
    });

    setAfternoonItems((prev) => {
      const index = prev.findIndex((item) => item.id === updatedItem.id);
      if (index > -1) {
        const newItems = [...prev];
        newItems[index] = updatedItem;
        return newItems;
      } else if (updatedItem.timeSlot === "afternoon" || updatedItem.timeSlot === "both") {
        return [...prev, updatedItem];
      }
      return prev;
    });
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div>
      <Header />
      <Hero />
      <div className="container mx-auto px-4 pb-12" id="menu">
        <h1 className="text-3xl font-bold mt-12 mb-6">Today's Menu</h1>
        <TimeSlotSection timeSlot="morning" items={morningItems} />
        <TimeSlotSection timeSlot="afternoon" items={afternoonItems} />
      </div>
    </div>
  );
};

export default Index;
