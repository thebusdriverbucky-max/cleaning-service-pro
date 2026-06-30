// File: lib/prices.ts

import { FREQUENCY_DISCOUNTS } from "./constants";

export interface CalculateOrderPriceInput {
  service: {
    basePrice: number;
    pricePerSqm: number | null;
    minArea: number | null;
    maxArea: number | null;
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
  discounts?: {
    weekly: number;
    biweekly: number;
    monthly: number;
  };
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
    discounts = {
      weekly: FREQUENCY_DISCOUNTS['WEEKLY'] || 20,
      biweekly: FREQUENCY_DISCOUNTS['BIWEEKLY'] || 15,
      monthly: FREQUENCY_DISCOUNTS['MONTHLY'] || 10,
    }
  } = input;

  // 1. Базовая Цена Услуги
  let baseServicePrice = service.basePrice;
  if (service.pricePerSqm && areaSize > 0) {
    const minArea = service.minArea ?? 0;
    // Ограничиваем площадь сверху maxArea, если задано
    const maxArea = service.maxArea && service.maxArea > 0 ? service.maxArea : Infinity;
    const effectiveArea = Math.min(Math.max(areaSize, minArea), maxArea);
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
  let frequencyDiscountPercent = 0;
  if (frequency === "WEEKLY") frequencyDiscountPercent = discounts.weekly;
  if (frequency === "BIWEEKLY") frequencyDiscountPercent = discounts.biweekly;
  if (frequency === "MONTHLY") frequencyDiscountPercent = discounts.monthly;

  // Скидка за частоту не применяется к первому платежу, только к будущим
  const frequencyDiscountAmount = 0; // Для текущего платежа скидка за частоту 0

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

  // 8. Итоговая Стоимость (первая уборка)
  const totalPrice = subtotalAfterFreq - promoDiscountAmount;

  // 9. Общая Сумма Скидки
  const totalDiscount = frequencyDiscountAmount + promoDiscountAmount;

  // Расчет стоимости для будущих уборок (с учетом скидки за частоту, но без промокода, так как обычно он одноразовый)
  const futureDiscountAmount = subtotal * (frequencyDiscountPercent / 100);
  const futurePrice = subtotal - futureDiscountAmount;

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
    futurePrice: Math.max(0, futurePrice),
  };
}
