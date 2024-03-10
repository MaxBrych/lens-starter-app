import { ThirdwebStorage } from "@thirdweb-dev/storage";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Assuming you have set up the .env file with NEXT_PUBLIC_SECRET_KEY for ThirdwebStorage
const client_id = process.env.NEXT_PUBLIC_CLIENT_ID;
export const storage = new ThirdwebStorage({ clientId: client_id });
