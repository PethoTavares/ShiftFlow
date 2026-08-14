import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: Date | string, pattern = "MMM d, yyyy") {
  return format(new Date(value), pattern);
}

export function formatDateTime(value: Date | string) {
  return format(new Date(value), "MMM d, yyyy 'at' h:mm a");
}

export function getQueryStringMessage(value: string | string[] | undefined) {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] : value;
}
