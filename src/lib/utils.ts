import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FoodItem } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function isInTimeSlot(timeSlot: "morning" | "afternoon" | "both"): boolean {
  const now = new Date();
  // Adjust to IST (UTC+5:30)
  const offsetIST = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
  const istDate = new Date(now.getTime() + offsetIST);
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();

  if (timeSlot === "morning") {
    // 8:00 AM - 10:25 AM IST
    return (hours === 8 || hours === 9 || (hours === 10 && minutes <= 25));
  } else if (timeSlot === "afternoon") {
    // 11:00 AM - 2:55 PM IST
    return (
      hours === 11 ||
      hours === 12 ||
      hours === 13 ||
      (hours === 14 && minutes <= 55)
    );
  } else if (timeSlot === "both") {
    // Available in both morning and afternoon slots
    return isInTimeSlot("morning") || isInTimeSlot("afternoon");
  }

  return false;
}

export function isAvailable(item: FoodItem): boolean {
  // Check if the current time is within the item's time slot
  const isInTime = isInTimeSlot(item.timeSlot);
  // Check if the item has sufficient quantity
  const hasQuantity = item.quantity > 0;
  // Check if the item is active
  const isActive = item.isActive;

  return isInTime && hasQuantity && isActive;
}

export function getTimeSlotLabel(timeSlot: "morning" | "afternoon" | "both"): string {
  return timeSlot === "morning"
    ? "Morning (8:00 AM - 10:25 AM)"
    : timeSlot === "afternoon"
    ? "Afternoon (11:00 AM - 2:55 PM)"
    : "Both (8:00 AM - 2:55 PM)";
}

// For development/demo purposes only
export function getCurrentTimeForDemo(): Date {
  const savedTime = localStorage.getItem('demoTime');
  if (savedTime) {
    return new Date(savedTime);
  }
  return new Date();
}

export function setDemoTime(hours: number, minutes: number): void {
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  date.setMilliseconds(0);
  localStorage.setItem('demoTime', date.toISOString());
}