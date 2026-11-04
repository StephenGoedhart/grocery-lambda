import { Category, Grocery, Inventory } from './model';
// Consumption starts at midnight in Europe/Amsterdam on the agreed date.
export const START_DATE = '2026-11-04T00:00:00+01:00';
function item(id: string, name: string, category: Category, stock: number,
              packSize: number, unit: Grocery['unit'] = 'g'): Grocery {
  return { id, name, category, stock, packSize, unit, weeklyUsage: stock / 2,
    stockAsOf: START_DATE, reserveDays: category === 'fresh' || category === 'dairy' ? 0 : 14 };
}
export function createSeed(): Inventory {
  return {
    id: 'inventory', schemaVersion: 1, shoppingIntervalDays: 7,
    items: [
      item('mandarins', 'Mandarijnen', 'fresh', 1500, 1500),
      item('onions', 'Uien', 'fresh', 2000, 2000),
      item('carrots', 'Wortels', 'fresh', 1000, 500),
      item('fresh-broccoli', 'Broccoli (vers)', 'fresh', 1000, 1000),
      item('bananas', 'Bananen', 'fresh', 2000, 1000),
      item('apples', 'Appels', 'fresh', 1500, 1500),
      item('peppers', 'Paprika', 'fresh', 6, 1, 'piece'),
      item('potatoes', 'Aardappelen', 'fresh', 4000, 4000),
      item('sweet-potatoes', 'Zoete aardappelen', 'fresh', 700, 700),
      item('peas', 'Doperwten', 'pantry', 1000, 200),
      { id: 'black-olives', name: 'Black olives', category: 'pantry', stock: null,
        weeklyUsage: null, packSize: null, unit: null, stockAsOf: START_DATE, reserveDays: 14 },
      item('brinta', 'Brinta graanontbijt', 'pantry', 1000, 500),
      item('oats', 'Havermout', 'pantry', 500, 500),
      item('rice', 'Surinaamse rijst', 'pantry', 4500, 4500),
      item('cottage-cheese', 'Cottage cheese', 'dairy', 1000, 200),
      item('milk', 'Arla lactosevrije melk', 'dairy', 2000, 1000, 'ml'),
      item('blueberries', 'Blauwe bessen (diepvries)', 'freezer', 1500, 750),
      item('forest-fruits', 'Bosvruchten (diepvries)', 'freezer', 1500, 750),
      item('frozen-broccoli', 'Broccoli (diepvries)', 'freezer', 800, 800),
      item('spinach', 'Spinazie (diepvries)', 'freezer', 800, 800),
      item('green-beans', 'Sperziebonen (diepvries)', 'freezer', 800, 400),
      item('ginger', 'Gember (invriezen)', 'freezer', 1000, 1000),
      item('chicken', 'Kipfilet', 'freezer', 1600, 800),
      item('beef', 'Rundergehakt', 'freezer', 2000, 1000),
    ],
  };
}
