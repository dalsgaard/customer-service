import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME!;

const app = new Hono();

app.get('/customers', async (c) => {
  const result = await client.send(new ScanCommand({ TableName: TABLE_NAME }));
  return c.json({ customers: result.Items ?? [] });
});

app.get('/customers/:id', async (c) => {
  const result = await client.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { id: c.req.param('id') },
  }));
  if (!result.Item) return c.json({ error: 'Not found' }, 404);
  return c.json(result.Item);
});

app.post('/customers', async (c) => {
  const body = await c.req.json();
  const customer = { id: randomUUID(), ...body };
  await client.send(new PutCommand({ TableName: TABLE_NAME, Item: customer }));
  return c.json(customer, 201);
});

app.delete('/customers/:id', async (c) => {
  await client.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { id: c.req.param('id') },
  }));
  return c.body(null, 204);
});

export const handler = handle(app);
