import React from 'react';
import FoodCard from '@/components/FoodCard';
import { FoodItem } from '@/types';

interface TimeSlotSectionProps {
  timeSlot: "morning" | "afternoon";
  items: FoodItem[];
}

const TimeSlotSection: React.FC<TimeSlotSectionProps> = ({ timeSlot, items }) => {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">{timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)} Menu</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <FoodCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default TimeSlotSection;