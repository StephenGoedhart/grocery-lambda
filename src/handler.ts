import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { calculateGroceries } from './model';
import { loadInventory } from './store';
export const handler: APIGatewayProxyHandlerV2 = async () => {
  const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
  try {
    return { statusCode: 200, headers,
      body: JSON.stringify(calculateGroceries(await loadInventory(), new Date())) };
  } catch (error) {
    console.error('Failed to calculate groceries', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Unable to calculate groceries' }) };
  }
};
