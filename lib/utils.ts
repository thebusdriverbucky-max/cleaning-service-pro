// File: lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CURRENCY_RULES: Record<string, { symbol: string; position: "before" | "after" }> = {
  USD: { symbol: "$", position: "before" },
  EUR: { symbol: "€", position: "after" },
  GBP: { symbol: "£", position: "before" },
  CAD: { symbol: "CA$", position: "before" },
  AUD: { symbol: "A$", position: "before" },
  UAH: { symbol: "₴", position: "after" },
};

export function formatPrice(price: number | string | any, currency: string = "USD"): string {
  const numPrice = parseFloat(String(price));

  if (isNaN(numPrice)) {
    return "0.00";
  }

  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numPrice);

  const rule = CURRENCY_RULES[currency.toUpperCase()];

  if (rule) {
    return rule.position === "before"
      ? `${rule.symbol}${formattedNumber}`
      : `${formattedNumber}${rule.symbol}`;
  }

  return `${currency.toUpperCase()} ${formattedNumber}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>\"']/g, "")
    .substring(0, 500);
}

/**
 * Escape user-provided text before inserting into HTML email templates
 * to prevent HTML injection / broken layout in email clients.
 */
export function escapeHtml(input: unknown): string {
  if (input == null) return "";
  const amp = String.fromCharCode(38); // &
  const lt = String.fromCharCode(60);  // <
  const gt = String.fromCharCode(62);  // >
  const quot = String.fromCharCode(34); // "
  const apos = String.fromCharCode(39); // '
  return String(input)
    .replace(new RegExp(amp, "g"), amp + "amp;")
    .replace(new RegExp(lt, "g"), amp + "lt;")
    .replace(new RegExp(gt, "g"), amp + "gt;")
    .replace(new RegExp(quot, "g"), amp + "quot;")
    .replace(new RegExp(apos, "g"), amp + "#39;");
}
