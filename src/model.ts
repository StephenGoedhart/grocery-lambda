export type Category = 'fresh' | 'pantry' | 'dairy' | 'freezer';
export interface Grocery {
  id: string;
  name: string;
  category: Category;
  unit: 'g' | 'ml' | 'piece' | null;
  stock: number | null;
  weeklyUsage: number | null;
  packSize: number | null;
  stockAsOf: string;
  reserveDays: number;
}
export interface Inventory {
  id: 'inventory';
  schemaVersion: 1;
  shoppingIntervalDays: number;
  items: Grocery[];
}
const DAY_MS = 86_400_000;
const round = (n: number) => Math.round(n * 1000) / 1000;
export function calculateGroceries(inventory: Inventory, now: Date) {
  if (!Number.isFinite(inventory.shoppingIntervalDays) || inventory.shoppingIntervalDays <= 0) {
    throw new Error('Invalid shopping interval');
  }
  const calculated = inventory.items.map(item => {
    const { stock, weeklyUsage, packSize } = item;
    if (stock === null || weeklyUsage === null || packSize === null || item.unit === null) {
      return { ...item, status: 'needs_configuration' as const };
    }
    const asOf = Date.parse(item.stockAsOf);
    if (!Number.isFinite(asOf) || !Number.isFinite(stock) || stock < 0 ||
        !Number.isFinite(weeklyUsage) || weeklyUsage < 0 ||
        !Number.isFinite(packSize) || packSize <= 0 ||
        !Number.isFinite(item.reserveDays) || item.reserveDays < 0) {
      throw new Error(`Invalid inventory data for ${item.id}`);
    }
    const elapsedDays = Math.max(0, (now.getTime() - asOf) / DAY_MS);
    const estimatedStock = Math.max(0, stock - weeklyUsage * elapsedDays / 7);
    const targetStock = weeklyUsage * (item.reserveDays + inventory.shoppingIntervalDays) / 7;
    const shortage = Math.max(0, targetStock - estimatedStock);
    // Avoid an extra pack caused solely by floating-point arithmetic.
    const packsToBuy = Math.max(0, Math.ceil(shortage / packSize - 1e-9));
    return {
      ...item, status: 'calculated' as const,
      estimatedStock: round(estimatedStock), targetStock: round(targetStock),
      packsToBuy, quantityToBuy: round(packsToBuy * packSize),
    };
  });
  return {
    generatedAt: now.toISOString(), shoppingIntervalDays: inventory.shoppingIntervalDays,
    groceries: calculated.filter(item => item.status === 'calculated').filter(item => item.packsToBuy > 0),
    needsConfiguration: calculated.filter(item => item.status === 'needs_configuration'),
  };
}
