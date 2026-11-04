import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { Inventory } from './model';
import { createSeed } from './seed';
const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
export async function loadInventory(): Promise<Inventory> {
  const TableName = process.env.TABLE_NAME;
  if (!TableName) throw new Error('TABLE_NAME is required');
  const read = async () => (await client.send(new GetCommand({
    TableName, Key: { id: 'inventory' }, ConsistentRead: true,
  }))).Item as Inventory | undefined;
  const existing = await read();
  if (existing) return existing;
  const seed = createSeed();
  try {
    await client.send(new PutCommand({
      TableName, Item: seed, ConditionExpression: 'attribute_not_exists(id)',
    }));
    return seed;
  } catch (error) {
    if (!(error instanceof Error) || error.name !== 'ConditionalCheckFailedException') throw error;
    // Another first request seeded the document; preserve its contents.
    const winner = await read();
    if (!winner) throw new Error('Inventory missing after concurrent initialization');
    return winner;
  }
}
