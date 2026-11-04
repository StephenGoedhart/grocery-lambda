import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateGroceries } from '../src/model';
import { createSeed, START_DATE } from '../src/seed';
const at = (days: number) => new Date(Date.parse(START_DATE) + days * 86400000);
test('initial pantry shortfall builds the agreed reserve; fresh stock is sufficient', () => {
  const result = calculateGroceries(createSeed(), at(0));
  const rice = result.groceries.find(x => x.id === 'rice')!;
  assert.equal(rice.estimatedStock, 4500);
  assert.equal(rice.targetStock, 6750);
  assert.equal(rice.packsToBuy, 1);
  assert.equal(result.groceries.some(x => x.category === 'fresh'), false);
  assert.equal(result.needsConfiguration[0].id, 'black-olives');
});
test('one week consumes half; fresh items at their target require no purchase', () => {
  const result = calculateGroceries(createSeed(), at(7));
  assert.equal(result.groceries.find(x => x.id === 'chicken')!.estimatedStock, 800);
  assert.equal(result.groceries.find(x => x.id === 'chicken')!.packsToBuy, 2);
  assert.equal(result.groceries.some(x => x.category === 'fresh' || x.category === 'dairy'), false);
});
test('depleted stock clamps at zero and whole packs cover target', () => {
  const result = calculateGroceries(createSeed(), at(30));
  const cottage = result.groceries.find(x => x.id === 'cottage-cheese')!;
  assert.equal(cottage.estimatedStock, 0);
  assert.equal(cottage.packsToBuy, 3);
  assert.equal(cottage.quantityToBuy, 600);
});
test('reads do not consume or modify stored stock; dates before start do not add stock', () => {
  const inventory = createSeed();
  const before = JSON.stringify(inventory);
  assert.deepEqual(calculateGroceries(inventory, at(0)), calculateGroceries(inventory, at(0)));
  assert.equal(JSON.stringify(inventory), before);
  assert.equal(calculateGroceries(inventory, at(-1)).groceries.find(x => x.id === 'rice')!.estimatedStock, 4500);
});
test('stock corrections use each item reference date', () => {
  const inventory = createSeed();
  const chicken = inventory.items.find(x => x.id === 'chicken')!;
  chicken.stock = 3200;
  chicken.stockAsOf = at(7).toISOString();
  assert.equal(calculateGroceries(inventory, at(14)).groceries.some(x => x.id === 'chicken'), false);
});
test('invalid inventory quantities fail rather than suggesting a misleading purchase', () => {
  const inventory = createSeed();
  inventory.items[0].packSize = 0;
  assert.throws(() => calculateGroceries(inventory, at(0)), /Invalid inventory/);
});
