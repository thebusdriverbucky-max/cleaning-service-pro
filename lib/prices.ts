// File: lib/prices.ts

import { FREQUENCY_DISCOUNTS } from "./constants";

export interface CalculateOrderPriceInput {
  service: {
    basePrice: number;
    pricePerSqm: number | null;
    minArea: number | null;
    pricePerBedroom: number | null;
    pricePerBathroom: number | null;
    pricePerKitchen: number | null;
  };
  areaSize?: number;
  bedroomsCount?: number;
  bathroomsCount?: number;
  kitchensCount?: number;
  addons?: { price: number }[];
  frequency?: string;
  promoCode?: { discountType: string; discountValue: number } | null;
}

export function calculateOrderPrice(input: CalculateOrderPriceInput) {
  const {
    service,
    areaSize = 0,
    bedroomsCount = 0,
    bathroomsCount = 0,
    kitchensCount = 0,
    addons = [],
    frequency = "ONE_TIME",
    promoCode = null,
  } = input;

  // 1. Базовая Цена Услуги
  let baseServicePrice = service.basePrice;
  if (service.pricePerSqm && areaSize > 0) {
    const minArea = service.minArea ?? 0;
    const effectiveArea = Math.max(areaSize, minArea);
    baseServicePrice = effectiveArea * service.pricePerSqm;
  }

  // 2. Цена Комнат
  const roomsPrice =
    (bedroomsCount * (service.pricePerBedroom || 0)) +
    (bathroomsCount * (service.pricePerBathroom || 0)) +
    (kitchensCount * (service.pricePerKitchen || 0));

  // 3. Цена Допов
  const addonsPrice = addons.reduce((sum, addon) => sum + addon.price, 0);

  // 4. Промежуточный Итог (Subtotal)
  const subtotal = baseServicePrice + roomsPrice + addonsPrice;

  // 5. Скидка за Частоту
  const frequencyDiscountPercent = FREQUENCY_DISCOUNTS[frequency] || 0;
  const frequencyDiscountAmount = subtotal * (frequencyDiscountPercent / 100);

  // 6. Промежуточный Итог после Скидки Частоты
  const subtotalAfterFreq = subtotal - frequencyDiscountAmount;

  // 7. Скидка по Промокоду
  let promoDiscountAmount = 0;
  if (promoCode) {
    if (promoCode.discountType === "percent") {
      promoDiscountAmount = subtotalAfterFreq * (promoCode.discountValue / 100);
    } else if (promoCode.discountType === "fixed") {
      promoDiscountAmount = promoCode.discountValue;
    }
  }

  // Не позволяем скидке превысить сумму
  if (promoDiscountAmount > subtotalAfterFreq) {
    promoDiscountAmount = subtotalAfterFreq;
  }

  // 8. Итоговая Стоимость
  const totalPrice = subtotalAfterFreq - promoDiscountAmount;

  // 9. Общая Сумма Скидки
  const totalDiscount = frequencyDiscountAmount + promoDiscountAmount;

  return {
    baseServicePrice,
    roomsPrice,
    addonsPrice,
    subtotal,
    frequencyDiscountPercent,
    frequencyDiscountAmount,
    subtotalAfterFreq,
    promoDiscountAmount,
    totalDiscount,
    totalPrice: Math.max(0, totalPrice),
  };
}
