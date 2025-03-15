// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const prod = "https://smartfarm-a3h7hjf7b8b0d8h9.southafricanorth-01.azurewebsites.net"